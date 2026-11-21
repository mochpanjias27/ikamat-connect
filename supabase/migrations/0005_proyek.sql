-- =====================================================================
-- IKAMAT Connect · Migrasi 0005: peluang Proyek + profil penyedia jasa
--   • Alumni & dosen memposting kebutuhan proyek (sistem, transportasi,
--     kontraktor, training, dll.); civitas terverifikasi mengajukan penawaran
--   • Kolom "layanan yang ditawarkan" di profil, tampil & dapat dicari di Jejaring
-- Jalankan di Supabase → SQL Editor SETELAH 0004 (aman dijalankan ulang).
-- =====================================================================

-- ---------- Profil: layanan / usaha yang ditawarkan ----------
alter table public.profiles add column if not exists services text check (char_length(services) <= 1000);

-- ---------- Tabel proyek ----------
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  poster_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title          text not null check (char_length(title) between 5 and 160),
  organization   text not null check (char_length(organization) between 2 and 160),
  category       text not null check (category in (
                   'teknologi', 'data_analitik', 'konsultansi', 'pelatihan', 'transportasi',
                   'konstruksi', 'pengadaan', 'kreatif', 'riset_survei', 'lainnya')),
  description    text not null check (char_length(description) between 20 and 6000),
  scope          text check (char_length(scope) <= 4000),
  provider_reqs  text check (char_length(provider_reqs) <= 3000),
  budget         text check (char_length(budget) <= 120),
  duration       text check (char_length(duration) <= 120),
  location       text check (char_length(location) <= 120),
  work_mode      text not null default 'remote' check (work_mode in ('onsite', 'hybrid', 'remote')),
  deadline       date,
  status         text not null default 'aktif' check (status in ('aktif', 'ditutup')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists projects_status_idx on public.projects (status, created_at desc);

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

alter table public.projects enable row level security;

drop policy if exists "proyek: baca" on public.projects;
create policy "proyek: baca" on public.projects for select to authenticated
  using (status = 'aktif' or poster_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "proyek: posting alumni/dosen terverifikasi" on public.projects;
create policy "proyek: posting alumni/dosen terverifikasi" on public.projects for insert to authenticated
  with check (poster_id = (select auth.uid()) and (select public.is_verified())
              and ((select public.my_status()) in ('alumni', 'dosen') or (select public.is_admin())));
drop policy if exists "proyek: ubah milik sendiri" on public.projects;
create policy "proyek: ubah milik sendiri" on public.projects for update to authenticated
  using (poster_id = (select auth.uid()) or (select public.is_admin()))
  with check (poster_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "proyek: hapus milik sendiri" on public.projects;
create policy "proyek: hapus milik sendiri" on public.projects for delete to authenticated
  using (poster_id = (select auth.uid()) or (select public.is_admin()));

revoke all on public.projects from anon;
grant select, insert, update, delete on public.projects to authenticated;

-- ---------- Penawaran memakai tabel interests (post_type = 'project') ----------
alter table public.interests drop constraint if exists interests_post_type_check;
alter table public.interests add constraint interests_post_type_check check (post_type in ('job', 'research', 'project'));

drop policy if exists "minat: baca" on public.interests;
create policy "minat: baca" on public.interests for select to authenticated
  using (
    user_id = (select auth.uid()) or (select public.is_admin())
    or (post_type = 'job' and exists (select 1 from public.jobs j where j.id = post_id and j.poster_id = (select auth.uid())))
    or (post_type = 'research' and exists (select 1 from public.research_posts r where r.id = post_id and r.poster_id = (select auth.uid())))
    or (post_type = 'project' and exists (select 1 from public.projects x where x.id = post_id and x.poster_id = (select auth.uid())))
  );

-- ---------- post_responses: tambah proyek + layanan pengaju ----------
drop function if exists public.post_responses(text, uuid);
create function public.post_responses(p_type text, p_id uuid)
returns table (
  user_id uuid, full_name text, email text, status text, angkatan int, tahun_lulus int,
  headline text, current_company text, linkedin_url text, skills text[], services text,
  message text, created_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (public.is_admin()
          or (p_type = 'job' and exists (select 1 from public.jobs j where j.id = p_id and j.poster_id = auth.uid()))
          or (p_type = 'research' and exists (select 1 from public.research_posts r where r.id = p_id and r.poster_id = auth.uid()))
          or (p_type = 'project' and exists (select 1 from public.projects x where x.id = p_id and x.poster_id = auth.uid()))) then
    raise exception 'Hanya pemosting yang dapat melihat peminat';
  end if;
  return query
    select i.user_id, p.full_name, p.email, p.status, p.angkatan, p.tahun_lulus,
           p.headline, p.current_company, p.linkedin_url, p.skills, p.services, i.message, i.created_at
    from public.interests i join public.profiles p on p.id = i.user_id
    where i.post_type = p_type and i.post_id = p_id
    order by i.created_at desc;
end; $$;

-- ---------- directory_list: tambah kolom layanan ----------
drop function if exists public.directory_list();
create function public.directory_list()
returns table (
  id uuid, full_name text, status text, angkatan int, tahun_lulus int, headline text, city text,
  current_company text, current_title text, skills text[], bio text, linkedin_url text, open_to_work boolean,
  services text
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.status, p.angkatan, p.tahun_lulus, p.headline, p.city,
         p.current_company, p.current_title, p.skills, p.bio, p.linkedin_url, p.open_to_work, p.services
  from public.profiles p
  where public.is_verified()
    and p.verification_status = 'verified'
    and public.consent_of(p.id, 'directory')
  order by p.full_name;
$$;

revoke execute on function public.post_responses(text, uuid), public.directory_list() from public, anon;
grant execute on function public.post_responses(text, uuid), public.directory_list() to authenticated;
