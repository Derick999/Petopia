import { useState } from 'react';
import { Bookmark, Clock, Search, Share2 } from 'lucide-react';
import { Chip, Empty, IconBtn, Page, Photo, cx, DragRow } from '../ui';
import { useNav } from '../nav';
import { useApp } from '../store';
import { ARTICLES, ARTICLE_TOPICS } from '../data';

const CHIPS = ['Semua', 'Tersimpan', ...ARTICLE_TOPICS];

function useSave(id: string) {
  const { s, up, toast } = useApp();
  const key = 'artikel:' + id;
  const saved = s.saved.includes(key);
  const toggle = () => { up((c) => ({ saved: c.saved.includes(key) ? c.saved.filter((x) => x !== key) : [...c.saved, key] })); toast(saved ? 'Dihapus dari tersimpan' : 'Artikel disimpan'); };
  return { saved, toggle };
}

function Row({ id }: { id: string }) {
  const a = ARTICLES.find((x) => x.id === id)!;
  const { go } = useNav();
  const { saved, toggle } = useSave(id);
  return (
    <li className="relative">
      <button onClick={() => go('baca:' + a.id)} className="flex w-full gap-[14px] rounded-[16px] bg-white p-[12px] text-left shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
        <Photo src={a.photo} className="h-[96px] w-[96px] shrink-0 rounded-[12px]" />
        <span className="min-w-0 flex-1 pr-[34px]">
          <span className="block text-[11px] font-bold text-orange">{a.topic}</span>
          <span className="mt-[2px] line-clamp-3 block text-[14px] font-bold leading-[19px] text-ink">{a.title}</span>
          <span className="mt-[6px] flex items-center gap-[5px] text-[11px] font-semibold text-[#8a8a8a]"><Clock className="h-[11px] w-[11px]" />{a.read} menit baca</span>
        </span>
      </button>
      <button onClick={toggle} aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan artikel'} aria-pressed={saved} className="absolute bottom-[8px] right-[8px] flex h-[40px] w-[40px] items-center justify-center bg-transparent p-0 text-orange">
        <Bookmark className="h-[20px] w-[20px]" fill={saved ? 'currentColor' : 'none'} />
      </button>
    </li>
  );
}

function Feature({ id }: { id: string }) {
  const a = ARTICLES.find((x) => x.id === id)!;
  const { go } = useNav();
  return (
    <button onClick={() => go('baca:' + a.id)} className="w-[236px] shrink-0 overflow-hidden rounded-[16px] bg-white p-0 text-left shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
      <Photo src={a.photo} className="h-[118px] w-full" />
      <span className="block px-[12px] pb-[14px] pt-[10px]">
        <span className="block text-[11px] font-bold text-orange">{a.topic}</span>
        <span className="mt-[2px] line-clamp-2 block text-[14px] font-bold leading-[19px] text-ink">{a.title}</span>
        <span className="mt-[6px] flex items-center gap-[5px] text-[11px] font-semibold text-[#8a8a8a]"><Clock className="h-[11px] w-[11px]" />{a.read} menit baca</span>
      </span>
    </button>
  );
}

export default function Artikel() {
  const { s } = useApp();
  const [q, setQ] = useState('');
  const [c, setC] = useState('Semua');
  const key = q.trim().toLowerCase();
  const list = ARTICLES.filter((a) => {
    if (c === 'Tersimpan') return s.saved.includes('artikel:' + a.id);
    if (c !== 'Semua' && a.topic !== c) return false;
    return !key || (a.title + a.topic + a.author).toLowerCase().includes(key);
  }).filter((a) => !key || (a.title + a.topic + a.author).toLowerCase().includes(key));

  return (
    <Page title="Artikel" tab>
      <div className="px-[22px] pt-[22px]">
        <div className="flex h-[46px] items-center gap-[12px] rounded-[16px] bg-white px-[16px] shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
          <Search className="h-[18px] w-[18px] shrink-0 text-[#8b8b8b]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari artikel" aria-label="Cari artikel" className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-black outline-none placeholder:font-medium placeholder:text-[#b0b0b0]" />
        </div>
      </div>
      <DragRow className="hide-scrollbar flex gap-[8px] overflow-x-auto px-[22px] pb-[5px] pt-[16px]">
        {CHIPS.map((x) => <Chip key={x} label={x} active={c === x} onClick={() => setC(x)} />)}
      </DragRow>
      {c === 'Semua' && !key && (
        <>
          <h2 className="m-0 px-[22px] pt-[22px] text-[15px] font-bold text-ink">Pilihan untuk kamu</h2>
          <DragRow className="hide-scrollbar h-scroll mt-[12px] flex gap-[14px] overflow-x-auto px-[22px] pb-[8px]" style={{ scrollPaddingInline: 22 }} arrows label="pilihan artikel">
            {ARTICLES.slice(0, 5).map((a) => <Feature key={a.id} id={a.id} />)}
          </DragRow>
          <h2 className="m-0 px-[22px] pt-[14px] text-[15px] font-bold text-ink">Semua artikel</h2>
        </>
      )}
      {list.length === 0 ? (
        <Empty title={c === 'Tersimpan' ? 'Belum ada artikel tersimpan' : 'Artikel tidak ditemukan'} text={c === 'Tersimpan' ? 'Tekan ikon bookmark pada artikel untuk menyimpannya.' : 'Coba kata kunci atau kategori lain.'} />
      ) : (
        <ul className="m-0 list-none space-y-[16px] px-[22px] pt-[18px]">{list.map((a) => <Row key={a.id} id={a.id} />)}</ul>
      )}
    </Page>
  );
}

export function Baca({ id }: { id: string }) {
  const { back, go } = useNav();
  const { toast } = useApp();
  const a = ARTICLES.find((x) => x.id === id);
  const { saved, toggle } = useSave(id);
  if (!a) return <Page title="Artikel" back={back}><Empty title="Artikel tidak ditemukan" text="Artikel ini mungkin sudah dihapus." /></Page>;
  const others = ARTICLES.filter((x) => x.id !== id).slice(0, 5);

  const share = async () => {
    const url = location.origin;
    try {
      if (navigator.share) await navigator.share({ title: a.title, text: a.title, url });
      else { await navigator.clipboard.writeText(`${a.title} ${url}`); toast('Tautan artikel disalin'); }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') toast('Tidak bisa membagikan dari perangkat ini. Salin tautan dari bilah alamat.');
    }
  };

  return (
    <Page title="Artikel" back={back}
      right={<><IconBtn label="Bagikan" onClick={share}><Share2 className="h-[20px] w-[20px]" /></IconBtn><IconBtn label={saved ? 'Hapus dari tersimpan' : 'Simpan'} onClick={toggle}><Bookmark className="h-[20px] w-[20px]" fill={saved ? 'currentColor' : 'none'} /></IconBtn></>}>
      <Photo src={a.photo} className="h-[200px] w-full" />
      <div className="px-[22px] pt-[20px]">
        <span className="inline-block rounded-full bg-sand px-[12px] py-[4px] text-[12px] font-bold text-brown">{a.topic}</span>
        <h1 className="m-0 mt-[12px] text-[21px] font-bold leading-[28px] text-ink">{a.title}</h1>
        <p className="m-0 mt-[10px] text-[12px] font-semibold text-[#8a8a8a]">{a.author}, {a.date}, {a.read} menit baca</p>
        <div className="mt-[20px] space-y-[16px] text-[14px] font-medium leading-[23px] text-[#555]">{a.body.map((p) => <p key={p} className="m-0">{p}</p>)}</div>
        <div className="my-[28px] h-px bg-[#e4dccb]" />
        <h2 className="m-0 text-[16px] font-bold text-ink">Artikel lainnya</h2>
        <DragRow className="hide-scrollbar h-scroll -mx-[22px] mt-[14px] flex gap-[14px] overflow-x-auto px-[22px] pb-[14px]" style={{ scrollPaddingInline: 22 }} arrows label="artikel lainnya">
          {others.map((o) => <Feature key={o.id} id={o.id} />)}
        </DragRow>
      </div>
    </Page>
  );
}
