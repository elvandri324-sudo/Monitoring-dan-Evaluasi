export type Gender = 'Laki-laki' | 'Perempuan';

export type UserRole = 'Super Admin' | 'Admin' | 'Staff M&E' | 'Field Coordinator' | 'Donor / Partner' | 'Viewer / Guest';
export type UserStatus = 'Aktif' | 'Nonaktif' | 'Terkunci';

export interface UserSession {
  id?: string;
  username?: string;
  email: string;
  name: string;
  role: UserRole;
  assignedProjectIds: string[]; // ['all'] or specific project IDs
  avatarUrl?: string;
  isLoggedIn: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  assignedProjectIds: string[]; // ['all'] or specific project IDs
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
}

export type AgeGroup = '0-5' | '6-12' | '13-17' | '18-24' | '25-40' | '41-64' | '65+';

export type DisabilityType = 
  | 'Fisik / Motorik / Mobilitas'
  | 'Netra / Penglihatan'
  | 'Rungu / Pendengaran'
  | 'Wicara / Komunikasi'
  | 'Intelektual / Mental / Psikososial'
  | 'Ganda / Majemuk'
  | 'Lainnya';

export type DisabilityDifficultyLevel =
  | '1. Extremely difficult'
  | '2. Very difficult'
  | '3. Fairly difficult'
  | '4. Slightly difficult'
  | '5. Almost no difficulty'
  | '6. No difficulty';

export type IPLCStatus = 
  | 'Masyarakat Adat (Indigenous Peoples)'
  | 'Komunitas Lokal (Local Communities)'
  | 'Bukan IPLC (Non-IPLC)';

export type IndicatorUnit = 
  | 'Orang / Individu'
  | 'Kepala Keluarga (KK)'
  | 'Kelompok / Organisasi'
  | 'Hektar (Ha)'
  | 'Ton'
  | 'Dokumen / Kebijakan'
  | 'Pelatihan / Event'
  | 'Persentase (%)'
  | 'Rupiah (IDR)'
  | 'Unit / Sarana';

export type IndicatorLevel = 'Goal' | 'Outcome' | 'Output' | 'Activity';

export type StatusProgress = 'Tercapai' | 'Sesuai Target (On-Track)' | 'Perlu Perhatian (Delayed)' | 'Belum Dimulai';

export type MoVCategory = 
  | 'Daftar Hadir / Absensi'
  | 'Laporan Naratif / Laporan Kegiatan'
  | 'Dokumentasi Foto & Video'
  | 'Kebijakan / SK / Perdes / Regulasi'
  | 'Materi & Modul Pelatihan'
  | 'Berita Acara / Notulensi'
  | 'Tautan Link Cloud (Drive/Dropbox)'
  | 'Lain-lain';

export interface MoVDocument {
  id: string;
  title: string;
  category: MoVCategory;
  fileName?: string;
  fileSize?: string;
  fileData?: string; // Base64 or URL
  fileUrl?: string; // External cloud link
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
}

export interface PeriodicProgressLog {
  id: string;
  periodLabel: string; // e.g. 'Januari 2025', 'Q1 2025', 'Semester 1 2025'
  dateRecorded: string;
  periodValue: number; // capaian pada periode ini
  cumulativeActual: number; // akumulasi capaian total setelah periode ini
  notes?: string;
  recordedBy: string;
  movDocuments?: MoVDocument[];
}

export interface Indicator {
  id: string;
  code: string; // e.g. IND-OC1.1
  level: IndicatorLevel;
  parentId: string; // id of outcome, output, or activity
  name: string;
  definition: string;
  baseline: number;
  target: number;
  actual: number;
  unit: IndicatorUnit;
  disaggregationRequired?: boolean; // whether tracks gender/age/disability
  meansOfVerification: string; // Deskripsi metode / jenis bukti verifikasi
  movDocuments?: MoVDocument[]; // Koleksi dokumen fisik/digital MoV terlampir
  progressHistory?: PeriodicProgressLog[]; // Riwayat pencatatan capaian berkala
  frequency: 'Bulanan' | 'Triwulanan' | 'Semesteran' | 'Tahunan' | 'Akhir Proyek';
  status: StatusProgress;
  notes?: string;
  lastUpdated: string;
}

export interface Activity {
  id: string;
  outputId: string;
  code: string; // e.g. ACT-1.1.1
  title: string;
  description: string;
  location: string;
  province: string;
  regency: string; // Kabupaten/Kota
  startDate: string;
  endDate: string;
  budgetAllocated: number;
  budgetSpent: number;
  status: 'Selesai' | 'Sedang Berjalan' | 'Direncanakan' | 'Tertunda';
  leadPerson: string;
  indicators: Indicator[];
  createdAt: string;
}

export interface Output {
  id: string;
  outcomeId: string;
  code: string; // e.g. OP-1.1
  title: string;
  description: string;
  targetDate: string;
  indicators: Indicator[];
  activities: Activity[];
}

export interface Outcome {
  id: string;
  projectId: string;
  code: string; // e.g. OC-1
  title: string;
  description: string;
  indicators: Indicator[];
  outputs: Output[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // e.g. Project Manager, M&E Officer, Field Coordinator, Gender Specialist
  email: string;
  phone: string;
  assignedOutcomes?: string[]; // IDs of outcomes they supervise
  avatarUrl?: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  donor: string;
  partnerOrg: string;
  budgetTotal: number;
  budgetCurrency: string;
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'Selesai' | 'Perencanaan' | 'Masa Perpanjangan';
  province: string;
  targetLocations: string[]; // List of Desa/Kabupaten
  targetVillages?: string[]; // Daftar nama Desa / Kelurahan dampingan proyek
  goalStatement: string; // Impact/Goal
  goalIndicators: Indicator[];
  outcomes: Outcome[];
  teamMembers: TeamMember[];
  createdAt: string;
}

export type TargetGroup = 
  | 'Population of the project communities'
  | 'Actors in the municipal, district and provincial administrations'
  | 'Intermediaries: NGOs / CSOs'
  | 'Other';

export type BeneficiaryLevel = 
  | 'Desa' // Desa / Kelurahan Dampingan (e.g. Mahu, Saparua, Paperu, Ouw, Desa Menjalin)
  | 'Kecamatan' // Tingkat Kecamatan Dampingan (e.g. Kec. Saparua, Kec. Saparua Timur, Kantor Camat)
  | 'Kabupaten' // Tingkat Kabupaten Dampingan (e.g. Kab. Maluku Tengah, Dinas tingkat Kabupaten)
  | 'Provinsi' // Tingkat Provinsi Dampingan (e.g. Provinsi Maluku, Dinas / Bappeda Provinsi)
  | 'Nasional'; // Tingkat Nasional (e.g. Kementerian, Lembaga Nasional)

export interface Beneficiary {
  id: string; // Unique system ID
  nikOrIdentifier: string; // NIK KTP / Unique ID Organisasi
  fullName: string;
  gender: Gender;
  birthYear: number;
  age: number;
  ageGroup: AgeGroup; // 0-5, 6-12, 13-17, 18-24, 25-40, 41-64, 65+
  hasDisability: boolean;
  disabilityType?: DisabilityType;
  disabilityDifficultyLevel?: DisabilityDifficultyLevel | string;
  disabilityBarrierNotes?: string; // Deskripsi spesifik hambatan (e.g. Membutuhkan kursi roda / Penerjemah isyarat)
  iplcStatus: IPLCStatus;
  customIplcCommunityName?: string; // Nama suku/masyarakat adat (misal: Suku Dayak Kanayatn, Suku Marind, Komunitas Adat Manggarai)
  
  // Target Group & Level of Beneficiaries
  targetGroup?: TargetGroup | string; // Population of the project communities, Actors in municipal/district/provincial administrations, Intermediaries: NGOs/CSOs, Other
  beneficiaryLevel?: BeneficiaryLevel | string; // Desa, Kecamatan, Kabupaten, Provinsi, Nasional
  levelName?: string; // Nama spesifik level/wilayah (e.g. Mahu, Saparua, Kec. Saparua Timur, Kab. Maluku Tengah, Dinas Kehutanan Kab. Landak, Bappeda Provinsi)
  institutionOrAgency?: string; // Nama OPD/Dinas/LSM/Instansi (opsional jika dinas/pemerintah/aktor perantara)
  
  province: string;
  regency: string;
  district?: string; // Kecamatan
  village: string;
  phone?: string;
  occupation?: string;
  createdAt: string;
}

export interface ActivityAttendance {
  id: string;
  activityId: string;
  projectId: string;
  beneficiaryId: string;
  attendanceDate: string;
  roleInActivity?: 'Peserta' | 'Narasumber' | 'Fasilitator' | 'Penerima Bantuan Langsung' | 'Relawan';
  attendanceStatus: 'Hadir Penuh' | 'Hadir Sebagian' | 'Izin';
  notes?: string;
  verifiedBy?: string;
}

export interface DisaggregationSummary {
  totalGrossParticipation: number;
  totalUniqueBeneficiaries: number; // Deduplicated, zero double counting
  repeatedParticipantsCount: number; // Count of unique people who joined >1 activity
  
  genderBreakdown: {
    lakiLaki: number;
    perempuan: number;
    percentLakiLaki: number;
    percentPerempuan: number;
  };
  
  ageGroupBreakdown: {
    '0-5': number;
    '6-12': number;
    '13-17': number;
    '18-24': number;
    '25-40': number;
    '41-64': number;
    '65+': number;
  };
  
  disabilityBreakdown: {
    disabilityCount: number;
    nonDisabilityCount: number;
    percentDisability: number;
    barriers: Record<string, number>;
    difficultyLevels: Record<string, number>;
  };
  
  iplcBreakdown: {
    indigenousPeoples: number;
    localCommunities: number;
    nonIplc: number;
    percentIplcTotal: number;
    topCommunities: { name: string; count: number }[];
  };

  targetGroupBreakdown: {
    population: number;
    administrations: number;
    intermediaries: number;
    other: number;
    percentPopulation: number;
    percentAdministrations: number;
    percentIntermediaries: number;
    percentOther: number;
  };

  beneficiaryLevelBreakdown: {
    desa: number;
    kecamatan: number;
    kabupaten: number;
    provinsi: number;
    nasional: number;
    items: {
      level: BeneficiaryLevel | string;
      levelName: string;
      count: number;
      percentage: number;
      institutions: string[];
    }[];
  };

  locationBreakdown: {
    byProvince: Record<string, number>;
    byRegency: Record<string, number>;
  };

  villageBreakdown: {
    village: string;
    totalUnique: number;
    lakiLaki: number;
    perempuan: number;
    disabilityCount: number;
    iplcCount: number;
    percentage: number;
  }[];
}

// ==========================================
// PUBLIKASI & PRODUK PENGETAHUAN (KNOWLEDGE PRODUCTS)
// ==========================================
export type KnowledgeProductType = 
  | 'Infografis / Factsheet'
  | 'Video & Audio / Podcast'
  | 'Panduan / Modul / Buku'
  | 'Laporan / Kajian Baseline & Endline'
  | 'Policy Brief / Kertas Kebijakan'
  | 'Poster & Media Komunikasi (SBCC)'
  | 'Materi Pelatihan / Presentasi'
  | 'Lainnya';

export interface KnowledgeProduct {
  id: string;
  projectId?: string;
  type: KnowledgeProductType;
  title: string;
  description: string;
  language: string; // e.g. "Bahasa Indonesia", "Bahasa Inggris", "Dwibahasa (ID/EN)"
  publisherAuthor: string;
  contributeToOutputOutcome: string;
  linkDocument: string;
  fileFormat?: 'PDF' | 'Video' | 'Audio' | 'Dokumen' | 'Website / Link' | 'Gambar';
  fileSize?: string;
  releaseDate?: string;
  coverImageUrl?: string;
  createdAt: string;
}

// ==========================================
// CERITA PERUBAHAN (STORIES OF CHANGE)
// ==========================================
export interface StoryOfChange {
  id: string;
  projectId?: string;
  storyTitle: string;
  storiesLocation: string; // Lokasi cerita: Desa, Kecamatan, Kabupaten
  whoHasChanged: string; // Siapa yang mengalami perubahan: Tokoh, Komunitas, Kelompok
  beneficiaryId?: string;
  highlightBefore: string; // Sorotan cerita sebelum proyek
  highlightAfter: string; // Sorotan cerita setelah proyek (perubahan nyata)
  importantQuotes: string; // Kutipan penting / testimoni kunci
  noteFullStory: string; // Catatan tambahan / tautan cerita lengkap
  categoryTheme?: 'Kepemimpinan Perempuan' | 'Kelola Hutan & Lingkungan' | 'Inklusi Disabilitas' | 'Kemandirian Ekonomi' | 'Perubahan Perilaku (SBCC)' | 'Masyarakat Adat & Budaya';
  photoUrl?: string;
  authorOrWriter?: string;
  dateRecorded: string;
  createdAt: string;
}

// ==========================================
// MEDIA SOSIAL & LIPUTAN MEDIA (MEDIA COVERAGE)
// ==========================================
export type MediaCoverageType = 
  | 'Artikel Berita Online'
  | 'Siaran Pers Resmi'
  | 'Liputan Khusus / Feature'
  | 'Postingan Media Sosial (Instagram/FB/X)'
  | 'Video YouTube / Dokumenter'
  | 'Media Cetak / Koran'
  | 'Lainnya';

export interface MediaCoverage {
  id: string;
  projectId?: string;
  title: string;
  type: MediaCoverageType;
  platform: 'Website Berita' | 'Portal Pemda' | 'Instagram' | 'YouTube' | 'Facebook' | 'LinkedIn' | 'Media Cetak' | 'Lainnya';
  publisherMedia?: string; // Nama media / portal penerbit (e.g. Tribun Ambon, BINTARI, Liputan Maluku)
  linkToPublication: string;
  releaseDate: string;
  summaryNotes?: string;
  createdAt: string;
}

export type Language = 'id' | 'en';

// ==========================================
// LAPORAN PROYEK (PROJECT REPORTS & ARCHIVES)
// ==========================================
export type ReportType = 
  | 'Laporan Kegiatan'
  | 'Laporan Bulanan'
  | 'Laporan Kuartal'
  | 'Laporan Semester'
  | 'Laporan Tahunan'
  | 'Laporan Final';

export type ReportStatus = 
  | 'Draft'
  | 'Dalam Review'
  | 'Disetujui (Approved)'
  | 'Revisi Diperlukan'
  | 'Telah Diterbitkan';

export interface ReportItem {
  id: string;
  projectId: string;
  title: string;
  type: ReportType;
  period: string; // e.g., 'Januari 2026', 'Kuartal 1 (Jan - Mar 2026)', 'Semester 1 (Jan - Jun 2025)', 'Tahun 2025', 'Laporan Akhir Proyek'
  year: number;
  submissionDeadline: string; // YYYY-MM-DD
  submittedDate?: string;
  authorOrLead: string;
  reviewerOrDonor?: string;
  status: ReportStatus;
  summaryHighlights: string; // Executive summary
  keyAchievements?: string[]; // Bullet achievements
  challengesAndMitigation?: string; // Challenges & actions taken
  fileUrl?: string; // Cloud URL (Google Drive, SharePoint, Dropbox)
  fileName?: string;
  fileSize?: string;
  fileData?: string; // Base64 or sample file content for direct download
  fileType?: string; // MIME type or extension (e.g. pdf, docx, xlsx, zip)
  targetBeneficiariesPeriod?: number;
  actualBeneficiariesPeriod?: number;
  budgetSpentPeriod?: number;
  reviewNotes?: string;
  ratingOrScore?: number; // 0 - 100%
  createdAt: string;
  updatedAt?: string;
}

// Backward compatibility aliases
export type DeliverableType = ReportType;
export type DeliverableStatus = ReportStatus;
export type DeliverableReport = ReportItem;

export type LearningFocusCategory = 
  | 'Situation/problems'
  | 'Key activities/Outputs/Outcomes'
  | 'Linking with other SO/Projects/SO-HQ/RIK'
  | 'Issues & Challenges'
  | 'Influencing activities'
  | 'Specific Needs'
  | 'Resilience'
  | 'Sustainability'
  | 'Lainnya';

export interface ProjectLearning {
  id: string;
  projectId?: string; // Proyek terkait
  title: string; // Judul / Ringkasan Pembelajaran
  learningFocus: LearningFocusCategory; // Learning Focus
  customFocus?: string; // Jika memilih fokus spesifik lainnya
  keyLearning: string; // What are the key learning from every learning focus?
  whatWeDidDifferently: string; // What action that being done differently in the project?
  nextPhaseConduct: string; // What and how is the effect of learning for the next phase of the project?
  internalCapacityAdvocacyComm: string; // What are the consequence and needs for capacity development, advocacy, and communication?
  whenToLearnImplement: string; // When the capacity development, advocacy, or communication will be conducted?
  status?: 'Teridentifikasi' | 'Dalam Penerapan (Actioned)' | 'Telah Terintegrasi' | 'Ditinjau';
  recordedBy?: string;
  dateRecorded: string;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// LAPORAN ERROR & BUG REPORTING (ERROR TICKETS)
// ==========================================
export type ErrorSeverity = 'Rendah (Low)' | 'Sedang (Medium)' | 'Tinggi (High)' | 'Kritis (Critical)';
export type ErrorStatus = 'Baru (Open)' | 'Dalam Investigasi' | 'Selesai (Resolved)' | 'Ditutup (Closed)';
export type ErrorModule = 
  | 'Penerima Manfaat & GESI' 
  | 'Kegiatan & Presensi' 
  | 'Logframe & Indikator' 
  | 'Laporan Proyek' 
  | 'Publikasi & Media' 
  | 'Pembelajaran' 
  | 'Manajemen Akun' 
  | 'Ekspor / Impor Berkas' 
  | 'Sistem Umum';

export interface ErrorReport {
  id: string;
  title: string;
  module: ErrorModule;
  severity: ErrorSeverity;
  status: ErrorStatus;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshotUrl?: string;
  systemInfo?: string;
  reportedBy: string;
  reporterEmail?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ==========================================
// KELOMPOK / KOMUNITAS DAMPINGAN (ACCOMPANIED GROUPS)
// ==========================================
export type AccompaniedGroupType = 
  | 'OPS (Organisasi Pengelola Sarana / Sanitasi)'
  | 'POKJA (Kelompok Kerja)'
  | 'KADER Perubahan Perilaku (SBCC / Higiene)'
  | 'TPS3R (Tempat Pengolahan Sampah 3R)'
  | 'PDU (Pusat Daur Ulang)'
  | 'Bank Sampah'
  | 'Pokdarwis (Kelompok Sadar Wisata)'
  | 'Kelompok Tani / KWT'
  | 'KUPS / Lembaga Pengelola Hutan Desa (LPHD)'
  | 'Lembaga Adat / Komunitas Adat'
  | 'Kelompok Pemuda / Karang Taruna'
  | 'Koperasi / KUBE'
  | 'Lainnya';

export type GroupMemberRole = 
  | 'Ketua'
  | 'Wakil Ketua'
  | 'Sekretaris'
  | 'Bendahara'
  | 'Koordinator Lapangan'
  | 'Kader Aktif'
  | 'Anggota Inti'
  | 'Anggota';

export interface AccompaniedGroupMember {
  beneficiaryId: string;
  roleInGroup: GroupMemberRole | string;
  joinedDate?: string;
  notes?: string;
}

export interface AccompaniedGroup {
  id: string;
  projectId: string; // Proyek terkait atau 'all'
  code: string; // e.g. GRP-OPS-01, POKJA-01, BS-01, POKDARWIS-01, KADER-01
  name: string; // e.g. "OPS Tirta Lestari Desa Mahu", "Pokja AMPL & Sanitasi Desa Paperu", "Kader Perubahan Perilaku RW 01"
  type: AccompaniedGroupType | string;
  customType?: string;
  village: string;
  district?: string;
  regency: string;
  province: string;
  establishmentDate?: string; // Tanggal pembentukan
  legalStatus?: 'SK Kepala Desa' | 'SK Camat' | 'SK Bupati' | 'Akta Notaris / Kemenkumham' | 'Belum Berbadan Hukum / Informal' | string;
  legalDocumentNumber?: string; // No. SK / Legalitas
  leaderName?: string;
  leaderPhone?: string;
  focusArea?: string; // Bidang Fokus Dampingan (e.g. Sanitasi Total Berbasis Masyarakat, Pengelolaan Sampah Sirkular, Konservasi Wisata Bahari)
  status: 'Aktif' | 'Mandiri' | 'Rintisan / Pemula' | 'Perlu Penguatan' | 'Nonaktif';
  notes?: string;
  members: AccompaniedGroupMember[];
  createdAt: string;
  updatedAt?: string;
}




