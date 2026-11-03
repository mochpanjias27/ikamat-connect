"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppRole, JOBS, Job, PEOPLE, Person, PERSONAS, VERIFICATION_QUEUE, VerificationRequest } from "./data";

export interface ContactRequest {
  id: string;
  candidateId: string;
  fromName: string;
  fromOrg: string;
  position: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface Dispatch {
  jobId: string;
  jobTitle: string;
  count: number;
  at: string;
}

export interface NotifPrefs {
  jobs: "instant" | "weekly" | "off";
  internships: "instant" | "weekly" | "off";
  partnerships: "instant" | "weekly" | "off";
}

interface State {
  role: AppRole;
  postedJobs: Job[];
  jobStatus: Record<string, Job["status"]>;
  personOverrides: Record<string, Partial<Person>>;
  contactRequests: ContactRequest[];
  dispatches: Dispatch[];
  savedJobs: string[];
  verification: Record<string, "approved" | "rejected">;
  notif: NotifPrefs;
  invitations: { needId: string; personId: string }[];
  photos: Record<string, string>; // foto akun non-civitas (HRD, admin), kunci = nama
}

const SEED_CANDIDATE = PEOPLE.find((p) => p.stage === "student" && p.entryYear <= 2022 && p.seekingInternship)!;

const initialState: State = {
  role: "guest",
  postedJobs: [],
  jobStatus: {},
  personOverrides: {},
  contactRequests: [
    {
      id: "c-seed-1",
      candidateId: SEED_CANDIDATE.id,
      fromName: "Sinta Maharani",
      fromOrg: "PT Arunika Data Nusantara",
      position: "Magang Data Analyst",
      message: "Halo, profil Anda cocok dengan program magang analitik kami. Apakah bersedia berdiskusi minggu ini?",
      status: "pending",
      createdAt: "2026-11-02",
    },
  ],
  dispatches: [],
  savedJobs: [],
  verification: {},
  notif: { jobs: "instant", internships: "instant", partnerships: "weekly" },
  invitations: [],
  photos: {},
};

interface Ctx extends State {
  setRole: (r: AppRole) => void;
  jobs: Job[];
  people: Person[];
  me?: Person;
  addJob: (j: Job) => void;
  setJobStatus: (id: string, s: Job["status"]) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  addContactRequest: (c: Omit<ContactRequest, "id" | "createdAt" | "status">) => void;
  answerContact: (id: string, status: "accepted" | "declined") => void;
  addDispatch: (d: Dispatch) => void;
  toggleSave: (id: string) => void;
  decideVerification: (id: string, d: "approved" | "rejected") => void;
  setNotif: (n: NotifPrefs) => void;
  invite: (needId: string, personId: string) => void;
  setPhoto: (name: string, dataUrl: string | null) => void;
  photoFor: (name: string) => string | undefined;
  verificationQueue: (VerificationRequest & { decision?: "approved" | "rejected" })[];
  toast: string | null;
  showToast: (m: string) => void;
  reset: () => void;
  ready: boolean;
}

const StoreContext = createContext<Ctx | null>(null);
const KEY = "ikamat-connect-demo-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* penyimpanan tidak tersedia: tetap jalan dengan data awal */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* penyimpanan penuh atau tidak tersedia: data tetap ada selama sesi */
    }
  }, [state, ready]);

  const showToast = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast((t) => (t === m ? null : t)), 3200);
  }, []);

  const people = useMemo(
    () => PEOPLE.map((p) => (state.personOverrides[p.id] ? { ...p, ...state.personOverrides[p.id] } : p)),
    [state.personOverrides]
  );

  const jobs = useMemo(
    () =>
      [...state.postedJobs, ...JOBS].map((j) => (state.jobStatus[j.id] ? { ...j, status: state.jobStatus[j.id] } : j)),
    [state.postedJobs, state.jobStatus]
  );

  const meId = PERSONAS[state.role].personId;
  const me = meId ? people.find((p) => p.id === meId) : undefined;

  const value: Ctx = {
    ...state,
    ready,
    jobs,
    people,
    me,
    toast,
    showToast,
    setRole: (role) => setState((s) => ({ ...s, role })),
    addJob: (j) => setState((s) => ({ ...s, postedJobs: [j, ...s.postedJobs] })),
    setJobStatus: (id, st) => setState((s) => ({ ...s, jobStatus: { ...s.jobStatus, [id]: st } })),
    updatePerson: (id, patch) =>
      setState((s) => ({ ...s, personOverrides: { ...s.personOverrides, [id]: { ...s.personOverrides[id], ...patch } } })),
    addContactRequest: (c) =>
      setState((s) => ({
        ...s,
        contactRequests: [{ ...c, id: `c${Date.now()}`, status: "pending", createdAt: "2026-11-03" }, ...s.contactRequests],
      })),
    answerContact: (id, status) =>
      setState((s) => ({ ...s, contactRequests: s.contactRequests.map((c) => (c.id === id ? { ...c, status } : c)) })),
    addDispatch: (d) => setState((s) => ({ ...s, dispatches: [d, ...s.dispatches] })),
    toggleSave: (id) =>
      setState((s) => ({ ...s, savedJobs: s.savedJobs.includes(id) ? s.savedJobs.filter((x) => x !== id) : [...s.savedJobs, id] })),
    decideVerification: (id, d) => setState((s) => ({ ...s, verification: { ...s.verification, [id]: d } })),
    setNotif: (n) => setState((s) => ({ ...s, notif: n })),
    invite: (needId, personId) => setState((s) => ({ ...s, invitations: [...s.invitations, { needId, personId }] })),
    setPhoto: (name, dataUrl) => {
      const person = PEOPLE.find((p) => p.name === name);
      setState((s) => {
        if (person) {
          return { ...s, personOverrides: { ...s.personOverrides, [person.id]: { ...s.personOverrides[person.id], photo: dataUrl ?? undefined } } };
        }
        const photos = { ...s.photos };
        if (dataUrl) photos[name] = dataUrl;
        else delete photos[name];
        return { ...s, photos };
      });
    },
    photoFor: (name) => state.photos[name] ?? state.personOverrides[PEOPLE.find((p) => p.name === name)?.id ?? ""]?.photo,
    verificationQueue: VERIFICATION_QUEUE.map((v) => ({ ...v, decision: state.verification[v.id] })),
    reset: () => {
      setState({ ...initialState, role: state.role });
      showToast("Data demo dikembalikan ke kondisi awal");
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore di luar StoreProvider");
  return c;
}
