# IKAMAT Connect — Prototipe

Prototipe platform jejaring, talent pool, dan kemitraan civitas Matematika FMIPA Universitas Padjadjaran (mahasiswa, dosen, alumni IKAMAT, dan HRD eksternal).

> Seluruh nama, perusahaan, dan kontak di dalam prototipe ini **fiktif**. Tidak ada backend: login, email, dan verifikasi disimulasikan di peramban, dan perubahan disimpan sementara di `localStorage`.

## Fitur yang bisa didemokan

| Peran | Coba ini |
| --- | --- |
| Tamu | Beranda, lowongan publik, Katalog Talenta dengan nama tersamar |
| Mahasiswa | Dasbor magang yang cocok, terima/tolak permintaan kontak HRD, atur privasi |
| Alumni | Posting lowongan → lihat perkiraan penerima → simulasi email otomatis |
| Dosen | Hub Kemitraan: cari alumni mitra riset per sektor, undang, posting kebutuhan hibah |
| HRD Verified | Katalog lengkap, kirim permintaan kontak termediasi, posting lowongan (masuk moderasi) |
| Admin | Verifikasi civitas & HRD, setujui lowongan HRD → email terkirim otomatis |

Ganti peran kapan saja lewat menu avatar di kanan atas. Menu itu juga punya tombol untuk mengembalikan data demo ke awal.

## Menjalankan secara lokal

```bash
npm install
npm run dev     # http://localhost:3000
```

## Deploy ke Vercel

1. Push repositori ini ke GitHub.
2. Di vercel.com → **Add New → Project** → pilih repositori ini.
3. Framework terdeteksi otomatis sebagai **Next.js**; klik **Deploy**.

## Struktur

- `lib/data.ts` — data dummy (dibangkitkan deterministik) dan aturan routing audiens email
- `lib/store.tsx` — state simulasi (peran aktif, lowongan baru, permintaan kontak, privasi)
- `app/*` — halaman: beranda, masuk, dasbor, direktori, profil, lowongan, kemitraan, talenta, saya, admin, privasi
- `components/*` — komponen UI, kartu, filter, modal kontak, modal simulasi notifikasi
