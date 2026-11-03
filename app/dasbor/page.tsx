"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Briefcase, Check, Clock, Handshake, Inbox, Mail, Plus, Send, Users, X } from "lucide-react";
import { COLLAB_LABEL, PERSONAS, RESEARCH_NEEDS, completeness, resolveAudience } from "@/lib/data";
import { useStore } from "@/lib/store";
import { JobCard, PersonCard, RoleGate } from "@/components/cards";
import { Avatar, Badge, Button, Card, Empty, PageHeader, Stat } from "@/components/ui";

export default function Dasbor() {
  const { role, ready } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready && role === "admin") router.replace("/admin");
  }, [ready, role, router]);
  return (
    <RoleGate allow={["student", "alumni", "lecturer", "recruiter"]} title="Dashboard tersedia setelah masuk">
      {role === "recruiter" ? <RecruiterDash /> : <CivitasDash />}
    </RoleGate>
  );
}

function ContactInbox() {
  const { contactRequests, me, answerContact, showToast } = useStore();
  const mine = contactRequests.filter((c) => c.candidateId === me?.id);
  return (
    <Card className="p-6">
      <p className="flex items-center gap-2 font-bold text-ink-900"><Inbox size={18} className="text-sky-600" /> Permintaan kontak masuk</p>
      {mine.length === 0 && <p className="mt-3 text-sm text-ink-400">Belum ada permintaan.</p>}
      <ul className="mt-3 space-y-3">
        {mine.map((c) => (
          <li key={c.id} className="rounded-xl bg-ink-50 p-4">
            <div className="flex items-center gap-2">
              <Avatar name={c.fromName} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-800">{c.fromName}</p>
                <p className="truncate text-xs text-ink-500">{c.fromOrg} · {c.position}</p>
              </div>
              {c.status !== "pending" && <Badge tone={c.status === "accepted" ? "green" : "gray"}>{c.status === "accepted" ? "Diterima" : "Ditolak"}</Badge>}
            </div>
            <p className="mt-2 text-sm text-ink-600">{c.message}</p>
            {c.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => { answerContact(c.id, "accepted"); showToast("Diterima. Email & CV Anda kini terlihat oleh pengirim ini saja."); }}><Check size={14} /> Terima & bagikan kontak</Button>
                <Button size="sm" variant="ghost" onClick={() => { answerContact(c.id, "declined"); showToast("Ditolak. Pengirim hanya melihat status 'tidak tersedia'."); }}><X size={14} /> Tolak</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CivitasDash() {
  const { me, jobs, people, role, dispatches, invitations } = useStore();
  if (!me) return null;
  const published = jobs.filter((j) => j.status === "published");
  const matches = published.filter((j) => resolveAudience(j, people).recipients.some((p) => p.id === me.id));
  const myJobs = jobs.filter((j) => j.posterId === me.id);
  const sentTotal = myJobs.reduce((s, j) => s + (dispatches.find((d) => d.jobId === j.id)?.count ?? j.stats.sent), 0);
  const candidates = people.filter((p) => (p.stage === "fresh_graduate" && p.openToWork) || (p.stage === "student" && p.seekingInternship)).filter((p) => p.skills.some((s) => me.skills.includes(s))).slice(0, 3);
  const mentors = people.filter((p) => p.stage === "professional" && p.collab.includes("mentor") && p.track === me.track).slice(0, 3);
  const first = me.name.replace(/^(Prof\. )?Dr\. /, "").split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow={PERSONAS[role].label}
        title={`Selamat datang, ${first}`}
        desc={me.headline}
        actions={
          role === "student" ? <Button href="/lowongan">Cari magang <ArrowRight size={16} /></Button> :
          role === "alumni" ? <Button href="/lowongan/baru"><Plus size={16} /> Posting lowongan</Button> :
          <Button href="/kemitraan"><Handshake size={16} /> Cari mitra alumni</Button>
        }
      />

      {(role === "student" || role === "alumni") && completeness(me).score < 100 && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-sky-950 p-6 text-white md:flex-row md:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sun-400 text-2xl font-extrabold text-ink-900">{completeness(me).score}%</div>
          <div className="flex-1">
            <p className="text-lg font-bold">Profil Anda belum lengkap</p>
            <p className="text-sm text-sky-100/80">Lengkapi pengalaman, portofolio, dan CV agar mudah ditemukan {role === "student" ? "alumni yang membuka magang dan dosen yang mencari asisten riset" : "alumni yang merekrut, dosen, dan HRD"}. Belum diisi: {completeness(me).missing.slice(0, 3).join(", ")}.</p>
          </div>
          <Button variant="sun" href="/profil/lengkapi">Lengkapi sekarang <ArrowRight size={16} /></Button>
        </div>
      )}
      {role === "alumni" && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Lowongan saya" value={myJobs.length} icon={<Briefcase size={18} />} />
          <Stat label="Email terkirim ke civitas" value={sentTotal} icon={<Mail size={18} />} hint="Akumulasi dari semua lowongan Anda" />
          <Stat label="Kesediaan kontribusi" value={me.collab.length} icon={<Handshake size={18} />} hint="Atur di Profil Saya" />
        </div>
      )}
      {role === "lecturer" && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Alumni mitra riset" value={people.filter((p) => p.collab.includes("research_partner")).length} icon={<Handshake size={18} />} />
          <Stat label="Undangan kolaborasi terkirim" value={invitations.length} icon={<Send size={18} />} />
          <Stat label="Kebutuhan riset aktif" value={RESEARCH_NEEDS.filter((n) => n.lecturerId === me.id).length || 1} icon={<Users size={18} />} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {role === "alumni" && myJobs.length > 0 && (
            <section>
              <h2 className="mb-3 font-bold text-ink-900">Lowongan yang saya posting</h2>
              <div className="space-y-3">{myJobs.map((j) => <JobCard key={j.id} j={j} compact />)}</div>
            </section>
          )}
          {role !== "lecturer" && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-ink-900">{role === "student" ? "Magang & lowongan yang cocok untuk Anda" : "Lowongan yang cocok dengan status Anda"}</h2>
                <Link href="/lowongan" className="text-sm font-semibold text-sky-600">Semua →</Link>
              </div>
              {matches.length ? <div className="space-y-3">{matches.slice(0, 4).map((j) => <JobCard key={j.id} j={j} />)}</div> : <Empty title="Belum ada yang cocok" desc="Aktifkan Open to Work atau Open to Project di Profil Saya untuk menerima lowongan." action={<Button href="/saya" variant="secondary">Atur status</Button>} />}
            </section>
          )}
          {role === "lecturer" && (
            <section>
              <h2 className="mb-3 font-bold text-ink-900">Kebutuhan riset terbuka di departemen</h2>
              <div className="space-y-3">
                {RESEARCH_NEEDS.map((n) => (
                  <Card key={n.id} className="p-5">
                    <Badge tone="violet">{n.scheme}</Badge>
                    <p className="mt-2 font-bold text-ink-900">{n.title}</p>
                    <p className="text-sm text-ink-500">{n.partnerRole}</p>
                  </Card>
                ))}
              </div>
              <Button href="/kemitraan" variant="secondary" className="mt-4">Buka Hub Kemitraan <ArrowRight size={16} /></Button>
            </section>
          )}
        </div>
        <div className="space-y-6">
          {role === "student" && <ContactInbox />}
          {role === "alumni" && (
            <Card className="p-6">
              <p className="font-bold text-ink-900">Talenta yang sesuai bidang Anda</p>
              <p className="text-sm text-ink-500">Fresh graduate & mahasiswa dengan keahlian serupa.</p>
              <div className="mt-4 space-y-3">{candidates.map((p) => <PersonCard key={p.id} p={p} />)}</div>
            </Card>
          )}
          {role === "student" && (
            <Card className="p-6">
              <p className="font-bold text-ink-900">Alumni yang bersedia jadi mentor</p>
              <div className="mt-4 space-y-3">
                {mentors.map((p) => (
                  <Link key={p.id} href={`/profil/${p.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-50">
                    <Avatar name={p.name} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-800">{p.name}</p>
                      <p className="truncate text-xs text-ink-500">{p.headline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
          {role === "lecturer" && (
            <Card className="p-6">
              <p className="font-bold text-ink-900">Mahasiswa calon asisten riset</p>
              <p className="text-sm text-ink-500">Bersedia dilibatkan dalam riset dosen.</p>
              <div className="mt-4 space-y-3">
                {people.filter((p) => p.stage === "student" && p.collab.includes("research_assistant")).slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/profil/${p.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-50">
                    <Avatar name={p.name} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-800">{p.name}</p>
                      <p className="truncate text-xs text-ink-500">Angkatan {p.entryYear} · {p.skills.slice(0, 2).join(", ")}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/kemitraan" className="mt-3 block text-sm font-semibold text-sky-600">Cari {COLLAB_LABEL.research_assistant.toLowerCase()} lainnya →</Link>
            </Card>
          )}
          {role === "lecturer" && (
            <Card className="p-6">
              <p className="font-bold text-ink-900">Saran mitra sesuai kepakaran Anda</p>
              <div className="mt-4 space-y-3">
                {people.filter((p) => p.collab.includes("research_partner") && p.track === me.track).slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/profil/${p.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-50">
                    <Avatar name={p.name} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-800">{p.name}</p>
                      <p className="truncate text-xs text-ink-500">{p.headline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
          {role === "alumni" && <ContactInbox />}
        </div>
      </div>
    </div>
  );
}

function RecruiterDash() {
  const { contactRequests, jobs, people, answerContact, showToast } = useStore();
  const mine = contactRequests.filter((c) => c.fromName === PERSONAS.recruiter.name);
  const myJobs = jobs.filter((j) => j.posterName === PERSONAS.recruiter.name);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="HRD Verified" title="Selamat datang, Sinta" desc="PT Arunika Data Nusantara · akun terverifikasi moderator IKAMAT" actions={<Button href="/talenta">Cari kandidat <ArrowRight size={16} /></Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Permintaan kontak terkirim" value={mine.length} icon={<Send size={18} />} hint={`Sisa kuota bulan ini ${30 - mine.length}`} />
        <Stat label="Diterima kandidat" value={mine.filter((c) => c.status === "accepted").length} icon={<Check size={18} />} />
        <Stat label="Lowongan saya" value={myJobs.length} icon={<Briefcase size={18} />} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <p className="font-bold text-ink-900">Status permintaan kontak</p>
          {mine.length === 0 && (
            <div className="mt-3"><Empty title="Belum ada permintaan" desc="Buka Katalog Talenta dan klik Hubungi pada kandidat." action={<Button href="/talenta">Buka katalog</Button>} /></div>
          )}
          <ul className="mt-3 space-y-3">
            {mine.map((c) => {
              const p = people.find((x) => x.id === c.candidateId);
              return (
                <li key={c.id} className="rounded-xl bg-ink-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-800">{c.position} · {p?.name}</p>
                    <Badge tone={c.status === "accepted" ? "green" : c.status === "declined" ? "gray" : "sun"}>
                      {c.status === "accepted" ? "Diterima" : c.status === "declined" ? "Tidak tersedia" : "Menunggu"}
                    </Badge>
                  </div>
                  {c.status === "accepted" && p && (
                    <p className="mt-2 text-sm text-emerald-700">Kontak terbuka: {p.email} · CV dapat diunduh (tautan berlaku 10 menit)</p>
                  )}
                  {c.status === "pending" && (
                    <button className="mt-2 text-xs font-semibold text-sky-600" onClick={() => { answerContact(c.id, "accepted"); showToast("Simulasi: kandidat menerima permintaan Anda."); }}>
                      Simulasikan kandidat menerima →
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="p-6">
          <p className="font-bold text-ink-900">Lowongan saya</p>
          {myJobs.length === 0 ? (
            <div className="mt-3"><Empty title="Belum ada lowongan" desc="Lowongan HRD ditinjau moderator sebelum terbit." action={<Button href="/lowongan/baru">Posting lowongan</Button>} /></div>
          ) : (
            <div className="mt-3 space-y-3">
              {myJobs.map((j) => (
                <div key={j.id}>
                  <JobCard j={j} compact />
                  {j.status === "pending_review" && <p className="mt-1 flex items-center gap-1 text-xs text-sun-700"><Clock size={12} /> Menunggu moderasi. Masuk sebagai Admin untuk menyetujui.</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
