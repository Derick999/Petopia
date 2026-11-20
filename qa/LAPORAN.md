# Laporan uji UX Petopia

Dijalankan sebagai pengguna baru di Chromium mobile (touch, `isMobile`) pada 393x852, 360x740, 430x932, plus 360x640 dan 360x360 (simulasi keyboard virtual). Skrip: `qa/e2e.spec.ts` (jalankan `npm run e2e`). Screenshot: `qa/shots/`.

## Status akhir

Putaran terakhir: **31 lulus, 0 dilewati, 0 gagal** (setelah logo diletakkan). Console bersih (tanpa error maupun warning React) di semua layar yang dilalui.
Logo: file yang diletakkan bernama `petopialogo.png` (RGB, latar putih opak, 1200x630). Saya menyalinnya sebagai `public/img/logo.png` dengan latar putih dibuat transparan dan dipotong rapat (1074x399). File asli tetap ada.

Catatan jujur tentang "status awal": sebagian temuan saya dapat dari membaca kode sebelum tesnya ditulis, jadi tesnya tidak pernah gagal secara visual. Kolom itu saya tandai "tinjauan kode". Yang saya lihat gagal langsung saat dijalankan ditandai "FAIL".

## Tabel skenario

| # | Skenario | Awal | Akhir | Catatan |
|---|---|---|---|---|
| A1 | Splash, onboarding (geser dengan jari + klik titik), Welcome | PASS | PASS | |
| A2 | Buat Akun: kosong, email salah, password pendek, referral salah/benar, popup, daftar hewan | PASS | PASS | |
| A3 | Coachmark muncul, tidak menutupi tombol, bisa dilewati, tidak muncul lagi setelah reload | PASS | PASS | |
| B4 | Cari, lokasi (ganti, cari area, alamat tersimpan, izin lokasi ditolak), headset, chat, lonceng | PASS | PASS | |
| B5 | Carousel Rekomendasi dan Baru Saja Dilihat: geser, snap, kartu terakhir tidak terpotong, kartu bisa diklik | PASS | PASS | Carousel kedua tertutup nav pada layar pertama sampai halaman digulir. Itu perilaku normal. |
| B6 | Lainnya: 8 tile membuka daftar yang benar | PASS | PASS | |
| C7 | Klinik Hewan: filter (Terdekat, jenis hewan, jam, rating), empty state, Hapus filter, cari | PASS | PASS | |
| C8 | Detail klinik, bookmark, Jadwalkan, chip tanggal + kalender, slot penuh/lewat nonaktif | FAIL | PASS | Dialog jadwal tidak punya nama aksesibel (B1). |
| C9 | Bayar: tombol nonaktif sampai lengkap, voucher, total (diskon + biaya layanan), sukses | PASS | PASS | Total diverifikasi: 90.000 - 20.000 + 2.000 = Rp. 72.000, poin 72. |
| C10 | Booking: Lihat Detail, ubah jadwal, batal (alasan wajib), selesai, ulasan, Pesan Lagi | FAIL | PASS | Janji yang jamnya lewat tidak pernah jadi "Selesai" (B2). |
| C11 | Konsultasi (tab Tentang/Pengalaman/Pendidikan, chat), Grooming, Vaksinasi, Penitipan, Trainer sampai bayar | PASS | PASS | Total tiap layanan dicek. |
| D12 | Kode promo: kosong, salah, benar, kode sama dua kali ditolak, poin bertambah tepat | PASS | PASS | |
| D13 | Tukar poin (kurang dan cukup), Voucher Saya, detail voucher, Riwayat 2 tab, pakai voucher di Bayar | PASS | PASS | Poin akhir 300 + 82 diverifikasi. |
| E14 | Artikel: carousel, filter, cari, bookmark, Tersimpan, baca, bagikan, Artikel lainnya | tinjauan kode | PASS | Tombol Bagikan tidak memberi respons bila gagal (B6). |
| E15 | Adopt Me: filter, detail, Selengkapnya, validasi form, survei masuk Booking | FAIL | PASS | Kartu Booking tidak menampilkan jenis layanan (B3). |
| F16 | Profil (validasi), tambah/ubah/hapus hewan, Tersimpan (4 jenis) | PASS | PASS | |
| F17 | Pengaturan: 9 baris, Beri Rating, Keluar | PASS | PASS | |
| G18 | Mode tamu: ajakan masuk di Booking/Reward/Akun, Jadwalkan dan Adopsi minta login lalu kembali | tinjauan kode | PASS | Setelah login, aksi tidak dilanjutkan (B5). |
| G19 | Reload di tengah alur, tombol back HP/browser | tinjauan kode | PASS | Reload selalu kembali ke Beranda dan back bisa "mati" (B4). |
| G20 | Tanpa scroll horizontal, tanpa teks keluar layar, konten tidak tertutup nav/bilah bawah, area sentuh 44px, tidak ada dead-end | FAIL | PASS | 303 temuan area sentuh sebelum perbaikan, 0 sesudahnya (B7, B8). |
| Z1 | Tombol Booking polos `#fdb515` tanpa outline/border/shadow, juga saat fokus keyboard | tinjauan kode | PASS | Outline biru dari aturan fokus global (B9). |
| Z2 | Logo asli lewat `Wordmark`, proporsional, tidak terpotong | SKIP | PASS | Splash, onboarding, welcome, favicon. |

## Bug yang ditemukan dan perbaikannya

| ID | Masalah | Perbaikan | Berkas |
|---|---|---|---|
| B1 | Sheet jadwal (`role="dialog"`) tanpa nama untuk pembaca layar. | `Sheet` menerima `label`; `JadwalSheet` mengisinya dengan judul. | `src/ui.tsx`, `src/screens/Flow.tsx` |
| B2 | Janji yang waktunya lewat tetap "Terjadwal" selamanya, jadi ulasan dan Pesan Lagi tidak terjangkau pengguna nyata. | `effStatus()`: janji lebih dari 1 jam lewat dianggap Selesai. Dipakai di daftar, detail, dan hitungan di Akun. | `src/store.tsx`, `Flow.tsx`, `Akun.tsx` |
| B3 | Kartu di tab Booking tidak menampilkan layanan (konsultasi, vaksin, survei adopsi tampak sama di klinik yang sama). | Baris layanan oranye di bawah nama dokter/tim. | `src/screens/Booking.tsx` |
| B4 | Back/reload: pindah tab dan `reset` menyisakan entri history lama, jadi back "mati" beberapa kali lalu keluar app. Reload di tengah alur melempar ke Beranda. | Tumpukan layar disimpan di `history.state`. Satu layar = satu entri. Dari tab mana pun back ke Beranda. Reload mengembalikan layar yang sama. Setelah login, back tidak kembali ke form Masuk. | `src/App.tsx` |
| B5 | Jadwalkan dan Ajukan Adopsi sebagai tamu: setelah login pengguna dikembalikan ke halaman detail tapi harus menekan tombol lagi. | `useRequireLogin(key, resume)`: aksi dilanjutkan otomatis (sheet jadwal terbuka, form adopter terbuka). | `src/hooks.ts`, `ClinicDetail.tsx`, `DoctorDetail.tsx`, `Adopt.tsx` |
| B6 | Tombol Bagikan (Artikel, Komunitas) tidak melakukan apa-apa saat Web Share/clipboard tidak tersedia (misalnya dev lewat `http://IP-LAN`). | Muncul toast penjelasan. Batal manual tetap diam. | `Artikel.tsx`, `Settings.tsx` |
| B7 | 303 kontrol berukuran di bawah 44px (chip filter 34px, Kembali 34px, Lihat Detail 34px, ikon header 38px, switch 28px, dll). | Area klik diperluas tak terlihat lewat `button::after` (visual sama dengan Figma). Padding bawah baris chip 4px menjadi 5px agar perluasan tidak memicu scroll vertikal. Label checkbox adopsi diberi `min-h-[44px]`. | `src/index.css`, 4 layar |
| B8 | Bilah Pembayaran/Detail Reward bisa menutupi baris terakhir (Syarat & Ketentuan) di 360px karena tinggi bilah berubah saat pesan "Poin kamu kurang" muncul. | `Page` mengukur tinggi bilah bawah (`ResizeObserver`) dan menyesuaikan ruang di bawah konten. | `src/ui.tsx` |
| B9 | Tombol Booking kena outline biru `#3846c9` dari aturan `:focus-visible` global saat difokus keyboard. | Aturan khusus: tanpa outline/shadow, fokus ditandai garis bawah pada label. Lingkaran tetap polos `#fdb515`. | `src/index.css` |
| B10 | `Wordmark` mengabaikan prop `size` begitu `logo.png` ada (gambar tampil di ukuran aslinya, bisa terpotong). | Tinggi logo mengikuti `size`, lebar otomatis, maksimum 100% lebar. Diverifikasi dengan logo pengganti sementara (sudah dihapus). | `src/ui.tsx` |

Tidak ada commit: folder ini bukan repositori git, jadi perbaikan tidak bisa dipisah per komit.

## Cek lain yang dijalankan

- Scroll horizontal: tidak ada di 31 layar x 3 lebar (360/393/430). Tidak ada elemen yang melewati tepi bingkai.
- Dead-end: semua layar non-tab punya tombol Kembali.
- Konten terakhir tidak tertutup nav bawah atau bilah tombol di semua layar yang diaudit.
- Umpan balik klik: bookmark klinik dan dokter muncul di bawah 300 ms (diukur di dalam halaman).
- Keyboard virtual: di 360x360 tombol "Jadwalkan Survey", kolom chat, dan tombol "Buat Akun" tetap terjangkau.
- Console: tanpa error dan warning.

## Butuh keputusan manusia

1. **`public/img/logo.png` tidak ada di folder ini.** Prompt menyebut file itu ada. Selama belum ada, splash, onboarding, welcome, dan favicon memakai wordmark teks cadangan. Letakkan file aslinya (PNG transparan) lalu jalankan `npm run e2e`. Tes Z2 akan memeriksa rasio, pemotongan, dan favicon. Saya tidak mengarang logo.
2. **Aset gambar lain** (`banner.png`, `klinik-hero.png`, foto dokter, ikon `nav-paw.png`, dst.) juga belum ada, jadi layar memakai placeholder. Tidak dianggap bug, tapi tampilan belum sama dengan Figma sampai aset diletakkan.
3. **Kekuatan password**: aturannya hanya minimal 6 karakter, jadi `123456` lolos. Mau diperketat (huruf + angka)? Itu perubahan perilaku, jadi saya tidak mengubahnya.
4. **Login masih demo**: email dan password apa pun diterima.
5. **Back di Beranda** keluar dari app (perilaku browser/OS yang wajar). Bila ingin "tekan sekali lagi untuk keluar", itu fitur baru.
6. Janji dianggap Selesai 1 jam setelah jam mulai. Ubah angka di `effStatus` bila aturan bisnisnya berbeda.

## Batasan pengujian

Diuji di Chromium emulasi (bukan perangkat fisik atau Safari iOS). Pemilih tanggal asli (`input type=date`) diuji lewat pengisian nilai, bukan dialog bawaan OS. Gestur geser memakai event touch CDP.

## Tambahan: kalender bulanan dan geser dengan mouse

- **Kalender bulanan** (`CalendarSheet` di `Flow.tsx`) menggantikan pemilih tanggal bawaan browser. Dipakai di semua `JadwalSheet`, termasuk ubah jadwal dari Detail Janji. Tes C8 menguji: buka, panah bulan, pilih tanggal, sheet tertutup, chip dan teks tanggal berubah, batas 90 hari.
- **Geser horizontal dengan mouse**: hook `useDragScroll` (`src/hooks.ts`) dan komponen `DragRow` (`src/ui.tsx`) dipasang di 11 baris: Home (2), Artikel (chip, Pilihan untuk kamu, Artikel lainnya), chip Daftar layanan, Booking, Adopt, tanggal di sheet jadwal, dan onboarding. Panah 44px hanya di layar >= sm dan hilang di ujung.
- **Isi tambahan**: Artikel jadi 8 (topik Kelinci dan Hamster) sehingga chip filter ada 7.
- Tes H1 (laptop 1280x800, mouse drag, klik setelah drag dibatalkan, panah, trackpad, shift+roda) dan H2 (HP 393x852, swipe jari) lulus dengan console bersih dan tanpa scroll horizontal.
