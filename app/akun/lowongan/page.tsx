"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarClock, ChevronDown, ChevronUp, ExternalLink, Mail, MapPin, Plus, Search, Trash2, Users } from "lucide-react";
import { Badge, Button, Card, Empty, inputCls, Modal } from "@/components/ui";
import { Alert } from "@/components/AuthShell";
import { Loading, PendingNotice, PortalHeader, ResponderList, TextArea } from "@/components/Portal";
import { supabaseBrowser } from "@/lib/supabase/client";
import { fmtDate, Job, JOB_CAT, loadPosters, Poster, posterLine, Responder, todayLocal, useMe, WORK_MODE } from "@/lib/supabase/portal";

type Tab = "semua" | Job["category"] | "saya";

export default function LowonganPortal() {
  const sb = supabaseBrowser();
  const { me, loading, verified } = useMe();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [posters, setPosters] = useState<Record<string, Poster>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>("semua");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [responders, setResponders] = useState<Record<string, Responder[] | null>>({});
  const [interestFor, setInterestFor] = useState<Job | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canPost = !!me && (me.status === "alumni" || me.status === "dosen" || me.is_admin);

  const load = useCallback(async () => {
    if (!me) return;
    const { data, error } = await sb.from("jobs").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) return setErr(error.message.includes("does not exist") ? "Fitur lowongan belum diaktifkan admin (database belum diperbarui)." : error.message);
    const list = (data || []) as Job[];
    setJobs(list);
    setPosters(await loadPosters(list.map((j) => j.poster_id)));
    const { data: ints } = await sb.from("interests").select("post_id, user_id").eq("post_type", "job");
    const mineSet = new Set<string>();
    const c: Record<string, number> = {};
    for (const i of (ints || []) as { post_id: string; user_id: string }[]) {
      if (i.user_id === me.id) mineSet.add(i.post_id);
      c[i.post_id] = (c[i.post_id] || 0) + 1;
    }
    setMine(mineSet);
    setCounts(c);
  }, [sb, me]);

  useEffect(() => {
    if (me) {
      setTab(me.status === "mahasiswa" ? "magang" : "semua");
      load();
    }
  }, [me, load]);

  const today = todayLocal();
  const shown = useMemo(() => {
    let l = jobs;
    if (tab === "saya") l = l.filter((j) => j.poster_id === me?.id);
    else {
      l = l.filter((j) => j.status === "aktif" && (!j.deadline || j.deadline >= today));
      if (tab !== "semua") l = l.filter((j) => j.category === tab);
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      l = l.filter((j) => `${j.title} ${j.company} ${j.location ?? ""} ${j.skills.join(" ")}`.toLowerCase().includes(s));
    }
    return l;
  }, [jobs, tab, q, me, today]);

  async function toggleOpen(j: Job) {
    const next = open === j.id ? null : j.id;
    setOpen(next);
    if (next && j.poster_id === me?.id && responders[j.id] === undefined) {
      setResponders((r) => ({ ...r, [j.id]: null }));
      const { data, error } = await sb.rpc("post_responses", { p_type: "job", p_id: j.id });
      setResponders((r) => ({ ...r, [j.id]: error ? [] : ((data || []) as Responder[]) }));
    }
  }

  async function sendInterest() {
    if (!interestFor) return;
    setErr("");
    const { error } = await sb.from("interests").insert({ post_type: "job", post_id: interestFor.id, message: msg.trim() || null });
    if (error) return setErr(error.message.includes("duplicate") ? "Anda sudah menyatakan minat pada lowongan ini." : `Gagal: ${error.message}`);
    setOk(`Minat Anda pada "${interestFor.title}" terkirim. Pemosting dapat melihat profil dan email Anda.`);
    setInterestFor(null);
    setMsg("");
    load();
  }

  async function cancelInterest(j: Job) {
    await sb.from("interests").delete().eq("post_type", "job").eq("post_id", j.id).eq("user_id", me!.id);
    load();
  }

  async function setStatus(j: Job, status: Job["status"]) {
    const { error } = await sb.from("jobs").update({ status }).eq("id", j.id);
    if (error) return setErr(error.message);
    load();
  }

  async function remove(j: Job) {
    if (!window.confirm(`Hapus lowongan "${j.title}"? Data peminat juga tidak lagi dapat dilihat.`)) return;
    const { error } = await sb.from("jobs").delete().eq("id", j.id);
    if (error) return setErr(error.message);
    await sb.from("interests").delete().eq("post_type", "job").eq("post_id", j.id);
    load();
  }

  if (loading || !me) return <Loading />;

  const tabs: { k: Tab; label: string }[] = [
    { k: "semua", label: "Semua" },
    { k: "magang", label: "Magang" },
    { k: "kerja", label: "Kerja" },
    { k: "freelance", label: "Freelance" },
    ...(canPost ? [{ k: "saya" as Tab, label: "Lowongan saya" }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PortalHeader
        eyebrow="Lowongan & magang"
        title={me.status === "mahasiswa" ? "Magang dan lowongan dari alumni" : "Lowongan dari jejaring IKAMAT"}
        desc="Diposting langsung oleh alumni dan dosen Matematika Unpad. Klik sebuah lowongan untuk melihat detail dan menyatakan minat."
        actions={canPost ? <Button href={verified ? "/akun/lowongan/baru" : undefined} disabled={!verified}><Plus size={16} /> Posting lowongan</Button> : undefined}
      />
      <PendingNotice me={me} what={canPost ? "memposting lowongan dan menyatakan minat" : "menyatakan minat"} />
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
          <input className={`${inputCls} pl-9`} placeholder="Cari posisi, perusahaan, keahlian…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {shown.length === 0 ? (
        <Empty
          title={tab === "saya" ? "Anda belum memposting lowongan" : "Belum ada lowongan di kategori ini"}
          desc={canPost ? "Bagikan lowongan atau magang dari tempat Anda bekerja agar langsung sampai ke civitas Matematika Unpad." : "Lowongan baru dari alumni akan muncul di sini."}
          action={canPost && verified ? <Button href="/akun/lowongan/baru"><Plus size={16} /> Posting lowongan</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {shown.map((j) => {
            const isMine = j.poster_id === me.id;
            const expired = !!j.deadline && j.deadline < today;
            const isOpen = open === j.id;
            return (
              <Card key={j.id} className="p-5">
                <button className="flex w-full items-start justify-between gap-4 text-left" onClick={() => toggleOpen(j)} aria-expanded={isOpen}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={j.category === "magang" ? "sun" : j.category === "kerja" ? "sky" : "violet"}>{JOB_CAT[j.category]}</Badge>
                      {j.status === "ditutup" && <Badge tone="gray">Ditutup</Badge>}
                      {expired && j.status === "aktif" && <Badge tone="red">Lewat tenggat</Badge>}
                      {mine.has(j.id) && <Badge tone="green">Anda berminat</Badge>}
                    </div>
                    <p className="mt-2 text-lg font-bold text-ink-900">{j.title}</p>
                    <p className="text-sm font-semibold text-ink-700">{j.company}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                      <span className="inline-flex items-center gap-1"><MapPin size={14} /> {j.location || "Lokasi fleksibel"} · {WORK_MODE[j.work_mode]}</span>
                      {j.deadline && <span className="inline-flex items-center gap-1"><CalendarClock size={14} /> Tenggat {fmtDate(j.deadline)}</span>}
                      {isMine && <span className="inline-flex items-center gap-1 font-semibold text-sky-700"><Users size={14} /> {counts[j.id] || 0} peminat</span>}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">Diposting {fmtDate(j.created_at)} oleh {isMine ? "Anda" : posterLine(posters[j.poster_id])}</p>
                  </div>
                  {isOpen ? <ChevronUp className="shrink-0 text-ink-400" /> : <ChevronDown className="shrink-0 text-ink-400" />}
                </button>

                {isOpen && (
                  <div className="mt-4 border-t border-ink-100 pt-4">
                    {j.skills.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">{j.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
                    )}
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{j.description}</p>
                    {j.requirements && (
                      <>
                        <p className="mt-4 text-sm font-bold text-ink-900">Kualifikasi</p>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{j.requirements}</p>
                      </>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {j.apply_url && <Button variant="secondary" href={j.apply_url}><ExternalLink size={16} /> Tautan lamaran</Button>}
                      {j.apply_email && <a className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-sky-800 ring-1 ring-inset ring-sky-200 hover:bg-sky-50" href={`mailto:${j.apply_email}?subject=${encodeURIComponent("Lamaran: " + j.title)}`}><Mail size={16} /> {j.apply_email}</a>}
                      {!isMine && (mine.has(j.id) ? (
                        <Button variant="ghost" onClick={() => cancelInterest(j)}>Batalkan minat</Button>
                      ) : (
                        <Button onClick={() => { setErr(""); setOk(""); setInterestFor(j); }} disabled={!verified}><Briefcase size={16} /> Saya tertarik</Button>
                      ))}
                    </div>

                    {isMine && (
                      <div className="mt-5 rounded-2xl bg-sky-50/60 p-4 ring-1 ring-sky-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-ink-900">Peminat ({counts[j.id] || 0})</p>
                          <div className="flex gap-2">
                            {j.status === "aktif" ? (
                              <Button size="sm" variant="secondary" onClick={() => setStatus(j, "ditutup")}>Tutup lowongan</Button>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => setStatus(j, "aktif")}>Buka kembali</Button>
                            )}
                            <Button size="sm" variant="danger" onClick={() => remove(j)}><Trash2 size={14} /> Hapus</Button>
                          </div>
                        </div>
                        <ResponderList items={responders[j.id] ?? null} emptyText="Belum ada peminat. Bagikan tautan halaman ini ke grup angkatan agar lebih cepat terlihat." />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!interestFor} onClose={() => setInterestFor(null)} title="Nyatakan minat">
        {interestFor && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Pemosting <b>{interestFor.title}</b> akan dapat melihat nama, status, angkatan, headline, email, dan LinkedIn Anda. Pastikan profil di halaman Akun sudah lengkap.
            </p>
            <TextArea rows={4} maxLength={1500} placeholder="Pesan singkat (opsional): pengalaman relevan, kapan bisa mulai, dll." value={msg} onChange={(e) => setMsg(e.target.value)} />
            {err && <Alert tone="error">{err}</Alert>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setInterestFor(null)}>Batal</Button>
              <Button onClick={sendInterest}>Kirim minat</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
