-- =====================================================================
-- IKAMAT Connect · Migrasi 0001: akun, profil, persetujuan, verifikasi
-- Jalankan sekali di Supabase → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).
-- =====================================================================

-- ---------- Tabel profil (1 baris per akun auth) ----------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text not null,
  full_name           text not null default '',
  status              text not null default 'mahasiswa'
                        check (status in ('mahasiswa', 'alumni', 'dosen')),
  npm                 text,
  nidn                text,
  angkatan            int  check (angkatan between 1957 and 2100),
  tahun_lulus         int  check (tahun_lulus between 1960 and 2100),
  phone               text,
  city                text,
  headline            text,
  current_company     text,
  current_title       text,
  skills              text[] not null default '{}',
  bio                 text,
  linkedin_url        text,
  open_to_work        boolean not null default false,
  verification_status text not null default 'pending'
                        check (verification_status in ('pending', 'verified', 'rejected')),
  verification_note   text,
  verified_at         timestamptz,
  verified_by         uuid references auth.users (id) on delete set null,
  is_admin            boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists profiles_verification_idx on public.profiles (verification_status);

-- ---------- Riwayat persetujuan per tujuan (UU PDP) ----------
create table if not exists public.consents (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  purpose     text not null check (purpose in ('terms', 'directory', 'job_email', 'hrd_catalog')),
  granted     boolean not null,
  version     text not null default '2026-11',
  created_at  timestamptz not null default now()
);

create index if not exists consents_user_idx on public.consents (user_id, purpose, created_at desc);

-- ---------- Log audit verifikasi ----------
create table if not exists public.verification_log (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  admin_id    uuid references auth.users (id) on delete set null,
  action      text not null check (action in ('verified', 'rejected', 'reset')),
  note        text,
  created_at  timestamptz not null default now()
);

-- ---------- Helper: apakah pengguna saat ini admin ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- ---------- Buat profil otomatis saat akun dibuat ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  st text := coalesce(m->>'status', 'mahasiswa');
begin
  if st not in ('mahasiswa', 'alumni', 'dosen') then st := 'mahasiswa'; end if;

  -- Dosen wajib memakai email resmi Unpad.
  if st = 'dosen' and lower(new.email) !~ '@unpad\.ac\.id$' then
    raise exception 'Pendaftaran dosen wajib memakai email @unpad.ac.id';
  end if;

  insert into public.profiles (id, email, full_name, status, npm, nidn, angkatan, tahun_lulus)
  values (
    new.id,
    new.email,
    left(coalesce(m->>'full_name', ''), 120),
    st,
    nullif(left(m->>'npm', 20), ''),
    nullif(left(m->>'nidn', 20), ''),
    case when (m->>'angkatan') ~ '^\d{4}$' then (m->>'angkatan')::int end,
    case when (m->>'tahun_lulus') ~ '^\d{4}$' then (m->>'tahun_lulus')::int end
  )
  on conflict (id) do nothing;

  insert into public.consents (user_id, purpose, granted)
  select new.id, p.purpose, coalesce((m->'consents'->>p.purpose)::boolean, false)
  from (values ('terms'), ('directory'), ('job_email'), ('hrd_catalog')) as p(purpose);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Lindungi kolom sensitif dari pengguna biasa ----------
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();

  -- auth.uid() null = dijalankan dari SQL Editor / service role: diizinkan.
  if auth.uid() is not null and not public.is_admin() then
    if new.status = 'dosen' and old.status <> 'dosen' and lower(new.email) !~ '@unpad\.ac\.id$' then
      raise exception 'Status dosen memerlukan email @unpad.ac.id';
    end if;

    if new.is_admin            is distinct from old.is_admin
    or new.verification_status is distinct from old.verification_status
    or new.verification_note   is distinct from old.verification_note
    or new.verified_at         is distinct from old.verified_at
    or new.verified_by         is distinct from old.verified_by
    or new.email               is distinct from old.email
    or new.id                  is distinct from old.id then
      raise exception 'Kolom verifikasi hanya dapat diubah oleh admin';
    end if;

    -- Mengubah data identitas mengembalikan status ke "pending" agar dicek ulang.
    if old.verification_status = 'verified' and (
         new.npm is distinct from old.npm
      or new.status is distinct from old.status
      or new.angkatan is distinct from old.angkatan
      or new.tahun_lulus is distinct from old.tahun_lulus
      or new.full_name is distinct from old.full_name) then
      new.verification_status := 'pending';
      new.verified_at := null;
      new.verified_by := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------- Row Level Security ----------
alter table public.profiles         enable row level security;
alter table public.consents         enable row level security;
alter table public.verification_log enable row level security;

drop policy if exists "profil: baca milik sendiri atau admin" on public.profiles;
create policy "profil: baca milik sendiri atau admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "profil: ubah milik sendiri atau admin" on public.profiles;
create policy "profil: ubah milik sendiri atau admin" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "persetujuan: baca milik sendiri atau admin" on public.consents;
create policy "persetujuan: baca milik sendiri atau admin" on public.consents
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "persetujuan: catat milik sendiri" on public.consents;
create policy "persetujuan: catat milik sendiri" on public.consents
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "log: admin baca" on public.verification_log;
create policy "log: admin baca" on public.verification_log
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "log: admin catat" on public.verification_log;
create policy "log: admin catat" on public.verification_log
  for insert to authenticated
  with check ((select public.is_admin()) and admin_id = (select auth.uid()));

-- ---------- Hak akses eksplisit (tamu/anon tidak bisa apa-apa) ----------
revoke all on public.profiles, public.consents, public.verification_log from anon;
grant select, update on public.profiles to authenticated;
grant select, insert on public.consents to authenticated;
grant select, insert on public.verification_log to authenticated;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_update() from public, anon, authenticated;

-- =====================================================================
-- SETELAH Anda mendaftar di situs, jadikan akun Anda admin
-- (ganti email lalu jalankan baris di bawah ini saja):
--
-- update public.profiles
--   set is_admin = true, verification_status = 'verified', verified_at = now()
--   where email = 'email-anda@unpad.ac.id';
-- =====================================================================
