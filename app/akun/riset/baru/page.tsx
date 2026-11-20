"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, inputCls } from "@/components/ui";
import { Alert, Field } from "@/components/AuthShell";
import { Loading, PendingNotice, PortalHeader, TextArea } from "@/components/Portal";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ResearchPost, SCHEME, SEEKING, splitSkills, todayLocal, useMe } from "@/lib/supabase/portal";

export default function PostingRiset() {
  const router = useRouter();
  const { me, loading, verified } = useMe();
  const [f, setF] = useState({
    title: "",
    field: "",
    scheme: "mitra_riset" as ResearchPost["scheme"],
    seeking: "alumni" as ResearchPost["seeking"],
    description: "",
    partner_needs: "",
    skills: "",
    deadline: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (loading || !me) return <Loading />;
  const isDosen = me.status === "dosen" || me.is_admin;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (f.title.trim().length < 5) return setErr("Isi judul atau topik riset (minimal 5 karakter).");
    if (f.description.trim().length < 20) return setErr("Deskripsi minimal 20 karakter.");
    if (f.deadline && f.deadline < todayLocal()) return setErr("Tenggat tidak boleh di masa lalu.");
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("research_posts")
      .insert({
        title: f.title.trim(),
        field: f.field.trim() || null,
        scheme: f.scheme,
        seeking: f.seeking,
        description: f.description.trim(),
        partner_needs: f.partner_needs.trim() || null,
        skills: splitSkills(f.skills),
        deadline: f.deadline || null,
      });
    setBusy(false);
    if (error) return setErr(error.message.includes("row-level security") ? "Akun Anda belum terverifikasi atau bukan akun dosen." : `Gagal menyimpan: ${error.message}`);
    router.push("/akun/riset");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PortalHeader eyebrow="Kemitraan riset" title="Posting kebutuhan riset" desc="Topik riset, rencana hibah, atau kebutuhan asisten. Alumni dan mahasiswa yang sesuai dapat mengajukan diri." />
      {!isDosen ? (
        <Alert tone="error">Posting kebutuhan riset tersedia untuk akun dosen.</Alert>
      ) : (
        <>
          <PendingNotice me={me} what="memposting kebutuhan riset" />
          <Card className="p-6">
            <form onSubmit={submit} className="space-y-5" noValidate>
              <Field label="Judul / topik riset" required>
                <input className={inputCls} value={f.title} onChange={set("title")} maxLength={160} placeholder="Contoh: Optimasi portofolio kredit perbankan dengan pendekatan robust" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bidang"><input className={inputCls} value={f.field} onChange={set("field")} maxLength={120} placeholder="Matematika keuangan, aktuaria, …" /></Field>
                <Field label="Skema" required>
                  <select className={inputCls} value={f.scheme} onChange={set("scheme")}>
                    {(Object.keys(SCHEME) as ResearchPost["scheme"][]).map((k) => <option key={k} value={k}>{SCHEME[k]}</option>)}
                  </select>
                </Field>
                <Field label="Yang dicari" required>
                  <select className={inputCls} value={f.seeking} onChange={set("seeking")}>
                    {(Object.keys(SEEKING) as ResearchPost["seeking"][]).map((k) => <option key={k} value={k}>{SEEKING[k]}</option>)}
                  </select>
                </Field>
                <Field label="Tenggat" hint="Setelah tanggal ini disembunyikan otomatis.">
                  <input className={inputCls} type="date" min={todayLocal()} value={f.deadline} onChange={set("deadline")} />
                </Field>
              </div>
              <Field label="Deskripsi" required hint="Latar belakang, tujuan, luaran yang diharapkan, dan perkiraan durasi.">
                <TextArea rows={6} value={f.description} onChange={set("description")} maxLength={6000} />
              </Field>
              <Field label="Mitra / kontribusi yang dicari" hint="Contoh: alumni di perbankan untuk akses data dan validasi model; mahasiswa untuk pengolahan data.">
                <TextArea rows={4} value={f.partner_needs} onChange={set("partner_needs")} maxLength={3000} />
              </Field>
              <Field label="Keahlian yang dibutuhkan" hint="Pisahkan dengan koma."><input className={inputCls} value={f.skills} onChange={set("skills")} placeholder="Python, Optimasi, Statistika, Manajemen Risiko" /></Field>
              {err && <Alert tone="error">{err}</Alert>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => router.push("/akun/riset")}>Batal</Button>
                <Button type="submit" disabled={busy || !verified}>{busy ? "Menyimpan…" : "Terbitkan"}</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
