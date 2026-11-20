"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  status: "mahasiswa" | "alumni" | "dosen";
  npm: string | null;
  nidn: string | null;
  angkatan: number | null;
  tahun_lulus: number | null;
  phone: string | null;
  city: string | null;
  headline: string | null;
  current_company: string | null;
  current_title: string | null;
  skills: string[];
  bio: string | null;
  linkedin_url: string | null;
  open_to_work: boolean;
  verification_status: "pending" | "verified" | "rejected";
  verification_note: string | null;
  verified_at: string | null;
  is_admin: boolean;
  created_at: string;
};

export type ConsentPurpose = "terms" | "directory" | "job_email" | "hrd_catalog";

export const CONSENT_LABEL: Record<ConsentPurpose, { title: string; desc: string }> = {
  terms: { title: "Syarat dan Kebijakan Privasi", desc: "Wajib untuk membuat akun." },
  directory: { title: "Tampil di direktori civitas", desc: "Nama, angkatan, dan bidang terlihat oleh civitas terverifikasi." },
  job_email: { title: "Email lowongan dan magang", desc: "Menerima info lowongan yang sesuai status dan minat." },
  hrd_catalog: { title: "Katalog talenta untuk HRD", desc: "Profil tersamar dapat dilihat HRD terverifikasi. Kontak tetap disembunyikan sampai Anda menyetujui." },
};

export function authErrorText(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email atau kata sandi salah.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi. Cek kotak masuk (dan folder spam) untuk tautan konfirmasi.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Email ini sudah terdaftar. Silakan masuk atau atur ulang kata sandi.";
  if (m.includes("rate limit") || m.includes("too many")) return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  if (m.includes("password should be")) return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan huruf dan angka.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  return msg;
}
