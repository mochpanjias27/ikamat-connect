"use client";

import { useState } from "react";
import { Lock, Send } from "lucide-react";
import { Person, PERSONAS, maskedName } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Button, Modal, inputCls } from "./ui";

export function ContactModal({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const { role, addContactRequest, showToast, contactRequests } = useStore();
  const [position, setPosition] = useState("");
  const [msg, setMsg] = useState("");
  if (!person) return null;
  const P = PERSONAS[role];
  const isHRD = role === "recruiter";
  const used = contactRequests.filter((c) => c.fromName === P.name).length;
  const org = isHRD ? "PT Arunika Data Nusantara" : P.subtitle;
  return (
    <Modal open onClose={onClose} title={`Hubungi ${isHRD ? maskedName(person.name) : person.name}`}>
      <div className="mb-4 flex gap-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">
        <Lock size={18} className="mt-0.5 shrink-0" />
        <p>
          Pesan dikirim lewat platform. Email dan nomor HP kandidat <b>tidak ditampilkan</b> dan baru terbuka bila ia menerima permintaan Anda.
        </p>
      </div>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-700">{isHRD ? "Posisi yang ditawarkan" : "Topik"}</span>
          <input className={inputCls} value={position} onChange={(e) => setPosition(e.target.value)} placeholder={isHRD ? "mis. Junior Data Analyst" : "mis. Mentoring karier aktuaria"} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-700">Pesan</span>
          <textarea
            className={inputCls}
            rows={4}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Perkenalkan diri dan jelaskan maksud Anda secara singkat."
          />
        </label>
        {isHRD && <p className="text-xs text-ink-500">Kuota permintaan kontak bulan ini: {Math.max(0, 30 - used)} dari 30 tersisa.</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Batal
        </Button>
        <Button
          disabled={!position.trim() || !msg.trim()}
          onClick={() => {
            addContactRequest({ candidateId: person.id, fromName: P.name, fromOrg: org, position, message: msg });
            showToast(`Permintaan terkirim. ${person.name.split(" ")[0]} menerima email notifikasi tanpa alamatnya dibagikan.`);
            setPosition("");
            setMsg("");
            onClose();
          }}
        >
          <Send size={16} /> Kirim permintaan
        </Button>
      </div>
    </Modal>
  );
}
