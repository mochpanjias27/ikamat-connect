"use client";

import { useState } from "react";
import { Bell, Download, Eye, Shield, Trash2, UserRound } from "lucide-react";
import { COLLAB_LABEL, CollabType, Visibility, completeness } from "@/lib/data";
import { NotifPrefs, useStore } from "@/lib/store";
import { RoleGate } from "@/components/cards";
import { Avatar, Badge, Button, Card, Modal, PageHeader, Toggle, cn } from "@/components/ui";

const VIS: { v: Visibility; title: string; desc: string }[] = [
  { v: "private", title: "Privat", desc: "Hanya Anda dan admin. Tidak muncul di direktori maupun katalog." },
  { v: "internal", title: "Jaringan internal Unpad", desc: "Terlihat oleh mahasiswa, dosen, dan alumni terverifikasi." },
  { v: "recruiters", title: "Internal + Katalog HRD", desc: "Juga tampil di katalog HRD (tanpa kontak) bila Anda sedang mencari kerja/magang." },
];

const FREQ: { v: NotifPrefs["jobs"]; l: string }[] = [
  { v: "instant", l: "Langsung" },
  { v: "weekly", l: "Mingguan" },
  { v: "off", l: "Mati" },
];

export default function Saya() {
  const { me, updatePerson, notif, setNotif, showToast, role } = useStore();
  const [del, setDel] = useState(false);
  if (!me) return <RoleGate allow={["student", "alumni", "lecturer"]} title="Profil Saya untuk civitas">{null}</RoleGate>;
  const up = (patch: Parameters<typeof updatePerson>[1]) => updatePerson(me.id, patch);
  const isStudent = me.stage === "student";

  return (
    <RoleGate allow={["student", "alumni", "lecturer"]} title="Profil Saya untuk civitas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader eyebrow="Profil saya" title="Kelola profil, privasi, dan notifikasi" desc="Anda memegang kendali penuh atas siapa yang melihat data Anda." actions={<Button href={`/profil/${me.id}`} variant="secondary"><Eye size={16} /> Lihat profil publik saya</Button>} />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <div className="mx-auto w-fit"><Avatar name={me.name} size={80} /></div>
              <p className="mt-3 text-lg font-bold text-ink-900">{me.name}</p>
              <p className="text-sm text-ink-500">{me.headline}</p>
              <div className="mt-4 text-left">
                <div className="flex justify-between text-xs font-semibold text-ink-500">
                  <span>Kelengkapan profil</span><span>{completeness(me).score}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-ink-100">
                  <div className="h-2 rounded-full bg-sun-400" style={{ width: `${completeness(me).score}%` }} />
                </div>
                <p className="mt-2 text-xs text-ink-400">Tambahkan portofolio, CV, dan sertifikasi untuk menaikkan peluang muncul di pencarian.</p>
                {role !== "lecturer" && <Button href="/profil/lengkapi" variant="sun" className="mt-4 w-full">Lengkapi profil & portofolio</Button>}
              </div>
            </Card>
            <Card className="p-6">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><Eye size={16} className="text-sky-600" /> Siapa yang melihat profil saya</p>
              <ul className="mt-3 space-y-3 text-sm">
                {[
                  ["Sinta Maharani", "HRD · PT Arunika Data Nusantara", "2 hari lalu"],
                  ["Dr. Bayu Adiwinata, M.Si.", "Dosen · via Direktori", "5 hari lalu"],
                  ["Alumni (Perbankan)", "via Direktori", "1 minggu lalu"],
                ].map(([n, c, t]) => (
                  <li key={n} className="flex items-center gap-2">
                    <Avatar name={n} size={30} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-700">{n}</p>
                      <p className="text-xs text-ink-400">{c} · {t}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <p className="flex items-center gap-2 font-bold text-ink-900"><UserRound size={18} className="text-sky-600" /> Status karier</p>
              <div className="divide-y divide-ink-100">
                {isStudent ? (
                  <Toggle checked={me.seekingInternship} onChange={(v) => up({ seekingInternship: v })} label="Sedang mencari magang" desc="Anda menerima email lowongan magang yang sesuai minat." />
                ) : (
                  <Toggle checked={me.openToWork} onChange={(v) => up({ openToWork: v })} label="Open to Work" desc="Anda menerima email lowongan kerja yang relevan dan dapat ditemukan HRD (bila diizinkan di bawah)." />
                )}
                <Toggle checked={me.openToProject} onChange={(v) => up({ openToProject: v })} label="Open to Project" desc="Terbuka untuk proyek lepas, konsultansi, atau kolaborasi riset." />
              </div>
            </Card>

            {me.roles.includes("alumni") && me.stage !== "academic" && (
              <Card className="p-6">
                <p className="font-bold text-ink-900">Kesediaan berkontribusi untuk almamater</p>
                <p className="text-sm text-ink-500">Dosen dapat menemukan Anda di Hub Kemitraan berdasarkan pilihan ini.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(Object.keys(COLLAB_LABEL) as CollabType[]).map((c) => {
                    const on = me.collab.includes(c);
                    return (
                      <button key={c} onClick={() => up({ collab: on ? me.collab.filter((x) => x !== c) : [...me.collab, c] })} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset", on ? "bg-violet-600 text-white ring-violet-600" : "bg-white text-ink-600 ring-ink-200 hover:bg-violet-50")}>
                        {COLLAB_LABEL[c]}
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <p className="flex items-center gap-2 font-bold text-ink-900"><Shield size={18} className="text-sky-600" /> Privasi profil</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {VIS.map((o) => (
                  <button
                    key={o.v}
                    onClick={() => {
                      up({ visibility: o.v, catalogConsent: o.v === "recruiters" });
                      showToast(o.v === "recruiters" ? "Persetujuan tampil di Katalog HRD dicatat (versi kebijakan 1.0)." : `Visibilitas diubah: ${o.title}`);
                    }}
                    className={cn("rounded-2xl p-4 text-left ring-1 transition", me.visibility === o.v ? "bg-sky-50 ring-2 ring-sky-500" : "ring-ink-200 hover:bg-ink-50")}
                  >
                    <p className="font-semibold text-ink-800">{o.title}</p>
                    <p className="mt-1 text-xs text-ink-500">{o.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-ink-50 p-4 text-sm text-ink-600">
                <p className="font-semibold text-ink-800">Yang selalu disembunyikan dari HRD</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Email", "Nomor HP", "LinkedIn", "File CV"].map((x) => <Badge key={x}>{x}</Badge>)}
                </div>
                <p className="mt-2 text-xs text-ink-500">Terbuka hanya untuk pihak yang permintaan kontaknya Anda terima.</p>
              </div>
            </Card>

            <Card className="p-6">
              <p className="flex items-center gap-2 font-bold text-ink-900"><Bell size={18} className="text-sky-600" /> Notifikasi email</p>
              {([
                ["jobs", "Lowongan kerja"],
                ["internships", "Magang"],
                ["partnerships", "Kemitraan & riset"],
              ] as const).map(([k, l]) => (
                <div key={k} className="flex items-center justify-between border-b border-ink-100 py-3 last:border-0">
                  <span className="text-sm font-semibold text-ink-700">{l}</span>
                  <div className="flex gap-1 rounded-lg bg-ink-100 p-0.5">
                    {FREQ.map((fq) => (
                      <button key={fq.v} onClick={() => setNotif({ ...notif, [k]: fq.v })} className={cn("rounded-md px-3 py-1 text-xs font-semibold", notif[k] === fq.v ? "bg-white text-sky-700 shadow-sm" : "text-ink-500")}>
                        {fq.l}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="mt-2 text-xs text-ink-400">Batas maksimal 5 email lowongan per minggu; sisanya masuk ringkasan mingguan.</p>
            </Card>

            <Card className="p-6">
              <p className="font-bold text-ink-900">Data saya (hak subjek data UU PDP)</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => showToast("Simulasi: arsip data Anda (JSON + PDF) dikirim ke email terdaftar.")}><Download size={16} /> Unduh data saya</Button>
                <Button variant="danger" onClick={() => setDel(true)}><Trash2 size={16} /> Hapus akun</Button>
              </div>
            </Card>
          </div>
        </div>
        <Modal open={del} onClose={() => setDel(false)} title="Hapus akun">
          <p className="text-sm text-ink-600">Pada versi produksi, profil Anda dihapus dalam 30 hari dan log audit dipertahankan dalam bentuk anonim. Ini hanya simulasi, tidak ada data yang dihapus.</p>
          <div className="mt-5 flex justify-end"><Button onClick={() => setDel(false)}>Mengerti</Button></div>
        </Modal>
      </div>
      {role === "lecturer" && null}
    </RoleGate>
  );
}
