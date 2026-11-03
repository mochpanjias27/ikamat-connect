"use client";

import Link from "next/link";
import { BadgeCheck, Bookmark, BookmarkCheck, Briefcase, Building2, Clock, MapPin, Send } from "lucide-react";
import { AppRole, CATEGORY_LABEL, COLLAB_LABEL, Job, LEVEL_LABEL, Person, PERSONAS, fmtDate, maskedName, stageLabel } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar, Badge, Button, Card, cn } from "./ui";

export function stageTone(p: Person) {
  return p.stage === "student" ? "sky" : p.stage === "fresh_graduate" ? "sun" : p.stage === "academic" ? "violet" : "gray";
}

export function PersonCard({ p, masked = false, onContact, showCollab = false, noLink = false }: { p: Person; masked?: boolean; onContact?: () => void; showCollab?: boolean; noLink?: boolean }) {
  const name = masked ? maskedName(p.name) : p.name;
  const body = (
    <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <Avatar name={p.name} masked={masked} src={p.photo} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-bold text-ink-900">{name}</p>
            {p.verified && <BadgeCheck size={16} className="shrink-0 text-sky-500" aria-label="Terverifikasi" />}
          </div>
          <p className="line-clamp-2 text-sm text-ink-500">
            {masked ? (p.sector ? `${p.jobTitle ?? "Profesional"} · sektor ${p.sector}` : p.headline.split("·")[0]) : p.headline}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={stageTone(p)}>{stageLabel(p)}</Badge>
        {p.gradDate && <Badge>Lulus {p.gradDate.slice(0, 4)}</Badge>}
        {p.stage === "student" && <Badge>Angkatan {p.entryYear}</Badge>}
        {p.openToWork && <Badge tone="green">Open to Work</Badge>}
        {p.seekingInternship && <Badge tone="green">Cari magang</Badge>}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {p.skills.slice(0, 4).map((s) => (
          <span key={s} className="rounded-md bg-ink-100 px-2 py-0.5 text-xs text-ink-600">
            {s}
          </span>
        ))}
        {p.skills.length > 4 && <span className="px-1 text-xs text-ink-400">+{p.skills.length - 4}</span>}
      </div>
      {p.certs.length > 0 && (
        <p className="mt-3 line-clamp-1 text-xs text-ink-500">
          <span className="font-semibold text-sun-700">★ </span>
          {p.certs.map((c) => c.name).join(" · ")}
        </p>
      )}
      {showCollab && p.collab.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {p.collab.map((c) => (
            <Badge key={c} tone="violet">{COLLAB_LABEL[c]}</Badge>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-ink-400">
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {masked ? p.province : p.city}
        </span>
        {onContact && (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              onContact();
            }}
          >
            <Send size={14} /> Hubungi
          </Button>
        )}
      </div>
    </Card>
  );
  if (masked || noLink) return body;
  return (
    <Link href={`/profil/${p.id}`} className="block h-full">
      {body}
    </Link>
  );
}

const catTone = { internship: "sky", full_time: "green", contract: "sun", project: "violet" } as const;

export function JobCard({ j, compact = false }: { j: Job; compact?: boolean }) {
  const { savedJobs, toggleSave, role } = useStore();
  const saved = savedJobs.includes(j.id);
  const canSave = role === "student" || role === "alumni" || role === "lecturer";
  return (
    <Link href={`/lowongan/${j.id}`} className="block">
      <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <Building2 size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={catTone[j.category]}>{CATEGORY_LABEL[j.category]}</Badge>
              {j.status === "pending_review" && <Badge tone="sun">Menunggu moderasi</Badge>}
              {j.postedAt >= "2026-10-30" && j.status === "published" && <Badge tone="red">Baru</Badge>}
            </div>
            <p className="mt-1.5 font-bold text-ink-900">{j.title}</p>
            <p className="text-sm text-ink-500">{j.company}</p>
            {!compact && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                <span className="flex items-center gap-1"><MapPin size={13} /> {j.location} · {j.workMode}</span>
                <span className="flex items-center gap-1"><Briefcase size={13} /> {LEVEL_LABEL[j.level]}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> Tutup {fmtDate(j.deadline)}</span>
              </div>
            )}
            {!compact && (
              <p className="mt-3 text-xs text-ink-400">
                Diposting oleh {j.posterId ? "alumni" : "HRD terverifikasi"} <span className="font-semibold text-ink-600">{j.posterName}</span>
              </p>
            )}
          </div>
          {canSave && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSave(j.id);
              }}
              className={cn("rounded-lg p-2 transition", saved ? "text-sky-600" : "text-ink-300 hover:text-ink-500")}
              aria-label={saved ? "Hapus dari simpanan" : "Simpan lowongan"}
            >
              {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          )}
        </div>
      </Card>
    </Link>
  );
}

export function RoleGate({ allow, children, title }: { allow: AppRole[]; children: React.ReactNode; title: string }) {
  const { role, setRole, ready, showToast } = useStore();
  if (!ready) return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-ink-400">Memuat…</div>;
  if (allow.includes(role)) return <>{children}</>;
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sun-100 text-2xl font-black text-sun-700">Σ</div>
        <h1 className="text-xl font-extrabold text-ink-900">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">
          Halaman ini khusus untuk peran: <b>{allow.map((r) => PERSONAS[r].label).join(", ")}</b>. Dalam versi sebenarnya, akses dibatasi oleh RBAC. Pilih peran untuk melanjutkan simulasi.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {allow.map((r) => (
            <Button
              key={r}
              variant={r === allow[0] ? "primary" : "secondary"}
              onClick={() => {
                setRole(r);
                showToast(`Masuk sebagai ${PERSONAS[r].label}`);
              }}
            >
              Masuk sebagai {PERSONAS[r].label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
