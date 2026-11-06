"use client";

import { useEffect, useState } from "react";
import { Briefcase, Building2, FlaskConical, GraduationCap, Mail } from "lucide-react";
import { LogoMark } from "./Logo";

type Counts = { students: number; alumni: number; lecturers: number; catalog: number };

const NODES = [
  { key: "students", label: "Mahasiswa", sub: "mencari magang", icon: GraduationCap, x: 22, y: 15, drift: "drift-a", dur: 6.5 },
  { key: "alumni", label: "Alumni", sub: "posting lowongan", icon: Briefcase, x: 78, y: 15, drift: "drift-b", dur: 7.5 },
  { key: "catalog", label: "Katalog HRD", sub: "kandidat bersedia", icon: Building2, x: 78, y: 72, drift: "drift-c", dur: 8 },
  { key: "lecturers", label: "Dosen", sub: "mencari mitra riset", icon: FlaskConical, x: 22, y: 72, drift: "drift-d", dur: 7 },
] as const;

type Key = (typeof NODES)[number]["key"];

/** Angka naik dari 0 saat pertama tampil. */
function useCountUp(target: number, ms = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Count({ n }: { n: number }) {
  return <>{useCountUp(n)}</>;
}

/** Visual hero: peta ekosistem civitas, hanya angka agregat tanpa data pribadi. */
export function HeroEcosystem({ counts, sent }: { counts: Counts; sent: number }) {
  const total = counts.students + counts.alumni + counts.lecturers;
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % NODES.length), 2600);
    return () => window.clearInterval(id);
  }, []);
  const activeKey: Key = NODES[active].key;
  const messages: Record<Key, { title: string; body: React.ReactNode }> = {
    students: { title: "Notifikasi otomatis terkirim", body: <>Lowongan <b>Magang Data Analyst</b> dari alumni dikirim ke <b>{sent} mahasiswa</b> yang sesuai kriteria.</> },
    alumni: { title: "Lowongan baru dari alumni", body: <>Alumni menerbitkan lowongan <b>Actuarial Analyst</b> untuk fresh graduate berstatus <b>Open to Work</b>.</> },
    catalog: { title: "Permintaan kontak HRD", body: <>HRD terverifikasi menghubungi kandidat lewat platform. <b>Kontak pribadi tetap tersembunyi</b> sampai kandidat setuju.</> },
    lecturers: { title: "Kebutuhan riset dosen", body: <>Dosen mencari <b>mitra alumni sektor perbankan</b> untuk konsorsium hibah riset.</> },
  };
  const msg = messages[activeKey];
  return (
    <div className="relative mx-auto mb-6 w-full max-w-md sm:mb-20 lg:mb-12">
      <div className="relative aspect-square w-full">
        {/* garis penghubung */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {NODES.map((n, i) => (
            <g key={n.key}>
              <line x1="50" y1="44" x2={n.x} y2={n.y} stroke="rgba(255,255,255,.35)" strokeWidth="0.6" />
              <line
                x1="50"
                y1="44"
                x2={n.x}
                y2={n.y}
                stroke="#FFE500"
                strokeWidth={i === active ? 1.4 : 0.6}
                className="flow-line"
                style={{ animationDelay: `${n.x * 0.01}s`, opacity: i === active ? 1 : 0.55, transition: "stroke-width .5s, opacity .5s" }}
              />
              {i === active && <circle r="1.4" fill="#FFE500"><animateMotion dur="1.1s" repeatCount="indefinite" path={`M50 44 L${n.x} ${n.y}`} /></circle>}
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
          const on = i === active;
          return (
            <div key={n.key} className="absolute w-36 -translate-x-1/2 -translate-y-1/2" style={{ left: `${n.x}%`, top: `${n.y}%`, zIndex: on ? 10 : 1 }}>
              <div className={n.drift} style={{ animationDuration: `${n.dur}s`, animationDelay: `${-i * 1.3}s` }}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`relative w-full rounded-2xl bg-white p-3 text-left text-ink-800 transition-all duration-500 ease-out hover:-translate-y-1 ${
                    on ? "scale-[1.08] shadow-[0_18px_40px_rgba(11,41,69,.35)] ring-4 ring-sun-300" : "scale-100 shadow-xl ring-0 opacity-95"
                  }`}
                >
                  {on && <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-sun-400 ring-2 ring-white"><span className="absolute inset-0 animate-ping rounded-full bg-sun-400" /></span>}
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors duration-500 ${on ? "bg-sun-500 text-ink-900" : "bg-sky-600"}`}>
                      <Icon size={16} className={on ? "text-ink-900" : ""} />
                    </span>
                    <span className="text-2xl font-extrabold text-ink-900">
                      <Count n={counts[n.key]} />
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold leading-tight">{n.label}</p>
                  <p className="text-[11px] leading-tight text-ink-500">{n.sub}</p>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* chip total */}
      <div className="absolute right-0 -top-2 z-20 rotate-3 rounded-xl bg-sun-400 px-3 py-2 text-xs font-bold text-ink-900 shadow-lg">∑ {total} civitas terdata</div>

      {/* kartu notifikasi, tanpa nama */}
      <div className="relative mx-auto mt-4 w-full rounded-2xl sm:absolute sm:-bottom-16 sm:left-1/2 sm:mt-0 sm:w-80 sm:-translate-x-1/2 bg-ink-900 p-4 text-white shadow-2xl">
        <div key={activeKey} className="notif-in">
          <p className="flex items-center gap-2 text-xs font-semibold text-sun-300">
            <Mail size={14} /> {msg.title}
          </p>
          <p className="mt-1 min-h-[60px] text-sm">{msg.body}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="notif-bar h-full rounded-full bg-gradient-to-r from-sun-400 to-sky-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
