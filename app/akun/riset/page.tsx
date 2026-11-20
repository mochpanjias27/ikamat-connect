"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, ChevronDown, ChevronUp, FlaskConical, Plus, Search, Trash2, UserSearch, Users } from "lucide-react";
import { Badge, Button, Card, Empty, inputCls, Modal } from "@/components/ui";
import { Alert } from "@/components/AuthShell";
import { Loading, PendingNotice, PortalHeader, ResponderList, TextArea } from "@/components/Portal";
import { supabaseBrowser } from "@/lib/supabase/client";
import { fmtDate, loadPosters, Poster, posterLine, ResearchPost, Responder, SCHEME, SEEKING, todayLocal, useMe } from "@/lib/supabase/portal";

type Tab = "semua" | "untuk_saya" | "saya";

export default function RisetPortal() {
  const sb = supabaseBrowser();
  const { me, loading, verified } = useMe();
  const [posts, setPosts] = useState<ResearchPost[]>([]);
  const [posters, setPosters] = useState<Record<string, Poster>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>("semua");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [responders, setResponders] = useState<Record<string, Responder[] | null>>({});
  const [applyFor, setApplyFor] = useState<ResearchPost | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const isDosen = !!me && (me.status === "dosen" || me.is_admin);

  const load = useCallback(async () => {
    if (!me) return;
    const { data, error } = await sb.from("research_posts").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) return setErr(error.message.includes("does not exist") ? "Fitur riset belum diaktifkan admin (database belum diperbarui)." : error.message);
    const list = (data || []) as ResearchPost[];
    setPosts(list);
    setPosters(await loadPosters(list.map((p) => p.poster_id)));
    const { data: ints } = await sb.from("interests").select("post_id, user_id").eq("post_type", "research");
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
    if (me) {
      setTab(me.status === "dosen" ? "semua" : "untuk_saya");
      load();
    }
  }, [me, load]);

  const today = todayLocal();
  const shown = useMemo(() => {
    let l = posts;
    if (tab === "saya") l = l.filter((p) => p.poster_id === me?.id);
    else {
      l = l.filter((p) => p.status === "aktif" && (!p.deadline || p.deadline >= today));
      if (tab === "untuk_saya" && me && me.status !== "dosen") l = l.filter((p) => p.seeking === "semua" || p.seeking === me.status);
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      l = l.filter((p) => `${p.title} ${p.field ?? ""} ${p.description} ${p.skills.join(" ")}`.toLowerCase().includes(s));
    }
    return l;
  }, [posts, tab, q, me, today]);

  async function toggleOpen(p: ResearchPost) {
    const next = open === p.id ? null : p.id;
    setOpen(next);
    if (next && p.poster_id === me?.id && responders[p.id] === undefined) {
      setResponders((r) => ({ ...r, [p.id]: null }));
      const { data, error } = await sb.rpc("post_responses", { p_type: "research", p_id: p.id });
      setResponders((r) => ({ ...r, [p.id]: error ? [] : ((data || []) as Responder[]) }));
    }
  }

  async function sendApply() {
    if (!applyFor) return;
    setErr("");
    if (msg.trim().length < 10) return setErr("Tulis pesan singkat minimal 10 karakter: keahlian, institusi, atau ide kolaborasi Anda.");
    const { error } = await sb.from("interests").insert({ post_type: "research", post_id: applyFor.id, message: msg.trim() });
    if (error) return setErr(error.message.includes("duplicate") ? "Anda sudah mengajukan diri untuk kebutuhan ini." : `Gagal: ${error.message}`);
    setOk(`Pengajuan Anda untuk "${applyFor.title}" terkirim ke dosen pemosting.`);
    setApplyFor(null);
    setMsg("");
    load();
  }

  async function cancel(p: ResearchPost) {
    await sb.from("interests").delete().eq("post_type", "research").eq("post_id", p.id).eq("user_id", me!.id);
    load();
  }

  async function setStatus(p: ResearchPost, status: ResearchPost["status"]) {
    const { error } = await sb.from("research_posts").update({ status }).eq("id", p.id);
    if (error) return setErr(error.message);
    load();
  }

  async function remove(p: ResearchPost) {
    if (!window.confirm(`Hapus kebutuhan riset "${p.title}"?`)) return;
    const { error } = await sb.from("research_posts").delete().eq("id", p.id);
    if (error) return setErr(error.message);
    await sb.from("interests").delete().eq("post_type", "research").eq("post_id", p.id);
    load();
  }

  if (loading || !me) return <Loading />;

  const tabs: { k: Tab; label: string }[] = [
    { k: "semua", label: "Semua" },
    ...(me.status !== "dosen" ? [{ k: "untuk_saya" as Tab, label: me.status === "alumni" ? "Untuk alumni" : "Untuk mahasiswa" }] : []),
    ...(isDosen ? [{ k: "saya" as Tab, label: "Kebutuhan saya" }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PortalHeader
        eyebrow="Kemitraan riset"
        title={isDosen ? "Kebutuhan riset & mitra" : "Kesempatan riset bersama dosen"}
        desc={
          isDosen
            ? "Posting kebutuhan riset, hibah, atau asisten riset. Alumni dan mahasiswa yang sesuai dapat mengajukan diri, atau cari langsung mitra alumni di Jejaring."
            : "Dosen Matematika Unpad mencari mitra riset, kolaborator hibah, dan asisten riset. Ajukan diri bila keahlian Anda sesuai."
        }
        actions={
          isDosen ? (
            <>
              <Button variant="secondary" href="/akun/jejaring?status=alumni"><UserSearch size={16} /> Cari mitra alumni</Button>
              <Button href={verified ? "/akun/riset/baru" : undefined} disabled={!verified}><Plus size={16} /> Posting kebutuhan riset</Button>
            </>
          ) : undefined
        }
      />
      <PendingNotice me={me} what={isDosen ? "memposting kebutuhan riset" : "mengajukan diri"} />
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {ok && <div className="mb-4"><Alert tone="ok">{ok}</Alert></div>}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1">
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === t.k ? "bg-white text-sky-700 shadow-sm" : "text-ink-600"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className={`${inputCls} pl-9`} placeholder="Cari topik, bidang, keahlian…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {shown.length === 0 ? (
        <Empty
          title={tab === "saya" ? "Anda belum memposting kebutuhan riset" : "Belum ada kebutuhan riset"}
          desc={isDosen ? "Posting topik riset, rencana hibah, atau kebutuhan asisten agar alumni dan mahasiswa yang sesuai dapat merespons." : "Kebutuhan riset dari dosen akan muncul di sini."}
          action={isDosen && verified ? <Button href="/akun/riset/baru"><Plus size={16} /> Posting kebutuhan riset</Button> : undefined}
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
                      <Badge tone="violet">{SCHEME[p.scheme]}</Badge>
                      <Badge tone="sky">Mencari: {SEEKING[p.seeking]}</Badge>
                      {p.status === "ditutup" && <Badge tone="gray">Ditutup</Badge>}
                      {expired && p.status === "aktif" && <Badge tone="red">Lewat tenggat</Badge>}
                      {mine.has(p.id) && <Badge tone="green">Anda sudah mengajukan</Badge>}
                    </div>
                    <p className="mt-2 text-lg font-bold text-ink-900">{p.title}</p>
                    {p.field && <p className="text-sm font-semibold text-ink-700">{p.field}</p>}
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                      {p.deadline && <span className="inline-flex items-center gap-1"><CalendarClock size={14} /> Tenggat {fmtDate(p.deadline)}</span>}
                      {isMine && <span className="inline-flex items-center gap-1 font-semibold text-sky-700"><Users size={14} /> {counts[p.id] || 0} pengaju</span>}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">Diposting {fmtDate(p.created_at)} oleh {isMine ? "Anda" : posterLine(posters[p.poster_id])}</p>
                  </div>
                  {isOpen ? <ChevronUp className="shrink-0 text-ink-400" /> : <ChevronDown className="shrink-0 text-ink-400" />}
                </button>

                {isOpen && (
                  <div className="mt-4 border-t border-ink-100 pt-4">
                    {p.skills.length > 0 && <div className="mb-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>}
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{p.description}</p>
                    {p.partner_needs && (
                      <>
                        <p className="mt-4 text-sm font-bold text-ink-900">Mitra / kontribusi yang dicari</p>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{p.partner_needs}</p>
                      </>
                    )}
                    {!isMine && (
                      <div className="mt-4">
                        {mine.has(p.id) ? (
                          <Button variant="ghost" onClick={() => cancel(p)}>Batalkan pengajuan</Button>
                        ) : (
                          <Button onClick={() => { setErr(""); setOk(""); setApplyFor(p); }} disabled={!verified}><FlaskConical size={16} /> Ajukan diri</Button>
                        )}
                      </div>
                    )}
                    {isMine && (
                      <div className="mt-5 rounded-2xl bg-sky-50/60 p-4 ring-1 ring-sky-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-ink-900">Pengaju ({counts[p.id] || 0})</p>
                          <div className="flex gap-2">
                            {p.status === "aktif" ? (
                              <Button size="sm" variant="secondary" onClick={() => setStatus(p, "ditutup")}>Tutup</Button>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => setStatus(p, "aktif")}>Buka kembali</Button>
                            )}
                            <Button size="sm" variant="danger" onClick={() => remove(p)}><Trash2 size={14} /> Hapus</Button>
                          </div>
                        </div>
                        <ResponderList items={responders[p.id] ?? null} emptyText="Belum ada pengaju. Anda juga dapat mencari mitra alumni secara langsung di Jejaring." />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!applyFor} onClose={() => setApplyFor(null)} title="Ajukan diri">
        {applyFor && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Dosen pemosting <b>{applyFor.title}</b> akan dapat melihat nama, status, angkatan, headline, email, dan LinkedIn Anda.
            </p>
            <TextArea rows={5} maxLength={1500} placeholder="Ceritakan keahlian, institusi/perusahaan, dan bentuk kontribusi yang Anda tawarkan." value={msg} onChange={(e) => setMsg(e.target.value)} />
            {err && <Alert tone="error">{err}</Alert>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setApplyFor(null)}>Batal</Button>
              <Button onClick={sendApply}>Kirim pengajuan</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
