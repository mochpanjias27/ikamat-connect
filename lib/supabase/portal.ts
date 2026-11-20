"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Profile, supabaseBrowser } from "./client";

export type Job = {
  id: string;
  poster_id: string;
  title: string;
  company: string;
  category: "kerja" | "magang" | "freelance";
  location: string | null;
  work_mode: "onsite" | "hybrid" | "remote";
  description: string;
  requirements: string | null;
  skills: string[];
  apply_url: string | null;
  apply_email: string | null;
  deadline: string | null;
  status: "aktif" | "ditutup";
  created_at: string;
};

export type ResearchPost = {
  id: string;
  poster_id: string;
  title: string;
  field: string | null;
  scheme: "mitra_riset" | "hibah" | "asisten_riset" | "magang_riset" | "lainnya";
  seeking: "alumni" | "mahasiswa" | "semua";
  description: string;
  partner_needs: string | null;
  skills: string[];
  deadline: string | null;
  status: "aktif" | "ditutup";
  created_at: string;
};

export type Poster = { id: string; full_name: string; status: string; angkatan: number | null; current_company: string | null };

export type Responder = {
  user_id: string;
  full_name: string;
  email: string;
  status: string;
  angkatan: number | null;
  tahun_lulus: number | null;
  headline: string | null;
  current_company: string | null;
  linkedin_url: string | null;
  skills: string[];
  message: string | null;
  created_at: string;
};

export type DirEntry = {
  id: string;
  full_name: string;
  status: "mahasiswa" | "alumni" | "dosen";
  angkatan: number | null;
  tahun_lulus: number | null;
  headline: string | null;
  city: string | null;
  current_company: string | null;
  current_title: string | null;
  skills: string[];
  bio: string | null;
  linkedin_url: string | null;
  open_to_work: boolean;
};

export type ContactItem = {
  id: string;
  direction: "masuk" | "keluar";
  other_id: string;
  other_name: string;
  other_status: string;
  other_headline: string | null;
  other_email: string | null;
  purpose: "riset" | "karier" | "mentoring" | "lainnya";
  message: string;
  status: "menunggu" | "diterima" | "ditolak";
  created_at: string;
};

export const JOB_CAT: Record<Job["category"], string> = { kerja: "Kerja", magang: "Magang", freelance: "Freelance / Proyek" };
export const WORK_MODE: Record<Job["work_mode"], string> = { onsite: "Di kantor", hybrid: "Hybrid", remote: "Remote" };
export const SCHEME: Record<ResearchPost["scheme"], string> = {
  mitra_riset: "Mitra riset",
  hibah: "Hibah bersama",
  asisten_riset: "Asisten riset",
  magang_riset: "Magang riset",
  lainnya: "Lainnya",
};
export const SEEKING: Record<ResearchPost["seeking"], string> = { alumni: "Alumni", mahasiswa: "Mahasiswa", semua: "Alumni & mahasiswa" };
export const PURPOSE: Record<ContactItem["purpose"], string> = { riset: "Kolaborasi riset", karier: "Karier / rekrutmen", mentoring: "Mentoring", lainnya: "Lainnya" };

export function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d.length === 10 ? d + "T00:00:00" : d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function todayLocal() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export function splitSkills(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 20);
}

/** Memuat pengguna yang sedang login beserta profilnya; mengarahkan ke halaman masuk bila belum login. */
export function useMe() {
  const router = useRouter();
  const [me, setMe] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sb = supabaseBrowser();
    (async () => {
      const { data: u } = await sb.auth.getUser();
      if (!u.user) {
        router.replace("/akun/masuk");
        return;
      }
      const { data } = await sb.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      setMe((data as Profile) ?? null);
      setLoading(false);
    })();
  }, [router]);
  const verified = !!me && (me.verification_status === "verified" || me.is_admin);
  return { me, loading, verified };
}

export async function loadPosters(ids: string[]): Promise<Record<string, Poster>> {
  const uniq = Array.from(new Set(ids));
  if (!uniq.length) return {};
  const { data } = await supabaseBrowser().rpc("poster_names", { ids: uniq });
  const map: Record<string, Poster> = {};
  for (const p of (data || []) as Poster[]) map[p.id] = p;
  return map;
}

export function posterLine(p?: Poster) {
  if (!p) return "Civitas Matematika Unpad";
  const role = p.status === "dosen" ? "Dosen" : p.status === "alumni" ? `Alumni${p.angkatan ? " " + p.angkatan : ""}` : "Mahasiswa";
  return `${p.full_name} · ${role}${p.current_company ? " · " + p.current_company : ""}`;
}
