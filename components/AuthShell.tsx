"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui";

export function AuthShell({ title, desc, children, aside }: { title: string; desc?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_.75fr]">
      <Card className="p-6 sm:p-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-sky-600">Akun IKAMAT Connect</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">{title}</h1>
        {desc && <p className="mt-2 text-ink-500">{desc}</p>}
        <div className="mt-6">{children}</div>
      </Card>
      <div className="space-y-4">
        {aside}
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={20} />
            <div className="text-sm text-ink-600">
              <p className="font-bold text-ink-900">Data Anda dilindungi</p>
              <p className="mt-1">
                Disimpan di server terenkripsi dan hanya dapat dibaca oleh Anda dan admin IKAMAT untuk verifikasi. Detail ada di{" "}
                <Link href="/kebijakan-privasi" className="font-semibold text-sky-700 underline">Kebijakan Privasi</Link>.
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 text-sm text-ink-600">
          <p className="font-bold text-ink-900">Hanya ingin melihat-lihat?</p>
          <p className="mt-1">
            Mode demo dengan data simulasi tetap tersedia tanpa akun.{" "}
            <Link href="/masuk#demo" className="font-semibold text-sky-700 underline">Coba mode demo</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-800">
        {label} {required && <span className="text-accent-red">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export function Alert({ tone, children }: { tone: "error" | "ok" | "info"; children: React.ReactNode }) {
  const cls =
    tone === "error"
      ? "bg-red-50 text-red-800 ring-red-200"
      : tone === "ok"
        ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
        : "bg-sky-50 text-sky-800 ring-sky-200";
  return <div className={`rounded-xl px-4 py-3 text-sm ring-1 ring-inset ${cls}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}
