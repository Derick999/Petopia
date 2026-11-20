import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Check, ChevronLeft, ChevronRight, Gift, House, PawPrint, User, X } from 'lucide-react';
import { useOverlay } from './nav';
import { useDragScroll } from './hooks';

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/**
 * Foto dari Figma. Taruh file di /public/img/<nama>. Kalau file belum ada,
 * otomatis tampil placeholder supaya layout tetap utuh.
 */
export function Photo({
  src, className, style, fallback, pos = 'center',
}: { src?: string; className?: string; style?: CSSProperties; fallback?: ReactNode; pos?: string }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) {
    return (
      <div
        className={cx('flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6dfb0] to-[#e9be72] text-white/70', className)}
        style={style}
      >
        {fallback ?? <PawPrint className="h-[28%] max-h-10 w-auto opacity-80" strokeWidth={1.6} />}
      </div>
    );
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}img/${src}`}
      alt=""
      onError={() => setBad(true)}
      className={cx('object-cover', className)}
      style={{ objectPosition: pos, ...style }}
    />
  );
}

/** Ikon PNG dari Figma dengan cadangan ikon vektor. */
export function AssetIcon({ src, fallback, className, style }: { src: string; fallback: ReactNode; className?: string; style?: CSSProperties }) {
  const [bad, setBad] = useState(false);
  if (bad) return <>{fallback}</>;
  return (
    <img
      src={`${import.meta.env.BASE_URL}img/${src}`}
      alt=""
      onError={() => setBad(true)}
      className={cx('object-contain', className)}
      style={style}
    />
  );
}

export const PawLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <ellipse cx="5.2" cy="10.4" rx="2.1" ry="2.8" />
    <ellipse cx="9.4" cy="5.9" rx="2.1" ry="2.9" />
    <ellipse cx="14.6" cy="5.9" rx="2.1" ry="2.9" />
    <ellipse cx="18.8" cy="10.4" rx="2.1" ry="2.8" />
    <path d="M12 10.2c-3.3 0-6 2.7-6 5.5 0 2 1.4 3.3 3.1 3.3 1.2 0 1.9-.5 2.9-.5s1.7.5 2.9.5c1.7 0 3.1-1.3 3.1-3.3 0-2.8-2.7-5.5-6-5.5z" />
  </svg>
);

/* ---------- Bottom navigation (Component 2 di Figma) ---------- */
export type Tab = 'home' | 'artikel' | 'booking' | 'reward' | 'akun';

const NAV: { id: Tab; label: string; left: string; icon: typeof House }[] = [
  { id: 'home', label: 'Awal', left: '12%', icon: House },
  { id: 'artikel', label: 'Artikel', left: '28.7%', icon: BookOpen },
  { id: 'reward', label: 'Reward', left: '70.7%', icon: Gift },
  { id: 'akun', label: 'Akun', left: '87.6%', icon: User },
];

export function BottomNav({ active, onTab }: { active: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 h-[82px] rounded-t-[27px] bg-sand shadow-[0_-3px_8px_rgba(0,0,0,0.14)]">
      {NAV.map(({ id, label, left, icon: Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            onClick={() => onTab(id)}
            aria-label={label}
            aria-current={on ? 'page' : undefined}
            className="absolute top-[14px] flex w-[60px] -translate-x-1/2 flex-col items-center bg-transparent p-0"
            style={{ left }}
          >
            <Icon
              className={cx('h-[26px] w-[26px]', on ? 'text-red' : 'text-[#8a8a8a]')}
              strokeWidth={on ? 2.2 : 1.8}
              fill={on ? 'currentColor' : 'none'}
            />
            <span className={cx('mt-[2px] text-[12px] font-bold leading-[22px]', on ? 'text-black' : 'text-[#7c7c7c]')}>
              {label}
            </span>
          </button>
        );
      })}
      <button
        onClick={() => onTab('booking')}
        aria-label="Booking"
        data-coach="booking"
        aria-current={active === 'booking' ? 'page' : undefined}
        className="absolute left-1/2 top-[-30px] flex w-[63px] -translate-x-1/2 flex-col items-center bg-transparent p-0"
      >
        <span className="relative flex h-[63px] w-[63px] items-center justify-center rounded-full bg-[#fdb515]">
          <AssetIcon
            src="nav-paw.png"
            className="h-[34px] w-[52px]"
            fallback={<PawLogo className="h-[34px] w-[34px] text-red" />}
          />
        </span>
        <span className={cx('mt-[8px] text-[12px] font-bold leading-[22px]', active === 'booking' ? 'text-black' : 'text-[#7c7c7c]')}>
          Booking
        </span>
      </button>
    </nav>
  );
}

/* ---------- Header oranye untuk layar dalam ---------- */
export function InnerHeader({
  title, onBack, right, height = 147,
}: { title: string; onBack?: () => void; right?: ReactNode; height?: number }) {
  return (
    <div className="absolute inset-x-0 top-0 z-0 bg-orange" style={{ height }}>
      <div className="absolute left-[22px] right-[22px] top-[74px] flex items-center">
        {onBack && (
          <button onClick={onBack} aria-label="Kembali" className="mr-[16px] -ml-[2px] bg-transparent p-0 text-white">
            <ArrowLeftIcon />
          </button>
        )}
        <h1 className="m-0 text-[20px] font-bold leading-[22px] text-white">{title}</h1>
        <div className="ml-auto text-white">{right}</div>
      </div>
    </div>
  );
}

export const ArrowLeftIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M11 5l-7 7 7 7" />
  </svg>
);

export const Divider = ({ className }: { className?: string }) => (
  <div className={cx('h-px bg-[#dcd3bf]', className)} />
);


/* =====================================================================
   Komponen bersama (dipakai semua layar baru)
   ===================================================================== */

/** Layar dalam: header oranye + panel krem yang bisa di-scroll. */
export function Page({
  title, back, right, children, footer, tab,
}: { title: string; back?: () => void; right?: ReactNode; children: ReactNode; footer?: ReactNode; tab?: boolean }) {
  // Tinggi bilah bawah bisa berubah (misalnya muncul pesan), jadi ruang di bawah konten mengikutinya
  const bar = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight));
    ro.observe(el);
    setBarH(el.offsetHeight);
    return () => ro.disconnect();
  }, [!!footer]);
  return (
    <div className="relative flex h-full flex-col bg-orange">
      <header className="relative h-[127px] shrink-0">
        <div className="absolute left-[22px] right-[22px] top-[70px] flex min-h-[30px] items-center">
          {back && (
            <button onClick={back} aria-label="Kembali" className="-ml-[8px] mr-[8px] flex h-[34px] w-[34px] items-center justify-center bg-transparent p-0 text-white">
              <ArrowLeftIcon />
            </button>
          )}
          <h1 className="m-0 truncate text-[20px] font-bold leading-[24px] text-white">{title}</h1>
          <div className="ml-auto flex items-center gap-[6px] pl-[10px] text-white">{right}</div>
        </div>
      </header>
      <div
        className={cx('hide-scrollbar relative flex-1 overflow-y-auto rounded-t-[22px] bg-cream', !footer && (tab ? 'pb-[120px]' : 'pb-[32px]'))}
        style={footer ? { paddingBottom: Math.max(110, barH + 24) } : undefined}
      >
        {children}
      </div>
      {footer && (
        <div ref={bar} className="absolute inset-x-0 bottom-0 z-10 rounded-t-[22px] bg-white px-[22px] pb-[26px] pt-[16px] shadow-[0_-4px_14px_rgba(0,0,0,0.10)]">
          {footer}
        </div>
      )}
    </div>
  );
}

export function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-transparent p-0 text-white active:bg-white/20">
      {children}
    </button>
  );
}

type BtnProps = {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'blue' | 'outline' | 'danger' | 'soft';
  disabled?: boolean; className?: string; type?: 'button' | 'submit'; small?: boolean;
};
export function Btn({ children, onClick, variant = 'primary', disabled, className, type = 'button', small }: BtnProps) {
  const v = {
    primary: 'bg-orange text-white border-orange',
    blue: 'bg-blue text-white border-blue',
    outline: 'bg-white text-orange border-orange',
    danger: 'bg-white text-red border-red',
    soft: 'bg-sand text-brown border-sand',
  }[variant];
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
      className={cx(
        'flex w-full items-center justify-center rounded-[16px] border text-[14px] font-bold transition active:scale-[0.98]',
        small ? 'h-[36px]' : 'h-[48px]', v, disabled && 'cursor-not-allowed opacity-45', className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label, value, onChange, type = 'text', placeholder, error, right, multiline, inputMode, maxLength, autoFocus, auth, icon, suffix,
}: {
  label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string;
  right?: ReactNode; multiline?: boolean; inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal'; maxLength?: number; autoFocus?: boolean;
  /** Gaya form Figma: label oranye, kolom putih tanpa garis */
  auth?: boolean; icon?: ReactNode; suffix?: string;
}) {
  const cls = cx(
    'w-full rounded-[16px] bg-white px-[16px] text-[14px] font-medium text-black outline-none placeholder:font-medium placeholder:text-[#c4c4c4] focus:ring-2 focus:ring-orange/40',
    auth ? 'border border-transparent' : 'border border-black/15 font-semibold',
    error && '!border-red',
  );
  return (
    <label className="block">
      {label && <span className={cx('mb-[8px] block font-bold', auth ? 'text-[14px] text-orange' : 'text-[12px] text-ink')}>{label}</span>}
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-orange">{icon}</span>}
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={4} className={cx(cls, 'resize-none py-[12px] leading-[20px]')} />
        ) : (
          <input
            value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder}
            inputMode={inputMode} maxLength={maxLength} autoFocus={autoFocus}
            className={cx(cls, 'h-[46px]', !!icon && 'pl-[46px]', !!(right || suffix) && 'pr-[48px]')}
          />
        )}
        {suffix && <span className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#b5b5b5]">{suffix}</span>}
        {right && <span className="absolute right-[6px] top-1/2 -translate-y-1/2">{right}</span>}
      </span>
      {error && <span role="alert" className="mt-[6px] block text-[11px] font-semibold text-red">{error}</span>}
    </label>
  );
}

/** Dropdown ala Figma (kolom putih + segitiga abu-abu) yang membuka sheet pilihan. */
export function SelectField({
  label, value, onChange, options, placeholder, error, title,
}: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string; error?: string; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span className="mb-[8px] block text-[14px] font-bold text-orange">{label}</span>
      <button
        type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={value ? `${label}: ${value}` : label}
        className={cx('flex h-[46px] w-full items-center justify-between rounded-[16px] border bg-white px-[16px] text-left text-[14px] font-medium', error ? 'border-red' : 'border-transparent', value ? 'text-black' : 'text-[#c4c4c4]')}
      >
        {value || placeholder}
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M1 1.5h14L8 11z" fill="#a9a9a9" /></svg>
      </button>
      {error && <span role="alert" className="mt-[6px] block text-[11px] font-semibold text-red">{error}</span>}
      <PickSheet open={open} onClose={() => setOpen(false)} title={title ?? label} options={options} value={value} onPick={onChange} />
    </div>
  );
}

/** Dialog di tengah layar (popup). */
export function Modal({ open, onClose, children }: { open: boolean; onClose?: () => void; children: ReactNode }) {
  const root = useOverlay();
  if (!open || !root) return null;
  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-[85] flex items-center justify-center px-[40px]" role="dialog" aria-modal="true">
      <div className="anim-fade absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="anim-toast relative w-full max-w-[300px] rounded-[16px] bg-white px-[22px] pb-[22px] pt-[26px] text-center">{children}</div>
    </div>,
    root,
  );
}

/** Logo Petopia. Pakai /img/logo.png kalau ada, kalau tidak tampil wordmark bawaan. */
export function Wordmark({ size = 44 }: { size?: number }) {
  return (
    <AssetIcon
      src="logo.png"
      className="w-auto max-w-full"
      style={{ height: size * 1.15 }}
      fallback={
        <span className="relative inline-block font-extrabold leading-none tracking-tight text-[#fdb515]" style={{ fontSize: size, textShadow: '0 2px 0 rgba(220,35,30,0.18)' }}>
          Petopia
          <PawLogo className="absolute -right-[0.5em] -top-[0.28em] h-[0.62em] w-[0.62em] rotate-[18deg] text-red" />
        </span>
      }
    />
  );
}

export function Chip({ label, active, onClick, caret }: { label: string; active?: boolean; onClick?: () => void; caret?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'flex h-[34px] shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[17px] border px-[14px] text-[12px] font-bold transition',
        active ? 'border-orange bg-orange text-white' : 'border-black/15 bg-white text-[#777]',
      )}
    >
      {label}{caret}
    </button>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cx('relative h-[28px] w-[48px] shrink-0 rounded-full p-0 transition-colors', on ? 'bg-orange' : 'bg-[#cfc7b4]')}>
      <span className={cx('absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all', on ? 'left-[23px]' : 'left-[3px]')} />
    </button>
  );
}

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="px-[40px] pt-[72px] text-center">
      <Photo className="mx-auto h-[88px] w-[88px] rounded-full" />
      <h2 className="m-0 mt-[22px] text-[16px] font-bold text-ink">{title}</h2>
      <p className="m-0 mt-[8px] text-[13px] font-semibold leading-[20px] text-[#8a8a8a]">{text}</p>
      {action && <div className="mx-auto mt-[24px] w-[220px]">{action}</div>}
    </div>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const base = cx('rounded-[16px] bg-white p-[16px] shadow-[0_3px_8px_rgba(0,0,0,0.12)]', className);
  if (onClick) return <button onClick={onClick} className={cx(base, 'block w-full text-left')}>{children}</button>;
  return <div className={base}>{children}</div>;
}

/** Bottom sheet di dalam bingkai HP. */
export function Sheet({ open, onClose, title, label, children }: { open: boolean; onClose: () => void; title?: string; label?: string; children: ReactNode }) {
  const root = useOverlay();
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open || !root) return null;
  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title ?? label}>
      <div className="anim-fade absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="anim-sheet absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-[26px] bg-white px-[22px] pb-[30px] pt-[10px]">
        <div className="mx-auto mb-[14px] h-[4px] w-[40px] rounded-full bg-[#ddd]" />
        {title && (
          <div className="mb-[16px] flex items-center justify-between">
            <h2 className="m-0 text-[17px] font-bold text-black">{title}</h2>
            <button onClick={onClose} aria-label="Tutup" className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#f2eee2] p-0 text-ink"><X className="h-[16px] w-[16px]" /></button>
          </div>
        )}
        {children}
      </div>
    </div>,
    root,
  );
}

/** Daftar pilihan dalam sheet (radio). */
export function PickSheet<T extends string>({
  open, onClose, title, options, value, onPick,
}: { open: boolean; onClose: () => void; title: string; options: readonly T[]; value: T; onPick: (v: T) => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <ul className="m-0 list-none p-0">
        {options.map((o) => (
          <li key={o}>
            <button onClick={() => { onPick(o); onClose(); }} className="flex h-[52px] w-full items-center justify-between border-b border-[#f0e9d6] bg-transparent p-0 text-left text-[14px] font-semibold text-ink">
              {o}
              {o === value && <Check className="h-[18px] w-[18px] text-orange" strokeWidth={3} />}
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export function Toast({ text }: { text: string }) {
  const root = useOverlay();
  if (!text || !root) return null;
  return createPortal(
    <div className="pointer-events-none absolute inset-x-0 bottom-[104px] z-[90] flex justify-center px-[24px]">
      <div role="status" className="anim-toast max-w-full rounded-[14px] bg-[#2b2b2b] px-[18px] py-[12px] text-center text-[13px] font-semibold leading-[18px] text-white shadow-xl">{text}</div>
    </div>,
    root,
  );
}

export function Row({ icon, label, sub, onClick, right, danger }: { icon?: ReactNode; label: string; sub?: string; onClick?: () => void; right?: ReactNode; danger?: boolean }) {
  const inner = (
    <>
      {icon && <span className={cx('mr-[14px] flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px]', danger ? 'bg-red/10 text-red' : 'bg-sand text-brown')}>{icon}</span>}
      <span className="min-w-0 flex-1 text-left">
        <span className={cx('block text-[14px] font-bold leading-[20px]', danger ? 'text-red' : 'text-ink')}>{label}</span>
        {sub && <span className="block text-[12px] font-semibold leading-[18px] text-[#8a8a8a]">{sub}</span>}
      </span>
      {right}
    </>
  );
  const cls = 'flex min-h-[64px] w-full items-center border-b border-[#eee3c9] bg-transparent px-0 py-[10px]';
  return onClick ? <button onClick={onClick} className={cls}>{inner}</button> : <div className={cls}>{inner}</div>;
}

/**
 * Baris horizontal yang bisa digeser dengan jari, mouse (drag), trackpad, dan shift+roda.
 * Panah kiri/kanan hanya tampil di layar >= sm (bingkai HP di laptop) dan hilang saat sudah di ujung.
 */
export function DragRow({
  children, className, style, arrows, wrapClassName, label, ...rest
}: { children: ReactNode; className?: string; style?: CSSProperties; arrows?: boolean; wrapClassName?: string; label?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useDragScroll<HTMLDivElement>();
  const [edge, setEdge] = useState({ l: false, r: false });
  useEffect(() => {
    const el = ref.current;
    if (!el || !arrows) return;
    const upd = () => setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft < el.scrollWidth - el.clientWidth - 4 });
    upd();
    el.addEventListener('scroll', upd, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(upd) : null;
    ro?.observe(el);
    Array.from(el.children).forEach((c) => ro?.observe(c));
    return () => { el.removeEventListener('scroll', upd); ro?.disconnect(); };
  }, [arrows, ref]);
  const nudge = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * Math.max(200, ref.current.clientWidth * 0.8), behavior: 'smooth' });
  const arrow = 'absolute top-1/2 z-10 hidden h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-full border-0 bg-white p-0 text-orange shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:flex';
  return (
    <div className={cx('relative', wrapClassName)}>
      <div ref={ref} className={className} style={style} {...rest}>{children}</div>
      {arrows && edge.l && <button type="button" aria-label={`Geser ${label ?? 'daftar'} ke kiri`} onClick={() => nudge(-1)} className={cx(arrow, 'left-[6px]')}><ChevronLeft className="h-[22px] w-[22px]" /></button>}
      {arrows && edge.r && <button type="button" aria-label={`Geser ${label ?? 'daftar'} ke kanan`} onClick={() => nudge(1)} className={cx(arrow, 'right-[6px]')}><ChevronRight className="h-[22px] w-[22px]" /></button>}
    </div>
  );
}
