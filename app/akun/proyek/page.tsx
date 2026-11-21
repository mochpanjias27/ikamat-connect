"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, CalendarClock, ChevronDown, ChevronUp, Handshake, MapPin, Plus, Search, Timer, Trash2, UserSearch, Users } from "lucide-react";
import { Badge, Button, Card, Empty, inputCls, Modal } from "@/components/ui";
import { Alert } from "@/components/AuthShell";
import { Loading, PendingNotice, PortalHeader, ResponderList, TextArea } from "@/components/Portal";
import { supabaseBrowser } from "@/lib/supabase/client";
import { fmtDate, loadPosters, Poster, posterLine, Project, PROJECT_CAT, Responder, todayLocal, useMe, WORK_MODE } from "@/lib/supabase/portal";

type Tab = "semua" | "saya";

export default function ProyekPortal() {
  const sb = supabaseBrowser();
  const { me, loading, verified } = useMe();
  const [items, setItems] = useState<Project[]>([]);
  const [posters, setPosters] = useState<Record<string, Poster>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>("semua");
  const [cat, setCat] = useState<"semua" | Project["category"]>("semua");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [responders, setResponders] = useState<Record<string, Responder[] | null>>({});
  const [bidFor, setBidFor] = useState<Project | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canPost = !!me && (me.status === "alumni" || me.status === "dosen" || me.is_admin);

  const load = useCallback(async () => {
    if (!me) return;
    const { data, error } = await sb.from("projects").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) return setErr(error.message.includes("does not exist") || error.message.includes("Could not find") ? "Fitur proyek belum diaktifkan admin (database belum diperbarui)." : error.message);
    const list = (data || []) as Project[];
    setItems(list);
    setPosters(await loadPosters(list.map((p) => p.poster_id)));
    const { data: ints } = await sb.from("interests").select("post_id, user_id").eq("post_type", "project");
    const m = new Set<string>();
    const c: Record<string, number> = {};
    for (const i of (ints || []) as { post_id: string; user_id: string }[]) {
      if (i.user_id === me.id) m.add(i.post_id);
      c[i.post_id] = (c[i.post_id] || 0) + 1;
    }
    setMine(m);
    setCounts(c);
  }, [sb, me]);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayLocal();
  const shown = useMemo(() => {
    let l = items;
    if (tab === "saya") l = l.filter((p) => p.poster_id === me?.id);
    else l = l.filter((p) => p.status === "aktif" && (!p.deadline || p.deadline >= today));
    if (cat !== "semua") l = l.filter((p) => p.category === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      l = l.filter((p) => `${p.title} ${p.organization} ${p.description} ${p.location ?? ""} ${PROJECT_CAT[p.category]}`.toLowerCase().includes(s));
    }
    return l;
  }, [items, tab, cat, q, me, today]);

  async function toggleOpen(p: Project) {
    const next = open === p.id ? null : p.id;
    setOpen(next);
    if (next && p.poster_id === me?.id && responders[p.id] === undefined) {
      setResponders((r) => ({ ...r, [p.id]: null }));
      const { data, error } = await sb.rpc("post_responses", { p_type: "project", p_id: p.id });
      setResponders((r) => ({ ...r, [p.id]: error ? [] : ((data || []) as Responder[]) }));
    }
  }

  async function sendBid() {
    if (!bidFor) return;
    setErr("");
    if (msg.trim().length < 20) return setErr("Tulis penawaran minimal 20 karakter: pengalaman, pendekatan, perkiraan biaya dan waktu.");
    const { error } = await sb.from("interests").insert({ post_type: "project", post_id: bidFor.id, message: msg.trim() });
    if (error) return setErr(error.message.includes("duplicate") ? "Anda sudah mengajukan penawaran untuk proyek ini." : `Gagal: ${error.message}`);
    setOk(`Penawaran Anda untuk "${bidFor.title}" terkirim. Pemilik proyek dapat melihat profil dan email Anda.`);
    setBidFor(null);
    setMsg("");
    load();
  }

  async function cancel(p: Project) {
    await sb.from("interests").delete().eq("post_type", "project").eq("post_id", p.id).eq("user_id", me!.id);
    load();
  }

  async function setStatus(p: Project, status: Project["status"]) {
    const { error } = await sb.from("projects").update({ status }).eq("id", p.id);
    if (error) return setErr(error.message);
    load();
  }

  async function remove(p: Project) {
    if (!window.confirm(`Hapus proyek "${p.title}"?`)) return;
    const { error } = await sb.from("projects").delete().eq("id", p.id);
    if (error) return setErr(error.message);
    await sb.from("interests").delete().eq("post_type", "project").eq("post_id", p.id);
    load();
  }

  if (loading || !me) return <Loading />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PortalHeader
        eyebrow="Peluang proyek"
        title="Proyek dari jejaring IKAMAT"
        desc="Butuh sistem, jasa transportasi, kontraktor, pelatihan, atau konsultan? Posting kebutuhan proyek, dan civitas yang punya usaha atau keahlian di bidang itu dapat mengajukan penawaran."
        actions={
          <>
            <Button variant="secondary" href="/akun/jejaring?penyedia=1"><UserSearch size={16} /> Cari penyedia jasa</Button>
            {canPost && <Button href={verified ? "/akun/proyek/baru" : undefined} disabled={!verified}><Plus size={16} /> Posting proyek</Button>}
          </>
        }
      />
      <PendingNotice me={me} what={canPost ? "memposting proyek dan mengajukan penawaran" : "mengajukan penawaran"} />
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {ok && <div className="mb-4"><Alert tone="ok">{ok}</Alert></div>}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1 lg:w-fit">
          <button onClick={() => setTab("semua")} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === "semua" ? "bg-white text-sky-700 shadow-sm" : "text-ink-600"}`}>Semua proyek</button>
          {canPost && <button onClick={() => setTab("saya")} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === "saya" ? "bg-white text-sky-700 shadow-sm" : "text-ink-600"}`}>Proyek saya</button>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select className={`${inputCls} sm:w-56`} value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} aria-label="Kategori">
            <option value="semua">Semua kategori</option>
            {(Object.keys(PROJECT_CAT) as Project["category"][]).map((k) => <option key={k} value={k}>{PROJECT_CAT[k]}</option>)}
          </select>
          <div className="relative sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className={`${inputCls} pl-9`} placeholder="Cari proyek, instansi, lokasi…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <Empty
          title={tab === "saya" ? "Anda belum memposting proyek" : "Belum ada proyek di kategori ini"}
          desc={canPost ? "Posting kebutuhan proyek dari perusahaan atau instansi Anda agar civitas penyedia jasa dapat mengajukan penawaran." : "Proyek baru dari alumni dan dosen akan muncul di sini."}
          action={canPost && verified ? <Button href="/akun/proyek/baru"><Plus size={16} /> Posting proyek</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {shown.map((p) => {
            const isMine = p.poster_id === me.id;
            const isOpen = open === p.id;
            const expired = !!p.deadline && p.deadline < today;
            return (
              <Card key={p.id} className="p-5">
                <button className="flex w-full items-start justify-between gap-4 text-left" onClick={() => toggleOpen(p)} aria-expanded={isOpen}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="sun">{PROJECT_CAT[p.category]}</Badge>
                      {p.status === "ditutup" && <Badge tone="gray">Ditutup</Badge>}
                      {expired && p.status === "aktif" && <Badge tone="red">Lewat tenggat</Badge>}
                      {mine.has(p.id) && <Badge tone="green">Penawaran terkirim</Badge>}
                    </div>
                    <p className="mt-2 text-lg font-bold text-ink-900">{p.title}</p>
                    <p className="text-sm font-semibold text-ink-700">{p.organization}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                      <span className="inline-flex items-center gap-1"><MapPin size={14} /> {p.location || "Lokasi fleksibel"} · {WORK_MODE[p.work_mode]}</span>
                      {p.budget && <span className="inline-flex items-center gap-1"><Banknote size={14} /> {p.budget}</span>}
                      {p.duration && <span className="inline-flex items-center gap-1"><Timer size={14} /> {p.duration}</span>}
                      {p.deadline && <span className="inline-flex items-center gap-1"><CalendarClock size={14} /> Penawaran s.d. {fmtDate(p.deadline)}</span>}
                      {isMine && <span className="inline-flex items-center gap-1 font-semibold text-sky-700"><Users size={14} /> {counts[p.id] || 0} penawaran</span>}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">Diposting {fmtDate(p.created_at)} oleh {isMine ? "Anda" : posterLine(posters[p.poster_id])}</p>
                  </div>
                  {isOpen ? <ChevronUp className="shrink-0 text-ink-400" /> : <ChevronDown className="shrink-0 text-ink-400" />}
                </button>

                {isOpen && (
                  <div className="mt-4 border-t border-ink-100 pt-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{p.description}</p>
                    {p.scope && (
                      <>
                        <p className="mt-4 text-sm font-bold text-ink-900">Ruang lingkup & keluaran</p>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{p.scope}</p>
                      </>
                    )}
                    {p.provider_reqs && (
                      <>
                        <p className="mt-4 text-sm font-bold text-ink-900">Kriteria penyedia</p>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{p.provider_reqs}</p>
                      </>
                    )}
                    {!isMine && (
                      <div className="mt-4">
                        {mine.has(p.id) ? (
                          <Button variant="ghost" onClick={() => cancel(p)}>Tarik penawaran</Button>
                        ) : (
                          <Button onClick={() => { setErr(""); setOk(""); setBidFor(p); }} disabled={!verified}><Handshake size={16} /> Ajukan penawaran</Button>
                        )}
                      </div>
                    )}
                    {isMine && (
                      <div className="mt-5 rounded-2xl bg-sky-50/60 p-4 ring-1 ring-sky-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-ink-900">Penawaran masuk ({counts[p.id] || 0})</p>
                          <div className="flex gap-2">
                            {p.status === "aktif" ? (
                              <Button size="sm" variant="secondary" onClick={() => setStatus(p, "ditutup")}>Tutup</Button>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => setStatus(p, "aktif")}>Buka kembali</Button>
                            )}
                            <Button size="sm" variant="danger" onClick={() => remove(p)}><Trash2 size={14} /> Hapus</Button>
                          </div>
                        </div>
                        <ResponderList items={responders[p.id] ?? null} emptyText="Belum ada penawaran. Anda juga bisa mencari penyedia jasa langsung di Jejaring." />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!bidFor} onClose={() => setBidFor(null)} title="Ajukan penawaran">
        {bidFor && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Pemilik proyek <b>{bidFor.title}</b> akan dapat melihat nama, status, headline, layanan yang Anda tawarkan, email, dan LinkedIn Anda.
            </p>
            <TextArea rows={6} maxLength={1500} placeholder={"Perkenalkan usaha/tim Anda, pengalaman proyek serupa, pendekatan, serta perkiraan biaya dan waktu pengerjaan."} value={msg} onChange={(e) => setMsg(e.target.value)} />
            {err && <Alert tone="error">{err}</Alert>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setBidFor(null)}>Batal</Button>
              <Button onClick={sendBid}>Kirim penawaran</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
