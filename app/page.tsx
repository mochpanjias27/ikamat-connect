"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Briefcase, FlaskConical, GraduationCap, Handshake, Lock, LogIn, ShieldCheck, UserSearch, Users } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { HeroEcosystem } from "@/components/HeroEcosystem";
import { supabaseBrowser } from "@/lib/supabase/client";

const AUDIENCES: { status: "mahasiswa" | "alumni" | "dosen"; icon: React.ReactNode; title: string; points: string[] }[] = [
  {
    status: "mahasiswa",
    icon: <GraduationCap size={22} />,
    title: "Mahasiswa",
    points: ["Lowongan magang langsung dari alumni", "Ajukan diri menjadi asisten atau mitra riset dosen", "Temukan alumni untuk mentoring karier"],
  },
  {
    status: "alumni",
    icon: <Briefcase size={22} />,
    title: "Alumni IKAMAT",
    points: ["Posting lowongan dan lihat siapa yang berminat", "Posting kebutuhan project atau tawarkan jasa Anda", "Jadi mitra riset dosen dan mentor adik tingkat"],
  },
  {
    status: "dosen",
    icon: <FlaskConical size={22} />,
    title: "Dosen",
    points: ["Posting kebutuhan riset, hibah, dan asisten riset", "Cari mitra alumni berdasarkan keahlian dan instansi", "Bagikan lowongan dan project untuk mahasiswa"],
  },
];

const FEATURES: { icon: React.ReactNode; title: string; desc: string }[] = [
  { icon: <Briefcase size={20} />, title: "Lowongan & magang", desc: "Alumni dan dosen memposting lowongan kerja, magang, dan freelance. Peminat menyatakan minat, pemosting langsung melihat profilnya." },
  { icon: <FlaskConical size={20} />, title: "Kemitraan riset", desc: "Dosen memposting topik riset, rencana hibah, atau kebutuhan asisten. Alumni dan mahasiswa yang sesuai dapat mengajukan diri." },
  { icon: <Handshake size={20} />, title: "Project", desc: "Kebutuhan sistem, transportasi, kontraktor, pelatihan, dan jasa lain diposting di sini. Civitas penyedia jasa mengajukan penawaran." },
  { icon: <UserSearch size={20} />, title: "Jejaring civitas", desc: "Direktori civitas terverifikasi. Cari berdasarkan keahlian, instansi, layanan, atau angkatan, lalu ajak terhubung." },
];

export default function Home() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabaseBrowser()
      .auth.getSession()
      .then(({ data }) => setAuthed(!!data.session));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero-grid relative overflow-hidden text-white">
        <div className="dots absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/30">
              Ikatan Keluarga Alumni Matematika FMIPA Unpad
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              Satu jejaring untuk seluruh <span className="relative whitespace-nowrap text-sun-300">civitas Matematika</span> Unpad.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-sky-50/90">
              Mempertemukan mahasiswa, dosen, dan alumni dalam satu jejaring terverifikasi: lowongan dan magang dari alumni, kemitraan riset bersama dosen, peluang project, dan direktori civitas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {authed ? (
                <Button variant="sun" size="lg" href="/akun">
                  Buka dashboard <ArrowRight size={18} />
                </Button>
              ) : (
                <>
                  <Button variant="sun" size="lg" href="/daftar">
                    Daftar sekarang <ArrowRight size={18} />
                  </Button>
                  <Button href="/akun/masuk" size="lg" className="bg-white/10 text-white ring-1 ring-inset ring-white/40 hover:bg-white/20">
                    <LogIn size={18} /> Masuk
                  </Button>
                </>
              )}
            </div>
          </div>
          <HeroEcosystem />
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Untuk siapa</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">Tiga peran, satu ekosistem</h2>
          <p className="mt-2 text-ink-500">Untuk mahasiswa, alumni, dan dosen Matematika FMIPA Unpad. Setiap akun diverifikasi oleh admin IKAMAT.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <Card key={a.status} className="flex flex-col p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white">{a.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{a.title}</h3>
              <ul className="mt-3 flex-1 space-y-2 text-sm text-ink-600">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" /> {p}
                  </li>
                ))}
              </ul>
              {!authed && (
                <Button variant="secondary" className="mt-5" href={`/daftar?status=${a.status}`}>
                  Daftar sebagai {a.title.split(" ")[0]} <ArrowRight size={16} />
                </Button>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[.8fr_1.2fr]">
            <div className="bg-sky-950 p-8 text-white md:p-10">
              <p className="text-sm font-bold uppercase tracking-wide text-sun-300">Fitur</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Empat cara civitas saling terhubung</h2>
              <p className="mt-3 text-sky-100/80">
                Semua kesempatan diposting langsung oleh civitas Matematika Unpad dan hanya dapat dilihat oleh akun yang terdaftar.
              </p>
              <Button variant="sun" className="mt-6" href={authed ? "/akun" : "/daftar"}>
                {authed ? "Buka dashboard" : "Daftar sekarang"} <ArrowRight size={16} />
              </Button>
            </div>
            <div className="grid gap-px bg-ink-200 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">{f.icon}</div>
                  <p className="mt-3 font-bold text-ink-900">{f.title}</p>
                  <p className="mt-1 text-sm text-ink-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* PRIVACY */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [<Lock key="l" size={20} />, "Privat sebagai bawaan", "Profil hanya tampil di direktori bila Anda mengizinkan. Persetujuan dapat diubah kapan saja di halaman Akun."],
            [<ShieldCheck key="s" size={20} />, "Kontak terbuka atas persetujuan", "Email baru terlihat setelah Anda menerima permintaan terhubung, atau saat Anda sendiri menyatakan minat."],
            [<Users key="u" size={20} />, "Terverifikasi civitas", "Setiap akun dicocokkan oleh admin IKAMAT sebelum dapat memposting dan melihat direktori."],
          ].map(([ic, t, d]) => (
            <Card key={t as string} className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-100 text-sun-700">{ic}</div>
              <p className="mt-4 font-bold text-ink-900">{t}</p>
              <p className="mt-1 text-sm text-ink-500">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="hero-grid relative overflow-hidden rounded-3xl px-8 py-12 text-white md:px-14">
          <div className="dots absolute inset-0 opacity-50" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Mari bangun jejaring Matematika Unpad bersama.</h2>
              <p className="mt-2 max-w-xl text-sky-50/90">Daftar sebagai mahasiswa, alumni, atau dosen, lengkapi profil, dan mulai terhubung dengan civitas.</p>
            </div>
            <Button variant="sun" size="lg" href={authed ? "/akun" : "/daftar"}>
              {authed ? "Buka dashboard" : "Daftar sekarang"} <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
