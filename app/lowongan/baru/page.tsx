"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, Mail, Send, Sparkles } from "lucide-react";
import {
  ALL_SKILLS,
  AUDIENCE_LABEL,
  Audience,
  CATEGORY_LABEL,
  Job,
  JobCategory,
  JobLevel,
  LEVEL_LABEL,
  PERSONAS,
  defaultTargets,
  resolveAudience,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/components/cards";
import { DispatchModal, splitByPreference } from "@/components/DispatchModal";
import { Button, Card, PageHeader, Select, Toggle, cn, inputCls } from "@/components/ui";

const AUDIENCES: Audience[] = ["active_students", "fresh_graduates", "open_to_work", "open_to_project", "research_partners"];

export default function PostJob() {
  const { role, me, people, addJob, showToast } = useStore();
  const router = useRouter();
  const [title, setTitle] = useState("Magang Analis Risiko Kredit");
  const [company, setCompany] = useState(role === "recruiter" ? "PT Arunika Data Nusantara" : me?.company ?? "Bank Sentosa Raya");
  const [category, setCategory] = useState<JobCategory>("internship");
  const [level, setLevel] = useState<JobLevel>("entry");
  const [workMode, setWorkMode] = useState<Job["workMode"]>("Hybrid");
  const [location, setLocation] = useState("Jakarta Pusat");
  const [deadline, setDeadline] = useState("2026-12-15");
  const [desc, setDesc] = useState("Program magang 6 bulan di divisi manajemen risiko. Anda akan membantu tim membangun dan memvalidasi model skor kredit untuk segmen UMKM.");
  const [req, setReq] = useState("Mahasiswa S1 Matematika semester 6 ke atas\nMenguasai Python atau R\nMemahami statistika dan regresi logistik");
  const [skills, setSkills] = useState<string[]>(["Python", "Pemodelan Kredit", "Statistika"]);
  const [targets, setTargets] = useState<Audience[]>(defaultTargets("internship", "entry"));
  const [custom, setCustom] = useState(false);
  const [skillFilter, setSkillFilter] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [dispatchJob, setDispatchJob] = useState<Job | null>(null);

  const changeKind = (c: JobCategory, l: JobLevel) => {
    setCategory(c);
    setLevel(l);
    if (!custom) setTargets(defaultTargets(c, l));
  };

  const draft = useMemo(() => ({ targets, skills, skillFilter, level, category }), [targets, skills, skillFilter, level, category]);
  const res = resolveAudience(draft, people);
  const split = splitByPreference(res.recipients);
  const trusted = role === "alumni" || role === "admin" || role === "lecturer";

  const submit = () => {
    const P = PERSONAS[role];
    const job: Job = {
      id: `n${Date.now()}`,
      title,
      company,
      posterId: me?.id,
      posterName: P.name,
      category,
      level,
      workMode,
      location,
      postedAt: "2026-11-03",
      deadline,
      description: desc,
      requirements: req.split("\n").map((s) => s.trim()).filter(Boolean),
      skills,
      targets,
      skillFilter,
      status: trusted ? "published" : "pending_review",
      isPublic,
      stats: { views: 0, clicks: 0, sent: trusted ? split.instant.length : 0 },
    };
    addJob(job);
    if (trusted) setDispatchJob(job);
    else {
      showToast("Lowongan dikirim ke antrean moderasi. Email terkirim otomatis setelah disetujui moderator.");
      router.push("/dasbor");
    }
  };

  return (
    <RoleGate allow={["alumni", "recruiter", "lecturer", "admin"]} title="Posting lowongan khusus alumni, dosen, dan HRD terverifikasi">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Posting lowongan"
          title="Bagikan kesempatan ke orang yang tepat"
          desc="Isi formulir sekali. Sistem menentukan penerima email berdasarkan kategori lowongan, status akun, dan keahlian. Formulir sudah terisi contoh agar mudah didemokan."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-semibold text-ink-700">Judul posisi</span>
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink-700">Perusahaan / instansi</span>
                <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink-700">Lokasi</span>
                <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} />
              </label>
              <Select label="Kategori" value={category} onChange={(v) => changeKind(v as JobCategory, level)} options={(Object.keys(CATEGORY_LABEL) as JobCategory[]).map((k) => ({ value: k, label: CATEGORY_LABEL[k] }))} />
              <Select label="Level" value={level} onChange={(v) => changeKind(category, v as JobLevel)} options={(Object.keys(LEVEL_LABEL) as JobLevel[]).map((k) => ({ value: k, label: LEVEL_LABEL[k] }))} />
              <Select label="Mode kerja" value={workMode} onChange={(v) => setWorkMode(v as Job["workMode"])} options={["Onsite", "Hybrid", "Remote"].map((k) => ({ value: k, label: k }))} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Batas lamaran</span>
                <input type="date" className={cn(inputCls, "h-10 py-0")} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Deskripsi pekerjaan</span>
              <textarea className={inputCls} rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Kualifikasi (satu per baris)</span>
              <textarea className={inputCls} rows={3} value={req} onChange={(e) => setReq(e.target.value)} />
            </label>
            <div>
              <span className="mb-2 block text-sm font-semibold text-ink-700">Keahlian yang dicari</span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SKILLS.map((s) => {
                  const on = skills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSkills(on ? skills.filter((x) => x !== s) : [...skills, s])}
                      className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition", on ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-ink-600 ring-ink-200 hover:bg-sky-50")}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl bg-ink-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink-800">Target penerima email</p>
                <button className="text-xs font-semibold text-sky-600" onClick={() => { setCustom(false); setTargets(defaultTargets(category, level)); }}>
                  Kembalikan ke aturan bawaan
                </button>
              </div>
              <p className="mt-0.5 text-xs text-ink-500">Terisi otomatis sesuai kategori &amp; level. Boleh ditambah atau dikurangi.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {AUDIENCES.map((a) => (
                  <label key={a} className={cn("flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm ring-1", targets.includes(a) ? "ring-sky-400" : "ring-ink-200")}>
                    <input
                      type="checkbox"
                      checked={targets.includes(a)}
                      onChange={(e) => {
                        setCustom(true);
                        setTargets(e.target.checked ? [...targets, a] : targets.filter((x) => x !== a));
                      }}
                      className="h-4 w-4 rounded border-ink-300 text-sky-600"
                    />
                    {AUDIENCE_LABEL[a]}
                  </label>
                ))}
              </div>
              <Toggle checked={skillFilter} onChange={setSkillFilter} label="Kirim hanya ke yang punya minimal satu keahlian di atas" desc="Lebih tepat sasaran, jumlah penerima lebih sedikit." />
              <Toggle checked={isPublic} onChange={setIsPublic} label="Tampilkan juga di halaman lowongan publik" desc="Bisa dilihat pengunjung tanpa login." />
            </div>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
            <Card className="overflow-hidden">
              <div className="bg-sky-950 p-5 text-white">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sun-300"><Sparkles size={14} /> Perkiraan penerima</p>
                <p className="mt-2 text-5xl font-extrabold">{split.instant.length}</p>
                <p className="text-sm text-sky-100/80">email langsung terkirim saat terbit</p>
              </div>
              <div className="space-y-2 p-5 text-sm">
                {res.segments.map((s) => (
                  <div key={s.audience} className="flex justify-between">
                    <span className="text-ink-600">{AUDIENCE_LABEL[s.audience]}</span>
                    <span className="font-semibold">{s.count}</span>
                  </div>
                ))}
                {res.duplicatesMerged > 0 && <Row l="Duplikat digabung" v={-res.duplicatesMerged} />}
                {skillFilter && <Row l="Tanpa keahlian yang dicari" v={-res.removedBySkill} />}
                <Row l="Memilih digest mingguan" v={-split.digest.length} />
                <Row l="Berhenti langganan" v={-split.suppressed.length} />
                <div className="flex justify-between border-t border-ink-100 pt-2 font-bold">
                  <span>Dikirim sekarang</span>
                  <span className="text-sky-700">{split.instant.length}</span>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-800"><Eye size={16} className="text-sky-600" /> Privasi penerima</p>
              <p className="mt-1 text-sm text-ink-500">Anda hanya melihat jumlah. Daftar nama penerima tidak dibagikan ke pemosting.</p>
            </Card>
            <Button size="lg" className="w-full" onClick={submit} disabled={!title.trim() || targets.length === 0}>
              {trusted ? <><Mail size={18} /> Terbitkan &amp; kirim notifikasi</> : <><Send size={18} /> Kirim ke moderasi</>}
            </Button>
            {!trusted && <p className="text-center text-xs text-ink-500">Lowongan dari HRD eksternal ditinjau moderator sebelum terbit.</p>}
          </div>
        </div>
      </div>
      <DispatchModal
        job={dispatchJob}
        onClose={() => {
          const id = dispatchJob?.id;
          setDispatchJob(null);
          if (id) router.push(`/lowongan/${id}`);
        }}
      />
    </RoleGate>
  );
}

function Row({ l, v }: { l: string; v: number }) {
  return (
    <div className="flex justify-between text-ink-500">
      <span>{l}</span>
      <span>{v}</span>
    </div>
  );
}
