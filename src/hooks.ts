import { useEffect, useRef } from 'react';
import { useNav } from './nav';
import { useApp } from './store';

/** Pindah layar, tapi minta login dulu kalau masih tamu. */
export function useGate() {
  const { s, toast } = useApp();
  const { go } = useNav();
  return (route: string) => {
    if (!s.loggedIn) { toast('Masuk dulu untuk melanjutkan'); go('login:back'); return; }
    go(route);
  };
}

let pendingKey: string | null = null;

/**
 * Jalankan aksi hanya kalau sudah login; kalau belum, arahkan ke Masuk.
 * Dengan `key` + `resume`, aksi dilanjutkan otomatis begitu pengguna kembali dari Masuk.
 */
export function useRequireLogin(key?: string, resume?: () => void) {
  const { s, toast } = useApp();
  const { go } = useNav();
  useEffect(() => {
    if (!key || pendingKey !== key) return;
    pendingKey = null;
    if (s.loggedIn) resume?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (action: () => void) => {
    if (!s.loggedIn) { pendingKey = key ?? null; toast('Masuk dulu untuk melanjutkan'); go('login:back'); return; }
    action();
  };
}

/**
 * Geser baris horizontal dengan mouse (drag), seperti jari di HP. Hanya pointer mouse; touch tetap pakai scroll bawaan.
 * Ada momentum ringan, dan klik setelah menyeret lebih dari 6px dibatalkan supaya kartu tidak ikut terbuka.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('drag-x');
    let raf = 0;
    let down: { x: number; left: number; id: number } | null = null;
    let dragged = false;
    let samples: { t: number; x: number }[] = [];
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const endMomentum = () => { cancelAnimationFrame(raf); el.style.scrollSnapType = ''; el.classList.remove('dragging'); };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth + 1) return;
      endMomentum();
      down = { x: e.clientX, left: el.scrollLeft, id: e.pointerId };
      dragged = false;
      samples = [{ t: performance.now(), x: e.clientX }];
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (!dragged && Math.abs(dx) > 6) {
        dragged = true;
        el.classList.add('dragging');
        el.style.scrollSnapType = 'none';
        window.getSelection()?.removeAllRanges();
      }
      if (!dragged) return;
      e.preventDefault();
      el.scrollLeft = down.left - dx;
      const now = performance.now();
      samples.push({ t: now, x: e.clientX });
      samples = samples.filter((s) => now - s.t < 100);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (!down) return;
      down = null;
      if (!dragged) return;
      const stop = (ev: Event) => { ev.stopPropagation(); ev.preventDefault(); };
      el.addEventListener('click', stop, { capture: true, once: true });
      window.setTimeout(() => el.removeEventListener('click', stop, true), 60);
      const a = samples[0]; const b = samples[samples.length - 1];
      let v = a && b && b.t > a.t ? -(b.x - a.x) / (b.t - a.t) : 0; // px per ms
      if (reduce || Math.abs(v) < 0.1) { endMomentum(); return; }
      let last = performance.now();
      const step = (t: number) => {
        const dt = t - last; last = t;
        el.scrollLeft += v * dt;
        v *= Math.pow(0.94, dt / 16);
        const atEdge = el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
        if (Math.abs(v) < 0.03 || atEdge) { endMomentum(); return; }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const noNativeDrag = (e: Event) => e.preventDefault();

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('dragstart', noNativeDrag);
    return () => {
      endMomentum();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('dragstart', noNativeDrag);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.classList.remove('drag-x');
    };
  }, []);
  return ref;
}
