"use client";

import { useState } from "react";
import { CalendarDays, FlaskConical, Handshake, Plus, Search, Users } from "lucide-react";
import { COLLAB_LABEL, CollabType, Person, RESEARCH_NEEDS, ResearchNeed, SECTORS, fmtDate } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PersonCard, RoleGate } from "@/components/cards";
import { Avatar, Badge, Button, Card, Empty, Modal, PageHeader, Select, cn, inputCls } from "@/components/ui";

function matchesNeed(p: Person, n: ResearchNeed) {
  return p.roles.includes("alumni") && p.stage !== "academic" && (n.sectors.includes(p.sector ?? "") || p.skills.some((s) => n.skills.includes(s))) && p.collab.length > 0;
}

export default function Kemitraan() {
  const { people, role, invite, invitations, showToast, me } = useStore();
  const [tabSel, setTab] = useState<"needs" | "find" | null>(null);
  const [sector, setSector] = useState("all");
  const [type, setType] = useState<"all" | CollabType>("research_partner");
  const [q, setQ] = useState("");
  const [inviteFor, setInviteFor] = useState<Person | null>(null);
  const [needs, setNeeds] = useState<ResearchNeed[]>(RESEARCH_NEEDS);
  const [newOpen, setNewOpen] = useState(false);
  const [interested, setInterested] = useState<string[]>([]);
  const isLecturer = role === "lecturer" || role === "admin";
  const tab = tabSel ?? (isLecturer ? "find" : "needs");

  const alumni = people.filter((p) => p.roles.includes("alumni") && p.stage === "professional");
  let list = alumni.filter((p) => p.collab.length > 0);
  if (type !== "all") list = list.filter((p) => p.collab.includes(type));
  if (sector !== "all") list = list.filter((p) => p.sector === sector);
  if (q.trim()) {
    const s = q.toLowerCase();
    list = list.filter((p) => [p.name, p.headline, ...p.skills].join(" ").toLowerCase().includes(s));
  }

  return (
    <RoleGate allow={["lecturer", "alumni", "admin"]} title="Hub kemitraan untuk dosen dan alumni">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Academic-industry partnership hub"
          title={isLecturer ? "Temukan mitra alumni untuk riset & hibah" : "Kesempatan kolaborasi dengan departemen"}
          desc="Alumni menandai kesediaan sebagai mitra riset, pembicara, praktisi mengajar, mentor, atau penyedia magang. Dosen mencari dan mengundang langsung."
          actions={isLecturer && <Button onClick={() => setNewOpen(true)}><Plus size={16} /> Posting kebutuhan riset</Button>}
        />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            [<Handshake key="a" size={20} />, "Alumni bersedia jadi mitra riset", alumni.filter((p) => p.collab.includes("research_partner")).length],
            [<Users key="b" size={20} />, "Bersedia praktisi mengajar / pembicara", alumni.filter((p) => p.collab.includes("guest_lecturer") || p.collab.includes("speaker")).length],
            [<FlaskConical key="c" size={20} />, "Kebutuhan riset terbuka", needs.length],
          ].map(([ic, l, v]) => (
            <Card key={l as string} className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sun-100 text-sun-700">{ic}</div>
              <div>
                <p className="text-2xl font-extrabold text-ink-900">{v}</p>
                <p className="text-sm text-ink-500">{l}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mb-5 flex gap-1 rounded-xl bg-white p-1 shadow-card ring-1 ring-ink-200/60 sm:w-fit">
          {([["find", "Cari mitra alumni"], ["needs", "Kebutuhan riset & hibah"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold", tab === k ? "bg-sky-600 text-white" : "text-ink-600 hover:bg-ink-50")}>
              {l}
            </button>
          ))}
        </div>

        {tab === "find" && (
          <>
            <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-200/60 md:grid-cols-[1fr_220px_220px]">
              <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, jabatan, kepakaran…" className="h-10 w-full rounded-xl border-0 bg-ink-50 pl-10 text-sm ring-1 ring-inset ring-ink-200 focus:ring-2 focus:ring-sky-400" />
              </div>
              <Select value={type} onChange={(v) => setType(v as "all" | CollabType)} options={[{ value: "all", label: "Semua kesediaan" }, ...(Object.keys(COLLAB_LABEL) as CollabType[]).map((k) => ({ value: k, label: COLLAB_LABEL[k] }))]} />
              <Select value={sector} onChange={setSector} options={[{ value: "all", label: "Semua sektor industri" }, ...SECTORS.filter((s) => s !== "Pendidikan").map((s) => ({ value: s, label: s }))]} />
            </div>
            <p className="mb-4 mt-5 text-sm text-ink-500"><b className="text-ink-800">{list.length}</b> alumni cocok</p>
            {list.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <div key={p.id} className="relative">
                    <PersonCard p={p} showCollab />
                    {isLecturer && (
                      <div className="absolute bottom-4 right-4">
                        <Button size="sm" variant={invitations.some((i) => i.personId === p.id) ? "ghost" : "sun"} onClick={() => setInviteFor(p)} disabled={invitations.some((i) => i.personId === p.id)}>
                          {invitations.some((i) => i.personId === p.id) ? "Diundang ✓" : "Undang"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty title="Belum ada alumni dengan kriteria ini" desc="Coba ganti sektor atau jenis kesediaan." />
            )}
          </>
        )}

        {tab === "needs" && (
          <div className="grid gap-4 md:grid-cols-2">
            {needs.map((n) => {
              const L = people.find((p) => p.id === n.lecturerId);
              const matched = people.filter((p) => matchesNeed(p, n));
              const isInt = interested.includes(n.id);
              return (
                <Card key={n.id} className="flex flex-col p-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="violet">{n.scheme}</Badge>
                    <Badge><CalendarDays size={12} /> Tenggat {fmtDate(n.deadline)}</Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-ink-900">{n.title}</h3>
                  <p className="mt-1 text-sm text-ink-600"><b>Mitra yang dicari:</b> {n.partnerRole}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {[...n.sectors, ...n.skills].map((s) => (
                      <span key={s} className="rounded-md bg-ink-100 px-2 py-0.5 text-xs text-ink-600">{s}</span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <div className="flex items-center gap-2">
                      {L && <Avatar name={L.name} size={32} />}
                      <p className="text-xs leading-tight text-ink-500"><span className="block font-semibold text-ink-700">{L?.name}</span>{n.interested + (isInt ? 1 : 0)} alumni tertarik · {matched.length} cocok</p>
                    </div>
                    {role === "alumni" ? (
                      <Button size="sm" variant={isInt ? "ghost" : "primary"} disabled={isInt} onClick={() => { setInterested([...interested, n.id]); showToast("Minat Anda dikirim ke dosen pengusul."); }}>
                        {isInt ? "Terkirim ✓" : "Saya tertarik"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => { setTab("find"); setSector(n.sectors[0]); setType("all"); }}>
                        Lihat {matched.length} kandidat mitra
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!inviteFor} onClose={() => setInviteFor(null)} title={`Undang ${inviteFor?.name ?? ""}`}>
        <p className="text-sm text-ink-600">Pilih kebutuhan riset yang ingin Anda tawarkan. Alumni menerima email undangan dan dapat menerima atau menolak.</p>
        <div className="mt-4 space-y-2">
          {needs.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (!inviteFor) return;
                invite(n.id, inviteFor.id);
                showToast(`Undangan kolaborasi terkirim ke ${inviteFor.name}`);
                setInviteFor(null);
              }}
              className="w-full rounded-xl p-3 text-left ring-1 ring-ink-200 hover:bg-sky-50 hover:ring-sky-300"
            >
              <p className="text-sm font-semibold text-ink-800">{n.title}</p>
              <p className="text-xs text-ink-500">{n.scheme}</p>
            </button>
          ))}
        </div>
      </Modal>

      <NewNeedModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSave={(n) => {
          setNeeds([{ ...n, lecturerId: me?.id ?? needs[0].lecturerId }, ...needs]);
          setNewOpen(false);
          setTab("needs");
          showToast("Kebutuhan riset diterbitkan. Alumni mitra riset di sektor terkait menerima notifikasi.");
        }}
      />
    </RoleGate>
  );
}

function NewNeedModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (n: ResearchNeed) => void }) {
  const [title, setTitle] = useState("Model Optimasi Portofolio Dana Pensiun Berbasis Risiko");
  const [scheme, setScheme] = useState("Hibah Riset Kolaborasi Industri");
  const [role, setRole] = useState("Mitra dana pensiun untuk studi kasus dan data agregat");
  const [sector, setSector] = useState("Dana Pensiun");
  return (
    <Modal open={open} onClose={onClose} title="Posting kebutuhan riset / hibah">
      <div className="space-y-3">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul riset" />
        <input className={inputCls} value={scheme} onChange={(e) => setScheme(e.target.value)} placeholder="Skema hibah" />
        <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Peran mitra yang dicari" />
        <Select value={sector} onChange={setSector} options={SECTORS.map((s) => ({ value: s, label: s }))} label="Sektor mitra" />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button
          onClick={() =>
            onSave({ id: `r${Date.now()}`, lecturerId: "", title, scheme, partnerRole: role, sectors: [sector], skills: ["Manajemen Risiko", "Optimasi Portofolio"], deadline: "2027-01-31", interested: 0 })
          }
        >
          Terbitkan
        </Button>
      </div>
    </Modal>
  );
}
