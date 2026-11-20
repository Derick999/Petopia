import { expect, type BrowserContext, type CDPSession, type Locator, type Page } from '@playwright/test';

export const SHOTS = 'qa/shots';
export const VIEWPORTS = [
  { width: 393, height: 852 },
  { width: 360, height: 740 },
  { width: 430, height: 932 },
];

export type Problem = { where: string; what: string };
export const problems: Problem[] = [];
export const note = (where: string, what: string) => { problems.push({ where, what }); };

/** Konteks mobile (touch) dan pengumpul error console. */
export async function newPhone(browser: import('@playwright/test').Browser, vp = VIEWPORTS[0]) {
  const context = await browser.newContext({
    viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'id-ID', timezoneId: 'Asia/Jakarta',
    permissions: [], baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  const logs: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  return { context, page, logs };
}

const cdpCache = new WeakMap<Page, CDPSession>();
async function cdp(page: Page) {
  let c = cdpCache.get(page);
  if (!c) { c = await (page.context() as BrowserContext).newCDPSession(page); cdpCache.set(page, c); }
  return c;
}

/** Geser dengan jari sungguhan (event touch lewat CDP). dx negatif = geser ke kiri. */
export async function swipe(page: Page, target: Locator, dx: number) {
  const box = await target.boundingBox();
  if (!box) throw new Error('swipe: elemen tidak terlihat');
  const c = await cdp(page);
  const y = box.y + Math.min(box.height / 2, 60);
  const x0 = dx < 0 ? box.x + box.width - 30 : box.x + 30;
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (dx * i) / steps, y }] });
    await page.waitForTimeout(12);
  }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(450);
}

export const phone = (page: Page) => page.locator('#phone');

export async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

export async function resetApp(page: Page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); history.replaceState(null, ''); });
  await page.reload();
}

/** Lompat langsung ke layar tertentu (untuk audit) lewat history.state yang dipakai app. */
export async function gotoRoute(page: Page, stack: string[]) {
  await page.evaluate((st) => history.replaceState({ stack: st }, ''), stack);
  await page.reload();
  await page.waitForTimeout(150);
}

/** Isi state localStorage lalu muat ulang (untuk membuat kondisi khusus). */
export async function patchState(page: Page, fn: (s: any) => void) {
  await page.evaluate((src) => {
    const s = JSON.parse(localStorage.getItem('petopia-state-v2') || '{}');
    // eslint-disable-next-line no-new-func
    new Function('s', src)(s);
    localStorage.setItem('petopia-state-v2', JSON.stringify(s));
  }, `(${fn.toString()})(s)`);
  await page.reload();
}

export async function tab(page: Page, name: 'Awal' | 'Artikel' | 'Booking' | 'Reward' | 'Akun') {
  await page.getByRole('button', { name, exact: true }).click();
}

export async function expectHeading(page: Page, text: string | RegExp) {
  await expect(phone(page).getByRole('heading', { name: text, level: 1 }).first()).toBeVisible();
}

export async function back(page: Page) {
  await phone(page).getByRole('button', { name: 'Kembali', exact: true }).first().click();
}

/** Pilih satu tanggal (bukan hari ini) dan jam pertama yang aktif di JadwalSheet, lalu tekan tombol aksi. */
export async function pickSchedule(page: Page, dayIdx: number, cta: string | RegExp = 'Lanjut') {
  const dlg = page.getByRole('dialog').last();
  await dlg.getByRole('radiogroup', { name: 'Tanggal' }).getByRole('radio').nth(dayIdx).click();
  for (const part of ['Pagi', 'Siang', 'Sore']) {
    const free = dlg.getByRole('radiogroup', { name: part }).locator('button:not([disabled])');
    if (await free.count()) { await free.first().click(); break; }
  }
  await dlg.getByRole('button', { name: cta, exact: typeof cta === 'string' }).click();
}

export async function choose(page: Page, label: string | RegExp) {
  await page.getByRole('dialog').last().getByRole('button', { name: label }).first().click();
}

export const rp = (n: number) => 'Rp. ' + n.toLocaleString('id-ID');

/** Cari masalah tata letak di layar yang sedang tampil. */
export async function audit(page: Page, where: string) {
  const res = await page.evaluate(() => {
    const ph = document.getElementById('phone')!;
    const pr = ph.getBoundingClientRect();
    const out: { over: string[]; small: string[]; hscroll: boolean } = { over: [], small: [], hscroll: false };
    out.hscroll = document.documentElement.scrollWidth > window.innerWidth + 1 || ph.scrollWidth > ph.clientWidth + 1;
    const insideHScroll = (el: Element) => {
      for (let p = el.parentElement; p && p !== ph; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && p.scrollWidth > p.clientWidth) return true;
      }
      return false;
    };
    const label = (el: Element) => {
      const t = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ');
      return t.slice(0, 40);
    };
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    };
    const dlg = Array.from(document.querySelectorAll('[role=dialog]')).pop();
    const scope: Element = dlg ?? ph;
    const clipped = (el: Element) => {
      for (let p = el.parentElement; p && p !== ph; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return true;
      }
      return false;
    };
    scope.querySelectorAll('*').forEach((el) => {
      if (!visible(el) || insideHScroll(el) || clipped(el)) return;
      const r = el.getBoundingClientRect();
      if (r.right > pr.right + 1 || r.left < pr.left - 1) {
        if (el.closest('.sr-only')) return;
        out.over.push(`${el.tagName.toLowerCase()} "${label(el)}" ${Math.round(r.left - pr.left)}..${Math.round(r.right - pr.left)}`);
      }
    });
    // area sentuh efektif = kotak elemen + perluasan tak terlihat (::after) yang terpotong oleh ancestor overflow
    const effective = (el: Element) => {
      if (el instanceof HTMLInputElement && el.type === 'checkbox') return el.closest('label')!.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      let { left, top, right, bottom } = r;
      const ps = getComputedStyle(el, '::after');
      if (ps.content !== 'none' && ps.position === 'absolute') {
        const w = parseFloat(ps.width), h = parseFloat(ps.height);
        if (w > r.width) { left -= (w - r.width) / 2; right += (w - r.width) / 2; }
        if (h > r.height) { top -= (h - r.height) / 2; bottom += (h - r.height) / 2; }
      }
      for (let p = el.parentElement; p; p = p.parentElement) {
        const cs = getComputedStyle(p);
        const hidden = cs.overflowX === 'hidden' || cs.overflowY === 'hidden';
        const hRow = cs.overflowX === 'auto' || cs.overflowX === 'scroll';
        if (hidden || hRow) {
          const pr2 = p.getBoundingClientRect();
          if (hidden) { left = Math.max(left, pr2.left); right = Math.min(right, pr2.right); }
          top = Math.max(top, pr2.top); bottom = Math.min(bottom, pr2.bottom);
        }
        if (p === ph) break;
      }
      return { width: right - left, height: bottom - top };
    };
    scope.querySelectorAll('button, a[href], [role=radio], [role=tab], [role=switch], input:not([type=hidden]), textarea').forEach((el) => {
      if (!visible(el)) return;
      const r = el.getBoundingClientRect();
      if (r.top < pr.top || r.bottom > pr.bottom || r.left < pr.left - 1 || r.right > pr.right + 1) return;
      if (insideHScroll(el) && (r.right > pr.right || r.left < pr.left)) return;
      const eff = effective(el);
      if (eff.height < 43.5 || eff.width < 43.5) out.small.push(`${el.tagName.toLowerCase()} "${label(el)}" ${Math.round(eff.width)}x${Math.round(eff.height)}`);
    });
    return out;
  });
  if (res.hscroll) note(where, 'ada scroll horizontal pada halaman');
  for (const o of res.over.slice(0, 6)) note(where, 'melewati batas layar: ' + o);
  for (const s of res.small) note(where, 'area sentuh < 44px: ' + s);
  return res;
}

/** Gulir ke dasar layar: konten terakhir tidak boleh tertutup navigasi bawah atau bilah tombol. */
export async function auditBottom(page: Page, where: string) {
  const res = await page.evaluate(() => {
    const ph = document.getElementById('phone')!;
    const all = Array.from(ph.querySelectorAll<HTMLElement>('*'));
    const scrollers = all.filter((el) => {
      const cs = getComputedStyle(el);
      return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 200;
    });
    if (!scrollers.length) return null;
    const sc = scrollers.sort((a, b) => b.clientHeight - a.clientHeight)[0];
    sc.scrollTop = sc.scrollHeight;
    const scr = sc.getBoundingClientRect();
    let contentBottom = 0;
    sc.querySelectorAll<HTMLElement>('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.width === 0) return;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.visibility === 'hidden') return;
      if (el.closest('[role=dialog]')) return;
      if (el.children.length > 0 && !(el instanceof HTMLButtonElement)) return;
      if (!(el.textContent || '').trim() && !/^(IMG|SVG|INPUT|TEXTAREA)$/i.test(el.tagName)) return;
      contentBottom = Math.max(contentBottom, r.bottom);
    });
    let obstacle = scr.bottom;
    all.forEach((el) => {
      if (sc.contains(el) || el.contains(sc)) return;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (cs.position === 'absolute' && r.width > ph.clientWidth * 0.9 && r.bottom >= scr.bottom - 1 && r.height > 40 && r.height < 200 && r.top > scr.top + 100) obstacle = Math.min(obstacle, r.top);
    });
    return { contentBottom, obstacle };
  });
  if (res && res.contentBottom > res.obstacle + 1) note(where, `konten terakhir tertutup bilah bawah (${Math.round(res.contentBottom)} > ${Math.round(res.obstacle)})`);
}

/** Konteks laptop: mouse biasa, tanpa touch. */
export async function newDesktop(browser: import('@playwright/test').Browser, vp = { width: 1280, height: 800 }) {
  const context = await browser.newContext({ viewport: vp, locale: 'id-ID', timezoneId: 'Asia/Jakarta', baseURL: 'http://127.0.0.1:4173' });
  const page = await context.newPage();
  const logs: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  return { context, page, logs };
}

/** Seret dengan mouse: tekan, gerak bertahap, lepas. */
export async function mouseDrag(page: Page, from: { x: number; y: number }, dx: number, steps = 14) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) { await page.mouse.move(from.x + (dx * i) / steps, from.y); await page.waitForTimeout(8); }
  await page.mouse.up();
}
