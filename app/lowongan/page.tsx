"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { CATEGORY_LABEL, JobCategory, resolveAudience } from "@/lib/data";
import { useStore } from "@/lib/store";
import { JobCard } from "@/components/cards";
import { Badge, Button, Empty, PageHeader, cn } from "@/components/ui";

const CATS: ("all" | JobCategory)[] = ["all", "internship", "full_time", "contract", "project"];

export default function Lowongan() {
  const { jobs, role, me, people, savedJobs } = useStore();
  const [cat, setCat] = useState<"all" | JobCategory>("all");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "match" | "saved">("all");
  const canPost = ["alumni", "recruiter", "lecturer", "admin"].includes(role);
  const internal = ["student", "alumni", "lecturer", "admin"].includes(role);

  let list = jobs.filter((j) => j.status === "published" || (role === "admin" && j.status === "pending_review"));
  if (!internal) list = list.filter((j) => j.isPublic);
  const matchIds = new Set(me ? list.filter((j) => resolveAudience(j, people).recipients.some((p) => p.id === me.id)).map((j) => j.id) : []);
  if (tab === "match") list = list.filter((j) => matchIds.has(j.id));
  if (tab === "saved") list = list.filter((j) => savedJobs.includes(j.id));
  if (cat !== "all") list = list.filter((j) => j.category === cat);
  if (q.trim()) {
    const s = q.toLowerCase();
    list = list.filter((j) => [j.title, j.company, j.location, ...j.skills].join(" ").toLowerCase().includes(s));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Karier"
        title="Lowongan & magang dari jejaring alumni"
        desc={internal ? "Seluruh lowongan dari alumni dan mitra terverifikasi." : "Anda melihat lowongan yang diizinkan tampil publik. Masuk sebagai civitas untuk melihat semuanya."}
        actions={canPost && <Button href="/lowongan/baru"><Plus size={16} /> Posting lowongan</Button>}
      />
      {me && (
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-card ring-1 ring-ink-200/60 sm:w-fit">
          {([
            ["all", "Semua"],
            ["match", `Cocok untuk saya (${matchIds.size})`],
            ["saved", `Disimpan (${savedJobs.length})`],
          ] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold", tab === k ? "bg-sky-600 text-white" : "text-ink-600 hover:bg-ink-50")}>
              {l}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari posisi, perusahaan, keahlian…" className="h-11 w-full rounded-xl border-0 bg-white pl-10 pr-3 text-sm shadow-card ring-1 ring-inset ring-ink-200 focus:ring-2 focus:ring-sky-400" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset transition", cat === c ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-ink-600 ring-ink-200 hover:bg-sky-50")}>
            {c === "all" ? "Semua" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {list.length ? (
          list.map((j) => (
            <div key={j.id} className="relative">
              {matchIds.has(j.id) && tab !== "match" && (
                <Badge tone="sun" className="absolute -top-2 right-4 z-10 shadow-sm">★ Cocok untuk Anda</Badge>
              )}
              <JobCard j={j} />
            </div>
          ))
        ) : (
          <Empty title="Belum ada lowongan di sini" desc={tab === "saved" ? "Simpan lowongan dengan ikon penanda." : "Coba kategori lain."} />
        )}
      </div>
    </div>
  );
}
