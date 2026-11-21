"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, inputCls } from "@/components/ui";
import { Alert, Field } from "@/components/AuthShell";
import { Loading, PendingNotice, PortalHeader, TextArea } from "@/components/Portal";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Project, PROJECT_CAT, todayLocal, useMe, WORK_MODE } from "@/lib/supabase/portal";

export default function PostingProject() {
  const router = useRouter();
  const { me, loading, verified } = useMe();
  const [f, setF] = useState({
    title: "",
    organization: "",
    category: "teknologi" as Project["category"],
    description: "",
    scope: "",
    provider_reqs: "",
    budget: "",
    duration: "",
    location: "",
    work_mode: "remote" as Project["work_mode"],
    deadline: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (loading || !me) return <Loading />;
  const canPost = me.status === "alumni" || me.status === "dosen" || me.is_admin;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (f.title.trim().length < 5) return setErr("Isi judul project (minimal 5 karakter).");
    if (f.organization.trim().length < 2) return setErr("Isi nama perusahaan atau instansi pemilik project.");
    if (f.description.trim().length < 20) return setErr("Deskripsi minimal 20 karakter.");
    if (f.deadline && f.deadline < todayLocal()) return setErr("Batas penawaran tidak boleh di masa lalu.");
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("projects")
      .insert({
        title: f.title.trim(),
        organization: f.organization.trim(),
        category: f.category,
        description: f.description.trim(),
        scope: f.scope.trim() || null,
        provider_reqs: f.provider_reqs.trim() || null,
        budget: f.budget.trim() || null,
        duration: f.duration.trim() || null,
        location: f.location.trim() || null,
        work_mode: f.work_mode,
        deadline: f.deadline || null,
      });
    setBusy(false);
    if (error) return setErr(error.message.includes("row-level security") ? "Akun Anda belum terverifikasi atau tidak berhak memposting project." : `Gagal menyimpan: ${error.message}`);
    router.push("/akun/project");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PortalHeader eyebrow="Peluang project" title="Posting kebutuhan project" desc="Jelaskan pekerjaan yang dibutuhkan. Civitas yang memiliki usaha atau keahlian terkait dapat mengajukan penawaran kepada Anda." />
      {!canPost ? (
        <Alert tone="error">Posting project tersedia untuk akun alumni dan dosen.</Alert>
      ) : (
        <>
          <PendingNotice me={me} what="memposting project" />
          <Card className="p-6">
            <form onSubmit={submit} className="space-y-5" noValidate>
              <Field label="Judul project" required>
                <input className={inputCls} value={f.title} onChange={set("title")} maxLength={160} placeholder="Contoh: Pembuatan sistem inventaris gudang, Sewa bus karyawan, Pelatihan Excel untuk staf" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Perusahaan / instansi" required><input className={inputCls} value={f.organization} onChange={set("organization")} maxLength={160} /></Field>
                <Field label="Kategori" required>
                  <select className={inputCls} value={f.category} onChange={set("category")}>
                    {(Object.keys(PROJECT_CAT) as Project["category"][]).map((k) => <option key={k} value={k}>{PROJECT_CAT[k]}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Deskripsi kebutuhan" required hint="Latar belakang dan masalah yang ingin diselesaikan.">
                <TextArea rows={5} value={f.description} onChange={set("description")} maxLength={6000} />
              </Field>
              <Field label="Ruang lingkup & keluaran" hint="Apa saja yang harus dikerjakan dan diserahkan.">
                <TextArea rows={4} value={f.scope} onChange={set("scope")} maxLength={4000} placeholder={"• Aplikasi web untuk 3 gudang\n• Pelatihan pengguna\n• Dukungan 3 bulan"} />
              </Field>
              <Field label="Kriteria penyedia" hint="Legalitas usaha, pengalaman, sertifikasi, dll.">
                <TextArea rows={3} value={f.provider_reqs} onChange={set("provider_reqs")} maxLength={3000} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Perkiraan anggaran" hint="Boleh dikosongkan atau ditulis 'dapat dinegosiasikan'."><input className={inputCls} value={f.budget} onChange={set("budget")} maxLength={120} placeholder="Rp50–80 juta" /></Field>
                <Field label="Perkiraan durasi"><input className={inputCls} value={f.duration} onChange={set("duration")} maxLength={120} placeholder="3 bulan" /></Field>
                <Field label="Lokasi"><input className={inputCls} value={f.location} onChange={set("location")} maxLength={120} placeholder="Bandung" /></Field>
                <Field label="Sistem kerja">
                  <select className={inputCls} value={f.work_mode} onChange={set("work_mode")}>
                    {(Object.keys(WORK_MODE) as Project["work_mode"][]).map((k) => <option key={k} value={k}>{WORK_MODE[k]}</option>)}
                  </select>
                </Field>
                <Field label="Batas pengajuan penawaran" hint="Setelah tanggal ini project disembunyikan otomatis.">
                  <input className={inputCls} type="date" min={todayLocal()} value={f.deadline} onChange={set("deadline")} />
                </Field>
              </div>
              {err && <Alert tone="error">{err}</Alert>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => router.push("/akun/project")}>Batal</Button>
                <Button type="submit" disabled={busy || !verified}>{busy ? "Menyimpan…" : "Terbitkan project"}</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
