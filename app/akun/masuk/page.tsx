"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, inputCls } from "@/components/ui";
import { Alert, AuthShell, Field } from "@/components/AuthShell";
import { authErrorText, supabaseBrowser } from "@/lib/supabase/client";

export default function MasukAkun() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "reset">("login");

  useEffect(() => {
    const g = new URLSearchParams(window.location.search).get("galat");
    if (g) setInfo("Jika Anda membuka tautan konfirmasi di perangkat atau peramban yang berbeda dari saat mendaftar, email Anda biasanya sudah terkonfirmasi. Silakan masuk di bawah. Jika masih gagal, minta tautan baru lewat Lupa kata sandi.");
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) router.replace("/akun");
      });
  }, [router]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    if (!email || !password) return setErr("Isi email dan kata sandi.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) return setErr(authErrorText(error.message));
    router.replace("/akun");
    router.refresh();
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Isi email yang terdaftar.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/akun/sandi-baru`,
    });
    setBusy(false);
    if (error) return setErr(authErrorText(error.message));
    setInfo("Jika email terdaftar, tautan untuk mengatur ulang kata sandi sudah dikirim. Cek kotak masuk dan folder Spam.");
  }

  return (
    <AuthShell
      title={mode === "login" ? "Masuk" : "Lupa kata sandi"}
      desc={mode === "login" ? "Masuk dengan email dan kata sandi yang Anda daftarkan." : "Kami akan mengirim tautan untuk membuat kata sandi baru."}
      aside={
        <div className="rounded-2xl bg-sun-100 p-5 text-sm text-ink-800 ring-1 ring-sun-300">
          <p className="font-bold">Belum punya akun?</p>
          <p className="mt-1">
            <Link href="/daftar" className="font-semibold text-sky-800 underline">Daftar sekarang</Link> untuk mahasiswa, alumni, dan dosen.
          </p>
        </div>
      }
    >
      <form onSubmit={mode === "login" ? login : reset} className="space-y-5" noValidate>
        <Field label="Email">
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        {mode === "login" && (
          <Field label="Kata sandi">
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
        )}
        {err && <Alert tone="error">{err}</Alert>}
        {info && <Alert tone="ok">{info}</Alert>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Memproses…" : mode === "login" ? "Masuk" : "Kirim tautan"}
        </Button>
        <button
          type="button"
          className="w-full text-center text-sm font-semibold text-sky-700 hover:underline"
          onClick={() => {
            setMode(mode === "login" ? "reset" : "login");
            setErr("");
            setInfo("");
          }}
        >
          {mode === "login" ? "Lupa kata sandi?" : "Kembali ke halaman masuk"}
        </button>
      </form>
    </AuthShell>
  );
}
