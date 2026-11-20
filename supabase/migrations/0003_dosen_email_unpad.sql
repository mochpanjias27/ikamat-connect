-- IKAMAT Connect · Migrasi 0003
-- Dosen mendaftar cukup dengan nama + email @unpad.ac.id (tanpa NIDN/NUPTK).
-- Aturan email dipaksa di database agar tidak bisa dilewati lewat API.
-- Jalankan di Supabase → SQL Editor (aman dijalankan ulang).

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
