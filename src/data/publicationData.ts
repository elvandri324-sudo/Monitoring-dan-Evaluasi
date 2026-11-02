import { KnowledgeProduct, StoryOfChange, MediaCoverage } from '../types';

export const INITIAL_KNOWLEDGE_PRODUCTS: KnowledgeProduct[] = [
  {
    id: 'kp-01',
    projectId: 'proj-01',
    type: 'Infografis / Factsheet',
    title: 'Factsheet Plasma-B: Gambaran Capaian Konservasi & Pemberdayaan Masyarakat',
    description: 'Lembar fakta ringkas menyajikan data capaian kuantitatif program perlindungan keanekaragaman hayati, sebaran kelompok dampingan, serta indikator utama periode berjalan.',
    language: 'Bahasa Indonesia',
    publisherAuthor: 'Yayasan BINTARI & Konsorsium Mitra',
    contributeToOutputOutcome: 'Outcome 1 - Pengakuan Hukum & Tata Kelola Berkelanjutan',
    linkDocument: 'https://drive.google.com/file/d/sample-factsheet-plasma-b/view',
    fileFormat: 'PDF',
    fileSize: '2.4 MB',
    releaseDate: '2025-05-15',
    createdAt: '2025-05-15T09:00:00Z'
  },
  {
    id: 'kp-02',
    projectId: 'proj-01',
    type: 'Video & Audio / Podcast',
    title: 'Video Baseline Program: Suara Komunitas Penjaga Hutan dan Pesisir',
    description: 'Video dokumenter narasi baseline kondisi sosial ekonomi masyarakat, tantangan akses pengelolaan lingkungan, dan aspirasi perempuan adat.',
    language: 'Bahasa Indonesia',
    publisherAuthor: 'Tim Komunikasi & M&E BINTARI',
    contributeToOutputOutcome: 'Output 1.2 - Dokumentasi Kearifan Lokal & Pemetaan Partisipatif',
    linkDocument: 'https://youtube.com/watch?v=sample-video-baseline',
    fileFormat: 'Video',
    fileSize: '1080p Full HD',
    releaseDate: '2025-06-10',
    createdAt: '2025-06-10T10:30:00Z'
  },
  {
    id: 'kp-03',
    projectId: 'proj-01',
    type: 'Panduan / Modul / Buku',
    title: 'Flipchart Media Komunikasi Perubahan Perilaku (SBCC)',
    description: 'Buku panduan bergambar lembar balik (*flipchart*) yang digunakan fasilitator lapangan dan kader desa untuk mengedukasi warga tentang pemilahan sampah dari rumah.',
    language: 'Bahasa Indonesia',
    publisherAuthor: 'Yayasan BINTARI',
    contributeToOutputOutcome: 'Output 2.1 - Peningkatan Kapasitas & Edukasi Perilaku Masyarakat',
    linkDocument: 'https://drive.google.com/file/d/sample-flipchart-sbcc/view',
    fileFormat: 'PDF',
    fileSize: '8.7 MB',
    releaseDate: '2025-06-20',
    createdAt: '2025-06-20T14:15:00Z'
  },
  {
    id: 'kp-04',
    projectId: 'proj-01',
    type: 'Laporan / Kajian Baseline & Endline',
    title: 'Laporan Baseline SBCC & Perilaku Pengelolaan Lingkungan Saparua dan Banda',
    description: 'Laporan hasil riset dasar mengenai persepsi warga, volume timbulan sampah harian, kesiapan kelembagaan desa, dan kesenjangan fasilitas pengelolaan lingkungan.',
    language: 'Bahasa Indonesia',
    publisherAuthor: 'Tim Peneliti M&E BINTARI & Universitas Pattimura',
    contributeToOutputOutcome: 'Outcome 2 - Peningkatan Tata Kelola Kebersihan & Kelestarian Pesisir',
    linkDocument: 'https://drive.google.com/file/d/sample-laporan-baseline-sbcc-saparua-banda/view',
    fileFormat: 'PDF',
    fileSize: '4.1 MB',
    releaseDate: '2025-07-05',
    createdAt: '2025-07-05T11:00:00Z'
  },
  {
    id: 'kp-05',
    projectId: 'proj-01',
    type: 'Policy Brief / Kertas Kebijakan',
    title: 'Kertas Kebijakan: Model Pengakuan Perlindungan Hutan Adat dan Pengurangan Risiko Bencana',
    description: 'Rekomendasi kebijakan advokasi untuk Pemerintah Kabupaten terkait integrasi kearifan lokal hukum adat ke dalam Rencana Pembangunan Jangka Menengah Daerah (RPJMD).',
    language: 'Bahasa Indonesia',
    publisherAuthor: 'Aliansi Advokasi Kebijakan Lingkungan',
    contributeToOutputOutcome: 'Outcome 1 - Pengakuan Hukum & Regulasi Daerah',
    linkDocument: 'https://drive.google.com/file/d/sample-policy-brief-hutan-adat/view',
    fileFormat: 'PDF',
    fileSize: '1.8 MB',
    releaseDate: '2025-08-01',
    createdAt: '2025-08-01T08:30:00Z'
  },
  {
    id: 'kp-06',
    projectId: 'proj-01',
    type: 'Poster & Media Komunikasi (SBCC)',
    title: 'Poster Edukasi 3R & Pemilahan Sampah Organik-Anorganik Berbasis Komunitas',
    description: 'Media infografis visual berukuran A2 untuk dipasang di balai desa, posyandu, dan sekolah guna meningkatkan kesadaran pilah sampah mandiri.',
    language: 'Bahasa Indonesia',
    publisherAuthor: 'Yayasan BINTARI',
    contributeToOutputOutcome: 'Output 2.2 - Kampanye Publik & Sosialisasi Komunitas',
    linkDocument: 'https://drive.google.com/file/d/sample-poster-3r/view',
    fileFormat: 'Gambar',
    fileSize: '3.2 MB',
    releaseDate: '2025-08-15',
    createdAt: '2025-08-15T13:00:00Z'
  }
];

export const INITIAL_STORIES_OF_CHANGE: StoryOfChange[] = [
  {
    id: 'soc-01',
    projectId: 'proj-01',
    storyTitle: 'Marta Kristina: Dari Ibu Rumah Tangga Menjadi Penggerak Ekonomi Tenun & Kelola Sampah Desa Menjalin',
    storiesLocation: 'Desa Menjalin, Kabupaten Landak, Kalimantan Barat',
    whoHasChanged: 'Ibu Marta Kristina & Kelompok Pengrajin Tenun Dayak Kanayatn',
    highlightBefore: 'Sebelum program berjalan, perempuan desa hanya memiliki peran domestik tanpa pendapatan mandiri. Sampah kain perca dan limbah plastik di sekitar pemukiman sering dibakar karena tidak ada sistem daur ulang maupun pendampingan usaha.',
    highlightAfter: 'Setelah mengikuti pelatihan kewirausahaan ramah lingkungan dan pengelolaan limbah, Ibu Marta membentuk kelompok 25 pengrajin perempuan. Mereka memanfaatkan pewarna alami dari tanaman hutan adat dan berhasil meningkatkan pendapatan keluarga sebesar 35%, sekaligus memimpin inisiatif pemilahan sampah desa.',
    importantQuotes: '"Dulu kami merasa suara perempuan kurang didengar dalam musyawarah adat. Sekarang kami mandiri secara ekonomi dan bangga menjaga hutan adat yang memberi kehidupan."',
    noteFullStory: 'Dokumentasi naratif lengkap dan wawancara mendalam tersedia di arsip M&E Laporan Tahunan 2025 (Halaman 42-48).',
    categoryTheme: 'Kepemimpinan Perempuan',
    authorOrWriter: 'Yohana L. (Officer Komunikasi & Cerita Perubahan)',
    dateRecorded: '2025-07-20',
    createdAt: '2025-07-20T10:00:00Z'
  },
  {
    id: 'soc-02',
    projectId: 'proj-01',
    storyTitle: 'Perubahan Perilaku Bersih di Negeri Kepulauan: Kisah Kader SBCC Pulau Banda dan Saparua',
    storiesLocation: 'Kecamatan Pulau Banda & Pulau Saparua, Maluku Tengah',
    whoHasChanged: 'Kader Posyandu, Tokoh Pemuda, dan 320 Kepala Keluarga Pesisir',
    highlightBefore: 'Keterbatasan akses Tempat Pembuangan Sampah membuat sebagian besar warga pesisir membuang sampah langsung ke laut, mencemari terumbu karang dan mengganggu ekosistem perikanan tangkap nelayan tradisional.',
    highlightAfter: 'Melalui intervensi Komunikasi Perubahan Perilaku Sosial (SBCC) dan pembentukan bank sampah mandiri desa, lebih dari 85% rumah tangga kini aktif memilah sampah organik dan non-organik. Tumpukan sampah di pantai berkurang signifikan dan tercipta kesepakatan adat (*Sasi*) larangan membuang sampah ke laut.',
    importantQuotes: '"Laut adalah halaman depan rumah kami. Jika laut kotor, ikan menjauh dan anak cucu kami yang menderita. Kami bertekad menjaga Banda tetap bersih dan lestari."',
    noteFullStory: 'Liputan video testimoni kader dapat diakses di portal dokumentasi video program.',
    categoryTheme: 'Perubahan Perilaku (SBCC)',
    authorOrWriter: 'Fasilitator Lapangan Saparua & Banda',
    dateRecorded: '2025-08-10',
    createdAt: '2025-08-10T11:30:00Z'
  },
  {
    id: 'soc-03',
    projectId: 'proj-01',
    storyTitle: 'Stefanus Robert: Menembus Keterbatasan Fisik sebagai Pemeta Digital & Pelindung Hutan Adat',
    storiesLocation: 'Desa Menjalin, Kabupaten Landak',
    whoHasChanged: 'Stefanus Robert (Penyandang Disabilitas Fisik) & Tim Patroli Hutan',
    highlightBefore: 'Penyandang disabilitas di desa kerap kali tidak dilibatkan dalam kegiatan perlindungan lingkungan atau dianggap tidak mampu berpartisipasi dalam aktivitas konservasi hutan.',
    highlightAfter: 'Stefanus dilatih mengoperasikan sistem pemetaan GIS berbasis komputer dan drone patroli udara. Kini ia memegang peran strategis sebagai analis data spasial hutan adat desa, memastikan batas wilayah adat terlindungi dari perambahan liar.',
    importantQuotes: '"Keterbatasan fisik bukan halangan untuk menjaga tanah leluhur. Dengan teknologi dan kesempatan yang adil, saya bisa berkontribusi nyata bagi komunitas saya."',
    noteFullStory: 'Diterbitkan dalam buletin inklusi sosial GESI edisi Agustus 2025.',
    categoryTheme: 'Inklusi Disabilitas',
    authorOrWriter: 'Koordinator GESI & Hak Asasi',
    dateRecorded: '2025-08-25',
    createdAt: '2025-08-25T09:15:00Z'
  }
];

export const INITIAL_MEDIA_COVERAGES: MediaCoverage[] = [
  {
    id: 'mc-01',
    projectId: 'proj-01',
    title: 'Gandeng TML, BINTARI Fokus Edukasi Pengelolaan Sampah di Banda-Saparua',
    type: 'Artikel Berita Online',
    platform: 'Website Berita',
    publisherMedia: 'Liputan Maluku Tengah',
    linkToPublication: 'https://malteng.liputan.co.id/article_read/gandeng-tml-bintari-fokus-edukasi-pengelolaan-sampah-di-banda-saparua',
    releaseDate: '2025-06-24',
    summaryNotes: 'Pemberitaan mengenai kolaborasi multipihak dalam meluncurkan inisiatif edukasi pemilahan sampah dan perlindungan lingkungan pesisir.',
    createdAt: '2025-06-24T08:00:00Z'
  },
  {
    id: 'mc-02',
    projectId: 'proj-01',
    title: 'Wakili Bupati, Asisten II Buka Kick-off Pengelolaan Sampah Plastik Saparua-Banda',
    type: 'Artikel Berita Online',
    platform: 'Portal Pemda',
    publisherMedia: 'Humas Pemkab Maluku Tengah',
    linkToPublication: 'https://malteng.liputan.co.id/article_read/wakili-bupati-asisten-ii-buka-kick-off-pengelolaan-sampah-plastik-saparua-banda',
    releaseDate: '2025-06-26',
    summaryNotes: 'Apresiasi dan komitmen resmi Pemerintah Daerah Maluku Tengah dalam mendukung program pengelolaan sampah plastik dan pelibatan masyarakat lokal.',
    createdAt: '2025-06-26T10:00:00Z'
  },
  {
    id: 'mc-03',
    projectId: 'proj-01',
    title: 'Pemda Maluku Tengah Optimis Target Bebas Sampah: Bukan Hal Mustahil',
    type: 'Artikel Berita Online',
    platform: 'Website Berita',
    publisherMedia: 'Tribun Ambon',
    linkToPublication: 'https://ambon.tribunnews.com/2025/06/26/pemda-maluku-tengah-optimis-target-bebas-sampah-bukan-hal-mustahil',
    releaseDate: '2025-06-26',
    summaryNotes: 'Liputan mendalam tentang peta jalan pengurangan sampah dan target pencapaian Maluku Tengah Bebas Sampah melalui sinergi dengan LSM.',
    createdAt: '2025-06-26T14:30:00Z'
  },
  {
    id: 'mc-04',
    projectId: 'proj-01',
    title: 'Tumpukan Sampah di Malteng Capai 158,51 Ton per Hari, Sementara Kapasitas Kelola Hanya 36 Ton',
    type: 'Liputan Khusus / Feature',
    platform: 'Website Berita',
    publisherMedia: 'Tribun Ambon',
    linkToPublication: 'https://ambon.tribunnews.com/2025/06/26/tumpukan-sampah-di-malteng-capai-15851-ton-per-hari-sementara-kapasitas-kelola-hanya-36-ton',
    releaseDate: '2025-06-26',
    summaryNotes: 'Ulasan data timbulan sampah dan urgensi penguatan intervensi perubahan perilaku dari hulu (rumah tangga dan desa).',
    createdAt: '2025-06-26T16:00:00Z'
  },
  {
    id: 'mc-05',
    projectId: 'proj-01',
    title: 'Yayasan BINTARI dan Mitra Luncurkan Program Konservasi Berbasis Masyarakat Adat & Komunitas Lokal',
    type: 'Siaran Pers Resmi',
    platform: 'Website Berita',
    publisherMedia: 'Website Resmi BINTARI',
    linkToPublication: 'https://bintari.or.id/yayasan-bintari-dan-mitra-luncurkan-program-konservasi',
    releaseDate: '2025-07-02',
    summaryNotes: 'Pengumuman resmi kemitraan strategis dalam pendampingan hutan adat dan peningkatan kesejahteraan inklusif.',
    createdAt: '2025-07-02T09:00:00Z'
  }
];
