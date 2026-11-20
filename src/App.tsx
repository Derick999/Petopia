import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';
import { BottomNav, Toast, type Tab } from './ui';
import { NavCtx, OverlayCtx, type Nav } from './nav';
import { AppProvider, useApp } from './store';
import Home from './screens/Home';
import ServiceList, { type Kind } from './screens/ServiceList';
import ClinicDetail from './screens/ClinicDetail';
import DoctorDetail from './screens/DoctorDetail';
import Booking from './screens/Booking';
import { Bayar, Sukses, JanjiDetail } from './screens/Flow';
import Reward, { HadiahDetail, Riwayat, VoucherDetail } from './screens/Reward';
import Akun, { HewanForm, Profil, Tersimpan, VoucherKu } from './screens/Akun';
import Artikel, { Baca } from './screens/Artikel';
import { Layanan, Lokasi, Cari } from './screens/Explore';
import { Bantuan, Chat, Chats, Notif } from './screens/Inbox';
import { Alamat, Bahasa, Keamanan, Komunitas, Metode, NotifSet, Pengaturan, Teks } from './screens/Settings';
import { Login, Lupa, Onboarding, RegPet, Register, Welcome } from './screens/Auth';
import { Adopsi, AdopsiDetail, Adopter } from './screens/Adopt';

const TABS: Tab[] = ['home', 'artikel', 'booking', 'reward', 'akun'];
const isTab = (r: string) => (TABS as string[]).includes(r);

/** Tumpukan layar disimpan di history.state: tombol back HP/browser dan reload selalu sinkron. */
type HState = { stack: string[] };
const readStack = (): string[] | null => {
  try {
    const h = history.state as HState | null;
    if (h && Array.isArray(h.stack) && h.stack.length && h.stack.every((x) => typeof x === 'string')) return h.stack;
  } catch { /* abaikan */ }
  return null;
};
const sameStack = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

function Shell() {
  const { s, toastMsg } = useApp();
  const [stack, setStack] = useState<string[]>(() => readStack() ?? [s.onboarded ? 'home' : 'onboarding']);
  const [ovl, setOvl] = useState<HTMLElement | null>(null);
  const route = stack[stack.length - 1];
  const cur = useRef(stack);
  cur.current = stack;
  const pending = useRef<string[] | null>(null);

  // Satu layar = satu entri history, jadi jumlah entri selalu sama dengan panjang tumpukan
  const commit = useCallback((next: string[], mode: 'push' | 'replace') => {
    cur.current = next;
    try {
      if (mode === 'push') history.pushState({ stack: next } satisfies HState, '');
      else history.replaceState({ stack: next } satisfies HState, '');
    } catch { /* abaikan */ }
    setStack(next);
  }, []);

  // Ganti seluruh tumpukan: mundur ke entri paling bawah dulu supaya tombol back tidak berputar
  const rebuild = useCallback((target: string[]) => {
    const pops = cur.current.length - 1;
    if (pops <= 0) { commit(target.slice(0, 1), 'replace'); if (target.length > 1) commit(target, 'push'); return; }
    pending.current = target;
    history.go(-pops);
    // Kalau entri history di bawahnya tidak ada (misalnya dibuka langsung), tetap pindahkan layar
    window.setTimeout(() => {
      if (pending.current !== target) return;
      pending.current = null;
      commit(target.slice(0, 1), 'replace');
      if (target.length > 1) commit(target, 'push');
    }, 400);
  }, [commit]);

  useEffect(() => {
    if (!readStack()) { try { history.replaceState({ stack: cur.current } satisfies HState, ''); } catch { /* abaikan */ } }
    const h = (e: PopStateEvent) => {
      if (pending.current) {
        const t = pending.current; pending.current = null;
        commit(t.slice(0, 1), 'replace');
        if (t.length > 1) commit(t, 'push');
        return;
      }
      const st = (e.state as HState | null)?.stack;
      const next = st && Array.isArray(st) && st.length ? st : cur.current.length > 1 ? cur.current.slice(0, -1) : cur.current;
      cur.current = next;
      setStack(next);
    };
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  }, [commit]);

  const go = useCallback((r: string) => {
    const now = cur.current;
    if (isTab(r)) {
      const target = r === 'home' ? ['home'] : ['home', r];
      if (sameStack(now, target)) return;
      if (now.length === 1 && now[0] === 'home') commit(target, 'push');
      else if (now.length === 2 && now[0] === 'home' && isTab(now[1]) && target.length === 2) commit(target, 'replace');
      else rebuild(target);
      return;
    }
    commit([...now, r], 'push');
  }, [commit, rebuild]);
  // Lewat history supaya tombol back HP dan tombol back di layar selalu sinkron
  const back = useCallback(() => {
    if (cur.current.length > 1) history.back();
  }, []);
  const replace = useCallback((r: string) => commit([...cur.current.slice(0, -1), r], 'replace'), [commit]);
  const reset = useCallback((r: string) => rebuild(isTab(r) && r !== 'home' ? ['home', r] : [r]), [rebuild]);

  const nav: Nav = useMemo(() => ({ route, go, back, replace, reset }), [route, go, back, replace, reset]);
  const [name, a] = route.split(':');

  let screen;
  switch (name) {
    case 'home': screen = <Home />; break;
    case 'artikel': screen = <Artikel />; break;
    case 'booking': screen = <Booking />; break;
    case 'reward': screen = <Reward />; break;
    case 'akun': screen = <Akun />; break;
    case 'onboarding': screen = <Onboarding />; break;
    case 'welcome': screen = <Welcome />; break;
    case 'login': screen = <Login returnBack={a === 'back'} />; break;
    case 'lupa': screen = <Lupa />; break;
    case 'register': screen = <Register />; break;
    case 'regpet': screen = <RegPet />; break;
    case 'list': screen = <ServiceList key={a} kind={a as Kind} />; break;
    case 'klinik': screen = <ClinicDetail id={a} />; break;
    case 'dokter': screen = <DoctorDetail id={a} />; break;
    case 'bayar': screen = <Bayar />; break;
    case 'sukses': screen = <Sukses id={a} />; break;
    case 'janji': screen = <JanjiDetail id={a} />; break;
    case 'layanan': screen = <Layanan />; break;
    case 'lokasi': screen = <Lokasi />; break;
    case 'cari': screen = <Cari />; break;
    case 'cs': screen = <Bantuan />; break;
    case 'chats': screen = <Chats />; break;
    case 'chat': screen = <Chat id={a} />; break;
    case 'notif': screen = <Notif />; break;
    case 'baca': screen = <Baca id={a} />; break;
    case 'voucher': screen = <VoucherDetail id={a} />; break;
    case 'hadiah': screen = <HadiahDetail id={a} />; break;
    case 'riwayat': screen = <Riwayat />; break;
    case 'profil': screen = <Profil />; break;
    case 'hewan': screen = <HewanForm id={a} />; break;
    case 'tersimpan': screen = <Tersimpan />; break;
    case 'voucherku': screen = <VoucherKu />; break;
    case 'pengaturan': screen = <Pengaturan />; break;
    case 'keamanan': screen = <Keamanan />; break;
    case 'bahasa': screen = <Bahasa />; break;
    case 'metode': screen = <Metode />; break;
    case 'alamat': screen = <Alamat />; break;
    case 'notifset': screen = <NotifSet />; break;
    case 'kebijakan': screen = <Teks kind="kebijakan" />; break;
    case 'syarat': screen = <Teks kind="syarat" />; break;
    case 'komunitas': screen = <Komunitas />; break;
    case 'adopt': screen = <Adopsi />; break;
    case 'adopsi': screen = <AdopsiDetail id={a} />; break;
    case 'adopter': screen = <Adopter id={a} />; break;
    default: screen = <Home />;
  }

  const fullBleed = name === 'klinik' || name === 'dokter' || name === 'onboarding' || name === 'welcome';

  return (
    <NavCtx.Provider value={nav}>
      <OverlayCtx.Provider value={ovl}>
        <div className="flex min-h-dvh items-center justify-center bg-[#1d1d1f] sm:py-6">
          <div className="relative h-dvh w-full sm:h-[872px] sm:w-[413px] sm:rounded-[56px] sm:bg-black sm:p-[10px] sm:shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div id="phone" className="relative h-full w-full overflow-hidden bg-cream sm:rounded-[46px]">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] hidden h-[54px] items-center justify-between px-[34px] pt-[6px] sm:flex">
                <span className="w-[54px] text-center text-[17px] font-semibold text-black">9:41</span>
                <span className="absolute left-1/2 top-[11px] h-[32px] w-[112px] -translate-x-1/2 rounded-full bg-black" />
                <span className="flex items-center gap-[5px] text-black"><Signal className="h-[15px] w-[15px]" fill="currentColor" /><Wifi className="h-[15px] w-[15px]" strokeWidth={2.6} /><BatteryFull className="h-[20px] w-[20px]" /></span>
              </div>

              <main key={route} className={fullBleed ? 'absolute inset-0' : 'hide-scrollbar absolute inset-0 overflow-y-auto'}>
                {screen}
              </main>
              {isTab(route) && <BottomNav active={route as Tab} onTab={go} />}
              <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-[60] hidden h-[5px] w-[139px] -translate-x-1/2 rounded-full bg-black sm:block" />

              {/* Sheet, toast, dan coachmark dirender di sini */}
              <div ref={setOvl} className="pointer-events-none absolute inset-0 z-[70]" />
              <Toast text={toastMsg} />
            </div>
          </div>
        </div>
      </OverlayCtx.Provider>
    </NavCtx.Provider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
