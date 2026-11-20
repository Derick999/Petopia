import { useState } from 'react';
import { Bookmark, MessageSquare, Star } from 'lucide-react';
import { DOCTORS, TRAINERS, rupiah } from '../data';
import { ArrowLeftIcon, Btn, Photo, cx } from '../ui';
import { JadwalSheet } from './Flow';
import { useNav } from '../nav';
import { useApp } from '../store';
import { useRequireLogin } from '../hooks';

const TABS = ['Tentang', 'Pengalaman', 'Pendidikan'] as const;
type Tab = (typeof TABS)[number];

function content(name: string, trainer: boolean, years: number, place: string): Record<Tab, string[]> {
  if (trainer) {
    return {
      Tentang: [`${name} adalah pelatih hewan bersertifikat yang berfokus pada perilaku dan kepatuhan dasar. Metodenya berbasis penguatan positif, tanpa kekerasan.`, 'Sesi bisa untuk anakan maupun hewan dewasa, mulai dari toilet training, perintah dasar, sampai mengatasi kecemasan berpisah.'],
      Pengalaman: [`${years} tahun melatih anjing dan kucing`, place, 'Telah melatih lebih dari 600 hewan'],
      Pendidikan: ['Sertifikasi Pelatih Anjing Profesional (CPDT)', 'Pelatihan Perilaku Kucing Domestik', 'Kursus Pertolongan Pertama Hewan'],
    };
  }
  return {
    Tentang: [`${name} berfokus pada kesehatan umum, vaksinasi, dan perawatan harian hewan peliharaan. Penjelasannya runtut dan mudah dipahami pemilik.`, 'Konsultasi bisa dilakukan lewat chat atau kunjungan langsung, lengkap dengan catatan perawatan yang bisa kamu simpan.'],
    Pengalaman: [`${years} tahun praktik, ${place.toLowerCase()}`, 'Pernah bertugas di klinik rawat inap 24 jam', 'Menangani lebih dari 2.000 pasien hewan'],
    Pendidikan: ['Sarjana Kedokteran Hewan, IPB University', 'Profesi Dokter Hewan, IPB University', 'Sertifikasi Feline Medicine'],
  };
}

export default function DoctorDetail({ id }: { id: string }) {
  const { back, go } = useNav();
  const { s, up, toast } = useApp();
  const trainer = TRAINERS.some((x) => x.id === id);
  const p = [...DOCTORS, ...TRAINERS].find((x) => x.id === id) ?? DOCTORS[0];
  const [tab, setTab] = useState<Tab>('Tentang');
  const [sheet, setSheet] = useState(false);
  const need = useRequireLogin('jadwal:dokter:' + p.id, () => setSheet(true));
  const key = 'dokter:' + p.id;
  const saved = s.saved.includes(key);
  const place = p.place.replace('Praktik di ', '');

  const toggle = () => {
    up((cur) => ({ saved: cur.saved.includes(key) ? cur.saved.filter((x) => x !== key) : [...cur.saved, key] }));
    toast(saved ? 'Dihapus dari tersimpan' : 'Disimpan');
  };
  const next = (date: string, time: string) => {
    up({ draft: { kind: trainer ? 'trainer' : 'dokter', refId: key, place, who: p.name, km: '-', service: trainer ? 'Sesi latihan hewan' : 'Konsultasi dokter hewan', cat: trainer ? 'lainnya' : 'konsultasi', price: p.price, date, time, pet: s.pets[0]?.name ?? '' } });
    go('bayar');
  };
  const pill = 'inline-flex h-[24px] items-center whitespace-nowrap rounded-[6px] border border-black/20 bg-white px-[8px] text-[11px] font-semibold text-ink-2';

  return (
    <div className="relative h-full overflow-hidden bg-cream">
      <button onClick={back} aria-label="Kembali" className="absolute left-[16px] top-[70px] z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-orange p-0 text-white">
        <ArrowLeftIcon />
      </button>
      <button onClick={toggle} aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan'} aria-pressed={saved} className="absolute right-[16px] top-[70px] z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white p-0 text-orange shadow">
        <Bookmark className="h-[18px] w-[18px]" strokeWidth={2.4} fill={saved ? 'currentColor' : 'none'} />
      </button>

      <div className="absolute left-[22px] right-[22px] top-[126px] flex gap-[16px]">
        <Photo src={p.photo} className="h-[118px] w-[110px] shrink-0 rounded-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.25)]" />
        <div className="min-w-0 pt-[2px]">
          <div className="text-[16px] font-bold leading-[20px] text-ink-2">{p.name}</div>
          <div className="mt-[4px] text-[12px] font-medium leading-[18px] text-ink-2">{p.animals}</div>
          <div className="text-[12px] font-medium leading-[18px] text-ink-2">{p.place}</div>
          <div className="mt-[8px] flex flex-wrap gap-[6px]">
            <span className={pill}>{p.years} Tahun</span>
            <span className={pill}><Star className="mr-[4px] h-[10px] w-[10px] text-orange" fill="currentColor" strokeWidth={0} />{p.rating} ({p.reviews})</span>
            <span className={pill}>{p.satisfied}% Puas</span>
          </div>
          <div className="mt-[10px] text-[16px] font-bold text-ink-2">{rupiah(p.price)}</div>
        </div>
      </div>

      <section className="absolute inset-x-0 bottom-0 top-[290px] overflow-y-auto rounded-t-[22px] bg-white px-[22px] pb-[120px] pt-[22px] shadow-[0_-3px_8px_rgba(0,0,0,0.10)]">
        <div className="flex gap-[8px]" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={cx('h-[36px] flex-1 rounded-[18px] border border-orange text-[14px] font-semibold', tab === t ? 'bg-orange text-white' : 'bg-transparent text-orange')}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-[22px] space-y-[16px] text-[14px] font-medium leading-[22px] text-[#6f6f6f]">
          {content(p.name, trainer, p.years, p.place)[tab].map((t) => <p key={t} className="m-0">{t}</p>)}
        </div>
      </section>

      <div className="absolute inset-x-0 bottom-0 z-20 flex gap-[10px] bg-white px-[22px] pb-[26px] pt-[14px] shadow-[0_-4px_14px_rgba(0,0,0,0.08)]">
        <Btn onClick={() => need(() => setSheet(true))}>Jadwalkan</Btn>
        <button onClick={() => go('chat:' + p.id)} aria-label={`Chat ${p.name}`} className="flex h-[48px] w-[60px] shrink-0 items-center justify-center rounded-[16px] border border-orange bg-white p-0 text-orange">
          <MessageSquare className="h-[22px] w-[22px]" strokeWidth={2.2} />
        </button>
      </div>

      <JadwalSheet open={sheet} onClose={() => setSheet(false)} title={trainer ? 'Pilih Tanggal & Waktu Sesi' : 'Pilih Tanggal & Waktu Konsultasi'} onNext={next}
        taken={s.bookings.filter((b) => b.status === 'Terjadwal' && b.who === p.name).map((b) => ({ date: b.date, time: b.time }))} />
    </div>
  );
}
