"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Briefcase, GraduationCap, Lock, Mail, MapPin, Phone, Send } from "lucide-react";
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
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
            {isMe && <Button href="/saya" variant="secondary">Edit profil & privasi</Button>}
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
                  </div>
                </li>
              ))}
              <li className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun-100 text-sun-700"><GraduationCap size={18} /></div>
                <div>
                  <p className="font-semibold text-ink-800">{p.program === "S3" ? "Doktor Matematika" : "S1 Matematika"} · FMIPA Unpad</p>
                  <p className="text-sm text-ink-500">
                    Angkatan {p.entryYear}
                    {p.gradDate ? ` · lulus ${fmtDate(p.gradDate)}` : p.stage === "student" ? " · sedang berjalan" : ""}
                  </p>
                  {p.thesis && <p className="mt-1 text-sm italic text-ink-600">&ldquo;{p.thesis}&rdquo;</p>}
                </div>
              </li>
            </ol>
          </Card>
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
          {p.collab.length > 0 && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-900">Bersedia menjadi</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.collab.map((c) => (
                  <Badge key={c} tone="violet">{COLLAB_LABEL[c]}</Badge>
                ))}
              </div>
            </Card>
          )}
          <Card className="p-6">
            <h2 className="font-bold text-ink-900">Kontak</h2>
            {showContact ? (
              <div className="mt-3 space-y-2 text-sm text-ink-600">
                <p className="flex items-center gap-2"><Mail size={15} /> {p.email}</p>
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
