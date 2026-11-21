"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Briefcase, CheckCircle2, Handshake, Clock, FlaskConical, LogOut, Plus, ShieldAlert, ShieldCheck, UserSearch, Users } from "lucide-react";
import { Badge, Button, Card, inputCls, Toggle } from "@/components/ui";
import { Alert, Field } from "@/components/AuthShell";
import { CONSENT_LABEL, ConsentPurpose, Profile, supabaseBrowser } from "@/lib/supabase/client";

const EDITABLE = ["full_name", "npm", "nidn", "angkatan", "tahun_lulus", "phone", "city", "headline", "current_company", "current_title", "bio", "linkedin_url", "services"] as const;
type Editable = (typeof EDITABLE)[number];

export default function Akun() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [skills, setSkills] = useState("");
  const [openToWork, setOpenToWork] = useState(false);
  const [consents, setConsents] = useState<Record<ConsentPurpose, boolean>>({ terms: true, directory: false, job_email: false, hrd_catalog: false });
  const [msg, setMsg] = useState<{ tone: "ok" | "error" | "info"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [missingTable, setMissingTable] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await sb.auth.getUser();
      if (!u.user) return router.replace("/akun/masuk");
      if (new URLSearchParams(window.location.search).get("sandi") === "ok") setMsg({ tone: "ok", text: "Kata sandi berhasil diperbarui." });
      if (new URLSearchParams(window.location.search).get("baru") === "1") setMsg({ tone: "ok", text: "Selamat datang di IKAMAT Connect! Akun Anda sudah dibuat. Lengkapi profil di bawah sambil menunggu verifikasi admin." });
      const { data, error } = await sb.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (error || !data) {
        setMissingTable(true);
        setLoading(false);
        return;
      }
      const p = data as Profile;
      setProfile(p);
      setDraft(Object.fromEntries(EDITABLE.map((k) => [k, p[k] == null ? "" : String(p[k])])));
      setSkills((p.skills || []).join(", "));
      setOpenToWork(p.open_to_work);
      const { data: cs } = await sb.from("consents").select("purpose, granted, created_at").eq("user_id", u.user.id).order("created_at", { ascending: false });
      if (cs) {
        const latest: Partial<Record<ConsentPurpose, boolean>> = {};
        for (const c of cs as { purpose: ConsentPurpose; granted: boolean }[]) if (latest[c.purpose] === undefined) latest[c.purpose] = c.granted;
        setConsents((prev) => ({ ...prev, ...latest }));
      }
      setLoading(false);
    })();
  }, [router, sb]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    setMsg(null);
    const patch: Record<string, unknown> = { open_to_work: openToWork, skills: skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30) };
    for (const k of EDITABLE) {
      if (k === "services" && !("services" in profile)) continue; // kolom tersedia setelah migrasi 0005
      const v = (draft[k] ?? "").trim();
      patch[k] = k === "angkatan" || k === "tahun_lulus" ? (v ? Number(v) : null) : k === "full_name" ? v : v || null;
    }
    const { data, error } = await sb.from("profiles").update(patch).eq("id", profile.id).select("*").single();
    setSaving(false);
    if (error) return setMsg({ tone: "error", text: `Gagal menyimpan: ${error.message}` });
    const p = data as Profile;
    const reset = profile.verification_status === "verified" && p.verification_status === "pending";
    setProfile(p);
    setMsg({ tone: "ok", text: reset ? "Tersimpan. Karena data identitas berubah, akun perlu diverifikasi ulang oleh admin." : "Profil tersimpan." });
  }

  async function toggleConsent(k: ConsentPurpose, v: boolean) {
    if (!profile) return;
    setConsents((c) => ({ ...c, [k]: v }));
    const { error } = await sb.from("consents").insert({ user_id: profile.id, purpose: k, granted: v });
    if (error) {
      setConsents((c) => ({ ...c, [k]: !v }));
      setMsg({ tone: "error", text: "Gagal menyimpan persetujuan. Coba lagi." });
    }
  }

  async function logout() {
    await sb.auth.signOut();
    router.replace("/akun/masuk");
    router.refresh();
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-ink-500">Memuat akun…</div>;

  if (missingTable || !profile)
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Alert tone="error">
          Akun Anda aktif, tetapi data profil belum dapat dimuat. Kemungkinan tabel database belum disiapkan admin. Silakan coba lagi nanti.
        </Alert>
        <Button variant="secondary" className="mt-4" onClick={logout}><LogOut size={16} /> Keluar</Button>
      </div>
    );

  const isStudentLike = profile.status !== "dosen";
  const d = (k: Editable) => ({ value: draft[k] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft((x) => ({ ...x, [k]: e.target.value })) });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-sky-600">Akun saya</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">{profile.full_name || "Tanpa nama"}</h1>
          <p className="mt-1 break-all text-ink-500">{profile.email} · <span className="capitalize">{profile.status}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.is_admin && <Button href="/akun/verifikasi" variant="sun"><Users size={16} /> Verifikasi akun</Button>}
          <Button variant="secondary" onClick={logout}><LogOut size={16} /> Keluar</Button>
        </div>
      </div>

      <VerificationBanner p={profile} />
      <QuickActions p={profile} />

      {msg && <div className="mt-4"><Alert tone={msg.tone}>{msg.text}</Alert></div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.9fr]">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink-900">Data diri dan karier</h2>
          <p className="mt-1 text-sm text-ink-500">Mengubah nama, status, NPM, atau tahun masuk/lulus akan meminta verifikasi ulang.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Nama lengkap"><input className={inputCls} {...d("full_name")} /></Field></div>
            {profile.status === "mahasiswa" && <Field label="NPM"><input className={inputCls} inputMode="numeric" {...d("npm")} /></Field>}
            {profile.status === "alumni" && <Field label="NPM (opsional)" hint="Boleh dikosongkan bila lupa."><input className={inputCls} inputMode="numeric" {...d("npm")} /></Field>}
            {profile.status === "dosen" && <Field label="NIDN / NUPTK (opsional)" hint="Boleh dikosongkan."><input className={inputCls} inputMode="numeric" {...d("nidn")} /></Field>}
            {isStudentLike && <Field label="Tahun masuk (angkatan)"><input className={inputCls} inputMode="numeric" maxLength={4} {...d("angkatan")} /></Field>}
            {profile.status === "alumni" && <Field label="Tahun lulus"><input className={inputCls} inputMode="numeric" maxLength={4} {...d("tahun_lulus")} /></Field>}
            <Field label="Nomor WhatsApp" hint="Tidak pernah ditampilkan publik."><input className={inputCls} inputMode="tel" {...d("phone")} /></Field>
            <Field label="Kota domisili"><input className={inputCls} {...d("city")} /></Field>
            <div className="sm:col-span-2"><Field label="Headline" hint="Contoh: Data Analyst · Aktuaria · Optimasi"><input className={inputCls} maxLength={120} {...d("headline")} /></Field></div>
            {profile.status !== "mahasiswa" && (
              <>
                <Field label="Instansi / perusahaan saat ini"><input className={inputCls} {...d("current_company")} /></Field>
                <Field label="Jabatan"><input className={inputCls} {...d("current_title")} /></Field>
              </>
            )}
            <div className="sm:col-span-2">
              <Field label="Keahlian" hint="Pisahkan dengan koma, maksimal 30.">
                <input className={inputCls} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, SQL, Statistika, Riset Operasi" />
              </Field>
            </div>
            <div className="sm:col-span-2"><Field label="Tentang saya"><textarea className={inputCls} rows={4} maxLength={1200} {...d("bio")} /></Field></div>
            <div className="sm:col-span-2">
              <Field label="Layanan / usaha yang saya tawarkan" hint="Opsional. Contoh: jasa pembuatan aplikasi, konsultan aktuaria, sewa kendaraan, pelatihan Excel. Membuat Anda mudah ditemukan untuk Project.">
                <textarea className={inputCls} rows={2} maxLength={1000} {...d("services")} />
              </Field>
            </div>
            <div className="sm:col-span-2"><Field label="LinkedIn"><input className={inputCls} type="url" placeholder="https://linkedin.com/in/…" {...d("linkedin_url")} /></Field></div>
            {profile.status !== "dosen" && (
              <div className="rounded-xl bg-ink-50 px-4 sm:col-span-2">
                <Toggle checked={openToWork} onChange={setOpenToWork} label={profile.status === "mahasiswa" ? "Sedang mencari magang" : "Open to Work"} desc="Menandai Anda sebagai penerima prioritas info lowongan." />
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? "Menyimpan…" : "Simpan profil"}</Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-ink-900">Persetujuan data</h2>
            <p className="mt-1 text-sm text-ink-500">Setiap perubahan dicatat sebagai riwayat persetujuan.</p>
            <div className="mt-2 divide-y divide-ink-100">
              {(["directory", "job_email", "hrd_catalog"] as ConsentPurpose[]).map((k) => (
                <Toggle key={k} checked={consents[k]} onChange={(v) => toggleConsent(k, v)} label={CONSENT_LABEL[k].title} desc={CONSENT_LABEL[k].desc} />
              ))}
            </div>
          </Card>
          <Card className="p-6 text-sm text-ink-600">
            <h2 className="text-lg font-bold text-ink-900">Tips agar mudah ditemukan</h2>
            <p className="mt-2">Isi headline, keahlian, dan instansi, lalu aktifkan &quot;Tampil di direktori civitas&quot;. Profil inilah yang dilihat dosen dan alumni saat Anda menyatakan minat pada lowongan atau riset.</p>
            <Link href="/akun/jejaring" className="mt-3 inline-block font-semibold text-sky-700 underline">Buka Jejaring</Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VerificationBanner({ p }: { p: Profile }) {
  if (p.verification_status === "verified")
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
        <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={22} />
        <div>
          <p className="font-bold text-emerald-900">Akun terverifikasi <Badge tone="green" className="ml-1"><CheckCircle2 size={12} /> Civitas Matematika Unpad</Badge></p>
          <p className="text-sm text-emerald-800">Terima kasih. Data Anda sudah dicocokkan oleh admin IKAMAT.</p>
        </div>
      </div>
    );
  if (p.verification_status === "rejected")
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
        <ShieldAlert className="mt-0.5 shrink-0 text-red-600" size={22} />
        <div>
          <p className="font-bold text-red-900">Verifikasi belum berhasil</p>
          <p className="text-sm text-red-800">{p.verification_note || "Data belum cocok dengan data acuan."} Perbaiki data di bawah lalu simpan untuk diajukan ulang.</p>
        </div>
      </div>
    );
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-sun-100 p-4 ring-1 ring-sun-300">
      <Clock className="mt-0.5 shrink-0 text-sun-700" size={22} />
      <div>
        <p className="font-bold text-ink-900">Menunggu verifikasi admin</p>
        <p className="text-sm text-ink-700">Admin IKAMAT akan mencocokkan {p.status === "alumni" ? "nama, tahun masuk, dan tahun lulus" : p.status === "dosen" ? "nama dan email Unpad" : "nama dan NPM"} Anda. Sambil menunggu, lengkapi profil di bawah.</p>
      </div>
    </div>
  );
}

function QuickActions({ p }: { p: Profile }) {
  const [stats, setStats] = useState<{ jobs: number; research: number; projects: number; incoming: number } | null>(null);
  useEffect(() => {
    const sb = supabaseBrowser();
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [j, r, c, x] = await Promise.all([
        sb.from("jobs").select("id", { count: "exact", head: true }).eq("status", "aktif").or(`deadline.is.null,deadline.gte.${today}`),
        sb.from("research_posts").select("id", { count: "exact", head: true }).eq("status", "aktif").or(`deadline.is.null,deadline.gte.${today}`),
        sb.from("contact_requests").select("id", { count: "exact", head: true }).eq("to_id", p.id).eq("status", "menunggu"),
        sb.from("projects").select("id", { count: "exact", head: true }).eq("status", "aktif").or(`deadline.is.null,deadline.gte.${today}`),
      ]);
      setStats({ jobs: j.count ?? 0, research: r.count ?? 0, projects: x.count ?? 0, incoming: c.count ?? 0 });
    })();
  }, [p.id]);

  type A = { href: string; icon: React.ReactNode; title: string; desc: string; primary?: boolean };
  const actions: A[] =
    p.status === "dosen"
      ? [
          { href: "/akun/riset/baru", icon: <Plus size={18} />, title: "Posting kebutuhan riset", desc: "Hibah, mitra riset, atau asisten riset.", primary: true },
          { href: "/akun/jejaring?status=alumni", icon: <UserSearch size={18} />, title: "Cari mitra alumni", desc: "Telusuri alumni berdasarkan keahlian dan instansi." },
          { href: "/akun/lowongan/baru", icon: <Briefcase size={18} />, title: "Posting lowongan", desc: "Bagikan lowongan atau magang untuk mahasiswa." },
          { href: "/akun/project", icon: <Handshake size={18} />, title: "Peluang project", desc: `${stats?.projects ?? "…"} project aktif dari jejaring.` },
        ]
      : p.status === "alumni"
        ? [
            { href: "/akun/lowongan/baru", icon: <Plus size={18} />, title: "Posting lowongan", desc: "Kerja, magang, atau project dari tempat Anda.", primary: true },
            { href: "/akun/riset", icon: <FlaskConical size={18} />, title: "Jadi mitra riset dosen", desc: `${stats?.research ?? "…"} kebutuhan riset aktif.` },
            { href: "/akun/project", icon: <Handshake size={18} />, title: "Peluang project", desc: `${stats?.projects ?? "…"} project aktif. Posting kebutuhan atau ajukan penawaran.` },
            { href: "/akun/jejaring", icon: <UserSearch size={18} />, title: "Jejaring civitas", desc: "Temukan rekan alumni, dosen, dan talenta mahasiswa." },
          ]
        : [
            { href: "/akun/lowongan", icon: <Briefcase size={18} />, title: "Cari magang & lowongan", desc: `${stats?.jobs ?? "…"} lowongan aktif dari alumni.`, primary: true },
            { href: "/akun/riset", icon: <FlaskConical size={18} />, title: "Riset bersama dosen", desc: `${stats?.research ?? "…"} kesempatan riset aktif.` },
            { href: "/akun/project", icon: <Handshake size={18} />, title: "Peluang project", desc: `${stats?.projects ?? "…"} project aktif dari alumni.` },
            { href: "/akun/jejaring?status=alumni", icon: <UserSearch size={18} />, title: "Temukan mentor alumni", desc: "Ajak terhubung untuk mentoring karier." },
          ];

  return (
    <div className="mt-6">
      {stats && stats.incoming > 0 && (
        <Link href="/akun/jejaring?tab=permintaan" className="mb-4 flex items-center justify-between rounded-2xl bg-sky-600 px-5 py-4 text-white shadow-sm hover:bg-sky-700">
          <span className="font-semibold">{stats.incoming} permintaan terhubung menunggu jawaban Anda</span>
          <span className="text-sm font-bold">Lihat →</span>
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className={`rounded-2xl p-5 shadow-card ring-1 transition hover:-translate-y-0.5 ${a.primary ? "bg-sky-950 text-white ring-sky-950" : "bg-white text-ink-900 ring-ink-200/60"}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.primary ? "bg-sun-400 text-ink-900" : "bg-sky-50 text-sky-700"}`}>{a.icon}</span>
            <p className="mt-3 font-bold">{a.title}</p>
            <p className={`mt-1 text-sm ${a.primary ? "text-sky-200" : "text-ink-500"}`}>{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
