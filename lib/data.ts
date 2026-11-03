// =====================================================================
// DATA DUMMY — seluruh nama, perusahaan, dan kontak di bawah ini FIKTIF.
// Dibangkitkan secara deterministik (seed tetap) agar tampilan konsisten.
// =====================================================================

export type CivitasRole = "student" | "alumni" | "lecturer";
export type Stage = "student" | "fresh_graduate" | "professional" | "academic";
export type CollabType = "research_partner" | "speaker" | "guest_lecturer" | "mentor" | "internship_host" | "research_assistant";
export type Visibility = "private" | "internal" | "recruiters";

export interface Cert {
  name: string;
  issuer: string;
  year: number;
  verified: boolean;
  credentialUrl?: string;
  evidence?: string;
}

export interface Publication {
  title: string;
  venue: string;
  year: number;
  indexing: "Scopus Q1" | "Scopus Q2" | "Scopus Q3" | "Scopus Q4" | "Sinta 1" | "Sinta 2" | "Sinta 3" | "Prosiding" | "Lainnya";
  url?: string;
}

export interface Grant {
  title: string;
  scheme: string;
  year: number;
  role: "Ketua" | "Anggota";
  partner?: string;
}

export interface PortfolioItem {
  title: string;
  url: string;
  desc: string;
}

export interface Experience {
  title: string;
  company: string;
  start: number;
  end?: number;
  kind?: "kerja" | "magang" | "organisasi" | "asisten" | "riset";
  desc?: string;
}

export interface Person {
  id: string;
  name: string;
  roles: CivitasRole[];
  program: "S1" | "S2" | "S3";
  npm: string;
  entryYear: number;
  gradDate?: string; // YYYY-MM
  stage: Stage;
  track: TrackKey;
  headline: string;
  bio: string;
  city: string;
  province: string;
  sector?: string;
  company?: string;
  jobTitle?: string;
  skills: string[];
  certs: Cert[];
  experience: Experience[];
  openToWork: boolean;
  openToProject: boolean;
  seekingInternship: boolean;
  collab: CollabType[];
  catalogConsent: boolean;
  visibility: Visibility;
  email: string;
  phone: string;
  thesis?: string;
  expertise?: string[];
  verified: boolean;
  profileCompleteness: number;
  updatedMonthsAgo: number;
  linkedin?: string;
  github?: string;
  portfolio?: PortfolioItem[];
  cvFile?: string;
  achievements?: string[];
  languages?: string[];
  preferredRoles?: string[];
  preferredSectors?: string[];
  preferredLocations?: string[];
  workModes?: ("Onsite" | "Hybrid" | "Remote")[];
  availableFrom?: string; // YYYY-MM
  researchTopics?: string[];
  photo?: string; // data URL hasil kompres di peramban (simulasi object storage)
  // khusus dosen
  nidn?: string;
  academicRank?: "Asisten Ahli" | "Lektor" | "Lektor Kepala" | "Guru Besar";
  researchGroup?: string;
  sintaId?: string;
  scopusId?: string;
  scholarUrl?: string;
  orcid?: string;
  hIndex?: number;
  publications?: Publication[];
  grants?: Grant[];
  courses?: string[];
  partnerSectorsSought?: string[];
  partnerNeeds?: string[];
  seekingAssistants?: boolean;
  assistantSkills?: string[];
  supervisionTopics?: string[];
  supervisionSlots?: number;
}

export type TrackKey = "actuarial" | "data" | "risk" | "software" | "education" | "operations";

export const TRACKS: Record<
  TrackKey,
  { label: string; skills: string[]; certs: { name: string; issuer: string }[]; sectors: string[]; titles: string[]; thesis: string[] }
> = {
  actuarial: {
    label: "Aktuaria & Asuransi",
    skills: ["Pemodelan Aktuaria", "Matematika Asuransi", "Excel VBA", "R", "Valuasi Dana Pensiun", "IFRS 17", "Statistika"],
    certs: [
      { name: "Ajun Aktuaris (PAI)", issuer: "Persatuan Aktuaris Indonesia" },
      { name: "Fellow Society of Actuaries of Indonesia (FSAI)", issuer: "Persatuan Aktuaris Indonesia" },
      { name: "Associate of the Society of Actuaries (ASA)", issuer: "Society of Actuaries" },
    ],
    sectors: ["Asuransi", "Dana Pensiun", "Konsultan Aktuaria"],
    titles: ["Aktuaris", "Analis Aktuaria", "Actuarial Associate", "Pricing Actuary"],
    thesis: [
      "Penentuan Premi Asuransi Jiwa Berjangka dengan Tingkat Bunga Stokastik",
      "Valuasi Kewajiban Dana Pensiun Menggunakan Metode Projected Unit Credit",
      "Model Cadangan Klaim Chain-Ladder Bayesian",
    ],
  },
  data: {
    label: "Data Science & Analytics",
    skills: ["Python", "SQL", "Machine Learning", "Visualisasi Data", "Power BI", "Tableau", "Statistika", "Deep Learning"],
    certs: [
      { name: "Google Data Analytics Professional Certificate", issuer: "Google" },
      { name: "Microsoft Certified: Power BI Data Analyst Associate", issuer: "Microsoft" },
      { name: "TensorFlow Developer Certificate", issuer: "Google" },
    ],
    sectors: ["Teknologi", "E-commerce", "Telekomunikasi"],
    titles: ["Data Scientist", "Data Analyst", "Machine Learning Engineer", "Analytics Lead"],
    thesis: [
      "Klasifikasi Sentimen Ulasan Produk dengan Model Transformer",
      "Prediksi Churn Pelanggan Menggunakan Gradient Boosting",
      "Analisis Klaster Perilaku Belanja Daring dengan K-Prototypes",
    ],
  },
  risk: {
    label: "Risiko & Keuangan",
    skills: ["Manajemen Risiko", "Value-at-Risk", "Pemodelan Kredit", "Python", "Ekonometrika", "Analisis Keuangan", "Optimasi Portofolio"],
    certs: [
      { name: "Sertifikasi Manajemen Risiko Perbankan Level 2", issuer: "LSP Perbankan" },
      { name: "Financial Risk Manager (FRM) Part I", issuer: "GARP" },
      { name: "CFA Level I", issuer: "CFA Institute" },
    ],
    sectors: ["Perbankan", "Fintech", "Pasar Modal"],
    titles: ["Risk Analyst", "Credit Risk Modeler", "Quantitative Analyst", "Treasury Analyst"],
    thesis: [
      "Estimasi Value-at-Risk Portofolio Saham dengan Model GARCH-Copula",
      "Optimasi Portofolio Mean-CVaR dengan Kendala Kardinalitas",
      "Model Skor Kredit Berbasis Regresi Logistik Terpenalti",
    ],
  },
  software: {
    label: "Software & Cloud",
    skills: ["JavaScript", "TypeScript", "Java", "Cloud Computing", "Algoritma", "Docker", "Python"],
    certs: [
      { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
      { name: "Google Associate Cloud Engineer", issuer: "Google Cloud" },
    ],
    sectors: ["Teknologi", "Fintech"],
    titles: ["Software Engineer", "Backend Engineer", "Data Engineer"],
    thesis: [
      "Kriptografi Kurva Eliptik untuk Autentikasi Ringan",
      "Algoritma Genetika untuk Penjadwalan Kuliah",
    ],
  },
  education: {
    label: "Pendidikan & Riset",
    skills: ["Pendidikan Matematika", "LaTeX", "MATLAB", "Analisis Numerik", "Penulisan Ilmiah", "Statistika"],
    certs: [{ name: "Sertifikat Pendidik", issuer: "Kemendikdasmen" }],
    sectors: ["Pendidikan", "Lembaga Riset"],
    titles: ["Guru Matematika", "Peneliti", "Analis Kebijakan", "Pengajar"],
    thesis: [
      "Solusi Numerik Persamaan Difusi dengan Metode Beda Hingga",
      "Model Matematika Penyebaran Demam Berdarah dengan Kontrol Optimal",
    ],
  },
  operations: {
    label: "Riset Operasi & Optimasi",
    skills: ["Riset Operasi", "Optimasi", "Supply Chain Analytics", "Simulasi", "Python", "Pemrograman Linear"],
    certs: [
      { name: "APICS Certified Supply Chain Professional (CSCP)", issuer: "ASCM" },
      { name: "Lean Six Sigma Green Belt", issuer: "IASSC" },
    ],
    sectors: ["Logistik", "Manufaktur", "Energi"],
    titles: ["Operations Research Analyst", "Supply Chain Analyst", "Planning Analyst"],
    thesis: [
      "Optimasi Rute Kendaraan dengan Jendela Waktu Menggunakan Tabu Search",
      "Model Optimasi Robust untuk Perencanaan Persediaan",
    ],
  },
};

export const COMPANIES: Record<string, string[]> = {
  Asuransi: ["PT Asuransi Jiwa Pelita Nusantara", "PT Proteksi Insani Re"],
  "Dana Pensiun": ["Dana Pensiun Lembaga Keuangan Cakra"],
  "Konsultan Aktuaria": ["KKA Cendana Rekan"],
  Teknologi: ["PT Arunika Data Nusantara", "PT Lumbung Teknologi Digital"],
  "E-commerce": ["Belanjaku.id"],
  Telekomunikasi: ["PT Sinyal Persada Telekom"],
  Perbankan: ["Bank Sentosa Raya", "Bank Pembangunan Priangan"],
  Fintech: ["PT Dana Kilat Indonesia"],
  "Pasar Modal": ["PT Sekuritas Meridian"],
  Pendidikan: ["SMA Cendekia Bandung", "Bimbel Sigma Prima"],
  "Lembaga Riset": ["Lembaga Kajian Kebijakan Priangan"],
  Logistik: ["PT Logistik Cepat Mandala"],
  Manufaktur: ["PT Industri Presisi Jatinangor"],
  Energi: ["PT Energi Hijau Parahyangan"],
};

export const SECTORS = Object.keys(COMPANIES);

const CITIES: [string, string][] = [
  ["Bandung", "Jawa Barat"],
  ["Bandung", "Jawa Barat"],
  ["Jakarta Selatan", "DKI Jakarta"],
  ["Jakarta Pusat", "DKI Jakarta"],
  ["Sumedang", "Jawa Barat"],
  ["Bekasi", "Jawa Barat"],
  ["Tangerang Selatan", "Banten"],
  ["Bogor", "Jawa Barat"],
  ["Surabaya", "Jawa Timur"],
  ["Yogyakarta", "DI Yogyakarta"],
  ["Tasikmalaya", "Jawa Barat"],
  ["Cirebon", "Jawa Barat"],
];

const FIRST = [
  "Raka", "Nadia", "Fajar", "Salsabila", "Dimas", "Annisa", "Rizky", "Aulia", "Galih", "Intan",
  "Yoga", "Putri", "Bagas", "Citra", "Hilman", "Rahma", "Arief", "Dewi", "Ilham", "Sekar",
  "Fikri", "Nabila", "Gilang", "Tiara", "Reza", "Laras", "Aditya", "Kirana", "Hafiz", "Zahra",
  "Bima", "Shafira", "Naufal", "Anggi", "Rangga", "Meutia", "Ihsan", "Wulan", "Daffa", "Alya",
  "Farhan", "Keisha", "Yusuf", "Indah", "Rendra", "Syifa", "Taufik", "Vania", "Wildan", "Zalfa",
  "Ghani", "Hana", "Irfan", "Jasmine", "Kemal", "Lutfiah", "Malik", "Nisa", "Oki", "Prisa",
  "Qori", "Rafi", "Sabrina", "Tegar",
];
const LAST = [
  "Pratama", "Ramadhani", "Nugraha", "Permana", "Saputra", "Lestari", "Hidayat", "Firmansyah",
  "Kusuma", "Setiawan", "Maulana", "Wibowo", "Rahmawati", "Suryadi", "Hakim", "Sudrajat",
  "Kurniawan", "Fauzi", "Anggraini", "Hermawan", "Purnama", "Sulaeman", "Wijaya", "Nurhadi",
];

// Daftar dosen Departemen Matematika FMIPA Unpad (sumber: laman resmi FMIPA Unpad).
// Nama, pendidikan terakhir, NIDN, SINTA ID, dan Scopus ID mengikuti daftar resmi.
// Kepakaran, publikasi, hibah, dan isian profil lain adalah SIMULASI.
type L = { name: string; edu: "S2" | "S3"; nidn?: string; sinta?: string; scopus?: string; track: TrackKey; expertise: string[]; alumni?: boolean; courses?: string[]; bio?: string };
const LECTURERS: L[] = [
  { name: "Prof. Dr. Asep Kuswandi Supriatna, MS.", edu: "S3", nidn: "0010016506", sinta: "64593", scopus: "8318439700", track: "education", expertise: ["Biomatematika", "Pemodelan Epidemi", "Kontrol Optimal"] },
  { name: "Prof. Dr. Sudradjat, MS", edu: "S3", nidn: "0019055805", sinta: "6021929", scopus: "55668412000", track: "operations", expertise: ["Riset Operasi", "Optimasi", "Pemrograman Matematika"] },
  { name: "Prof. Dr. Sukono, MM., M.Si.", edu: "S3", nidn: "0019045602", sinta: "6034164", scopus: "55953611400", track: "actuarial", expertise: ["Matematika Keuangan", "Aktuaria", "Manajemen Risiko"] },
  { name: "Prof. Dr. Budi Nurani Ruchjana, MS.", edu: "S3", nidn: "0023126313", sinta: "5999022", scopus: "25229331100", track: "data", expertise: ["Statistika", "Proses Stokastik", "Analisis Data Spasial"] },
  { name: "Prof. Dr. Diah Chaerani, M.Si", edu: "S3", nidn: "0005067601", sinta: "257832", scopus: "26435734800", track: "operations", expertise: ["Optimasi Robust", "Riset Operasi", "Rantai Pasok"] },
  { name: "Prof. Dr. Endang Rusyaman, MS.", edu: "S3", nidn: "0008046102", sinta: "6022807", scopus: "25633128800", track: "education", expertise: ["Analisis", "Persamaan Diferensial", "Kalkulus Fraksional"] },
  { name: "Prof. Dr. Nursanti Anggriani, M.Si.", edu: "S3", nidn: "0005057301", sinta: "5975094", scopus: "55669296500", track: "education", expertise: ["Biomatematika", "Pemodelan Epidemi", "Sistem Dinamik"] },
  { name: "Dr. Ema Carnia, M.Si.", edu: "S3", nidn: "0006036701", sinta: "6003286", scopus: "57189732100", track: "software", expertise: ["Aljabar", "Aljabar Linear", "Teori Matriks"] },
  { name: "Dr. Dianne Amor Kusuma, S.Pd., M.Pd.", edu: "S3", nidn: "0031037404", sinta: "6033988", scopus: "57190047530", track: "education", expertise: ["Pendidikan Matematika", "Etnomatematika", "Pembelajaran Matematika"] },
  { name: "Dr. Sri Purwani, M.Sc.", edu: "S3", nidn: "0002056503", sinta: "5987379", scopus: "56442665700", track: "software", expertise: ["Teori Graf", "Kombinatorika", "Matematika Diskrit"] },
  { name: "Dr. Riaman, S.Si., M.Si.", edu: "S3", nidn: "0005017010", sinta: "6094738", scopus: "57197762472", track: "actuarial", expertise: ["Aktuaria", "Matematika Asuransi", "Statistika"] },
  { name: "Edi Kurniadi, S.Si., M.Si, Ph.D.", edu: "S3", nidn: "0018048103", sinta: "6096401", scopus: "57211168211", track: "software", expertise: ["Aljabar", "Teori Grup Lie", "Kriptografi"] },
  { name: "Badrulfalah, Dra., MS", edu: "S2", nidn: "0003036513", sinta: "6089728", track: "actuarial", expertise: ["Matematika Keuangan", "Statistika"] },
  { name: "Dr. Firdaniza, Dra., M.Si.", edu: "S3", nidn: "0018066901", sinta: "6083591", scopus: "56646481300", track: "risk", expertise: ["Statistika", "Ekonometrika", "Analisis Runtun Waktu"] },
  { name: "Kankan Parmikanti, Dra., M.Stat.", edu: "S2", nidn: "0006046202", sinta: "6201399", scopus: "57193949056", track: "data", expertise: ["Statistika", "Analisis Data"] },
  { name: "Betty Subartini, Dra., M.Si.", edu: "S2", nidn: "0026016101", sinta: "6089729", scopus: "57193949420", track: "risk", expertise: ["Matematika Keuangan", "Statistika Keuangan"] },
  { name: "Dwi Susanti, Dra., M.Si.", edu: "S2", nidn: "0029096501", sinta: "6097372", scopus: "24067761300", track: "actuarial", expertise: ["Aktuaria", "Statistika"] },
  { name: "Dr. Alit Kartiwa, M.Si", edu: "S3", nidn: "0005087304", sinta: "6102155", scopus: "57193565700", track: "operations", expertise: ["Riset Operasi", "Optimasi"] },
  { name: "Julita Nahar, Dra., MT", edu: "S2", nidn: "0018076501", sinta: "6084853", scopus: "57195379780", track: "operations", expertise: ["Riset Operasi", "Sistem Antrean"] },
  { name: "Nurul Gusriani, S.Si., M.Si", edu: "S2", nidn: "0018087001", sinta: "6094150", scopus: "57201549861", track: "education", expertise: ["Analisis Numerik", "Pemodelan Matematika"] },
  { name: "Dr. Muhamad Deni Johansyah, Drs., MM", edu: "S3", nidn: "0014126001", sinta: "6010122", scopus: "57211939846", track: "risk", expertise: ["Matematika Keuangan", "Manajemen Risiko", "Analisis Investasi"] },
  { name: "Herlina Napitupulu, M.Sc., Ph.D.", edu: "S3", nidn: "0008048804", sinta: "6666962", scopus: "57199199191", track: "operations", expertise: ["Optimasi", "Metode Numerik"] },
  { name: "Dr. Sisilia Sylviani, S.Si., M.Si", edu: "S3", nidn: "0018128801", sinta: "6068947", scopus: "55637367200", track: "risk", expertise: ["Matematika Keuangan", "Manajemen Risiko"] },
  { name: "Dr. Anita Triska, S.Si., M.Si", edu: "S3", nidn: "0028128302", sinta: "6097337", scopus: "57208126530", track: "education", expertise: ["Pemodelan Matematika", "Persamaan Diferensial"] },
  {
    name: "Dr. Moch Panji Agung Saputra, M.Mat",
    edu: "S3",
    track: "risk",
    alumni: true,
    expertise: ["Pemodelan Risiko Perbankan", "Value-at-Risk", "Catastrophe Bond", "Logika Fuzzy", "Ekonomi Sirkular"],
    courses: ["Matematika Keuangan", "Pemodelan dan Teori Risiko", "Matematika Aktuaria", "Aspek Matematika Dana Pensiun", "Pengantar Teori Optimasi"],
    bio: "Dosen tetap Departemen Matematika FMIPA Unpad dan alumni S1, S2, S3 Matematika Unpad. Fokus riset pada pemodelan dan optimasi risiko perbankan, Value-at-Risk, catastrophe bond, teori himpunan fuzzy, dan model matematika ekonomi sirkular. Terbuka untuk kolaborasi riset dengan mitra perbankan, asuransi, dan industri.",
  },
  { name: "Dr. Fatuh Inayaturohmat, S.Mat., M.Mat", edu: "S3", track: "risk", expertise: ["Matematika Keuangan", "Optimasi"] },
  { name: "Monika Hidayanti, S.Si. MT", edu: "S2", nidn: "0011017103", sinta: "6736817", track: "operations", expertise: ["Riset Operasi", "Statistika Industri"] },
];


// ---------------------------------------------------------------------
// Pembangkit acak deterministik
// ---------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261103);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const chance = (p: number) => rnd() < p;
// RNG terpisah untuk atribut tambahan, agar data utama tetap sama
const rnd2 = mulberry32(777);
const chance2 = (p: number) => rnd2() < p;
const sample = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0]);
  return out;
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");

const TRACK_KEYS = Object.keys(TRACKS) as TrackKey[];
const TRACK_WEIGHTS: TrackKey[] = [
  "actuarial", "actuarial", "actuarial", "data", "data", "data", "data",
  "risk", "risk", "risk", "software", "education", "education", "operations", "operations",
];

const usedNames = new Set<string>();
function makeName(): string {
  for (let i = 0; i < 200; i++) {
    const n = `${pick(FIRST)} ${pick(LAST)}`;
    if (!usedNames.has(n)) {
      usedNames.add(n);
      return n;
    }
  }
  return `Civitas ${usedNames.size}`;
}

function npmFor(entry: number, i: number) {
  return `1401${String(entry % 100).padStart(2, "0")}${String(100 + i).padStart(4, "0")}`;
}

function maskPhone() {
  return `+62 8${Math.floor(10 + rnd() * 89)}-****-${Math.floor(1000 + rnd() * 8999)}`;
}

export const TODAY = "2026-11-03";

function monthsBetween(ym: string, today = TODAY) {
  const [y, m] = ym.split("-").map(Number);
  const [ty, tm] = today.split("-").map(Number);
  return (ty - y) * 12 + (tm - m);
}

function buildPeople(): Person[] {
  const people: Person[] = [];
  let idx = 0;

  // ---- Mahasiswa aktif (S1), angkatan 2021–2025
  for (let i = 0; i < 26; i++) {
    const entry = pick([2021, 2022, 2022, 2023, 2023, 2024, 2025]);
    const track = pick(TRACK_WEIGHTS);
    const T = TRACKS[track];
    const name = makeName();
    const [city, province] = rnd() < 0.7 ? ["Sumedang", "Jawa Barat"] : pick(CITIES);
    const finalYear = entry <= 2022;
    const skills = sample(T.skills, 3 + Math.floor(rnd() * 3));
    const certs: Cert[] = chance(finalYear ? 0.6 : 0.25)
      ? [{ ...pick(T.certs.slice(0, 1).concat(TRACKS.data.certs.slice(0, 1))), year: 2025 + Math.floor(rnd() * 2), verified: chance(0.4) }]
      : [];
    people.push({
      id: `p${++idx}`,
      name,
      roles: ["student"],
      program: "S1",
      npm: npmFor(entry, i),
      entryYear: entry,
      stage: "student",
      track,
      headline: `Mahasiswa S1 Matematika angkatan ${entry} · minat ${T.label}`,
      bio: `Mahasiswa Matematika FMIPA Unpad yang tertarik pada ${T.label.toLowerCase()}. ${
        finalYear ? "Sedang menyusun tugas akhir dan mencari pengalaman magang." : "Aktif di kegiatan himpunan dan kompetisi."
      }`,
      city,
      province,
      skills,
      certs,
      experience: finalYear && chance(0.5) ? [{ title: "Asisten Praktikum", company: "Departemen Matematika FMIPA Unpad", start: 2024 }] : [],
      openToWork: false,
      openToProject: chance(0.3),
      seekingInternship: finalYear ? chance(0.85) : chance(0.35),
      collab: chance2(finalYear ? 0.45 : 0.2) ? ["research_assistant"] : [],
      researchTopics: chance2(0.5) ? [T.label] : undefined,
      portfolio: chance2(0.5) ? [{ title: `Proyek ${T.skills[0]}`, url: "https://github.com/contoh", desc: `Proyek mata kuliah bidang ${T.label.toLowerCase()}` }] : undefined,
      catalogConsent: finalYear && chance(0.6),
      visibility: finalYear && chance(0.6) ? "recruiters" : "internal",
      email: `${slug(name)}@mail.contoh.id`,
      phone: maskPhone(),
      thesis: finalYear ? pick(T.thesis) : undefined,
      verified: chance(0.9),
      profileCompleteness: 55 + Math.floor(rnd() * 45),
      updatedMonthsAgo: Math.floor(rnd() * 5),
    });
  }

  // ---- Alumni S1, lulus 2008–2026
  for (let i = 0; i < 46; i++) {
    const fresh = i < 12;
    const gradYear = fresh ? pick([2025, 2026, 2026, 2026]) : 2008 + Math.floor(rnd() * 17);
    const gradMonth = fresh ? (gradYear === 2025 ? pick([11, 12]) : pick([2, 4, 5, 8, 9])) : pick([3, 5, 8, 10, 12]);
    const gradDate = `${gradYear}-${String(gradMonth).padStart(2, "0")}`;
    const entry = gradYear - 4 - (chance(0.3) ? 1 : 0);
    const track = pick(TRACK_WEIGHTS);
    const T = TRACKS[track];
    const name = makeName();
    const [city, province] = pick(CITIES);
    const sector = pick(T.sectors);
    const company = pick(COMPANIES[sector]);
    const seniority = 2026 - gradYear;
    const baseTitle = pick(T.titles);
    const indo = /^(Aktuaris|Analis|Guru|Peneliti|Pengajar)/.test(baseTitle);
    const jobTitle = fresh
      ? chance(0.5) ? undefined : indo ? `${baseTitle} Junior` : `Junior ${baseTitle}`
      : seniority > 12
        ? indo ? `${baseTitle} Utama` : `Head of ${baseTitle}`
        : seniority > 6
          ? indo ? `${baseTitle} Senior` : `Senior ${baseTitle}`
          : baseTitle;
    const employed = !!jobTitle;
    const skills = sample(T.skills, 4 + Math.floor(rnd() * 3));
    const certCount = fresh ? (chance(0.6) ? 1 : 0) : Math.min(T.certs.length, 1 + Math.floor(rnd() * 2));
    const certs: Cert[] = sample(T.certs, certCount).map((c) => ({
      ...c,
      year: Math.min(2026, gradYear + 1 + Math.floor(rnd() * Math.max(1, seniority))),
      verified: chance(0.55),
    }));
    const experience: Experience[] = [];
    if (employed) {
      if (!fresh && seniority > 4) {
        const prevSector = pick(T.sectors);
        experience.push({ title: pick(T.titles), company: pick(COMPANIES[prevSector]), start: gradYear, end: gradYear + 2 + Math.floor(rnd() * 3) });
      }
      experience.unshift({ title: jobTitle!, company, start: Math.max(gradYear, 2026 - Math.floor(rnd() * 6) - 1) });
    }
    const openToWork = fresh ? (employed ? chance(0.4) : true) : chance(0.22);
    const collab: CollabType[] = [];
    if (!fresh) {
      if (chance(0.4)) collab.push("research_partner");
      if (chance(0.35)) collab.push("speaker");
      if (chance(0.25)) collab.push("guest_lecturer");
      if (chance(0.45)) collab.push("mentor");
      if (chance(0.3)) collab.push("internship_host");
    }
    const consent = openToWork ? chance(0.85) : chance(0.2);
    people.push({
      id: `p${++idx}`,
      name,
      roles: ["alumni"],
      program: "S1",
      npm: npmFor(entry, 40 + i),
      entryYear: entry,
      gradDate,
      stage: monthsBetween(gradDate) <= 12 ? "fresh_graduate" : "professional",
      track,
      headline: employed ? `${jobTitle} · ${company}` : `Fresh Graduate Matematika Unpad ${gradYear} · ${T.label}`,
      bio: employed
        ? `Alumni Matematika Unpad angkatan ${entry}. Berkarier di sektor ${sector.toLowerCase()} dengan fokus ${T.label.toLowerCase()}.`
        : `Lulusan S1 Matematika Unpad ${gradYear}. Mencari posisi entry level di bidang ${T.label.toLowerCase()}.`,
      city,
      province,
      sector: employed ? sector : undefined,
      company: employed ? company : undefined,
      jobTitle,
      skills,
      certs,
      experience,
      openToWork,
      openToProject: !fresh && chance(0.35),
      seekingInternship: false,
      collab,
      catalogConsent: consent,
      visibility: consent ? "recruiters" : chance(0.9) ? "internal" : "private",
      email: `${slug(name)}@contoh.id`,
      phone: maskPhone(),
      thesis: pick(T.thesis),
      verified: chance(0.88),
      profileCompleteness: 60 + Math.floor(rnd() * 40),
      updatedMonthsAgo: Math.floor(rnd() * 14),
    });
  }

  // ---- Dosen (nama & ID akademik dari daftar resmi; isian profil simulasi)
  LECTURERS.forEach((L, i) => {
    const T = TRACKS[L.track];
    const isProf = L.name.startsWith("Prof.");
    const short = L.name.replace(/^(Prof\. )?Dr\. /, "").split(",")[0];
    people.push({
      id: `d${i + 1}`,
      name: L.name,
      roles: L.alumni ? ["lecturer", "alumni"] : ["lecturer"],
      program: L.edu,
      npm: L.nidn ? `NIDN ${L.nidn}` : "—",
      entryYear: L.alumni ? 2014 : 0,
      stage: "academic",
      track: L.track,
      headline: `Dosen Departemen Matematika FMIPA Unpad · ${L.expertise[0]}`,
      bio: L.bio ?? `Dosen Departemen Matematika FMIPA Unpad dengan kepakaran ${L.expertise.join(", ")}. Terbuka untuk kolaborasi riset dan konsorsium hibah bersama mitra industri.`,
      city: "Sumedang",
      province: "Jawa Barat",
      sector: "Pendidikan",
      company: "Departemen Matematika FMIPA Unpad",
      jobTitle: "Dosen",
      skills: [...L.expertise, ...T.skills.filter((s) => !L.expertise.includes(s)).slice(0, 2)].slice(0, 6),
      certs: [],
      experience: [],
      openToWork: false,
      openToProject: true,
      seekingInternship: false,
      collab: [],
      catalogConsent: false,
      visibility: "internal",
      email: `${slug(short)}@unpad.contoh.id`,
      phone: "+62 22-****-" + String(1000 + i * 37).slice(0, 4),
      expertise: L.expertise,
      nidn: L.nidn,
      academicRank: isProf ? "Guru Besar" : undefined,
      researchGroup: `Kelompok Riset ${L.expertise[0]}`,
      sintaId: L.sinta,
      scopusId: L.scopus,
      courses: L.courses ?? [L.expertise[0], "Kalkulus"],
      publications: [
        { title: `Model ${L.expertise[0]} untuk Studi Kasus Indonesia`, venue: "Contoh publikasi (simulasi)", year: 2025, indexing: "Sinta 2" },
        { title: `Pendekatan Baru dalam ${L.expertise[1] ?? L.expertise[0]}`, venue: "Contoh publikasi (simulasi)", year: 2024, indexing: "Scopus Q2" },
      ],
      grants: [{ title: `Pengembangan ${L.expertise[0]} Berbasis Data (simulasi)`, scheme: "Hibah Internal Unpad", year: 2025, role: "Ketua" }],
      partnerSectorsSought: T.sectors.slice(0, 2),
      partnerNeeds: ["Data studi kasus", "Praktisi mengajar"],
      seekingAssistants: i % 2 === 0,
      assistantSkills: T.skills.slice(0, 3),
      supervisionTopics: L.expertise.slice(0, 2),
      supervisionSlots: 1 + (i % 3),
      verified: true,
      profileCompleteness: 80,
      updatedMonthsAgo: 1,
    });
  });

  return people;
}

export const PEOPLE: Person[] = buildPeople();

export const personById = (id: string) => PEOPLE.find((p) => p.id === id);

export const ALL_SKILLS = Array.from(new Set(TRACK_KEYS.flatMap((k) => TRACKS[k].skills))).sort();
export const ALL_CERTS = Array.from(new Set(TRACK_KEYS.flatMap((k) => TRACKS[k].certs.map((c) => c.name)))).sort();

// ---------------------------------------------------------------------
// Persona untuk simulasi login
// ---------------------------------------------------------------------
export type AppRole = "guest" | "student" | "alumni" | "lecturer" | "recruiter" | "admin";

const firstOf = (f: (p: Person) => boolean) => PEOPLE.find(f)!;

export const PERSONAS: Record<AppRole, { label: string; name: string; subtitle: string; personId?: string }> = {
  guest: { label: "Tamu", name: "Pengunjung", subtitle: "Belum masuk" },
  student: (() => {
    const p = firstOf((x) => x.stage === "student" && x.entryYear <= 2022 && x.seekingInternship);
    return { label: "Mahasiswa", name: p.name, subtitle: `Mahasiswa S1 angkatan ${p.entryYear}`, personId: p.id };
  })(),
  alumni: (() => {
    const p = firstOf((x) => x.stage === "professional" && !!x.jobTitle && x.collab.includes("internship_host"));
    return { label: "Alumni", name: p.name, subtitle: p.headline, personId: p.id };
  })(),
  lecturer: (() => {
    const p = firstOf((x) => x.stage === "academic" && x.name.includes("Moch Panji"));
    return { label: "Dosen", name: p.name, subtitle: "Dosen Departemen Matematika", personId: p.id };
  })(),
  recruiter: { label: "HRD Verified", name: "Sinta Maharani", subtitle: "Talent Acquisition · PT Arunika Data Nusantara" },
  admin: { label: "Admin / Moderator", name: "Moderator IKAMAT", subtitle: "Pengurus IKAMAT Unpad" },
};

// ---------------------------------------------------------------------
// Lowongan
// ---------------------------------------------------------------------
export type JobCategory = "internship" | "full_time" | "contract" | "project";
export type JobLevel = "entry" | "mid" | "senior";
export type Audience = "active_students" | "fresh_graduates" | "open_to_work" | "open_to_project" | "research_partners";

export interface Job {
  id: string;
  title: string;
  company: string;
  posterId?: string;
  posterName: string;
  category: JobCategory;
  level: JobLevel;
  workMode: "Onsite" | "Hybrid" | "Remote";
  location: string;
  postedAt: string;
  deadline: string;
  description: string;
  requirements: string[];
  skills: string[];
  targets: Audience[];
  skillFilter: boolean;
  status: "published" | "pending_review" | "rejected";
  isPublic: boolean;
  stats: { views: number; clicks: number; sent: number };
}

export const CATEGORY_LABEL: Record<JobCategory, string> = {
  internship: "Magang",
  full_time: "Full-time",
  contract: "Kontrak",
  project: "Proyek / Konsultansi",
};
export const LEVEL_LABEL: Record<JobLevel, string> = { entry: "Entry level", mid: "Mid level", senior: "Senior" };
export const AUDIENCE_LABEL: Record<Audience, string> = {
  active_students: "Mahasiswa aktif",
  fresh_graduates: "Fresh Graduate",
  open_to_work: "Civitas Open to Work",
  open_to_project: "Civitas Open to Project",
  research_partners: "Alumni mitra riset",
};

/** Aturan routing bawaan per kategori (lihat SRS bagian 5.1). */
export function defaultTargets(category: JobCategory, level: JobLevel): Audience[] {
  if (category === "internship") return ["active_students"];
  if (category === "project") return ["open_to_project"];
  if (category === "contract") return ["open_to_work"];
  return level === "entry" ? ["fresh_graduates", "open_to_work"] : ["open_to_work"];
}

export function matchesAudience(p: Person, a: Audience, job: Pick<Job, "level" | "category">): boolean {
  switch (a) {
    case "active_students":
      return p.stage === "student" && (job.category !== "internship" || p.seekingInternship || p.entryYear <= 2023);
    case "fresh_graduates":
      return p.stage === "fresh_graduate";
    case "open_to_work":
      if (!p.openToWork) return false;
      if (job.category === "full_time" && job.level !== "entry") return p.stage === "professional";
      return true;
    case "open_to_project":
      return p.openToProject;
    case "research_partners":
      return p.collab.includes("research_partner");
  }
}

export interface AudienceResult {
  segments: { audience: Audience; count: number }[];
  recipients: Person[];
  removedBySkill: number;
  duplicatesMerged: number;
}

export function resolveAudience(job: Pick<Job, "targets" | "skills" | "skillFilter" | "level" | "category">, people = PEOPLE): AudienceResult {
  const segments = job.targets.map((a) => ({ audience: a, count: people.filter((p) => p.verified && matchesAudience(p, a, job)).length }));
  const union = people.filter((p) => p.verified && job.targets.some((a) => matchesAudience(p, a, job)));
  const totalSeg = segments.reduce((s, x) => s + x.count, 0);
  let recipients = union;
  let removedBySkill = 0;
  if (job.skillFilter && job.skills.length) {
    recipients = union.filter((p) => p.skills.some((s) => job.skills.includes(s)));
    removedBySkill = union.length - recipients.length;
  }
  return { segments, recipients, removedBySkill, duplicatesMerged: totalSeg - union.length };
}

function job(j: Omit<Job, "targets" | "stats" | "status" | "isPublic" | "skillFilter"> & Partial<Pick<Job, "targets" | "status" | "isPublic" | "skillFilter">>): Job {
  const targets = j.targets ?? defaultTargets(j.category, j.level);
  const base: Job = { ...j, targets, skillFilter: j.skillFilter ?? false, status: j.status ?? "published", isPublic: j.isPublic ?? true, stats: { views: 0, clicks: 0, sent: 0 } };
  const sent = resolveAudience(base).recipients.length;
  base.stats = { sent, views: Math.round(sent * (1.6 + rnd() * 2.5)), clicks: Math.round(sent * (0.15 + rnd() * 0.3)) };
  return base;
}

const alumniPosters = PEOPLE.filter((p) => p.stage === "professional" && p.jobTitle);
const posterIn = (sector: string) => alumniPosters.find((p) => p.sector === sector) ?? alumniPosters[0];

export const JOBS: Job[] = [
  job({
    id: "j1",
    title: "Magang Data Analyst (6 bulan)",
    company: "PT Arunika Data Nusantara",
    posterId: posterIn("Teknologi").id,
    posterName: posterIn("Teknologi").name,
    category: "internship",
    level: "entry",
    workMode: "Hybrid",
    location: "Bandung",
    postedAt: "2026-11-01",
    deadline: "2026-11-30",
    description: "Bergabung dengan tim analitik untuk membangun dasbor performa produk dan analisis kohort pengguna. Cocok untuk mahasiswa tingkat akhir yang ingin magang bersertifikat.",
    requirements: ["Mahasiswa aktif minimal semester 5", "Menguasai SQL dasar dan Python", "Bersedia hybrid di Bandung 3 hari/minggu"],
    skills: ["SQL", "Python", "Visualisasi Data"],
  }),
  job({
    id: "j2",
    title: "Actuarial Analyst (Entry Level)",
    company: "PT Asuransi Jiwa Pelita Nusantara",
    posterId: posterIn("Asuransi").id,
    posterName: posterIn("Asuransi").name,
    category: "full_time",
    level: "entry",
    workMode: "Onsite",
    location: "Jakarta Selatan",
    postedAt: "2026-10-28",
    deadline: "2026-11-25",
    description: "Mendukung tim pricing dan valuasi produk asuransi jiwa. Program pengembangan menuju sertifikasi PAI disponsori perusahaan.",
    requirements: ["S1 Matematika/Aktuaria", "Lulus minimal 1 ujian PAI menjadi nilai tambah", "Mahir Excel, terbiasa dengan R atau Python"],
    skills: ["Pemodelan Aktuaria", "Matematika Asuransi", "Excel VBA"],
  }),
  job({
    id: "j3",
    title: "Credit Risk Modeler",
    company: "Bank Sentosa Raya",
    posterId: posterIn("Perbankan").id,
    posterName: posterIn("Perbankan").name,
    category: "full_time",
    level: "mid",
    workMode: "Hybrid",
    location: "Jakarta Pusat",
    postedAt: "2026-10-25",
    deadline: "2026-11-20",
    description: "Mengembangkan dan memvalidasi model PD/LGD untuk portofolio kredit ritel sesuai standar regulator.",
    requirements: ["Pengalaman 3+ tahun pemodelan risiko", "Menguasai Python/SAS", "Sertifikasi manajemen risiko menjadi nilai tambah"],
    skills: ["Pemodelan Kredit", "Manajemen Risiko", "Python"],
  }),
  job({
    id: "j4",
    title: "Magang Aktuaria – Dana Pensiun",
    company: "Dana Pensiun Lembaga Keuangan Cakra",
    posterId: posterIn("Dana Pensiun").id,
    posterName: posterIn("Dana Pensiun").name,
    category: "internship",
    level: "entry",
    workMode: "Onsite",
    location: "Bandung",
    postedAt: "2026-10-20",
    deadline: "2026-11-15",
    description: "Membantu perhitungan kewajiban aktuaria dan penyusunan laporan valuasi tahunan.",
    requirements: ["Mahasiswa S1 Matematika semester 6 ke atas", "Telah mengambil mata kuliah Matematika Aktuaria"],
    skills: ["Valuasi Dana Pensiun", "Matematika Asuransi"],
  }),
  job({
    id: "j5",
    title: "Konsultan Riset Operasi – Optimasi Rute",
    company: "PT Logistik Cepat Mandala",
    posterId: posterIn("Logistik").id,
    posterName: posterIn("Logistik").name,
    category: "project",
    level: "mid",
    workMode: "Remote",
    location: "Remote",
    postedAt: "2026-10-30",
    deadline: "2026-12-10",
    description: "Proyek 3 bulan merancang model optimasi rute armada untuk 4 gudang regional Jawa Barat.",
    requirements: ["Pengalaman model VRP/MILP", "Mampu menggunakan Python (OR-Tools/Pyomo)"],
    skills: ["Riset Operasi", "Optimasi", "Pemrograman Linear"],
  }),
  job({
    id: "j6",
    title: "Junior Data Scientist",
    company: "Belanjaku.id",
    posterId: posterIn("E-commerce").id,
    posterName: posterIn("E-commerce").name,
    category: "full_time",
    level: "entry",
    workMode: "Hybrid",
    location: "Jakarta Selatan",
    postedAt: "2026-10-18",
    deadline: "2026-11-18",
    description: "Membangun model rekomendasi produk dan eksperimen A/B bersama tim growth.",
    requirements: ["S1 Matematika/Statistika", "Menguasai Python dan dasar machine learning", "Portofolio proyek data menjadi nilai tambah"],
    skills: ["Python", "Machine Learning", "Statistika"],
    skillFilter: true,
  }),
  job({
    id: "j7",
    title: "Guru Matematika Olimpiade (Paruh Waktu)",
    company: "Bimbel Sigma Prima",
    posterId: posterIn("Pendidikan").id,
    posterName: posterIn("Pendidikan").name,
    category: "contract",
    level: "entry",
    workMode: "Onsite",
    location: "Bandung",
    postedAt: "2026-10-15",
    deadline: "2026-11-30",
    description: "Mengajar kelas pembinaan olimpiade matematika tingkat SMA, 3 sesi per minggu.",
    requirements: ["Pernah mengikuti/membina olimpiade matematika", "Komunikatif"],
    skills: ["Pendidikan Matematika"],
    targets: ["open_to_work", "active_students"],
  }),
  job({
    id: "j8",
    title: "Quantitative Analyst",
    company: "PT Sekuritas Meridian",
    posterId: posterIn("Pasar Modal").id,
    posterName: posterIn("Pasar Modal").name,
    category: "full_time",
    level: "senior",
    workMode: "Onsite",
    location: "Jakarta Pusat",
    postedAt: "2026-10-10",
    deadline: "2026-11-10",
    description: "Mengembangkan model penetapan harga derivatif dan strategi kuantitatif untuk desk perdagangan.",
    requirements: ["Pengalaman 5+ tahun", "Kuat di kalkulus stokastik dan Python"],
    skills: ["Optimasi Portofolio", "Value-at-Risk", "Python"],
  }),
];

// ---------------------------------------------------------------------
// Kebutuhan riset / hibah dari dosen
// ---------------------------------------------------------------------
export interface ResearchNeed {
  id: string;
  lecturerId: string;
  title: string;
  scheme: string;
  partnerRole: string;
  sectors: string[];
  skills: string[];
  deadline: string;
  interested: number;
  description?: string;
}

const lec = PEOPLE.filter((p) => p.stage === "academic");
const lecBy = (part: string) => lec.find((p) => p.name.includes(part)) ?? lec[0];

export const RESEARCH_NEEDS: ResearchNeed[] = [
  {
    id: "r1",
    lecturerId: lecBy("Sukono").id,
    title: "Model Cadangan Klaim Berbasis Machine Learning untuk Asuransi Umum",
    scheme: "Hibah Riset Kolaborasi Industri",
    partnerRole: "Mitra industri penyedia data klaim dan praktisi aktuaria",
    sectors: ["Asuransi", "Konsultan Aktuaria"],
    skills: ["Pemodelan Aktuaria", "Machine Learning"],
    deadline: "2026-12-15",
    interested: 3,
  },
  {
    id: "r2",
    lecturerId: lecBy("Moch Panji").id,
    title: "Stress Testing Risiko Iklim pada Portofolio Kredit Perbankan",
    scheme: "Hibah Konsorsium Nasional",
    partnerRole: "Bank mitra sebagai anggota konsorsium",
    sectors: ["Perbankan", "Fintech"],
    skills: ["Manajemen Risiko", "Value-at-Risk", "Pemodelan Kredit"],
    deadline: "2027-01-20",
    interested: 2,
  },
  {
    id: "r3",
    lecturerId: lecBy("Diah Chaerani").id,
    title: "Optimasi Robust Rantai Pasok Pangan Jawa Barat",
    scheme: "Pengabdian kepada Masyarakat",
    partnerRole: "Praktisi logistik sebagai narasumber dan penyedia studi kasus",
    sectors: ["Logistik", "Manufaktur"],
    skills: ["Riset Operasi", "Optimasi", "Supply Chain Analytics"],
    deadline: "2026-12-01",
    interested: 4,
  },
  {
    id: "r4",
    lecturerId: lecBy("Budi Nurani").id,
    title: "Praktisi Mengajar: Data Science di Industri",
    scheme: "Program Praktisi Mengajar",
    partnerRole: "Alumni praktisi data sebagai dosen tamu 4 pertemuan",
    sectors: ["Teknologi", "E-commerce", "Telekomunikasi"],
    skills: ["Python", "Machine Learning"],
    deadline: "2026-11-28",
    interested: 6,
  },
];

export const COLLAB_LABEL: Record<CollabType, string> = {
  research_partner: "Mitra riset",
  speaker: "Pembicara",
  guest_lecturer: "Praktisi mengajar",
  mentor: "Mentor",
  internship_host: "Penyedia magang",
  research_assistant: "Asisten riset",
};

export const PROVINCES = [
  "Jawa Barat", "DKI Jakarta", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali", "Sumatera Utara", "Sumatera Barat",
  "Riau", "Sumatera Selatan", "Lampung", "Kalimantan Timur", "Sulawesi Selatan", "Lainnya / luar negeri",
];

export const ALL_ROLES = Array.from(new Set((Object.keys(TRACKS) as TrackKey[]).flatMap((k) => TRACKS[k].titles))).sort();

/** Skor kelengkapan profil 0–100 beserta daftar yang belum diisi. */
export function completeness(p: Person) {
  if (p.stage === "academic") {
    const c: [boolean, string, number][] = [
      [!!p.bio && p.bio.length >= 80, "Ringkasan diri minimal 80 karakter", 10],
      [(p.expertise?.length ?? 0) >= 2, "Minimal dua bidang kepakaran", 15],
      [!!p.researchGroup, "Kelompok riset", 5],
      [!!p.sintaId || !!p.scopusId || !!p.scholarUrl, "ID Sinta, Scopus, atau Google Scholar", 15],
      [!!p.photo, "Foto profil", 5],
      [(p.publications?.length ?? 0) > 0, "Publikasi pilihan", 10],
      [(p.grants?.length ?? 0) > 0, "Riwayat hibah", 10],
      [(p.courses?.length ?? 0) > 0, "Mata kuliah yang diampu", 10],
      [(p.partnerSectorsSought?.length ?? 0) > 0, "Sektor mitra yang dicari", 10],
      [(p.supervisionTopics?.length ?? 0) > 0, "Topik bimbingan", 10],
    ];
    return { score: c.reduce((s, [ok, , w]) => s + (ok ? w : 0), 0), missing: c.filter(([ok]) => !ok).map(([, l]) => l) };
  }
  const checks: [boolean, string, number][] = [
    [!!p.headline && p.headline.length > 10, "Judul profil (headline)", 10],
    [!!p.bio && p.bio.length >= 80, "Ringkasan diri minimal 80 karakter", 10],
    [!!p.city, "Kota domisili", 5],
    [!!p.linkedin, "Tautan LinkedIn", 5],
    [!!p.thesis || p.stage === "student", "Judul tugas akhir", 5],
    [p.experience.length > 0, "Minimal satu pengalaman", 15],
    [!!p.photo, "Foto profil", 5],
    [p.skills.length >= 3, "Minimal tiga keahlian", 10],
    [p.certs.length > 0, "Sertifikasi", 10],
    [(p.portfolio?.length ?? 0) > 0 || !!p.github, "Portofolio atau GitHub", 10],
    [!!p.cvFile, "Unggah CV", 10],
    [(p.preferredRoles?.length ?? 0) > 0, "Peran yang diminati", 5],
  ];
  const score = checks.reduce((s, [ok, , w]) => s + (ok ? w : 0), 0);
  return { score, missing: checks.filter(([ok]) => !ok).map(([, l]) => l) };
}

// ---------------------------------------------------------------------
// Antrean verifikasi (admin)
// ---------------------------------------------------------------------
export interface VerificationRequest {
  id: string;
  name: string;
  role: "Alumni" | "Mahasiswa";
  npm: string;
  gradYear?: number;
  evidence: string;
  match: "cocok" | "sebagian" | "tidak ditemukan";
  submittedAt: string;
}

export const VERIFICATION_QUEUE: VerificationRequest[] = [
  { id: "v1", name: "Arya Wicaksana", role: "Alumni", npm: "140110080123", gradYear: 2012, evidence: "Ijazah (PDF)", match: "cocok", submittedAt: "2026-11-03" },
  { id: "v2", name: "Melinda Safitri", role: "Alumni", npm: "140110150087", gradYear: 2019, evidence: "Transkrip (PDF)", match: "sebagian", submittedAt: "2026-11-02" },
  { id: "v3", name: "Dani Kurnia", role: "Mahasiswa", npm: "140110250041", evidence: "Email kampus", match: "cocok", submittedAt: "2026-11-02" },
  { id: "v4", name: "R. Hendrawan", role: "Alumni", npm: "1401109912", gradYear: 2003, evidence: "Foto ijazah (JPG)", match: "tidak ditemukan", submittedAt: "2026-11-01" },
];

// ---------------------------------------------------------------------
// Statistik agregat
// ---------------------------------------------------------------------
export function aggregateStats(people = PEOPLE) {
  const alumni = people.filter((p) => p.roles.includes("alumni"));
  const sectorCount: Record<string, number> = {};
  alumni.forEach((p) => p.sector && (sectorCount[p.sector] = (sectorCount[p.sector] ?? 0) + 1));
  return {
    students: people.filter((p) => p.stage === "student").length,
    alumni: alumni.length,
    lecturers: people.filter((p) => p.stage === "academic").length,
    openToWork: people.filter((p) => p.openToWork).length,
    certs: people.reduce((s, p) => s + p.certs.length, 0),
    partners: people.filter((p) => p.collab.some((c) => c !== "research_assistant")).length,
    sectors: Object.entries(sectorCount).sort((a, b) => b[1] - a[1]),
  };
}

export function initials(name: string) {
  return name
    .replace(/^(Prof\. )?(Dr\. )?/, "")
    .split(",")[0]
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function maskedName(name: string) {
  const parts = name.split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : name;
}

export function fmtDate(d: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const [y, m, day] = d.split("-").map(Number);
  return day ? `${day} ${months[m - 1]} ${y}` : `${months[m - 1]} ${y}`;
}

export function stageLabel(p: Person) {
  if (p.stage === "student") return "Mahasiswa";
  if (p.stage === "fresh_graduate") return "Fresh Graduate";
  if (p.stage === "academic") return "Dosen";
  return "Alumni";
}
