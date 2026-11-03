"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { initials } from "@/lib/data";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "sun" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
};

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
const btnVariant = {
  primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-sm",
  secondary: "bg-white text-sky-800 ring-1 ring-inset ring-sky-200 hover:bg-sky-50",
  ghost: "text-ink-600 hover:bg-ink-100",
  sun: "bg-sun-400 text-ink-900 hover:bg-sun-300 shadow-sm",
  danger: "bg-white text-accent-red ring-1 ring-inset ring-red-200 hover:bg-red-50",
};
const btnSize = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };

export function Button({ variant = "primary", size = "md", className, href, children, ...rest }: BtnProps) {
  const cls = cn(btnBase, btnVariant[variant], btnSize[size], className);
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl bg-white shadow-card ring-1 ring-ink-200/60", className)}>{children}</div>;
}

const badgeTone = {
  sky: "bg-sky-50 text-sky-800 ring-sky-200",
  sun: "bg-sun-100 text-sun-700 ring-sun-300",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  gray: "bg-ink-100 text-ink-600 ring-ink-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function Badge({ tone = "gray", children, className }: { tone?: keyof typeof badgeTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", badgeTone[tone], className)}>
      {children}
    </span>
  );
}

const avatarColors = ["bg-sky-500", "bg-sky-700", "bg-sky-400", "bg-sky-800", "bg-sun-500", "bg-sky-600"];

export function Avatar({ name, size = 44, masked = false }: { name: string; size?: number; masked?: boolean }) {
  const hash = Array.from(name).reduce((s, c) => s + c.charCodeAt(0), 0);
  const color = masked ? "bg-ink-300" : avatarColors[hash % avatarColors.length];
  const text = color.includes("sun") ? "text-ink-900" : "text-white";
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold", color, text)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {masked ? "?" : initials(name)}
    </div>
  );
}

export function PageHeader({ eyebrow, title, desc, actions }: { eyebrow?: string; title: string; desc?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-sky-600">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">{title}</h1>
        {desc && <p className="mt-2 max-w-2xl text-ink-500">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className={cn("max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label={title}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {icon && <span className="text-sky-500">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </Card>
  );
}

export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-ink-800">{label}</span>
        {desc && <span className="mt-0.5 block text-sm text-ink-500">{desc}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-sky-600" : "bg-ink-300")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </label>
  );
}

export function Select({ value, onChange, options, label, className }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string; className?: string }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border-0 bg-white px-3 text-sm text-ink-800 ring-1 ring-inset ring-ink-200 focus:ring-2 focus:ring-sky-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-ink-800 ring-1 ring-inset ring-ink-200 placeholder:text-ink-400 focus:ring-2 focus:ring-sky-400";

export function Empty({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sun-100 text-xl font-black text-sun-700">Σ</div>
      <p className="font-bold text-ink-800">{title}</p>
      {desc && <p className="mt-1 max-w-sm text-sm text-ink-500">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
