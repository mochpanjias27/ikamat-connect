import { Card, PageHeader } from "@/components/ui";

const ITEMS = [
  ["Persetujuan per tujuan", "Tampil di Katalog HRD, menerima email lowongan, dan email kemitraan adalah tiga persetujuan terpisah yang bisa ditarik kapan saja."],
  ["Minimisasi data", "Platform tidak mengumpulkan NIK, tanggal lahir lengkap, agama, atau alamat rumah. Nomor HP disimpan terenkripsi."],
  ["Kontak termediasi", "HRD dan pengguna lain menghubungi kandidat lewat platform. Kontak terbuka hanya untuk pihak yang permintaannya diterima."],
  ["Transparansi akses", "Setiap pengguna dapat melihat siapa yang membuka profilnya, dan seluruh akses HRD tercatat di log audit."],
  ["Hak subjek data", "Unduh, koreksi, atau hapus data Anda dari halaman Profil Saya, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi."],
  ["Anti-scraping", "Halaman profil individu tidak diindeks mesin pencari, ada batas tampilan per jam, dan tidak ada API publik untuk daftar profil."],
];

export default function Privasi() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Privasi & perlindungan data" title="Data civitas dijaga sejak rancangan" desc="Prinsip yang diterapkan pada versi produksi. Di prototipe ini semua data adalah simulasi dan hanya tersimpan di peramban Anda." />
      <div className="grid gap-4 md:grid-cols-2">
        {ITEMS.map(([t, d], i) => (
          <Card key={t} className="p-6">
            <p className="text-xs font-bold text-sun-700">PRINSIP {i + 1}</p>
            <p className="mt-1 font-bold text-ink-900">{t}</p>
            <p className="mt-2 text-sm text-ink-600">{d}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
