import { useState } from 'react';
import { Heart, MapPin, ShieldCheck } from 'lucide-react';
import { Btn, Chip, Empty, Field, Page, Photo, SelectField, cx, DragRow } from '../ui';
import { JadwalSheet } from './Flow';
import { useNav } from '../nav';
import { uid, useApp } from '../store';
import { ADOPTS, type Adopt } from '../data';
import { useRequireLogin } from '../hooks';

function useSave(id: string) {
  const { s, up, toast } = useApp();
  const key = 'adopt:' + id;
  const saved = s.saved.includes(key);
  return { saved, toggle: () => { up((c) => ({ saved: c.saved.includes(key) ? c.saved.filter((x) => x !== key) : [...c.saved, key] })); toast(saved ? 'Dihapus dari tersimpan' : 'Disimpan'); } };
}

function Card({ a }: { a: Adopt }) {
  const { go } = useNav();
  const { saved, toggle } = useSave(a.id);
  return (
    <li className="relative">
      <button onClick={() => go('adopsi:' + a.id)} className="block w-full overflow-hidden rounded-[16px] bg-white p-0 text-left shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
        <Photo src={a.photo} className="h-[132px] w-full" />
        <span className="block px-[12px] pb-[14px] pt-[10px]">
          <span className="block text-[15px] font-bold leading-[20px] text-ink">{a.name}</span>
          <span className="block truncate text-[12px] font-semibold text-[#8a8a8a]">{a.breed}</span>
          <span className="mt-[6px] block text-[12px] font-semibold text-ink-2">{a.age}, {a.gender}</span>
        </span>
      </button>
      <button onClick={toggle} aria-label={saved ? `Hapus ${a.name} dari tersimpan` : `Simpan ${a.name}`} aria-pressed={saved} className="absolute right-[6px] top-[6px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/90 p-0 text-red">
        <Heart className="h-[20px] w-[20px]" fill={saved ? 'currentColor' : 'none'} />
      </button>
    </li>
  );
}

export function Adopsi() {
  const { back } = useNav();
  const [f, setF] = useState('Semua');
  const list = ADOPTS.filter((a) => f === 'Semua' || a.type === f);
  return (
    <Page title="Adopt Me" back={back}>
      <DragRow className="hide-scrollbar flex gap-[8px] overflow-x-auto px-[22px] pb-[5px] pt-[22px]">
        {['Semua', 'Anjing', 'Kucing', 'Lainnya'].map((x) => <Chip key={x} label={x} active={f === x} onClick={() => setF(x)} />)}
      </DragRow>
      {list.length === 0 ? <Empty title="Belum ada hewan" text="Belum ada hewan di kategori ini." /> : (
        <ul className="m-0 grid list-none grid-cols-2 gap-[14px] px-[22px] pt-[18px]">{list.map((a) => <Card key={a.id} a={a} />)}</ul>
      )}
    </Page>
  );
}

export function AdopsiDetail({ id }: { id: string }) {
  const { back, go } = useNav();
  const a = ADOPTS.find((x) => x.id === id);
  const need = useRequireLogin('adopter:' + id, () => go('adopter:' + id));
  const [more, setMore] = useState(false);
  const { saved, toggle } = useSave(id);
  if (!a) return <Page title="Adopt Me" back={back}><Empty title="Hewan tidak ditemukan" text="Hewan ini mungkin sudah diadopsi." /></Page>;
  return (
    <Page title={a.name} back={back} footer={<Btn onClick={() => need(() => go('adopter:' + a.id))}>Ajukan Adopsi</Btn>}>
      <div className="relative">
        <Photo src={a.photo} className="h-[240px] w-full" />
        <button onClick={toggle} aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan'} aria-pressed={saved} className="absolute right-[16px] top-[16px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white p-0 text-red shadow">
          <Heart className="h-[20px] w-[20px]" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="px-[22px] pt-[20px]">
        <h2 className="m-0 text-[22px] font-bold leading-[28px] text-ink">{a.name}</h2>
        <p className="m-0 mt-[2px] text-[14px] font-semibold text-[#8a8a8a]">{a.breed}</p>
        <div className="mt-[14px] flex flex-wrap gap-[8px]">
          {[a.age, a.gender, a.type].map((t) => <span key={t} className="rounded-full border border-black/15 bg-white px-[12px] py-[5px] text-[12px] font-bold text-ink-2">{t}</span>)}
          <span className={cx('inline-flex items-center gap-[4px] rounded-full px-[12px] py-[5px] text-[12px] font-bold', a.vaccinated ? 'bg-green/15 text-green' : 'bg-sand text-brown')}><ShieldCheck className="h-[13px] w-[13px]" />{a.vaccinated ? 'Sudah divaksin' : 'Belum divaksin'}</span>
        </div>
        <p className="m-0 mt-[16px] flex items-center gap-[8px] text-[13px] font-semibold text-ink-2"><MapPin className="h-[15px] w-[15px] text-orange" />{a.place}</p>
        <h3 className="m-0 mt-[24px] text-[16px] font-bold text-ink">Tentang {a.name}</h3>
        <p className={cx('m-0 mt-[8px] text-[14px] font-medium leading-[22px] text-[#666]', !more && 'line-clamp-3')}>{a.about}</p>
        <button onClick={() => setMore((v) => !v)} aria-expanded={more} className="mt-[6px] h-[36px] bg-transparent p-0 text-[13px] font-bold text-orange">{more ? 'Sembunyikan' : 'Selengkapnya'}</button>
      </div>
    </Page>
  );
}

/* Data Calon Adopter + jadwal survey */
export function Adopter({ id }: { id: string }) {
  const { s, up, notify, toast } = useApp();
  const { back, replace } = useNav();
  const a = ADOPTS.find((x) => x.id === id);
  const [f, setF] = useState({ name: s.profile.name, phone: s.profile.phone, address: '', home: '', exp: '', why: '' });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [sheet, setSheet] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((c) => ({ ...c, [k]: v }));
  if (!a) return <Page title="Data Calon Adopter" back={back}><Empty title="Hewan tidak ditemukan" text="Kembali dan pilih hewan lain." /></Page>;

  const next = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'Nama wajib diisi';
    if (!/^[0-9+\s-]{8,16}$/.test(f.phone)) e.phone = 'Nomor telepon belum benar';
    if (f.address.trim().length < 8) e.address = 'Tulis alamat lengkap';
    if (!f.home) e.home = 'Pilih tempat tinggal';
    if (!f.exp) e.exp = 'Pilih pengalaman';
    if (f.why.trim().length < 10) e.why = 'Ceritakan alasanmu minimal 10 karakter';
    if (!agree) e.agree = 'Centang persetujuan untuk lanjut';
    setErr(e);
    if (Object.keys(e).length) { toast('Lengkapi data yang ditandai'); return; }
    setSheet(true);
  };

  const book = (date: string, time: string) => {
    const bid = uid('b');
    up((c) => ({
      profile: { ...c.profile, phone: f.phone || c.profile.phone },
      bookings: [{ id: bid, kind: 'adopsi', place: a.place, who: 'Tim adopsi Petopia', service: `Survey adopsi ${a.name}`, cat: 'lainnya', date, time, price: 0, discount: 0, pet: a.name, pay: '-', status: 'Terjadwal', km: '-', code: 'ADP-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000)), ref: 'adopsi:' + a.id }, ...c.bookings],
    }));
    notify('Survey adopsi terjadwal', `Survey adopsi ${a.name} sudah dijadwalkan. Tim kami akan menghubungimu.`);
    replace('sukses:' + bid);
  };

  return (
    <Page title="Data Calon Adopter" back={back} footer={<Btn onClick={next}>Jadwalkan Survey</Btn>}>
      <form className="space-y-[18px] px-[21px] pt-[26px]" onSubmit={(e) => { e.preventDefault(); next(); }} noValidate>
        <p className="m-0 rounded-[14px] bg-sand px-[14px] py-[12px] text-[13px] font-semibold leading-[19px] text-brown">Kamu mengajukan adopsi untuk <b>{a.name}</b> ({a.breed}). Isi data berikut, lalu pilih jadwal survey rumah.</p>
        <Field auth label="Nama Lengkap" value={f.name} onChange={set('name')} placeholder="Masukkan nama lengkap" error={err.name} />
        <Field auth label="Nomor Telepon" value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="08xxxxxxxxxx" error={err.phone} />
        <Field auth label="Alamat Lengkap" value={f.address} onChange={set('address')} placeholder="Nama jalan, nomor, kelurahan" error={err.address} />
        <SelectField label="Tempat Tinggal" value={f.home} onChange={set('home')} options={['Rumah dengan halaman', 'Rumah tanpa halaman', 'Apartemen', 'Kos']} placeholder="Pilih tempat tinggal" error={err.home} />
        <SelectField label="Pengalaman Memelihara" value={f.exp} onChange={set('exp')} options={['Belum pernah', 'Pernah memelihara', 'Berpengalaman lebih dari 3 tahun']} placeholder="Pilih pengalaman" error={err.exp} />
        <Field auth label="Alasan Ingin Mengadopsi" value={f.why} onChange={set('why')} multiline placeholder="Ceritakan singkat" error={err.why} />
        <label className="flex min-h-[44px] items-start gap-[12px] text-[13px] font-semibold leading-[19px] text-ink-2">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-[2px] h-[20px] w-[20px] shrink-0 accent-orange" />
          Saya bersedia dikunjungi untuk survey dan akan merawat hewan ini dengan penuh tanggung jawab.
        </label>
        {err.agree && <p role="alert" className="m-0 -mt-[8px] text-[11px] font-semibold text-red">{err.agree}</p>}
      </form>
      <JadwalSheet open={sheet} onClose={() => setSheet(false)} title="Pilih Tanggal & Waktu Survey" cta="Konfirmasi" onNext={book}
        taken={s.bookings.filter((b) => b.status === 'Terjadwal').map((b) => ({ date: b.date, time: b.time }))} />
    </Page>
  );
}
