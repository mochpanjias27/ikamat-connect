"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { AUDIENCE_LABEL, CATEGORY_LABEL, Job, Person, resolveAudience } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Button, Modal, cn } from "./ui";

/** Membagi penerima menjadi kirim-sekarang, digest mingguan, dan diblokir (simulasi preferensi). */
export function splitByPreference(recipients: Person[]) {
  const digest = recipients.filter((_, i) => i % 6 === 3);
  const suppressed = recipients.filter((_, i) => i % 17 === 9);
  const instant = recipients.filter((p) => !digest.includes(p) && !suppressed.includes(p));
  return { instant, digest, suppressed };
}

export function DispatchModal({ job, onClose, viaModeration = false }: { job: Job | null; onClose: () => void; viaModeration?: boolean }) {
  const { people, addDispatch } = useStore();
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(0);
  const res = job ? resolveAudience(job, people) : null;
  const split = res ? splitByPreference(res.recipients) : null;
  const total = split?.instant.length ?? 0;

  useEffect(() => {
    if (!job) return;
    setStep(0);
    setSent(0);
    const timers = [1, 2, 3, 4].map((s) => window.setTimeout(() => setStep(s), s * 700));
    return () => timers.forEach(clearTimeout);
  }, [job]);

  useEffect(() => {
    if (step !== 4 || !job) return;
    if (sent >= total) {
      setStep(5);
      addDispatch({ jobId: job.id, jobTitle: job.title, count: total, at: new Date().toISOString() });
      return;
    }
    const t = window.setTimeout(() => setSent((s) => Math.min(total, s + Math.max(1, Math.ceil(total / 8)))), 180);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, sent, total, job]);

  if (!job || !res || !split) return null;
  const sample = split.instant[0];

  const steps = [
    { label: "Lowongan diterbitkan", detail: viaModeration ? "Disetujui moderator IKAMAT" : "Pemosting berstatus trusted poster, terbit tanpa antre moderasi" },
    { label: "Menghitung audiens", detail: res.segments.map((s) => `${AUDIENCE_LABEL[s.audience]}: ${s.count}`).join(" · ") },
    {
      label: "Menyaring",
      detail: `${res.duplicatesMerged} duplikat digabung${job.skillFilter ? ` · ${res.removedBySkill} tanpa keahlian yang dicari` : ""} · ${split.digest.length} memilih digest mingguan · ${split.suppressed.length} berhenti langganan`,
    },
    { label: "Antre pengiriman", detail: `${total} email dibagi menjadi batch 50` },
    { label: "Mengirim email", detail: `${sent} / ${total} terkirim` },
  ];

  return (
    <Modal open onClose={onClose} title="Simulasi notifikasi otomatis" wide>
      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <ol className="space-y-4">
          {steps.map((s, i) => {
            const done = step > i || step === 5;
            const active = step === i && step !== 5;
            return (
              <li key={s.label} className="flex gap-3">
                <span className={cn("mt-0.5", done ? "text-emerald-600" : active ? "text-sky-600" : "text-ink-300")}>
                  {done ? <CheckCircle2 size={20} /> : <Loader2 size={20} className={active ? "animate-spin" : ""} />}
                </span>
                <div>
                  <p className={cn("text-sm font-semibold", done || active ? "text-ink-800" : "text-ink-400")}>{s.label}</p>
                  {(done || active) && <p className="text-xs text-ink-500">{s.detail}</p>}
                  {i === 4 && step >= 4 && (
                    <div className="mt-2 h-2 w-48 rounded-full bg-ink-100">
                      <div className="h-2 rounded-full bg-sky-500 transition-all" style={{ width: `${total ? (sent / total) * 100 : 100}%` }} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {step === 5 && (
            <li className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
              <b>{total} email terkirim</b> ke penerima yang tepat. {split.digest.length} lainnya akan menerima di ringkasan mingguan hari Senin. Pemosting hanya melihat jumlah, bukan daftar nama.
            </li>
          )}
        </ol>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Pratinjau email yang diterima</p>
          <div className="overflow-hidden rounded-2xl ring-1 ring-ink-200">
            <div className="border-b border-ink-100 bg-ink-50 px-4 py-2 text-xs text-ink-500">
              <p><b>Dari:</b> IKAMAT Connect &lt;notif@ikamat-connect.contoh.id&gt;</p>
              <p><b>Kepada:</b> {sample ? sample.name.split(" ")[0] : "Penerima"}</p>
              <p><b>Subjek:</b> [{CATEGORY_LABEL[job.category]}] {job.title} – {job.company}</p>
            </div>
            <div className="bg-white p-4 text-sm">
              <div className="mb-3 flex items-center gap-2 font-extrabold text-sky-700">
                <Mail size={16} /> IKAMAT Connect
              </div>
              <p>Halo {sample ? sample.name.split(" ")[0] : ""},</p>
              <p className="mt-2 text-ink-600">
                {job.posterId ? "Alumni Matematika Unpad, " : "Mitra HRD terverifikasi, "}<b>{job.posterName}</b>, membagikan kesempatan yang sesuai profil Anda:
              </p>
              <div className="mt-3 rounded-xl bg-sky-50 p-3">
                <p className="font-bold text-ink-900">{job.title}</p>
                <p className="text-ink-500">{job.company} · {job.location}</p>
                <p className="mt-1 text-xs text-ink-500">Keahlian: {job.skills.join(", ") || "-"}</p>
              </div>
              <span className="mt-3 inline-block rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white">Lihat lowongan</span>
              <p className="mt-4 border-t border-ink-100 pt-3 text-[11px] text-ink-400">
                Anda menerima email ini karena status akun Anda: {res.segments.map((s) => AUDIENCE_LABEL[s.audience]).join(" / ")}. Ubah frekuensi atau berhenti langganan di Pengaturan Notifikasi.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} disabled={step < 5}>
          {step < 5 ? "Mengirim…" : "Selesai"}
        </Button>
      </div>
    </Modal>
  );
}
