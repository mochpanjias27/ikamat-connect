"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, BookOpen, Briefcase, FileText, FolderGit2, GraduationCap, Lock, Mail, MapPin, Phone, Send } from "lucide-react";
import { COLLAB_LABEL, fmtDate, stageLabel } from "@/lib/data";
import { useStore } from "@/lib/store";
import { stageTone } from "@/components/cards";
import { ContactModal } from "@/components/ContactModal";
import { Avatar, Badge, Button, Card, Empty } from "@/components/ui";

export default function Profil() {
  const { id } = useParams<{ id: string }>();
  const { people, role, me, contactRequests, ready } = useStore();
  const [contact, setContact] = useState(false);
  const p = people.find((x) => x.id === id);
  if (!ready) return null;
  if (!p) return <div className="mx-auto max-w-3xl px-4 py-20"><Empty title="Profil tidak ditemukan" /></div>;

  const isMe = me?.id === p.id;
  const internal = ["student", "alumni", "lecturer", "admin"].includes(role);
  if (!isMe && !internal) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <Empty title="Profil lengkap hanya untuk civitas" desc="Tamu dan HRD melihat profil tersamar melalui Katalog Talenta." action={<Button href="/talenta">Buka Katalog Talenta</Button>} />
      </div>
    );
  }
  const accepted = contactRequests.some((c) => c.candidateId === p.id && c.status === "accepted");
  const showContact = isMe || role === "admin" || accepted;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/direktori" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700">
        <ArrowLeft size={16} /> Kembali ke direktori
      </Link>

      <Card className="mt-4 overflow-hidden">
        <div className="hero-grid h-28" />
        <div className="px-6 pb-6">
          <div className="-mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="rounded-full ring-4 ring-white">
                <Avatar name={p.name} size={96} />
              </div>
              <div className="pb-1">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
                  {p.name} {p.verified && <BadgeCheck size={20} className="text-sky-500" />}
                </h1>
                <p className="text-ink-500">{p.headline}</p>
              </div>
            </div>
            {!isMe && (
              <Button onClick={() => setContact(true)}>
                <Send size={16} /> Hubungi via platform
              </Button>
            )}
            {isMe && <Button href="/profil/lengkapi" variant="sun">Lengkapi / edit profil</Button>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={stageTone(p)}>{stageLabel(p)}</Badge>
            {p.roles.length > 1 && <Badge tone="violet">Juga alumni</Badge>}
            {p.openToWork && <Badge tone="green">Open to Work</Badge>}
            {p.openToProject && <Badge tone="sky">Open to Project</Badge>}
            {p.seekingInternship && <Badge tone="green">Mencari magang</Badge>}
            <span className="flex items-center gap-1 text-sm text-ink-500">
              <MapPin size={14} /> {p.city}, {p.province}
            </span>
          </div>
        </div>
      </Card>

      {p.stage === "academic" && (
        <p className="mt-4 rounded-xl bg-sun-50 px-4 py-3 text-sm text-ink-700 ring-1 ring-sun-200">
          Nama, pendidikan terakhir, dan ID akademik mengikuti daftar resmi dosen. Kepakaran, publikasi, hibah, dan isian profil lainnya masih <b>simulasi</b>.
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-bold text-ink-900">Tentang</h2>
            <p className="mt-2 text-ink-600">{p.bio}</p>
            {p.expertise && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Bidang kepakaran</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.expertise.map((e) => (
                    <Badge key={e} tone="violet">{e}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-ink-900">Riwayat</h2>
            <ol className="mt-4 space-y-5">
              {p.experience.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Briefcase size={18} /></div>
                  <div>
                    <p className="font-semibold text-ink-800">{e.title}</p>
                    <p className="text-sm text-ink-500">{e.company}</p>
                    <p className="text-xs text-ink-400">{e.start} – {e.end ?? "sekarang"}</p>
                    {e.desc && <p className="mt-1 text-sm text-ink-600">{e.desc}</p>}
                  </div>
                </li>
              ))}
              {p.stage === "academic" ? (
                <li className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun-100 text-sun-700"><GraduationCap size={18} /></div>
                  <div>
                    <p className="font-semibold text-ink-800">Dosen · Departemen Matematika FMIPA Unpad</p>
                    <p className="text-sm text-ink-500">Pendidikan terakhir {p.program === "S3" ? "S3 (Doktor)" : "S2 (Magister)"}{p.roles.includes("alumni") ? " · juga alumni Matematika Unpad" : ""}</p>
                  </div>
                </li>
              ) : (
                <li className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun-100 text-sun-700"><GraduationCap size={18} /></div>
                  <div>
                    <p className="font-semibold text-ink-800">{p.program} Matematika · FMIPA Unpad</p>
                    <p className="text-sm text-ink-500">
                      Angkatan {p.entryYear}
                      {p.gradDate ? ` · lulus ${fmtDate(p.gradDate)}` : p.stage === "student" ? " · sedang berjalan" : ""}
                    </p>
                    {p.thesis && <p className="mt-1 text-sm italic text-ink-600">&ldquo;{p.thesis}&rdquo;</p>}
                  </div>
                </li>
              )}
            </ol>
          </Card>

          {p.stage === "academic" && (p.publications?.length ?? 0) > 0 && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Publikasi pilihan</h2>
              <ul className="mt-4 space-y-4">
                {p.publications!.filter((x) => x.title).map((x, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><BookOpen size={18} /></div>
                    <div>
                      <p className="font-semibold text-ink-800">{x.title}</p>
                      <p className="text-sm text-ink-500">{x.venue} · {x.year}</p>
                      <Badge tone={x.indexing.startsWith("Scopus") ? "sky" : "gray"} className="mt-1">{x.indexing}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {p.stage === "academic" && (p.grants?.length ?? 0) > 0 && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Hibah & pengabdian</h2>
              <ul className="mt-4 space-y-3">
                {p.grants!.filter((x) => x.title).map((g, i) => (
                  <li key={i} className="rounded-xl bg-ink-50 p-4">
                    <p className="font-semibold text-ink-800">{g.title}</p>
                    <p className="text-sm text-ink-500">{g.scheme} · {g.year} · {g.role}{g.partner ? ` · mitra: ${g.partner}` : ""}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {((p.portfolio?.length ?? 0) > 0 || p.github || p.cvFile) && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Portofolio</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(p.portfolio ?? []).filter((x) => x.title).map((x, i) => (
                  <div key={i} className="rounded-xl bg-ink-50 p-4">
                    <p className="flex items-center gap-2 font-semibold text-ink-800"><FolderGit2 size={16} className="text-sky-600" /> {x.title}</p>
                    {x.desc && <p className="mt-1 text-sm text-ink-500">{x.desc}</p>}
                    {x.url && <p className="mt-1 truncate text-xs font-medium text-sky-600">{x.url}</p>}
                  </div>
                ))}
                {p.github && (
                  <div className="rounded-xl bg-ink-50 p-4">
                    <p className="font-semibold text-ink-800">GitHub</p>
                    <p className="mt-1 truncate text-xs font-medium text-sky-600">{p.github}</p>
                  </div>
                )}
                {p.cvFile && (
                  <div className="flex items-center gap-3 rounded-xl bg-sky-50 p-4">
                    <FileText size={20} className="text-sky-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-800">CV tersedia</p>
                      <p className="text-xs text-ink-500">{showContact ? p.cvFile : "Dibuka setelah permintaan kontak diterima"}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {(p.achievements ?? []).filter(Boolean).length > 0 && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Prestasi</h2>
              <ul className="mt-3 space-y-2 text-ink-600">
                {p.achievements!.filter(Boolean).map((a) => (
                  <li key={a} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" /> {a}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-bold text-ink-900">Keahlian</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <span key={s} className="rounded-lg bg-sky-50 px-2.5 py-1 text-sm font-medium text-sky-800">{s}</span>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold text-ink-900">Sertifikasi</h2>
            {p.certs.length ? (
              <ul className="mt-3 space-y-3">
                {p.certs.map((c) => (
                  <li key={c.name} className="rounded-xl bg-sun-50 p-3 ring-1 ring-sun-200">
                    <p className="text-sm font-semibold text-ink-800">{c.name}</p>
                    <p className="text-xs text-ink-500">{c.issuer} · {c.year}</p>
                    <p className={`mt-1 text-xs font-semibold ${c.verified ? "text-emerald-700" : "text-ink-400"}`}>
                      {c.verified ? "✓ Diverifikasi moderator" : "Dinyatakan sendiri"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-400">Belum ada sertifikasi.</p>
            )}
          </Card>
          {p.stage === "academic" && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Akademik</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {p.academicRank && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Jabatan fungsional</dt><dd className="text-ink-700">{p.academicRank}</dd></div>}
                {p.nidn && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">NIDN</dt><dd className="text-ink-700">{p.nidn}</dd></div>}
                {p.researchGroup && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Kelompok riset</dt><dd className="text-ink-700">{p.researchGroup}</dd></div>}
                {(p.sintaId || p.scopusId) && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">ID akademik</dt>
                    <dd className="flex flex-wrap gap-x-3 text-ink-700">
                      {p.sintaId && <span>SINTA {p.sintaId}</span>}
                      {p.scopusId && <a className="font-medium text-sky-600 hover:underline" href={`https://www.scopus.com/authid/detail.uri?authorId=${p.scopusId}`} target="_blank" rel="noreferrer">Scopus {p.scopusId}</a>}
                      {p.hIndex !== undefined && <span>h-index {p.hIndex}</span>}
                    </dd>
                  </div>
                )}
                {(p.courses?.length ?? 0) > 0 && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Mata kuliah</dt><dd className="text-ink-700">{p.courses!.join(", ")}</dd></div>}
                {(p.supervisionTopics?.length ?? 0) > 0 && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Topik bimbingan</dt><dd className="text-ink-700">{p.supervisionTopics!.join(", ")}{(p.supervisionSlots ?? 0) > 0 ? ` · kuota ${p.supervisionSlots} mahasiswa` : ""}</dd></div>}
              </dl>
            </Card>
          )}
          {p.stage === "academic" && ((p.partnerSectorsSought?.length ?? 0) > 0 || p.seekingAssistants) && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Mencari kolaborasi</h2>
              {(p.partnerSectorsSought?.length ?? 0) > 0 && <p className="mt-3 text-sm text-ink-600"><b>Mitra sektor:</b> {p.partnerSectorsSought!.join(", ")}</p>}
              {(p.partnerNeeds?.length ?? 0) > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{p.partnerNeeds!.map((n) => <Badge key={n} tone="violet">{n}</Badge>)}</div>}
              {p.seekingAssistants && <p className="mt-3 text-sm font-semibold text-violet-700">Sedang mencari asisten riset{(p.assistantSkills?.length ?? 0) > 0 ? `: ${p.assistantSkills!.join(", ")}` : ""}</p>}
            </Card>
          )}
          {((p.preferredRoles?.length ?? 0) > 0 || (p.preferredSectors?.length ?? 0) > 0 || p.availableFrom || (p.languages?.length ?? 0) > 0) && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Preferensi karier</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {(p.preferredRoles?.length ?? 0) > 0 && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Peran</dt><dd className="text-ink-700">{p.preferredRoles!.join(", ")}</dd></div>}
                {(p.preferredSectors?.length ?? 0) > 0 && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Sektor</dt><dd className="text-ink-700">{p.preferredSectors!.join(", ")}</dd></div>}
                {((p.workModes?.length ?? 0) > 0 || (p.preferredLocations?.length ?? 0) > 0) && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Lokasi & mode</dt><dd className="text-ink-700">{[...(p.preferredLocations ?? []), ...(p.workModes ?? [])].join(", ")}</dd></div>}
                {p.availableFrom && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Siap mulai</dt><dd className="text-ink-700">{fmtDate(p.availableFrom)}</dd></div>}
                {(p.languages?.length ?? 0) > 0 && <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Bahasa</dt><dd className="text-ink-700">{p.languages!.join(", ")}</dd></div>}
              </dl>
            </Card>
          )}
          {p.collab.length > 0 && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Bersedia menjadi</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.collab.map((c) => (
                  <Badge key={c} tone="violet">{COLLAB_LABEL[c]}</Badge>
                ))}
              </div>
              {(p.researchTopics?.length ?? 0) > 0 && <p className="mt-3 text-sm text-ink-600"><b>Topik riset:</b> {p.researchTopics!.join(", ")}</p>}
            </Card>
          )}
          <Card className="p-6">
            <h2 className="font-bold text-ink-900">Kontak</h2>
            {showContact ? (
              <div className="mt-3 space-y-2 text-sm text-ink-600">
                <p className="flex items-center gap-2 break-all"><Mail size={15} className="shrink-0" /> {p.email}</p>
                <p className="flex items-center gap-2"><Phone size={15} /> {p.phone}</p>
              </div>
            ) : (
              <p className="mt-3 flex gap-2 text-sm text-ink-500">
                <Lock size={16} className="mt-0.5 shrink-0" /> Disembunyikan. Terbuka setelah {p.name.split(" ")[0]} menerima permintaan kontak Anda.
              </p>
            )}
          </Card>
        </div>
      </div>
      <ContactModal person={contact ? p : null} onClose={() => setContact(false)} />
    </div>
  );
}
