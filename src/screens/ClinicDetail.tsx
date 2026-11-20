import { useState } from 'react';
import { Bookmark, Clock, MapPin, MessageSquare } from 'lucide-react';
import { CLINICS, FACILITIES, GROOMING, PENITIPAN, SERVICES, VAKSINASI, rupiah, type Clinic } from '../data';
import { ArrowLeftIcon, Btn, Divider, Photo, cx } from '../ui';
import { Rating } from './ServiceList';
import { JadwalSheet } from './Flow';
import { useNav } from '../nav';
import { useApp } from '../store';
import { useRequireLogin } from '../hooks';

export default function ClinicDetail({ id }: { id: string }) {
  const { back, go } = useNav();
  const { s, up, toast } = useApp();
  const c: Clinic = [...CLINICS, ...GROOMING, ...VAKSINASI, ...PENITIPAN].find((x) => x.id === id) ?? CLINICS[0];
  const [tab, setTab] = useState<'layanan' | 'fasilitas'>('layanan');
  const [sheet, setSheet] = useState(false);
  const need = useRequireLogin('jadwal:klinik:' + c.id, () => setSheet(true));
  const key = 'klinik:' + c.id;
  const saved = s.saved.includes(key);

  const toggle = () => {
    up((cur) => ({ saved: cur.saved.includes(key) ? cur.saved.filter((x) => x !== key) : [...cur.saved, key] }));
    toast(saved ? 'Dihapus dari tersimpan' : 'Klinik disimpan');
  };
  const next = (date: string, time: string) => {
    up({ draft: { kind: 'klinik', refId: key, place: c.name, who: 'Klinik hewan', km: c.km + 'km', service: '', cat: 'konsultasi', price: 0, date, time, pet: s.pets[0]?.name ?? '' } });
    go('bayar');
  };

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <Photo src="klinik-hero.png" className="absolute -left-[51px] top-0 h-[344px] w-[517px] max-w-none" />
      <div className="absolute inset-x-0 top-0 h-[213px] bg-gradient-to-b from-[#d9d9d9] to-transparent" />

      <button onClick={back} aria-label="Kembali" className="absolute left-[16px] top-[70px] z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90 p-0 text-orange shadow">
        <ArrowLeftIcon />
      </button>
      <button onClick={toggle} aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan klinik'} aria-pressed={saved} className="absolute right-[16px] top-[70px] z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90 p-0 text-orange shadow">
        <Bookmark className="h-[18px] w-[18px]" strokeWidth={2.4} fill={saved ? 'currentColor' : 'none'} />
      </button>

      <section className="absolute inset-x-0 bottom-0 top-[256px] overflow-y-auto rounded-t-[22px] bg-white px-[22px] pb-[120px] pt-[26px] shadow-[0_-4px_10px_rgba(0,0,0,0.15)]">
        <h1 className="m-0 text-[20px] font-bold leading-[26px] text-[#777]">{c.name}</h1>
        <p className="m-0 mt-[4px] text-[14px] font-semibold leading-[22px] text-[#787878]">{c.animals}</p>

        <div className="mt-[14px] flex items-start gap-[12px]">
          <MapPin className="mt-[2px] h-[16px] w-[12px] shrink-0 text-orange" strokeWidth={2.4} />
          <div>
            <div className="text-[14px] font-bold leading-[20px] text-[#787878]">{c.address}</div>
            <div className="text-[12px] font-semibold leading-[18px] text-orange">{c.km}km dari lokasimu</div>
          </div>
        </div>
        <div className="mt-[12px] flex items-center gap-[12px]">
          <Clock className="h-[14px] w-[14px] shrink-0 text-orange" strokeWidth={2.4} />
          <span className="text-[14px] font-semibold leading-[18px] text-[#787878]">Buka s/d {c.hours} WIB</span>
          <Rating r={c.rating} n={c.reviews} className="ml-auto" />
        </div>
        <Divider className="mt-[22px]" />

        <div className="mt-[18px] flex gap-[10px]" role="tablist">
          {(['layanan', 'fasilitas'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={cx('h-[36px] w-[116px] rounded-[18px] border border-orange text-[14px] font-semibold capitalize', tab === t ? 'bg-orange text-white' : 'bg-transparent text-orange')}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'layanan' ? (
          <ul className="m-0 mt-[18px] list-none p-0">
            {SERVICES.map((sv) => (
              <li key={sv.id} className="flex items-center justify-between gap-[12px] border-b border-[#eee3c9] py-[15px] text-[14px] font-semibold text-[#787878]">
                <span>{sv.name}</span><span className="shrink-0 text-orange">{rupiah(sv.price)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-[18px]">
            <h2 className="m-0 mb-[12px] text-[14px] font-bold text-[#787878]">Ruang Operasi</h2>
            <Photo src="fasilitas-operasi.png" className="h-[190px] w-full rounded-[16px]" />
            <ul className="m-0 mt-[14px] list-none p-0 text-[14px] font-semibold text-[#787878]">
              {FACILITIES.slice(1).map((f) => (<li key={f} className="border-b border-[#eee3c9] py-[14px]">{f}</li>))}
            </ul>
          </div>
        )}
      </section>

      <div className="absolute inset-x-0 bottom-0 z-20 flex gap-[10px] bg-white px-[22px] pb-[26px] pt-[14px] shadow-[0_-4px_14px_rgba(0,0,0,0.08)]">
        <Btn onClick={() => need(() => setSheet(true))}>Jadwalkan</Btn>
        <button onClick={() => go('chat:c-' + c.id)} aria-label="Chat klinik" className="flex h-[48px] w-[60px] shrink-0 items-center justify-center rounded-[16px] border border-orange bg-white p-0 text-orange">
          <MessageSquare className="h-[22px] w-[22px]" strokeWidth={2.2} />
        </button>
      </div>

      <JadwalSheet open={sheet} onClose={() => setSheet(false)} title="Pilih Tanggal & Waktu Kunjungan" onNext={next}
        taken={s.bookings.filter((b) => b.status === 'Terjadwal' && b.place === c.name).map((b) => ({ date: b.date, time: b.time }))} />
    </div>
  );
}
