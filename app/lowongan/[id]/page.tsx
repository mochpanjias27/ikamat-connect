"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BarChart3, Briefcase, Clock, ExternalLink, MapPin, Users } from "lucide-react";
import { AUDIENCE_LABEL, CATEGORY_LABEL, LEVEL_LABEL, fmtDate, resolveAudience } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar, Badge, Button, Card, Empty } from "@/components/ui";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { jobs, people, role, me, showToast, ready, dispatches } = useStore();
  if (!ready) return null;
  const j = jobs.find((x) => x.id === id);
  if (!j) return <div className="mx-auto max-w-3xl px-4 py-20"><Empty title="Lowongan tidak ditemukan" action={<Button href="/lowongan">Kembali</Button>} /></div>;
  const res = resolveAudience(j, people);
  const poster = people.find((p) => p.id === j.posterId);
  const isPoster = (me && me.id === j.posterId) || role === "admin" || (role === "recruiter" && j.posterName === "Sinta Maharani");
  const isMatch = me && res.recipients.some((p) => p.id === me.id);
  const d = dispatches.find((x) => x.jobId === j.id);
  const sent = d?.count ?? j.stats.sent;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/lowongan" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700">
        <ArrowLeft size={16} /> Semua lowongan
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge tone="sky">{CATEGORY_LABEL[j.category]}</Badge>
            <Badge>{LEVEL_LABEL[j.level]}</Badge>
            {j.status === "pending_review" && <Badge tone="sun">Menunggu moderasi</Badge>}
            {isMatch && <Badge tone="sun">★ Cocok dengan profil Anda</Badge>}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-ink-900 md:text-3xl">{j.title}</h1>
          <p className="mt-1 text-lg text-ink-500">{j.company}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-500">
            <span className="flex items-center gap-1.5"><MapPin size={15} /> {j.location} · {j.workMode}</span>
            <span className="flex items-center gap-1.5"><Briefcase size={15} /> {LEVEL_LABEL[j.level]}</span>
            <span className="flex items-center gap-1.5"><Clock size={15} /> Diposting {fmtDate(j.postedAt)} · tutup {fmtDate(j.deadline)}</span>
          </div>
          <h2 className="mt-8 font-bold text-ink-900">Deskripsi</h2>
          <p className="mt-2 text-ink-600">{j.description}</p>
          <h2 className="mt-6 font-bold text-ink-900">Kualifikasi</h2>
          <ul className="mt-2 space-y-1.5 text-ink-600">
            {j.requirements.map((r) => (
              <li key={r} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" /> {r}</li>
            ))}
          </ul>
          <h2 className="mt-6 font-bold text-ink-900">Keahlian yang dicari</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {j.skills.map((s) => (
              <span key={s} className="rounded-lg bg-sky-50 px-2.5 py-1 text-sm font-medium text-sky-800">{s}</span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button size="lg" onClick={() => showToast("Simulasi: Anda diarahkan ke tautan lamaran milik perusahaan.")}>
              Lamar sekarang <ExternalLink size={16} />
            </Button>
            {role === "guest" && <Button size="lg" variant="secondary" href="/masuk">Masuk untuk menyimpan</Button>}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{j.posterId ? "Dibagikan oleh alumni" : "Dibagikan oleh HRD terverifikasi"}</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={j.posterName} />
              <div className="min-w-0">
                <p className="truncate font-bold text-ink-900">{j.posterName}</p>
                <p className="line-clamp-2 text-xs text-ink-500">{poster?.headline ?? "HRD Verified"}</p>
              </div>
            </div>
            {poster && ["student", "alumni", "lecturer", "admin"].includes(role) && (
              <Button href={`/profil/${poster.id}`} variant="secondary" size="sm" className="mt-4 w-full">Lihat profil</Button>
            )}
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><Users size={16} className="text-sky-600" /> Target notifikasi email</p>
            <ul className="mt-3 space-y-2 text-sm">
              {res.segments.map((s) => (
                <li key={s.audience} className="flex justify-between">
                  <span className="text-ink-600">{AUDIENCE_LABEL[s.audience]}</span>
                  <span className="font-semibold text-ink-800">{s.count}</span>
                </li>
              ))}
              {j.skillFilter && (
                <li className="flex justify-between text-ink-500">
                  <span>Disaring keahlian</span><span>−{res.removedBySkill}</span>
                </li>
              )}
            </ul>
            <p className="mt-3 rounded-lg bg-ink-50 p-2.5 text-xs text-ink-500">Dihitung otomatis dari status akun & profil. Nama penerima tidak pernah ditampilkan ke pemosting.</p>
          </Card>

          {isPoster && j.status === "published" && (
            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><BarChart3 size={16} className="text-sky-600" /> Performa lowongan</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[["Email", sent], ["Dilihat", Math.max(j.stats.views, sent * 2)], ["Klik lamar", Math.max(j.stats.clicks, Math.round(sent * 0.2))]].map(([l, v]) => (
                  <div key={l as string} className="rounded-xl bg-sky-50 p-2">
                    <p className="text-xl font-extrabold text-sky-700">{v}</p>
                    <p className="text-[11px] text-ink-500">{l}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
