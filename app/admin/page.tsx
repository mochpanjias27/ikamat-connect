"use client";

import { useState } from "react";
import { BadgeCheck, Building2, Check, FileText, Mail, ShieldCheck, Users, X } from "lucide-react";
import { CATEGORY_LABEL, Job, aggregateStats } from "@/lib/data";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/components/cards";
import { DispatchModal } from "@/components/DispatchModal";
import { Avatar, Badge, Button, Card, PageHeader, Stat, cn } from "@/components/ui";

const HRD_QUEUE = [
  { id: "h1", name: "Bagus Wirawan", org: "PT Sinyal Persada Telekom", email: "bagus.w@sinyalpersada.contoh.id", check: "Domain perusahaan cocok dengan situs web" },
  { id: "h2", name: "Rina S.", org: "Rekrutmen Cepat Sukses", email: "rinasukses88@gmail.contoh", check: "Email gratis, situs web tidak ditemukan" },
];

export default function Admin() {
  const { people, jobs, verificationQueue, decideVerification, setJobStatus, dispatches, showToast, contactRequests } = useStore();
  const [dispatchJob, setDispatchJob] = useState<Job | null>(null);
  const [hrd, setHrd] = useState<Record<string, "ok" | "no">>({});
  const s = aggregateStats(people);
  const pending = jobs.filter((j) => j.status === "pending_review");
  const emails = jobs.reduce((t, j) => t + (dispatches.find((d) => d.jobId === j.id)?.count ?? j.stats.sent), 0);
  const verified = people.filter((p) => p.verified).length;

  return (
    <RoleGate allow={["admin"]} title="Panel admin khusus moderator IKAMAT & departemen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PageHeader eyebrow="Panel admin" title="Moderasi & kesehatan platform" desc="Verifikasi civitas, moderasi lowongan, dan verifikasi HRD. Setiap tindakan tercatat di log audit." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Civitas terdaftar" value={people.length} icon={<Users size={18} />} hint={`${Math.round((verified / people.length) * 100)}% terverifikasi`} />
          <Stat label="Open to Work" value={s.openToWork} icon={<BadgeCheck size={18} />} />
          <Stat label="Lowongan terbit" value={jobs.filter((j) => j.status === "published").length} icon={<FileText size={18} />} hint={`${pending.length} menunggu moderasi`} />
          <Stat label="Email lowongan terkirim" value={emails} icon={<Mail size={18} />} hint="0 komplain spam" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink-900">Antrean verifikasi civitas</p>
              <Badge tone="sun">{verificationQueue.filter((v) => !v.decision).length} menunggu</Badge>
            </div>
            <ul className="mt-4 divide-y divide-ink-100">
              {verificationQueue.map((v) => (
                <li key={v.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                  <Avatar name={v.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-800">{v.name} <span className="font-normal text-ink-400">· {v.role}{v.gradYear ? ` ${v.gradYear}` : ""}</span></p>
                    <p className="text-xs text-ink-500">NPM {v.npm} · {v.evidence}</p>
                    <Badge tone={v.match === "cocok" ? "green" : v.match === "sebagian" ? "sun" : "red"} className="mt-1">Data acuan: {v.match}</Badge>
                  </div>
                  {v.decision ? (
                    <Badge tone={v.decision === "approved" ? "green" : "gray"}>{v.decision === "approved" ? "Disetujui" : "Ditolak"}</Badge>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { decideVerification(v.id, "approved"); showToast(`${v.name} terverifikasi sebagai ${v.role}`); }}><Check size={14} /> Setujui</Button>
                      <Button size="sm" variant="ghost" onClick={() => decideVerification(v.id, "rejected")}><X size={14} /></Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink-900">Moderasi lowongan</p>
              <Badge tone={pending.length ? "sun" : "green"}>{pending.length ? `${pending.length} menunggu` : "Bersih"}</Badge>
            </div>
            {pending.length === 0 ? (
              <p className="mt-4 rounded-xl bg-ink-50 p-4 text-sm text-ink-500">
                Tidak ada antrean. Coba: masuk sebagai <b>HRD Verified</b>, posting lowongan, lalu kembali ke sini sebagai Admin untuk menyetujui dan melihat email terkirim otomatis.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {pending.map((j) => (
                  <li key={j.id} className="rounded-xl bg-ink-50 p-4">
                    <p className="text-sm font-semibold text-ink-800">{j.title}</p>
                    <p className="text-xs text-ink-500">{j.company} · {CATEGORY_LABEL[j.category]} · oleh {j.posterName}</p>
                    <div className="mt-2 flex flex-wrap gap-1 text-xs text-ink-500">
                      {["Perusahaan terverifikasi", "Tidak memungut biaya", "Tidak meminta data sensitif"].map((c) => (
                        <span key={c} className="flex items-center gap-1 rounded-md bg-white px-2 py-0.5 ring-1 ring-ink-200"><Check size={12} className="text-emerald-600" /> {c}</span>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => { setJobStatus(j.id, "published"); setDispatchJob({ ...j, status: "published" }); }}><Check size={14} /> Setujui & kirim notifikasi</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setJobStatus(j.id, "rejected"); showToast("Lowongan ditolak, pemosting diberi tahu alasannya."); }}>Tolak</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <p className="flex items-center gap-2 font-bold text-ink-900"><Building2 size={18} className="text-sky-600" /> Verifikasi akun HRD</p>
            <ul className="mt-4 space-y-3">
              {HRD_QUEUE.map((h) => (
                <li key={h.id} className="rounded-xl bg-ink-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-800">{h.name} · {h.org}</p>
                      <p className="truncate text-xs text-ink-500">{h.email}</p>
                    </div>
                    {hrd[h.id] && <Badge tone={hrd[h.id] === "ok" ? "green" : "gray"}>{hrd[h.id] === "ok" ? "Terverifikasi" : "Ditolak"}</Badge>}
                  </div>
                  <p className={cn("mt-1 text-xs", h.id === "h1" ? "text-emerald-700" : "text-red-600")}>{h.check}</p>
                  {!hrd[h.id] && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => setHrd({ ...hrd, [h.id]: "ok" })}>Verifikasi</Button>
                      <Button size="sm" variant="ghost" onClick={() => setHrd({ ...hrd, [h.id]: "no" })}>Tolak</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <p className="flex items-center gap-2 font-bold text-ink-900"><ShieldCheck size={18} className="text-sky-600" /> Log audit terbaru</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ...dispatches.slice(0, 3).map((d) => [`Sistem`, `mengirim ${d.count} email untuk "${d.jobTitle}"`, "baru saja"]),
                ...contactRequests.slice(0, 2).map((c) => [c.fromName, `meminta kontak kandidat (${c.position})`, c.createdAt === "2026-11-03" ? "hari ini" : "kemarin"]),
                ["Moderator IKAMAT", "memverifikasi sertifikat FSAI milik alumni 2011", "kemarin"],
                ["Sistem", "menonaktifkan 3 status Open to Work yang tidak diperbarui > 6 bulan", "2 hari lalu"],
                ["Admin Departemen", "mengimpor 214 baris data acuan alumni angkatan 2015–2018", "3 hari lalu"],
              ].map(([who, what, when], i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-400" />
                  <p className="text-ink-600"><b className="text-ink-800">{who}</b> {what} <span className="text-ink-400">· {when}</span></p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-6 p-6">
          <p className="font-bold text-ink-900">Pengaturan aturan sistem</p>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Masa Fresh Graduate", "12 bulan sejak lulus"],
              ["Batas email lowongan", "5 per orang per minggu"],
              ["Pengingat Open to Work", "setiap 6 bulan"],
              ["Kuota kontak HRD", "30 per bulan"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-sky-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">{k}</p>
                <p className="mt-1 font-bold text-ink-900">{v}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <DispatchModal job={dispatchJob} viaModeration onClose={() => setDispatchJob(null)} />
    </RoleGate>
  );
}
