"use client";

import { Search } from "lucide-react";
import { ALL_CERTS, ALL_SKILLS, Person, SECTORS } from "@/lib/data";
import { Select, cn } from "./ui";

export interface FilterState {
  q: string;
  stage: string;
  skill: string;
  cert: string;
  sector: string;
  gradFrom: string;
  onlyOpen: boolean;
  onlyVerifiedCert: boolean;
}

export const emptyFilters: FilterState = { q: "", stage: "all", skill: "all", cert: "all", sector: "all", gradFrom: "all", onlyOpen: false, onlyVerifiedCert: false };

export function applyFilters(list: Person[], f: FilterState) {
  const q = f.q.trim().toLowerCase();
  return list.filter((p) => {
    if (q && ![p.name, p.headline, p.company ?? "", ...p.skills, ...p.certs.map((c) => c.name)].join(" ").toLowerCase().includes(q)) return false;
    if (f.stage !== "all" && p.stage !== f.stage) return false;
    if (f.skill !== "all" && !p.skills.includes(f.skill)) return false;
    if (f.cert !== "all" && !p.certs.some((c) => c.name === f.cert && (!f.onlyVerifiedCert || c.verified))) return false;
    if (f.onlyVerifiedCert && f.cert === "all" && !p.certs.some((c) => c.verified)) return false;
    if (f.sector !== "all" && p.sector !== f.sector) return false;
    if (f.gradFrom !== "all" && (!p.gradDate || Number(p.gradDate.slice(0, 4)) < Number(f.gradFrom))) return false;
    if (f.onlyOpen && !p.openToWork) return false;
    return true;
  });
}

export function FilterBar({
  f,
  set,
  showStage = true,
  showSector = true,
  showOpen = true,
}: {
  f: FilterState;
  set: (f: FilterState) => void;
  showStage?: boolean;
  showSector?: boolean;
  showOpen?: boolean;
}) {
  const up = (patch: Partial<FilterState>) => set({ ...f, ...patch });
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-200/60">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={f.q}
          onChange={(e) => up({ q: e.target.value })}
          placeholder="Cari nama, keahlian, sertifikasi, atau perusahaan…"
          className="h-11 w-full rounded-xl border-0 bg-ink-50 pl-10 pr-3 text-sm ring-1 ring-inset ring-ink-200 focus:bg-white focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <div className={cn("mt-3 grid gap-3 sm:grid-cols-2", showStage && showSector ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
        {showStage && (
          <Select
            label="Status"
            value={f.stage}
            onChange={(v) => up({ stage: v })}
            options={[
              { value: "all", label: "Semua" },
              { value: "student", label: "Mahasiswa" },
              { value: "fresh_graduate", label: "Fresh Graduate" },
              { value: "professional", label: "Alumni profesional" },
              { value: "academic", label: "Dosen" },
            ]}
          />
        )}
        <Select label="Keahlian" value={f.skill} onChange={(v) => up({ skill: v })} options={[{ value: "all", label: "Semua keahlian" }, ...ALL_SKILLS.map((s) => ({ value: s, label: s }))]} />
        <Select label="Sertifikasi" value={f.cert} onChange={(v) => up({ cert: v })} options={[{ value: "all", label: "Semua sertifikasi" }, ...ALL_CERTS.map((s) => ({ value: s, label: s }))]} />
        {showSector && <Select label="Sektor" value={f.sector} onChange={(v) => up({ sector: v })} options={[{ value: "all", label: "Semua sektor" }, ...SECTORS.map((s) => ({ value: s, label: s }))]} />}
        <Select
          label="Tahun lulus"
          value={f.gradFrom}
          onChange={(v) => up({ gradFrom: v })}
          options={[
            { value: "all", label: "Semua tahun" },
            { value: "2025", label: "2025 ke atas" },
            { value: "2022", label: "2022 ke atas" },
            { value: "2018", label: "2018 ke atas" },
            { value: "2010", label: "2010 ke atas" },
          ]}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        {showOpen && (
          <label className="flex items-center gap-2 text-ink-600">
            <input type="checkbox" checked={f.onlyOpen} onChange={(e) => up({ onlyOpen: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-sky-600" />
            Hanya Open to Work
          </label>
        )}
        <label className="flex items-center gap-2 text-ink-600">
          <input type="checkbox" checked={f.onlyVerifiedCert} onChange={(e) => up({ onlyVerifiedCert: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-sky-600" />
          Sertifikasi terverifikasi
        </label>
        {JSON.stringify(f) !== JSON.stringify(emptyFilters) && (
          <button onClick={() => set(emptyFilters)} className="font-semibold text-sky-600 hover:text-sky-700">
            Reset filter
          </button>
        )}
      </div>
    </div>
  );
}
