import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Headset, MessageCircle, Send } from 'lucide-react';
import { Btn, Card, Empty, IconBtn, Page, cx } from '../ui';
import { useNav } from '../nav';
import { nowTime, useApp } from '../store';
import { CLINICS, DOCTORS, GROOMING, PENITIPAN, TRAINERS, VAKSINASI, FAQ } from '../data';

export function threadTitle(id: string) {
  if (id === 'cs') return 'Customer Service Petopia';
  if (id.startsWith('c-')) {
    const c = [...CLINICS, ...GROOMING, ...VAKSINASI, ...PENITIPAN].find((x) => x.id === id.slice(2));
    return c?.name ?? 'Klinik';
  }
  return [...DOCTORS, ...TRAINERS].find((x) => x.id === id)?.name ?? 'Chat';
}

/* Pusat Bantuan (ikon headset) */
export function Bantuan() {
  const { back, go } = useNav();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Page title="Pusat Bantuan" back={back} footer={<Btn onClick={() => go('chat:cs')}>Hubungi Customer Service</Btn>}>
      <div className="px-[22px] pt-[22px]">
        <Card className="flex items-center gap-[14px] !bg-sand shadow-none">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-orange text-white"><Headset className="h-[24px] w-[24px]" /></span>
          <span className="text-[13px] font-semibold leading-[19px] text-brown">Tim kami siap membantu setiap hari pukul 08:00 sampai 21:00 WIB.</span>
        </Card>
        <h2 className="m-0 mb-[8px] mt-[26px] text-[15px] font-bold text-ink">Pertanyaan yang sering diajukan</h2>
        <ul className="m-0 list-none p-0">
          {FAQ.map(([q, a], i) => (
            <li key={q} className="border-b border-[#eee3c9]">
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex min-h-[58px] w-full items-center justify-between gap-[12px] bg-transparent p-0 py-[10px] text-left text-[14px] font-bold leading-[20px] text-ink">
                {q}<ChevronDown className={cx('h-[18px] w-[18px] shrink-0 text-orange transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && <p className="m-0 pb-[16px] text-[13px] font-medium leading-[21px] text-[#6f6f6f]">{a}</p>}
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}

/* Daftar chat */
export function Chats() {
  const { s } = useApp();
  const { back, go } = useNav();
  const ids = Object.keys(s.threads);
  return (
    <Page title="Chat" back={back}>
      {ids.length === 0 ? (
        <Empty title="Belum ada percakapan" text="Mulai chat dari halaman klinik atau dokter, atau hubungi Customer Service." action={<Btn onClick={() => go('chat:cs')}>Chat Customer Service</Btn>} />
      ) : (
        <ul className="m-0 list-none px-[22px] pt-[14px]">
          {ids.map((id) => {
            const last = s.threads[id][s.threads[id].length - 1];
            return (
              <li key={id}>
                <button onClick={() => go('chat:' + id)} className="flex min-h-[72px] w-full items-center gap-[14px] border-b border-[#eee3c9] bg-transparent p-0 py-[12px] text-left">
                  <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-sand text-orange">{id === 'cs' ? <Headset className="h-[24px] w-[24px]" /> : <MessageCircle className="h-[24px] w-[24px]" />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold text-ink">{threadTitle(id)}</span><span className="block truncate text-[12px] font-semibold text-[#8a8a8a]">{last?.text}</span></span>
                  <span className="shrink-0 text-[11px] font-semibold text-[#a8a08c]">{last?.t}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}

function autoReply(id: string, text: string) {
  const t = text.toLowerCase();
  if (/(bayar|pembayaran|voucher|refund)/.test(t)) return 'Soal pembayaran, kamu bisa cek rincian di tab Booking lalu Lihat Detail. Kalau ada kendala, kirim kode booking-nya ya.';
  if (/(batal|jadwal|ubah)/.test(t)) return 'Jadwal bisa diubah atau dibatalkan dari tab Booking, di halaman Detail Janji. Ada yang bisa kami bantu lagi?';
  if (id === 'cs') return 'Terima kasih sudah menghubungi Petopia. Pesanmu sudah kami terima dan tim kami akan membalas sebentar lagi.';
  if (id.startsWith('c-')) return 'Halo, terima kasih sudah menghubungi kami. Silakan sebutkan jenis hewan dan layanan yang dibutuhkan.';
  return 'Terima kasih sudah bercerita. Boleh sebutkan umur, berat, dan sejak kapan gejalanya muncul? Untuk pemeriksaan lengkap, silakan buat janji temu.';
}

export function Chat({ id }: { id: string }) {
  const { s, up, reply, toast } = useApp();
  const { back, go } = useNav();
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const msgs = s.threads[id] ?? [];

  useEffect(() => {
    if (!s.threads[id]) up((c) => ({ threads: { ...c.threads, [id]: [{ from: 'them', text: id === 'cs' ? 'Halo, ada yang bisa kami bantu hari ini?' : 'Halo, silakan tulis pertanyaanmu di sini.', t: nowTime() }] } }));
  }, [id, s.threads, up]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length]);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    if (!s.loggedIn) { toast('Masuk dulu untuk mengirim pesan'); go('login:back'); return; }
    up((c) => ({ threads: { ...c.threads, [id]: [...(c.threads[id] ?? []), { from: 'me', text: v, t: nowTime() }] } }));
    setText(''); reply(id, autoReply(id, v));
  };

  return (
    <Page title={threadTitle(id)} back={back}
      footer={
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-[10px]">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan" aria-label="Tulis pesan" className="h-[46px] min-w-0 flex-1 rounded-full border border-black/15 bg-white px-[18px] text-[14px] font-semibold text-black outline-none placeholder:font-medium placeholder:text-[#b0b0b0] focus:border-orange focus:ring-2 focus:ring-orange/30" />
          <button type="submit" aria-label="Kirim" disabled={!text.trim()} className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-orange p-0 text-white disabled:opacity-45"><Send className="h-[20px] w-[20px]" /></button>
        </form>
      }
    >
      <div className="flex flex-col gap-[10px] px-[22px] pt-[22px]" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={cx('max-w-[78%] rounded-[16px] px-[14px] py-[10px] text-[14px] font-medium leading-[20px]', m.from === 'me' ? 'self-end rounded-br-[4px] bg-orange text-white' : 'self-start rounded-bl-[4px] bg-white text-ink shadow-[0_2px_5px_rgba(0,0,0,0.10)]')}>
            {m.text}
            <div className={cx('mt-[2px] text-right text-[10px] font-semibold', m.from === 'me' ? 'text-white/80' : 'text-[#a8a08c]')}>{m.t}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
    </Page>
  );
}

export function Notif() {
  const { s, up } = useApp();
  const { back } = useNav();
  const unread = s.notifs.filter((n) => !n.read).length;
  return (
    <Page title="Notifikasi" back={back} right={unread ? <button onClick={() => up((c) => ({ notifs: c.notifs.map((n) => ({ ...n, read: true })) }))} className="h-[34px] bg-transparent p-0 text-[12px] font-bold text-white">Tandai dibaca</button> : undefined}>
      {s.notifs.length === 0 ? (
        <Empty title="Belum ada notifikasi" text="Pengingat janji dan info promo akan muncul di sini." />
      ) : (
        <ul className="m-0 list-none space-y-[12px] px-[22px] pt-[22px]">
          {s.notifs.map((n) => (
            <li key={n.id}>
              <button onClick={() => up((c) => ({ notifs: c.notifs.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }))} className={cx('flex w-full gap-[12px] rounded-[16px] p-[16px] text-left shadow-[0_3px_8px_rgba(0,0,0,0.10)]', n.read ? 'bg-white' : 'bg-sand')}>
                <span className="mt-[2px] flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-orange text-white"><Bell className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-[8px]"><span className="text-[14px] font-bold leading-[19px] text-ink">{n.title}</span>{!n.read && <span aria-label="Belum dibaca" className="h-[8px] w-[8px] shrink-0 rounded-full bg-red" />}</span>
                  <span className="mt-[2px] block text-[13px] font-medium leading-[19px] text-[#6f6f6f]">{n.text}</span>
                  <span className="mt-[4px] block text-[11px] font-semibold text-[#a8a08c]">{n.time}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
