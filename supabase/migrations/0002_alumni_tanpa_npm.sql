-- IKAMAT Connect · Migrasi 0002
-- Alumni mendaftar tanpa NPM; verifikasi memakai nama + tahun masuk + tahun lulus.
-- Karena itu, mengubah tahun masuk/lulus juga mengembalikan status ke "pending".
-- Jalankan di Supabase → SQL Editor (aman dijalankan ulang).

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
      or new.nidn is distinct from old.nidn
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
