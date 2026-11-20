import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight, Star, Ticket } from 'lucide-react';
import { Btn, Card, Empty, Page, Sheet, cx, DragRow } from '../ui';
import { useNav } from '../nav';
import { effStatus, nowTime, statusLabel, uid, useApp, type Booking } from '../store';
import {
  PAYMENTS, SERVICES, SLOTS, addDays, fmtDate, fmtShort, iso, parseIso, rupiah, todayIso, voucherDiscount,
} from '../data';

const DAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const SERVICE_FEE = 2000;

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/** Kalender bulanan. Tanggal lampau dan lebih dari 90 hari ke depan dinonaktifkan. */
function CalendarSheet({ open, onClose, value, onPick }: { open: boolean; onClose: () => void; value: string; onPick: (d: string) => void }) {
  const sel = parseIso(value);
  const [ym, setYm] = useState({ y: sel.getFullYear(), m: sel.getMonth() });
  useEffect(() => { if (open) { const d = parseIso(value); setYm({ y: d.getFullYear(), m: d.getMonth() }); } }, [open, value]);
  const min = todayIso(); const max = iso(addDays(90));
  const first = new Date(ym.y, ym.m, 1);
  const lead = (first.getDay() + 6) % 7; // Senin sebagai kolom pertama
  const total = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => iso(new Date(ym.y, ym.m, i + 1)))];
  const step = (n: number) => setYm((c) => { const d = new Date(c.y, c.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const minM = parseIso(min); const maxM = parseIso(max);
  const canPrev = ym.y * 12 + ym.m > minM.getFullYear() * 12 + minM.getMonth();
  const canNext = ym.y * 12 + ym.m < maxM.getFullYear() * 12 + maxM.getMonth();
  return (
    <Sheet open={open} onClose={onClose} title="Pilih Tanggal">
      <div className="flex items-center justify-between">
        <button onClick={() => step(-1)} disabled={!canPrev} aria-label="Bulan sebelumnya" className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-sand p-0 text-brown disabled:opacity-30"><ChevronLeft className="h-[20px] w-[20px]" /></button>
        <div className="text-[16px] font-bold text-ink" aria-live="polite">{MONTHS[ym.m]} {ym.y}</div>
        <button onClick={() => step(1)} disabled={!canNext} aria-label="Bulan berikutnya" className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-sand p-0 text-brown disabled:opacity-30"><ChevronRight className="h-[20px] w-[20px]" /></button>
      </div>
      <div className="mt-[14px] grid grid-cols-7 gap-y-[6px] text-center">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => <span key={d} className="text-[12px] font-bold text-[#8a8a8a]">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={'e' + i} />;
          const off = d < min || d > max; const on = d === value; const today = d === min;
          return (
            <button key={d} disabled={off} onClick={() => onPick(d)} aria-label={fmtDate(d)} aria-pressed={on}
              className={cx('mx-auto flex h-[44px] w-[44px] items-center justify-center rounded-full p-0 text-[14px] font-bold transition',
                on ? 'bg-orange text-white' : off ? 'bg-transparent text-[#c9c9c9]' : cx('bg-transparent text-ink', today && 'border border-orange'))}>
              {parseIso(d).getDate()}
            </button>
          );
        })}
      </div>
      <p className="m-0 mt-[12px] text-center text-[12px] font-medium text-[#8a8a8a]">Tanggal bisa dipilih sampai 90 hari ke depan.</p>
    </Sheet>
  );
}

/* =====================================================================
   Pilih Tanggal & Waktu (frame 283:892 / 396:746), tampil sebagai sheet
   ===================================================================== */
export function JadwalSheet({
  open, onClose, title = 'Pilih Tanggal & Waktu Konsultasi', initial, taken = [], cta = 'Lanjut', onNext,
}: {
  open: boolean; onClose: () => void; title?: string; initial?: { date: string; time: string };
  taken?: { date: string; time: string }[]; cta?: string; onNext: (date: string, time: string) => void;
}) {
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [time, setTime] = useState(initial?.time ?? '');
  const [cal, setCal] = useState(false);

  const days = useMemo(() => {
    const list = Array.from({ length: 14 }, (_, i) => iso(addDays(i)));
    return list.includes(date) ? list : [date, ...list];
  }, [date]);

  const full = (d: string, t: string) => {
    if (taken.some((x) => x.date === d && x.time === t)) return true;
    const h = Number(t.slice(0, 2));
    const day = parseIso(d).getDate();
    return (day * 7 + h) % 6 === 0; // slot "penuh" tetap per tanggal
  };
  const past = (d: string, t: string) => {
    if (d !== todayIso()) return false;
    return Number(t.slice(0, 2)) <= new Date().getHours();
  };
  const pick = (d: string) => { setDate(d); if (time && (full(d, time) || past(d, time))) setTime(''); };
  const sel = parseIso(date);

  return (
    <>
    <CalendarSheet open={cal && open} onClose={() => setCal(false)} value={date} onPick={(d) => { pick(d); setCal(false); }} />
    <Sheet open={open} onClose={onClose} label={title}>
      <div className="-mx-[2px]">
        <h2 className="m-0 text-[18px] font-bold leading-[24px] text-ink">{title}</h2>

        <div className="mt-[18px] flex items-start gap-[10px]">
          <DragRow wrapClassName="min-w-0 flex-1" className="hide-scrollbar -ml-[2px] flex gap-[10px] overflow-x-auto px-[2px] pb-[10px] pt-[2px]" role="radiogroup" aria-label="Tanggal">
            {days.map((d) => {
              const dt = parseIso(d);
              const on = d === date;
              return (
                <button key={d} role="radio" aria-checked={on} onClick={() => pick(d)}
                  className={cx('flex h-[58px] w-[62px] shrink-0 flex-col items-center justify-center rounded-[12px] border text-[12px] font-bold leading-[18px] shadow-[0_3px_5px_rgba(0,0,0,0.18)]',
                    on ? 'border-orange bg-orange text-white' : 'border-orange bg-white text-ink')}>
                  <span>{d === todayIso() ? 'Hari ini' : DAY[dt.getDay()]}</span>
                  <span>{dt.getDate()}</span>
                </button>
              );
            })}
          </DragRow>
          <button type="button" onClick={() => setCal(true)} aria-label="Pilih tanggal dari kalender" className="flex h-[58px] w-[62px] shrink-0 flex-col items-center justify-center gap-[2px] rounded-[12px] bg-white p-0 text-[11px] font-bold text-ink shadow-[0_3px_5px_rgba(0,0,0,0.25)]">
            <Calendar className="h-[24px] w-[24px] text-orange" strokeWidth={1.8} />
            {MON[sel.getMonth()]}
          </button>
        </div>
        <p className="m-0 mt-[4px] text-[12px] font-semibold text-[#8a8a8a]">{fmtDate(date)}</p>

        {(Object.keys(SLOTS) as (keyof typeof SLOTS)[]).map((part) => (
          <section key={part} className="mt-[20px]">
            <h3 className="m-0 text-[16px] font-bold text-ink">{part}</h3>
            <div className="mt-[8px] h-px bg-[#e4dccb]" />
            <div className="mt-[14px] grid grid-cols-4 gap-[10px]" role="radiogroup" aria-label={part}>
              {SLOTS[part].map((t) => {
                const off = full(date, t) || past(date, t);
                const on = time === t;
                return (
                  <button key={t} role="radio" aria-checked={on} disabled={off} onClick={() => setTime(t)}
                    className={cx('h-[38px] rounded-[12px] border text-[13px] font-bold shadow-[0_3px_5px_rgba(0,0,0,0.15)] transition',
                      off ? 'cursor-not-allowed border-[#e5e5e5] bg-[#f3f3f3] text-[#bbb] line-through shadow-none'
                        : on ? 'border-orange bg-orange text-white' : 'border-orange bg-white text-ink')}>
                    {t}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="mt-[22px] h-px bg-[#e4dccb]" />
        <div className="mt-[14px] flex items-center gap-[14px]">
          <p className="m-0 min-w-0 flex-1 text-[13px] font-semibold leading-[18px] text-orange">
            {time ? `${fmtShort(date)}, ${time} WIB` : 'Pilih tanggal & Waktu'}
          </p>
          <div className="w-[156px] shrink-0">
            <Btn disabled={!time} onClick={() => { onNext(date, time); onClose(); }}>{cta}</Btn>
          </div>
        </div>
      </div>
    </Sheet>
    </>
  );
}

/* =====================================================================
   Pembayaran (belum ada di Figma, dibuat dengan gaya yang sama)
   ===================================================================== */
export function Bayar() {
  const { s, up, toast, notify, addPoints } = useApp();
  const { back, replace, go } = useNav();
  const d = s.draft;
  const [svcSheet, setSvcSheet] = useState(false);
  const [vSheet, setVSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [jadwal, setJadwal] = useState(false);

  if (!d) {
    return (
      <Page title="Pembayaran" back={back}>
        <Empty title="Belum ada janji yang dipilih" text="Pilih klinik atau dokter, lalu tentukan tanggal dan jam untuk lanjut ke pembayaran." action={<Btn onClick={() => go('list:klinik')}>Cari klinik</Btn>} />
      </Page>
    );
  }

  const isClinic = d.kind === 'klinik';
  const voucher = s.vouchers.find((v) => v.id === d.voucher);
  const discount = voucher ? voucherDiscount(voucher, d.cat, d.price) : 0;
  const total = Math.max(0, d.price - discount) + (d.price ? SERVICE_FEE : 0);
  const ready = !!d.pet && !!d.service && !!d.pay;
  const patch = (p: Partial<NonNullable<typeof d>>) => up({ draft: { ...d, ...p } });

  const pay = () => {
    if (!ready || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      const id = uid('b');
      const code = 'PTP-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
      const booking: Booking = {
        id, kind: d.kind, place: d.place, who: d.who, service: d.service, cat: d.cat, date: d.date, time: d.time,
        price: total, discount, pet: d.pet, pay: PAYMENTS.find((p) => p.id === d.pay)?.name ?? d.pay!, status: 'Terjadwal', km: d.km, code, ref: d.refId,
      };
      const pts = Math.floor(total / 1000);
      up((c) => ({ bookings: [booking, ...c.bookings], draft: null, vouchers: voucher ? c.vouchers.filter((v) => v.id !== voucher.id) : c.vouchers }));
      addPoints(pts, `${d.service}, ${d.place}`);
      notify('Booking berhasil', `${d.service} di ${d.place}, ${fmtShort(d.date)} pukul ${d.time} WIB.`);
      replace('sukses:' + id);
    }, 900);
  };

  const eligible = s.vouchers.map((v) => ({ v, off: voucherDiscount(v, d.cat, d.price) }));

  return (
    <Page
      title="Pembayaran" back={back}
      footer={
        <div className="flex items-center gap-[14px]">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-[#8a8a8a]">Total bayar</div>
            <div className="text-[18px] font-bold leading-[24px] text-ink">{d.service ? rupiah(total) : 'Pilih layanan dulu'}</div>
          </div>
          <div className="w-[170px] shrink-0"><Btn disabled={!ready || busy} onClick={pay}>{busy ? 'Memproses…' : 'Bayar Sekarang'}</Btn></div>
        </div>
      }
    >
      <div className="space-y-[18px] px-[21px] pt-[24px]">
        <Card>
          <div className="text-[15px] font-bold leading-[20px] text-ink">{d.place}</div>
          <div className="mt-[2px] text-[13px] font-semibold text-[#8a8a8a]">{d.who}</div>
          <div className="mt-[14px] flex items-center justify-between rounded-[12px] bg-sand px-[14px] py-[12px]">
            <div>
              <div className="text-[13px] font-bold text-brown">{fmtDate(d.date)}</div>
              <div className="text-[13px] font-semibold text-brown">Pukul {d.time} WIB</div>
            </div>
            <button onClick={() => setJadwal(true)} className="h-[32px] bg-transparent p-0 text-[13px] font-bold text-orange">Ubah</button>
          </div>
        </Card>

        <section>
          <h2 className="m-0 mb-[10px] text-[14px] font-bold text-orange">Hewan</h2>
          {s.pets.length === 0 ? (
            <Card><p className="m-0 text-[13px] font-semibold text-[#8a8a8a]">Kamu belum menambahkan hewan.</p><div className="mt-[12px]"><Btn small variant="outline" onClick={() => go('hewan:baru')}>Tambah hewan</Btn></div></Card>
          ) : (
            <div className="flex flex-wrap gap-[8px]" role="radiogroup" aria-label="Hewan">
              {s.pets.map((p) => (
                <button key={p.id} role="radio" aria-checked={d.pet === p.name} onClick={() => patch({ pet: p.name })}
                  className={cx('h-[40px] rounded-[20px] border px-[18px] text-[13px] font-bold', d.pet === p.name ? 'border-orange bg-orange text-white' : 'border-black/15 bg-white text-ink')}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="m-0 mb-[10px] text-[14px] font-bold text-orange">Layanan</h2>
          {isClinic ? (
            <Card onClick={() => setSvcSheet(true)}>
              <span className="flex items-center justify-between gap-[10px]">
                <span className={cx('text-[14px] font-bold', d.service ? 'text-ink' : 'text-[#b0b0b0]')}>{d.service || 'Pilih layanan'}</span>
                <span className="flex items-center gap-[6px] text-[13px] font-bold text-orange">{d.service && rupiah(d.price)}<ChevronRight className="h-[18px] w-[18px]" /></span>
              </span>
            </Card>
          ) : (
            <Card><span className="flex items-center justify-between text-[14px] font-bold text-ink"><span>{d.service}</span><span className="text-orange">{rupiah(d.price)}</span></span></Card>
          )}
        </section>

        {d.price > 0 && (
          <section>
            <h2 className="m-0 mb-[10px] text-[14px] font-bold text-orange">Voucher</h2>
            <Card onClick={() => setVSheet(true)}>
              <span className="flex items-center gap-[12px]">
                <Ticket className="h-[22px] w-[22px] shrink-0 text-orange" />
                <span className="min-w-0 flex-1 text-[14px] font-bold text-ink">
                  {voucher ? voucher.title : s.vouchers.length ? 'Pilih voucher' : 'Belum ada voucher'}
                  {voucher && <span className="block text-[12px] font-semibold text-green">Hemat {rupiah(discount)}</span>}
                </span>
                <ChevronRight className="h-[18px] w-[18px] text-orange" />
              </span>
            </Card>
          </section>
        )}

        <section>
          <h2 className="m-0 mb-[10px] text-[14px] font-bold text-orange">Metode pembayaran</h2>
          <Card className="!p-0">
            <ul className="m-0 list-none p-0" role="radiogroup" aria-label="Metode pembayaran">
              {PAYMENTS.map((p, i) => (
                <li key={p.id} className={cx(i > 0 && 'border-t border-[#f0e9d6]')}>
                  <button role="radio" aria-checked={d.pay === p.id} onClick={() => patch({ pay: p.id })} className="flex min-h-[58px] w-full items-center gap-[14px] bg-transparent px-[16px] py-[10px] text-left">
                    <span className={cx('flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2', d.pay === p.id ? 'border-orange' : 'border-[#cfcfcf]')}>
                      {d.pay === p.id && <span className="h-[10px] w-[10px] rounded-full bg-orange" />}
                    </span>
                    <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold text-ink">{p.name}</span><span className="block text-[12px] font-semibold text-[#8a8a8a]">{p.note}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <Card>
          <h2 className="m-0 mb-[12px] text-[14px] font-bold text-ink">Rincian pembayaran</h2>
          <Line l="Harga layanan" r={rupiah(d.price)} />
          {discount > 0 && <Line l="Diskon voucher" r={'- ' + rupiah(discount)} green />}
          {d.price > 0 && <Line l="Biaya layanan aplikasi" r={rupiah(SERVICE_FEE)} />}
          <div className="my-[10px] h-px bg-[#eee3c9]" />
          <Line l="Total" r={rupiah(total)} bold />
          <p className="m-0 mt-[10px] text-[12px] font-semibold text-[#8a8a8a]">Kamu akan mendapat {Math.floor(total / 1000)} poin dari transaksi ini.</p>
        </Card>
      </div>

      <Sheet open={svcSheet} onClose={() => setSvcSheet(false)} title="Pilih layanan">
        <ul className="m-0 list-none p-0">
          {SERVICES.map((sv) => (
            <li key={sv.id}>
              <button onClick={() => { patch({ service: sv.name, price: sv.price, cat: sv.cat, voucher: undefined }); setSvcSheet(false); }} className="flex min-h-[56px] w-full items-center justify-between border-b border-[#f0e9d6] bg-transparent p-0 text-left text-[14px] font-semibold text-ink">
                <span>{sv.name}</span><span className="flex items-center gap-[8px] font-bold text-orange">{rupiah(sv.price)}{d.service === sv.name && <Check className="h-[16px] w-[16px]" strokeWidth={3} />}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet open={vSheet} onClose={() => setVSheet(false)} title="Pilih voucher">
        {eligible.length === 0 ? (
          <p className="m-0 text-[13px] font-semibold text-[#8a8a8a]">Kamu belum punya voucher. Tukar poin di tab Reward.</p>
        ) : (
          <ul className="m-0 list-none space-y-[10px] p-0">
            {eligible.map(({ v, off }) => (
              <li key={v.id}>
                <button disabled={off === 0} onClick={() => { patch({ voucher: v.id }); setVSheet(false); toast(`Voucher dipakai, hemat ${rupiah(off)}`); }}
                  className={cx('w-full rounded-[14px] border p-[14px] text-left', off === 0 ? 'border-[#e5e5e5] bg-[#f6f6f6] opacity-70' : d.voucher === v.id ? 'border-orange bg-sand' : 'border-black/15 bg-white')}>
                  <span className="block text-[14px] font-bold text-ink">{v.title}</span>
                  <span className="block text-[12px] font-semibold text-[#8a8a8a]">{off === 0 ? (d.price < v.min ? `Minimum transaksi ${rupiah(v.min)}` : 'Tidak berlaku untuk layanan ini') : `Hemat ${rupiah(off)}`}</span>
                </button>
              </li>
            ))}
            {d.voucher && <li><Btn small variant="outline" onClick={() => { patch({ voucher: undefined }); setVSheet(false); }}>Lepas voucher</Btn></li>}
          </ul>
        )}
      </Sheet>

      <JadwalSheet open={jadwal} onClose={() => setJadwal(false)} initial={{ date: d.date, time: d.time }} cta="Simpan" onNext={(date, time) => { patch({ date, time }); toast('Jadwal diperbarui'); }} />
    </Page>
  );
}

const Line = ({ l, r, bold, green }: { l: string; r: string; bold?: boolean; green?: boolean }) => (
  <div className={cx('flex justify-between py-[4px] text-[13px]', bold ? 'text-[15px] font-bold text-ink' : 'font-semibold text-[#6f6f6f]', green && 'text-green')}>
    <span>{l}</span><span>{r}</span>
  </div>
);

/* =====================================================================
   Sukses
   ===================================================================== */
export function Sukses({ id }: { id: string }) {
  const { s } = useApp();
  const { go, reset } = useNav();
  const b = s.bookings.find((x) => x.id === id);
  const free = b?.kind === 'adopsi';
  return (
    <Page title={free ? 'Survey Terjadwal' : 'Booking Berhasil'}>
      <div className="px-[21px] pt-[44px] text-center">
        <span className="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full bg-orange text-white"><Check className="h-[44px] w-[44px]" strokeWidth={3} /></span>
        <h2 className="m-0 mt-[22px] text-[20px] font-bold text-orange">{free ? 'Survey adopsi terjadwal' : 'Pembayaran berhasil'}</h2>
        <p className="m-0 mt-[6px] text-[13px] font-semibold text-[#8a8a8a]">Detail janji sudah kami simpan di tab Booking.</p>
        {b && (
          <Card className="mt-[26px] text-left">
            <div className="text-[12px] font-semibold text-[#8a8a8a]">Kode booking</div>
            <div className="text-[18px] font-bold tracking-wide text-ink">{b.code}</div>
            <div className="my-[14px] h-px bg-[#eee3c9]" />
            <Line l="Tempat" r={b.place} />
            <Line l="Layanan" r={b.service} />
            <Line l="Tanggal" r={fmtShort(b.date)} />
            <Line l="Jam" r={`${b.time} WIB`} />
            <Line l="Hewan" r={b.pet} />
            {!free && <Line l="Total" r={rupiah(b.price)} bold />}
          </Card>
        )}
        <div className="mt-[26px] space-y-[12px]">
          <Btn onClick={() => go('booking')}>Lihat Janji Saya</Btn>
          <Btn variant="outline" onClick={() => reset('home')}>Kembali ke Beranda</Btn>
        </div>
      </div>
    </Page>
  );
}

/* =====================================================================
   Detail Janji
   ===================================================================== */
export function JanjiDetail({ id }: { id: string }) {
  const { s, up, toast, notify } = useApp();
  const { back, go } = useNav();
  const b = s.bookings.find((x) => x.id === id);
  const [cancel, setCancel] = useState(false);
  const [resched, setResched] = useState(false);
  const [review, setReview] = useState(false);
  const [stars, setStars] = useState(5);
  const [reason, setReason] = useState('');

  if (!b) return <Page title="Detail Janji" back={back}><Empty title="Janji tidak ditemukan" text="Janji ini mungkin sudah dihapus." action={<Btn onClick={() => go('booking')}>Ke Booking</Btn>} /></Page>;
  const label = statusLabel(b);
  const tone = label === 'Hari Ini' ? 'bg-blue text-white' : label === 'Selesai' ? 'bg-green text-white' : label === 'Dibatalkan' ? 'bg-red text-white' : 'bg-orange text-white';
  const status = effStatus(b);
  const active = status === 'Terjadwal';

  const doCancel = () => {
    up((c) => ({ bookings: c.bookings.map((x) => (x.id === b.id ? { ...x, status: 'Dibatalkan' as const, note: reason } : x)) }));
    notify('Janji dibatalkan', `${b.service} di ${b.place} pada ${fmtShort(b.date)} sudah dibatalkan.`);
    setCancel(false); toast('Janji dibatalkan');
  };

  return (
    <Page title="Detail Janji" back={back}
      footer={active ? (
        <div className="flex gap-[12px]">
          <Btn variant="danger" onClick={() => setCancel(true)}>Batalkan</Btn>
          <Btn onClick={() => setResched(true)}>Ubah Jadwal</Btn>
        </div>
      ) : status === 'Selesai' ? (
        <div className="flex gap-[12px]">
          <Btn variant="outline" onClick={() => setReview(true)}>Beri Ulasan</Btn>
          <Btn onClick={() => go(b.ref)}>Pesan Lagi</Btn>
        </div>
      ) : (
        <Btn onClick={() => go(b.ref)}>Buat Janji Baru</Btn>
      )}
    >
      <div className="space-y-[18px] px-[21px] pt-[24px]">
        <Card>
          <div className="flex items-start justify-between gap-[10px]">
            <div>
              <div className="text-[16px] font-bold leading-[22px] text-ink">{b.place}</div>
              <div className="text-[13px] font-semibold text-[#8a8a8a]">{b.who}</div>
            </div>
            <span className={cx('shrink-0 rounded-[8px] px-[10px] py-[4px] text-[11px] font-bold', tone)}>{label}</span>
          </div>
          <div className="my-[14px] h-px bg-[#eee3c9]" />
          <Line l="Kode booking" r={b.code} />
          <Line l="Layanan" r={b.service} />
          <Line l="Tanggal" r={fmtShort(b.date)} />
          <Line l="Jam" r={`${b.time} WIB`} />
          <Line l="Hewan" r={b.pet} />
          <Line l="Jarak" r={b.km} />
        </Card>
        <Card>
          <h2 className="m-0 mb-[10px] text-[14px] font-bold text-ink">Pembayaran</h2>
          <Line l="Metode" r={b.pay} />
          {b.discount > 0 && <Line l="Diskon voucher" r={'- ' + rupiah(b.discount)} green />}
          <Line l="Total" r={rupiah(b.price)} bold />
        </Card>
        {b.status === 'Dibatalkan' && b.note && <Card><div className="text-[12px] font-semibold text-[#8a8a8a]">Alasan pembatalan</div><div className="text-[14px] font-bold text-ink">{b.note}</div></Card>}
      </div>

      <Sheet open={cancel} onClose={() => setCancel(false)} title="Batalkan janji?">
        <p className="m-0 mb-[14px] text-[13px] font-semibold leading-[20px] text-[#6f6f6f]">Pilih alasan pembatalan. Pembatalan kurang dari 2 jam sebelum jadwal bisa dikenai biaya.</p>
        <div className="mb-[20px] flex flex-wrap gap-[8px]">
          {['Jadwal bentrok', 'Hewan sudah sehat', 'Salah pilih layanan', 'Lainnya'].map((r) => (
            <button key={r} aria-pressed={reason === r} onClick={() => setReason(r)} className={cx('h-[36px] rounded-[18px] border px-[14px] text-[12px] font-bold', reason === r ? 'border-orange bg-orange text-white' : 'border-black/15 bg-white text-ink')}>{r}</button>
          ))}
        </div>
        <div className="flex gap-[12px]"><Btn variant="outline" onClick={() => setCancel(false)}>Tidak</Btn><Btn variant="danger" disabled={!reason} onClick={doCancel}>Ya, batalkan</Btn></div>
      </Sheet>

      <JadwalSheet open={resched} onClose={() => setResched(false)} title="Ubah Tanggal & Waktu" initial={{ date: b.date, time: b.time }} cta="Simpan"
        taken={s.bookings.filter((x) => x.id !== b.id && x.status === 'Terjadwal').map((x) => ({ date: x.date, time: x.time }))}
        onNext={(date, time) => { up((c) => ({ bookings: c.bookings.map((x) => (x.id === b.id ? { ...x, date, time } : x)) })); notify('Jadwal diubah', `${b.service} dipindah ke ${fmtShort(date)} pukul ${time} WIB.`); toast('Jadwal berhasil diubah'); }} />

      <Sheet open={review} onClose={() => setReview(false)} title="Beri ulasan">
        <div className="mb-[18px] flex justify-center gap-[6px]" role="radiogroup" aria-label="Bintang">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n} bintang`} onClick={() => setStars(n)} className="flex h-[44px] w-[44px] items-center justify-center bg-transparent p-0">
              <Star className={cx('h-[34px] w-[34px]', n <= stars ? 'text-orange' : 'text-[#d6d0c0]')} fill="currentColor" strokeWidth={0} />
            </button>
          ))}
        </div>
        <Btn onClick={() => { setReview(false); toast('Terima kasih atas ulasanmu!'); }}>Kirim ulasan</Btn>
      </Sheet>
    </Page>
  );
}

export { nowTime };
