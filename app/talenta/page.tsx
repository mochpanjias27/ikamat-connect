"use client";

import { useState } from "react";
import { Building2, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { PERSONAS, Person } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PersonCard } from "@/components/cards";
import { ContactModal } from "@/components/ContactModal";
import { FilterBar, applyFilters, emptyFilters } from "@/components/Filters";
import { Button, Card, Empty, PageHeader } from "@/components/ui";

export default function Talenta() {
  const { people, role, setRole, showToast } = useStore();
  const [f, setF] = useState(emptyFilters);
  const [contact, setContact] = useState<Person | null>(null);
  const isHRD = role === "recruiter" || role === "admin";
  const guest = !isHRD;

  const eligible = people.filter((p) => (p.openToWork || p.seekingInternship) && p.catalogConsent && p.visibility === "recruiters" && p.verified);
  const hidden = people.filter((p) => (p.openToWork || p.seekingInternship) && !(p.catalogConsent && p.visibility === "recruiters")).length;
  const list = applyFilters(eligible, { ...f, stage: "all" });
  const shown = guest ? list.slice(0, 6) : list;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow={isHRD ? "Portal HRD Verified" : "Katalog Talenta · tampilan publik"}
        title="Talent pool lulusan Matematika Unpad"
        desc="Hanya menampilkan civitas yang aktif mencari kerja atau magang dan memberi persetujuan tampil di katalog. Data kontak tidak pernah ditampilkan."
        actions={
          guest && (
            <Button
              onClick={() => {
                setRole("recruiter");
                showToast(`Masuk sebagai HRD Verified: ${PERSONAS.recruiter.name}`);
              }}
            >
              <Building2 size={16} /> Masuk sebagai HRD Verified
            </Button>
          )
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="flex gap-3 p-4">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-sky-600" />
          <p className="text-sm text-ink-600"><b className="text-ink-800">{eligible.length} kandidat</b> memberi persetujuan tampil di katalog.</p>
        </Card>
        <Card className="flex gap-3 p-4">
          <EyeOff size={20} className="mt-0.5 shrink-0 text-sky-600" />
          <p className="text-sm text-ink-600"><b className="text-ink-800">{hidden} civitas</b> mencari kerja namun memilih hanya terlihat di jaringan internal.</p>
        </Card>
        <Card className="flex gap-3 p-4">
          <Lock size={20} className="mt-0.5 shrink-0 text-sky-600" />
          <p className="text-sm text-ink-600">{guest ? "Tamu melihat nama tersamar & maksimal 6 profil." : "Hubungi kandidat lewat permintaan kontak. Kuota 30 per bulan."}</p>
        </Card>
      </div>

      <FilterBar f={f} set={setF} showStage={false} showOpen={false} />

      <p className="mb-4 mt-6 text-sm text-ink-500">
        {list.length} kandidat cocok{guest && list.length > 6 ? ` · menampilkan 6` : ""}
      </p>
      {shown.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <PersonCard
              key={p.id}
              p={p}
              masked={guest}
              noLink
              onContact={() => {
                if (guest) {
                  showToast("Masuk sebagai HRD Verified untuk mengirim permintaan kontak.");
                  return;
                }
                setContact(p);
              }}
            />
          ))}
        </div>
      ) : (
        <Empty title="Tidak ada kandidat yang cocok" desc="Coba longgarkan filter." />
      )}

      {guest && list.length > 6 && (
        <Card className="mt-6 flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-lg font-bold text-ink-900">{list.length - 6} kandidat lainnya tersedia untuk HRD terverifikasi</p>
          <p className="max-w-lg text-sm text-ink-500">Daftar dengan email domain perusahaan. Moderator IKAMAT memverifikasi perusahaan Anda sebelum akses penuh diberikan.</p>
          <Button onClick={() => { setRole("recruiter"); showToast(`Masuk sebagai HRD Verified: ${PERSONAS.recruiter.name}`); }}>Simulasikan akses HRD</Button>
        </Card>
      )}
      <ContactModal person={contact} onClose={() => setContact(null)} />
    </div>
  );
}
