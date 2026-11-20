import { useState } from 'react';
import { Bell, ChevronRight, CreditCard, FileText, Globe, HelpCircle, Languages, Lock, LogOut, MapPin, Plus, Share2, Shield, Star, Trash2, Users } from 'lucide-react';
import { Btn, Card, Empty, Field, Page, Row, Sheet, Switch, cx } from '../ui';
import { useNav } from '../nav';
import { uid, useApp } from '../store';
import { PAYMENTS } from '../data';

const chev = <ChevronRight className="h-[18px] w-[18px] text-orange" />;
const ic = 'h-[20px] w-[20px]';

export function Pengaturan() {
  const { s, up, toast } = useApp();
  const { back, go, reset } = useNav();
  const [out, setOut] = useState(false);
  const [rate, setRate] = useState(false);
  const [stars, setStars] = useState(5);
  const [note, setNote] = useState('');
  const gate = (r: string) => () => { if (!s.loggedIn) { toast('Masuk dulu untuk membuka pengaturan ini'); go('login:back'); return; } go(r); };

  return (
    <Page title="Pengaturan" back={back}>
      <div className="px-[22px] pt-[14px]">
        <Row icon={<Shield className={ic} />} label="Keamanan Akun" onClick={gate('keamanan')} right={chev} />
        <Row icon={<Languages className={ic} />} label="Pengaturan Bahasa" sub="Bahasa Indonesia" onClick={() => go('bahasa')} right={chev} />
        <Row icon={<CreditCard className={ic} />} label="Metode Pembayaran" onClick={gate('metode')} right={chev} />
        <Row icon={<MapPin className={ic} />} label="Alamat Tersimpan" onClick={gate('alamat')} right={chev} />
        <Row icon={<Bell className={ic} />} label="Pengaturan Notifikasi" onClick={() => go('notifset')} right={chev} />
        <Row icon={<HelpCircle className={ic} />} label="Pusat Bantuan" onClick={() => go('cs')} right={chev} />
        <Row icon={<Lock className={ic} />} label="Kebijakan Privasi" onClick={() => go('kebijakan')} right={chev} />
        <Row icon={<FileText className={ic} />} label="Syarat dan Ketentuan" onClick={() => go('syarat')} right={chev} />
        <Row icon={<Users className={ic} />} label="Komunitas & Media Sosial" onClick={() => go('komunitas')} right={chev} />
        <Row icon={<Star className={ic} />} label="Beri Rating" onClick={() => setRate(true)} right={chev} />
        {s.loggedIn
          ? <Row icon={<LogOut className={ic} />} label="Keluar" danger onClick={() => setOut(true)} />
          : <Row icon={<LogOut className={ic} />} label="Masuk" onClick={() => go('login')} right={chev} />}
        <p className="m-0 pb-[8px] pt-[22px] text-center text-[12px] font-semibold text-[#a8a08c]">Petopia versi 1.0.0</p>
      </div>

      <Sheet open={out} onClose={() => setOut(false)} title="Keluar dari akun?">
        <p className="m-0 mb-[20px] text-[14px] font-medium leading-[22px] text-[#666]">Kamu perlu masuk lagi untuk membuat janji dan melihat reward.</p>
        <div className="flex gap-[12px]">
          <Btn variant="outline" onClick={() => setOut(false)}>Batal</Btn>
          <Btn variant="danger" onClick={() => { up({ loggedIn: false, draft: null }); setOut(false); reset('welcome'); }}>Keluar</Btn>
        </div>
      </Sheet>

      <Sheet open={rate} onClose={() => setRate(false)} title="Beri rating Petopia">
        <div className="mb-[16px] flex justify-center gap-[6px]" role="radiogroup" aria-label="Bintang">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n} bintang`} onClick={() => setStars(n)} className="flex h-[44px] w-[44px] items-center justify-center bg-transparent p-0">
              <Star className={cx('h-[34px] w-[34px]', n <= stars ? 'text-orange' : 'text-[#d6d0c0]')} fill="currentColor" strokeWidth={0} />
            </button>
          ))}
        </div>
        <Field value={note} onChange={setNote} multiline placeholder="Ceritakan pengalamanmu (opsional)" />
        <div className="mt-[18px]"><Btn onClick={() => { up({ rated: stars }); setRate(false); setNote(''); toast('Terima kasih atas ratingmu!'); }}>Kirim</Btn></div>
      </Sheet>
    </Page>
  );
}

export function Keamanan() {
  const { s, up, toast } = useApp();
  const { back } = useNav();
  const [f, setF] = useState({ old: '', pw: '', pw2: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (v: string) => setF((c) => ({ ...c, [k]: v }));
  const save = () => {
    const e: Record<string, string> = {};
    if (!f.old) e.old = 'Masukkan password saat ini';
    if (f.pw.length < 6) e.pw = 'Password baru minimal 6 karakter';
    else if (f.pw === f.old) e.pw = 'Password baru harus berbeda dari yang lama';
    if (f.pw2 !== f.pw) e.pw2 = 'Konfirmasi password tidak sama';
    setErr(e);
    if (Object.keys(e).length) return;
    setF({ old: '', pw: '', pw2: '' }); toast('Password berhasil diubah');
  };
  return (
    <Page title="Keamanan Akun" back={back}>
      <div className="space-y-[24px] px-[21px] pt-[26px]">
        <form className="space-y-[18px]" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
          <Field auth label="Password saat ini" value={f.old} onChange={set('old')} type="password" placeholder="Masukkan password saat ini" error={err.old} />
          <Field auth label="Password baru" value={f.pw} onChange={set('pw')} type="password" placeholder="Minimal 6 karakter" error={err.pw} />
          <Field auth label="Konfirmasi password baru" value={f.pw2} onChange={set('pw2')} type="password" placeholder="Ulangi password baru" error={err.pw2} />
          <Btn type="submit">Ubah Password</Btn>
        </form>
        <Card className="flex items-center gap-[14px]">
          <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold text-ink">Verifikasi dua langkah</span><span className="block text-[12px] font-semibold leading-[18px] text-[#8a8a8a]">Minta kode tambahan saat masuk di perangkat baru.</span></span>
          <Switch label="Verifikasi dua langkah" on={s.settings.twofa} onChange={(v) => { up((c) => ({ settings: { ...c.settings, twofa: v } })); toast(v ? 'Verifikasi dua langkah aktif' : 'Verifikasi dua langkah dimatikan'); }} />
        </Card>
        <Btn variant="outline" onClick={() => toast('Kamu keluar dari perangkat lain')}>Keluar dari semua perangkat</Btn>
      </div>
    </Page>
  );
}

export function Bahasa() {
  const { back } = useNav();
  const { toast } = useApp();
  return (
    <Page title="Pengaturan Bahasa" back={back}>
      <div className="px-[22px] pt-[14px]">
        <Row label="Bahasa Indonesia" right={<span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-orange"><span className="h-[10px] w-[10px] rounded-full bg-orange" /></span>} />
        <Row label="English" sub="Segera hadir" onClick={() => toast('Bahasa Inggris segera hadir')} right={<span className="h-[22px] w-[22px] rounded-full border-2 border-[#cfcfcf]" />} />
      </div>
    </Page>
  );
}

export function Metode() {
  const { s, up, toast } = useApp();
  const { back } = useNav();
  const [add, setAdd] = useState(false);
  const rest = PAYMENTS.filter((p) => !s.pays.includes(p.name));
  return (
    <Page title="Metode Pembayaran" back={back}
      footer={rest.length ? <Btn onClick={() => setAdd(true)}>Tambah Metode</Btn> : undefined}>
      {s.pays.length === 0 ? (
        <Empty title="Belum ada metode" text="Tambahkan metode pembayaran supaya checkout lebih cepat." />
      ) : (
        <ul className="m-0 list-none space-y-[12px] px-[22px] pt-[22px]">
          {s.pays.map((p) => (
            <li key={p}><Card className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-ink">{p}</span>
              <button aria-label={`Hapus ${p}`} onClick={() => { up((c) => ({ pays: c.pays.filter((x) => x !== p) })); toast('Metode dihapus'); }} className="flex h-[36px] w-[36px] items-center justify-center bg-transparent p-0 text-red"><Trash2 className="h-[18px] w-[18px]" /></button>
            </Card></li>
          ))}
        </ul>
      )}
      <Sheet open={add} onClose={() => setAdd(false)} title="Tambah metode">
        <ul className="m-0 list-none p-0">
          {rest.map((p) => (
            <li key={p.id}><button onClick={() => { up((c) => ({ pays: [...c.pays, p.name] })); setAdd(false); toast(`${p.name} ditambahkan`); }} className="flex min-h-[56px] w-full items-center justify-between border-b border-[#f0e9d6] bg-transparent p-0 text-left text-[14px] font-semibold text-ink">{p.name}<Plus className="h-[18px] w-[18px] text-orange" /></button></li>
          ))}
        </ul>
      </Sheet>
    </Page>
  );
}

export function Alamat() {
  const { s, up, toast } = useApp();
  const { back } = useNav();
  const [add, setAdd] = useState(false);
  const [f, setF] = useState({ label: '', text: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const save = () => {
    const e: Record<string, string> = {};
    if (!f.label.trim()) e.label = 'Beri nama alamat, contoh: Rumah';
    if (f.text.trim().length < 8) e.text = 'Tulis alamat lengkap';
    setErr(e);
    if (Object.keys(e).length) return;
    up((c) => ({ addresses: [...c.addresses, { id: uid('ad'), label: f.label.trim(), text: f.text.trim() }] }));
    setF({ label: '', text: '' }); setAdd(false); toast('Alamat disimpan');
  };
  return (
    <Page title="Alamat Tersimpan" back={back} footer={<Btn onClick={() => setAdd(true)}>Tambah Alamat</Btn>}>
      {s.addresses.length === 0 ? <Empty title="Belum ada alamat" text="Simpan alamat rumah atau kantor untuk mencari klinik terdekat." /> : (
        <ul className="m-0 list-none space-y-[12px] px-[22px] pt-[22px]">
          {s.addresses.map((a) => (
            <li key={a.id}><Card>
              <div className="flex items-start justify-between gap-[10px]">
                <div className="min-w-0"><div className="text-[14px] font-bold text-ink">{a.label}</div><div className="mt-[2px] text-[13px] font-medium leading-[19px] text-[#7a7a7a]">{a.text}</div></div>
                <button aria-label={`Hapus alamat ${a.label}`} onClick={() => { up((c) => ({ addresses: c.addresses.filter((x) => x.id !== a.id) })); toast('Alamat dihapus'); }} className="flex h-[36px] w-[36px] shrink-0 items-center justify-center bg-transparent p-0 text-red"><Trash2 className="h-[18px] w-[18px]" /></button>
              </div>
              <div className="mt-[12px]"><Btn small variant="outline" onClick={() => { up({ location: a.label }); toast(`Lokasi diatur ke ${a.label}`); }}>Pakai sebagai lokasi</Btn></div>
            </Card></li>
          ))}
        </ul>
      )}
      <Sheet open={add} onClose={() => setAdd(false)} title="Tambah alamat">
        <div className="space-y-[14px]">
          <Field label="Nama alamat" value={f.label} onChange={(v) => setF((c) => ({ ...c, label: v }))} placeholder="Rumah, Kantor, dll" error={err.label} />
          <Field label="Alamat lengkap" value={f.text} onChange={(v) => setF((c) => ({ ...c, text: v }))} multiline placeholder="Nama jalan, nomor, kelurahan" error={err.text} />
          <Btn onClick={save}>Simpan alamat</Btn>
        </div>
      </Sheet>
    </Page>
  );
}

export function NotifSet() {
  const { s, up } = useApp();
  const { back } = useNav();
  const items: { k: 'promo' | 'booking' | 'chat'; t: string; d: string }[] = [
    { k: 'booking', t: 'Pengingat janji temu', d: 'Pemberitahuan sebelum jadwal kunjunganmu.' },
    { k: 'chat', t: 'Pesan baru', d: 'Balasan dari dokter hewan dan customer service.' },
    { k: 'promo', t: 'Promo dan voucher', d: 'Info diskon dan reward terbaru.' },
  ];
  return (
    <Page title="Pengaturan Notifikasi" back={back}>
      <div className="space-y-[12px] px-[22px] pt-[22px]">
        {items.map((i) => (
          <Card key={i.k} className="flex items-center gap-[14px]">
            <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold text-ink">{i.t}</span><span className="block text-[12px] font-semibold leading-[18px] text-[#8a8a8a]">{i.d}</span></span>
            <Switch label={i.t} on={s.settings[i.k]} onChange={(v) => up((c) => ({ settings: { ...c.settings, [i.k]: v } }))} />
          </Card>
        ))}
      </div>
    </Page>
  );
}

const TEKS = {
  kebijakan: { title: 'Kebijakan Privasi', body: [
    ['Data yang kami kumpulkan', 'Petopia mengumpulkan data akun (nama, email, nomor telepon), data hewan peliharaan, riwayat booking, dan lokasi perkiraan untuk menampilkan klinik terdekat.'],
    ['Cara kami memakai data', 'Data dipakai untuk memproses janji temu, mengirim pengingat, memberikan reward, dan meningkatkan layanan. Kami tidak menjual data pribadimu.'],
    ['Berbagi dengan pihak lain', 'Data janji dibagikan kepada klinik atau dokter yang kamu pilih, hanya sebatas yang dibutuhkan untuk layanan tersebut.'],
    ['Hak kamu', 'Kamu dapat mengubah atau menghapus data akun kapan saja melalui menu Akun, atau menghubungi Pusat Bantuan.'],
  ] },
  syarat: { title: 'Syarat dan Ketentuan', body: [
    ['Penggunaan layanan', 'Petopia menghubungkan pemilik hewan dengan klinik, dokter, dan penyedia jasa hewan. Kamu bertanggung jawab atas keakuratan data yang diisi.'],
    ['Pembayaran dan pembatalan', 'Pembayaran dilakukan melalui metode yang tersedia. Pembatalan maksimal 2 jam sebelum jadwal mendapat pengembalian dana penuh.'],
    ['Voucher dan poin', 'Voucher dan poin tidak dapat diuangkan dan dapat berubah masa berlakunya sesuai ketentuan program.'],
    ['Layanan darurat', 'Petopia bukan layanan gawat darurat. Untuk kondisi darurat, segera bawa hewanmu ke klinik 24 jam terdekat.'],
  ] },
};
export function Teks({ kind }: { kind: 'kebijakan' | 'syarat' }) {
  const { back } = useNav();
  const t = TEKS[kind];
  return (
    <Page title={t.title} back={back}>
      <div className="space-y-[22px] px-[22px] pt-[24px]">
        {t.body.map(([h, p]) => (<section key={h}><h2 className="m-0 text-[15px] font-bold text-ink">{h}</h2><p className="m-0 mt-[6px] text-[13px] font-medium leading-[21px] text-[#6f6f6f]">{p}</p></section>))}
        <p className="m-0 text-[12px] font-semibold text-[#a8a08c]">Terakhir diperbarui 1 Oktober 2026</p>
      </div>
    </Page>
  );
}

export function Komunitas() {
  const { back } = useNav();
  const { toast } = useApp();
  const links: [string, string, string][] = [['Instagram', 'Tips perawatan dan promo terbaru', 'https://www.instagram.com/'], ['TikTok', 'Video singkat seputar hewan peliharaan', 'https://www.tiktok.com/'], ['YouTube', 'Panduan lengkap dari dokter hewan', 'https://www.youtube.com/']];
  const share = async () => {
    const data = { title: 'Petopia', text: 'Coba Petopia, aplikasi perawatan hewan peliharaan.', url: location.origin };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.origin); toast('Tautan aplikasi disalin'); }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') toast('Tidak bisa membagikan dari perangkat ini. Salin tautan dari bilah alamat.');
    }
  };
  return (
    <Page title="Komunitas & Media Sosial" back={back}>
      <div className="px-[22px] pt-[14px]">
        {links.map(([n, d, u]) => (
          <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="block no-underline">
            <Row icon={<Globe className={ic} />} label={n} sub={d} right={chev} />
          </a>
        ))}
        <Row icon={<Share2 className={ic} />} label="Bagikan Petopia" sub="Ajak temanmu yang punya hewan peliharaan" onClick={share} right={chev} />
      </div>
    </Page>
  );
}
