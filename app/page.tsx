"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, Building2, FlaskConical, GraduationCap, Lock, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AppRole, PERSONAS, aggregateStats } from "@/lib/data";
import { useStore } from "@/lib/store";
import { JobCard } from "@/components/cards";
import { Button, Card } from "@/components/ui";
import { HeroEcosystem } from "@/components/HeroEcosystem";

const AUDIENCES: { role: AppRole; icon: React.ReactNode; title: string; points: string[]; go: string }[] = [
  {
    role: "student",
    icon: <GraduationCap size={22} />,
    title: "Mahasiswa",
    points: ["Profil keahlian & sertifikasi", "Email magang yang sesuai minat", "Terhubung dengan alumni mentor"],
    go: "/dasbor",
  },
  {
    role: "alumni",
    icon: <Briefcase size={22} />,
    title: "Alumni IKAMAT",
    points: ["Posting lowongan sekali, sampai ke orang yang tepat", "Rekrut adik tingkat dari talent pool", "Jadi mitra riset & praktisi mengajar"],
    go: "/lowongan/baru",
  },
  {
    role: "lecturer",
    icon: <FlaskConical size={22} />,
    title: "Dosen & Departemen",
    points: ["Cari mitra industri untuk hibah", "Undang alumni sebagai praktisi", "Data jejak karier lulusan"],
    go: "/kemitraan",
  },
  {
    role: "recruiter",
    icon: <Building2 size={22} />,
    title: "HRD Perusahaan",
    points: ["Katalog khusus lulusan Matematika", "Filter keahlian & sertifikasi", "Kontak via platform, privasi terjaga"],
    go: "/talenta",
  },
];

export default function Home() {
  const { setRole, jobs, people, showToast } = useStore();
  const router = useRouter();
  const stats = aggregateStats(people);
  const maxSector = stats.sectors[0]?.[1] ?? 1;
  const tryAs = (r: AppRole, href: string) => {
    setRole(r);
    showToast(`Masuk sebagai ${PERSONAS[r].label}: ${PERSONAS[r].name}`);
    router.push(href);
  };

  return (
    <>
      {/* HERO */}
      <section className="hero-grid relative overflow-hidden text-white">
        <div className="dots absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/30">
              <Sparkles size={14} className="text-sun-300" /> Ikatan Keluarga Alumni Matematika FMIPA Unpad
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              Satu jejaring untuk seluruh <span className="relative whitespace-nowrap text-sun-300">civitas Matematika</span> Unpad.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-sky-50/90">
              Mempertemukan mahasiswa, dosen, dan alumni dalam satu basis data terverifikasi: lowongan yang sampai ke orang yang tepat, mitra riset yang mudah dicari, dan talent pool lulusan matematika untuk HRD.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="sun" size="lg" onClick={() => tryAs("alumni", "/lowongan/baru")}>
                Coba posting lowongan <ArrowRight size={18} />
              </Button>
              <Button href="/talenta" size="lg" className="bg-white/10 text-white ring-1 ring-inset ring-white/40 hover:bg-white/20">
                <Search size={18} /> Jelajahi Katalog Talenta
              </Button>
            </div>
          </div>

          {/* Visual ekosistem (tanpa data pribadi) */}
          <HeroEcosystem
            counts={{ students: stats.students, alumni: stats.alumni, lecturers: stats.lecturers, catalog: people.filter((p) => (p.openToWork || p.seekingInternship) && p.catalogConsent && p.visibility === "recruiters" && p.verified).length }}
            sent={jobs.find((j) => j.id === "j1")?.stats.sent ?? 0}
          />
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto -mt-2 max-w-7xl px-4 pt-14 sm:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            ["Alumni", stats.alumni],
            ["Mahasiswa aktif", stats.students],
            ["Dosen", stats.lecturers],
            ["Open to Work", stats.openToWork],
            ["Sertifikasi tercatat", stats.certs],
          ].map(([l, v]) => (
            <Card key={l as string} className="p-5 text-center">
              <p className="text-3xl font-extrabold text-sky-700">{v}</p>
              <p className="mt-1 text-sm font-medium text-ink-500">{l}</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-ink-400">Angka simulasi dari data dummy. Target versi produksi: seluruh alumni sejak angkatan pertama.</p>
      </section>

      {/* AUDIENCES */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Untuk siapa</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">Empat pengguna, satu ekosistem</h2>
          <p className="mt-2 text-ink-500">Setiap orang punya satu akun dan bisa memegang lebih dari satu peran, misalnya dosen yang juga alumni.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a) => (
            <Card key={a.role} className="flex flex-col p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white">{a.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{a.title}</h3>
              <ul className="mt-3 flex-1 space-y-2 text-sm text-ink-600">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" /> {p}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="mt-5" onClick={() => tryAs(a.role, a.go)}>
                Coba sebagai {PERSONAS[a.role].label} <ArrowRight size={16} />
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW ROUTING WORKS */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[.9fr_1.1fr]">
            <div className="bg-sky-950 p-8 text-white md:p-10">
              <p className="text-sm font-bold uppercase tracking-wide text-sun-300">Fitur unggulan</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Email lowongan yang tepat sasaran</h2>
              <p className="mt-3 text-sky-100/80">
                Alumni cukup mengisi satu formulir. Sistem memilih penerimanya berdasarkan status akun dan keahlian, tanpa email massal ke semua orang.
              </p>
              <Button variant="sun" className="mt-6" onClick={() => tryAs("alumni", "/lowongan/baru")}>
                Lihat simulasinya <ArrowRight size={16} />
              </Button>
            </div>
            <div className="grid gap-px bg-ink-200 sm:grid-cols-2">
              {[
                ["Magang", "Mahasiswa aktif yang sedang mencari magang"],
                ["Full-time entry level", "Fresh Graduate + civitas berstatus Open to Work"],
                ["Mid / Senior", "Alumni profesional berstatus Open to Work"],
                ["Proyek / Konsultansi", "Civitas yang menandai Open to Project"],
              ].map(([k, v], i) => (
                <div key={k} className="bg-white p-6">
                  <p className="text-xs font-bold text-sun-700">ATURAN {i + 1}</p>
                  <p className="mt-1 font-bold text-ink-900">{k}</p>
                  <p className="mt-1 flex items-start gap-2 text-sm text-ink-500">
                    <ArrowRight size={15} className="mt-0.5 shrink-0 text-sky-500" /> {v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* SECTORS + JOBS */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-20 sm:px-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Jejak karier</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">Alumni tersebar di berbagai sektor</h2>
          <Card className="mt-5 p-5">
            <ul className="space-y-3">
              {stats.sectors.slice(0, 8).map(([s, n]) => (
                <li key={s}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-ink-700">{s}</span>
                    <span className="font-semibold text-ink-500">{n}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-ink-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-400" style={{ width: `${(n / maxSector) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-400">Statistik agregat, tidak menampilkan data individu.</p>
          </Card>
        </div>
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Terbaru</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">Lowongan dari sesama alumni</h2>
            </div>
            <Link href="/lowongan" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
              Lihat semua →
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {jobs.filter((j) => j.status === "published").slice(0, 3).map((j) => (
              <JobCard key={j.id} j={j} />
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [<Lock key="l" size={20} />, "Privat sebagai bawaan", "Profil baru hanya terlihat internal. Tampil di katalog HRD perlu persetujuan eksplisit."],
            [<ShieldCheck key="s" size={20} />, "Kontak tidak pernah dibuka", "HRD menghubungi lewat platform. Email dan nomor HP terbuka hanya jika kandidat setuju."],
            [<Users key="u" size={20} />, "Terverifikasi civitas", "Setiap akun dicocokkan dengan data departemen atau diverifikasi moderator IKAMAT."],
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
              <p className="mt-2 max-w-xl text-sky-50/90">Dukungan IKAMAT, departemen, dan mitra alumni menentukan seberapa cepat platform ini hadir untuk seluruh civitas.</p>
            </div>
            <Button variant="sun" size="lg" href="/masuk">
              Mulai simulasi <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
