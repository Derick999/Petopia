import { useState, type ReactNode } from 'react';
import { Heart, HousePlus, LocateFixed, MapPin, Newspaper, PawPrint, Scissors, Search, Stethoscope, Syringe, Users, Hotel } from 'lucide-react';
import { Empty, Page, Photo } from '../ui';
import { useNav } from '../nav';
import { useApp } from '../store';
import { ARTICLES, CLINICS, DOCTORS, GROOMING, LOCATIONS, PENITIPAN, TRAINERS, VAKSINASI } from '../data';

const TILES: [string, string, ReactNode][] = [
  ['Klinik Hewan', 'list:klinik', <HousePlus key="a" />], ['Konsultasi Hewan', 'list:konsultasi', <Stethoscope key="b" />], ['Grooming', 'list:grooming', <Scissors key="c" />],
  ['Vaksinasi', 'list:vaksinasi', <Syringe key="d" />], ['Penitipan Hewan', 'list:penitipan', <Hotel key="e" />], ['Trainer', 'list:trainer', <Users key="f" />],
  ['Adopt Me', 'adopt', <Heart key="g" />], ['Artikel', 'artikel', <Newspaper key="h" />],
];

export function Layanan() {
  const { back, go } = useNav();
  return (
    <Page title="Semua Layanan" back={back}>
      <div className="px-[22px] pt-[28px]">
        <div className="grid grid-cols-3 gap-x-[10px] gap-y-[28px]">
          {TILES.map(([l, r, icon]) => (
            <button key={l} onClick={() => go(r)} className="flex flex-col items-center bg-transparent p-0 active:scale-95">
              <span className="flex h-[62px] w-[64px] items-center justify-center rounded-[18px] bg-sand text-red shadow-[0_4px_4px_rgba(0,0,0,0.25)] [&_svg]:h-[30px] [&_svg]:w-[30px]">{icon}</span>
              <span className="mt-[10px] w-[88px] text-center text-[12px] font-semibold leading-[18px] text-black">{l}</span>
            </button>
          ))}
        </div>
      </div>
    </Page>
  );
}

export function Lokasi() {
  const { s, up, toast } = useApp();
  const { back } = useNav();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const list = LOCATIONS.filter((l) => l.toLowerCase().includes(q.trim().toLowerCase()));
  const pick = (l: string) => { up({ location: l }); toast(`Lokasi diatur ke ${l}`); back(); };

  const locate = () => {
    if (!('geolocation' in navigator)) { toast('Perangkat ini tidak mendukung deteksi lokasi'); return; }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      () => { setBusy(false); pick('Karang Bolong'); },
      () => { setBusy(false); toast('Izin lokasi ditolak. Pilih lokasi dari daftar.'); },
      { timeout: 8000 },
    );
  };

  return (
    <Page title="Pilih Lokasi" back={back}>
      <div className="px-[22px] pt-[22px]">
        <div className="flex h-[46px] items-center gap-[12px] rounded-[16px] bg-white px-[16px] shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
          <Search className="h-[18px] w-[18px] shrink-0 text-[#8b8b8b]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kecamatan atau area" aria-label="Cari lokasi" className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-black outline-none placeholder:font-medium placeholder:text-[#b0b0b0]" />
        </div>
        <button onClick={locate} disabled={busy} className="mt-[14px] flex h-[52px] w-full items-center gap-[12px] rounded-[14px] border border-orange bg-white px-[16px] text-left text-[14px] font-bold text-orange disabled:opacity-60">
          <LocateFixed className="h-[20px] w-[20px]" />{busy ? 'Mencari lokasimu…' : 'Gunakan lokasi saat ini'}
        </button>

        {s.addresses.length > 0 && !q && (
          <>
            <h2 className="m-0 mt-[26px] text-[14px] font-bold text-orange">Alamat tersimpan</h2>
            <ul className="m-0 list-none p-0">
              {s.addresses.map((a) => (
                <li key={a.id}><button onClick={() => pick(a.label)} className="flex min-h-[64px] w-full items-center gap-[12px] border-b border-[#eee3c9] bg-transparent p-0 py-[10px] text-left">
                  <MapPin className="h-[18px] w-[18px] shrink-0 text-orange" /><span className="min-w-0"><span className="block text-[14px] font-bold text-ink">{a.label}</span><span className="block truncate text-[12px] font-semibold text-[#8a8a8a]">{a.text}</span></span>
                </button></li>
              ))}
            </ul>
          </>
        )}

        <h2 className="m-0 mt-[26px] text-[14px] font-bold text-orange">Area populer</h2>
        {list.length === 0 ? <Empty title="Area tidak ditemukan" text="Coba kata kunci lain, misalnya Pademangan." /> : (
          <ul className="m-0 list-none p-0">
            {list.map((l) => (
              <li key={l}><button onClick={() => pick(l)} aria-current={s.location === l} className="flex min-h-[54px] w-full items-center justify-between border-b border-[#eee3c9] bg-transparent p-0 text-left text-[14px] font-semibold text-ink">
                {l}{s.location === l && <span className="rounded-full bg-sand px-[10px] py-[3px] text-[11px] font-bold text-brown">Dipakai</span>}
              </button></li>
            ))}
          </ul>
        )}
      </div>
    </Page>
  );
}

const POPULAR = ['Cara merawat kucing', 'Vaksinasi kucing', 'Grooming anjing', 'Dokter hewan'];

export function Cari() {
  const { back, go } = useNav();
  const [q, setQ] = useState('');
  const key = q.trim().toLowerCase();
  const all = [...CLINICS, ...GROOMING, ...VAKSINASI, ...PENITIPAN];
  const uniq = all.filter((c, i) => all.findIndex((x) => x.id === c.id) === i);
  const arts = key ? ARTICLES.filter((a) => (a.title + a.topic).toLowerCase().includes(key)) : [];
  const clin = key ? uniq.filter((c) => (c.name + c.address).toLowerCase().includes(key)) : [];
  const docs = key ? [...DOCTORS, ...TRAINERS].filter((p) => (p.name + p.place + p.animals).toLowerCase().includes(key)) : [];
  const svc = key ? TILES.filter(([l]) => l.toLowerCase().includes(key)) : [];
  const none = key && !arts.length && !clin.length && !docs.length && !svc.length;

  const Group = ({ t, children }: { t: string; children: ReactNode }) => (<section className="mt-[22px]"><h2 className="m-0 mb-[4px] text-[14px] font-bold text-orange">{t}</h2><ul className="m-0 list-none p-0">{children}</ul></section>);
  const Item = ({ title, sub, onClick }: { title: string; sub: string; onClick: () => void }) => (
    <li><button onClick={onClick} className="block min-h-[58px] w-full border-b border-[#eee3c9] bg-transparent p-0 py-[10px] text-left"><span className="block text-[14px] font-bold leading-[19px] text-ink">{title}</span><span className="block text-[12px] font-semibold text-[#8a8a8a]">{sub}</span></button></li>
  );

  return (
    <Page title="Pencarian" back={back}>
      <div className="px-[22px] pt-[20px]">
        <div className="flex h-[46px] items-center gap-[12px] rounded-[16px] bg-white px-[16px] shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
          <Search className="h-[18px] w-[18px] shrink-0 text-[#8b8b8b]" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cara merawat kucing" aria-label="Cari" className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-black outline-none placeholder:font-medium placeholder:text-[#b0b0b0]" />
        </div>

        {!key ? (
          <>
            <h2 className="m-0 mt-[26px] text-[14px] font-bold text-black">Kategori Pencarian</h2>
            <div className="mt-[20px] grid grid-cols-3 gap-y-[24px]">
              {TILES.slice(0, 6).map(([l, r, icon]) => (
                <button key={l} onClick={() => go(r)} className="flex flex-col items-center bg-transparent p-0">
                  <span className="flex h-[58px] w-[60px] items-center justify-center rounded-[18px] bg-sand text-red shadow-[0_4px_4px_rgba(0,0,0,0.25)] [&_svg]:h-[28px] [&_svg]:w-[28px]">{icon}</span>
                  <span className="mt-[8px] w-[80px] text-center text-[12px] font-semibold leading-[18px] text-black">{l}</span>
                </button>
              ))}
            </div>
            <h2 className="m-0 mt-[30px] text-[14px] font-bold text-black">Pencarian populer</h2>
            <div className="mt-[12px] flex flex-wrap gap-[8px]">
              {POPULAR.map((p) => <button key={p} onClick={() => setQ(p)} className="h-[36px] rounded-full border border-black/15 bg-white px-[14px] text-[12px] font-bold text-[#777]">{p}</button>)}
            </div>
          </>
        ) : none ? (
          <Empty title="Tidak ada hasil" text={`Belum ada yang cocok dengan "${q}". Coba kata kunci lain.`} />
        ) : (
          <>
            {svc.length > 0 && <Group t="Layanan">{svc.map(([l, r]) => <Item key={l} title={l} sub="Lihat daftar layanan" onClick={() => go(r)} />)}</Group>}
            {arts.length > 0 && <Group t="Artikel">{arts.map((a) => <Item key={a.id} title={a.title} sub={`${a.topic}, ${a.read} menit baca`} onClick={() => go('baca:' + a.id)} />)}</Group>}
            {clin.length > 0 && <Group t="Klinik">{clin.map((c) => <Item key={c.id} title={c.name} sub={`${c.km}km, buka s/d ${c.hours} WIB`} onClick={() => go('klinik:' + c.id)} />)}</Group>}
            {docs.length > 0 && <Group t="Dokter dan trainer">{docs.map((p) => <Item key={p.id} title={p.name} sub={p.place} onClick={() => go('dokter:' + p.id)} />)}</Group>}
          </>
        )}
      </div>
    </Page>
  );
}

export { PawPrint, Photo };
