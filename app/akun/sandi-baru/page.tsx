"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, inputCls } from "@/components/ui";
import { Alert, AuthShell, Field } from "@/components/AuthShell";
import { authErrorText, supabaseBrowser } from "@/lib/supabase/client";

export default function SandiBaru() {
  const router = useRouter();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (p1.length < 8 || !/[A-Za-z]/.test(p1) || !/\d/.test(p1)) return setErr("Minimal 8 karakter dan memuat huruf serta angka.");
    if (p1 !== p2) return setErr("Konfirmasi kata sandi tidak sama.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) return setErr(error.message.toLowerCase().includes("session") ? "Sesi tidak ditemukan. Buka lagi tautan dari email atau minta tautan baru." : authErrorText(error.message));
    router.replace("/akun?sandi=ok");
  }

  return (
    <AuthShell title="Buat kata sandi baru">
      <form onSubmit={save} className="space-y-5" noValidate>
        <Field label="Kata sandi baru" hint="Minimal 8 karakter, huruf dan angka.">
          <input className={inputCls} type="password" value={p1} onChange={(e) => setP1(e.target.value)} autoComplete="new-password" />
        </Field>
        <Field label="Ulangi kata sandi baru">
          <input className={inputCls} type="password" value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="new-password" />
        </Field>
        {err && <Alert tone="error">{err}</Alert>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Menyimpan…" : "Simpan kata sandi"}</Button>
      </form>
    </AuthShell>
  );
}
