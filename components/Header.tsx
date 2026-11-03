"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Menu, RotateCcw, X } from "lucide-react";
import { AppRole, PERSONAS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Logo } from "./Logo";
import { Avatar, cn } from "./ui";

const NAV: Record<AppRole, { href: string; label: string }[]> = {
  guest: [
    { href: "/", label: "Beranda" },
    { href: "/lowongan", label: "Lowongan" },
    { href: "/talenta", label: "Katalog Talenta" },
  ],
  student: [
    { href: "/dasbor", label: "Dashboard" },
    { href: "/direktori", label: "Direktori" },
    { href: "/lowongan", label: "Lowongan & Magang" },
    { href: "/profil/lengkapi", label: "Lengkapi Profil" },
    { href: "/saya", label: "Privasi" },
  ],
  alumni: [
    { href: "/dasbor", label: "Dashboard" },
    { href: "/direktori", label: "Direktori" },
    { href: "/lowongan", label: "Lowongan" },
    { href: "/lowongan/baru", label: "Posting Lowongan" },
    { href: "/kemitraan", label: "Kemitraan" },
    { href: "/saya", label: "Profil Saya" },
  ],
  lecturer: [
    { href: "/dasbor", label: "Dashboard" },
    { href: "/kemitraan", label: "Cari Mitra" },
    { href: "/direktori", label: "Direktori" },
    { href: "/lowongan", label: "Lowongan" },
    { href: "/saya", label: "Profil Saya" },
  ],
  recruiter: [
    { href: "/dasbor", label: "Dashboard HRD" },
    { href: "/talenta", label: "Katalog Talenta" },
    { href: "/lowongan", label: "Lowongan" },
    { href: "/lowongan/baru", label: "Posting Lowongan" },
  ],
  admin: [
    { href: "/admin", label: "Panel Admin" },
    { href: "/direktori", label: "Direktori" },
    { href: "/lowongan", label: "Lowongan" },
    { href: "/talenta", label: "Katalog" },
  ],
};

const ROLE_ORDER: AppRole[] = ["guest", "student", "alumni", "lecturer", "recruiter", "admin"];

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const { role, setRole, showToast, reset } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const P = PERSONAS[role];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 ring-1 ring-ink-200 transition hover:bg-sky-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={P.name} size={32} masked={role === "guest"} />
        {!compact && (
          <span className="hidden text-left leading-tight lg:block">
            <span className="block max-w-[150px] truncate text-sm font-semibold text-ink-800">{P.name}</span>
            <span className="block text-[11px] font-medium text-sky-600">{P.label}</span>
          </span>
        )}
        <ChevronDown size={16} className="text-ink-400" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-ink-200">
          <div className="bg-sky-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Simulasi masuk sebagai</p>
            <p className="text-xs text-ink-500">Pilih peran untuk melihat platform dari sudut pandangnya.</p>
          </div>
          <ul className="py-1">
            {ROLE_ORDER.map((r) => (
              <li key={r}>
                <button
                  onClick={() => {
                    setRole(r);
                    setOpen(false);
                    showToast(r === "guest" ? "Anda keluar dari simulasi" : `Masuk sebagai ${PERSONAS[r].label}: ${PERSONAS[r].name}`);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-ink-50"
                >
                  <Avatar name={PERSONAS[r].name} size={34} masked={r === "guest"} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-800">{PERSONAS[r].label}</span>
                    <span className="block truncate text-xs text-ink-500">{r === "guest" ? "Tanpa login" : `${PERSONAS[r].name} · ${PERSONAS[r].subtitle}`}</span>
                  </span>
                  {r === role && <Check size={16} className="text-sky-600" />}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => { reset(); setOpen(false); }} className="flex w-full items-center gap-2 border-t border-ink-100 px-4 py-2.5 text-xs font-medium text-ink-500 hover:bg-ink-50">
            <RotateCcw size={14} /> Kembalikan data demo ke awal
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { role } = useStore();
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  useEffect(() => setMobile(false), [path, role]);
  const items = NAV[role];
  const active = (href: string) => (href === "/" ? path === "/" : path === href || (href !== "/lowongan" && path.startsWith(href + "/")) || (href === "/lowongan" && path.startsWith("/lowongan") && !path.startsWith("/lowongan/baru")));
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/90 backdrop-blur">
      <div className="bg-sun-400 text-center text-[12px] font-semibold text-ink-900">
        <span className="inline-block px-4 py-1">Prototipe demo · seluruh nama, perusahaan, dan kontak adalah data simulasi</span>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                active(i.href) ? "bg-sky-50 text-sky-700" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              )}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {role === "guest" && (
            <Link href="/masuk" className="hidden rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 sm:inline-flex">
              Masuk / Daftar
            </Link>
          )}
          <RoleSwitcher />
          <button className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 md:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu">
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobile && (
        <nav className="border-t border-ink-100 bg-white px-4 py-2 md:hidden">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={cn("block rounded-lg px-3 py-2.5 text-sm font-semibold", active(i.href) ? "bg-sky-50 text-sky-700" : "text-ink-700")}>
              {i.label}
            </Link>
          ))}
          {role === "guest" && (
            <Link href="/masuk" className="mt-1 block rounded-lg bg-sky-600 px-3 py-2.5 text-center text-sm font-semibold text-white">
              Masuk / Daftar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-sky-950 text-sky-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-sky-200/80">
            Platform jejaring, talent pool, dan kemitraan civitas Matematika FMIPA Universitas Padjadjaran. Diinisiasi bersama IKAMAT Unpad.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-bold text-white">Platform</p>
          <ul className="space-y-2 text-sky-200/80">
            <li><Link href="/lowongan" className="hover:text-white">Lowongan & Magang</Link></li>
            <li><Link href="/talenta" className="hover:text-white">Katalog Talenta untuk HRD</Link></li>
            <li><Link href="/kemitraan" className="hover:text-white">Kemitraan Riset</Link></li>
            <li><Link href="/privasi" className="hover:text-white">Privasi & Perlindungan Data</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-bold text-white">Tentang prototipe ini</p>
          <p className="text-sky-200/80">
            Versi simulasi tanpa backend. Login, email, dan verifikasi disimulasikan di peramban. Data tersimpan sementara di perangkat Anda.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-sky-300/70">© 2026 IKAMAT Connect · Prototipe untuk keperluan presentasi</div>
    </footer>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
      {toast}
    </div>
  );
}
