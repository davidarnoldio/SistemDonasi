/**
 * Konfigurasi kampanye donasi KasihBersama.
 * Mengacu pada desain Figma (landing-page-redesain.svg).
 * Data donasi (raised, percentage, donorCount) berawal dari 0 (kosong)
 * dan dihitung secara dinamis dari donasi nyata yang telah diverifikasi admin.
 */

export const CATEGORIES = [
  'Semua',
  'Medis & Kesehatan',
  'Bencana Alam',
  'Panti Asuhan',
  'Pendidikan',
]

export const campaigns = [
  {
    id: 1,
    slug: 'operasi-jantung-bayi-alesha',
    title: 'Bantu Operasi Jantung Bayi Alesha (6 Bulan)',
    organizer: 'Yayasan Peduli Anak Sehat',
    category: 'Medis & Kesehatan',
    target: 50000000,
    raised: 0,
    percentage: 0,
    daysLeft: 12,
    donorCount: 0,
    image: '/illustrations/medis.svg',
    heroImage: '/illustrations/hero.svg',
    isFeatured: true,
    verified: true,
    beneficiary: 'Alesha & Keluarga',
    description:
      'Bayi Alesha (6 bulan) didiagnosis menderita kelainan jantung bawaan kompleks dan membutuhkan tindakan operasi segera di RS Jantung Nasional.',
    story:
      'Bayi Alesha (6 bulan) didiagnosis menderita kelainan jantung bawaan kompleks (Tetralogy of Fallot) dan membutuhkan tindakan operasi segera di RS Jantung Nasional. Orang tua Alesha bekerja sebagai buruh harian lepas dan sangat membutuhkan uluran tangan kita semua untuk biaya tindakan medis dan pemulihan.',
  },
  {
    id: 2,
    slug: 'rumah-layak-korban-banjir-garut',
    title: 'Rumah Layak untuk Korban Banjir Bandang Garut',
    organizer: 'Relawan Nusantara',
    category: 'Bencana Alam',
    target: 200000000,
    raised: 0,
    percentage: 0,
    daysLeft: 21,
    donorCount: 0,
    image: '/illustrations/bencana.svg',
    heroImage: '/illustrations/bencana.svg',
    isFeatured: false,
    verified: true,
    beneficiary: '15 KK Warga Garut',
    description:
      'Banjir bandang menerjang pemukiman warga di Garut dan menghanyutkan puluhan rumah. Mari bersama bantu bangun kembali hunian sementara dan layak.',
    story:
      'Banjir bandang menerjang pemukiman warga di Garut dan menghanyutkan puluhan rumah. Sebanyak 15 kepala keluarga kehilangan tempat tinggal dan harta benda mereka. Donasi yang terkumpul akan digunakan untuk pengadaan material bangunan, perbaikan sanitasi air bersih, dan sembako.',
  },
  {
    id: 3,
    slug: 'makan-bergizi-sekolah-anak-panti-al-ikhlas',
    title: 'Makan Bergizi & Kebutuhan Sekolah Anak Panti Al-Ikhlas',
    organizer: 'Panti Asuhan Al-Ikhlas',
    category: 'Panti Asuhan',
    target: 30000000,
    raised: 0,
    percentage: 0,
    daysLeft: 30,
    donorCount: 0,
    image: '/illustrations/panti.svg',
    heroImage: '/illustrations/panti.svg',
    isFeatured: false,
    verified: true,
    beneficiary: '45 Anak Panti Al-Ikhlas',
    description:
      'Panti Asuhan Al-Ikhlas merawat 45 anak yatim dan dhuafa. Donasi Anda membantu pemenuhan makanan bergizi harian, seragam, dan buku pelajaran.',
    story:
      'Panti Asuhan Al-Ikhlas saat ini merawat dan mengasuh 45 anak yatim, piatu, dan dhuafa usia sekolah dasar hingga menengah. Kebutuhan pangan bergizi harian serta biaya perlengkapan sekolah seperti buku, tas, dan seragam sangat memerlukan dukungan donatur.',
  },
  {
    id: 4,
    slug: 'beasiswa-pendidikan-50-anak-pelosok-papua',
    title: 'Beasiswa Pendidikan untuk 50 Anak Pelosok Papua',
    organizer: 'Gerakan Guru Berbagi',
    category: 'Pendidikan',
    target: 100000000,
    raised: 0,
    percentage: 0,
    daysLeft: 18,
    donorCount: 0,
    image: '/illustrations/pendidikan.svg',
    heroImage: '/illustrations/pendidikan.svg',
    isFeatured: false,
    verified: true,
    beneficiary: '50 Siswa Pelosok Papua',
    description:
      'Memberikan akses pendidikan dan beasiswa lengkap bagi 50 putra-putri berprestasi di pelosok Papua agar dapat terus bersekolah.',
    story:
      'Program beasiswa pendidikan berkelanjutan bagi 50 siswa-siswi di daerah 3T Papua. Bantuan mencakup biaya sekolah, perlengkapan belajar, buku paket, bimbingan belajar tambahan, serta nutrisi penunjang tumbuh kembang siswa.',
  },
  {
    id: 5,
    slug: 'biaya-cuci-darah-rutin-bapak-sutrisno',
    title: 'Biaya Cuci Darah Rutin Bapak Sutrisno',
    organizer: 'Komunitas Sehat Bersama',
    category: 'Medis & Kesehatan',
    target: 25000000,
    raised: 0,
    percentage: 0,
    daysLeft: 7,
    donorCount: 0,
    image: '/illustrations/cuci.svg',
    heroImage: '/illustrations/cuci.svg',
    isFeatured: false,
    verified: true,
    beneficiary: 'Bapak Sutrisno & Keluarga',
    description:
      'Bapak Sutrisno berjuang melawan gagal ginjal kronis stadium akhir dan harus menjalani cuci darah 2 kali seminggu.',
    story:
      'Bapak Sutrisno (54 tahun) adalah tulang punggung keluarga yang kini tidak dapat bekerja secara optimal karena menderita gagal ginjal kronis stadium akhir. Diperlukan cuci darah rutin setiap pekan serta obat penunjang yang tidak seluruhnya dicover asuransi.',
  },
  {
    id: 6,
    slug: 'bangun-kembali-mushola-pascagempa-cianjur',
    title: 'Bangun Kembali Mushola & Panti Pascagempa Cianjur',
    organizer: 'Dompet Peduli Umat',
    category: 'Bencana Alam',
    target: 80000000,
    raised: 0,
    percentage: 0,
    daysLeft: 25,
    donorCount: 0,
    image: '/illustrations/mushola.svg',
    heroImage: '/illustrations/mushola.svg',
    isFeatured: false,
    verified: true,
    beneficiary: 'Masyarakat & Santri Cianjur',
    description:
      'Gempa bumi meruntuhkan fasilitas ibadah dan asrama belajar santri di Cianjur. Uluran tangan Anda membantu proses pembangunan kembali mushola.',
    story:
      'Dampak gempa bumi merusak struktur mushola dan ruang belajar santri sehingga tidak aman digunakan. Pembangunan kembali secara permanen dengan struktur tahan gempa akan mengembalikan tempat ibadah dan sarana mengaji bagi ratusan warga dan anak santri sekitar.',
  },
]

export const fallbackCampaign = campaigns[0]
export const campaign = fallbackCampaign

export function getCampaignBySlug(slug) {
  return campaigns.find((c) => c.slug === slug) || fallbackCampaign
}

/**
 * Aturan donasi. Batas ini HARUS sama dengan CHECK constraint di
 * supabase/schema.sql (amount, donor_name, message).
 */
export const DONATION_RULES = {
  minAmount: 10000,
  maxAmount: 50000000,
  maxNameLength: 80,
  maxMessageLength: 200,
}

/** Chip nominal cepat di Langkah 1 */
export const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 250000]
