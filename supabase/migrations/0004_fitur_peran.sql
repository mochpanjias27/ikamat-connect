-- =====================================================================
-- IKAMAT Connect · Migrasi 0004: fitur per peran
--   • Lowongan (alumni & dosen memposting; semua akun melihat)
--   • Kebutuhan riset (dosen memposting; alumni & mahasiswa merespons)
--   • Minat/lamaran pada lowongan & riset
--   • Jejaring: direktori civitas terverifikasi + permintaan kontak termediasi
-- Jalankan di Supabase → SQL Editor (aman dijalankan ulang).
-- =====================================================================

-- ---------- Helper ----------
create or replace function public.is_verified()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.verification_status = 'verified' or p.is_admin
                   from public.profiles p where p.id = auth.uid()), false);
$$;

create or replace function public.my_status()
returns text language sql stable security definer set search_path = '' as $$
  select p.status from public.profiles p where p.id = auth.uid();
$$;

create or replace function public.consent_of(uid uuid, purp text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select c.granted from public.consents c
                   where c.user_id = uid and c.purpose = purp
                   order by c.created_at desc, c.id desc limit 1), false);
$$;

-- ---------- Lowongan ----------
create table if not exists public.jobs (
  id            uuid primary key default gen_random_uuid(),
  poster_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title         text not null check (char_length(title) between 3 and 140),
  company       text not null check (char_length(company) between 2 and 140),
  category      text not null check (category in ('kerja', 'magang', 'freelance')),
  location      text check (char_length(location) <= 120),
  work_mode     text not null default 'onsite' check (work_mode in ('onsite', 'hybrid', 'remote')),
  description   text not null check (char_length(description) between 20 and 6000),
  requirements  text check (char_length(requirements) <= 4000),
  skills        text[] not null default '{}',
  apply_url     text check (char_length(apply_url) <= 500),
  apply_email   text check (char_length(apply_email) <= 200),
  deadline      date,
  status        text not null default 'aktif' check (status in ('aktif', 'ditutup')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists jobs_status_idx on public.jobs (status, created_at desc);

-- ---------- Kebutuhan riset ----------
create table if not exists public.research_posts (
  id            uuid primary key default gen_random_uuid(),
  poster_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title         text not null check (char_length(title) between 5 and 160),
  field         text check (char_length(field) <= 120),
  scheme        text not null check (scheme in ('mitra_riset', 'hibah', 'asisten_riset', 'magang_riset', 'lainnya')),
  seeking       text not null default 'semua' check (seeking in ('alumni', 'mahasiswa', 'semua')),
  description   text not null check (char_length(description) between 20 and 6000),
  partner_needs text check (char_length(partner_needs) <= 3000),
  skills        text[] not null default '{}',
  deadline      date,
  status        text not null default 'aktif' check (status in ('aktif', 'ditutup')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists research_status_idx on public.research_posts (status, created_at desc);

-- ---------- Minat / lamaran ----------
create table if not exists public.interests (
  id          bigint generated always as identity primary key,
  post_type   text not null check (post_type in ('job', 'research')),
  post_id     uuid not null,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  message     text check (char_length(message) <= 1500),
  created_at  timestamptz not null default now(),
  unique (post_type, post_id, user_id)
);
create index if not exists interests_post_idx on public.interests (post_type, post_id);

-- ---------- Permintaan kontak (jejaring) ----------
create table if not exists public.contact_requests (
  id            uuid primary key default gen_random_uuid(),
  from_id       uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  to_id         uuid not null references public.profiles (id) on delete cascade,
  purpose       text not null check (purpose in ('riset', 'karier', 'mentoring', 'lainnya')),
  message       text not null check (char_length(message) between 10 and 1500),
  status        text not null default 'menunggu' check (status in ('menunggu', 'diterima', 'ditolak')),
  created_at    timestamptz not null default now(),
  responded_at  timestamptz,
  check (from_id <> to_id)
);
create index if not exists contact_to_idx on public.contact_requests (to_id, status);
create index if not exists contact_from_idx on public.contact_requests (from_id);

-- ---------- updated_at otomatis ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists jobs_touch on public.jobs;
create trigger jobs_touch before update on public.jobs for each row execute function public.touch_updated_at();
drop trigger if exists research_touch on public.research_posts;
create trigger research_touch before update on public.research_posts for each row execute function public.touch_updated_at();

-- ---------- RLS ----------
alter table public.jobs             enable row level security;
alter table public.research_posts   enable row level security;
alter table public.interests        enable row level security;
alter table public.contact_requests enable row level security;

-- Lowongan
drop policy if exists "jobs: baca" on public.jobs;
create policy "jobs: baca" on public.jobs for select to authenticated
  using (status = 'aktif' or poster_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "jobs: posting alumni/dosen terverifikasi" on public.jobs;
create policy "jobs: posting alumni/dosen terverifikasi" on public.jobs for insert to authenticated
  with check (poster_id = (select auth.uid()) and (select public.is_verified())
              and ((select public.my_status()) in ('alumni', 'dosen') or (select public.is_admin())));
drop policy if exists "jobs: ubah milik sendiri" on public.jobs;
create policy "jobs: ubah milik sendiri" on public.jobs for update to authenticated
  using (poster_id = (select auth.uid()) or (select public.is_admin()))
  with check (poster_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "jobs: hapus milik sendiri" on public.jobs;
create policy "jobs: hapus milik sendiri" on public.jobs for delete to authenticated
  using (poster_id = (select auth.uid()) or (select public.is_admin()));

-- Riset
drop policy if exists "riset: baca" on public.research_posts;
create policy "riset: baca" on public.research_posts for select to authenticated
  using (status = 'aktif' or poster_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "riset: posting dosen terverifikasi" on public.research_posts;
create policy "riset: posting dosen terverifikasi" on public.research_posts for insert to authenticated
  with check (poster_id = (select auth.uid()) and (select public.is_verified())
              and ((select public.my_status()) = 'dosen' or (select public.is_admin())));
drop policy if exists "riset: ubah milik sendiri" on public.research_posts;
create policy "riset: ubah milik sendiri" on public.research_posts for update to authenticated
  using (poster_id = (select auth.uid()) or (select public.is_admin()))
  with check (poster_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "riset: hapus milik sendiri" on public.research_posts;
create policy "riset: hapus milik sendiri" on public.research_posts for delete to authenticated
  using (poster_id = (select auth.uid()) or (select public.is_admin()));

-- Minat
drop policy if exists "minat: baca" on public.interests;
create policy "minat: baca" on public.interests for select to authenticated
  using (
    user_id = (select auth.uid()) or (select public.is_admin())
    or (post_type = 'job' and exists (select 1 from public.jobs j where j.id = post_id and j.poster_id = (select auth.uid())))
    or (post_type = 'research' and exists (select 1 from public.research_posts r where r.id = post_id and r.poster_id = (select auth.uid())))
  );
drop policy if exists "minat: kirim" on public.interests;
create policy "minat: kirim" on public.interests for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.is_verified()));
drop policy if exists "minat: batalkan" on public.interests;
create policy "minat: batalkan" on public.interests for delete to authenticated
  using (user_id = (select auth.uid()));

-- Permintaan kontak (respon lewat fungsi respond_contact)
drop policy if exists "kontak: baca milik sendiri" on public.contact_requests;
create policy "kontak: baca milik sendiri" on public.contact_requests for select to authenticated
  using (from_id = (select auth.uid()) or to_id = (select auth.uid()));
drop policy if exists "kontak: kirim" on public.contact_requests;
create policy "kontak: kirim" on public.contact_requests for insert to authenticated
  with check (from_id = (select auth.uid()) and status = 'menunggu' and (select public.is_verified()));

-- ---------- Fungsi: direktori civitas (kolom aman saja) ----------
create or replace function public.directory_list()
returns table (
  id uuid, full_name text, status text, angkatan int, tahun_lulus int, headline text, city text,
  current_company text, current_title text, skills text[], bio text, linkedin_url text, open_to_work boolean
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.status, p.angkatan, p.tahun_lulus, p.headline, p.city,
         p.current_company, p.current_title, p.skills, p.bio, p.linkedin_url, p.open_to_work
  from public.profiles p
  where public.is_verified()
    and p.verification_status = 'verified'
    and public.consent_of(p.id, 'directory')
  order by p.full_name;
$$;

-- ---------- Fungsi: nama pemosting (untuk kartu lowongan/riset) ----------
create or replace function public.poster_names(ids uuid[])
returns table (id uuid, full_name text, status text, angkatan int, current_company text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.status, p.angkatan, p.current_company
  from public.profiles p where p.id = any(ids) and auth.uid() is not null;
$$;

-- ---------- Fungsi: daftar peminat (khusus pemosting / admin) ----------
create or replace function public.post_responses(p_type text, p_id uuid)
returns table (
  user_id uuid, full_name text, email text, status text, angkatan int, tahun_lulus int,
  headline text, current_company text, linkedin_url text, skills text[], message text, created_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (public.is_admin()
          or (p_type = 'job' and exists (select 1 from public.jobs j where j.id = p_id and j.poster_id = auth.uid()))
          or (p_type = 'research' and exists (select 1 from public.research_posts r where r.id = p_id and r.poster_id = auth.uid()))) then
    raise exception 'Hanya pemosting yang dapat melihat peminat';
  end if;
  return query
    select i.user_id, p.full_name, p.email, p.status, p.angkatan, p.tahun_lulus,
           p.headline, p.current_company, p.linkedin_url, p.skills, i.message, i.created_at
    from public.interests i join public.profiles p on p.id = i.user_id
    where i.post_type = p_type and i.post_id = p_id
    order by i.created_at desc;
end; $$;

-- ---------- Fungsi: daftar permintaan kontak (email terbuka bila diterima) ----------
create or replace function public.contact_list()
returns table (
  id uuid, direction text, other_id uuid, other_name text, other_status text, other_headline text,
  other_email text, purpose text, message text, status text, created_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select c.id,
         case when c.to_id = auth.uid() then 'masuk' else 'keluar' end,
         o.id, o.full_name, o.status, o.headline,
         case when c.status = 'diterima' then o.email end,
         c.purpose, c.message, c.status, c.created_at
  from public.contact_requests c
  join public.profiles o on o.id = case when c.to_id = auth.uid() then c.from_id else c.to_id end
  where auth.uid() in (c.from_id, c.to_id)
  order by c.created_at desc;
$$;

create or replace function public.respond_contact(req uuid, accept boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.contact_requests
     set status = case when accept then 'diterima' else 'ditolak' end, responded_at = now()
   where id = req and to_id = auth.uid() and status = 'menunggu';
  if not found then raise exception 'Permintaan tidak ditemukan atau sudah dijawab'; end if;
end; $$;

-- ---------- Hak akses ----------
revoke all on public.jobs, public.research_posts, public.interests, public.contact_requests from anon;
grant select, insert, update, delete on public.jobs, public.research_posts to authenticated;
grant select, insert, delete on public.interests to authenticated;
grant select, insert on public.contact_requests to authenticated;

revoke execute on function public.directory_list(), public.poster_names(uuid[]), public.post_responses(text, uuid),
  public.contact_list(), public.respond_contact(uuid, boolean), public.is_verified(), public.my_status(),
  public.consent_of(uuid, text) from public, anon;
grant execute on function public.directory_list(), public.poster_names(uuid[]), public.post_responses(text, uuid),
  public.contact_list(), public.respond_contact(uuid, boolean), public.is_verified(), public.my_status()
  to authenticated;
revoke execute on function public.consent_of(uuid, text) from authenticated;
