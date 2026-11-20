"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, MapPin, Search, Send, X } from "lucide-react";
import { Badge, Button, Card, Empty, inputCls, Modal } from "@/components/ui";
import { Alert } from "@/components/AuthShell";
import { Loading, PortalHeader, TextArea } from "@/components/Portal";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ContactItem, DirEntry, fmtDate, PURPOSE, useMe } from "@/lib/supabase/portal";

type Tab = "direktori" | "permintaan";
type StatusFilter = "semua" | DirEntry["status"];

export default function Jejaring() {
  const sb = supabaseBrowser();
  const { me, loading, verified } = useMe();
  const [tab, setTab] = useState<Tab>("direktori");
  const [people, setPeople] = useState<DirEntry[] | null>(null);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [status, setStatus] = useState<StatusFilter>("semua");
  const [otw, setOtw] = useState(false);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<DirEntry | null>(null);
  const [purpose, setPurpose] = useState<ContactItem["purpose"]>("riset");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [myDirConsent, setMyDirConsent] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("status");
    if (s === "alumni" || s === "mahasiswa" || s === "dosen") setStatus(s);
    if (p.get("tab") === "permintaan") setTab("permintaan");
  }, []);

  const load = useCallback(async () => {
    if (!me) return;
    const [{ data: dir, error }, { data: cl }, { data: cons }] = await Promise.all([
      sb.rpc("directory_list"),
      sb.rpc("contact_list"),
      sb.from("consents").select("granted, created_at").eq("user_id", me.id).eq("purpose", "directory").order("created_at", { ascending: false }).limit(1),
    ]);
    if (error) setErr(error.message.includes("does not exist") || error.message.includes("Could not find") ? "Fitur jejaring belum diaktifkan admin (database belum diperbarui)." : error.message);
    setPeople(((dir || []) as DirEntry[]).filter((p) => p.id !== me.id));
    setContacts((cl || []) as ContactItem[]);
    setMyDirConsent(!!(cons as { granted: boolean }[] | null)?.[0]?.granted);
  }, [sb, me]);

  useEffect(() => {
    load();
  }, [load]);

  const relation = useMemo(() => {
    const m: Record<string, ContactItem> = {};
    for (const c of contacts) if (!m[c.other_id] || c.status !== "ditolak") m[c.other_id] = c;
    return m;
  }, [contacts]);

  const shown = useMemo(() => {
    let l = people || [];
    if (status !== "semua") l = l.filter((p) => p.status === status);
    if (otw) l = l.filter((p) => p.open_to_work);
    if (q.trim()) {
      const s = q.toLowerCase();
      l = l.filter((p) => `${p.full_name} ${p.headline ?? ""} ${p.current_company ?? ""} ${p.current_title ?? ""} ${p.city ?? ""} ${p.skills.join(" ")} ${p.angkatan ?? ""}`.toLowerCase().includes(s));
    }
    return l;
  }, [people, status, otw, q]);

  const incoming = contacts.filter((c) => c.direction === "masuk" && c.status === "menunggu").length;

  async function send() {
    if (!target) return;
    setErr("");
    if (msg.trim().length < 10) return setErr("Tulis pesan minimal 10 karakter agar penerima tahu maksud Anda.");
    const { error } = await sb.from("contact_requests").insert({ to_id: target.id, purpose, message: msg.trim() });
    if (error) return setErr(`Gagal mengirim: ${error.message}`);
    setOk(`Permintaan terhubung terkirim ke ${target.full_name}. Email kalian akan saling terlihat bila ia menerima.`);
    setTarget(null);
    setMsg("");
    load();
  }

  async function respond(c: ContactItem, accept: boolean) {
    const { error } = await sb.rpc("respond_contact", { req: c.id, accept });
    if (error) return setErr(error.message);
    load();
  }

  if (loading || !me) return <Loading />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PortalHeader
        eyebrow="Jejaring civitas"
        title={me.status === "dosen" ? "Cari mitra alumni & mahasiswa" : "Jejaring civitas Matematika Unpad"}
        desc="Hanya menampilkan akun terverifikasi yang mengizinkan tampil di direktori. Kontak (email) baru terbuka setelah permintaan terhubung diterima."
      />

      {!verified && (
        <div className="mb-6"><Alert tone="info">Direktori terbuka setelah akun Anda diverifikasi admin IKAMAT. <Link href="/akun" className="font-semibold underline">Lihat status akun</Link></Alert></div>
      )}
      {verified && !myDirConsent && (
        <div className="mb-6"><Alert tone="info">Profil Anda belum tampil di direktori. Aktifkan &quot;Tampil di direktori civitas&quot; di <Link href="/akun" className="font-semibold underline">halaman Akun</Link> agar civitas lain dapat menemukan Anda.</Alert></div>
      )}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {ok && <div className="mb-4"><Alert tone="ok">{ok}</Alert></div>}

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1 sm:w-fit">
        <button onClick={() => setTab("direktori")} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === "direktori" ? "bg-white text-sky-700 shadow-sm" : "text-ink-600"}`}>Direktori</button>
        <button onClick={() => setTab("permintaan")} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === "permintaan" ? "bg-white text-sky-700 shadow-sm" : "text-ink-600"}`}>
          Permintaan terhubung {incoming > 0 && <span className="ml-1 rounded-full bg-accent-red px-2 py-0.5 text-xs text-white">{incoming}</span>}
        </button>
      </div>

      {tab === "direktori" ? (
        <>
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className={`${inputCls} pl-9`} placeholder="Cari nama, perusahaan, keahlian, kota, angkatan…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["semua", "alumni", "mahasiswa", "dosen"] as StatusFilter[]).map((s) => (
                <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ring-1 ring-inset ${status === s ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-ink-700 ring-ink-200"}`}>{s}</button>
              ))}
              <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 ring-1 ring-inset ring-ink-200">
                <input type="checkbox" className="accent-sky-600" checked={otw} onChange={(e) => setOtw(e.target.checked)} /> Open to Work / cari magang
              </label>
            </div>
          </div>

          {people === null ? (
            <Loading />
          ) : shown.length === 0 ? (
            <Empty title={verified ? "Belum ada yang cocok" : "Direktori belum terbuka"} desc={verified ? "Direktori bertambah seiring akun baru terverifikasi. Coba kata kunci lain." : "Tunggu verifikasi admin untuk melihat civitas lain."} />
          ) : (
            <>
              <p className="mb-3 text-sm text-ink-500">{shown.length} orang</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shown.map((p) => {
                  const rel = relation[p.id];
                  return (
                    <Card key={p.id} className="flex flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={p.status === "dosen" ? "sun" : p.status === "alumni" ? "sky" : "green"}>
                          <span className="capitalize">{p.status}</span>
                          {p.angkatan ? ` ${p.angkatan}` : ""}
                          {p.status === "alumni" && p.tahun_lulus ? `–${p.tahun_lulus}` : ""}
                        </Badge>
                        {p.open_to_work && <Badge tone="violet">{p.status === "mahasiswa" ? "Cari magang" : "Open to Work"}</Badge>}
                      </div>
                      <p className="mt-2 text-lg font-bold text-ink-900">{p.full_name}</p>
                      {p.headline && <p className="text-sm font-medium text-ink-700">{p.headline}</p>}
                      {(p.current_title || p.current_company) && <p className="text-sm text-ink-500">{[p.current_title, p.current_company].filter(Boolean).join(" · ")}</p>}
                      {p.city && <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-400"><MapPin size={12} /> {p.city}</p>}
                      {p.skills.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{p.skills.slice(0, 6).map((s) => <Badge key={s}>{s}</Badge>)}</div>}
                      {p.bio && <p className="mt-3 line-clamp-3 text-sm text-ink-600">{p.bio}</p>}
                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                        {rel?.status === "diterima" ? (
                          <a href={`mailto:${rel.other_email}`} className="break-all text-sm font-semibold text-emerald-700 underline">{rel.other_email}</a>
                        ) : rel?.status === "menunggu" ? (
                          <Badge tone="gray">{rel.direction === "keluar" ? "Menunggu jawaban" : "Meminta terhubung dengan Anda"}</Badge>
                        ) : (
                          <Button size="sm" onClick={() => { setErr(""); setOk(""); setPurpose(me.status === "dosen" ? "riset" : "karier"); setTarget(p); }}><Send size={14} /> Ajak terhubung</Button>
                        )}
                        {p.linkedin_url && (
                          <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline"><ExternalLink size={14} /> LinkedIn</a>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      ) : contacts.length === 0 ? (
        <Empty title="Belum ada permintaan" desc="Permintaan terhubung yang Anda kirim dan terima akan muncul di sini." />
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {c.direction === "masuk" ? "Masuk dari" : "Dikirim ke"} · {PURPOSE[c.purpose]} · {fmtDate(c.created_at)}
                  </p>
                  <p className="mt-1 font-bold text-ink-900">
                    {c.other_name} <span className="text-sm font-medium capitalize text-ink-500">· {c.other_status}</span>
                  </p>
                  {c.other_headline && <p className="text-sm text-ink-600">{c.other_headline}</p>}
                  <p className="mt-2 whitespace-pre-line rounded-lg bg-ink-50 p-3 text-sm text-ink-700">{c.message}</p>
                  {c.status === "diterima" && c.other_email && (
                    <p className="mt-2 text-sm">Email: <a href={`mailto:${c.other_email}`} className="break-all font-semibold text-emerald-700 underline">{c.other_email}</a></p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {c.direction === "masuk" && c.status === "menunggu" ? (
                    <>
                      <Button size="sm" onClick={() => respond(c, true)}><Check size={14} /> Terima</Button>
                      <Button size="sm" variant="danger" onClick={() => respond(c, false)}><X size={14} /> Tolak</Button>
                    </>
                  ) : (
                    <Badge tone={c.status === "diterima" ? "green" : c.status === "ditolak" ? "red" : "gray"}>
                      {c.status === "diterima" ? "Diterima" : c.status === "ditolak" ? "Ditolak" : "Menunggu jawaban"}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!target} onClose={() => setTarget(null)} title={`Ajak terhubung dengan ${target?.full_name ?? ""}`}>
        {target && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-800">Keperluan</span>
              <select className={inputCls} value={purpose} onChange={(e) => setPurpose(e.target.value as ContactItem["purpose"])}>
                {(Object.keys(PURPOSE) as ContactItem["purpose"][]).map((k) => <option key={k} value={k}>{PURPOSE[k]}</option>)}
              </select>
            </label>
            <TextArea rows={5} maxLength={1500} placeholder="Perkenalkan diri dan jelaskan maksud Anda, misalnya topik riset atau peluang kerja yang ingin dibicarakan." value={msg} onChange={(e) => setMsg(e.target.value)} />
            <p className="text-xs text-ink-500">Email Anda dan email penerima baru saling terlihat bila permintaan diterima.</p>
            {err && <Alert tone="error">{err}</Alert>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setTarget(null)}>Batal</Button>
              <Button onClick={send}><Send size={14} /> Kirim</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
