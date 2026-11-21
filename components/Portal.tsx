"use client";

import Link from "next/link";
import { Clock, ShieldAlert } from "lucide-react";
import type { Profile } from "@/lib/supabase/client";
import type { Responder } from "@/lib/supabase/portal";
import { fmtDate } from "@/lib/supabase/portal";

export function PortalHeader({ eyebrow, title, desc, actions }: { eyebrow: string; title: string; desc?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-sky-600">{eyebrow}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">{title}</h1>
        {desc && <p className="mt-2 max-w-2xl text-ink-500">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Loading() {
  return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-ink-500">Memuat…</div>;
}

/** Banner untuk akun yang belum terverifikasi. */
export function PendingNotice({ me, what }: { me: Profile; what: string }) {
  if (me.verification_status === "verified" || me.is_admin) return null;
  const rejected = me.verification_status === "rejected";
  return (
    <div className={`mb-6 flex items-start gap-3 rounded-2xl p-4 ring-1 ${rejected ? "bg-red-50 ring-red-200" : "bg-sun-100 ring-sun-300"}`}>
      {rejected ? <ShieldAlert className="mt-0.5 shrink-0 text-red-600" size={20} /> : <Clock className="mt-0.5 shrink-0 text-sun-700" size={20} />}
      <p className="text-sm text-ink-800">
        <b>{rejected ? "Verifikasi belum berhasil." : "Akun Anda menunggu verifikasi admin."}</b> Anda sudah bisa melihat isi halaman ini, tetapi {what} baru dapat dilakukan setelah akun terverifikasi.{" "}
        <Link href="/akun" className="font-semibold text-sky-700 underline">Lihat status akun</Link>
      </p>
    </div>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-ink-800 ring-1 ring-inset ring-ink-200 placeholder:text-ink-400 focus:ring-2 focus:ring-sky-400"
    />
  );
}

export function ResponderList({ items, emptyText }: { items: Responder[] | null; emptyText: string }) {
  if (items === null) return <p className="py-3 text-sm text-ink-500">Memuat…</p>;
  if (!items.length) return <p className="py-3 text-sm text-ink-500">{emptyText}</p>;
  return (
    <ul className="divide-y divide-ink-100">
      {items.map((r) => (
        <li key={r.user_id} className="py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold text-ink-900">
              {r.full_name}{" "}
              <span className="text-xs font-medium capitalize text-ink-500">
                · {r.status}
                {r.angkatan ? ` ${r.angkatan}` : ""}
                {r.tahun_lulus ? `–${r.tahun_lulus}` : ""}
              </span>
            </p>
            <span className="text-xs text-ink-400">{fmtDate(r.created_at)}</span>
          </div>
          {(r.headline || r.current_company) && <p className="text-sm text-ink-600">{[r.headline, r.current_company].filter(Boolean).join(" · ")}</p>}
          {r.services && <p className="text-sm text-ink-700"><b>Layanan:</b> {r.services}</p>}
          {r.message && <p className="mt-1 whitespace-pre-line rounded-lg bg-ink-50 p-2 text-sm text-ink-700">{r.message}</p>}
          <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
            <a className="break-all font-semibold text-sky-700 underline" href={`mailto:${r.email}`}>{r.email}</a>
            {r.linkedin_url && <a className="font-semibold text-sky-700 underline" href={r.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
          </p>
        </li>
      ))}
    </ul>
  );
}
