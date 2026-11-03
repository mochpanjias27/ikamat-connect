"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PersonCard, RoleGate } from "@/components/cards";
import { FilterBar, applyFilters, emptyFilters } from "@/components/Filters";
import { Empty, PageHeader } from "@/components/ui";

export default function Direktori() {
  const { people } = useStore();
  const [f, setF] = useState(emptyFilters);
  const visible = people.filter((p) => p.visibility !== "private");
  const list = applyFilters(visible, f);
  return (
    <RoleGate allow={["student", "alumni", "lecturer", "admin"]} title="Direktori khusus civitas terverifikasi">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Direktori civitas"
          title="Temukan sesama civitas Matematika Unpad"
          desc="Hanya terlihat oleh akun terverifikasi. Profil yang diatur privat oleh pemiliknya tidak muncul di sini."
        />
        <FilterBar f={f} set={setF} />
        <p className="mb-4 mt-6 text-sm text-ink-500">
          Menampilkan <b className="text-ink-800">{list.length}</b> dari {visible.length} civitas
        </p>
        {list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <PersonCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <Empty title="Tidak ada yang cocok" desc="Coba longgarkan filter keahlian atau sertifikasi." />
        )}
      </div>
    </RoleGate>
  );
}
