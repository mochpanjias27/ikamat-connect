"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info } from "lucide-react";
import { Button, Card, inputCls } from "@/components/ui";
import { Alert, Field } from "@/components/AuthShell";
import { Loading, PendingNotice, PortalHeader, TextArea } from "@/components/Portal";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Job, JOB_CAT, splitSkills, todayLocal, useMe, WORK_MODE } from "@/lib/supabase/portal";

const TARGET: Record<Job["category"], string> = {
  magang: "Ditampilkan paling atas untuk mahasiswa aktif.",
  kerja: "Ditujukan untuk alumni, terutama fresh graduate dan yang menandai Open to Work.",
  freelance: "Terlihat oleh semua civitas: mahasiswa, alumni, dan dosen.",
};

export default function PostingLowongan() {
  const router = useRouter();
  const { me, loading, verified } = useMe();
  const [f, setF] = useState({
    title: "",
    company: "",
    category: "kerja" as Job["category"],
    location: "",
    work_mode: "onsite" as Job["work_mode"],
    description: "",
    requirements: "",
    skills: "",
    apply_url: "",
    apply_email: "",
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
    if (f.title.trim().length < 3) return setErr("Isi judul posisi.");
    if (f.company.trim().length < 2) return setErr("Isi nama perusahaan atau instansi.");
    if (f.description.trim().length < 20) return setErr("Deskripsi minimal 20 karakter.");
    if (!f.apply_url.trim() && !f.apply_email.trim()) return setErr("Isi tautan lamaran atau email lamaran (minimal salah satu). Peminat juga bisa menekan tombol Saya tertarik.");
    if (f.apply_url.trim() && !/^https?:\/\//i.test(f.apply_url.trim())) return setErr("Tautan lamaran harus diawali http:// atau https://");
    if (f.apply_email.trim() && !/^\S+@\S+\.\S+$/.test(f.apply_email.trim())) return setErr("Format email lamaran tidak valid.");
    if (f.deadline && f.deadline < todayLocal()) return setErr("Tenggat tidak boleh di masa lalu.");
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("jobs")
      .insert({
        title: f.title.trim(),
        company: f.company.trim(),
        category: f.category,
        location: f.location.trim() || null,
        work_mode: f.work_mode,
        description: f.description.trim(),
        requirements: f.requirements.trim() || null,
        skills: splitSkills(f.skills),
        apply_url: f.apply_url.trim() || null,
        apply_email: f.apply_email.trim() || null,
        deadline: f.deadline || null,
      });
    setBusy(false);
    if (error) return setErr(error.message.includes("row-level security") ? "Akun Anda belum terverifikasi atau tidak berhak memposting lowongan." : `Gagal menyimpan: ${error.message}`);
    router.push("/akun/lowongan");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PortalHeader eyebrow="Lowongan & magang" title="Posting lowongan" desc="Lowongan langsung tampil untuk seluruh civitas Matematika Unpad yang login." />
      {!canPost ? (
        <Alert tone="error">Posting lowongan tersedia untuk akun alumni dan dosen.</Alert>
      ) : (
        <>
          <PendingNotice me={me} what="memposting lowongan" />
          <Card className="p-6">
            <form onSubmit={submit} className="space-y-5" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Field label="Judul posisi" required><input className={inputCls} value={f.title} onChange={set("title")} placeholder="Contoh: Data Analyst, Aktuaris Junior, Magang Risk Management" maxLength={140} /></Field></div>
                <Field label="Perusahaan / instansi" required><input className={inputCls} value={f.company} onChange={set("company")} maxLength={140} /></Field>
                <Field label="Jenis" required>
                  <select className={inputCls} value={f.category} onChange={set("category")}>
                    {(Object.keys(JOB_CAT) as Job["category"][]).map((k) => <option key={k} value={k}>{JOB_CAT[k]}</option>)}
                  </select>
                </Field>
                <Field label="Lokasi"><input className={inputCls} value={f.location} onChange={set("location")} placeholder="Jakarta Selatan" maxLength={120} /></Field>
                <Field label="Sistem kerja">
                  <select className={inputCls} value={f.work_mode} onChange={set("work_mode")}>
                    {(Object.keys(WORK_MODE) as Job["work_mode"][]).map((k) => <option key={k} value={k}>{WORK_MODE[k]}</option>)}
                  </select>
                </Field>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-sm text-sky-900 ring-1 ring-sky-100">
                <Info size={16} className="mt-0.5 shrink-0" /> <span><b>Sasaran:</b> {TARGET[f.category]}</span>
              </div>

              <Field label="Deskripsi pekerjaan" required hint="Tanggung jawab, tim, benefit, dan hal penting lainnya.">
                <TextArea rows={6} value={f.description} onChange={set("description")} maxLength={6000} />
              </Field>
              <Field label="Kualifikasi"><TextArea rows={4} value={f.requirements} onChange={set("requirements")} maxLength={4000} placeholder="S1 Matematika/Statistika, menguasai Python/SQL, …" /></Field>
              <Field label="Keahlian kunci" hint="Pisahkan dengan koma. Membantu pencarian."><input className={inputCls} value={f.skills} onChange={set("skills")} placeholder="Python, SQL, Excel, Aktuaria" /></Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tautan lamaran" hint="Situs karier, Google Form, dll."><input className={inputCls} type="url" value={f.apply_url} onChange={set("apply_url")} placeholder="https://…" /></Field>
                <Field label="Email lamaran"><input className={inputCls} type="email" value={f.apply_email} onChange={set("apply_email")} placeholder="hr@perusahaan.com" /></Field>
                <Field label="Tenggat" hint="Setelah tanggal ini lowongan disembunyikan otomatis."><input className={inputCls} type="date" min={todayLocal()} value={f.deadline} onChange={set("deadline")} /></Field>
              </div>

              {err && <Alert tone="error">{err}</Alert>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => router.push("/akun/lowongan")}>Batal</Button>
                <Button type="submit" disabled={busy || !verified}>{busy ? "Menyimpan…" : "Terbitkan lowongan"}</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
