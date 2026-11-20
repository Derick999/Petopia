import { expect, test, type Page } from '@playwright/test';
import {
  VIEWPORTS, audit, auditBottom, back, choose, expectHeading, gotoRoute, mouseDrag, newDesktop, newPhone, note, patchState, phone, pickSchedule, problems, resetApp, rp, shot, swipe, tab,
} from './helpers';
import fs from 'node:fs';

let page: Page;
let logs: string[] = [];
const P = () => phone(page);
const btn = (name: string | RegExp, exact = true) => P().getByRole('button', { name, exact });
const toastIs = async (t: string | RegExp) => expect(P().getByRole('status').filter({ hasText: t })).toBeVisible();
const pointsNow = async () => Number((await P().locator('div.text-orange', { hasText: /^\d+$/ }).first().textContent())!.trim());

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  const r = await newPhone(browser);
  page = r.page; logs = r.logs;
  fs.mkdirSync('qa/shots', { recursive: true });
});
test.afterAll(async () => {
  fs.writeFileSync('qa/problems.json', JSON.stringify({ problems, logs }, null, 2));
  await page.context().close();
});

/* =====================================================================
   A. Pengguna baru
   ===================================================================== */
test('A1 splash, onboarding (geser + titik), Welcome', async () => {
  await resetApp(page);
  await shot(page, 'A1-splash');
  await expect(btn('Lanjut')).toBeVisible();
  // splash hilang otomatis
  await expect(btn('Mulai Sekarang')).toBeVisible({ timeout: 5000 });
  await expect(P().getByRole('heading', { name: 'Selamat datang di Petopia!' })).toBeVisible();
  const track = P().locator('.snap-x');
  await swipe(page, track, -250);
  await expect(P().getByRole('tab', { name: 'Slide 2' })).toHaveAttribute('aria-selected', 'true');
  await P().getByRole('tab', { name: 'Slide 3' }).click();
  await expect(P().getByRole('tab', { name: 'Slide 3' })).toHaveAttribute('aria-selected', 'true');
  await expect(P().getByRole('heading', { name: 'Solusi lengkap hewan peliharaan' })).toBeInViewport();
  await shot(page, 'A1-onboarding3');
  await audit(page, 'A1 onboarding');
  await btn('Mulai Sekarang').click();
  await expect(btn('Masuk')).toBeVisible();
  await expect(btn('Buat Akun')).toBeVisible();
  await shot(page, 'A1-welcome');
  await audit(page, 'A1 welcome');
});

test('A2 Buat Akun: validasi, referral, popup, daftar hewan', async () => {
  await btn('Buat Akun').click();
  await btn('Buat Akun', true).last().click(); // submit kosong
  await expect(P().getByRole('alert')).toHaveCount(5);
  await expect(P().getByText('Nama lengkap wajib diisi')).toBeVisible();
  await shot(page, 'A2-register-errors');
  await P().getByPlaceholder('Masukkan Nama Lengkap').fill('Budi Santoso');
  await P().getByPlaceholder('Masukkan Username').fill('budi_s');
  await P().getByPlaceholder('Masukkan Email').fill('budi@@mail');
  await P().getByPlaceholder('Masukkan Password').fill('123');
  await P().getByPlaceholder('Konfirmasi Password').fill('124');
  await P().getByPlaceholder('Masukkan Kode Referral').fill('SALAH99');
  await btn('Buat Akun', true).last().click();
  await expect(P().getByText('Format email belum benar')).toBeVisible();
  await expect(P().getByText('Password minimal 6 karakter')).toBeVisible();
  await expect(P().getByText('Konfirmasi password tidak sama')).toBeVisible();
  await expect(P().getByText('Kode referral tidak ditemukan')).toBeVisible();
  await P().getByPlaceholder('Masukkan Email').fill('budi@mail.com');
  await P().getByPlaceholder('Masukkan Password').fill('rahasia1');
  await P().getByPlaceholder('Konfirmasi Password').fill('rahasia1');
  await P().getByPlaceholder('Masukkan Kode Referral').fill('petopia25');
  await btn('Buat Akun', true).last().click();
  await expect(P().getByRole('heading', { name: 'Pembuatan Akun Berhasil' })).toBeVisible();
  await shot(page, 'A2-register-popup');
  await btn('Ya').click();
  // Daftarkan hewan
  await btn('Simpan Profil').click();
  await expect(P().getByRole('alert')).toHaveCount(3);
  await P().getByRole('button', { name: /Pilih Jenis Hewan/ }).click();
  await choose(page, 'Kucing');
  await P().getByRole('button', { name: /Jenis Kelamin Hewan/ }).click();
  await choose(page, 'Jantan');
  await P().getByPlaceholder('Masukkan Nama Hewan').fill('Mochi');
  await P().getByPlaceholder('Masukkan Umur').fill('abc');
  await btn('Simpan Profil').click();
  await expect(P().getByText('Isi dengan angka, contoh: 2')).toBeVisible();
  await P().getByPlaceholder('Masukkan Umur').fill('2');
  await P().getByPlaceholder('Masukkan Berat Hewan').fill('4,5');
  await shot(page, 'A2-regpet');
  await audit(page, 'A2 regpet');
  await btn('Simpan Profil').click();
  await expect(P().getByText('Halo, Budi')).toBeVisible();
  await toastIs('Mochi berhasil ditambahkan');
});

test('A3 Home: coachmark tampil, tidak menutupi, bisa dilewati, tidak muncul lagi', async () => {
  const dlg = page.getByRole('dialog', { name: 'Tutorial singkat' });
  await expect(dlg).toBeVisible();
  await shot(page, 'A3-coachmark');
  const tips = await dlg.locator('div.shadow-xl').all();
  expect(tips.length).toBeGreaterThan(0);
  const phoneBox = (await P().boundingBox())!;
  const boxes = [];
  for (const t of tips) {
    const b = (await t.boundingBox())!;
    boxes.push(b);
    expect(b.x).toBeGreaterThanOrEqual(phoneBox.x);
    expect(b.x + b.width).toBeLessThanOrEqual(phoneBox.x + phoneBox.width);
  }
  if (boxes.length === 2) {
    const [a, b] = boxes;
    expect(a.y + a.height).toBeLessThan(b.y);
  }
  // tombol Lainnya & Booking tetap terlihat (di atas overlay gelap, tidak tertutup tooltip)
  for (const sel of ['[data-coach="lainnya"]', '[data-coach="booking"]']) {
    const r = (await page.locator(sel).boundingBox())!;
    for (const b of boxes) {
      const overlap = r.x < b.x + b.width && r.x + r.width > b.x && r.y < b.y + b.height && r.y + r.height > b.y;
      expect(overlap, `tooltip menutupi ${sel}`).toBeFalsy();
    }
  }
  await dlg.getByRole('button', { name: /Lewat|Lanjut/ }).first().click();
  if (await dlg.isVisible()) await dlg.getByRole('button', { name: /Lewat/ }).first().click();
  await expect(dlg).toBeHidden();
  await page.reload();
  await expect(P().getByText('Halo, Budi')).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Tutorial singkat' })).toHaveCount(0);
  await shot(page, 'A3-home');
});

/* =====================================================================
   B. Home
   ===================================================================== */
test('B4 pencarian, lokasi, headset, chat, notifikasi', async () => {
  await btn('Cari').click();
  await expectHeading(page, 'Pencarian');
  await P().getByLabel('Cari', { exact: true }).fill('kucing');
  await expect(P().getByText('5 Cara Merawat Kucing Anakan agar Sehat dan Aktif')).toBeVisible();
  await P().getByLabel('Cari', { exact: true }).fill('zzzz');
  await expect(P().getByText('Tidak ada hasil')).toBeVisible();
  await P().getByLabel('Cari', { exact: true }).fill('');
  await btn('Vaksinasi kucing').click();
  await expect(P().getByRole('textbox')).toHaveValue('Vaksinasi kucing');
  await back(page);

  await btn(/^Lokasi:/, false).click();
  await expectHeading(page, 'Pilih Lokasi');
  await P().getByLabel('Cari lokasi').fill('pademangan');
  await btn('Pademangan').click();
  await toastIs('Lokasi diatur ke Pademangan');
  await expect(btn('Lokasi: Pademangan')).toBeVisible();
  await btn(/^Lokasi:/, false).click();
  await btn(/Rumah/, false).click();
  await expect(btn('Lokasi: Rumah')).toBeVisible();
  // deteksi lokasi: izin ditolak -> pesan jelas
  await btn(/^Lokasi:/, false).click();
  await btn(/Gunakan lokasi saat ini/, false).click();
  await expect(P().getByRole('status').filter({ hasText: /Izin lokasi ditolak|Lokasi diatur/ })).toBeVisible({ timeout: 10000 });
  await back(page);

  await btn('Pusat bantuan').click();
  await expectHeading(page, 'Pusat Bantuan');
  await P().getByRole('button', { name: /Apakah janji bisa dibatalkan/ }).click();
  await expect(P().getByText(/Pembatalan maksimal 2 jam/).first()).toBeVisible();
  await btn('Hubungi Customer Service').click();
  await P().getByLabel('Tulis pesan').fill('Bagaimana cara bayar?');
  await btn('Kirim').click();
  await expect(P().getByText(/cek rincian di tab Booking/)).toBeVisible({ timeout: 4000 });
  await back(page);
  await back(page);

  await btn('Chat').click();
  await expect(P().getByText('Customer Service Petopia')).toBeVisible();
  await back(page);
  await btn(/^Notifikasi/, false).click();
  await expectHeading(page, 'Notifikasi');
  await btn('Tandai dibaca').click();
  await back(page);
  await expect(btn('Notifikasi', true)).toBeVisible();
});

test('B5 carousel bisa digeser, snap, kartu terakhir tidak terpotong, kartu bisa diklik', async () => {
  const rec = P().locator('.h-scroll').first();
  const before = await rec.evaluate((e) => e.scrollLeft);
  await swipe(page, rec, -260);
  const after = await rec.evaluate((e) => e.scrollLeft);
  expect(after).toBeGreaterThan(before + 50);
  for (let i = 0; i < 3; i++) await swipe(page, rec, -600);
  const m = await rec.evaluate((e) => {
    const last = e.children[e.children.length - 1] as HTMLElement;
    const kids = Array.from(e.children).filter((c) => (c as HTMLElement).offsetWidth > 20) as HTMLElement[];
    const lastReal = kids[kids.length - 1];
    const er = e.getBoundingClientRect(); const lr = lastReal.getBoundingClientRect();
    return { max: e.scrollWidth - e.clientWidth, left: e.scrollLeft, gap: er.right - lr.right, tag: last.tagName };
  });
  expect(m.left).toBeGreaterThanOrEqual(m.max - 2);
  expect(m.gap, 'kartu terakhir harus punya jarak ke tepi kanan').toBeGreaterThanOrEqual(12);
  await shot(page, 'B5-carousel-end');
  await btn('Penitipan Hewan Diskon 20%').click();
  await expect(P().getByRole('dialog', { name: 'Penitipan Hewan Diskon 20%' })).toBeVisible();
  await btn('Cari penitipan').click();
  await expectHeading(page, 'Penitipan Hewan');
  await back(page);
  await swipe(page, rec, 900);
  await btn('Promo Vaksinasi Hewan 50%').click();
  await btn('Cari klinik vaksinasi').click();
  await expectHeading(page, 'Vaksinasi');
  await back(page);

  const recent = P().locator('.h-scroll').nth(1);
  await recent.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  for (let i = 0; i < 4; i++) await swipe(page, recent, -500);
  const gap = await recent.evaluate((e) => {
    const kids = Array.from(e.children).filter((c) => (c as HTMLElement).offsetWidth > 20);
    return e.getBoundingClientRect().right - kids[kids.length - 1].getBoundingClientRect().right;
  });
  expect(gap).toBeGreaterThanOrEqual(12);
  await btn('Buat Janji Temu').last().click();
  await expect(btn('Jadwalkan')).toBeVisible();
  await back(page);
  await btn('Lihat Semua').click();
  await expectHeading(page, 'Konsultasi');
  await back(page);
});

test('B6 menu Lainnya: semua tile membuka daftar yang benar', async () => {
  const tiles: [string, string | RegExp][] = [
    ['Klinik Hewan', 'Klinik Hewan'], ['Konsultasi Hewan', 'Konsultasi'], ['Grooming', 'Grooming'], ['Vaksinasi', 'Vaksinasi'],
    ['Penitipan Hewan', 'Penitipan Hewan'], ['Trainer', 'Trainer'], ['Adopt Me', 'Adopt Me'], ['Artikel', 'Artikel'],
  ];
  for (const [tile, title] of tiles) {
    await btn('Lainnya').click();
    await expectHeading(page, 'Semua Layanan');
    if (tile === 'Klinik Hewan') await shot(page, 'B6-lainnya');
    await P().getByRole('button', { name: tile, exact: true }).click();
    await expectHeading(page, title);
    if (tile !== 'Artikel') await back(page);
    if (tile !== 'Artikel') await back(page);
  }
  await expect(btn('Awal')).toHaveAttribute('aria-current', 'page').catch(() => undefined);
  await tab(page, 'Awal');
});

/* =====================================================================
   C. Booking sampai bayar
   ===================================================================== */
const goHome = async () => {
  for (let i = 0; i < 6 && !(await btn('Awal').isVisible()); i++) await back(page);
  await tab(page, 'Awal'); await expect(P().getByText(/^Halo, /)).toBeVisible(); };
const openList = async (name: 'Klinik Hewan' | 'Konsultasi Hewan' | 'Grooming' | 'Vaksinasi' | 'Penitipan Hewan' | 'Trainer', title: string) => {
  await goHome();
  if (['Klinik Hewan', 'Konsultasi Hewan', 'Grooming'].includes(name)) await btn(name).click();
  else { await btn('Lainnya').click(); await btn(name).click(); }
  await expectHeading(page, title);
};
const rowOf = (text: string | RegExp) => P().getByRole('button', { name: text }).first();
const feedbackMs = (target: ReturnType<typeof btn>) => target.evaluate((el) => new Promise<number>((resolve) => {
  const ph = document.getElementById('phone')!;
  let t0 = 0;
  const mo = new MutationObserver(() => { mo.disconnect(); resolve(performance.now() - t0); });
  mo.observe(ph, { childList: true, subtree: true, attributes: true, characterData: true });
  el.addEventListener('click', () => { t0 = performance.now(); }, { capture: true, once: true });
  (el as HTMLElement).click();
  setTimeout(() => { mo.disconnect(); resolve(9999); }, 2000);
}));
const totalIs = (n: number) => expect(P().getByText('Total bayar').locator('xpath=following-sibling::div')).toHaveText(rp(n));

async function payFlow(opts: {
  list: Parameters<typeof openList>[0]; title: string; row: string | RegExp; service?: string; voucher?: RegExp | 'none'; pay?: string; day: number;
}) {
  await openList(opts.list, opts.title);
  await rowOf(opts.row).click();
  await btn('Jadwalkan').click();
  await pickSchedule(page, opts.day);
  await expectHeading(page, 'Pembayaran');
  if (opts.service) {
    await expect(btn('Bayar Sekarang')).toHaveAttribute('aria-disabled', 'true');
    await P().getByRole('button', { name: /Pilih layanan/ }).click();
    await choose(page, new RegExp('^' + opts.service));
  }
  if (opts.voucher && opts.voucher !== 'none') {
    await P().getByRole('button', { name: /Pilih voucher/ }).click();
    await choose(page, opts.voucher);
  }
  await expect(btn('Bayar Sekarang')).toHaveAttribute('aria-disabled', 'true');
  await P().getByRole('radio', { name: new RegExp(opts.pay ?? 'GoPay') }).click();
  await expect(btn('Bayar Sekarang')).not.toHaveAttribute('aria-disabled', 'true');
}

test('C7 Klinik Hewan: filter dan empty state', async () => {
  await openList('Klinik Hewan', 'Klinik Hewan');
  await expect(P().getByText('4 hasil')).toBeVisible();
  await shot(page, 'C7-klinik-list');
  await audit(page, 'C7 list klinik');
  await btn('Terdekat').click();
  await expect(btn('Terdekat')).toHaveAttribute('aria-pressed', 'true');
  await P().getByRole('button', { name: /Jam Operasional/ }).click();
  await choose(page, 'Buka 24 jam');
  await expect(P().getByText('2 hasil')).toBeVisible();
  await P().getByRole('button', { name: /Rating Klinik/ }).click();
  await choose(page, '4.5 ke atas');
  await expect(P().getByText('1 hasil')).toBeVisible();
  await P().getByRole('button', { name: /Jenis Hewan/ }).click();
  await choose(page, 'Burung');
  await expect(P().getByText('Tidak ada hasil')).toBeVisible();
  await shot(page, 'C7-empty');
  await btn('Hapus filter').click();
  await expect(P().getByText('4 hasil')).toBeVisible();
  await btn('Atur ulang filter').click();
  await btn('Cari').click();
  await P().getByLabel('Cari', { exact: true }).fill('petovet');
  await expect(P().getByText('1 hasil')).toBeVisible();
  await btn('Tutup pencarian').click();
  await expect(P().getByText('4 hasil')).toBeVisible();
});

test('C8-C9 detail klinik, jadwal, pembayaran dengan voucher, sukses', async () => {
  await rowOf(/Klinik Medisani - Mangga Besar/).click();
  await shot(page, 'C8-klinik-detail');
  expect(await feedbackMs(btn('Simpan klinik'))).toBeLessThan(300);
  await toastIs('Klinik disimpan');
  await expect(btn('Hapus dari tersimpan')).toHaveAttribute('aria-pressed', 'true');
  await P().getByRole('tab', { name: 'fasilitas' }).click();
  await expect(P().getByText('Ruang rawat inap ber-AC')).toBeVisible();
  await P().getByRole('tab', { name: 'layanan' }).click();
  await btn('Jadwalkan').click();
  const dlg = page.getByRole('dialog', { name: 'Pilih Tanggal & Waktu Kunjungan' });
  await expect(dlg).toBeVisible();
  await shot(page, 'C8-jadwal');
  await audit(page, 'C8 jadwal sheet');
  await expect(dlg.getByRole('button', { name: 'Lanjut' })).toHaveAttribute('aria-disabled', 'true');
  const hour = await page.evaluate(() => new Date().getHours());
  const todaySlot8 = dlg.getByRole('radiogroup', { name: 'Pagi' }).getByRole('radio', { name: '08:00' });
  if (hour >= 8) await expect(todaySlot8).toBeDisabled();
  let anyDisabled = 0;
  const chips = dlg.getByRole('radiogroup', { name: 'Tanggal' }).getByRole('radio');
  for (let i = 0; i < 14; i++) {
    await chips.nth(i).click();
    anyDisabled += await dlg.locator('[role=radiogroup] button[disabled]').count();
  }
  expect(anyDisabled).toBeGreaterThan(0);
  // kalender bulanan buatan sendiri
  const info = await page.evaluate(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return { label: d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), diff: (d.getFullYear() * 12 + d.getMonth()) - (new Date().getFullYear() * 12 + new Date().getMonth()), day: d.getDate() };
  });
  await chips.nth(0).click();
  await dlg.getByRole('button', { name: 'Pilih tanggal dari kalender' }).click();
  const calDlg = page.getByRole('dialog', { name: 'Pilih Tanggal', exact: true });
  await expect(calDlg).toBeVisible();
  await page.waitForTimeout(450);
  await shot(page, 'C8-kalender');
  await audit(page, 'C8 kalender');
  await expect(calDlg.getByRole('button', { name: 'Bulan sebelumnya' })).toBeDisabled();
  for (let i = 0; i < info.diff; i++) await calDlg.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await calDlg.getByRole('button', { name: info.label }).click();
  await expect(calDlg).toBeHidden();
  await expect(dlg).toBeVisible();
  const first = dlg.getByRole('radiogroup', { name: 'Tanggal' }).getByRole('radio').first();
  await expect(first).toHaveAttribute('aria-checked', 'true');
  await expect(first).toContainText(String(info.day));
  await expect(dlg.getByText(info.label)).toBeVisible();
  // batas 90 hari: tanggal di luar batas nonaktif, panah berikutnya mati di bulan terakhir
  await dlg.getByRole('button', { name: 'Pilih tanggal dari kalender' }).click();
  for (let i = 0; i < 4; i++) { const n = calDlg.getByRole('button', { name: 'Bulan berikutnya' }); if (await n.isEnabled()) await n.click(); }
  await expect(calDlg.getByRole('button', { name: 'Bulan berikutnya' })).toBeDisabled();
  await calDlg.getByRole('button', { name: 'Tutup' }).click();
  await expect(calDlg).toBeHidden();
  await pickSchedule(page, 3);

  await expectHeading(page, 'Pembayaran');
  await shot(page, 'C9-bayar-awal');
  await audit(page, 'C9 bayar');
  await expect(P().getByText('Pilih layanan dulu')).toBeVisible();
  await expect(btn('Bayar Sekarang')).toHaveAttribute('aria-disabled', 'true');
  await P().getByRole('button', { name: /Pilih layanan/ }).click();
  await choose(page, /^Konsultasi dokter hewan/);
  await P().getByRole('button', { name: /Pilih voucher/ }).click();
  await expect(page.getByRole('dialog').last().getByRole('button', { name: /Welcome Voucher/ })).toBeDisabled();
  await page.getByRole('dialog').last().getByRole('button', { name: 'Tutup' }).click();
  await P().getByRole('button', { name: /^Konsultasi dokter hewan/ }).click();
  await choose(page, /^Grooming & mandi/);
  await P().getByRole('button', { name: /Pilih voucher/ }).click();
  await choose(page, /Welcome Voucher/);
  await expect(P().getByText('Hemat Rp. 20.000').first()).toBeVisible();
  await P().getByRole('radio', { name: /GoPay/ }).click();
  const total = 90000 - 20000 + 2000;
  await totalIs(total);
  await expect(P().getByText('Diskon voucher').locator('xpath=following-sibling::span')).toHaveText('- ' + rp(20000));
  await expect(P().getByText(`Kamu akan mendapat ${total / 1000} poin`)).toBeVisible();
  await shot(page, 'C9-bayar-lengkap');
  await btn('Bayar Sekarang').click();
  await expect(P().getByText('Memproses…')).toBeVisible();
  await expect(P().getByRole('heading', { name: 'Pembayaran berhasil' })).toBeVisible();
  await expect(P().getByText(/^PTP-\d{4}-\d{4}$/)).toBeVisible();
  await shot(page, 'C9-sukses');
  await btn('Lihat Janji Saya').click();
  await expectHeading(page, 'Jadwal Janji Temu');
  await expect(P().getByText('Klinik Medisani - Mangga Besar')).toBeVisible();
  await shot(page, 'C10-booking-list');
});

test('C10 detail janji: ubah jadwal, batalkan (alasan wajib), selesai -> ulasan -> pesan lagi', async () => {
  await btn('Lihat Detail').first().click();
  await expectHeading(page, 'Detail Janji');
  await btn('Ubah Jadwal').click();
  await pickSchedule(page, 6, 'Simpan');
  await toastIs('Jadwal berhasil diubah');
  await btn('Batalkan').click();
  await expect(P().getByRole('button', { name: 'Ya, batalkan' })).toHaveAttribute('aria-disabled', 'true');
  await P().getByRole('button', { name: 'Ya, batalkan' }).click({ force: true });
  await expect(P().getByRole('dialog', { name: 'Batalkan janji?' })).toBeVisible();
  await P().getByRole('button', { name: 'Jadwal bentrok' }).click();
  await P().getByRole('button', { name: 'Ya, batalkan' }).click();
  await toastIs('Janji dibatalkan');
  await expect(P().getByText('Alasan pembatalan')).toBeVisible();
  await shot(page, 'C10-dibatalkan');
  await expect(btn('Buat Janji Baru')).toBeVisible();
  await back(page);
  await P().getByRole('button', { name: 'Dibatalkan', exact: true }).click();
  await expect(P().getByText('Dibatalkan', { exact: true }).nth(1)).toBeVisible();

  // janji yang waktunya sudah lewat harus tampil Selesai
  await patchState(page, (s) => {
    s.bookings.unshift({ id: 'bx1', kind: 'klinik', place: 'Klinik Medisani - Mangga Besar', who: 'Klinik hewan', service: 'Konsultasi dokter hewan', cat: 'konsultasi', date: '2026-10-01', time: '09:00', price: 77000, discount: 0, pet: 'Mochi', pay: 'GoPay', status: 'Terjadwal', km: '1.2km', code: 'PTP-2026-9001', ref: 'klinik:medisani' });
  });
  await tab(page, 'Booking');
  await P().getByRole('button', { name: 'Selesai', exact: true }).click();
  await expect(P().getByText('Klinik Medisani - Mangga Besar')).toBeVisible();
  await btn('Lihat Detail').first().click();
  await expect(P().getByText('Selesai', { exact: true }).first()).toBeVisible();
  await btn('Beri Ulasan').click();
  await P().getByRole('radio', { name: '4 bintang' }).click();
  await btn('Kirim ulasan').click();
  await toastIs('Terima kasih atas ulasanmu!');
  await btn('Pesan Lagi').click();
  await expect(btn('Jadwalkan')).toBeVisible();
  await shot(page, 'C10-pesan-lagi');
});

test('C11a Konsultasi dokter: detail, tab, chat, bayar', async () => {
  await openList('Konsultasi Hewan', 'Konsultasi');
  await shot(page, 'C11-konsultasi-list');
  await P().getByRole('button', { name: /Jenis Hewan/ }).click();
  await choose(page, 'Burung');
  await expect(P().getByText('1 hasil')).toBeVisible();
  await btn('Burung').click();
  await choose(page, 'Semua');
  await expect(P().getByText('5 hasil')).toBeVisible();
  await rowOf(/Drh\. Anika Yustika/).click();
  for (const [t, text] of [['Pengalaman', /tahun praktik/], ['Pendidikan', /IPB University/], ['Tentang', /berfokus pada kesehatan umum/]] as const) {
    await P().getByRole('tab', { name: t }).click();
    await expect(P().getByText(text).first()).toBeVisible();
  }
  expect(await feedbackMs(btn('Simpan'))).toBeLessThan(300);
  await btn('Chat Drh. Anika Yustika').click();
  await P().getByLabel('Tulis pesan').fill('Kucing saya lesu');
  await btn('Kirim').click();
  await expect(P().getByText('Kucing saya lesu')).toBeVisible();
  await expect(P().getByText(/Terima kasih sudah bercerita/)).toBeVisible({ timeout: 4000 });
  await shot(page, 'C11-chat-dokter');
  await back(page);
  await btn('Jadwalkan').click();
  await pickSchedule(page, 4);
  await expect(P().getByText('Konsultasi dokter hewan').first()).toBeVisible();
  await P().getByRole('radio', { name: /Bayar di Klinik/ }).click();
  await totalIs(27000);
  await btn('Bayar Sekarang').click();
  await expect(P().getByRole('heading', { name: 'Pembayaran berhasil' })).toBeVisible();
  await btn('Kembali ke Beranda').click();
});

for (const f of [
  { id: 'C11b', list: 'Grooming', title: 'Grooming', row: /Happy Pets - Kemayoran/, service: 'Grooming & mandi', total: 92000, day: 5 },
  { id: 'C11c', list: 'Vaksinasi', title: 'Vaksinasi', row: /Klinik Howla - Petamburan/, service: 'Vaksinasi lengkap', total: 152000, day: 6 },
  { id: 'C11d', list: 'Penitipan Hewan', title: 'Penitipan Hewan', row: /Klinik Medisani - Mangga Besar/, service: 'Penitipan per hari', total: 122000, day: 7 },
] as const) {
  test(`${f.id} ${f.list}: pilih tempat, jadwal, bayar`, async () => {
    await payFlow({ list: f.list, title: f.title, row: f.row, service: f.service, voucher: 'none', pay: 'OVO', day: f.day });
    await totalIs(f.total);
    await btn('Bayar Sekarang').click();
    await expect(P().getByRole('heading', { name: 'Pembayaran berhasil' })).toBeVisible();
    await btn('Kembali ke Beranda').click();
  });
}

test('C11e Trainer: detail dan bayar', async () => {
  await payFlow({ list: 'Trainer', title: 'Trainer', row: /Agus Sunarto/, voucher: 'none', pay: 'DANA', day: 8 });
  await expect(P().getByText('Sesi latihan hewan').first()).toBeVisible();
  await totalIs(37000);
  await btn('Bayar Sekarang').click();
  await expect(P().getByRole('heading', { name: 'Pembayaran berhasil' })).toBeVisible();
  await btn('Lihat Janji Saya').click();
  await expect(P().getByText('Agus Sunarto')).toBeVisible();
});

/* =====================================================================
   D. Reward
   ===================================================================== */
const poin = async () => Number((await P().getByText('Poin kamu').locator('xpath=following-sibling::div').textContent())!.trim());
const promo = async (code: string) => { await P().getByLabel('Kode promo').fill(code); await btn('Gunakan').click(); };

test('D12-D13 kode promo, tukar poin, voucher saya, riwayat, pakai voucher', async () => {
  await patchState(page, (s) => { s.points = 150; });
  await tab(page, 'Reward');
  await expectHeading(page, 'Reward');
  await shot(page, 'D12-reward');
  await audit(page, 'D12 reward');
  expect(await poin()).toBe(150);
  // poin kurang
  await P().getByRole('button', { name: /Voucher Layanan Grooming Rp 10\.000/ }).click();
  await expectHeading(page, 'Detail Reward');
  await expect(btn('Tukar Poin (200)')).toHaveAttribute('aria-disabled', 'true');
  await expect(P().getByText('Poin kamu kurang 50')).toBeVisible();
  await shot(page, 'D13-poin-kurang');
  await back(page);

  // kode promo
  await btn('Gunakan').click();
  await expect(P().getByText('Masukkan kode promo dulu')).toBeVisible();
  await promo('NGAWUR');
  await expect(P().getByText(/Kode tidak ditemukan/)).toBeVisible();
  await promo('petopia25'); // sudah dipakai sebagai referral saat daftar
  await expect(P().getByText('Kode ini sudah pernah kamu pakai')).toBeVisible();
  await promo('SAYANGHEWAN');
  await toastIs('Kamu mendapat 100 poin.');
  expect(await poin()).toBe(250);
  await promo('SAYANGHEWAN');
  await expect(P().getByText('Kode ini sudah pernah kamu pakai')).toBeVisible();
  expect(await poin()).toBe(250);
  await promo('PETOPIA250');
  expect(await poin()).toBe(500);

  // tukar poin
  await P().getByRole('button', { name: /Voucher Layanan Grooming Rp 10\.000/ }).click();
  await btn('Tukar Poin (200)').click();
  await expect(P().getByRole('dialog', { name: 'Tukar poin?' })).toBeVisible();
  await expect(P().getByText('Sisa poinmu 300')).toBeVisible();
  await btn('Ya, tukar').click();
  await toastIs('Voucher berhasil ditukar');
  await btn('Lihat Voucher Saya').click();
  await expect(P().getByRole('button', { name: /Voucher Layanan Grooming Rp 10\.000/ }).first()).toBeVisible();
  expect(await poin()).toBe(300);
  // detail voucher
  await P().getByRole('button', { name: /Berlaku hingga/ }).first().click();
  await expectHeading(page, 'Detail Voucher');
  await expect(P().getByText(/^\d+:\d\d:\d\d$/)).toBeVisible();
  await shot(page, 'D13-voucher-detail');
  await back(page);

  // riwayat
  await btn('Riwayat').click();
  await expect(P().getByText('Kode promo SAYANGHEWAN')).toBeVisible();
  await btn('Point Terpakai').click();
  await expect(P().getByText('-200')).toBeVisible();
  await shot(page, 'D13-riwayat-terpakai');
  await back(page);

  // pakai voucher di halaman bayar
  await payFlow({ list: 'Grooming', title: 'Grooming', row: /Animals Grooming - Kedoya Utara/, service: 'Grooming & mandi', voucher: /Voucher Layanan Grooming/, pay: 'GoPay', day: 9 });
  await expect(P().getByText('Diskon voucher').locator('xpath=following-sibling::span')).toHaveText('- ' + rp(10000));
  await totalIs(82000);
  await btn('Bayar Sekarang').click();
  await expect(P().getByRole('heading', { name: 'Pembayaran berhasil' })).toBeVisible();
  await btn('Kembali ke Beranda').click();
  await tab(page, 'Reward');
  expect(await poin()).toBe(300 + 82);
  await expect(P().getByText('Belum ada voucher. Tukar poin di bawah.')).toBeVisible();
});

/* =====================================================================
   E. Artikel & Adopsi
   ===================================================================== */
test('E14 Artikel: carousel, filter, cari, simpan, baca, bagikan, artikel lainnya', async () => {
  await tab(page, 'Artikel');
  await shot(page, 'E14-artikel');
  await audit(page, 'E14 artikel');
  const feat = P().locator('.h-scroll').first();
  const l0 = await feat.evaluate((e) => e.scrollLeft);
  await swipe(page, feat, -250);
  expect(await feat.evaluate((e) => e.scrollLeft)).toBeGreaterThan(l0 + 50);
  for (let i = 0; i < 3; i++) await swipe(page, feat, -600);
  const gap = await feat.evaluate((e) => {
    const kids = Array.from(e.children).filter((c) => (c as HTMLElement).offsetWidth > 20);
    return e.getBoundingClientRect().right - kids[kids.length - 1].getBoundingClientRect().right;
  });
  expect(gap).toBeGreaterThanOrEqual(12);
  await P().getByRole('button', { name: 'Perawatan Burung', exact: true }).click();
  await expect(P().getByRole('button', { name: /menit baca/ })).toHaveCount(2);
  await P().getByRole('button', { name: 'Semua', exact: true }).click();
  await P().getByLabel('Cari artikel').fill('anjing');
  await expect(P().getByRole('button', { name: /menit baca/ })).toHaveCount(2);
  await P().getByLabel('Cari artikel').fill('zzzz');
  await expect(P().getByText('Artikel tidak ditemukan')).toBeVisible();
  await P().getByLabel('Cari artikel').fill('');
  await P().getByRole('button', { name: 'Tersimpan', exact: true }).click();
  await expect(P().getByText('Belum ada artikel tersimpan')).toBeVisible();
  await P().getByRole('button', { name: 'Semua', exact: true }).click();
  await P().getByRole('button', { name: 'Simpan artikel' }).first().click();
  await toastIs('Artikel disimpan');
  await P().getByRole('button', { name: 'Tersimpan', exact: true }).click();
  await expect(P().getByRole('button', { name: /menit baca/ })).toHaveCount(1);
  await P().getByRole('button', { name: /menit baca/ }).click();
  await expect(P().getByRole('heading', { level: 1, name: /Merawat Kucing Anakan/ })).toBeVisible();
  await shot(page, 'E14-baca');
  await btn('Bagikan').click();
  await expect(P().getByRole('status')).toBeVisible();
  const more = P().locator('.h-scroll').first();
  await more.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const m0 = await more.evaluate((e) => e.scrollLeft);
  await swipe(page, more, -250);
  expect(await more.evaluate((e) => e.scrollLeft)).toBeGreaterThan(m0 + 50);
  for (let i = 0; i < 3; i++) await swipe(page, more, -600);
  const gap2 = await more.evaluate((e) => {
    const kids = Array.from(e.children).filter((c) => (c as HTMLElement).offsetWidth > 20);
    return e.getBoundingClientRect().right - kids[kids.length - 1].getBoundingClientRect().right;
  });
  expect(gap2).toBeGreaterThanOrEqual(12);
  await shot(page, 'E14-lainnya');
  await P().getByRole('button', { name: /menit baca/ }).last().click();
  await expect(P().getByRole('heading', { level: 1, name: /Artikel|Lovebird|Burung/ }).first()).toBeVisible();
  await back(page);
  await back(page);
});

test('E15 Adopt Me: filter, detail, ajukan, validasi, survei masuk Booking', async () => {
  await goHome();
  await btn('Lainnya').click();
  await btn('Adopt Me').click();
  await expect(P().getByRole('button', { name: /Anjing|Kucing|Kelinci/ }).first()).toBeVisible();
  await shot(page, 'E15-adopt-list');
  await audit(page, 'E15 adopt list');
  await P().getByRole('button', { name: 'Kucing', exact: true }).click();
  await expect(P().getByRole('list').getByRole('listitem')).toHaveCount(3);
  await P().getByRole('button', { name: 'Simpan Mochi' }).click();
  await toastIs('Disimpan');
  await P().getByRole('button', { name: /^Mochi/ }).first().click();
  await expect(P().getByRole('heading', { name: 'Tentang Mochi' })).toBeVisible();
  await btn('Selengkapnya').click();
  await expect(btn('Sembunyikan')).toHaveAttribute('aria-expanded', 'true');
  await shot(page, 'E15-adopt-detail');
  await btn('Ajukan Adopsi').click();
  await expectHeading(page, 'Data Calon Adopter');
  await btn('Jadwalkan Survey').click();
  await toastIs('Lengkapi data yang ditandai');
  for (const t of ['Nomor telepon belum benar', 'Tulis alamat lengkap', 'Pilih tempat tinggal', 'Pilih pengalaman', 'Ceritakan alasanmu minimal 10 karakter', 'Centang persetujuan untuk lanjut']) {
    await expect(P().getByRole('alert').filter({ hasText: t })).toBeVisible();
  }
  await shot(page, 'E15-adopt-errors');
  await P().getByPlaceholder('08xxxxxxxxxx').fill('081234567890');
  await P().getByPlaceholder('Nama jalan, nomor, kelurahan').first().fill('Jl. Melati No. 5, Ancol');
  await P().getByRole('button', { name: /Tempat Tinggal/ }).click();
  await choose(page, 'Apartemen');
  await P().getByRole('button', { name: /Pengalaman Memelihara/ }).click();
  await choose(page, 'Pernah memelihara');
  await P().getByPlaceholder('Ceritakan singkat').fill('Saya ingin memberi rumah yang hangat.');
  await P().getByRole('checkbox').check();
  await btn('Jadwalkan Survey').click();
  await pickSchedule(page, 10, 'Konfirmasi');
  await expect(P().getByRole('heading', { name: 'Survey adopsi terjadwal' })).toBeVisible();
  await btn('Lihat Janji Saya').click();
  await expect(P().getByText('Survey adopsi Mochi')).toBeVisible();
  await shot(page, 'E15-booking-adopsi');
});

/* =====================================================================
   F. Akun & Pengaturan
   ===================================================================== */
test('F16 Profil, hewan (tambah/ubah/hapus), Tersimpan', async () => {
  await tab(page, 'Akun');
  await shot(page, 'F16-akun');
  await audit(page, 'F16 akun');
  await btn('Ubah Profil').click();
  await P().getByPlaceholder('nama@email.com').fill('x');
  await P().getByPlaceholder('08xxxxxxxxxx').fill('abc');
  await btn('Simpan').click();
  await expect(P().getByText('Format email belum benar')).toBeVisible();
  await expect(P().getByText('Nomor telepon belum benar')).toBeVisible();
  await P().getByPlaceholder('nama@email.com').fill('budi.baru@mail.com');
  await P().getByPlaceholder('08xxxxxxxxxx').fill('081298765432');
  await btn('Simpan').click();
  await toastIs('Profil disimpan');
  await expect(P().getByText('budi.baru@mail.com')).toBeVisible();

  await btn('Tambah hewan').click();
  await btn('Simpan Profil').click();
  await expect(P().getByRole('alert').filter({ hasText: 'Pilih jenis hewan' })).toBeVisible();
  await expect(P().getByRole('alert').filter({ hasText: 'Nama hewan wajib diisi' })).toBeVisible();
  await P().getByRole('button', { name: /Pilih Jenis Hewan/ }).click();
  await choose(page, 'Anjing');
  await P().getByPlaceholder('Masukkan Nama Hewan').fill('Kopi');
  await btn('Simpan Profil').click();
  await toastIs('Kopi berhasil ditambahkan');
  await P().getByRole('button', { name: /^Kopi/ }).click();
  await expectHeading(page, 'Data Hewan');
  await P().getByPlaceholder('Masukkan Nama Hewan').fill('Kopi Susu');
  await btn('Simpan Perubahan').click();
  await toastIs('Data hewan diperbarui');
  await expect(P().getByRole('button', { name: /^Kopi Susu/ })).toBeVisible();
  await P().getByRole('button', { name: /^Kopi Susu/ }).click();
  await btn('Hapus hewan').click();
  await btn('Hapus').click();
  await toastIs('Hewan dihapus');
  await expect(P().getByRole('button', { name: /^Kopi Susu/ })).toHaveCount(0);

  await P().getByRole('button', { name: /Tersimpan/ }).click();
  await expectHeading(page, 'Tersimpan');
  for (const t of ['Klinik', 'Dokter hewan', 'Artikel', 'Adopt Me']) await expect(P().getByText(t, { exact: true }).first()).toBeVisible();
  await shot(page, 'F16-tersimpan');
  await P().getByRole('button', { name: /Klinik Medisani/ }).click();
  await expect(btn('Jadwalkan')).toBeVisible();
  await back(page);
  await P().getByRole('button', { name: /Mochi/ }).click();
  await expect(btn('Ajukan Adopsi')).toBeVisible();
  await back(page);
  await P().getByRole('button', { name: /Drh\. Anika/ }).click();
  await expect(btn('Jadwalkan')).toBeVisible();
  await back(page);
  await P().getByRole('button', { name: /Kucing Anakan/ }).click();
  await expect(P().getByRole('heading', { level: 1, name: /Kucing Anakan/ })).toBeVisible();
  await back(page);
  await back(page);
  await P().getByRole('button', { name: /Voucher Saya/ }).click();
  await expectHeading(page, 'Voucher Saya');
  await expect(P().getByText('Belum ada voucher')).toBeVisible();
  await back(page);
});

test('F17 Pengaturan: semua baris berfungsi, rating, keluar', async () => {
  await btn('Pengaturan').click();
  await shot(page, 'F17-pengaturan');
  await audit(page, 'F17 pengaturan');
  // Keamanan
  await P().getByRole('button', { name: /Keamanan Akun/ }).click();
  await btn('Ubah Password').click();
  await expect(P().getByRole('alert')).toHaveCount(2);
  const pws = P().locator('input[type=password]');
  await pws.nth(0).fill('lama123'); await pws.nth(1).fill('baru1234'); await pws.nth(2).fill('baru1234');
  await btn('Ubah Password').click();
  await toastIs('Password berhasil diubah');
  await P().getByRole('switch', { name: 'Verifikasi dua langkah' }).click();
  await expect(P().getByRole('switch', { name: 'Verifikasi dua langkah' })).toHaveAttribute('aria-checked', 'true');
  await btn('Keluar dari semua perangkat').click();
  await toastIs('Kamu keluar dari perangkat lain');
  await back(page);
  // Bahasa
  await P().getByRole('button', { name: /Pengaturan Bahasa/ }).click();
  await P().getByRole('button', { name: /English/ }).click();
  await toastIs('Bahasa Inggris segera hadir');
  await back(page);
  // Metode pembayaran
  await P().getByRole('button', { name: /Metode Pembayaran/ }).click();
  await btn('Hapus GoPay').click();
  await toastIs('Metode dihapus');
  await expect(P().getByText('Belum ada metode')).toBeVisible();
  await btn('Tambah Metode').click();
  await choose(page, /DANA/);
  await toastIs('DANA ditambahkan');
  await back(page);
  // Alamat
  await P().getByRole('button', { name: /Alamat Tersimpan/ }).click();
  await btn('Tambah Alamat').click();
  await btn('Simpan alamat').click();
  await expect(P().getByText('Beri nama alamat, contoh: Rumah')).toBeVisible();
  await P().getByPlaceholder('Rumah, Kantor, dll').fill('Kantor');
  await P().getByPlaceholder('Nama jalan, nomor, kelurahan').fill('Jl. Sudirman No. 1, Jakarta');
  await btn('Simpan alamat').click();
  await toastIs('Alamat disimpan');
  await P().getByRole('button', { name: 'Pakai sebagai lokasi' }).last().click();
  await toastIs('Lokasi diatur ke Kantor');
  await btn('Hapus alamat Kantor').click();
  await toastIs('Alamat dihapus');
  await back(page);
  // Notifikasi
  await P().getByRole('button', { name: /Pengaturan Notifikasi/ }).click();
  const sw = P().getByRole('switch', { name: 'Promo dan voucher' });
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await back(page);
  // Bantuan, kebijakan, syarat, komunitas
  await P().getByRole('button', { name: /Pusat Bantuan/ }).click();
  await expectHeading(page, 'Pusat Bantuan');
  await back(page);
  await P().getByRole('button', { name: /Kebijakan Privasi/ }).click();
  await expect(P().getByText('Data yang kami kumpulkan')).toBeVisible();
  await back(page);
  await P().getByRole('button', { name: /Syarat dan Ketentuan/ }).click();
  await expect(P().getByText('Layanan darurat')).toBeVisible();
  await back(page);
  await P().getByRole('button', { name: /Komunitas & Media Sosial/ }).click();
  await expect(P().getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', /instagram\.com/);
  await P().getByRole('button', { name: /Bagikan Petopia/ }).click();
  await expect(P().getByRole('status')).toBeVisible();
  await back(page);
  // Beri rating
  await P().getByRole('button', { name: /Beri Rating/ }).click();
  await P().getByRole('radio', { name: '3 bintang' }).click();
  await btn('Kirim').click();
  await toastIs('Terima kasih atas ratingmu!');
  // Keluar
  await P().getByRole('button', { name: /^Keluar/ }).click();
  await P().getByRole('dialog', { name: 'Keluar dari akun?' }).getByRole('button', { name: 'Batal' }).click();
  await P().getByRole('button', { name: /^Keluar/ }).click();
  await P().getByRole('dialog', { name: 'Keluar dari akun?' }).getByRole('button', { name: 'Keluar' }).click();
  await expect(btn('Buat Akun')).toBeVisible();
  await shot(page, 'F17-keluar');
});

/* =====================================================================
   G. Mode tamu & sesi
   ===================================================================== */
const skipCoach = async (pg: Page) => {
  const d = pg.getByRole('dialog', { name: 'Tutorial singkat' });
  if (await d.isVisible()) await d.getByRole('button', { name: /Lewat/ }).first().click();
};

test('G18a tamu: ajakan masuk, Jadwalkan minta login lalu kembali ke alur semula', async ({ browser }) => {
  const g = await newPhone(browser);
  const pg = g.page; const GP = phone(pg);
  await resetApp(pg);
  await expect(GP.getByRole('button', { name: 'Mulai Sekarang' })).toBeVisible({ timeout: 6000 });
  await GP.getByRole('button', { name: 'Mulai Sekarang' }).click();
  await GP.getByRole('button', { name: 'Lihat dulu tanpa masuk' }).click();
  await expect(GP.getByText('Halo, Tamu')).toBeVisible();
  await skipCoach(pg);
  await tab(pg, 'Booking');
  await expect(GP.getByText('Masuk untuk melihat janji')).toBeVisible();
  await shot(pg, 'G18-booking-tamu');
  await tab(pg, 'Reward');
  await expect(GP.getByText('Masuk untuk melihat reward')).toBeVisible();
  await tab(pg, 'Akun');
  await expect(GP.getByText('Masuk ke akun Petopia')).toBeVisible();
  await GP.getByRole('button', { name: 'Pengaturan', exact: true }).first().click();
  await GP.getByRole('button', { name: /Keamanan Akun/ }).click();
  await expect(GP.getByRole('status').filter({ hasText: 'Masuk dulu' })).toBeVisible();
  await expect(GP.getByRole('heading', { level: 1, name: 'Masuk' })).toBeVisible();
  await GP.getByRole('button', { name: 'Kembali' }).click();
  await GP.getByRole('button', { name: 'Kembali' }).click();
  await tab(pg, 'Awal');
  await GP.getByRole('button', { name: 'Klinik Hewan', exact: true }).click();
  await GP.getByRole('button', { name: /Klinik Kasih Satwa/ }).click();
  await GP.getByRole('button', { name: 'Jadwalkan', exact: true }).click();
  await expect(GP.getByRole('heading', { level: 1, name: 'Masuk' })).toBeVisible();
  await GP.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(GP.getByText('Alamat email wajib diisi')).toBeVisible();
  await GP.getByPlaceholder('Masukkan Alamat Email').fill('tamu@mail.com');
  await GP.getByPlaceholder('Masukkan Password').fill('abcdef');
  await GP.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(GP.getByRole('heading', { name: 'Klinik Kasih Satwa - Pademangan' })).toBeVisible();
  await expect(pg.getByRole('dialog', { name: /Pilih Tanggal & Waktu Kunjungan/ })).toBeVisible();
  await shot(pg, 'G18-kembali-ke-jadwal');
  expect(g.logs, g.logs.join('\n')).toEqual([]);
  await g.context.close();
});

test('G18b tamu: Ajukan Adopsi minta login lalu kembali ke formulir', async ({ browser }) => {
  const g = await newPhone(browser);
  const pg = g.page; const GP = phone(pg);
  await resetApp(pg);
  await GP.getByRole('button', { name: 'Mulai Sekarang' }).click({ timeout: 6000 });
  await GP.getByRole('button', { name: 'Lihat dulu tanpa masuk' }).click();
  await skipCoach(pg);
  await GP.getByRole('button', { name: 'Lainnya' }).click();
  await GP.getByRole('button', { name: 'Adopt Me' }).click();
  await GP.getByRole('button', { name: /^Bruno/ }).click();
  await GP.getByRole('button', { name: 'Ajukan Adopsi' }).click();
  await expect(GP.getByRole('heading', { level: 1, name: 'Masuk' })).toBeVisible();
  await GP.getByRole('button', { name: 'Buat Akun', exact: true }).last().click();
  await GP.getByRole('button', { name: 'Kembali' }).click();
  await GP.getByPlaceholder('Masukkan Alamat Email').fill('adopter@mail.com');
  await GP.getByPlaceholder('Masukkan Password').fill('abcdef');
  await GP.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(GP.getByRole('heading', { level: 1, name: 'Data Calon Adopter' })).toBeVisible();
  expect(g.logs, g.logs.join('\n')).toEqual([]);
  await g.context.close();
});

test('G19 reload di tengah alur dan tombol back HP/browser', async () => {
  // masuk lagi sebagai pengguna terdaftar
  await btn('Masuk').click();
  await P().getByPlaceholder('Masukkan Alamat Email').fill('budi.baru@mail.com');
  await P().getByPlaceholder('Masukkan Password').fill('baru1234');
  await btn('Masuk').click();
  await expect(P().getByText(/^Halo, /)).toBeVisible();
  await skipCoach(page);
  // back setelah login tidak boleh kembali ke form Masuk / Welcome
  await page.goBack().catch(() => undefined);
  await page.waitForTimeout(300);
  const onLogin = await P().getByRole('heading', { level: 1, name: 'Masuk' }).isVisible().catch(() => false);
  const onWelcome = await btn('Buat Akun').isVisible().catch(() => false);
  expect(onLogin || onWelcome, 'back setelah login tidak boleh memunculkan Masuk/Welcome lagi').toBeFalsy();
  await page.goForward().catch(() => undefined);
  await page.goto('/');
  await expect(P().getByText(/^Halo, /)).toBeVisible();

  // alur: Beranda > Klinik > Detail > Bayar, lalu reload
  await btn('Klinik Hewan', true).click();
  await rowOf(/Petovet/).click();
  await btn('Jadwalkan').click();
  await pickSchedule(page, 11);
  await P().getByRole('button', { name: /Pilih layanan/ }).click();
  await choose(page, /^Vaksinasi lengkap/);
  await P().getByRole('radio', { name: /DANA/ }).click();
  await page.reload();
  await expectHeading(page, 'Pembayaran');
  await expect(P().getByText('Vaksinasi lengkap').first()).toBeVisible();
  await expect(P().getByRole('radio', { name: /DANA/ })).toHaveAttribute('aria-checked', 'true');
  await shot(page, 'G19-reload-bayar');
  // back bertahap: Bayar > Detail > Daftar > Beranda
  await page.goBack();
  await expect(btn('Jadwalkan')).toBeVisible();
  await page.goBack();
  await expectHeading(page, 'Klinik Hewan');
  await page.goBack();
  await expect(P().getByText(/^Halo, /)).toBeVisible();
  await expect(page).toHaveURL(/127\.0\.0\.1:4173/);
  // tab: Beranda > Reward > Akun, back kembali bertahap
  await tab(page, 'Reward');
  await tab(page, 'Akun');
  await expectHeading(page, 'Akun');
  await page.goBack(); // dari tab mana pun, back kembali ke Beranda
  await expect(P().getByText(/^Halo, /)).toBeVisible();
  await expect(page).toHaveURL(/127\.0\.0\.1:4173/);
  // tombol Kembali di layar sama dengan back browser
  await btn('Lainnya').click();
  await P().getByRole('button', { name: 'Trainer', exact: true }).click();
  await back(page);
  await expectHeading(page, 'Semua Layanan');
  await back(page);
  await expect(P().getByText(/^Halo, /)).toBeVisible();
  // setelah bayar sukses, back tidak kembali ke Bayar kosong
  await btn('Klinik Hewan', true).click();
  await rowOf(/Petovet/).click();
  await btn('Jadwalkan').click();
  await pickSchedule(page, 12);
  await P().getByRole('button', { name: /Pilih layanan/ }).click();
  await choose(page, /^Sterilisasi/);
  await P().getByRole('radio', { name: /Bayar di Klinik/ }).click();
  await btn('Bayar Sekarang').click();
  await expect(P().getByRole('heading', { name: 'Pembayaran berhasil' })).toBeVisible();
  await page.goBack();
  await expect(P().getByRole('heading', { level: 1, name: 'Pembayaran' })).toHaveCount(0);
  await goHome();
});

/* =====================================================================
   G20. Tata letak di 360 / 393 / 430 px
   ===================================================================== */
const TOUR: [string, string[]][] = [
  ['home', ['home']],
  ['artikel', ['home', 'artikel']],
  ['booking', ['home', 'booking']],
  ['reward', ['home', 'reward']],
  ['akun', ['home', 'akun']],
  ['layanan', ['home', 'layanan']],
  ['list klinik', ['home', 'list:klinik']],
  ['list konsultasi', ['home', 'list:konsultasi']],
  ['list trainer', ['home', 'list:trainer']],
  ['klinik detail', ['home', 'list:klinik', 'klinik:medisani']],
  ['dokter detail', ['home', 'list:konsultasi', 'dokter:anika']],
  ['bayar', ['home', 'klinik:medisani', 'bayar']],
  ['baca', ['home', 'artikel', 'baca:a1']],
  ['adopt', ['home', 'adopt']],
  ['adopsi detail', ['home', 'adopt', 'adopsi:d1']],
  ['adopter', ['home', 'adopt', 'adopsi:d1', 'adopter:d1']],
  ['profil', ['home', 'akun', 'profil']],
  ['hewan', ['home', 'akun', 'hewan:baru']],
  ['tersimpan', ['home', 'akun', 'tersimpan']],
  ['pengaturan', ['home', 'akun', 'pengaturan']],
  ['alamat', ['home', 'akun', 'pengaturan', 'alamat']],
  ['metode', ['home', 'akun', 'pengaturan', 'metode']],
  ['keamanan', ['home', 'akun', 'pengaturan', 'keamanan']],
  ['notif', ['home', 'notif']],
  ['chats', ['home', 'chats']],
  ['chat', ['home', 'chats', 'chat:cs']],
  ['cs', ['home', 'cs']],
  ['lokasi', ['home', 'lokasi']],
  ['cari', ['home', 'cari']],
  ['riwayat', ['home', 'reward', 'riwayat']],
  ['hadiah', ['home', 'reward', 'hadiah:c1']],
];

for (const vp of VIEWPORTS) {
  test(`G20 tata letak ${vp.width}x${vp.height}`, async () => {
    await page.setViewportSize(vp);
    await page.goto('/');
    await patchState(page, (s) => {
      s.tutorialDone = true; s.loggedIn = true; s.onboarded = true;
      s.draft = { kind: 'klinik', refId: 'klinik:medisani', place: 'Klinik Medisani - Mangga Besar', who: 'Klinik hewan', km: '1.2km', service: 'Grooming & mandi', cat: 'grooming', price: 90000, date: '2026-11-20', time: '09:00', pet: 'Mochi', pay: 'gopay' };
    });
    for (const [name, stack] of TOUR) {
      await gotoRoute(page, stack);
      await expect(P()).toBeVisible();
      await audit(page, `${name} @${vp.width}`);
      await auditBottom(page, `${name} @${vp.width}`);
      if (vp.width === 360 || name === 'home' || name === 'bayar') await shot(page, `G20-${vp.width}-${name.replace(/\s+/g, '-')}`);
      // tidak ada dead-end: layar non-tab wajib punya tombol Kembali
      const isTabScreen = ['home', 'artikel', 'booking', 'reward', 'akun'].includes(name);
      if (!isTabScreen) {
        const hasBack = await P().getByRole('button', { name: 'Kembali', exact: true }).count();
        if (!hasBack) note(`${name} @${vp.width}`, 'tidak ada tombol Kembali (dead-end)');
      }
    }
  });
}

test('G20b layar kecil 360x640: tombol utama form tetap terjangkau saat keyboard virtual muncul', async () => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  await gotoRoute(page, ['home', 'adopt', 'adopsi:d1', 'adopter:d1']);
  // keyboard virtual ~ 280px => tinggi tampil 360
  await page.setViewportSize({ width: 360, height: 360 });
  await P().getByPlaceholder('Ceritakan singkat').focus();
  const b = await btn('Jadwalkan Survey').boundingBox();
  expect(b && b.y >= 0 && b.y + b.height <= 360, 'tombol Jadwalkan Survey harus terlihat di atas keyboard').toBeTruthy();
  await gotoRoute(page, ['home', 'chats', 'chat:cs']);
  const i = await P().getByLabel('Tulis pesan').boundingBox();
  expect(i && i.y + i.height <= 360).toBeTruthy();
  await page.setViewportSize({ width: 360, height: 640 });
  await gotoRoute(page, ['welcome', 'register']);
  await P().getByPlaceholder('Masukkan Kode Referral').focus();
  await page.setViewportSize({ width: 360, height: 360 });
  await btn('Buat Akun').last().scrollIntoViewIfNeeded();
  const r = await btn('Buat Akun').last().boundingBox();
  expect(r && r.y >= 0 && r.y + r.height <= 360, 'tombol Buat Akun harus bisa di-scroll ke area terlihat').toBeTruthy();
  await page.setViewportSize(VIEWPORTS[0]);
});

test('Z1 tombol Booking polos kuning #fdb515 tanpa outline/border/shadow', async () => {
  await page.setViewportSize(VIEWPORTS[0]);
  await page.goto('/');
  await patchState(page, (s) => { s.tutorialDone = true; s.onboarded = true; });
  await gotoRoute(page, ['home']);
  const style = () => page.evaluate(() => {
    const b = document.querySelector('[data-coach="booking"]') as HTMLElement;
    const c = b.firstElementChild as HTMLElement;
    const g = (e: HTMLElement) => { const cs = getComputedStyle(e); return { outline: `${cs.outlineStyle}/${cs.outlineWidth}`, border: cs.borderTopWidth + cs.borderRightWidth + cs.borderBottomWidth + cs.borderLeftWidth, shadow: cs.boxShadow, bg: cs.backgroundColor, ring: cs.getPropertyValue('--tw-ring-shadow') }; };
    return { button: g(b), circle: g(c), focused: document.activeElement === b };
  });
  const rest = await style();
  expect(rest.circle.bg).toBe('rgb(253, 181, 21)');
  expect(rest.circle.shadow).toBe('none');
  expect(rest.circle.border).toBe('0px0px0px0px');
  // fokus lewat keyboard tidak boleh memunculkan outline biru/ungu
  for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); if ((await style()).focused) break; }
  const foc = await style();
  expect(foc.focused, 'tombol Booking bisa difokus dengan keyboard').toBeTruthy();
  expect(foc.button.outline.startsWith('none')).toBeTruthy();
  expect(foc.button.shadow).toBe('none');
  expect(foc.circle.shadow).toBe('none');
  expect(foc.circle.bg).toBe('rgb(253, 181, 21)');
  await page.screenshot({ path: 'qa/shots/Z1-booking-fokus.png', clip: { x: 100, y: 740, width: 200, height: 112 } });
});

test('Z2 logo asli dipakai lewat Wordmark dan proporsional', async () => {
  const res = await page.request.get('/img/logo.png');
  const isPng = (res.headers()['content-type'] ?? '').includes('image/png');
  test.skip(!isPng, 'public/img/logo.png belum ada: aplikasi memakai wordmark cadangan. Taruh file logo asli di public/img/logo.png lalu jalankan ulang.');
  await page.setViewportSize(VIEWPORTS[0]);
  await resetApp(page);
  const check = async (name: string) => {
    const img = P().locator('img[src$="img/logo.png"]').first();
    await expect(img).toBeVisible();
    const m = await img.evaluate((e: HTMLImageElement) => ({ nw: e.naturalWidth, nh: e.naturalHeight, w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, l: e.getBoundingClientRect().left, r: e.getBoundingClientRect().right }));
    expect(Math.abs(m.w / m.h - m.nw / m.nh), `${name}: rasio logo`).toBeLessThan(0.05);
    expect(m.l, `${name}: logo terpotong kiri`).toBeGreaterThanOrEqual(0);
    expect(m.r, `${name}: logo terpotong kanan`).toBeLessThanOrEqual(393);
    expect(m.h, `${name}: logo terlalu kecil`).toBeGreaterThan(24);
    await shot(page, `Z2-logo-${name}`);
  };
  await check('splash');
  await expect(btn('Mulai Sekarang')).toBeVisible({ timeout: 5000 });
  await check('onboarding');
  await btn('Mulai Sekarang').click();
  await check('welcome');
  expect(await page.evaluate(() => document.querySelector('link[rel=icon]')?.getAttribute('href'))).toContain('img/logo.png');
});

test('Z console bersih dan laporan masalah', async () => {
  expect(logs, 'error/warning console:\n' + logs.join('\n')).toEqual([]);
  const uniq = Array.from(new Set(problems.map((p) => `${p.where} :: ${p.what}`)));
  fs.writeFileSync('qa/audit.txt', uniq.join('\n'));
  expect(uniq, 'temuan audit tata letak / area sentuh: ' + uniq.join(' | ')).toEqual([]);
});

/* =====================================================================
   H. Baris horizontal: jari, mouse drag, trackpad, panah
   ===================================================================== */
const guestHome = async (pg: Page) => {
  await pg.goto('/');
  await pg.evaluate(() => { localStorage.clear(); history.replaceState(null, ''); localStorage.setItem('petopia-state-v2', JSON.stringify({ onboarded: true, tutorialDone: true })); });
  await pg.reload();
  await expect(pg.getByText('Halo, Tamu')).toBeVisible();
};
const noHScroll = (pg: Page) => pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1 && document.getElementById('phone')!.scrollWidth <= document.getElementById('phone')!.clientWidth + 1);
const gapEnd = (row: import('@playwright/test').Locator) => row.evaluate((e) => {
  const kids = Array.from(e.children).filter((c) => (c as HTMLElement).offsetWidth > 20);
  return e.getBoundingClientRect().right - kids[kids.length - 1].getBoundingClientRect().right;
});

test('H1 laptop 1280x800: drag mouse, klik tetap membuka kartu, klik setelah drag tidak ikut, panah, trackpad', async ({ browser }) => {
  const d = await newDesktop(browser);
  const pg = d.page; const DP = phone(pg);
  await guestHome(pg);
  const row = DP.locator('.h-scroll').first();
  await row.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await pg.waitForTimeout(150);
  expect(await row.evaluate((e) => getComputedStyle(e).cursor)).toBe('grab');
  const box = (await row.boundingBox())!;
  const card = DP.getByRole('button', { name: 'Promo Vaksinasi Hewan 50%' });
  const cb = (await card.boundingBox())!;

  // drag dimulai tepat di atas kartu: row bergeser, kartu tidak terbuka
  const l0 = await row.evaluate((e) => e.scrollLeft);
  await mouseDrag(pg, { x: cb.x + cb.width / 2, y: cb.y + cb.height / 2 }, -260);
  await pg.waitForTimeout(700);
  expect(await row.evaluate((e) => e.scrollLeft)).toBeGreaterThan(l0 + 100);
  await expect(DP.getByRole('dialog')).toHaveCount(0);
  await shot(pg, 'H1-drag-home');
  await mouseDrag(pg, { x: box.x + 150, y: box.y + box.height / 2 }, 400);
  await pg.waitForTimeout(700);
  expect(await row.evaluate((e) => e.scrollLeft)).toBeLessThan(5);

  // klik biasa tetap membuka kartu
  await DP.getByRole('button', { name: 'Promo Vaksinasi Hewan 50%' }).click();
  await expect(DP.getByRole('dialog', { name: 'Promo Vaksinasi Hewan 50%' })).toBeVisible();
  await DP.getByRole('button', { name: 'Tutup' }).click();

  // panah: tampil di >= sm, 44px, hilang di ujung
  const right = DP.getByRole('button', { name: 'Geser rekomendasi ke kanan' });
  await expect(right).toBeVisible();
  const ab = (await right.boundingBox())!;
  expect(ab.width).toBeGreaterThanOrEqual(44); expect(ab.height).toBeGreaterThanOrEqual(44);
  await expect(DP.getByRole('button', { name: 'Geser rekomendasi ke kiri' })).toHaveCount(0);
  await right.click();
  await expect(DP.getByRole('button', { name: 'Geser rekomendasi ke kiri' })).toBeVisible();
  for (let i = 0; i < 4; i++) if (await right.isVisible()) { await right.click(); await pg.waitForTimeout(500); }
  await expect(right).toHaveCount(0);
  expect(await gapEnd(row)).toBeGreaterThanOrEqual(12);
  await shot(pg, 'H1-arrow-end');
  // trackpad / roda horizontal, lalu shift + roda vertikal
  await pg.mouse.move(box.x + 200, box.y + box.height / 2);
  const before = await row.evaluate((e) => e.scrollLeft);
  await pg.mouse.wheel(-300, 0);
  await pg.waitForTimeout(500);
  expect(await row.evaluate((e) => e.scrollLeft)).toBeLessThan(before);
  const mid = await row.evaluate((e) => e.scrollLeft);
  await pg.keyboard.down('Shift'); await pg.mouse.wheel(0, 250); await pg.keyboard.up('Shift');
  await pg.waitForTimeout(500);
  expect(await row.evaluate((e) => e.scrollLeft)).toBeGreaterThan(mid);

  // Baru Saja Dilihat
  const rec = DP.locator('.h-scroll').nth(1);
  await rec.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const rb = (await rec.boundingBox())!;
  await mouseDrag(pg, { x: rb.x + 200, y: rb.y + 50 }, -200);
  await pg.waitForTimeout(600);
  expect(await rec.evaluate((e) => e.scrollLeft)).toBeGreaterThan(50);
  await expect(DP.getByRole('button', { name: 'Jadwalkan', exact: true })).toHaveCount(0);
  await mouseDrag(pg, { x: rb.x + 100, y: rb.y + 50 }, 500);
  await pg.waitForTimeout(600);
  await DP.getByRole('button', { name: 'Buat Janji Temu' }).first().click();
  await expect(DP.getByRole('button', { name: 'Jadwalkan', exact: true })).toBeVisible();
  await DP.getByRole('button', { name: 'Kembali' }).click();

  // Artikel: chip dan Pilihan untuk kamu
  await pg.getByRole('button', { name: 'Artikel', exact: true }).click();
  const chips = DP.locator('.drag-x').first();
  expect(await chips.evaluate((e) => e.scrollWidth > e.clientWidth)).toBeTruthy();
  expect(await chips.getByRole('button').count()).toBeGreaterThanOrEqual(7);
  const chb = (await chips.boundingBox())!;
  await mouseDrag(pg, { x: chb.x + 100, y: chb.y + chb.height / 2 }, -150);
  await pg.waitForTimeout(600);
  expect(await chips.evaluate((e) => e.scrollLeft)).toBeGreaterThan(30);
  await expect(DP.getByRole('button', { name: 'Semua', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await chips.getByRole('button', { name: 'Perawatan Hamster' }).click();
  await expect(DP.getByRole('button', { name: /menit baca/ })).toHaveCount(1);
  await DP.getByRole('button', { name: 'Semua', exact: true }).click();
  const feat = DP.locator('.h-scroll').first();
  await feat.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const fb = (await feat.boundingBox())!;
  expect(await feat.locator('> button').count()).toBeGreaterThanOrEqual(5);
  await mouseDrag(pg, { x: fb.x + 120, y: fb.y + 60 }, -250);
  await pg.waitForTimeout(600);
  expect(await feat.evaluate((e) => e.scrollLeft)).toBeGreaterThan(80);
  await expect(DP.getByRole('heading', { level: 1, name: /Kucing Anakan|Kenali|Panduan/ })).toHaveCount(0);
  await shot(pg, 'H1-drag-artikel');
  await feat.locator('> button').first().click();
  await expect(DP.getByRole('heading', { level: 1, name: /Kucing Anakan/ })).toBeVisible();
  // Artikel lainnya
  const more = DP.locator('.h-scroll').first();
  await more.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const mb = (await more.boundingBox())!;
  await mouseDrag(pg, { x: mb.x + 120, y: mb.y + 60 }, -250);
  await pg.waitForTimeout(600);
  expect(await more.evaluate((e) => e.scrollLeft)).toBeGreaterThan(80);
  await expect(DP.getByRole('button', { name: 'Geser artikel lainnya ke kanan' })).toBeVisible();
  await more.locator('> button').first().click();
  await expect(DP.getByRole('heading', { level: 1, name: /Artikel/ }).first()).toBeVisible();
  expect(await noHScroll(pg)).toBeTruthy();
  expect(d.logs, d.logs.join(' | ')).toEqual([]);
  await d.context.close();
});

test('H2 HP 393x852: swipe jari tetap jalan, panah tersembunyi, chip dan kartu bisa digeser', async ({ browser }) => {
  const m = await newPhone(browser);
  const pg = m.page; const MP = phone(pg);
  await guestHome(pg);
  await expect(MP.getByRole('button', { name: /^Geser .* ke (kiri|kanan)$/ })).toHaveCount(0);
  const row = MP.locator('.h-scroll').first();
  const l0 = await row.evaluate((e) => e.scrollLeft);
  await swipe(pg, row, -260);
  expect(await row.evaluate((e) => e.scrollLeft)).toBeGreaterThan(l0 + 50);
  // petunjuk: kartu berikutnya sebagian terlihat di posisi awal
  await row.evaluate((e) => (e.scrollLeft = 0));
  const vis = await row.evaluate((e) => { const k = e.children[1] as HTMLElement; const r = k.getBoundingClientRect(); return { left: r.left, right: r.right, w: window.innerWidth }; });
  expect(vis.left).toBeLessThan(vis.w - 20);
  expect(vis.right).toBeGreaterThan(vis.w);
  await MP.getByRole('button', { name: 'Penitipan Hewan Diskon 20%' }).click();
  await expect(MP.getByRole('dialog', { name: 'Penitipan Hewan Diskon 20%' })).toBeVisible();
  await MP.getByRole('button', { name: 'Tutup' }).click();
  await pg.getByRole('button', { name: 'Artikel', exact: true }).click();
  const chips = MP.locator('.drag-x').first();
  const c0 = await chips.evaluate((e) => e.scrollLeft);
  await swipe(pg, chips, -200);
  expect(await chips.evaluate((e) => e.scrollLeft)).toBeGreaterThan(c0 + 40);
  await shot(pg, 'H2-chip-swipe');
  expect(await noHScroll(pg)).toBeTruthy();
  expect(m.logs, m.logs.join(' | ')).toEqual([]);
  await m.context.close();
});
