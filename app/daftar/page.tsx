"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button, inputCls } from "@/components/ui";
import { Alert, AuthShell, Field } from "@/components/AuthShell";
import { authErrorText, CONSENT_LABEL, ConsentPurpose, supabaseBrowser } from "@/lib/supabase/client";

type Status = "mahasiswa" | "alumni" | "dosen";
const THIS_YEAR = new Date().getFullYear();

export default function Daftar() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("mahasiswa");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", password2: "", npm: "", nidn: "", angkatan: "", tahun_lulus: "" });
  const [consents, setConsents] = useState<Record<ConsentPurpose, boolean>>({ terms: false, directory: true, job_email: true, hrd_catalog: false });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate(): string {
    if (form.full_name.trim().length < 3) return "Isi nama lengkap sesuai data akademik.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Format email tidak valid.";
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return "Kata sandi minimal 8 karakter dan memuat huruf serta angka.";
    if (form.password !== form.password2) return "Konfirmasi kata sandi tidak sama.";
    if (status === "mahasiswa" && !/^\d{10,15}$/.test(form.npm.trim())) return "NPM harus berupa 10–15 digit angka.";
    if (status === "dosen" && !/@unpad\.ac\.id$/i.test(form.email.trim())) return "Dosen wajib mendaftar dengan email @unpad.ac.id.";
    if (status !== "dosen") {
      const a = Number(form.angkatan);
      if (!a || a < 1957 || a > THIS_YEAR) return "Isi tahun masuk (angkatan) dengan benar.";
    }
    if (status === "alumni") {
      const l = Number(form.tahun_lulus);
      if (!l || l < 1960 || l > THIS_YEAR || l < Number(form.angkatan)) return "Isi tahun lulus dengan benar.";
    }
    if (!consents.terms) return "Anda perlu menyetujui Syarat dan Kebijakan Privasi.";
    return "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setErr(v);
    if (v) return;
    setBusy(true);
    const email = form.email.trim().toLowerCase();
    const { data, error } = await supabaseBrowser().auth.signUp({
      email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/akun`,
        data: {
          full_name: form.full_name.trim(),
          status,
          npm: status === "mahasiswa" ? form.npm.trim() : "",
          nidn: "",
          angkatan: status === "dosen" ? "" : form.angkatan,
          tahun_lulus: status === "alumni" ? form.tahun_lulus : "",
          consents,
        },
      },
    });
    setBusy(false);
    if (error) return setErr(authErrorText(error.message));
    // Jika konfirmasi email dimatikan di Supabase, sesi langsung tersedia.
    if (data.session) {
      router.replace("/akun?baru=1");
      router.refresh();
      return;
    }
    // Email sudah terdaftar (Supabase mengembalikan user tanpa identitas).
    if (data.user && (data.user.identities?.length ?? 0) === 0) return setErr("Email ini sudah terdaftar. Silakan masuk atau atur ulang kata sandi.");
    setSentTo(email);
  }

  if (sentTo)
    return (
      <AuthShell title="Cek email Anda" desc="Satu langkah lagi untuk mengaktifkan akun.">
        <div className="flex flex-col items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"><MailCheck size={28} /></div>
          <p className="text-ink-700">
            Kami mengirim tautan konfirmasi ke <b className="break-all">{sentTo}</b>. Klik tautan itu untuk mengaktifkan akun, lalu Anda akan diarahkan ke halaman akun.
          </p>
          <Alert tone="info">Tidak menerima email dalam 5 menit? Periksa folder Spam atau Promosi. Tautan berlaku 24 jam.</Alert>
          <Button href="/akun/masuk" variant="secondary">Ke halaman masuk</Button>
        </div>
      </AuthShell>
    );

  return (
    <AuthShell
      title="Daftar akun"
      desc="Untuk mahasiswa, alumni, dan dosen Matematika FMIPA Unpad. Akun akan diverifikasi admin IKAMAT sebelum fitur jejaring dibuka."
      aside={
        <div className="rounded-2xl bg-sun-100 p-5 text-sm text-ink-800 ring-1 ring-sun-300">
          <p className="font-bold">Sudah punya akun?</p>
          <p className="mt-1">
            <Link href="/akun/masuk" className="font-semibold text-sky-800 underline">Masuk di sini</Link>
          </p>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-800">Saya adalah <span className="text-accent-red">*</span></span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {(["mahasiswa", "alumni", "dosen"] as Status[]).map((s) => (
              <button
                type="button"
                key={s}
                role="radio"
                aria-checked={status === s}
                onClick={() => setStatus(s)}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold capitalize ring-1 ring-inset transition ${status === s ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-ink-700 ring-ink-200 hover:bg-sky-50"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Field label="Nama lengkap" required hint="Sesuai data akademik, tanpa gelar untuk mahasiswa.">
          <input className={inputCls} value={form.full_name} onChange={set("full_name")} autoComplete="name" />
        </Field>

        {status !== "dosen" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {status === "mahasiswa" ? (
            <Field label="NPM" required hint="Dipakai untuk verifikasi, tidak ditampilkan publik.">
              <input className={inputCls} value={form.npm} onChange={set("npm")} inputMode="numeric" placeholder="1408xxxxxxxx" />
            </Field>
          ) : null}
          <Field label="Tahun masuk (angkatan)" required>
            <input className={inputCls} value={form.angkatan} onChange={set("angkatan")} inputMode="numeric" placeholder="2020" maxLength={4} />
          </Field>
          {status === "alumni" && (
            <Field label="Tahun lulus" required>
              <input className={inputCls} value={form.tahun_lulus} onChange={set("tahun_lulus")} inputMode="numeric" placeholder="2024" maxLength={4} />
            </Field>
          )}
        </div>
        )}

        {status === "alumni" && (
          <p className="-mt-2 text-xs text-ink-500">Alumni tidak perlu NPM. Verifikasi dilakukan admin IKAMAT dengan mencocokkan nama, tahun masuk, dan tahun lulus.</p>
        )}

        <Field label={status === "dosen" ? "Email Unpad" : "Email"} required hint={status === "mahasiswa" ? "Disarankan email @mail.unpad.ac.id agar verifikasi lebih cepat." : status === "dosen" ? "Wajib email @unpad.ac.id. Verifikasi dosen dilakukan dari nama dan email ini." : "Email pribadi yang aktif."}>
          <input className={inputCls} type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder={status === "dosen" ? "nama@unpad.ac.id" : undefined} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kata sandi" required hint="Minimal 8 karakter, huruf dan angka.">
            <input className={inputCls} type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
          </Field>
          <Field label="Ulangi kata sandi" required>
            <input className={inputCls} type="password" value={form.password2} onChange={set("password2")} autoComplete="new-password" />
          </Field>
        </div>

        <fieldset className="space-y-3 rounded-2xl bg-ink-50 p-4">
          <legend className="sr-only">Persetujuan penggunaan data</legend>
          <p className="text-sm font-bold text-ink-900">Persetujuan penggunaan data</p>
          <p className="-mt-2 text-xs text-ink-500">Setiap tujuan dapat diubah kapan saja di halaman akun.</p>
          {(Object.keys(CONSENT_LABEL) as ConsentPurpose[]).map((k) => (
            <label key={k} className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-sky-600"
                checked={consents[k]}
                onChange={(e) => setConsents((c) => ({ ...c, [k]: e.target.checked }))}
              />
              <span className="text-sm text-ink-700">
                <b className="text-ink-900">
                  {k === "terms" ? (
                    <>Saya menyetujui <Link href="/kebijakan-privasi" target="_blank" className="text-sky-700 underline">Syarat dan Kebijakan Privasi</Link></>
                  ) : (
                    CONSENT_LABEL[k].title
                  )}
                </b>
                {k === "terms" && <span className="text-accent-red"> *</span>}
                <span className="block text-xs text-ink-500">{CONSENT_LABEL[k].desc}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {err && <Alert tone="error">{err}</Alert>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Mendaftarkan…" : "Daftar"}
        </Button>
      </form>
    </AuthShell>
  );
}
