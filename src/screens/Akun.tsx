import { useState } from 'react';
import { Bookmark, CalendarDays, ChevronRight, HelpCircle, PawPrint, Plus, Settings, Ticket, Trash2 } from 'lucide-react';
import { Btn, Card, Empty, Field, IconBtn, Page, Photo, Row, SelectField, Sheet } from '../ui';
import { useNav } from '../nav';
import { effStatus, uid, useApp } from '../store';
import { ADOPTS, ARTICLES, CLINICS, DOCTORS, GROOMING, PENITIPAN, TRAINERS, VAKSINASI } from '../data';

const JENIS = ['Anjing', 'Kucing', 'Burung', 'Kelinci', 'Hamster', 'Reptil', 'Lainnya'] as const;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export default function Akun() {
  const { s } = useApp();
  const { go } = useNav();
  const gear = <IconBtn label="Pengaturan" onClick={() => go('pengaturan')}><Settings className="h-[22px] w-[22px]" /></IconBtn>;

  if (!s.loggedIn) {
    return (
      <Page title="Akun" tab right={gear}>
        <div className="px-[22px] pt-[30px]">
          <Card className="text-center !p-[26px]">
            <span className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-sand text-orange"><PawPrint className="h-[38px] w-[38px]" /></span>
            <h2 className="m-0 mt-[18px] text-[17px] font-bold text-ink">Masuk ke akun Petopia</h2>
            <p className="m-0 mt-[8px] text-[13px] font-medium leading-[20px] text-[#8a8a8a]">Simpan data hewanmu, atur janji temu, dan kumpulkan poin reward.</p>
            <div className="mt-[22px] space-y-[12px]"><Btn onClick={() => go('login')}>Masuk</Btn><Btn variant="outline" onClick={() => go('register')}>Buat Akun</Btn></div>
          </Card>
          <div className="mt-[18px]">
            <Row icon={<HelpCircle className="h-[20px] w-[20px]" />} label="Pusat Bantuan" onClick={() => go('cs')} right={<ChevronRight className="h-[18px] w-[18px] text-orange" />} />
            <Row icon={<Settings className="h-[20px] w-[20px]" />} label="Pengaturan" onClick={() => go('pengaturan')} right={<ChevronRight className="h-[18px] w-[18px] text-orange" />} />
          </div>
        </div>
      </Page>
    );
  }

  const ini = s.profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <Page title="Akun" tab right={gear}>
      <div className="space-y-[26px] px-[22px] pt-[24px]">
        <Card className="!p-[18px]">
          <div className="flex items-center gap-[14px]">
            <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-orange text-[20px] font-bold text-white">{ini}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[17px] font-bold leading-[22px] text-ink">{s.profile.name}</div>
              <div className="truncate text-[12px] font-semibold text-[#8a8a8a]">{s.profile.email || (s.profile.username ? '@' + s.profile.username : 'Lengkapi emailmu')}</div>
            </div>
          </div>
          <div className="mt-[16px]"><Btn small variant="outline" onClick={() => go('profil')}>Ubah Profil</Btn></div>
        </Card>

        <section>
          <div className="mb-[12px] flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-bold text-ink">Hewan Saya</h2>
            <button onClick={() => go('hewan:baru')} aria-label="Tambah hewan" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-orange p-0 text-white"><Plus className="h-[20px] w-[20px]" strokeWidth={2.6} /></button>
          </div>
          {s.pets.length === 0 ? (
            <Card><p className="m-0 text-[13px] font-semibold leading-[20px] text-[#8a8a8a]">Belum ada hewan. Tambahkan supaya bisa dipilih saat booking.</p><div className="mt-[14px]"><Btn small onClick={() => go('hewan:baru')}>Tambah hewan</Btn></div></Card>
          ) : (
            <ul className="m-0 grid list-none grid-cols-2 gap-[14px] p-0">
              {s.pets.map((p) => (
                <li key={p.id}>
                  <button onClick={() => go('hewan:' + p.id)} className="block w-full overflow-hidden rounded-[16px] bg-white p-0 text-left shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
                    <Photo src={p.photo} className="h-[112px] w-full" />
                    <span className="block px-[14px] pb-[14px] pt-[10px]">
                      <span className="block truncate text-[15px] font-bold leading-[20px] text-ink">{p.name}</span>
                      <span className="block truncate text-[12px] font-semibold text-[#8a8a8a]">{p.breed}, {p.age}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <Row icon={<CalendarDays className="h-[20px] w-[20px]" />} label="Janji Saya" sub={`${s.bookings.filter((b) => effStatus(b) === 'Terjadwal').length} janji aktif`} onClick={() => go('booking')} right={<ChevronRight className="h-[18px] w-[18px] text-orange" />} />
          <Row icon={<Ticket className="h-[20px] w-[20px]" />} label="Voucher Saya" sub={`${s.vouchers.length} voucher`} onClick={() => go('voucherku')} right={<ChevronRight className="h-[18px] w-[18px] text-orange" />} />
          <Row icon={<Bookmark className="h-[20px] w-[20px]" />} label="Tersimpan" sub={`${s.saved.length} item`} onClick={() => go('tersimpan')} right={<ChevronRight className="h-[18px] w-[18px] text-orange" />} />
          <Row icon={<HelpCircle className="h-[20px] w-[20px]" />} label="Pusat Bantuan" onClick={() => go('cs')} right={<ChevronRight className="h-[18px] w-[18px] text-orange" />} />
        </section>
      </div>
    </Page>
  );
}

export function Profil() {
  const { s, up, toast } = useApp();
  const { back } = useNav();
  const [f, setF] = useState({ name: s.profile.name, username: s.profile.username ?? '', email: s.profile.email, phone: s.profile.phone });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (v: string) => setF((c) => ({ ...c, [k]: v }));
  const save = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'Nama wajib diisi';
    if (f.email && !emailOk(f.email)) e.email = 'Format email belum benar';
    if (f.phone && !/^[0-9+\s-]{8,16}$/.test(f.phone)) e.phone = 'Nomor telepon belum benar';
    setErr(e);
    if (Object.keys(e).length) return;
    up({ profile: { name: f.name.trim(), username: f.username.trim(), email: f.email.trim(), phone: f.phone.trim() } });
    toast('Profil disimpan'); back();
  };
  return (
    <Page title="Ubah Profil" back={back}>
      <form className="space-y-[18px] px-[21px] pt-[26px]" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        <Field auth label="Nama Lengkap" value={f.name} onChange={set('name')} placeholder="Nama lengkap" error={err.name} />
        <Field auth label="Username" value={f.username} onChange={set('username')} placeholder="Username" />
        <Field auth label="Email" value={f.email} onChange={set('email')} type="email" inputMode="email" placeholder="nama@email.com" error={err.email} />
        <Field auth label="Nomor Telepon" value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="08xxxxxxxxxx" error={err.phone} />
        <div className="pt-[10px]"><Btn type="submit">Simpan</Btn></div>
      </form>
    </Page>
  );
}

export function HewanForm({ id }: { id: string }) {
  const { s, up, toast } = useApp();
  const { back } = useNav();
  const cur = s.pets.find((p) => p.id === id);
  const [f, setF] = useState({ type: cur?.type ?? '', sex: cur?.sex ?? '', name: cur?.name ?? '', breed: cur?.breed ?? '', age: (cur?.age ?? '').replace(' tahun', '').replace('-', ''), weight: (cur?.weight ?? '').replace(' kg', '') });
  const [err, setErr] = useState<Record<string, string>>({});
  const [del, setDel] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((c) => ({ ...c, [k]: v }));

  const save = () => {
    const e: Record<string, string> = {};
    if (!f.type) e.type = 'Pilih jenis hewan';
    if (!f.name.trim()) e.name = 'Nama hewan wajib diisi';
    if (f.age && !/^\d+([.,]\d+)?$/.test(f.age.trim())) e.age = 'Isi dengan angka';
    if (f.weight && !/^\d+([.,]\d+)?$/.test(f.weight.trim())) e.weight = 'Isi dengan angka';
    setErr(e);
    if (Object.keys(e).length) return;
    const pet = { id: cur?.id ?? uid('p'), photo: cur?.photo, name: f.name.trim(), type: f.type, sex: f.sex || undefined, breed: f.breed.trim() || f.type, age: f.age ? `${f.age} tahun` : '-', weight: f.weight ? `${f.weight} kg` : undefined };
    up((c) => ({ pets: cur ? c.pets.map((p) => (p.id === cur.id ? pet : p)) : [...c.pets, pet] }));
    toast(cur ? 'Data hewan diperbarui' : `${pet.name} berhasil ditambahkan`); back();
  };
  const remove = () => { up((c) => ({ pets: c.pets.filter((p) => p.id !== id) })); setDel(false); toast('Hewan dihapus'); back(); };

  return (
    <Page title={cur ? 'Data Hewan' : 'Tambah Hewan'} back={back} right={cur ? <IconBtn label="Hapus hewan" onClick={() => setDel(true)}><Trash2 className="h-[20px] w-[20px]" /></IconBtn> : undefined}>
      <form className="space-y-[18px] px-[21px] pt-[26px]" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        <SelectField label="Pilih Jenis Hewan" value={f.type} onChange={set('type')} options={JENIS} placeholder="Jenis Hewan" error={err.type} />
        <SelectField label="Jenis Kelamin Hewan" value={f.sex} onChange={set('sex')} options={['Jantan', 'Betina']} placeholder="Pilih jenis kelamin" />
        <Field auth label="Nama Hewan" value={f.name} onChange={set('name')} placeholder="Masukkan Nama Hewan" error={err.name} />
        <Field auth label="Ras Hewan" value={f.breed} onChange={set('breed')} placeholder="Contoh: Poodle, Domestik" />
        <Field auth label="Umur" value={f.age} onChange={set('age')} placeholder="Masukkan Umur" inputMode="decimal" suffix="(tahun)" error={err.age} />
        <Field auth label="Berat Hewan" value={f.weight} onChange={set('weight')} placeholder="Masukkan Berat Hewan" inputMode="decimal" suffix="(kg)" error={err.weight} />
        <div className="pt-[10px]"><Btn type="submit">{cur ? 'Simpan Perubahan' : 'Simpan Profil'}</Btn></div>
      </form>
      <Sheet open={del} onClose={() => setDel(false)} title="Hapus hewan?">
        <p className="m-0 mb-[20px] text-[14px] font-medium leading-[22px] text-[#666]">{f.name} akan dihapus dari daftar hewanmu. Janji yang sudah dibuat tidak ikut terhapus.</p>
        <div className="flex gap-[12px]"><Btn variant="outline" onClick={() => setDel(false)}>Batal</Btn><Btn variant="danger" onClick={remove}>Hapus</Btn></div>
      </Sheet>
    </Page>
  );
}

export function VoucherKu() {
  const { s } = useApp();
  const { back, go } = useNav();
  return (
    <Page title="Voucher Saya" back={back}>
      {s.vouchers.length === 0 ? (
        <Empty title="Belum ada voucher" text="Tukar poin di tab Reward untuk mendapatkan voucher." action={<Btn onClick={() => go('reward')}>Ke Reward</Btn>} />
      ) : (
        <ul className="m-0 list-none space-y-[12px] px-[22px] pt-[22px]">
          {s.vouchers.map((v) => (
            <li key={v.id}>
              <Card onClick={() => go('voucher:' + v.id)}>
                <span className="block text-[14px] font-bold leading-[19px] text-ink">{v.title}</span>
                <span className="block text-[12px] font-semibold text-[#8a8a8a]">{v.source}, berlaku hingga {v.expire}</span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

export function Tersimpan() {
  const { s } = useApp();
  const { back, go } = useNav();
  const all = [...CLINICS, ...GROOMING, ...VAKSINASI, ...PENITIPAN];
  const items = s.saved.map((k) => {
    const [t, id] = k.split(':');
    if (t === 'klinik') { const c = all.find((x) => x.id === id); return c ? { k, title: c.name, sub: 'Klinik', route: k } : null; }
    if (t === 'dokter') { const p = [...DOCTORS, ...TRAINERS].find((x) => x.id === id); return p ? { k, title: p.name, sub: TRAINERS.some((x) => x.id === id) ? 'Trainer' : 'Dokter hewan', route: k } : null; }
    if (t === 'artikel') { const a = ARTICLES.find((x) => x.id === id); return a ? { k, title: a.title, sub: 'Artikel', route: 'baca:' + id } : null; }
    if (t === 'adopt') { const a = ADOPTS.find((x) => x.id === id); return a ? { k, title: `${a.name}, ${a.breed}`, sub: 'Adopt Me', route: 'adopsi:' + id } : null; }
    return null;
  }).filter(Boolean) as { k: string; title: string; sub: string; route: string }[];
  return (
    <Page title="Tersimpan" back={back}>
      {items.length === 0 ? (
        <Empty title="Belum ada yang disimpan" text="Tekan ikon bookmark di klinik, dokter, atau artikel untuk menyimpannya di sini." />
      ) : (
        <ul className="m-0 list-none space-y-[12px] px-[22px] pt-[22px]">
          {items.map((i) => (
            <li key={i.k}><Card onClick={() => go(i.route)}><span className="block text-[11px] font-bold text-orange">{i.sub}</span><span className="block text-[14px] font-bold leading-[19px] text-ink">{i.title}</span></Card></li>
          ))}
        </ul>
      )}
    </Page>
  );
}
