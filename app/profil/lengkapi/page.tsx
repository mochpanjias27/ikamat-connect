"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Check,
  FileText,
  FolderGit2,
  GraduationCap,
  Lock,
  Plus,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import {
  ALL_CERTS,
  ALL_ROLES,
  ALL_SKILLS,
  COLLAB_LABEL,
  CollabType,
  Experience,
  Person,
  PROVINCES,
  SECTORS,
  TRACKS,
  Visibility,
  completeness,
  stageLabel,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { PersonCard, RoleGate } from "@/components/cards";
import { Badge, Button, Card, Modal, Toggle, cn, inputCls } from "@/components/ui";
import { LecturerWizard } from "@/components/LecturerWizard";
import { PhotoUpload } from "@/components/PhotoUpload";

const STEPS = [
  { key: "diri", title: "Data diri", icon: UserRound },
  { key: "pendidikan", title: "Pendidikan", icon: GraduationCap },
  { key: "pengalaman", title: "Pengalaman", icon: Briefcase },
  { key: "keahlian", title: "Keahlian & sertifikasi", icon: Award },
  { key: "portofolio", title: "Portofolio & CV", icon: FolderGit2 },
  { key: "preferensi", title: "Preferensi karier & riset", icon: Target },
  { key: "privasi", title: "Privasi & tinjau", icon: Shield },
] as const;

const EXP_KIND: { v: NonNullable<Experience["kind"]>; l: string }[] = [
  { v: "kerja", l: "Pekerjaan" },
  { v: "magang", l: "Magang" },
  { v: "asisten", l: "Asisten dosen/praktikum" },
  { v: "riset", l: "Proyek riset" },
  { v: "organisasi", l: "Organisasi/kepanitiaan" },
];

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-sm font-semibold text-ink-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

function ChipPicker({ options, value, onChange, allowCustom, placeholder, tone = "sky" }: { options: string[]; value: string[]; onChange: (v: string[]) => void; allowCustom?: boolean; placeholder?: string; tone?: "sky" | "violet" }) {
  const [custom, setCustom] = useState("");
  const all = Array.from(new Set([...options, ...value]));
  const on = tone === "violet" ? "bg-violet-600 text-white ring-violet-600" : "bg-sky-600 text-white ring-sky-600";
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {all.map((o) => {
          const active = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(active ? value.filter((x) => x !== o) : [...value, o])}
              className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition", active ? on : "bg-white text-ink-600 ring-ink-200 hover:bg-sky-50")}
            >
              {active && "✓ "}
              {o}
            </button>
          );
        })}
      </div>
      {allowCustom && (
        <div className="mt-2 flex gap-2">
          <input
            className={cn(inputCls, "h-9 py-1")}
            value={custom}
            placeholder={placeholder ?? "Tambah lainnya…"}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.trim()) {
                e.preventDefault();
                onChange([...value, custom.trim()]);
                setCustom("");
              }
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => {
              if (!custom.trim()) return;
              onChange([...value, custom.trim()]);
              setCustom("");
            }}
          >
            <Plus size={14} /> Tambah
          </Button>
        </div>
      )}
    </div>
  );
}

function FakeUpload({ label, file, onFile, accept }: { label: string; file?: string; onFile: (name: string) => void; accept: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-5 transition hover:border-sky-400 hover:bg-sky-50">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">{file ? <FileText size={22} /> : <Upload size={22} />}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-800">{file ?? label}</p>
        <p className="text-xs text-ink-500">{file ? "Tersimpan di penyimpanan privat · klik untuk mengganti" : "PDF maksimal 5 MB · disimpan privat, tidak pernah publik"}</p>
      </div>
      {file && <Badge tone="green">Terunggah</Badge>}
      <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0].name)} />
    </label>
  );
}

export default function LengkapiProfil() {
  const { me, updatePerson, showToast, role } = useStore();
  const router = useRouter();
  const [d, setD] = useState<Person | null>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (me && !d) {
      setD({ ...me });
      setConsent(me.catalogConsent);
    }
  }, [me, d]);

  const score = useMemo(() => (d ? completeness(d) : { score: 0, missing: [] as string[] }), [d]);

  if (me && me.stage === "academic") {
    return (
      <RoleGate allow={["lecturer"]} title="Lengkapi profil dosen">
        <LecturerWizard me={me} />
      </RoleGate>
    );
  }

  if (!me || !d) {
    return (
      <RoleGate allow={["student", "alumni", "lecturer"]} title="Lengkapi profil civitas">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-ink-400">Memuat profil…</div>
      </RoleGate>
    );
  }

  const up = (patch: Partial<Person>) => setD({ ...d, ...patch });
  const isStudent = d.stage === "student";
  const T = TRACKS[d.track];

  const save = (next?: number) => {
    const patch: Partial<Person> = { ...d, catalogConsent: d.visibility === "recruiters" && consent, profileCompleteness: score.score };
    updatePerson(me.id, patch);
    if (typeof next === "number") {
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const setExp = (i: number, patch: Partial<Experience>) => up({ experience: d.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  return (
    <RoleGate allow={["student", "alumni"]} title="Lengkapi profil civitas">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-sky-600">Profiling civitas</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">Lengkapi profil Anda</h1>
            <p className="mt-2 max-w-2xl text-ink-500">
              Profil yang lengkap membuat Anda mudah ditemukan alumni yang merekrut, dosen yang mencari {isStudent ? "asisten riset" : "mitra riset"}, dan HRD yang mencari kandidat.
            </p>
          </div>
          <div className="flex gap-2"><Button variant="ghost" href="/saya">Privasi &amp; notifikasi</Button><Button variant="secondary" href={`/profil/${me.id}`}>Lihat profil saya</Button></div>
        </div>

        {/* Stepper */}
        <div className="mb-6 overflow-x-auto rounded-2xl bg-white p-2 shadow-card ring-1 ring-ink-200/60">
          <ol className="flex min-w-max gap-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => save(i)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      i === step ? "bg-sky-600 text-white" : i < step ? "text-sky-700 hover:bg-sky-50" : "text-ink-500 hover:bg-ink-50"
                    )}
                  >
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs", i === step ? "bg-white/20" : i < step ? "bg-sky-100" : "bg-ink-100")}>
                      {i < step ? <Check size={13} /> : <Icon size={13} />}
                    </span>
                    {s.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="p-6 md:p-8">
            <h2 className="mb-1 text-xl font-extrabold text-ink-900">
              {step + 1}. {STEPS[step].title}
            </h2>

            {/* STEP 1 */}
            {step === 0 && (
              <div className="mt-5 space-y-5">
                <div className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">
                  <BadgeCheck size={18} className="shrink-0" />
                  <span>
                    Nama dan status <b>{stageLabel(d)}</b> sudah diverifikasi dari data departemen. Hubungi moderator bila ada kesalahan.
                  </span>
                </div>
                <PhotoUpload name={d.name} value={d.photo} onChange={(v) => up({ photo: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nama lengkap">
                    <input className={cn(inputCls, "bg-ink-50 text-ink-500")} value={d.name} readOnly />
                  </Field>
                  <Field label="Judul profil (headline)" hint="Contoh: Data Analyst · tertarik risiko kredit">
                    <input className={inputCls} value={d.headline} onChange={(e) => up({ headline: e.target.value })} />
                  </Field>
                </div>
                <Field label="Ringkasan diri" hint={`${d.bio.length}/400 karakter · ceritakan fokus, pencapaian, dan apa yang Anda cari`}>
                  <textarea className={inputCls} rows={4} maxLength={400} value={d.bio} onChange={(e) => up({ bio: e.target.value })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kota domisili">
                    <input className={inputCls} value={d.city} onChange={(e) => up({ city: e.target.value })} />
                  </Field>
                  <Field label="Provinsi">
                    <select className={cn(inputCls, "h-[42px]")} value={d.province} onChange={(e) => up({ province: e.target.value })}>
                      {PROVINCES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Email kontak" hint="Tidak pernah ditampilkan ke HRD sebelum Anda setuju">
                    <input className={inputCls} type="email" value={d.email} onChange={(e) => up({ email: e.target.value })} />
                  </Field>
                  <Field label="Nomor HP / WhatsApp" hint="Disimpan terenkripsi">
                    <input className={inputCls} value={d.phone} onChange={(e) => up({ phone: e.target.value })} />
                  </Field>
                  <Field label="LinkedIn" className="sm:col-span-2">
                    <input className={inputCls} placeholder="https://linkedin.com/in/nama-anda" value={d.linkedin ?? ""} onChange={(e) => up({ linkedin: e.target.value })} />
                  </Field>
                </div>
                <Field label="Bahasa yang dikuasai">
                  <ChipPicker options={["Indonesia", "Inggris", "Sunda", "Jepang", "Mandarin", "Arab", "Jerman"]} value={d.languages ?? ["Indonesia"]} onChange={(v) => up({ languages: v })} allowCustom />
                </Field>
              </div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <div className="mt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Program">
                    <select className={cn(inputCls, "h-[42px]")} value={d.program} onChange={(e) => up({ program: e.target.value as Person["program"] })}>
                      <option value="S1">S1 Matematika</option>
                      <option value="S2">S2 Matematika</option>
                      <option value="S3">S3 Matematika</option>
                    </select>
                  </Field>
                  <Field label="NPM">
                    <input className={cn(inputCls, "bg-ink-50 text-ink-500")} value={d.npm} readOnly />
                  </Field>
                  <Field label="Angkatan">
                    <input className={inputCls} type="number" value={d.entryYear} onChange={(e) => up({ entryYear: Number(e.target.value) })} />
                  </Field>
                  <Field label={isStudent ? "Perkiraan lulus" : "Bulan & tahun lulus"}>
                    <input className={inputCls} type="month" value={d.gradDate ?? ""} onChange={(e) => up({ gradDate: e.target.value || undefined })} />
                  </Field>
                  <Field label={isStudent ? "Judul/topik tugas akhir (bila sudah ada)" : "Judul tugas akhir"} className="sm:col-span-2">
                    <input className={inputCls} value={d.thesis ?? ""} onChange={(e) => up({ thesis: e.target.value })} />
                  </Field>
                </div>
                <Field label="Prestasi, beasiswa, dan kompetisi" hint="Satu per baris, misalnya: Juara 2 ONMIPA Matematika 2024">
                  <textarea
                    className={inputCls}
                    rows={4}
                    value={(d.achievements ?? []).join("\n")}
                    onChange={(e) => up({ achievements: e.target.value.split("\n") })}
                    placeholder={"Juara 2 Kompetisi Data Science Nasional 2025\nPenerima beasiswa PPA 2023"}
                  />
                </Field>
              </div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-ink-500">Termasuk magang, asisten praktikum, proyek riset, dan organisasi. Pengalaman non-kerja tetap bernilai bagi perekrut.</p>
                {d.experience.length === 0 && <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">Belum ada pengalaman. Tambahkan minimal satu.</p>}
                {d.experience.map((e, i) => (
                  <div key={i} className="rounded-2xl p-4 ring-1 ring-ink-200">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Posisi / peran">
                        <input className={inputCls} value={e.title} onChange={(ev) => setExp(i, { title: ev.target.value })} />
                      </Field>
                      <Field label="Instansi / organisasi">
                        <input className={inputCls} value={e.company} onChange={(ev) => setExp(i, { company: ev.target.value })} />
                      </Field>
                      <Field label="Jenis">
                        <select className={cn(inputCls, "h-[42px]")} value={e.kind ?? "kerja"} onChange={(ev) => setExp(i, { kind: ev.target.value as Experience["kind"] })}>
                          {EXP_KIND.map((k) => (
                            <option key={k.v} value={k.v}>{k.l}</option>
                          ))}
                        </select>
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Mulai">
                          <input className={inputCls} type="number" value={e.start} onChange={(ev) => setExp(i, { start: Number(ev.target.value) })} />
                        </Field>
                        <Field label="Selesai" hint="Kosongkan bila masih">
                          <input className={inputCls} type="number" value={e.end ?? ""} onChange={(ev) => setExp(i, { end: ev.target.value ? Number(ev.target.value) : undefined })} />
                        </Field>
                      </div>
                      <Field label="Uraian singkat" className="sm:col-span-2">
                        <textarea className={inputCls} rows={2} value={e.desc ?? ""} onChange={(ev) => setExp(i, { desc: ev.target.value })} placeholder="Apa yang Anda kerjakan dan hasilnya" />
                      </Field>
                    </div>
                    <button onClick={() => up({ experience: d.experience.filter((_, j) => j !== i) })} className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent-red">
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => up({ experience: [...d.experience, { title: "", company: "", start: 2026, kind: isStudent ? "magang" : "kerja" }] })}>
                  <Plus size={16} /> Tambah pengalaman
                </Button>
              </div>
            )}

            {/* STEP 4 */}
            {step === 3 && (
              <div className="mt-5 space-y-6">
                <div>
                  <p className="mb-1 text-sm font-semibold text-ink-700">Keahlian <span className="font-normal text-ink-400">({d.skills.length} dipilih · disarankan 3–10)</span></p>
                  <p className="mb-3 text-xs text-ink-400">Taksonomi terkurasi agar mudah dicari. Keahlian di luar daftar ditinjau moderator.</p>
                  <ChipPicker options={ALL_SKILLS} value={d.skills} onChange={(v) => up({ skills: v })} allowCustom placeholder="Keahlian lain, misalnya Stata" />
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold text-ink-700">Sertifikasi</p>
                  <div className="space-y-3">
                    {d.certs.map((c, i) => (
                      <div key={i} className="rounded-2xl p-4 ring-1 ring-ink-200">
                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_110px]">
                          <Field label="Nama sertifikasi">
                            <input list="cert-list" className={inputCls} value={c.name} onChange={(e) => up({ certs: d.certs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                          </Field>
                          <Field label="Penerbit">
                            <input className={inputCls} value={c.issuer} onChange={(e) => up({ certs: d.certs.map((x, j) => (j === i ? { ...x, issuer: e.target.value } : x)) })} />
                          </Field>
                          <Field label="Tahun">
                            <input className={inputCls} type="number" value={c.year} onChange={(e) => up({ certs: d.certs.map((x, j) => (j === i ? { ...x, year: Number(e.target.value) } : x)) })} />
                          </Field>
                          <Field label="Tautan kredensial" className="sm:col-span-2">
                            <input className={inputCls} placeholder="https://…" value={c.credentialUrl ?? ""} onChange={(e) => up({ certs: d.certs.map((x, j) => (j === i ? { ...x, credentialUrl: e.target.value } : x)) })} />
                          </Field>
                          <div className="flex items-end">
                            {c.verified ? (
                              <Badge tone="green">✓ Terverifikasi</Badge>
                            ) : c.evidence ? (
                              <Badge tone="sun">Menunggu cek</Badge>
                            ) : (
                              <label className="cursor-pointer text-xs font-semibold text-sky-600">
                                Unggah bukti
                                <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => e.target.files?.[0] && up({ certs: d.certs.map((x, j) => (j === i ? { ...x, evidence: e.target.files![0].name } : x)) })} />
                              </label>
                            )}
                          </div>
                        </div>
                        <button onClick={() => up({ certs: d.certs.filter((_, j) => j !== i) })} className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent-red">
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    ))}
                    <datalist id="cert-list">
                      {ALL_CERTS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <Button variant="secondary" onClick={() => up({ certs: [...d.certs, { name: "", issuer: "", year: 2026, verified: false }] })}>
                      <Plus size={16} /> Tambah sertifikasi
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-ink-400">Sertifikat dengan bukti akan diperiksa moderator dan mendapat lencana terverifikasi, yang lebih dipercaya HRD.</p>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 4 && (
              <div className="mt-5 space-y-6">
                <Field label="Curriculum Vitae (CV)">
                  <FakeUpload label="Unggah CV terbaru" file={d.cvFile} accept=".pdf" onFile={(n) => up({ cvFile: n })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="GitHub / GitLab">
                    <input className={inputCls} placeholder="https://github.com/nama" value={d.github ?? ""} onChange={(e) => up({ github: e.target.value })} />
                  </Field>
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-ink-700">Portofolio & publikasi</p>
                  <p className="mb-3 text-xs text-ink-400">Proyek, dasbor, notebook Kaggle, artikel ilmiah, atau poster riset.</p>
                  <div className="space-y-3">
                    {(d.portfolio ?? []).map((pf, i) => (
                      <div key={i} className="grid gap-3 rounded-2xl p-4 ring-1 ring-ink-200 sm:grid-cols-2">
                        <Field label="Judul">
                          <input className={inputCls} value={pf.title} onChange={(e) => up({ portfolio: d.portfolio!.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                        </Field>
                        <Field label="Tautan">
                          <input className={inputCls} value={pf.url} onChange={(e) => up({ portfolio: d.portfolio!.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
                        </Field>
                        <Field label="Deskripsi singkat" className="sm:col-span-2">
                          <input className={inputCls} value={pf.desc} onChange={(e) => up({ portfolio: d.portfolio!.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)) })} />
                        </Field>
                        <button onClick={() => up({ portfolio: d.portfolio!.filter((_, j) => j !== i) })} className="flex items-center gap-1 text-xs font-semibold text-accent-red">
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={() => up({ portfolio: [...(d.portfolio ?? []), { title: "", url: "", desc: "" }] })}>
                      <Plus size={16} /> Tambah portofolio
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6 */}
            {step === 5 && (
              <div className="mt-5 space-y-6">
                <div className="divide-y divide-ink-100 rounded-2xl px-4 ring-1 ring-ink-200">
                  {isStudent ? (
                    <Toggle checked={d.seekingInternship} onChange={(v) => up({ seekingInternship: v })} label="Sedang mencari magang" desc="Anda menerima email lowongan magang yang sesuai." />
                  ) : (
                    <Toggle checked={d.openToWork} onChange={(v) => up({ openToWork: v })} label="Open to Work" desc="Anda menerima email lowongan kerja yang relevan." />
                  )}
                  <Toggle checked={d.openToProject} onChange={(v) => up({ openToProject: v })} label="Open to Project" desc="Terbuka untuk proyek lepas atau konsultansi." />
                </div>
                <Field label="Peran yang diminati">
                  <ChipPicker options={[...T.titles, ...ALL_ROLES.filter((r) => !T.titles.includes(r)).slice(0, 8)]} value={d.preferredRoles ?? []} onChange={(v) => up({ preferredRoles: v })} allowCustom />
                </Field>
                <Field label="Sektor yang diminati">
                  <ChipPicker options={SECTORS} value={d.preferredSectors ?? []} onChange={(v) => up({ preferredSectors: v })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mode kerja">
                    <ChipPicker options={["Onsite", "Hybrid", "Remote"]} value={d.workModes ?? []} onChange={(v) => up({ workModes: v as Person["workModes"] })} />
                  </Field>
                  <Field label="Siap mulai">
                    <input className={inputCls} type="month" value={d.availableFrom ?? ""} onChange={(e) => up({ availableFrom: e.target.value })} />
                  </Field>
                </div>
                <Field label="Lokasi kerja yang diinginkan">
                  <ChipPicker options={["Bandung", "Jakarta", "Sumedang", "Bekasi", "Tangerang", "Surabaya", "Yogyakarta"]} value={d.preferredLocations ?? []} onChange={(v) => up({ preferredLocations: v })} allowCustom />
                </Field>
                <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-200">
                  <p className="text-sm font-bold text-violet-900">{isStudent ? "Keterlibatan dalam riset dosen" : "Kontribusi untuk almamater"}</p>
                  <p className="mb-3 text-xs text-violet-800/80">
                    {isStudent ? "Dosen dapat menemukan Anda di Hub Kemitraan saat membutuhkan asisten riset." : "Dosen dapat menemukan Anda di Hub Kemitraan untuk riset, hibah, dan perkuliahan."}
                  </p>
                  <ChipPicker
                    tone="violet"
                    options={(isStudent ? ["research_assistant"] : ["research_partner", "speaker", "guest_lecturer", "mentor", "internship_host"]).map((c) => COLLAB_LABEL[c as CollabType])}
                    value={d.collab.map((c) => COLLAB_LABEL[c])}
                    onChange={(labels) => up({ collab: (Object.keys(COLLAB_LABEL) as CollabType[]).filter((k) => labels.includes(COLLAB_LABEL[k])) })}
                  />
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-violet-900">Topik riset yang diminati</p>
                    <ChipPicker tone="violet" options={["Matematika Keuangan", "Aktuaria", "Manajemen Risiko", "Data Sains", "Riset Operasi", "Pemodelan Epidemi", "Kriptografi", "Pendidikan Matematika"]} value={d.researchTopics ?? []} onChange={(v) => up({ researchTopics: v })} allowCustom />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7 */}
            {step === 6 && (
              <div className="mt-5 space-y-5">
                <p className="text-sm text-ink-500">Tentukan siapa yang dapat melihat profil Anda. Pengaturan bisa diubah kapan saja di Profil Saya.</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {([
                    ["private", "Privat", "Hanya Anda dan admin"],
                    ["internal", "Jaringan internal", "Mahasiswa, dosen, alumni terverifikasi"],
                    ["recruiters", "Internal + Katalog HRD", "Juga tampil ke HRD, tanpa kontak"],
                  ] as [Visibility, string, string][]).map(([v, t, desc]) => (
                    <button key={v} onClick={() => up({ visibility: v })} className={cn("rounded-2xl p-4 text-left ring-1 transition", d.visibility === v ? "bg-sky-50 ring-2 ring-sky-500" : "ring-ink-200 hover:bg-ink-50")}>
                      <p className="font-semibold text-ink-800">{t}</p>
                      <p className="mt-1 text-xs text-ink-500">{desc}</p>
                    </button>
                  ))}
                </div>
                {d.visibility === "recruiters" && (
                  <label className="flex gap-3 rounded-2xl bg-sun-50 p-4 text-sm text-ink-700 ring-1 ring-sun-200">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink-300 text-sky-600" />
                    <span>
                      Saya menyetujui profil saya (nama, keahlian, sertifikasi, pendidikan, dan sektor kerja) ditampilkan di <b>Katalog Talenta</b> untuk HRD terverifikasi. Email, nomor HP, dan CV hanya dibuka bila saya menerima permintaan kontak. Persetujuan dapat ditarik kapan saja.
                    </span>
                  </label>
                )}
                <div className="rounded-2xl bg-ink-50 p-4">
                  <p className="text-sm font-bold text-ink-800">Ringkasan profil</p>
                  <ul className="mt-2 grid gap-1 text-sm text-ink-600 sm:grid-cols-2">
                    <li>• {d.experience.length} pengalaman</li>
                    <li>• {d.skills.length} keahlian</li>
                    <li>• {d.certs.length} sertifikasi</li>
                    <li>• {(d.portfolio ?? []).length} portofolio</li>
                    <li>• CV: {d.cvFile ? "terunggah" : "belum"}</li>
                    <li>• Status: {isStudent ? (d.seekingInternship ? "mencari magang" : "tidak mencari magang") : d.openToWork ? "Open to Work" : "tidak mencari kerja"}</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-5">
              <Button variant="ghost" disabled={step === 0} onClick={() => save(step - 1)}>
                <ArrowLeft size={16} /> Sebelumnya
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => { save(step + 1); showToast("Tersimpan"); }}>
                  Simpan &amp; lanjut <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  variant="sun"
                  disabled={d.visibility === "recruiters" && !consent}
                  onClick={() => {
                    save();
                    setDone(true);
                  }}
                >
                  <Check size={16} /> Simpan profil
                </Button>
              )}
            </div>
          </Card>

          {/* Sidebar: skor + pratinjau */}
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
                  <p className="text-xs text-ink-500">{score.score >= 80 ? "Siap ditemukan perekrut dan dosen." : "Profil di atas 80% muncul lebih atas di pencarian."}</p>
                </div>
              </div>
              {score.missing.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm">
                  {score.missing.slice(0, 5).map((m) => (
                    <li key={m} className="flex items-center gap-2 text-ink-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-sun-500" /> {m}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
                <Sparkles size={13} /> Pratinjau kartu Anda di direktori
              </p>
              <PersonCard p={d} noLink showCollab />
            </div>
            {d.visibility === "recruiters" && consent && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
                  <Lock size={13} /> Yang dilihat tamu di katalog
                </p>
                <PersonCard p={d} masked />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={done} onClose={() => setDone(false)} title="Profil tersimpan">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Check size={28} />
          </div>
          <p className="text-lg font-bold text-ink-900">Kelengkapan profil {score.score}%</p>
          <p className="mt-1 text-sm text-ink-500">
            {isStudent
              ? "Anda kini bisa ditemukan alumni yang membuka magang dan dosen yang mencari asisten riset."
              : "Anda kini bisa ditemukan alumni yang merekrut, dosen yang mencari mitra, dan HRD (bila diizinkan)."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => router.push(`/profil/${me.id}`)}>Lihat profil saya</Button>
            <Button variant="secondary" onClick={() => router.push("/lowongan")}>
              Lowongan yang cocok
            </Button>
          </div>
        </div>
      </Modal>
      {role === "guest" && null}
    </RoleGate>
  );
}
