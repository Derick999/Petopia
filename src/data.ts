export type Clinic = {
  id: string; name: string; animals: string; km: number; hours: string; rating: number; reviews: number;
  address: string; photo: string; tag?: string;
};

export const CLINICS: Clinic[] = [
  { id: 'medisani', name: 'Klinik Medisani - Mangga Besar', animals: 'Anjing & Kucing, Hewan Kecil', km: 1.2, hours: '21:00', rating: 4.9, reviews: 191, address: 'Jalan Mangga Besar Kec. Anggur No. 14', photo: 'klinik1.png' },
  { id: 'awalcare', name: 'Klinik Awal Care - Kebon Jeruk', animals: 'Anjing & Kucing, Hewan Kecil', km: 5.9, hours: '24:00', rating: 4.5, reviews: 165, address: 'Jalan Kebon Jeruk Raya No. 21', photo: 'klinik2.png' },
  { id: 'petovet', name: 'Petovet - Grogol Petamburan', animals: 'Anjing & Kucing, Hewan Kecil', km: 8.2, hours: '21:00', rating: 4.8, reviews: 189, address: 'Jalan Grogol Petamburan No. 8', photo: 'klinik3.png' },
  { id: 'kasihsatwa', name: 'Klinik Kasih Satwa - Pademangan', animals: 'Anjing & Kucing, Hewan Kecil', km: 15.7, hours: '24:00', rating: 4.2, reviews: 130, address: 'Jalan Pademangan Timur No. 5', photo: 'klinik4.png' },
];

export const GROOMING: Clinic[] = [
  CLINICS[0],
  { ...CLINICS[3] },
  { id: 'animalsgrooming', name: 'Animals Grooming - Kedoya Utara', animals: 'Anjing & Kucing', km: 15.7, hours: '24:00', rating: 4.2, reviews: 130, address: 'Jalan Kedoya Utara No. 3', photo: 'klinik3.png' },
  { id: 'happypets', name: 'Happy Pets - Kemayoran', animals: 'Anjing & Kucing', km: 15.7, hours: '24:00', rating: 4.2, reviews: 130, address: 'Jalan Kemayoran No. 17', photo: 'klinik4.png' },
];

export const VAKSINASI: Clinic[] = [
  CLINICS[0],
  CLINICS[3],
  { id: 'howla', name: 'Klinik Howla - Petamburan', animals: 'Anjing & Kucing', km: 15.7, hours: '24:00', rating: 4.2, reviews: 130, address: 'Jalan Petamburan No. 12', photo: 'klinik3.png' },
];

export const PENITIPAN: Clinic[] = [{ ...CLINICS[0], tag: 'Weekend' }];

export type Person = {
  id: string; name: string; animals: string; place: string; years: number; rating: number; reviews: number;
  satisfied: number; price: number; photo: string; gender: 'Pria' | 'Wanita';
};

export const DOCTORS: Person[] = [
  { id: 'anika', name: 'Drh. Anika Yustika', animals: 'Anjing & Kucing, Hewan Kecil', place: 'Praktik di Klinik Sentosa, Pademangan', years: 7, rating: 4.8, reviews: 210, satisfied: 96, price: 25000, photo: 'drh1.png', gender: 'Wanita' },
  { id: 'santika', name: 'Drh. Santika Mutiara', animals: 'Anjing & Kucing', place: 'Praktik di Klinik Mangga Besar', years: 5, rating: 4.9, reviews: 123, satisfied: 97, price: 30000, photo: 'doc1.png', gender: 'Wanita' },
  { id: 'mariska', name: 'Drh. Mariska Putri', animals: 'Kucing, Hewan Kecil', place: 'Praktik di Klinik Pademangan', years: 3, rating: 4.9, reviews: 112, satisfied: 95, price: 20000, photo: 'doc2.png', gender: 'Wanita' },
  { id: 'sulistyo', name: 'Drh. Sulistyo Hadi', animals: 'Anjing, Burung', place: 'Praktik di Klinik Pademangan', years: 11, rating: 4.7, reviews: 301, satisfied: 93, price: 45000, photo: 'doc3.png', gender: 'Pria' },
  { id: 'bagas', name: 'Drh. Bagas Pratama', animals: 'Anjing & Kucing, Reptil', place: 'Praktik di Petovet, Grogol', years: 8, rating: 4.6, reviews: 144, satisfied: 91, price: 35000, photo: 'drh2.png', gender: 'Pria' },
];
export const TRAINERS: Person[] = [
  { id: 'agus', name: 'Agus Sunarto', animals: 'Anjing & Kucing, Hewan Kecil', place: 'Praktik di Klinik Sentosa, Pademangan', years: 9, rating: 4.8, reviews: 210, satisfied: 94, price: 35000, photo: 'trainer1.png', gender: 'Pria' },
  { id: 'dewi', name: 'Dewi Lestari', animals: 'Anjing', place: 'Praktik di Happy Pets, Kemayoran', years: 6, rating: 4.7, reviews: 98, satisfied: 92, price: 40000, photo: 'trainer2.png', gender: 'Wanita' },
  { id: 'rangga', name: 'Rangga Saputra', animals: 'Anjing & Kucing', place: 'Praktik di Animals Grooming, Kedoya', years: 4, rating: 4.5, reviews: 76, satisfied: 90, price: 30000, photo: 'trainer3.png', gender: 'Pria' },
];

export const rupiah = (n: number) => 'Rp. ' + n.toLocaleString('id-ID');


/* ---------- Layanan klinik ---------- */
export type Cat = 'konsultasi' | 'vaksinasi' | 'grooming' | 'penitipan' | 'lainnya';
export const SERVICES: { id: string; name: string; price: number; cat: Cat }[] = [
  { id: 's1', name: 'Konsultasi dokter hewan', price: 75000, cat: 'konsultasi' },
  { id: 's2', name: 'Vaksinasi lengkap', price: 150000, cat: 'vaksinasi' },
  { id: 's3', name: 'Grooming & mandi', price: 90000, cat: 'grooming' },
  { id: 's4', name: 'Sterilisasi', price: 650000, cat: 'lainnya' },
  { id: 's5', name: 'Penitipan per hari', price: 120000, cat: 'penitipan' },
];
export const FACILITIES = ['Ruang operasi steril', 'Ruang rawat inap ber-AC', 'Ruang tunggu nyaman', 'Apotek & pet food', 'Parkir luas'];

export const LOCATIONS = [
  'Karang Bolong', 'Pademangan', 'Mangga Besar', 'Kebon Jeruk', 'Grogol Petamburan', 'Kemayoran', 'Kedoya Utara',
  'Ancol', 'Sunter', 'Tanjung Priok', 'Kelapa Gading', 'Gambir',
];

/* ---------- Artikel ---------- */
export type Article = { id: string; title: string; topic: string; author: string; read: number; date: string; photo: string; body: string[] };
export const ARTICLE_TOPICS = ['Perawatan Kucing', 'Perawatan Anjing', 'Perawatan Burung', 'Perawatan Kelinci', 'Perawatan Hamster'];
export const ARTICLES: Article[] = [
  { id: 'a1', title: '5 Cara Merawat Kucing Anakan agar Sehat dan Aktif', topic: 'Perawatan Kucing', author: 'Drh. Anika Yustika', read: 4, date: '12 Okt 2026', photo: 'artikel1.png',
    body: ['Kucing anakan butuh perhatian ekstra pada minggu-minggu pertama. Pastikan ia mendapat makanan khusus kitten dengan kandungan protein tinggi, diberikan 3 sampai 4 kali sehari dalam porsi kecil.',
      'Jadwalkan vaksinasi pertama pada usia 8 sampai 9 minggu, lalu lanjutkan sesuai anjuran dokter hewan. Jangan lupa obat cacing rutin setiap bulan hingga usia 6 bulan.',
      'Sediakan kotak pasir yang bersih, tempat tidur hangat, dan mainan sederhana. Bermain 15 menit dua kali sehari membantu melatih otot dan mengurangi stres.',
      'Kalau kucing terlihat lesu, menolak makan lebih dari sehari, atau mencret, segera konsultasikan ke dokter hewan.'] },
  { id: 'a2', title: 'Kenali Tanda Kucing Stres dan Cara Menenangkannya', topic: 'Perawatan Kucing', author: 'Drh. Santika Mutiara', read: 5, date: '3 Okt 2026', photo: 'artikel2.png',
    body: ['Kucing yang stres biasanya bersembunyi, menggaruk furnitur berlebihan, atau buang air di luar kotak pasir. Perubahan nafsu makan juga bisa jadi tanda.',
      'Penyebab umum antara lain pindah rumah, anggota baru, atau suara bising. Beri ruang aman dengan kardus atau rumah kucing di sudut yang tenang.',
      'Feromon sintetis dan rutinitas yang konsisten terbukti membantu. Kalau gejala berlangsung lebih dari seminggu, periksakan ke dokter hewan.'] },
  { id: 'a3', title: 'Panduan Memandikan Anjing di Rumah Tanpa Drama', topic: 'Perawatan Anjing', author: 'Agus Sunarto', read: 6, date: '28 Sep 2026', photo: 'artikel3.png',
    body: ['Mandikan anjing sebulan sekali, atau lebih jarang untuk ras berbulu tebal. Terlalu sering mandi bisa menghilangkan minyak alami kulit.',
      'Gunakan sampo khusus anjing dengan air hangat suam-suam kuku. Hindari area mata dan telinga, lalu bilas sampai benar-benar bersih.',
      'Keringkan dengan handuk, lalu hairdryer pada suhu rendah. Beri camilan sebagai hadiah supaya mandi jadi pengalaman menyenangkan.'] },
  { id: 'a4', title: 'Jadwal Vaksinasi Anjing dari Anakan Sampai Dewasa', topic: 'Perawatan Anjing', author: 'Drh. Sulistyo Hadi', read: 5, date: '20 Sep 2026', photo: 'artikel4.png',
    body: ['Vaksin dasar anjing dimulai pada usia 6 sampai 8 minggu, lalu diulang tiap 3 sampai 4 minggu sampai usia 16 minggu.',
      'Vaksin rabies diberikan pada usia 12 minggu dan diulang setahun sekali. Simpan buku vaksinasi dengan baik, karena sering diminta saat penitipan.',
      'Pastikan anjing dalam kondisi sehat saat divaksin. Dokter hewan akan memeriksa suhu tubuh dan berat badan terlebih dulu.'] },
  { id: 'a5', title: 'Merawat Burung Kicau: Pakan, Jemur, dan Kandang', topic: 'Perawatan Burung', author: 'Drh. Bagas Pratama', read: 4, date: '15 Sep 2026', photo: 'artikel5.png',
    body: ['Burung kicau perlu dijemur pagi hari sekitar 30 menit sebelum jam 9 supaya mendapat vitamin D alami.',
      'Kombinasikan voer berkualitas dengan buah dan serangga sebagai variasi. Ganti air minum setiap hari dan bersihkan kandang minimal dua hari sekali.',
      'Waspadai tanda sakit seperti bulu mengembang, mata sayu, dan kotoran berair. Segera bawa ke dokter hewan unggas.'] },
  { id: 'a6', title: 'Memilih Pakan Burung Lovebird yang Tepat', topic: 'Perawatan Burung', author: 'Drh. Bagas Pratama', read: 3, date: '2 Sep 2026', photo: 'artikel6.png',
    body: ['Lovebird membutuhkan campuran biji-bijian, sayur, dan sedikit buah. Hindari pakan manis berlebihan.',
      'Berikan pakan segar dua kali sehari dan sisihkan cangkang bekas supaya kandang tetap bersih.',
      'Tambahkan cuttlebone atau mineral block untuk kebutuhan kalsium.'] },
  { id: 'a7', title: 'Merawat Kelinci: Pakan Serat, Kandang, dan Waktu Bermain', topic: 'Perawatan Kelinci', author: 'Drh. Mariska Putri', read: 4, date: '28 Agu 2026', photo: 'artikel7.png',
    body: ['Sebagian besar makanan kelinci harus berupa rumput kering atau hay. Serat membantu pencernaan dan menjaga gigi yang terus tumbuh tetap aus.',
      'Beri sayuran segar dalam porsi kecil dan batasi buah karena kandungan gulanya tinggi. Air minum harus selalu tersedia dan diganti setiap hari.',
      'Kelinci butuh keluar kandang minimal beberapa jam sehari untuk bergerak. Pastikan area bermain aman dari kabel dan tanaman beracun.'] },
  { id: 'a8', title: 'Panduan Memulai Memelihara Hamster untuk Pemula', topic: 'Perawatan Hamster', author: 'Drh. Santika Mutiara', read: 3, date: '14 Agu 2026', photo: 'artikel8.png',
    body: ['Hamster aktif di malam hari, jadi tempatkan kandang di ruangan yang tenang agar tidurnya siang tidak terganggu.',
      'Sediakan roda putar berukuran sesuai, alas kandang yang bersih, dan pakan biji-bijian khusus hamster. Ganti alas secara berkala.',
      'Hindari memegang hamster mendadak. Biarkan ia terbiasa dengan aroma tanganmu lebih dulu.'] },
];

/* ---------- Adopt Me ---------- */
export type Adopt = { id: string; name: string; type: 'Anjing' | 'Kucing' | 'Lainnya'; breed: string; age: string; gender: 'Jantan' | 'Betina'; place: string; vaccinated: boolean; about: string; photo: string };
export const ADOPTS: Adopt[] = [
  { id: 'd1', name: 'Bruno', type: 'Anjing', breed: 'Golden Retriever Mix', age: '1 tahun', gender: 'Jantan', place: 'Shelter Pademangan', vaccinated: true, photo: 'adopt1.png',
    about: 'Bruno ramah, suka bermain bola, dan sudah terbiasa dengan anak-anak. Ia sudah steril dan divaksin lengkap. Bruno butuh keluarga yang punya halaman atau rutin mengajaknya jalan pagi. Ia cepat belajar perintah dasar seperti duduk dan tunggu, serta nyaman ditinggal beberapa jam asalkan punya mainan kunyah.' },
  { id: 'k1', name: 'Mochi', type: 'Kucing', breed: 'Domestik Kampung', age: '8 bulan', gender: 'Betina', place: 'Rumah Singgah Kemayoran', vaccinated: true, photo: 'adopt2.png',
    about: 'Mochi manja dan senang tidur di pangkuan. Sudah terbiasa memakai kotak pasir dan akrab dengan kucing lain. Ia sudah divaksin dan diberi obat cacing. Cocok untuk apartemen atau rumah kecil.' },
  { id: 'k2', name: 'Oreo', type: 'Kucing', breed: 'Bicolor', age: '2 tahun', gender: 'Jantan', place: 'Shelter Pademangan', vaccinated: true, photo: 'adopt3.png',
    about: 'Oreo tenang dan mandiri. Ia suka mengamati dari jendela dan tidak rewel soal makanan. Cocok untuk pemilik yang bekerja seharian. Sudah steril.' },
  { id: 'd2', name: 'Luna', type: 'Anjing', breed: 'Pomeranian Mix', age: '3 tahun', gender: 'Betina', place: 'Rumah Singgah Kemayoran', vaccinated: false, photo: 'adopt4.png',
    about: 'Luna penyayang tapi pemalu pada orang baru. Butuh pendekatan sabar di minggu pertama. Vaksinasi lanjutan dapat dijadwalkan bersama pengadopsi.' },
  { id: 'l1', name: 'Bunny', type: 'Lainnya', breed: 'Kelinci Holland Lop', age: '6 bulan', gender: 'Betina', place: 'Shelter Pademangan', vaccinated: false, photo: 'adopt5.png',
    about: 'Bunny aktif dan suka sayuran segar. Butuh kandang luas dan waktu bermain di luar kandang setiap hari. Tidak cocok dengan anjing yang agresif.' },
  { id: 'k3', name: 'Simba', type: 'Kucing', breed: 'Persia Mix', age: '1,5 tahun', gender: 'Jantan', place: 'Rumah Singgah Kemayoran', vaccinated: true, photo: 'adopt6.png',
    about: 'Simba berbulu lebat dan butuh disisir rutin. Sifatnya lembut dan senang dielus. Sudah steril, divaksin, dan terlatih memakai kotak pasir.' },
];

/* ---------- Bantuan ---------- */
export const FAQ = [
  ['Bagaimana cara membuat janji temu?', 'Pilih layanan di Beranda, buka klinik atau dokter yang kamu mau, lalu tekan Jadwalkan. Pilih hewan, tanggal, dan jam, lalu selesaikan pembayaran.'],
  ['Apakah janji bisa dibatalkan?', 'Bisa. Buka tab Booking, pilih janji, lalu tekan Batalkan. Pembatalan maksimal 2 jam sebelum jadwal akan mengembalikan dana penuh.'],
  ['Bagaimana cara memakai voucher?', 'Voucher yang kamu miliki muncul di halaman Pembayaran. Pilih voucher yang sesuai dengan layanan, diskon langsung terhitung.'],
  ['Bagaimana cara mengumpulkan poin?', 'Kamu mendapat poin setiap menyelesaikan pembayaran, dan bisa menambah dengan kode promo di halaman Reward.'],
  ['Bagaimana mengubah data hewan?', 'Buka tab Akun, pilih hewan di bagian Hewan Saya, lalu ubah datanya.'],
];

export const PAYMENTS = [
  { id: 'gopay', name: 'GoPay', note: 'Saldo e-wallet' },
  { id: 'ovo', name: 'OVO', note: 'Saldo e-wallet' },
  { id: 'dana', name: 'DANA', note: 'Saldo e-wallet' },
  { id: 'bca', name: 'Transfer Bank BCA', note: 'Virtual account' },
  { id: 'klinik', name: 'Bayar di Klinik', note: 'Tunai atau kartu saat datang' },
];

/* Kode promo demo */
export const PROMO_CODES: Record<string, { points: number; text: string }> = {
  PETOPIA25: { points: 25, text: 'Kamu mendapat 25 poin.' },
  SAYANGHEWAN: { points: 100, text: 'Kamu mendapat 100 poin.' },
  PETOPIA250: { points: 250, text: 'Kamu mendapat 250 poin.' },
};

export const REWARD_TIERS = [
  { name: 'Pecinta Hewan', xp: 0 },
  { name: 'Sahabat Hewan', xp: 400 },
  { name: 'Pahlawan Hewan', xp: 1000 },
];

export type Voucher = { id: string; title: string; desc: string; pct?: number; flat?: number; max?: number; min: number; cats?: Cat[]; excl?: Cat[]; expire: string };

export const WELCOME: Voucher = {
  id: 'welcome', title: 'Welcome Voucher Diskon 50%', desc: 'Diskon 50% dengan minimum transaksi Rp 75.000, maksimal diskon Rp 20.000.',
  pct: 50, max: 20000, min: 75000, excl: ['vaksinasi', 'konsultasi'], expire: '31 Des 2026',
};

export const COUPONS = [
  { id: 'c1', type: 'Grooming', title: 'Voucher Layanan Grooming Rp 10.000', cost: 200, img: 'voucher-grooming.png',
    v: { flat: 10000, min: 50000, cats: ['grooming'] as Cat[], expire: '31 Des 2026' } },
  { id: 'c2', type: 'Vaksinasi', title: 'Voucher Layanan Vaksinasi Rp 10.000', cost: 200, img: 'voucher-vaksin.png',
    v: { flat: 10000, min: 50000, cats: ['vaksinasi'] as Cat[], expire: '31 Des 2026' } },
  { id: 'c3', type: 'Penitipan', title: 'Voucher Layanan Pet Hotel Rp 10.000', cost: 200, img: 'voucher-pethotel.png',
    v: { flat: 10000, min: 50000, cats: ['penitipan'] as Cat[], expire: '31 Des 2026' } },
];

export function voucherDiscount(v: Voucher, cat: Cat, price: number): number {
  if (price < v.min) return 0;
  if (v.cats && !v.cats.includes(cat)) return 0;
  if (v.excl && v.excl.includes(cat)) return 0;
  let d = v.pct ? Math.round((price * v.pct) / 100) : v.flat ?? 0;
  if (v.max) d = Math.min(d, v.max);
  return Math.min(d, price);
}

export type PetT = { id: string; name: string; type: string; breed: string; age: string; photo?: string; sex?: string; weight?: string };
export const PETS: PetT[] = [
  { id: 'p1', name: 'Cimory', type: 'Anjing', breed: 'Poodle', age: '2 tahun', photo: 'pet1.png' },
  { id: 'p2', name: 'Haciko', type: 'Anjing', breed: 'Poodle', age: '4 tahun', photo: 'pet2.png' },
];

/* Tanggal & waktu */
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayIso = () => iso(new Date());
export const parseIso = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtDate = (s: string) => parseIso(s).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const fmtShort = (s: string) => parseIso(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
export const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

export const SLOTS = {
  Pagi: ['08:00', '09:00', '10:00', '11:00'],
  Siang: ['13:00', '14:00', '15:00'],
  Sore: ['16:00', '17:00', '18:00'],
} as const;
