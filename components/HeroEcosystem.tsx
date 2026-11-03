"use client";

import { Briefcase, Building2, FlaskConical, GraduationCap, Mail } from "lucide-react";
import { LogoMark } from "./Logo";

type Counts = { students: number; alumni: number; lecturers: number; catalog: number };

const NODES = [
  { key: "students", label: "Mahasiswa", sub: "mencari magang", icon: GraduationCap, x: 22, y: 15 },
  { key: "alumni", label: "Alumni", sub: "posting lowongan", icon: Briefcase, x: 78, y: 15 },
  { key: "lecturers", label: "Dosen", sub: "mencari mitra riset", icon: FlaskConical, x: 22, y: 72 },
  { key: "catalog", label: "Katalog HRD", sub: "kandidat bersedia", icon: Building2, x: 78, y: 72 },
] as const;

/** Visual hero: peta ekosistem civitas, hanya angka agregat tanpa data pribadi. */
export function HeroEcosystem({ counts, sent }: { counts: Counts; sent: number }) {
  const total = counts.students + counts.alumni + counts.lecturers;
  return (
    <div className="relative mx-auto mb-6 w-full max-w-md sm:mb-20 lg:mb-12">
      <div className="relative aspect-square w-full">
        {/* garis penghubung */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {NODES.map((n) => (
            <g key={n.key}>
              <line x1="50" y1="44" x2={n.x} y2={n.y} stroke="rgba(255,255,255,.35)" strokeWidth="0.6" />
              <line x1="50" y1="44" x2={n.x} y2={n.y} stroke="#FFE500" strokeWidth="0.6" className="flow-line" style={{ animationDelay: `${n.x * 0.01}s` }} />
            </g>
          ))}
          <circle cx="50" cy="44" r="38" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
        </svg>

        {/* pusat */}
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <span className="pulse-ring absolute inset-0 rounded-full bg-sun-300/50" />
            <span className="pulse-ring absolute inset-0 rounded-full bg-white/30" style={{ animationDelay: "1.2s" }} />
            <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-sun-300">
              <LogoMark size={48} />
              <span className="mt-1 text-[11px] font-extrabold tracking-tight text-ink-900">
                IKAMAT <span className="text-sky-600">Connect</span>
              </span>
            </div>
          </div>
        </div>

        {/* node */}
        {NODES.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={n.key} className="absolute w-36 -translate-x-1/2 -translate-y-1/2" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <div className="float-y rounded-2xl bg-white p-3 text-ink-800 shadow-xl" style={{ animationDelay: `${i * 0.6}s` }}>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                    <Icon size={16} />
                  </span>
                  <span className="text-2xl font-extrabold text-ink-900">{counts[n.key]}</span>
                </div>
                <p className="mt-1.5 text-sm font-bold leading-tight">{n.label}</p>
                <p className="text-[11px] leading-tight text-ink-500">{n.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* chip total */}
      <div className="absolute right-0 -top-2 rotate-3 rounded-xl bg-sun-400 px-3 py-2 text-xs font-bold text-ink-900 shadow-lg">∑ {total} civitas terdata</div>

      {/* kartu notifikasi, tanpa nama */}
      <div className="relative mx-auto mt-4 w-full rounded-2xl sm:absolute sm:-bottom-16 sm:left-1/2 sm:mt-0 sm:w-80 sm:-translate-x-1/2 bg-ink-900 p-4 text-white shadow-2xl">
        <p className="flex items-center gap-2 text-xs font-semibold text-sun-300">
          <Mail size={14} /> Notifikasi otomatis terkirim
        </p>
        <p className="mt-1 text-sm">
          Lowongan <b>Magang Data Analyst</b> dari alumni dikirim ke <b>{sent} mahasiswa</b> yang sesuai kriteria.
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-sun-400 to-sky-300" />
        </div>
      </div>
    </div>
  );
}
