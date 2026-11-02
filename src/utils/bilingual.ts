import { Language, Gender, AgeGroup, DisabilityType, DisabilityDifficultyLevel, IPLCStatus, StatusProgress, IndicatorUnit, MoVCategory, ReportType, ReportStatus, IndicatorLevel } from '../types';

export const formatGender = (gender: Gender | string, lang: Language): string => {
  if (lang === 'en') {
    if (gender === 'Laki-laki') return 'Male';
    if (gender === 'Perempuan') return 'Female';
    return gender;
  }
  return gender;
};

export const formatAgeGroup = (ageGroup: AgeGroup | string, lang: Language): string => {
  if (lang === 'en') {
    switch (ageGroup) {
      case '0-5': return '0-5 Yrs (Toddlers / Early)';
      case '6-12': return '6-12 Yrs (Children)';
      case '13-17': return '13-17 Yrs (Adolescents)';
      case '18-24': return '18-24 Yrs (Youth)';
      case '25-40': return '25-40 Yrs (Young Adults)';
      case '41-64': return '41-64 Yrs (Middle-Aged)';
      case '65+': return '65+ Yrs (Elderly)';
      // legacy fallback
      case '0-14': return '0-14 Yrs (Children)';
      case '25-64': return '25-64 Yrs (Adults)';
      default: return ageGroup;
    }
  }
  switch (ageGroup) {
    case '0-5': return '0-5 Thn (Balita)';
    case '6-12': return '6-12 Thn (Anak-anak)';
    case '13-17': return '13-17 Thn (Remaja)';
    case '18-24': return '18-24 Thn (Pemuda)';
    case '25-40': return '25-40 Thn (Dewasa Muda)';
    case '41-64': return '41-64 Thn (Dewasa Madya)';
    case '65+': return '65+ Thn (Lansia)';
    // legacy fallback
    case '0-14': return '0-14 Thn (Anak)';
    case '25-64': return '25-64 Thn (Dewasa)';
    default: return ageGroup;
  }
};

export const formatDisability = (disability: DisabilityType | string, lang: Language): string => {
  if (lang === 'en') {
    if (disability.includes('Fisik')) return 'Physical / Motor / Mobility';
    if (disability.includes('Netra')) return 'Visual / Sight';
    if (disability.includes('Rungu')) return 'Hearing';
    if (disability.includes('Wicara')) return 'Speech / Communication';
    if (disability.includes('Intelektual')) return 'Intellectual / Mental / Psychosocial';
    if (disability.includes('Ganda')) return 'Multiple / Dual Disabilities';
    if (disability.includes('Lainnya')) return 'Other Disabilities';
    return disability;
  }
  return disability;
};

export const formatDisabilityDifficultyLevel = (level: DisabilityDifficultyLevel | string | undefined, lang: Language): string => {
  if (!level) return '-';
  const str = String(level).trim();
  if (lang === 'en') {
    if (str.includes('1') || str.toLowerCase().includes('extremely')) return '1. Extremely difficult';
    if (str.includes('2') || str.toLowerCase().includes('very')) return '2. Very difficult';
    if (str.includes('3') || str.toLowerCase().includes('fairly')) return '3. Fairly difficult';
    if (str.includes('4') || str.toLowerCase().includes('slightly')) return '4. Slightly difficult';
    if (str.includes('5') || str.toLowerCase().includes('almost')) return '5. Almost no difficulty';
    if (str.includes('6') || str.toLowerCase().includes('no difficulty')) return '6. No difficulty';
    return str;
  }
  if (str.includes('1') || str.toLowerCase().includes('extremely') || str.toLowerCase().includes('ekstrem')) return '1. Sangat sulit / Ekstrem (Extremely difficult)';
  if (str.includes('2') || str.toLowerCase().includes('very')) return '2. Sangat sulit (Very difficult)';
  if (str.includes('3') || str.toLowerCase().includes('fairly') || str.toLowerCase().includes('cukup')) return '3. Cukup sulit (Fairly difficult)';
  if (str.includes('4') || str.toLowerCase().includes('slightly') || str.toLowerCase().includes('sedikit')) return '4. Sedikit sulit (Slightly difficult)';
  if (str.includes('5') || str.toLowerCase().includes('almost') || str.toLowerCase().includes('hampir')) return '5. Hampir tidak ada kesulitan (Almost no difficulty)';
  if (str.includes('6') || str.toLowerCase().includes('no difficulty') || str.toLowerCase().includes('tidak ada')) return '6. Tidak ada kesulitan (No difficulty)';
  return str;
};

export const formatIPLC = (iplc: IPLCStatus | string, lang: Language): string => {
  if (lang === 'en') {
    if (iplc.includes('Masyarakat Adat')) return 'Indigenous Peoples (IPLC)';
    if (iplc.includes('Komunitas Lokal')) return 'Local Communities (IPLC)';
    if (iplc.includes('Bukan IPLC')) return 'Non-IPLC';
    return iplc;
  }
  return iplc;
};

export const formatIplcStatus = formatIPLC;

export const formatStatusProgress = (status: StatusProgress | string, lang: Language): string => {
  if (lang === 'en') {
    switch (status) {
      case 'Tercapai': return 'Achieved';
      case 'Sesuai Target (On-Track)': return 'On-Track';
      case 'Perlu Perhatian (Delayed)': return 'Delayed / Needs Attention';
      case 'Belum Dimulai': return 'Not Started';
      default: return status;
    }
  }
  return status;
};

export const formatUnit = (unit: IndicatorUnit | string, lang: Language): string => {
  if (lang === 'en') {
    switch (unit) {
      case 'Orang / Individu': return 'People / Individuals';
      case 'Kepala Keluarga (KK)': return 'Household (HH)';
      case 'Kelompok / Organisasi': return 'Group / Organization';
      case 'Hektar (Ha)': return 'Hectares (Ha)';
      case 'Ton': return 'Tons (Tonnes)';
      case 'Dokumen / Kebijakan': return 'Document / Policy';
      case 'Pelatihan / Event': return 'Training / Event';
      case 'Persentase (%)': return 'Percentage (%)';
      case 'Rupiah (IDR)': return 'Indonesian Rupiah (IDR)';
      case 'Unit / Sarana': return 'Units / Facilities';
      default: return unit;
    }
  }
  return unit;
};

export const formatMoVCategory = (category: MoVCategory | string, lang: Language): string => {
  if (lang === 'en') {
    switch (category) {
      case 'Daftar Hadir / Absensi': return 'Attendance List / Sign-in Sheet';
      case 'Laporan Naratif / Laporan Kegiatan': return 'Narrative Report / Activity Report';
      case 'Dokumentasi Foto & Video': return 'Photo & Video Documentation';
      case 'Kebijakan / SK / Perdes / Regulasi': return 'Policy / Decree / Village Law / Regulation';
      case 'Materi & Modul Pelatihan': return 'Training Materials & Modules';
      case 'Berita Acara / Notulensi': return 'Official Minutes / Meeting Notes';
      case 'Tautan Link Cloud (Drive/Dropbox)': return 'Cloud Link (Drive/Dropbox)';
      case 'Lain-lain': return 'Others';
      default: return category;
    }
  }
  return category;
};

export const formatReportType = (type: ReportType | string, lang: Language): string => {
  if (lang === 'en') {
    switch (type) {
      case 'Laporan Kegiatan': return 'Activity Report';
      case 'Laporan Bulanan': return 'Monthly Report';
      case 'Laporan Kuartal': return 'Quarterly Report';
      case 'Laporan Semester': return 'Semester Report';
      case 'Laporan Tahunan': return 'Annual Report';
      case 'Laporan Final': return 'Final Project Report';
      default: return type;
    }
  }
  return type;
};

export const formatReportStatus = (status: ReportStatus | string, lang: Language): string => {
  if (lang === 'en') {
    switch (status) {
      case 'Draft': return 'Draft';
      case 'Dalam Review': return 'Under Review';
      case 'Disetujui': return 'Approved';
      case 'Revisi': return 'Needs Revision';
      case 'Diterbitkan': return 'Published';
      default: return status;
    }
  }
  return status;
};

export const formatIndicatorLevel = (level: IndicatorLevel | string, lang: Language): string => {
  if (lang === 'en') {
    switch (level) {
      case 'Goal': return 'Goal / Impact';
      case 'Outcome': return 'Outcome';
      case 'Output': return 'Output';
      case 'Activity': return 'Activity';
      default: return level;
    }
  }
  switch (level) {
    case 'Goal': return 'Goal / Dampak';
    case 'Outcome': return 'Outcome';
    case 'Output': return 'Output';
    case 'Activity': return 'Kegiatan';
    default: return level;
  }
};

export const formatReportingFrequency = (freq: string, lang: Language): string => {
  if (lang === 'en') {
    switch (freq) {
      case 'Bulanan': return 'Monthly';
      case 'Triwulanan': return 'Quarterly';
      case 'Semesteran': return 'Semi-Annually';
      case 'Tahunan': return 'Annually';
      case 'Akhir Proyek': return 'End of Project';
      default: return freq;
    }
  }
  return freq;
};

export const formatTargetGroup = (tg: string | undefined, lang: Language): string => {
  if (!tg) return lang === 'id' ? 'Populasi Komunitas Dampingan' : 'Population of the project communities';
  if (lang === 'id') {
    switch (tg) {
      case 'Population of the project communities':
        return 'Populasi Komunitas / Warga Dampingan';
      case 'Actors in the municipal, district and provincial administrations':
        return 'Aparatur / Dinas (Kecamatan, Kabupaten, Provinsi)';
      case 'Intermediaries: NGOs / CSOs':
        return 'Lembaga Perantara (LSM / OMS / Mitra)';
      case 'Other':
        return 'Lainnya (Other)';
      default:
        return tg;
    }
  }
  return tg;
};

export const formatBeneficiaryLevel = (level: string | undefined, lang: Language): string => {
  if (!level) return lang === 'id' ? 'Tingkat Desa Dampingan' : 'Project Village Level';
  if (lang === 'en') {
    switch (level) {
      case 'Desa': return 'Village Level';
      case 'Kecamatan': return 'Sub-District (Kecamatan) Level';
      case 'Kabupaten': return 'District / Regency Level';
      case 'Provinsi': return 'Provincial Level';
      case 'Nasional': return 'National Level';
      default: return level;
    }
  }
  switch (level) {
    case 'Desa': return 'Tingkat Desa Dampingan';
    case 'Kecamatan': return 'Tingkat Kecamatan Dampingan';
    case 'Kabupaten': return 'Tingkat Kabupaten Dampingan';
    case 'Provinsi': return 'Tingkat Provinsi Dampingan';
    case 'Nasional': return 'Tingkat Nasional';
    default: return level;
  }
};

