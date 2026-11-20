import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Kebijakan Privasi · IKAMAT Connect" };

const CONTACT = "moch16006@unpad.ac.id";

function S({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-ink-900">{n}. {title}</h2>
      <div className="mt-2 space-y-2 text-ink-700 [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </section>
  );
}

export default function KebijakanPrivasi() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-sky-600">Syarat dan Kebijakan Privasi</p>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">Kebijakan Privasi IKAMAT Connect</h1>
      <p className="mt-2 text-sm text-ink-500">Berlaku sejak 21 November 2026 · Versi 2026-11</p>

      <p className="mt-6 text-ink-700">
        IKAMAT Connect adalah platform jejaring mahasiswa, alumni, dan dosen Matematika FMIPA Universitas Padjadjaran yang diinisiasi bersama Ikatan Alumni Matematika (IKAMAT) Unpad. Kebijakan ini menjelaskan data apa yang kami kumpulkan, untuk apa, dan hak Anda, mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.
      </p>

      <S n={1} title="Data yang kami kumpulkan">
        <ul>
          <li>Data akun: nama lengkap, email, kata sandi (tersimpan dalam bentuk hash, tidak dapat kami baca).</li>
          <li>Data verifikasi: status (mahasiswa, alumni, dosen), NPM, NIDN, atau NUPTK, angkatan, dan tahun lulus.</li>
          <li>Data profil yang Anda isi sendiri: nomor WhatsApp, kota, headline, instansi, jabatan, keahlian, ringkasan diri, dan tautan LinkedIn.</li>
          <li>Riwayat persetujuan: tujuan yang Anda setujui atau tolak beserta waktunya.</li>
          <li>Data teknis minimum untuk keamanan login (cookie sesi).</li>
        </ul>
      </S>

      <S n={2} title="Tujuan penggunaan">
        <p>Setiap tujuan di bawah ini memerlukan persetujuan terpisah, kecuali yang wajib untuk menjalankan akun.</p>
        <ul>
          <li><b>Wajib:</b> membuat dan mengamankan akun, serta memverifikasi bahwa Anda civitas Matematika Unpad.</li>
          <li><b>Direktori civitas (pilihan):</b> menampilkan nama, angkatan, dan bidang kepada civitas yang sudah terverifikasi.</li>
          <li><b>Email lowongan (pilihan):</b> mengirim info lowongan dan magang yang sesuai status dan minat Anda.</li>
          <li><b>Katalog talenta HRD (pilihan):</b> menampilkan profil tersamar kepada HRD terverifikasi. Nama lengkap dan kontak hanya dibuka setelah Anda menyetujui permintaan kontak.</li>
        </ul>
      </S>

      <S n={3} title="Siapa yang dapat melihat data Anda">
        <ul>
          <li>Anda sendiri, kapan saja melalui halaman Akun.</li>
          <li>Admin IKAMAT yang ditunjuk, untuk verifikasi dan moderasi. Setiap tindakan verifikasi dicatat dalam log audit.</li>
          <li>Civitas atau HRD hanya sebatas tujuan yang Anda setujui di atas.</li>
          <li>NPM, NIDN, NUPTK, nomor WhatsApp, dan email tidak pernah ditampilkan publik.</li>
        </ul>
      </S>

      <S n={4} title="Penyimpanan dan keamanan">
        <p>
          Data disimpan di layanan basis data Supabase (pusat data Singapura) dengan koneksi terenkripsi dan aturan akses per baris (Row Level Security). Situs dihosting di Vercel. Email dikirim melalui penyedia layanan email transaksional. Kami tidak menjual data pribadi kepada pihak mana pun.
        </p>
      </S>

      <S n={5} title="Masa simpan">
        <p>Data disimpan selama akun aktif. Jika Anda menghapus akun, data profil dan riwayat persetujuan dihapus paling lambat 30 hari, kecuali log audit minimum yang diperlukan untuk akuntabilitas verifikasi.</p>
      </S>

      <S n={6} title="Hak Anda">
        <ul>
          <li>Mengakses dan memperbarui data melalui halaman <Link href="/akun" className="font-semibold text-sky-700 underline">Akun</Link>.</li>
          <li>Menarik persetujuan per tujuan kapan saja; penarikan tidak memengaruhi pemrosesan sebelumnya.</li>
          <li>Meminta salinan data atau penghapusan akun dengan mengirim email ke kontak di bawah. Kami merespons paling lambat 3 x 24 jam hari kerja.</li>
        </ul>
      </S>

      <S n={7} title="Ketentuan penggunaan singkat">
        <ul>
          <li>Isi data dengan benar. Akun dengan data palsu dapat ditolak atau dinonaktifkan.</li>
          <li>Jangan menggunakan informasi civitas lain untuk spam, penipuan, atau tujuan di luar jejaring akademik dan karier.</li>
          <li>Fitur direktori, lowongan, dan katalog yang saat ini tampil di situs masih menggunakan data simulasi untuk keperluan demonstrasi.</li>
        </ul>
      </S>

      <S n={8} title="Kontak">
        <p>
          Pertanyaan, permintaan data, atau laporan penyalahgunaan: Dr. Moch Panji Agung Saputra, Departemen Matematika FMIPA Universitas Padjadjaran ·{" "}
          <a href={`mailto:${CONTACT}`} className="font-semibold text-sky-700 underline">{CONTACT}</a>
        </p>
      </S>
    </div>
  );
}
