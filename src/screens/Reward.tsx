import { useEffect, useState } from 'react';
import { Check, Clock, ChevronRight, Ticket } from 'lucide-react';
import { Btn, Card, Chip, Empty, Page, Photo, Sheet, cx } from '../ui';
import { useNav } from '../nav';
import { uid, useApp } from '../store';
import { COUPONS, PROMO_CODES, REWARD_TIERS, WELCOME, fmtShort, todayIso } from '../data';

export default function Reward() {
  const { s, up, addPoints, toast, notify } = useApp();
  const { go } = useNav();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  if (!s.loggedIn) {
    return <Page title="Reward" tab><Empty title="Masuk untuk melihat reward" text="Kumpulkan poin dari setiap booking dan tukar dengan voucher layanan." action={<Btn onClick={() => go('login')}>Masuk</Btn>} /></Page>;
  }

  const tierIdx = REWARD_TIERS.reduce((a, t, i) => (s.xp >= t.xp ? i : a), 0);
  const tier = REWARD_TIERS[tierIdx];
  const next = REWARD_TIERS[tierIdx + 1];
  const pct = next ? Math.min(100, ((s.xp - tier.xp) / (next.xp - tier.xp)) * 100) : 100;

  const redeemCode = () => {
    const c = code.trim().toUpperCase();
    if (!c) { setErr('Masukkan kode promo dulu'); return; }
    if (s.usedCodes.includes(c)) { setErr('Kode ini sudah pernah kamu pakai'); return; }
    const hit = PROMO_CODES[c];
    if (!hit) { setErr('Kode tidak ditemukan. Cek lagi penulisannya.'); return; }
    up((cur) => ({ usedCodes: [...cur.usedCodes, c] }));
    addPoints(hit.points, `Kode promo ${c}`);
    notify('Kode promo berhasil', hit.text);
    setErr(''); setCode(''); toast(hit.text);
  };

  return (
    <Page title="Reward" tab>
      <div className="space-y-[24px] px-[22px] pt-[24px]">
        {/* Level */}
        <Card className="!p-[18px]">
          <div className="flex items-center gap-[14px]">
            <Photo src="level-badge.png" className="h-[54px] w-[54px] shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold text-[#8a8a8a]">Level kamu</div>
              <div className="text-[18px] font-bold leading-[24px] text-ink">{tier.name}</div>
            </div>
          </div>
          <div className="mt-[16px] h-[10px] overflow-hidden rounded-full bg-[#eee3c9]" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progres level">
            <div className="h-full rounded-full bg-orange transition-all" style={{ width: pct + '%' }} />
          </div>
          <div className="mt-[8px] text-[12px] font-semibold text-[#8a8a8a]">
            {next ? `${s.xp}/${next.xp} XP menuju ${next.name}` : `${s.xp} XP, level tertinggi`}
          </div>
        </Card>

        {/* Poin */}
        <Card className="flex items-center justify-between !p-[18px]">
          <div>
            <div className="text-[12px] font-semibold text-[#8a8a8a]">Poin kamu</div>
            <div className="text-[26px] font-bold leading-[32px] text-orange">{s.points}</div>
          </div>
          <button onClick={() => go('riwayat')} className="h-[38px] rounded-[10px] border border-orange bg-white px-[18px] text-[13px] font-bold text-orange">Riwayat</button>
        </Card>

        {/* Kode promo */}
        <section>
          <h2 className="m-0 mb-[10px] text-[14px] font-bold text-orange">Kode promo</h2>
          <form onSubmit={(e) => { e.preventDefault(); redeemCode(); }} className="flex gap-[10px]">
            <div className="min-w-0 flex-1">
              <input value={code} onChange={(e) => { setCode(e.target.value); setErr(''); }} placeholder="Masukkan kode promo" aria-label="Kode promo" aria-invalid={!!err}
                className={cx('h-[46px] w-full rounded-[14px] border bg-white px-[14px] text-[14px] font-semibold uppercase text-black outline-none placeholder:font-medium placeholder:normal-case placeholder:text-[#b5b5b5] focus:ring-2 focus:ring-orange/40', err ? 'border-red' : 'border-transparent')} />
            </div>
            <div className="w-[96px] shrink-0"><Btn type="submit">Gunakan</Btn></div>
          </form>
          {err ? <p role="alert" className="m-0 mt-[8px] text-[12px] font-semibold text-red">{err}</p> : <p className="m-0 mt-[8px] text-[12px] font-semibold text-[#9a9a9a]">Contoh kode: PETOPIA25</p>}
        </section>

        {/* Voucher saya */}
        <section>
          <h2 className="m-0 mb-[12px] text-[14px] font-bold text-orange">Voucher saya</h2>
          {s.vouchers.length === 0 ? (
            <p className="m-0 text-[13px] font-semibold text-[#8a8a8a]">Belum ada voucher. Tukar poin di bawah.</p>
          ) : (
            <ul className="m-0 list-none space-y-[12px] p-0">
              {s.vouchers.map((v) => (
                <li key={v.id}>
                  <Card onClick={() => go('voucher:' + v.id)}>
                    <span className="flex items-center gap-[14px]">
                      <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-sand text-orange"><Ticket className="h-[24px] w-[24px]" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-bold leading-[19px] text-ink">{v.title}</span>
                        <span className="block text-[12px] font-semibold text-[#8a8a8a]">Berlaku hingga {v.expire}</span>
                      </span>
                      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-orange" />
                    </span>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Tukar poin */}
        <section>
          <h2 className="m-0 mb-[12px] text-[14px] font-bold text-orange">Tukarkan Points kamu</h2>
          <ul className="m-0 list-none space-y-[14px] p-0">
            {COUPONS.map((c) => {
              const pctC = Math.min(100, (s.points / c.cost) * 100);
              return (
                <li key={c.id}>
                  <Card onClick={() => go('hadiah:' + c.id)} className="!p-0 overflow-hidden">
                    <Photo src={c.img} className="h-[92px] w-full" />
                    <span className="block p-[14px]">
                      <span className="block text-[11px] font-bold text-orange">{c.type}</span>
                      <span className="block text-[14px] font-bold leading-[19px] text-ink">{c.title}</span>
                      <span className="mt-[10px] block h-[6px] overflow-hidden rounded-full bg-[#eee3c9]"><span className="block h-full rounded-full bg-green" style={{ width: pctC + '%' }} /></span>
                      <span className="mt-[6px] block text-[12px] font-semibold text-[#8a8a8a]">{Math.min(s.points, c.cost)}/{c.cost} poin</span>
                    </span>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Page>
  );
}

const SYARAT = [
  'Voucher hanya berlaku untuk satu kali transaksi di aplikasi Petopia.',
  'Voucher tidak dapat diuangkan dan tidak dapat digabung dengan voucher lain.',
  'Pastikan nilai transaksi memenuhi minimum yang tertera pada voucher.',
  'Voucher hanya berlaku untuk layanan yang disebutkan pada deskripsi.',
  'Voucher yang sudah kedaluwarsa tidak dapat digunakan kembali.',
  'Petopia berhak mengubah syarat dan ketentuan sewaktu-waktu tanpa pemberitahuan.',
];
const CARA = [
  'Pilih klinik, dokter, atau layanan yang kamu butuhkan, lalu tentukan tanggal dan jam.',
  'Di halaman Pembayaran, pilih layanan dan tekan bagian Voucher.',
  'Pilih voucher ini. Potongan harga langsung terhitung di rincian pembayaran.',
  'Selesaikan pembayaran.',
];

function useCountdown(expire: string) {
  const parse = () => {
    const [d, m, y] = expire.split(' ');
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5, Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11 };
    return new Date(Number(y), months[m] ?? 11, Number(d), 23, 59, 59).getTime();
  };
  const end = parse();
  const [left, setLeft] = useState(() => Math.max(0, end - Date.now()));
  useEffect(() => {
    const t = window.setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => window.clearInterval(t);
  }, [end]);
  const sec = Math.floor(left / 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(sec / 3600))}:${p(Math.floor((sec % 3600) / 60))}:${p(sec % 60)}`;
}

/* Detail Voucher (269:622) */
export function VoucherDetail({ id }: { id: string }) {
  const { s, toast } = useApp();
  const { back, go } = useNav();
  const v = s.vouchers.find((x) => x.id === id) ?? (id === 'welcome' ? { ...WELCOME, source: '' } : undefined);
  const t = useCountdown(v?.expire ?? '31 Des 2026');
  if (!v) return <Page title="Detail Voucher" back={back}><Empty title="Voucher tidak ditemukan" text="Voucher ini mungkin sudah dipakai." action={<Btn onClick={back}>Kembali</Btn>} /></Page>;
  const banner = id === 'welcome' ? 'voucher-welcome.png' : COUPONS.find((c) => id.startsWith(c.id))?.img;
  return (
    <Page title="Detail Voucher" back={back} footer={<Btn onClick={() => { toast('Pilih layanan, voucher dipakai saat pembayaran'); go('list:klinik'); }}>Gunakan</Btn>}>
      <Photo src={banner} className="h-[122px] w-full" fallback={<div className="flex h-full w-full items-center justify-center bg-red px-[24px] text-center text-[20px] font-extrabold leading-[24px] text-[#ffe14d]">{v.title}</div>} />
      <div className="px-[22px] pb-[8px] pt-[18px]">
        <h2 className="m-0 text-[18px] font-bold leading-[24px] text-ink">{v.title}</h2>
        <div className="mt-[8px] flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#8a8a8a]">Berlaku hingga {v.expire}</span>
          <span className="inline-flex items-center gap-[6px] rounded-full bg-red px-[12px] py-[4px] text-[12px] font-bold tabular-nums text-white" aria-label={`Sisa waktu ${t}`}><Clock className="h-[13px] w-[13px]" />{t}</span>
        </div>
        <p className="m-0 mt-[14px] text-[13px] font-medium leading-[20px] text-[#6f6f6f]">{v.desc}</p>
        <h3 className="m-0 mt-[24px] text-[16px] font-bold text-ink">Syarat & Ketentuan</h3>
        <ol className="m-0 mt-[10px] space-y-[8px] pl-[20px] text-[13px] font-medium leading-[20px] text-[#6f6f6f]">{SYARAT.map((x) => <li key={x}>{x}</li>)}</ol>
        <h3 className="m-0 mt-[24px] text-[16px] font-bold text-ink">Cara Pakai</h3>
        <ol className="m-0 mt-[10px] space-y-[8px] pl-[20px] text-[13px] font-medium leading-[20px] text-[#6f6f6f]">{CARA.map((x) => <li key={x}>{x}</li>)}</ol>
      </div>
    </Page>
  );
}

/* Detail Reward (279:605) */
export function HadiahDetail({ id }: { id: string }) {
  const { s, up, addPoints, toast, notify } = useApp();
  const { back, go } = useNav();
  const c = COUPONS.find((x) => x.id === id) ?? COUPONS[0];
  const [ask, setAsk] = useState(false);
  const [ok, setOk] = useState(false);
  const short = c.cost - s.points;

  const redeem = () => {
    if (short > 0) return;
    const vid = c.id + '-' + uid('');
    up((cur) => ({ vouchers: [...cur.vouchers, { id: vid, title: c.title, desc: `Potongan Rp 10.000 untuk layanan ${c.type.toLowerCase()} dengan minimum transaksi Rp 50.000.`, ...c.v, source: 'Tukar poin' }] }));
    addPoints(-c.cost, `Tukar ${c.title}`);
    notify('Voucher berhasil ditukar', `${c.title} sudah masuk ke Voucher Saya.`);
    setAsk(false); setOk(true); toast('Voucher berhasil ditukar');
  };

  return (
    <Page title="Detail Reward" back={back}
      footer={ok ? <Btn onClick={() => go('reward')}>Lihat Voucher Saya</Btn> : (
        <div>
          <Btn disabled={short > 0} onClick={() => setAsk(true)}>Tukar Poin ({c.cost})</Btn>
          {short > 0 && <p role="status" className="m-0 mt-[10px] text-center text-[12px] font-semibold text-[#8a8a8a]">Poin kamu kurang {short}. Kumpulkan lewat booking atau kode promo.</p>}
        </div>
      )}
    >
      <Photo src={c.img} className="h-[150px] w-full" />
      <div className="px-[22px] pt-[20px]">
        <span className="text-[12px] font-bold text-orange">{c.type}</span>
        <h2 className="m-0 mt-[2px] text-[18px] font-bold leading-[24px] text-ink">{c.title}</h2>
        <div className="mt-[12px] inline-flex items-center rounded-full bg-sand px-[14px] py-[6px] text-[13px] font-bold text-brown">{c.cost} poin</div>
        {ok && <p role="status" className="m-0 mt-[14px] flex items-center gap-[8px] text-[13px] font-bold text-green"><Check className="h-[18px] w-[18px]" strokeWidth={3} />Sudah masuk ke Voucher Saya</p>}
        <h3 className="m-0 mt-[24px] text-[16px] font-bold text-ink">Syarat & Ketentuan</h3>
        <ol className="m-0 mt-[10px] space-y-[8px] pl-[20px] text-[13px] font-medium leading-[20px] text-[#6f6f6f]">{SYARAT.map((x) => <li key={x}>{x}</li>)}</ol>
      </div>
      <Sheet open={ask} onClose={() => setAsk(false)} title="Tukar poin?">
        <p className="m-0 mb-[20px] text-[14px] font-medium leading-[22px] text-[#666]">{c.cost} poin akan dipakai untuk menukar {c.title}. Sisa poinmu {s.points - c.cost}.</p>
        <div className="flex gap-[12px]"><Btn variant="outline" onClick={() => setAsk(false)}>Batal</Btn><Btn onClick={redeem}>Ya, tukar</Btn></div>
      </Sheet>
    </Page>
  );
}

/* Riwayat Poin (281:652 / 281:756) */
export function Riwayat() {
  const { s } = useApp();
  const { back } = useNav();
  const [tab, setTab] = useState<'in' | 'out'>('in');
  const rows = s.log.filter((l) => (tab === 'in' ? l.pts > 0 : l.pts < 0));
  return (
    <Page title="Riwayat Poin" back={back}>
      <div className="flex gap-[10px] px-[22px] pt-[22px]" role="tablist">
        <Chip label="Point Didapat" active={tab === 'in'} onClick={() => setTab('in')} />
        <Chip label="Point Terpakai" active={tab === 'out'} onClick={() => setTab('out')} />
      </div>
      {rows.length === 0 ? (
        <Empty title="Belum ada riwayat" text={tab === 'in' ? 'Poin akan bertambah setiap kamu menyelesaikan pembayaran.' : 'Poin yang kamu tukar dengan voucher akan muncul di sini.'} />
      ) : (
        <ul className="m-0 list-none px-[22px] pt-[14px]">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-[12px] border-b border-[#eee3c9] py-[16px]">
              <span className="min-w-0"><span className="block text-[14px] font-bold leading-[19px] text-ink">{r.label}</span><span className="block text-[12px] font-semibold text-[#8a8a8a]">{fmtShort(r.date)}{r.date === todayIso() ? ' (hari ini)' : ''}</span></span>
              <span className={cx('shrink-0 text-[15px] font-bold', r.pts > 0 ? 'text-green' : 'text-red')}>{r.pts > 0 ? '+' : ''}{r.pts}</span>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
