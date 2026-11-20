"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { AppRole, PERSONAS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar, Button, Card, inputCls, PageHeader } from "@/components/ui";

const DEST: Record<AppRole, string> = {
  guest: "/",
  student: "/dasbor",
  alumni: "/dasbor",
  lecturer: "/dasbor",
  recruiter: "/dasbor",
  admin: "/admin",
};

const DESC: Record<AppRole, string> = {
  guest: "",
  student: "Lihat dasbor magang, lengkapi profil, dan atur privasi.",
  alumni: "Posting lowongan dengan auto-routing email, cari kandidat, tandai kesediaan mitra.",
  lecturer: "Cari mitra alumni untuk riset & hibah, posting kebutuhan kolaborasi.",
  recruiter: "Akses katalog talenta lengkap dan kirim permintaan kontak termediasi.",
  admin: "Verifikasi akun, moderasi lowongan, pantau statistik platform.",
};

export default function Masuk() {
  const { setRole, showToast } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [npm, setNpm] = useState("");
  const go = (r: AppRole) => {
    setRole(r);
    showToast(`Masuk sebagai ${PERSONAS[r].label}: ${PERSONAS[r].name}`);
    router.push(DEST[r]);
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 rounded-2xl bg-sky-950 p-6 text-white shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sun-400">Akun sungguhan</p>
          <p className="mt-1 text-xl font-extrabold">Mahasiswa, alumni, atau dosen Matematika Unpad?</p>
          <p className="mt-1 text-sm text-sky-200">Buat akun dengan email Anda sendiri. Data tersimpan di server dan diverifikasi admin IKAMAT.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button href="/akun/masuk" variant="secondary">Masuk</Button>
          <Button href="/daftar" variant="sun">Daftar akun</Button>
        </div>
      </div>
      <div id="demo" className="scroll-mt-28">
        <PageHeader eyebrow="Mode demo" title="Atau coba platform dengan peran simulasi" desc="Tanpa akun. Seluruh nama, perusahaan, dan kontak di mode ini adalah data simulasi. Anda dapat berpindah peran kapan saja lewat menu di kanan atas." />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["student", "alumni", "lecturer", "recruiter", "admin"] as AppRole[]).map((r) => (
            <button key={r} onClick={() => go(r)} className="text-left">
              <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-center gap-3">
                  <Avatar name={PERSONAS[r].name} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-600">{PERSONAS[r].label}</p>
                    <p className="truncate font-bold text-ink-900">{PERSONAS[r].name}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-1 text-xs text-ink-400">{PERSONAS[r].subtitle}</p>
                <p className="mt-2 text-sm text-ink-600">{DESC[r]}</p>
                <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-sky-600">
                  Masuk <ArrowRight size={15} />
                </p>
              </Card>
            </button>
          ))}
        </div>

        <Card className="h-fit p-6">
          <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
            <ShieldCheck size={18} className="text-sky-600" /> Contoh alur pendaftaran alumni
          </p>
          <p className="mt-1 text-sm text-ink-500">Bagaimana platform memastikan hanya civitas Matematika Unpad yang terdaftar.</p>
          {step === 0 && (
            <div className="mt-5 space-y-3">
              <input className={inputCls} placeholder="Nama lengkap sesuai ijazah" defaultValue="Arya Wicaksana" />
              <input className={inputCls} placeholder="NPM" value={npm} onChange={(e) => setNpm(e.target.value)} />
              <input className={inputCls} placeholder="Tahun lulus" defaultValue="2012" />
              <Button className="w-full" onClick={() => setStep(1)}>
                Cocokkan data
              </Button>
            </div>
          )}
          {step === 1 && (
            <div className="mt-5 space-y-3 text-sm">
              {[
                "NPM ditemukan di data acuan departemen",
                "Nama cocok 96% (toleransi ejaan)",
                "Tahun lulus sesuai: 2012",
              ].map((t) => (
                <p key={t} className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={17} /> {t}
                </p>
              ))}
              <p className="rounded-xl bg-sky-50 p-3 text-sky-800">Akun terverifikasi otomatis sebagai <b>Alumni</b>. Jika data tidak cocok, pengguna mengunggah ijazah untuk ditinjau moderator.</p>
              <Button variant="secondary" className="w-full" onClick={() => { setStep(0); setNpm(""); }}>
                Ulangi contoh
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
