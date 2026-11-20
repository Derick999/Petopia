import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PETS, WELCOME, addDays, iso, todayIso, type Cat, type PetT, type Voucher } from './data';

export type Status = 'Terjadwal' | 'Selesai' | 'Dibatalkan';
export type Booking = {
  id: string; kind: string; place: string; who: string; service: string; cat: Cat;
  date: string; time: string; price: number; discount: number; pet: string; pay: string;
  status: Status; km: string; code: string; ref: string; note?: string;
};
export type Draft = {
  kind: string; refId: string; place: string; who: string; km: string; service: string; cat: Cat;
  price: number; date: string; time: string; pet: string; voucher?: string; pay?: string;
};
export type Msg = { from: 'me' | 'them'; text: string; t: string };
export type Notif = { id: string; title: string; text: string; time: string; read: boolean };
export type PointLog = { id: string; label: string; pts: number; date: string };
export type Profile = { name: string; username?: string; email: string; phone: string };

export type State = {
  onboarded: boolean; tutorialDone: boolean; loggedIn: boolean;
  profile: Profile; location: string;
  bookings: Booking[]; saved: string[];
  points: number; xp: number; vouchers: (Voucher & { source: string })[]; log: PointLog[]; usedCodes: string[];
  pets: PetT[]; notifs: Notif[]; threads: Record<string, Msg[]>;
  settings: { lang: 'id' | 'en'; promo: boolean; booking: boolean; chat: boolean; twofa: boolean };
  addresses: { id: string; label: string; text: string }[];
  pays: string[]; rated: number; draft: Draft | null;
};

const KEY = 'petopia-state-v2';

/** Data akun baru: kosong, hanya voucher sambutan. */
export const blankUser = (): Partial<State> => ({
  bookings: [], pets: [], points: 0, xp: 0, log: [], saved: [], usedCodes: [],
  vouchers: [{ ...WELCOME, source: 'Hadiah pendaftaran' }],
  notifs: [{ id: 'n1', title: 'Selamat datang di Petopia', text: 'Voucher diskon 50% sudah ada di akunmu. Pakai saat pembayaran pertama.', time: 'Baru saja', read: false }],
  threads: { cs: [{ from: 'them', text: 'Halo, ada yang bisa kami bantu hari ini?', t: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':') }] },
});
const now = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

function seed(): State {
  return {
    onboarded: false, tutorialDone: false, loggedIn: false,
    profile: { name: 'Derick Raditya', email: '', phone: '' },
    location: 'Karang Bolong',
    bookings: [
      { id: 'b1', kind: 'klinik', place: 'Klinik Pademangan', who: 'Drh. Sulistyo Hadi', service: 'Konsultasi dokter hewan', cat: 'konsultasi', date: todayIso(), time: '14:30', price: 75000, discount: 0, pet: 'Cimory', pay: 'GoPay', status: 'Terjadwal', km: '1.3km', code: 'PTP-2026-0142', ref: 'dokter:sulistyo' },
      { id: 'b2', kind: 'klinik', place: 'Klinik Pademangan', who: 'Drh. Sulistyo Hadi', service: 'Vaksinasi lengkap', cat: 'vaksinasi', date: iso(addDays(-9)), time: '14:30', price: 150000, discount: 0, pet: 'Haciko', pay: 'OVO', status: 'Selesai', km: '1.3km', code: 'PTP-2026-0097', ref: 'klinik:kasihsatwa' },
    ],
    saved: [],
    points: 59, xp: 150,
    vouchers: [{ ...WELCOME, source: 'Hadiah pendaftaran' }],
    log: [
      { id: 'l1', label: 'Vaksinasi lengkap, Klinik Pademangan', pts: 59, date: iso(addDays(-9)) },
    ],
    usedCodes: [],
    pets: PETS,
    notifs: [
      { id: 'n1', title: 'Selamat datang di Petopia', text: 'Voucher diskon 50% sudah ada di akunmu. Pakai saat pembayaran pertama.', time: 'Hari ini', read: false },
      { id: 'n2', title: 'Janji temu hari ini', text: 'Jangan lupa konsultasi di Klinik Pademangan pukul 14:30 WIB.', time: 'Hari ini', read: false },
      { id: 'n3', title: 'Promo vaksinasi 50%', text: 'Berlaku khusus bulan ini di klinik mitra Petopia.', time: 'Kemarin', read: true },
    ],
    threads: {
      cs: [{ from: 'them', text: 'Halo Derick, ada yang bisa kami bantu hari ini?', t: '09:00' }],
      anika: [{ from: 'them', text: 'Halo, silakan ceritakan keluhan hewan peliharaanmu.', t: '08:30' }],
    },
    settings: { lang: 'id', promo: true, booking: true, chat: true, twofa: false },
    addresses: [
      { id: 'ad1', label: 'Rumah', text: 'Jl. Karang Bolong No. 12, Ancol, Jakarta Utara' },
      { id: 'ad2', label: 'Kampus', text: 'Universitas Bunda Mulia, Jl. Lodan Raya No. 2, Ancol' },
    ],
    pays: ['GoPay'], rated: 0, draft: null,
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch { /* abaikan */ }
  return seed();
}

type Patch = Partial<State> | ((s: State) => Partial<State>);
type Ctx = {
  s: State; up: (p: Patch) => void; toast: (m: string) => void; toastMsg: string;
  notify: (title: string, text: string) => void;
  addPoints: (pts: number, label: string) => void;
  reply: (thread: string, text: string) => void;
  reset: () => void;
};
const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load);
  const [toastMsg, setToastMsg] = useState('');
  const timer = useRef<number>(0);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* abaikan */ }
  }, [s]);

  const up = useCallback((p: Patch) => setS((cur) => ({ ...cur, ...(typeof p === 'function' ? p(cur) : p) })), []);
  const toast = useCallback((m: string) => {
    setToastMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(''), 2600);
  }, []);
  const notify = useCallback((title: string, text: string) =>
    up((c) => ({ notifs: [{ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5), title, text, time: 'Baru saja', read: false }, ...c.notifs] })), [up]);
  const addPoints = useCallback((pts: number, label: string) =>
    up((c) => ({
      points: c.points + pts, xp: pts > 0 ? c.xp + pts : c.xp,
      log: [{ id: 'g' + Date.now() + Math.random().toString(36).slice(2, 5), label, pts, date: todayIso() }, ...c.log],
    })), [up]);
  const reply = useCallback((thread: string, text: string) => {
    window.setTimeout(() => up((c) => ({
      threads: { ...c.threads, [thread]: [...(c.threads[thread] ?? []), { from: 'them', text, t: now() }] },
    })), 1100);
  }, [up]);
  const reset = useCallback(() => { setS(seed()); }, []);

  const value = useMemo(() => ({ s, up, toast, toastMsg, notify, addPoints, reply, reset }), [s, up, toast, toastMsg, notify, addPoints, reply, reset]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const nowTime = now;
export const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

/** Janji yang jamnya sudah lewat (lebih dari 1 jam) otomatis dianggap selesai. */
export function effStatus(b: Booking): Status {
  if (b.status !== 'Terjadwal') return b.status;
  const [y, m, d] = b.date.split('-').map(Number);
  const [h, mi] = b.time.split(':').map(Number);
  return new Date(y, m - 1, d, h, mi).getTime() + 60 * 60 * 1000 < Date.now() ? 'Selesai' : 'Terjadwal';
}

/** Status yang ditampilkan: janji hari ini diberi label "Hari Ini". */
export function statusLabel(b: Booking): 'Hari Ini' | Status {
  const st = effStatus(b);
  if (st === 'Terjadwal' && b.date === todayIso()) return 'Hari Ini';
  return st;
}
