import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Headset, LayoutGrid, MapPin, MessageCircle, Search, Star, MapPin as Pin, HousePlus, Scissors, Stethoscope } from 'lucide-react';
import { AssetIcon, Btn, PawLogo, Photo, Sheet, cx, DragRow } from '../ui';
import { useNav, useOverlay } from '../nav';
import { useApp } from '../store';

const PROMOS = [
  { id: 'vaksin', img: 'promo1.png', brand: 'PetshopID', title: ['PROMO', 'VAKSINASI', 'HEWAN'], big: '50%', tone: 'blue' as const,
    head: 'Promo Vaksinasi Hewan 50%', body: 'Diskon 50% untuk vaksinasi lengkap di klinik mitra Petopia. Berlaku sampai akhir bulan untuk anjing dan kucing. Booking lewat aplikasi supaya diskon otomatis terhitung.', cta: 'Cari klinik vaksinasi', route: 'list:vaksinasi' },
  { id: 'groom', img: 'promo2.png', brand: 'Petcare', title: ['Rawat', 'kucing', 'Anda!'], big: 'GROOMING DISKON 30%', tone: 'amber' as const,
    head: 'Grooming Diskon 30%', body: 'Mandi, potong kuku, dan bersihkan telinga dengan diskon 30% di salon hewan pilihan. Cocok untuk kucing dan anjing kecil.', cta: 'Cari tempat grooming', route: 'list:grooming' },
  { id: 'hotel', img: 'promo3.png', brand: 'Petopia', title: ['Liburan', 'tenang,', 'hewan aman'], big: 'HOTEL DISKON 20%', tone: 'blue' as const,
    head: 'Penitipan Hewan Diskon 20%', body: 'Titip hewan kesayanganmu di pet hotel mitra dengan diskon 20% untuk menginap minimal 2 malam. Ada kandang ber-AC dan laporan harian.', cta: 'Cari penitipan', route: 'list:penitipan' },
  { id: 'adopt', img: 'promo4.png', brand: 'Adopt Me', title: ['Beri', 'rumah', 'baru'], big: 'ADOPSI GRATIS', tone: 'amber' as const,
    head: 'Adopsi Hewan Gratis', body: 'Biaya adopsi gratis untuk hewan di rumah singgah mitra. Kamu hanya perlu mengisi data dan menjadwalkan survei rumah.', cta: 'Lihat hewan adopsi', route: 'adopt' },
];

const DOCS = [
  { id: 'santika', name: 'Dr. Santika Mutiara', clinic: 'Klinik Mangga Besar', rating: '4.9 (123)', km: '1.3km', photo: 'doc1.png' },
  { id: 'mariska', name: 'Dr. Mariska Putri', clinic: 'Klinik Pademangan', rating: '4.9 (112)', km: '1.3km', photo: 'doc2.png' },
  { id: 'sulistyo', name: 'Drh. Sulistyo Hadi', clinic: 'Klinik Pademangan', rating: '4.7 (301)', km: '1.3km', photo: 'doc3.png' },
  { id: 'anika', name: 'Drh. Anika Yustika', clinic: 'Klinik Sentosa', rating: '4.8 (210)', km: '2.1km', photo: 'drh1.png' },
];

export default function Home() {
  const { s, up } = useApp();
  const { go } = useNav();
  const [promo, setPromo] = useState<(typeof PROMOS)[number] | null>(null);
  const unread = s.notifs.filter((n) => !n.read).length;
  const first = s.loggedIn ? s.profile.name.split(' ')[0] : 'Tamu';

  return (
    <div className="relative min-h-full pb-[120px]">
      {/* ===== Hero: header oranye + banner promo ===== */}
      <div className="relative h-[333px]">
        <div className="absolute inset-x-0 top-[-8px] h-[208px] rounded-b-[56px] bg-orange" />
        <Photo src="banner.png" className="absolute inset-x-0 top-[104px] h-[262px] w-full" fallback={<Poster />} pos="center top" />
        <div className="absolute inset-x-0 top-[230px] h-[140px] bg-gradient-to-t from-black from-[15%] to-[rgba(115,115,115,0)] to-[85%]" />

        <button onClick={() => go('cari')} className="absolute left-[18px] top-[78px] flex h-[38px] w-[228px] items-center gap-[12px] rounded-[16px] bg-white px-[16px] text-left" aria-label="Cari">
          <Search className="h-[19px] w-[19px] shrink-0 text-[#8b8b8b]" strokeWidth={2} />
          <span className="whitespace-nowrap text-[14px] font-bold text-[#8b8b8b]">Cara merawat kucing</span>
        </button>
        <button onClick={() => go('lokasi')} aria-label={`Lokasi: ${s.location}`} className="absolute right-[14px] top-[84px] flex h-[26px] max-w-[130px] items-center gap-[6px] bg-transparent p-0">
          <MapPin className="h-[19px] w-[16px] shrink-0 text-brown" strokeWidth={2.2} fill="currentColor" stroke="#ef9820" />
          <span className="truncate text-[14px] font-medium text-brown">{s.location}</span>
        </button>

        <div className="absolute left-0 right-0 top-[303px] flex justify-center gap-[4px]">
          {[0, 1, 2, 3, 4].map((i) => (<span key={i} className={cx('h-[4px] w-[4px] rounded-full', i === 0 ? 'bg-[#ff8000]' : 'bg-white')} />))}
        </div>
      </div>

      {/* ===== Panel krem + kartu salam ===== */}
      <div className="relative">
        <div className="absolute inset-x-0 top-[18px] bottom-0 rounded-t-[20px] bg-cream" />

        <div className="relative mx-[20px] flex h-[48px] items-center rounded-[16px] bg-white pl-[11px] pr-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          <Photo src="avatar.png" className="h-[32px] w-[32px] shrink-0 rounded-full" fallback={<AvatarFallback name={s.profile.name} />} />
          <span className="ml-[10px] min-w-0 truncate text-[16px] font-bold text-black">Halo, {first}</span>
          <div className="ml-auto flex items-center gap-[2px] text-[#555]">
            <IconTop label="Pusat bantuan" onClick={() => go('cs')}><Headset className="h-[25px] w-[25px]" strokeWidth={1.7} /></IconTop>
            <IconTop label="Chat" onClick={() => go('chats')}><MessageCircle className="h-[24px] w-[24px]" strokeWidth={1.7} /></IconTop>
            <IconTop label={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'} onClick={() => go('notif')}>
              <Bell className="h-[23px] w-[23px]" strokeWidth={1.7} />
              {unread > 0 && <span className="absolute right-[7px] top-[7px] h-[9px] w-[9px] rounded-full border-2 border-white bg-red" />}
            </IconTop>
          </div>
        </div>

        {/* Kategori */}
        <div className="relative mt-[34px] grid grid-cols-4 px-[14px]">
          <Cat label={['Klinik', 'Hewan']} onClick={() => go('list:klinik')}
            icon={<AssetIcon src="ic-klinik.png" className="h-[32px] w-[32px]" fallback={<HousePlus className="h-[32px] w-[32px] text-red" strokeWidth={2} />} />} />
          <Cat label={['Konsultasi', 'Hewan']} onClick={() => go('list:konsultasi')}
            icon={<AssetIcon src="ic-konsul.png" className="h-[34px] w-[27px]" fallback={<Stethoscope className="h-[32px] w-[32px] text-red" strokeWidth={2} />} />} />
          <Cat label={['Grooming']} onClick={() => go('list:grooming')}
            icon={<AssetIcon src="ic-grooming.png" className="h-[32px] w-[37px]" fallback={<Scissors className="h-[32px] w-[32px] text-red" strokeWidth={2} />} />} />
          <Cat label={['Lainnya']} coach="lainnya" onClick={() => go('layanan')}
            icon={<AssetIcon src="ic-apps.png" className="h-[32px] w-[32px]" fallback={<LayoutGrid className="h-[30px] w-[30px] text-[#4a4a4a]" strokeWidth={2.2} fill="currentColor" />} />} />
        </div>

        {/* Rekomendasi */}
        <h2 className="relative m-0 mt-[30px] px-[26px] font-jakarta text-[15px] font-bold leading-[20px] text-black">Rekomendasi untuk Anda</h2>
        <DragRow className="hide-scrollbar h-scroll relative mt-[14px] flex gap-[16px] overflow-x-auto px-[26px] pb-[12px]" arrows label="rekomendasi">
          {PROMOS.map((p) => <PromoCard key={p.id} p={p} onClick={() => setPromo(p)} />)}
        </DragRow>

        {/* Baru saja dilihat */}
        <div className="relative mt-[22px] flex items-center justify-between px-[26px]">
          <h2 className="m-0 text-[15px] font-bold leading-[20px] text-black">Baru Saja Dilihat</h2>
          <button onClick={() => go('list:konsultasi')} className="flex h-[26px] items-center justify-center whitespace-nowrap rounded-[6px] border border-red bg-transparent px-[12px] text-[11px] font-bold leading-none text-red">
            Lihat Semua
          </button>
        </div>
        <DragRow className="hide-scrollbar h-scroll relative mt-[14px] flex gap-[14px] overflow-x-auto px-[26px] pb-[14px]" arrows label="dokter">
          {DOCS.map((d) => <DocCard key={d.id} d={d} onOpen={() => go('dokter:' + d.id)} />)}
        </DragRow>
      </div>

      {!s.tutorialDone && <Coachmark onClose={() => up({ tutorialDone: true })} />}

      <Sheet open={!!promo} onClose={() => setPromo(null)} title={promo?.head}>
        {promo && (
          <>
            <p className="m-0 mb-[22px] text-[14px] font-medium leading-[22px] text-[#666]">{promo.body}</p>
            <Btn onClick={() => { const r = promo.route; setPromo(null); go(r); }}>{promo.cta}</Btn>
          </>
        )}
      </Sheet>
    </div>
  );
}

function IconTop({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button aria-label={label} onClick={onClick} className="relative flex h-[40px] w-[38px] items-center justify-center bg-transparent p-0">{children}</button>;
}

function Cat({ icon, label, onClick, coach }: { icon: React.ReactNode; label: string[]; onClick: () => void; coach?: string }) {
  return (
    <button onClick={onClick} data-coach={coach} aria-label={label.join(' ')} className="flex flex-col items-center bg-transparent p-0 active:scale-95">
      <span className="flex h-[58px] w-[60px] items-center justify-center rounded-[18px] bg-sand shadow-[0_4px_4px_rgba(0,0,0,0.25)]">{icon}</span>
      <span className="mt-[10px] text-center text-[12px] font-semibold leading-[18px] text-black">
        {label.map((l) => <span key={l} className="block">{l}</span>)}
      </span>
    </button>
  );
}

function PromoCard({ p, onClick }: { p: (typeof PROMOS)[number]; onClick: () => void }) {
  const fb = p.tone === 'blue' ? 'from-[#dfeaf3] to-[#c3d6e6] text-[#1d3a63]' : 'from-[#f0d6a8] to-[#c99a57] text-[#13335c]';
  return (
    <button onClick={onClick} aria-label={p.head} className="h-[136px] w-[219px] shrink-0 overflow-hidden rounded-[16px] bg-transparent p-0 shadow-[0_3px_4px_rgba(0,0,0,0.25)]">
      <Photo
        src={p.img} className="h-full w-full"
        fallback={
          <div className={cx('relative h-full w-full bg-gradient-to-br p-[14px] text-left', fb)}>
            <span className="flex items-center gap-1 text-[13px] font-extrabold"><PawLogo className="h-[14px] w-[14px]" />{p.brand}</span>
            <span className="mt-[6px] block w-[110px] text-[16px] font-extrabold leading-[19px]">{p.title.map((t) => <span key={t} className="block">{t}</span>)}</span>
            <span className="mt-[2px] block text-[22px] font-extrabold leading-none">{p.big}</span>
          </div>
        }
      />
    </button>
  );
}

function DocCard({ d, onOpen }: { d: (typeof DOCS)[number]; onOpen: () => void }) {
  return (
    <div className="relative h-[112px] w-[214px] shrink-0 rounded-[15px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
      <Photo src={d.photo} className="absolute left-[12px] top-[12px] h-[49px] w-[49px] rounded-full" />
      <div className="absolute left-[70px] right-[8px] top-[11px]">
        <div className="truncate text-[14px] font-bold leading-[18px] text-black">{d.name}</div>
        <div className="truncate text-[12px] font-medium leading-[18px] text-black">{d.clinic}</div>
        <div className="flex items-center gap-[4px] text-[10px] font-medium leading-[18px] text-black">
          <Star className="h-[11px] w-[11px] text-orange" fill="currentColor" strokeWidth={0} />
          <span>{d.rating}</span>
          <Pin className="ml-[6px] h-[11px] w-[9px] text-orange" strokeWidth={2.2} />
          <span>{d.km}</span>
        </div>
      </div>
      <button onClick={onOpen} className="absolute bottom-[10px] left-[14px] right-[14px] h-[28px] rounded-[7px] bg-blue p-0 text-[10px] font-bold text-white">Buat Janji Temu</button>
    </div>
  );
}

function AvatarFallback({ name }: { name: string }) {
  const ini = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return <div className="flex h-full w-full items-center justify-center bg-[#d9c7a6] text-[12px] font-bold text-white">{ini}</div>;
}

function Poster() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#f5a623] via-[#ee9a1f] to-[#d98312]">
      <div className="absolute left-[12px] top-[56px] flex h-[82px] w-[82px] items-center justify-center rounded-full bg-[#c53a1c] text-center text-[12px] font-extrabold leading-[14px] text-[#ffd77a] shadow-inner">
        <span>BESON<br /><span className="text-[22px] leading-[22px]">50%</span></span>
      </div>
      <div className="absolute left-[196px] top-[28px] flex items-center gap-[6px]">
        <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-red text-[#fdb515]"><PawLogo className="h-[20px] w-[20px]" /></span>
        <span className="text-[26px] font-bold leading-none text-[#fdd13d]">Petopia</span>
      </div>
      <div className="absolute left-[188px] top-[62px] font-extrabold uppercase leading-[40px] text-[#5a2d0f]">
        <div className="text-[34px]">Vaksinasi</div>
        <div className="text-[44px]">Hewan</div>
      </div>
    </div>
  );
}

/* Tutorial: tooltip menempel ke elemen sebenarnya, jadi tetap pas di ukuran layar apa pun */
type Spot = { x: number; top: number; bottom: number };
const TIP_W = 172;
const TIP_H = 98;
function Coachmark({ onClose }: { onClose: () => void }) {
  const root = useOverlay();
  const [spots, setSpots] = useState<{ a: Spot | null; b: Spot | null; w: number; h: number } | null>(null);
  const [step, setStep] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const ph = document.getElementById('phone');
      if (!ph) return;
      const pr = ph.getBoundingClientRect();
      const q = (n: string): Spot | null => {
        const el = document.querySelector(`[data-coach="${n}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left - pr.left + r.width / 2, top: r.top - pr.top, bottom: r.bottom - pr.top };
      };
      setSpots({ a: q('lainnya'), b: q('booking'), w: pr.width, h: pr.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (!root || !spots) return null;
  const left = (x: number) => Math.max(12, Math.min(spots.w - TIP_W - 12, x - TIP_W / 2));
  // Kalau dua tooltip tidak muat bersamaan (layar pendek), tampilkan satu per satu
  const together = !!(spots.a && spots.b && spots.a.bottom + 14 + TIP_H + 8 < spots.b.top - 12 - TIP_H);
  const showA = !!spots.a && (together || step === 0);
  const showB = !!spots.b && (together || step === 1 || !spots.a);

  const Tip = ({ children, arrowX, arrow }: { children: React.ReactNode; arrowX: number; arrow: 'up' | 'down' }) => (
    <div className="relative rounded-[14px] bg-white p-[12px] text-center shadow-xl" style={{ width: TIP_W }}>
      <span className={cx('absolute h-[14px] w-[14px] rotate-45 bg-white', arrow === 'up' ? '-top-[6px]' : '-bottom-[6px]')} style={{ left: arrowX - 7 }} />
      {children}
    </div>
  );
  const actions = (last: boolean) => (
    <div className="mt-[10px] flex gap-[6px]">
      {!together && !last && (
        <button onClick={(e) => { e.stopPropagation(); setStep(1); }} className="h-[30px] flex-1 rounded-[8px] bg-orange p-0 text-[11px] font-bold text-white">Lanjut</button>
      )}
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="h-[30px] flex-1 rounded-[8px] bg-sand p-0 text-[11px] font-semibold text-ink">{together || last ? 'Lewatkan Tutorial' : 'Lewati'}</button>
    </div>
  );

  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-[75] bg-black/60" onClick={() => (together || step === 1 ? onClose() : setStep(1))} role="dialog" aria-label="Tutorial singkat">
      {showA && spots.a && (
        <div className="absolute" style={{ left: left(spots.a.x), top: spots.a.bottom + 14 }}>
          <Tip arrow="up" arrowX={spots.a.x - left(spots.a.x)}>
            <p className="m-0 text-[12.5px] font-bold leading-[17px] text-black">Klik ini untuk menu lainnya</p>
            {actions(false)}
          </Tip>
        </div>
      )}
      {showB && spots.b && (
        <div className="absolute" style={{ left: left(spots.b.x), bottom: spots.h - spots.b.top + 12 }}>
          <Tip arrow="down" arrowX={spots.b.x - left(spots.b.x)}>
            <p className="m-0 text-[12.5px] font-bold leading-[17px] text-black">Klik ini untuk melihat booking</p>
            {actions(true)}
          </Tip>
        </div>
      )}
    </div>,
    root,
  );
}
