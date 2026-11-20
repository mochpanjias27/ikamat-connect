"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Badge, Button, Card, inputCls } from "@/components/ui";
import { Alert } from "@/components/AuthShell";
import { Profile, supabaseBrowser } from "@/lib/supabase/client";

type Tab = "pending" | "verified" | "rejected";
const TAB_LABEL: Record<Tab, string> = { pending: "Menunggu", verified: "Terverifikasi", rejected: "Ditolak" };

export default function Verifikasi() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [me, setMe] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [rows, setRows] = useState<Profile[]>([]);
  const [counts, setCounts] = useState<Record<Tab, number>>({ pending: 0, verified: 0, rejected: 0 });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await sb.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) return setErr(error.message);
    const all = (data || []) as Profile[];
    setCounts({
      pending: all.filter((r) => r.verification_status === "pending").length,
      verified: all.filter((r) => r.verification_status === "verified").length,
      rejected: all.filter((r) => r.verification_status === "rejected").length,
    });
    setRows(all);
  }, [sb]);

  useEffect(() => {
    (async () => {
      const { data: u } = await sb.auth.getUser();
      if (!u.user) return router.replace("/akun/masuk");
      setMe(u.user.id);
      const { data } = await sb.from("profiles").select("is_admin").eq("id", u.user.id).maybeSingle();
      const ok = !!data?.is_admin;
      setAllowed(ok);
      if (ok) load();
    })();
  }, [router, sb, load]);

  async function act(p: Profile, action: "verified" | "rejected" | "reset") {
    setErr("");
    const note = (notes[p.id] || "").trim();
    if (action === "rejected" && !note) return setErr("Tulis alasan penolakan agar pengguna tahu apa yang perlu diperbaiki.");
    const status = action === "reset" ? "pending" : action;
    const { error } = await sb
      .from("profiles")
      .update({
        verification_status: status,
        verification_note: action === "rejected" ? note : null,
        verified_at: action === "verified" ? new Date().toISOString() : null,
        verified_by: action === "verified" ? me : null,
      })
      .eq("id", p.id);
    if (error) return setErr(error.message);
    await sb.from("verification_log").insert({ profile_id: p.id, admin_id: me, action, note: note || null });
    load();
  }

  if (allowed === null) return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-ink-500">Memuat…</div>;
  if (!allowed)
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Alert tone="error">Halaman ini khusus admin IKAMAT.</Alert>
        <Button href="/akun" variant="secondary" className="mt-4">Kembali ke akun</Button>
      </div>
    );

  const shown = rows
    .filter((r) => r.verification_status === tab)
    .filter((r) => !q || `${r.full_name} ${r.email} ${r.npm ?? ""} ${r.nidn ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-sky-600">Admin IKAMAT</p>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">Verifikasi akun</h1>
      <p className="mt-2 max-w-2xl text-ink-500">Mahasiswa: cocokkan nama dan NPM. Alumni: cocokkan nama, tahun masuk, dan tahun lulus dengan daftar alumni IKAMAT atau PDDikti. Dosen: cocokkan nama dan email @unpad.ac.id dengan daftar dosen departemen.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1">
          {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === t ? "bg-white text-sky-700 shadow-sm" : "text-ink-600"}`}>
              {TAB_LABEL[t]} <span className="ml-1 text-ink-400">{counts[t]}</span>
            </button>
          ))}
        </div>
        <input className={`${inputCls} sm:max-w-xs`} placeholder="Cari nama, email, NPM…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {err && <div className="mt-4"><Alert tone="error">{err}</Alert></div>}

      <div className="mt-6 space-y-3">
        {shown.length === 0 && <Card className="p-8 text-center text-ink-500">Tidak ada akun di daftar ini.</Card>}
        {shown.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-ink-900">{p.full_name || "(tanpa nama)"}</p>
                  <Badge tone="sky"><span className="capitalize">{p.status}</span></Badge>
                  {p.is_admin && <Badge tone="sun">Admin</Badge>}
                </div>
                <p className="mt-1 break-all text-sm text-ink-500">{p.email}</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                  <div><dt className="text-xs text-ink-400">{p.status === "dosen" ? ((p.nidn || "").length === 16 ? "NUPTK" : "NIDN") : "NPM"}</dt><dd className="font-mono text-ink-800">{(p.status === "dosen" ? p.nidn : p.npm) || "–"}</dd></div>
                  {p.status !== "dosen" && <div><dt className="text-xs text-ink-400">Masuk</dt><dd className="text-ink-800">{p.angkatan ?? "–"}</dd></div>}
                  {p.status === "alumni" && <div><dt className="text-xs text-ink-400">Lulus</dt><dd className="text-ink-800">{p.tahun_lulus ?? "–"}</dd></div>}
                  <div><dt className="text-xs text-ink-400">Daftar</dt><dd className="text-ink-800">{new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</dd></div>
                </dl>
                {p.verification_note && <p className="mt-2 text-sm text-red-700">Catatan: {p.verification_note}</p>}
              </div>
              <div className="flex w-full flex-col gap-2 lg:w-80">
                {tab === "pending" && (
                  <>
                    <input className={inputCls} placeholder="Alasan jika ditolak" value={notes[p.id] || ""} onChange={(e) => setNotes((n) => ({ ...n, [p.id]: e.target.value }))} />
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => act(p, "verified")}><Check size={16} /> Setujui</Button>
                      <Button className="flex-1" variant="danger" onClick={() => act(p, "rejected")}><X size={16} /> Tolak</Button>
                    </div>
                  </>
                )}
                {tab !== "pending" && p.id !== me && (
                  <Button variant="secondary" onClick={() => act(p, "reset")}><RotateCcw size={16} /> Kembalikan ke Menunggu</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
