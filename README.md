# Petopia

Aplikasi perawatan hewan (klinik, konsultasi dokter, grooming, vaksinasi, penitipan, trainer, adopsi) — proyek HAKI kampus UBM.
Mobile-first, React 19 + Vite + TypeScript + Tailwind v4. Data tersimpan di localStorage (tanpa backend).

## Menjalankan
```
npm install
npm run dev        # pengembangan
npm run build      # produksi (folder dist)
npm run preview
```
Deploy ke Vercel: import repo, framework Vite, build `npm run build`, output `dist`.

## Alur
Onboarding → Welcome → Masuk / Buat Akun → Daftarkan Hewan → Home (tutorial coachmark).
"Lihat dulu tanpa masuk" = mode tamu; booking, adopsi, dll meminta masuk lalu kembali ke alur.
Booking: pilih klinik/dokter → Jadwalkan → Bayar (hewan, layanan, voucher, metode) → Sukses → Booking (detail, ubah jadwal, batal, ulasan).

## Kode promo demo
`PETOPIA25` (+25 poin), `SAYANGHEWAN` (+100), `PETOPIA250` (+250). Tukar poin di tab Reward.

## Catatan
- Layar pembayaran tidak ada di Figma; dibuat dengan gaya yang sama.
- "Ras Hewan" menggantikan field "Gender Hewan" ganda di Figma.
- Foto, logo, ilustrasi masih placeholder. Taruh file di `public/img/` (logo.png — PNG transparan, dipakai di splash, welcome, login, register, favicon; onb1-3.png, welcome.png, artikel1-6.png, adopt1-6.png, drh2.png, trainer2/3.png).
- Untuk HAKI: pakai aset milik sendiri/berlisensi, bukan foto stok.
