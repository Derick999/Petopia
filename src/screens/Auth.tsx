import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Lock, Ticket, User } from 'lucide-react';
import { Btn, Field, Modal, Page, Photo, SelectField, Wordmark, cx } from '../ui';
import { useNav } from '../nav';
import { useDragScroll } from '../hooks';
import { blankUser, uid, useApp } from '../store';
import { PROMO_CODES } from '../data';

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/* ---------- Splash + Onboarding (frame 153:2372) ---------- */
const SLIDES = [
  { img: 'onb1.png', title: 'Selamat datang di Petopia!', text: 'Tempat semua kebutuhan perawatan hewan peliharaanmu. Dari grooming, kunjungan ke dokter hewan, penitipan, dan masih banyak lagi.' },
  { img: 'onb2.png', title: 'Konsultasi hewan peliharaan terpercaya', text: 'Konsultasikan hewan peliharaan kamu dengan dokter hewan. Mudah diakses dan privasi terjamin di Petopia.' },
  { img: 'onb3.png', title: 'Solusi lengkap hewan peliharaan', text: 'Semua kebutuhan hewan peliharaan, dari grooming, vaksinasi, hingga klinik, bisa kamu booking dengan mudah dan aman di Petopia.' },
];

export function Onboarding() {
  const { up } = useApp();
  const { reset } = useNav();
  const [splash, setSplash] = useState(true);
  const [i, setI] = useState(0);
  const ref = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    if (!splash) return;
    const t = window.setTimeout(() => setSplash(false), 1800);
    return () => window.clearTimeout(t);
  }, [splash]);

  const start = () => { up({ onboarded: true }); reset('welcome'); };
  const goTo = (n: number) => { const el = ref.current; if (el) el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' }); setI(n); };

  if (splash) {
    return (
      <button onClick={() => setSplash(false)} aria-label="Lanjut" className="flex h-full w-full flex-col items-center justify-center gap-[14px] bg-white p-0">
        <Wordmark size={52} />
        <p className="m-0 text-center text-[17px] font-bold leading-[22px] text-[#fdb515]">Lebih dari layanan,<br />Sebuah pengalaman.</p>
      </button>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white pb-[34px] pt-[64px]">
      <div className="flex shrink-0 justify-center"><Wordmark size={34} /></div>
      <div
        ref={ref}
        onScroll={(e) => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)); }}
        className="hide-scrollbar mt-[20px] flex flex-1 snap-x snap-mandatory overflow-x-auto"
      >
        {SLIDES.map((sl) => (
          <section key={sl.title} className="flex w-full shrink-0 snap-center flex-col items-center px-[28px]" aria-label={sl.title}>
            <Photo src={sl.img} className="h-[228px] w-full rounded-[26px] border-[1.5px] border-[#fdd13d]" />
            <h2 className="m-0 mt-[34px] max-w-[280px] text-center text-[21px] font-bold leading-[27px] text-black">{sl.title}</h2>
            <p className="m-0 mt-[16px] max-w-[310px] text-center text-[13px] font-medium leading-[20px] text-[#555]">{sl.text}</p>
          </section>
        ))}
      </div>
      <div className="flex shrink-0 justify-center gap-[7px] pb-[22px] pt-[10px]" role="tablist" aria-label="Slide">
        {SLIDES.map((sl, n) => (
          <button key={sl.title} role="tab" aria-selected={i === n} aria-label={`Slide ${n + 1}`} onClick={() => goTo(n)} className="flex h-[18px] w-[18px] items-center justify-center bg-transparent p-0">
            <span className={cx('block h-[7px] w-[7px] rounded-full transition-colors', i === n ? 'bg-[#fdb515]' : 'bg-[#d9d9d9]')} />
          </button>
        ))}
      </div>
      <div className="shrink-0 px-[21px]"><Btn onClick={start} className="!border-[#fdb515] !bg-[#fdb515] !text-white">Mulai Sekarang</Btn></div>
    </div>
  );
}

/* ---------- Layar awal Masuk / Buat Akun (208:661) ---------- */
export function Welcome() {
  const { go, reset } = useNav();
  return (
    <div className="flex h-full flex-col items-center bg-cream px-[21px] pb-[44px] pt-[110px]">
      <Wordmark size={44} />
      <Photo
        src="welcome.png"
        className="mt-[38px] h-[235px] w-full rounded-[26px]"
        fallback={<div className="flex h-full w-full items-center justify-center bg-[#ffd648] text-[64px]" aria-hidden="true">🐰🐶🐱</div>}
      />
      <p className="m-0 mt-[36px] text-center text-[22px] font-bold leading-[28px] text-[#fdb515]">Lebih dari layanan,<br />Sebuah pengalaman.</p>
      <div className="mt-auto w-full space-y-[18px]">
        <Btn onClick={() => go('login')} className="!border-[#fdb515] !bg-[#fdb515]">Masuk</Btn>
        <Btn onClick={() => go('register')} variant="outline" className="!border-[#fdb515] !text-[#fdb515]">Buat Akun</Btn>
        <button onClick={() => reset('home')} className="mx-auto block h-[36px] bg-transparent text-[13px] font-semibold text-[#9b8a62] underline underline-offset-4">Lihat dulu tanpa masuk</button>
      </div>
    </div>
  );
}

const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
  <button type="button" onClick={onToggle} aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'} className="flex h-[40px] w-[40px] items-center justify-center bg-transparent p-0 text-[#8c8c8c]">
    {show ? <EyeOff className="h-[22px] w-[22px]" /> : <Eye className="h-[22px] w-[22px]" />}
  </button>
);

/* ---------- Masuk (213:736) ---------- */
export function Login({ returnBack }: { returnBack: boolean }) {
  const { s, up, toast } = useApp();
  const { back, go, reset } = useNav();
  const [email, setEmail] = useState(s.profile.email);
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<{ email?: string; pw?: string }>({});

  const submit = () => {
    const e: typeof err = {};
    if (!email.trim()) e.email = 'Alamat email wajib diisi';
    else if (!emailOk(email)) e.email = 'Format email belum benar, contoh: nama@email.com';
    if (!pw) e.pw = 'Password wajib diisi';
    else if (pw.length < 6) e.pw = 'Password minimal 6 karakter';
    setErr(e);
    if (e.email || e.pw) return;
    up((c) => ({ loggedIn: true, onboarded: true, profile: { ...c.profile, email: email.trim() } }));
    toast('Berhasil masuk. Selamat datang kembali!');
    if (returnBack) back(); else reset('home');
  };

  return (
    <Page title="Masuk" back={back}>
      <form className="px-[21px] pt-[34px]" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        <Field auth label="Alamat Email" value={email} onChange={setEmail} type="email" inputMode="email" placeholder="Masukkan Alamat Email" error={err.email} autoFocus />
        <div className="mt-[22px]">
          <Field auth label="Password" value={pw} onChange={setPw} type={show ? 'text' : 'password'} placeholder="Masukkan Password" error={err.pw}
            right={<EyeToggle show={show} onToggle={() => setShow((v) => !v)} />} />
        </div>
        <button type="button" onClick={() => go('lupa')} className="ml-auto mt-[10px] block h-[32px] bg-transparent p-0 text-[12px] font-semibold text-[#8d8d8d]">Lupa Password?</button>
        <div className="mt-[18px]"><Btn type="submit">Masuk</Btn></div>
        <p className="m-0 mt-[28px] text-center text-[13px] font-medium text-[#8d8d8d]">
          Belum punya akun?{' '}
          <button type="button" onClick={() => go('register')} className="h-[28px] bg-transparent p-0 text-[13px] font-bold text-orange">Buat Akun</button>
        </p>
      </form>
    </Page>
  );
}

export function Lupa() {
  const { back } = useNav();
  const { toast } = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const submit = () => {
    if (!emailOk(email)) { setErr('Masukkan alamat email yang valid'); return; }
    setErr(''); setSent(true); toast('Tautan reset password dikirim');
  };
  return (
    <Page title="Lupa Password" back={back}>
      <div className="px-[21px] pt-[34px]">
        {sent ? (
          <div className="pt-[40px] text-center">
            <span className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-orange text-white"><Check className="h-[38px] w-[38px]" strokeWidth={3} /></span>
            <h2 className="m-0 mt-[22px] text-[17px] font-bold text-orange">Cek emailmu</h2>
            <p className="m-0 mt-[8px] text-[13px] font-medium leading-[20px] text-[#777]">Kami mengirim tautan untuk membuat password baru ke {email}.</p>
            <div className="mt-[28px]"><Btn onClick={back}>Kembali ke Masuk</Btn></div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
            <p className="m-0 mb-[22px] text-[13px] font-medium leading-[20px] text-[#777]">Masukkan email yang kamu pakai saat mendaftar. Kami akan mengirim tautan untuk membuat password baru.</p>
            <Field auth label="Alamat Email" value={email} onChange={setEmail} type="email" inputMode="email" placeholder="Masukkan Alamat Email" error={err} autoFocus />
            <div className="mt-[24px]"><Btn type="submit">Kirim Tautan</Btn></div>
          </form>
        )}
      </div>
    </Page>
  );
}

/* ---------- Buat Akun (231:1422) + popup sukses (283:810) ---------- */
export function Register() {
  const { up, toast } = useApp();
  const { back, go, reset } = useNav();
  const [f, setF] = useState({ name: '', user: '', email: '', pw: '', pw2: '', ref: '' });
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((c) => ({ ...c, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'Nama lengkap wajib diisi';
    if (!/^[a-z0-9_.]{3,}$/i.test(f.user.trim())) e.user = 'Username minimal 3 karakter (huruf, angka, _ atau .)';
    if (!emailOk(f.email)) e.email = 'Format email belum benar';
    if (f.pw.length < 6) e.pw = 'Password minimal 6 karakter';
    if (f.pw2 !== f.pw || !f.pw2) e.pw2 = 'Konfirmasi password tidak sama';
    const code = f.ref.trim().toUpperCase();
    if (code && !PROMO_CODES[code]) e.ref = 'Kode referral tidak ditemukan';
    setErr(e);
    if (Object.keys(e).length) return;
    const bonus = code ? PROMO_CODES[code].points : 0;
    up({
      ...blankUser(), loggedIn: true, onboarded: true,
      profile: { name: f.name.trim(), username: f.user.trim(), email: f.email.trim(), phone: '' },
      points: bonus, xp: bonus,
      log: bonus ? [{ id: uid('g'), label: `Kode referral ${code}`, pts: bonus, date: new Date().toISOString().slice(0, 10) }] : [],
      usedCodes: code ? [code] : [],
    });
    setDone(true);
  };

  const google = () => {
    up({ ...blankUser(), loggedIn: true, onboarded: true, profile: { name: 'Pengguna Google', username: 'penggunagoogle', email: 'pengguna@gmail.com', phone: '' } });
    toast('Masuk dengan Google berhasil (demo)');
    go('regpet');
  };

  return (
    <Page title="Buat Akun" back={back}>
      <form className="space-y-[18px] px-[21px] pb-[10px] pt-[30px]" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        <Field auth label="Nama Lengkap" value={f.name} onChange={set('name')} placeholder="Masukkan Nama Lengkap" error={err.name} icon={<User className="h-[22px] w-[22px]" fill="currentColor" />} autoFocus />
        <Field auth label="Username" value={f.user} onChange={set('user')} placeholder="Masukkan Username" error={err.user} icon={<User className="h-[22px] w-[22px]" fill="currentColor" />} />
        <Field auth label="Email" value={f.email} onChange={set('email')} type="email" inputMode="email" placeholder="Masukkan Email" error={err.email} icon={<MailIcon />} />
        <Field auth label="Password" value={f.pw} onChange={set('pw')} type={s1 ? 'text' : 'password'} placeholder="Masukkan Password" error={err.pw} icon={<Lock className="h-[21px] w-[21px]" fill="currentColor" />} right={<EyeToggle show={s1} onToggle={() => setS1((v) => !v)} />} />
        <Field auth label="Konfirmasi Password" value={f.pw2} onChange={set('pw2')} type={s2 ? 'text' : 'password'} placeholder="Konfirmasi Password" error={err.pw2} icon={<Lock className="h-[21px] w-[21px]" fill="currentColor" />} right={<EyeToggle show={s2} onToggle={() => setS2((v) => !v)} />} />
        <Field auth label="Kode Referral" value={f.ref} onChange={set('ref')} placeholder="Masukkan Kode Referral" error={err.ref} icon={<Ticket className="h-[22px] w-[22px]" fill="currentColor" stroke="white" />} />
        <div className="pt-[8px]"><Btn type="submit">Buat Akun</Btn></div>
        <p className="m-0 text-center text-[13px] font-bold text-orange">atau</p>
        <button type="button" onClick={google} className="flex h-[46px] w-full items-center justify-center gap-[14px] rounded-[16px] border border-orange bg-transparent p-0 text-[14px] font-bold text-orange">
          <GoogleG /> Lanjutkan dengan Google
        </button>
        <p className="m-0 pb-[6px] pt-[6px] text-center text-[13px] font-medium text-[#8d8d8d]">
          Sudah punya akun?{' '}
          <button type="button" onClick={() => go('login')} className="h-[28px] bg-transparent p-0 text-[13px] font-bold text-orange">Masuk</button>
        </p>
      </form>

      <Modal open={done}>
        <span className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-orange text-white"><Check className="h-[40px] w-[40px]" strokeWidth={3} /></span>
        <h2 className="m-0 mt-[20px] text-[16px] font-bold text-orange">Pembuatan Akun Berhasil</h2>
        <p className="m-0 mt-[6px] text-[13px] font-medium text-orange">Silahkan cek emailmu</p>
        <div className="mt-[22px]"><Btn onClick={() => { setDone(false); reset('regpet'); }}>Ya</Btn></div>
      </Modal>
    </Page>
  );
}

const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="4.5" width="20" height="15" rx="2.5" fill="currentColor" />
    <path d="M3.5 7.5 12 13.2l8.5-5.7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GoogleG = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.3 5.7c4.3-4 6.8-9.9 6.8-17.2z" />
    <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.4 0 20.100 0 24s1 7.600 2.600 10.800l7.800-6.100z" />
    <path fill="#34A853" d="M24 48c6.200 0 11.500-2 15.300-5.600l-7.300-5.700c-2 1.400-4.700 2.200-8 2.200-6.300 0-11.700-4.200-13.600-9.900l-7.800 6.100C6.500 42.600 14.600 48 24 48z" />
  </svg>
);

/* ---------- Registrasi hewan (231:1561) ---------- */
const JENIS = ['Anjing', 'Kucing', 'Burung', 'Kelinci', 'Hamster', 'Reptil', 'Lainnya'] as const;
export function RegPet() {
  const { up, toast } = useApp();
  const { reset } = useNav();
  const [f, setF] = useState({ type: '', sex: '', name: '', breed: '', age: '', weight: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (v: string) => setF((c) => ({ ...c, [k]: v }));

  const save = () => {
    const e: Record<string, string> = {};
    if (!f.type) e.type = 'Pilih jenis hewan';
    if (!f.sex) e.sex = 'Pilih jenis kelamin';
    if (!f.name.trim()) e.name = 'Nama hewan wajib diisi';
    if (f.age && !/^\d+([.,]\d+)?$/.test(f.age.trim())) e.age = 'Isi dengan angka, contoh: 2';
    if (f.weight && !/^\d+([.,]\d+)?$/.test(f.weight.trim())) e.weight = 'Isi dengan angka, contoh: 4.5';
    setErr(e);
    if (Object.keys(e).length) return;
    up((c) => ({ pets: [...c.pets, { id: uid('p'), name: f.name.trim(), type: f.type, breed: f.breed.trim() || f.type, age: f.age ? `${f.age} tahun` : '-', sex: f.sex, weight: f.weight ? `${f.weight} kg` : undefined }] }));
    toast(`${f.name.trim()} berhasil ditambahkan`);
    reset('home');
  };

  return (
    <Page title="Buat Akun" back={() => reset('home')}>
      <form className="space-y-[18px] px-[21px] pt-[26px]" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        <SelectField label="Pilih Jenis Hewan" value={f.type} onChange={set('type')} options={JENIS} placeholder="Jenis Hewan" error={err.type} />
        <SelectField label="Jenis Kelamin Hewan" value={f.sex} onChange={set('sex')} options={['Jantan', 'Betina']} placeholder="Pilih jenis kelamin" error={err.sex} />
        <Field auth label="Nama Hewan" value={f.name} onChange={set('name')} placeholder="Masukkan Nama Hewan" error={err.name} />
        <Field auth label="Ras Hewan" value={f.breed} onChange={set('breed')} placeholder="Contoh: Poodle, Domestik" />
        <Field auth label="Umur" value={f.age} onChange={set('age')} placeholder="Masukkan Umur" inputMode="decimal" suffix="(tahun)" error={err.age} />
        <Field auth label="Berat Hewan" value={f.weight} onChange={set('weight')} placeholder="Masukkan Berat Hewan" inputMode="decimal" suffix="(kg)" error={err.weight} />
        <div className="pt-[10px]"><Btn type="submit">Simpan Profil</Btn></div>
        <button type="button" onClick={() => reset('home')} className="mx-auto block h-[44px] bg-transparent p-0 text-[14px] font-bold text-orange">Lewati</button>
      </form>
    </Page>
  );
}
