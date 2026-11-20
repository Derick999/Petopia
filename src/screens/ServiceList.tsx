import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, Clock, MapPin, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { CLINICS, DOCTORS, GROOMING, PENITIPAN, TRAINERS, VAKSINASI, rupiah, type Clinic, type Person } from '../data';
import { Btn, Divider, Empty, IconBtn, Page, PickSheet, Photo, cx, DragRow } from '../ui';
import { useNav } from '../nav';

export type Kind = 'klinik' | 'grooming' | 'vaksinasi' | 'penitipan' | 'konsultasi' | 'trainer';

const TITLE: Record<Kind, string> = {
  klinik: 'Klinik Hewan', grooming: 'Grooming', vaksinasi: 'Vaksinasi', penitipan: 'Penitipan Hewan',
  konsultasi: 'Konsultasi', trainer: 'Trainer',
};

const ANIMALS = ['Semua', 'Anjing', 'Kucing', 'Hewan Kecil', 'Burung', 'Reptil'] as const;
const HOURS = ['Semua', 'Buka 24 jam', 'Tutup sebelum 24:00'] as const;
const RATING = ['Semua', '4.5 ke atas', '4.0 ke atas'] as const;
const EXP = ['Semua', 'Kurang dari 5 tahun', '5 tahun atau lebih', '8 tahun atau lebih'] as const;
const SEX = ['Semua', 'Pria', 'Wanita'] as const;
const PRICE = ['Semua', 'Termurah', 'Termahal', 'Maks. Rp 30.000'] as const;

type Filters = { animal: string; hours: string; rating: string; exp: string; sex: string; price: string; near: boolean };
const NONE: Filters = { animal: 'Semua', hours: 'Semua', rating: 'Semua', exp: 'Semua', sex: 'Semua', price: 'Semua', near: false };

export default function ServiceList({ kind }: { kind: Kind }) {
  const { go, back } = useNav();
  const person = kind === 'konsultasi' || kind === 'trainer';
  const [f, setF] = useState<Filters>(NONE);
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [sheet, setSheet] = useState<keyof Filters | null>(null);
  const set = (k: keyof Filters) => (v: string) => setF((c) => ({ ...c, [k]: v }));
  const active = Object.entries(f).some(([k, v]) => (k === 'near' ? v : v !== 'Semua'));

  const clinics: Clinic[] = useMemo(() => {
    let list = { klinik: CLINICS, grooming: GROOMING, vaksinasi: VAKSINASI, penitipan: PENITIPAN }[kind as 'klinik'] ?? [];
    const key = q.trim().toLowerCase();
    if (key) list = list.filter((c) => (c.name + ' ' + c.address).toLowerCase().includes(key));
    if (f.animal !== 'Semua') list = list.filter((c) => c.animals.includes(f.animal));
    if (f.hours === 'Buka 24 jam') list = list.filter((c) => c.hours === '24:00');
    if (f.hours === 'Tutup sebelum 24:00') list = list.filter((c) => c.hours !== '24:00');
    if (f.rating !== 'Semua') list = list.filter((c) => c.rating >= parseFloat(f.rating));
    return f.near ? [...list].sort((a, b) => a.km - b.km) : list;
  }, [kind, f, q]);

  const people: Person[] = useMemo(() => {
    let list = kind === 'trainer' ? TRAINERS : DOCTORS;
    const key = q.trim().toLowerCase();
    if (key) list = list.filter((p) => (p.name + ' ' + p.place).toLowerCase().includes(key));
    if (f.animal !== 'Semua') list = list.filter((p) => p.animals.includes(f.animal));
    if (f.exp === 'Kurang dari 5 tahun') list = list.filter((p) => p.years < 5);
    if (f.exp === '5 tahun atau lebih') list = list.filter((p) => p.years >= 5);
    if (f.exp === '8 tahun atau lebih') list = list.filter((p) => p.years >= 8);
    if (f.sex !== 'Semua') list = list.filter((p) => p.gender === f.sex);
    if (f.price === 'Maks. Rp 30.000') list = list.filter((p) => p.price <= 30000);
    if (f.price === 'Termurah') list = [...list].sort((a, b) => a.price - b.price);
    if (f.price === 'Termahal') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [kind, f, q]);

  const count = person ? people.length : clinics.length;
  const chip = (k: keyof Filters, label: string) => {
    const on = f[k] !== 'Semua';
    return (
      <button key={k} onClick={() => setSheet(k)} aria-haspopup="dialog"
        className={cx('flex h-[34px] shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[12px] border px-[14px] text-[12px] font-semibold', on ? 'border-orange bg-orange text-white' : 'border-black/20 bg-white text-muted')}>
        {on ? String(f[k]) : label}
        <ChevronDown className="h-[12px] w-[12px] opacity-70" strokeWidth={2.6} />
      </button>
    );
  };

  const sheets: Record<string, { title: string; options: readonly string[] }> = {
    animal: { title: 'Jenis Hewan', options: ANIMALS }, hours: { title: 'Jam Operasional', options: HOURS }, rating: { title: 'Rating Klinik', options: RATING },
    exp: { title: 'Pengalaman', options: EXP }, sex: { title: 'Jenis Kelamin', options: SEX }, price: { title: 'Harga', options: PRICE },
  };
  const cur = sheet && sheet !== 'near' ? sheets[sheet] : null;

  return (
    <Page
      title={TITLE[kind]} back={back}
      right={<IconBtn label={searching ? 'Tutup pencarian' : 'Cari'} onClick={() => { setSearching((v) => !v); if (searching) setQ(''); }}>{searching ? <X className="h-[20px] w-[20px]" strokeWidth={2.4} /> : <Search className="h-[20px] w-[20px]" strokeWidth={2.4} />}</IconBtn>}
    >
      {searching && (
        <div className="px-[22px] pt-[16px]">
          <div className="flex h-[44px] items-center gap-[12px] rounded-[16px] bg-white px-[16px] shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
            <Search className="h-[18px] w-[18px] shrink-0 text-[#8b8b8b]" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${TITLE[kind].toLowerCase()}`} aria-label="Cari" className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-black outline-none placeholder:font-medium placeholder:text-[#b0b0b0]" />
          </div>
        </div>
      )}

      <DragRow className="hide-scrollbar flex gap-[8px] overflow-x-auto px-[22px] pb-[5px] pt-[18px]">
        {person ? (
          <>{chip('animal', 'Jenis Hewan')}{chip('exp', 'Pengalaman')}{chip('sex', 'Jenis Kelamin')}{chip('price', 'Harga')}</>
        ) : (
          <>
            <button aria-label="Atur ulang filter" onClick={() => { setF(NONE); setQ(''); }} className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[12px] border border-black/20 bg-white p-0 text-[#777]">
              <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={2.2} />
            </button>
            <button aria-pressed={f.near} onClick={() => setF((c) => ({ ...c, near: !c.near }))}
              className={cx('h-[34px] shrink-0 rounded-[12px] border px-[14px] text-[12px] font-semibold', f.near ? 'border-orange bg-orange text-white' : 'border-black/20 bg-white text-muted')}>
              Terdekat
            </button>
            {chip('animal', 'Jenis Hewan')}{chip('hours', 'Jam Operasional')}{chip('rating', 'Rating Klinik')}
          </>
        )}
      </DragRow>

      <p className="m-0 px-[22px] pt-[14px] text-[12px] font-semibold text-[#9a9a9a]" aria-live="polite">{count} hasil</p>

      {count === 0 ? (
        <Empty title="Tidak ada hasil" text="Coba ubah kata kunci atau hapus sebagian filter." action={active || q ? <Btn onClick={() => { setF(NONE); setQ(''); }}>Hapus filter</Btn> : undefined} />
      ) : (
        <ul className="m-0 mt-[16px] list-none p-0">
          {person
            ? people.map((p) => <PersonRow key={p.id} p={p} onOpen={() => go('dokter:' + p.id)} />)
            : clinics.map((c) => <ClinicRow key={c.id} c={c} onOpen={() => go('klinik:' + c.id)} />)}
        </ul>
      )}

      {cur && sheet && (
        <PickSheet open title={cur.title} options={cur.options} value={String(f[sheet])} onPick={set(sheet)} onClose={() => setSheet(null)} />
      )}
    </Page>
  );
}

function ClinicRow({ c, onOpen }: { c: Clinic; onOpen: () => void }) {
  return (
    <li className="px-[22px]">
      <button onClick={onOpen} className="flex w-full gap-[16px] bg-transparent p-0 text-left">
        <div className="relative h-[112px] w-[100px] shrink-0 overflow-hidden rounded-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          <Photo src={c.photo} className="h-full w-full" />
          {c.tag && <span className="absolute bottom-[8px] left-[16px] rounded-[4px] bg-orange px-[7px] text-[11px] font-semibold leading-[15px] text-white">{c.tag}</span>}
        </div>
        <div className="min-w-0 flex-1 py-[2px]">
          <div className="text-[14px] font-bold leading-[19px] text-ink-2">{c.name}</div>
          <div className="mt-[6px] text-[12px] font-semibold leading-[17px] text-ink-2">{c.animals}</div>
          <div className="mt-[8px] flex items-center gap-[6px] text-[12px] font-semibold leading-[16px] text-ink-2">
            <MapPin className="h-[15px] w-[12px] shrink-0 text-orange" strokeWidth={2.2} />{c.km}km dari lokasimu
          </div>
          <div className="mt-[5px] flex items-center gap-[6px] text-[12px] font-semibold leading-[16px] text-ink-2">
            <Clock className="h-[13px] w-[13px] shrink-0 text-orange" strokeWidth={2.2} />Buka s/d {c.hours} WIB
          </div>
          <Rating r={c.rating} n={c.reviews} className="mt-[8px]" />
        </div>
      </button>
      <Divider className="mb-[22px] mt-[22px]" />
    </li>
  );
}

export function Rating({ r, n, className }: { r: number; n: number; className?: string }) {
  return (
    <span className={cx('inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-[6px] border border-black/20 bg-white px-[7px] text-[10px] font-semibold leading-[15px] text-ink-2', className)}>
      <Star className="h-[10px] w-[10px] text-orange" fill="currentColor" strokeWidth={1.5} />
      {r.toFixed(1)} ({n} ulasan)
    </span>
  );
}

function PersonRow({ p, onOpen }: { p: Person; onOpen: () => void }) {
  return (
    <li className="px-[22px]">
      <button onClick={onOpen} className="flex w-full gap-[16px] bg-transparent p-0 text-left">
        <Photo src={p.photo} className="h-[112px] w-[100px] shrink-0 rounded-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.25)]" />
        <div className="min-w-0 flex-1 py-[2px]">
          <div className="text-[14px] font-bold leading-[19px] text-ink-2">{p.name}</div>
          <div className="mt-[4px] text-[12px] font-semibold leading-[17px] text-ink-2">{p.animals}</div>
          <div className="text-[12px] font-semibold leading-[17px] text-ink-2">{p.place}</div>
          <div className="mt-[8px] flex flex-wrap gap-[5px]">
            <Pill>{p.years} Tahun</Pill>
            <Pill><Star className="mr-[3px] h-[9px] w-[9px] text-orange" fill="currentColor" strokeWidth={0} />{p.rating} ({p.reviews})</Pill>
            <Pill>{p.satisfied}% Puas</Pill>
          </div>
          <div className="mt-[10px] text-[13px] font-bold leading-[16px] text-ink-2">{rupiah(p.price)}</div>
        </div>
      </button>
      <Divider className="mb-[22px] mt-[22px]" />
    </li>
  );
}

const Pill = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex h-[20px] items-center whitespace-nowrap rounded-[5px] border border-black/20 bg-white px-[6px] text-[9px] font-semibold text-ink-2">{children}</span>
);
