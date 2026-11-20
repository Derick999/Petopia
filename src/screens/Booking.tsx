import { useState } from 'react';
import { MapPin, Plus, Search } from 'lucide-react';
import { Btn, Card, Chip, Empty, Page, Sheet, cx, DragRow } from '../ui';
import { useNav } from '../nav';
import { statusLabel, useApp } from '../store';
import { fmtShort, parseIso } from '../data';

const FILTERS = ['Semua', 'Hari Ini', 'Terjadwal', 'Selesai', 'Dibatalkan'] as const;

export default function Booking() {
  const { s } = useApp();
  const { go } = useNav();
  const [q, setQ] = useState('');
  const [f, setF] = useState<(typeof FILTERS)[number]>('Semua');
  const [sheet, setSheet] = useState(false);

  const list = [...s.bookings]
    .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))
    .filter((b) => {
      const key = q.trim().toLowerCase();
      const hit = !key || (b.place + b.who + b.service + b.pet + b.code).toLowerCase().includes(key);
      const st = statusLabel(b);
      const stOk = f === 'Semua' || st === f || (f === 'Terjadwal' && st === 'Hari Ini');
      return hit && stOk;
    });

  const make: [string, string][] = [['Klinik Hewan', 'list:klinik'], ['Konsultasi dokter', 'list:konsultasi'], ['Grooming', 'list:grooming'], ['Vaksinasi', 'list:vaksinasi'], ['Penitipan', 'list:penitipan'], ['Trainer', 'list:trainer']];

  return (
    <div className="relative h-full">
      <Page title="Jadwal Janji Temu" tab>
        {!s.loggedIn ? (
          <Empty title="Masuk untuk melihat janji" text="Riwayat dan jadwal janji temu hewanmu akan muncul di sini setelah kamu masuk." action={<Btn onClick={() => go('login')}>Masuk</Btn>} />
        ) : (
          <>
            <div className="px-[22px] pt-[22px]">
              <div className="flex h-[46px] items-center gap-[12px] rounded-[16px] bg-white px-[16px] shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
                <Search className="h-[18px] w-[18px] shrink-0 text-[#8b8b8b]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari klinik, dokter, atau hewan" aria-label="Cari janji" className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-black outline-none placeholder:font-medium placeholder:text-[#b0b0b0]" />
              </div>
            </div>
            <DragRow className="hide-scrollbar flex gap-[8px] overflow-x-auto px-[22px] pb-[5px] pt-[16px]">
              {FILTERS.map((x) => <Chip key={x} label={x} active={f === x} onClick={() => setF(x)} />)}
            </DragRow>
            {list.length === 0 ? (
              <Empty title={s.bookings.length ? 'Tidak ada janji yang cocok' : 'Belum ada janji'} text={s.bookings.length ? 'Coba ubah kata kunci atau filter status.' : 'Buat janji pertamamu dengan klinik atau dokter hewan terdekat.'} action={<Btn onClick={() => setSheet(true)}>Buat Janji</Btn>} />
            ) : (
              <ul className="m-0 list-none space-y-[18px] px-[22px] pt-[20px]">
                {list.map((b) => {
                  const st = statusLabel(b);
                  const tone = st === 'Hari Ini' ? 'bg-blue' : st === 'Selesai' ? 'bg-green' : st === 'Dibatalkan' ? 'bg-red' : 'bg-orange';
                  const d = parseIso(b.date);
                  return (
                    <li key={b.id}>
                      <Card>
                        <div className="flex items-start justify-between gap-[10px]">
                          <div className="min-w-0">
                            <div className="truncate text-[15px] font-bold leading-[20px] text-ink">{b.place}</div>
                            <div className="truncate text-[13px] font-semibold text-[#8a8a8a]">{b.who}</div>
                            <div className="truncate text-[12px] font-bold text-orange">{b.service}</div>
                          </div>
                          <span className={cx('shrink-0 rounded-[8px] px-[10px] py-[4px] text-[11px] font-bold text-white', tone)}>{st}</span>
                        </div>
                        <div className="mt-[12px] flex flex-wrap items-center gap-x-[14px] gap-y-[4px] text-[12px] font-semibold text-ink-2">
                          <span>{d.getDate() === new Date().getDate() && st === 'Hari Ini' ? 'Hari ini' : fmtShort(b.date)}, {b.time} WIB</span>
                          {b.km !== '-' && <span className="inline-flex items-center gap-[4px]"><MapPin className="h-[12px] w-[10px] text-orange" strokeWidth={2.4} />{b.km}</span>}
                          <span>Hewan: {b.pet}</span>
                        </div>
                        <div className="mt-[14px]">
                          <button onClick={() => go('janji:' + b.id)} className="h-[34px] w-[112px] rounded-[8px] border border-red bg-transparent p-0 text-[12px] font-bold text-red">Lihat Detail</button>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </Page>

      {s.loggedIn && (
        <button onClick={() => setSheet(true)} className="absolute bottom-[112px] right-[20px] z-30 flex h-[48px] items-center gap-[8px] rounded-full bg-red px-[20px] text-[14px] font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
          <Plus className="h-[20px] w-[20px]" strokeWidth={2.6} />Buat Janji
        </button>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Buat janji untuk apa?">
        <div className="grid grid-cols-2 gap-[10px]">
          {make.map(([l, r]) => (
            <button key={l} onClick={() => { setSheet(false); go(r); }} className="h-[52px] rounded-[14px] border border-orange bg-white p-0 text-[13px] font-bold text-orange active:bg-sand">{l}</button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
