# Prompt untuk Claude Code: uji UX dari sudut pandang user

Salin semua isi di bawah garis ke Claude Code (jalankan di folder project `petopia`).

---

Kamu adalah QA engineer + UX reviewer untuk aplikasi mobile-first "Petopia" (React 19, Vite, TypeScript, Tailwind v4, data di localStorage `petopia-state-v2`). Tugasmu: berperan sebagai USER BARU lalu mencoba SEMUA fitur dari awal sampai akhir, memastikan semuanya mulus, bisa diklik, dan nyaman dipakai di HP. Perbaiki sendiri setiap masalah yang kamu temukan, jangan hanya melaporkan.

## Persiapan
1. `npm install && npm run build && npx vite preview --host 127.0.0.1 --port 4173`
2. Pakai Playwright (sudah ada, atau `npm i -D playwright && npx playwright install chromium`) dengan viewport 393x852, isMobile, hasTouch. Uji juga 360x740 dan 430x932.
3. Ambil screenshot di setiap layar penting dan LIHAT hasilnya (jangan menebak). Simpan di `qa/shots/`.
4. Cek console: tidak boleh ada error atau warning React.

## Aturan visual (wajib)
- Visual harus tetap sama dengan Figma (https://www.figma.com/design/kwb7QHBetFdmiQglz7V0GA/PetShop). Jangan ubah warna/komponen kecuali memperbaiki bug.
- Jarak antar elemen jangan mepet (minimal 12px antar kartu, 16-22px padding sisi). Tombol/area sentuh minimal 44px.
- Tombol Booking di navigasi bawah harus polos kuning `#fdb515`: tanpa outline, border, atau shadow ungu/biru.
- Logo asli ada di `public/img/logo.png` (PNG transparan). Semua tempat yang menampilkan logo (splash, onboarding, welcome, login, register, favicon) harus memakai file itu lewat komponen `Wordmark`. Pastikan ukurannya proporsional dan tidak terpotong.

## Skenario perjalanan user (jalankan berurutan, tiap langkah harus lolos)
**A. Pengguna baru**
1. Buka app pertama kali: splash -> 3 slide onboarding (geser dan klik titik) -> "Mulai Sekarang" -> Welcome.
2. "Buat Akun": coba submit kosong (pesan error per field), email salah format, password lemah, kode referral salah/benar. Daftar sukses -> popup -> Daftarkan Hewan (validasi, simpan / lewati).
3. Home: coachmark tutorial muncul, tidak menutupi tombol penting, bisa dilewati, tidak muncul lagi setelah reload.

**B. Home**
4. Pencarian, tombol lokasi (ganti lokasi, cari area, alamat tersimpan), headset (CS), chat, lonceng notifikasi.
5. Carousel "Rekomendasi untuk Anda" dan "Baru Saja Dilihat": harus bisa digeser horizontal dengan jari/mouse, ada snap, kartu terakhir tidak terpotong, tiap kartu bisa diklik.
6. Lainnya -> semua tile (Grooming, Vaksinasi, Penitipan, Trainer, Adopt Me) membuka daftar yang benar.

**C. Booking sampai bayar (alur utama)**
7. Klinik Hewan -> filter (Terdekat, Jenis Hewan, Jam, Rating) -> hasil berubah dan ada empty state "Hapus filter".
8. Detail klinik -> bookmark -> Jadwalkan -> pilih tanggal (chip + kalender) dan jam (slot penuh/lewat harus nonaktif) -> Lanjut.
9. Bayar: pilih hewan, layanan, voucher, metode. Tombol "Bayar Sekarang" nonaktif sampai lengkap, total benar (cek hitungan diskon + biaya layanan), -> Sukses.
10. Booking: janji baru muncul; Lihat Detail; ubah jadwal; batalkan (alasan wajib); janji selesai -> beri ulasan -> Pesan Lagi.
11. Ulangi untuk Konsultasi dokter (chat dokter, detail dokter, tab Pengalaman/Pendidikan/Tentang), Grooming, Vaksinasi, Penitipan, Trainer.

**D. Reward**
12. Kode promo: kosong, salah, benar (PETOPIA25, SAYANGHEWAN, PETOPIA250), kode yang sama dipakai dua kali (harus ditolak). Poin bertambah benar.
13. Tukar poin kupon (poin cukup dan kurang), Voucher Saya, pakai voucher di halaman bayar, Riwayat poin 2 tab.

**E. Artikel & Adopsi**
14. Artikel: carousel "Pilihan untuk kamu" bisa digeser, filter kategori, cari, bookmark, tab Tersimpan, baca artikel, bagikan, "Artikel lainnya" (carousel horizontal) bisa digeser dan diklik.
15. Adopt Me: filter, detail (Selengkapnya), Ajukan Adopsi (validasi form), jadwal survei -> muncul di Booking.

**F. Akun & Pengaturan**
16. Profil (validasi email), tambah/ubah/hapus hewan, Tersimpan (klinik, dokter, artikel, adopsi).
17. Pengaturan: setiap baris terbuka dan berfungsi (Keamanan, Bahasa, Metode Pembayaran, Alamat, Notifikasi, Bantuan, Kebijakan, Syarat, Komunitas), Beri Rating, Keluar.

**G. Mode tamu & sesi**
18. "Lihat dulu tanpa masuk": Booking/Reward/Akun menampilkan ajakan masuk; Jadwalkan dan Adopsi meminta login lalu KEMBALI ke alur semula.
19. Reload di tengah alur: data tetap ada. Tombol back HP/browser selalu kembali ke layar sebelumnya yang masuk akal (tidak keluar app mendadak, tidak loop).
20. Tidak ada scroll horizontal pada halaman di 360/393/430px. Tidak ada teks terpotong atau tumpang tindih. Konten tidak tertutup navigasi bawah.

## Cek UX tambahan (nilai sebagai user nyata)
- Setiap tombol punya umpan balik (toast, perubahan status, atau navigasi) dalam < 300ms.
- Tidak ada tombol "mati" (bisa diklik tapi tidak melakukan apa-apa), tidak ada layar kosong tanpa penjelasan, tidak ada dead-end tanpa tombol kembali.
- Pesan error jelas dan menunjuk field yang salah; teks bahasa Indonesia konsisten.
- Fokus keyboard terlihat; ikon-only punya aria-label; kontras teks memadai.
- Layar kecil (360x640) dan keyboard virtual tidak menutupi tombol utama form.

## Keluaran
1. Perbaiki semua bug langsung di kode (komit kecil per perbaikan).
2. Simpan skrip tes di `qa/e2e.spec.ts` agar bisa dijalankan ulang (`npx playwright test`).
3. Tulis `qa/LAPORAN.md`: tabel skenario (A1-G20) dengan status PASS/FAIL awal, bug yang ditemukan, perbaikannya, screenshot sebelum/sesudah, dan sisa masalah yang butuh keputusan manusia.
4. Jangan menyatakan "selesai" sebelum seluruh skenario PASS pada putaran terakhir dan console bersih.
