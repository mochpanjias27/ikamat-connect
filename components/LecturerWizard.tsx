"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, FlaskConical, Handshake, Landmark, Plus, Sparkles, Trash2, UserRound, Users } from "lucide-react";
import { ALL_SKILLS, Grant, Person, Publication, SECTORS, completeness } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Badge, Button, Card, Modal, Toggle, cn, inputCls } from "./ui";

const STEPS = [
  { title: "Data diri & jabatan", icon: UserRound },
  { title: "Kepakaran & riset", icon: FlaskConical },
  { title: "Publikasi", icon: BookOpen },
  { title: "Hibah & pengabdian", icon: Landmark },
  { title: "Pengajaran & bimbingan", icon: Users },
  { title: "Kebutuhan kolaborasi", icon: Handshake },
] as const;

const INDEXING: Publication["indexing"][] = ["Scopus Q1", "Scopus Q2", "Scopus Q3", "Scopus Q4", "Sinta 1", "Sinta 2", "Sinta 3", "Prosiding", "Lainnya"];
const RANKS: NonNullable<Person["academicRank"]>[] = ["Asisten Ahli", "Lektor", "Lektor Kepala", "Guru Besar"];
const NEEDS = ["Data studi kasus", "Mitra konsorsium hibah", "Praktisi mengajar", "Pembicara seminar", "Tempat magang mahasiswa", "Pendanaan riset bersama", "Validasi model di industri"];
const EXPERTISE = ["Matematika Keuangan", "Aktuaria", "Manajemen Risiko", "Statistika", "Data Sains", "Machine Learning", "Riset Operasi", "Optimasi Robust", "Analisis Numerik", "Persamaan Diferensial", "Pemodelan Epidemi", "Kontrol Optimal", "Aljabar", "Kriptografi", "Teori Graf", "Ekonometrika", "Logika Fuzzy", "Pendidikan Matematika"];

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-sm font-semibold text-ink-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

function Chips({ options, value, onChange, custom, tone = "sky" }: { options: string[]; value: string[]; onChange: (v: string[]) => void; custom?: boolean; tone?: "sky" | "violet" }) {
  const [t, setT] = useState("");
  const on = tone === "violet" ? "bg-violet-600 text-white ring-violet-600" : "bg-sky-600 text-white ring-sky-600";
  const add = () => {
    if (t.trim()) onChange([...value, t.trim()]);
    setT("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from(new Set([...options, ...value])).map((o) => {
          const a = value.includes(o);
          return (
            <button key={o} type="button" onClick={() => onChange(a ? value.filter((x) => x !== o) : [...value, o])} className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition", a ? on : "bg-white text-ink-600 ring-ink-200 hover:bg-sky-50")}>
              {a && "✓ "}
              {o}
            </button>
          );
        })}
      </div>
      {custom && (
        <div className="mt-2 flex gap-2">
          <input className={cn(inputCls, "h-9 py-1")} value={t} placeholder="Tambah lainnya…" onChange={(e) => setT(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
          <Button size="sm" variant="secondary" type="button" onClick={add}><Plus size={14} /> Tambah</Button>
        </div>
      )}
    </div>
  );
}

export function LecturerWizard({ me }: { me: Person }) {
  const { updatePerson, showToast, people } = useStore();
  const router = useRouter();
  const [d, setD] = useState<Person>({ ...me });
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const score = useMemo(() => completeness(d), [d]);
  const up = (patch: Partial<Person>) => setD({ ...d, ...patch });
  const pubs = d.publications ?? [];
  const grants = d.grants ?? [];
  const setPub = (i: number, patch: Partial<Publication>) => up({ publications: pubs.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const setGrant = (i: number, patch: Partial<Grant>) => up({ grants: grants.map((x, j) => (j === i ? { ...x, ...patch } : x)) });

  const save = (next?: number) => {
    updatePerson(me.id, { ...d, skills: Array.from(new Set([...(d.expertise ?? []), ...d.skills])).slice(0, 8), profileCompleteness: score.score });
    if (typeof next === "number") {
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const partnerMatches = people.filter(
    (p) => p.stage === "professional" && p.collab.length > 0 && ((d.partnerSectorsSought ?? []).includes(p.sector ?? "") || p.skills.some((s) => (d.expertise ?? []).includes(s)))
  ).length;
  const assistantMatches = people.filter((p) => p.stage === "student" && p.collab.includes("research_assistant") && (!(d.assistantSkills ?? []).length || p.track === d.track || p.skills.some((s) => d.assistantSkills!.includes(s)))).length;
  const q = (pubs.filter((p) => p.indexing.startsWith("Scopus")).length);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-sky-600">Profil akademisi</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">Lengkapi profil dosen</h1>
          <p className="mt-2 max-w-2xl text-ink-500">Profil kepakaran yang lengkap membantu alumni industri menemukan Anda untuk riset bersama, dan memudahkan mahasiswa mencari pembimbing atau peluang menjadi asisten riset.</p>
        </div>
        <div className="flex gap-2"><Button variant="ghost" href="/saya">Privasi &amp; notifikasi</Button><Button variant="secondary" href={`/profil/${me.id}`}>Lihat profil saya</Button></div>
      </div>

      <div className="mb-6 overflow-x-auto rounded-2xl bg-white p-2 shadow-card ring-1 ring-ink-200/60">
        <ol className="flex min-w-max gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title}>
                <button onClick={() => save(i)} className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition", i === step ? "bg-sky-600 text-white" : i < step ? "text-sky-700 hover:bg-sky-50" : "text-ink-500 hover:bg-ink-50")}>
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs", i === step ? "bg-white/20" : i < step ? "bg-sky-100" : "bg-ink-100")}>{i < step ? <Check size={13} /> : <Icon size={13} />}</span>
                  {s.title}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 md:p-8">
          <h2 className="mb-1 text-xl font-extrabold text-ink-900">{step + 1}. {STEPS[step].title}</h2>

          {step === 0 && (
            <div className="mt-5 space-y-5">
              <div className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">
                <BadgeCheck size={18} className="shrink-0" /> Akun dosen dibuat melalui undangan departemen dan sudah terverifikasi.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama lengkap dan gelar"><input className={cn(inputCls, "bg-ink-50 text-ink-500")} value={d.name} readOnly /></Field>
                <Field label="NIDN / NIDK"><input className={inputCls} value={d.nidn ?? ""} onChange={(e) => up({ nidn: e.target.value })} /></Field>
                <Field label="Jabatan fungsional">
                  <select className={cn(inputCls, "h-[42px]")} value={d.academicRank ?? ""} onChange={(e) => up({ academicRank: e.target.value as Person["academicRank"] })}>
                    <option value="">Pilih…</option>
                    {RANKS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Judul profil (headline)"><input className={inputCls} value={d.headline} onChange={(e) => up({ headline: e.target.value })} /></Field>
              </div>
              <Field label="Ringkasan profil" hint={`${d.bio.length}/500 karakter · fokus riset, capaian, dan bentuk kolaborasi yang Anda cari`}>
                <textarea className={inputCls} rows={4} maxLength={500} value={d.bio} onChange={(e) => up({ bio: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email institusi"><input className={inputCls} value={d.email} onChange={(e) => up({ email: e.target.value })} /></Field>
                <Field label="Nomor kantor / WhatsApp" hint="Hanya untuk civitas terverifikasi"><input className={inputCls} value={d.phone} onChange={(e) => up({ phone: e.target.value })} /></Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-5 space-y-6">
              <Field label="Bidang kepakaran" hint="Dipakai alumni dan mahasiswa untuk menemukan Anda">
                <Chips options={EXPERTISE} value={d.expertise ?? []} onChange={(v) => up({ expertise: v })} custom tone="violet" />
              </Field>
              <Field label="Kelompok riset / laboratorium"><input className={inputCls} value={d.researchGroup ?? ""} onChange={(e) => up({ researchGroup: e.target.value })} /></Field>
              <div>
                <p className="mb-2 text-sm font-semibold text-ink-700">Identitas akademik</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="SINTA ID"><input className={inputCls} value={d.sintaId ?? ""} onChange={(e) => up({ sintaId: e.target.value })} /></Field>
                  <Field label="Scopus Author ID"><input className={inputCls} value={d.scopusId ?? ""} onChange={(e) => up({ scopusId: e.target.value })} /></Field>
                  <Field label="Google Scholar"><input className={inputCls} placeholder="https://scholar.google.com/citations?user=…" value={d.scholarUrl ?? ""} onChange={(e) => up({ scholarUrl: e.target.value })} /></Field>
                  <Field label="ORCID"><input className={inputCls} placeholder="0000-0000-0000-0000" value={d.orcid ?? ""} onChange={(e) => up({ orcid: e.target.value })} /></Field>
                  <Field label="h-index (Scopus)"><input className={inputCls} type="number" value={d.hIndex ?? ""} onChange={(e) => up({ hIndex: e.target.value ? Number(e.target.value) : undefined })} /></Field>
                </div>
                <p className="mt-2 text-xs text-ink-400">Versi produksi dapat menarik publikasi otomatis dari SINTA/Scopus berdasarkan ID ini.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-ink-500">Tampilkan 3–5 publikasi pilihan yang paling relevan bagi calon mitra.</p>
              {pubs.map((p, i) => (
                <div key={i} className="grid gap-3 rounded-2xl p-4 ring-1 ring-ink-200 sm:grid-cols-[1fr_140px]">
                  <Field label="Judul" className="sm:col-span-2"><input className={inputCls} value={p.title} onChange={(e) => setPub(i, { title: e.target.value })} /></Field>
                  <Field label="Jurnal / prosiding"><input className={inputCls} value={p.venue} onChange={(e) => setPub(i, { venue: e.target.value })} /></Field>
                  <Field label="Tahun"><input className={inputCls} type="number" value={p.year} onChange={(e) => setPub(i, { year: Number(e.target.value) })} /></Field>
                  <Field label="Indeksasi">
                    <select className={cn(inputCls, "h-[42px]")} value={p.indexing} onChange={(e) => setPub(i, { indexing: e.target.value as Publication["indexing"] })}>
                      {INDEXING.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </Field>
                  <Field label="DOI / tautan"><input className={inputCls} value={p.url ?? ""} onChange={(e) => setPub(i, { url: e.target.value })} /></Field>
                  <button onClick={() => up({ publications: pubs.filter((_, j) => j !== i) })} className="flex items-center gap-1 text-xs font-semibold text-accent-red"><Trash2 size={13} /> Hapus</button>
                </div>
              ))}
              <Button variant="secondary" onClick={() => up({ publications: [...pubs, { title: "", venue: "", year: 2026, indexing: "Scopus Q2" }] })}><Plus size={16} /> Tambah publikasi</Button>
            </div>
          )}

          {step === 3 && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-ink-500">Riwayat hibah riset dan pengabdian kepada masyarakat. Mitra industri yang pernah terlibat ikut ditampilkan.</p>
              {grants.map((g, i) => (
                <div key={i} className="grid gap-3 rounded-2xl p-4 ring-1 ring-ink-200 sm:grid-cols-2">
                  <Field label="Judul kegiatan" className="sm:col-span-2"><input className={inputCls} value={g.title} onChange={(e) => setGrant(i, { title: e.target.value })} /></Field>
                  <Field label="Skema / pemberi dana"><input className={inputCls} value={g.scheme} onChange={(e) => setGrant(i, { scheme: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tahun"><input className={inputCls} type="number" value={g.year} onChange={(e) => setGrant(i, { year: Number(e.target.value) })} /></Field>
                    <Field label="Peran">
                      <select className={cn(inputCls, "h-[42px]")} value={g.role} onChange={(e) => setGrant(i, { role: e.target.value as Grant["role"] })}>
                        <option>Ketua</option><option>Anggota</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Mitra (bila ada)" className="sm:col-span-2"><input className={inputCls} value={g.partner ?? ""} onChange={(e) => setGrant(i, { partner: e.target.value })} /></Field>
                  <button onClick={() => up({ grants: grants.filter((_, j) => j !== i) })} className="flex items-center gap-1 text-xs font-semibold text-accent-red"><Trash2 size={13} /> Hapus</button>
                </div>
              ))}
              <Button variant="secondary" onClick={() => up({ grants: [...grants, { title: "", scheme: "", year: 2026, role: "Ketua" }] })}><Plus size={16} /> Tambah hibah / pengabdian</Button>
            </div>
          )}

          {step === 4 && (
            <div className="mt-5 space-y-6">
              <Field label="Mata kuliah yang diampu">
                <Chips options={["Kalkulus", "Aljabar Linear", "Statistika Matematika", "Matematika Keuangan", "Matematika Aktuaria", "Pemodelan dan Teori Risiko", "Pengantar Teori Optimasi", "Riset Operasi", "Analisis Numerik", "Pemrograman", "Data Sains"]} value={d.courses ?? []} onChange={(v) => up({ courses: v })} custom />
              </Field>
              <Field label="Topik bimbingan tugas akhir">
                <Chips options={d.expertise ?? []} value={d.supervisionTopics ?? []} onChange={(v) => up({ supervisionTopics: v })} custom tone="violet" />
              </Field>
              <Field label="Kuota mahasiswa bimbingan baru semester ini" hint="Ditampilkan ke mahasiswa yang sedang mencari pembimbing">
                <input className={cn(inputCls, "w-32")} type="number" min={0} value={d.supervisionSlots ?? 0} onChange={(e) => up({ supervisionSlots: Number(e.target.value) })} />
              </Field>
            </div>
          )}

          {step === 5 && (
            <div className="mt-5 space-y-6">
              <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-200">
                <p className="text-sm font-bold text-violet-900">Mitra alumni yang dicari</p>
                <p className="mb-3 text-xs text-violet-800/80">Alumni di sektor ini yang bersedia berkolaborasi akan disarankan di Dashboard Anda.</p>
                <Chips tone="violet" options={SECTORS.filter((s) => s !== "Pendidikan")} value={d.partnerSectorsSought ?? []} onChange={(v) => up({ partnerSectorsSought: v })} />
                <p className="mb-2 mt-4 text-xs font-semibold text-violet-900">Bentuk dukungan yang dibutuhkan</p>
                <Chips tone="violet" options={NEEDS} value={d.partnerNeeds ?? []} onChange={(v) => up({ partnerNeeds: v })} custom />
              </div>
              <div className="rounded-2xl p-4 ring-1 ring-ink-200">
                <Toggle checked={!!d.seekingAssistants} onChange={(v) => up({ seekingAssistants: v })} label="Sedang mencari asisten riset mahasiswa" desc="Mahasiswa yang bersedia menjadi asisten riset dengan keahlian berikut akan disarankan." />
                {d.seekingAssistants && (
                  <div className="pb-2">
                    <p className="mb-2 text-xs font-semibold text-ink-600">Keahlian yang dibutuhkan</p>
                    <Chips options={ALL_SKILLS} value={d.assistantSkills ?? []} onChange={(v) => up({ assistantSkills: v })} />
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="text-3xl font-extrabold text-sky-700">{partnerMatches}</p>
                  <p className="text-sm text-ink-600">alumni berpotensi menjadi mitra Anda</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="text-3xl font-extrabold text-sky-700">{d.seekingAssistants ? assistantMatches : "–"}</p>
                  <p className="text-sm text-ink-600">mahasiswa calon asisten riset yang cocok</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-5">
            <Button variant="ghost" disabled={step === 0} onClick={() => save(step - 1)}><ArrowLeft size={16} /> Sebelumnya</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => { save(step + 1); showToast("Tersimpan"); }}>Simpan &amp; lanjut <ArrowRight size={16} /></Button>
            ) : (
              <Button variant="sun" onClick={() => { save(); setDone(true); }}><Check size={16} /> Simpan profil</Button>
            )}
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EDF1F6" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke={score.score >= 80 ? "#10B981" : "#1A8FE3"} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(score.score / 100) * 97.4} 97.4`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-ink-900">{score.score}%</span>
              </div>
              <div>
                <p className="font-bold text-ink-900">Kelengkapan profil</p>
                <p className="text-xs text-ink-500">Profil lengkap lebih sering muncul di pencarian mitra.</p>
              </div>
            </div>
            {score.missing.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {score.missing.slice(0, 5).map((m) => (
                  <li key={m} className="flex items-center gap-2 text-ink-500"><span className="h-1.5 w-1.5 rounded-full bg-sun-500" /> {m}</li>
                ))}
              </ul>
            )}
          </Card>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400"><Sparkles size={13} /> Pratinjau ringkas</p>
            <Card className="p-5">
              <p className="font-bold text-ink-900">{d.name}</p>
              <p className="text-sm text-ink-500">{d.academicRank ? `${d.academicRank} · ` : ""}{d.researchGroup}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{(d.expertise ?? []).slice(0, 4).map((e) => <Badge key={e} tone="violet">{e}</Badge>)}</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[["Publikasi", pubs.length], ["Scopus", q], ["Hibah", grants.length]].map(([l, v]) => (
                  <div key={l as string} className="rounded-xl bg-ink-50 p-2">
                    <p className="text-lg font-extrabold text-sky-700">{v}</p>
                    <p className="text-[11px] text-ink-500">{l}</p>
                  </div>
                ))}
              </div>
              {(d.supervisionSlots ?? 0) > 0 && <p className="mt-3 text-xs font-semibold text-emerald-700">Menerima {d.supervisionSlots} mahasiswa bimbingan baru</p>}
              {d.seekingAssistants && <p className="mt-1 text-xs font-semibold text-violet-700">Sedang mencari asisten riset</p>}
            </Card>
          </div>
        </div>
      </div>

      <Modal open={done} onClose={() => setDone(false)} title="Profil dosen tersimpan">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Check size={28} /></div>
          <p className="text-lg font-bold text-ink-900">Kelengkapan profil {score.score}%</p>
          <p className="mt-1 text-sm text-ink-500">Ada {partnerMatches} alumni berpotensi menjadi mitra riset Anda{d.seekingAssistants ? ` dan ${assistantMatches} mahasiswa calon asisten riset` : ""}.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => router.push("/kemitraan")}>Cari mitra sekarang</Button>
            <Button variant="secondary" onClick={() => router.push(`/profil/${me.id}`)}>Lihat profil saya</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
