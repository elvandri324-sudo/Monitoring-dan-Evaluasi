import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.beneficiaries': 'Penerima Manfaat',
    'nav.indicators': 'Indikator Capaian',
    'nav.logframe': 'Logframe & Proyek',
    'nav.deliverables': 'Deliverabel & Laporan',
    'nav.mov': 'Repositori MoV',
    'nav.team': 'Tim Proyek',
    'nav.publications': 'Publikasi & Cerita',
    'nav.learning': 'Pembelajaran (Learning)',
    'nav.activities': 'Jadwal Kegiatan',
    'nav.analytics': 'Analitik & Grafik',

    // App header & controls
    'app.title': 'Sistem Monitoring & Evaluasi (M&E)',
    'app.subtitle': 'Database Terintegrasi & Manajemen Capaian',
    'app.publicPortal': 'Portal Publik',
    'app.adminDashboard': 'Dashboard Admin',
    'app.allProjects': 'Semua Proyek (Konsolidasi)',
    'app.selectProject': 'Pilih Proyek...',
    'app.newProject': '+ Buat Proyek Baru',
    'app.logout': 'Keluar',
    'app.login': 'Masuk Sistem',

    // Common words
    'common.search': 'Cari...',
    'common.filter': 'Filter',
    'common.all': 'Semua',
    'common.add': 'Tambah',
    'common.edit': 'Edit',
    'common.delete': 'Hapus',
    'common.save': 'Simpan Perubahan',
    'common.cancel': 'Batal',
    'common.close': 'Tutup',
    'common.download': 'Unduh',
    'common.upload': 'Unggah Berkas',
    'common.preview': 'Pratinjau',
    'common.status': 'Status',
    'common.action': 'Aksi',
    'common.date': 'Tanggal',
    'common.year': 'Tahun',
    'common.period': 'Periode',
    'common.exportCsv': 'Ekspor CSV',
    'common.exportPdf': 'Ekspor PDF',
    'common.details': 'Detail Lengkap',
    'common.total': 'Total',
    'common.target': 'Target',
    'common.actual': 'Realisasi',
    'common.progress': 'Capaian',
    'common.notes': 'Catatan',

    // Reports & Archives
    'reports.title': 'Manajemen Laporan Proyek & Arsip Berkas',
    'reports.subtitle': 'Kumpulan lengkap seluruh laporan proyek: Laporan Kegiatan, Laporan Bulanan, Laporan Kuartal, Laporan Semester, Laporan Tahunan, hingga Laporan Final beserta berkas terunggah yang dapat diunduh.',
    'reports.add': '+ Unggah / Tambah Laporan Baru',
    'reports.activity': 'Laporan Kegiatan',
    'reports.monthly': 'Laporan Bulanan',
    'reports.quarterly': 'Laporan Kuartal',
    'reports.semester': 'Laporan Semester',
    'reports.annual': 'Laporan Tahunan',
    'reports.final': 'Laporan Final',
    'reports.allTypes': 'Semua Kategori Laporan',
    'reports.deadline': 'Batas Waktu (Deadline)',
    'reports.submitted': 'Tanggal Diserahkan',
    'reports.author': 'Penyusun / Penulis Utama',
    'reports.reviewer': 'Pemeriksa / Mitra Donor',
    'reports.highlights': 'Ringkasan Eksekutif & Capaian',
    'reports.keyAchievements': 'Poin Capaian Kunci',
    'reports.challenges': 'Tantangan & Mitigasi',
    'reports.file': 'Dokumen Berkas / Tautan Cloud',
    'reports.download': 'Unduh Berkas Laporan',
    'reports.statusDraft': 'Draft',
    'reports.statusReview': 'Dalam Review',
    'reports.statusApproved': 'Disetujui (Approved)',
    'reports.statusRevision': 'Revisi Diperlukan',
    'reports.statusPublished': 'Telah Diterbitkan',

    // Deliverables (backward compatibility)
    'deliverables.title': 'Manajemen Laporan Proyek & Arsip Berkas',
    'deliverables.subtitle': 'Kumpulan lengkap seluruh laporan proyek: Laporan Kegiatan, Laporan Bulanan, Laporan Kuartal, Laporan Semester, Laporan Tahunan, hingga Laporan Final.',
    'deliverables.add': '+ Tambah Laporan Proyek',
    'deliverables.monthly': 'Laporan Bulanan',
    'deliverables.quarterly': 'Laporan Kuartal',
    'deliverables.midterm': 'Laporan Semester',
    'deliverables.annual': 'Laporan Tahunan',
    'deliverables.allTypes': 'Semua Jenis Laporan',
    'deliverables.deadline': 'Batas Waktu (Deadline)',
    'deliverables.submitted': 'Tanggal Diserahkan',
    'deliverables.author': 'Penyusun / Penulis Utama',
    'deliverables.reviewer': 'Pemeriksa / Mitra Donor',
    'deliverables.highlights': 'Ringkasan Eksekutif & Capaian',
    'deliverables.keyAchievements': 'Poin Capaian Kunci',
    'deliverables.challenges': 'Tantangan & Mitigasi',
    'deliverables.file': 'Dokumen Berkas / Tautan Cloud',
    'deliverables.statusDraft': 'Draft',
    'deliverables.statusReview': 'Dalam Review',
    'deliverables.statusApproved': 'Disetujui (Approved)',
    'deliverables.statusRevision': 'Revisi Diperlukan',
    'deliverables.statusPublished': 'Telah Diterbitkan',

    // Learning
    'learning.title': 'Matriks Pembelajaran Proyek (*Project Learning Matrix*)',
    'learning.subtitle': 'Dokumentasi terstruktur temuan kunci (*Key Learning*), tindakan adaptif (*What We Did Differently*), rencana fase lanjutan, kebutuhan kapasitas internal, dan jadwal implementasi.',
    'learning.add': '+ Tambah Pembelajaran Baru',
    'learning.colFocus': 'Fokus Pembelajaran (Learning Focus)',
    'learning.colKey': 'Pembelajaran Kunci (Key Learning)',
    'learning.colDifferent': 'Hal yang Dilakukan Berbeda (What We Did Differently)',
    'learning.colNext': 'Penerapan pada Fase Berikutnya (Next Phase Conduct)',
    'learning.colCapacity': 'Kebutuhan Kapasitas, Advokasi & Komunikasi',
    'learning.colWhen': 'Waktu Pelaksanaan (When to Implement)'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.beneficiaries': 'Beneficiaries',
    'nav.indicators': 'Indicators & Results',
    'nav.logframe': 'Logframe & Projects',
    'nav.reports': 'Project Reports',
    'nav.deliverables': 'Project Reports',
    'nav.mov': 'MoV Repository',
    'nav.team': 'Project Team',
    'nav.publications': 'Publications & Stories',
    'nav.learning': 'Project Learning',
    'nav.activities': 'Activity Schedule',
    'nav.analytics': 'Analytics & Charts',

    // App header & controls
    'app.title': 'Monitoring & Evaluation System (M&E)',
    'app.subtitle': 'Integrated Database & Impact Management',
    'app.publicPortal': 'Public Portal',
    'app.adminDashboard': 'Admin Dashboard',
    'app.allProjects': 'All Projects (Consolidated)',
    'app.selectProject': 'Select Project...',
    'app.newProject': '+ Create New Project',
    'app.logout': 'Sign Out',
    'app.login': 'Sign In',

    // Common words
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.add': 'Add New',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.download': 'Download',
    'common.upload': 'Upload File',
    'common.preview': 'Preview',
    'common.status': 'Status',
    'common.action': 'Action',
    'common.date': 'Date',
    'common.year': 'Year',
    'common.period': 'Period',
    'common.exportCsv': 'Export CSV',
    'common.exportPdf': 'Export PDF',
    'common.details': 'Full Details',
    'common.total': 'Total',
    'common.target': 'Target',
    'common.actual': 'Actual',
    'common.progress': 'Progress',
    'common.notes': 'Notes',

    // Reports & Archives
    'reports.title': 'Project Reports Management & File Archive',
    'reports.subtitle': 'Comprehensive repository of all project reports: Activity Reports, Monthly Reports, Quarterly Reports, Semester Reports, Annual Reports, and Final Project Reports with direct file downloads.',
    'reports.add': '+ Upload / Add New Report',
    'reports.activity': 'Activity Report',
    'reports.monthly': 'Monthly Report',
    'reports.quarterly': 'Quarterly Report',
    'reports.semester': 'Semester Report',
    'reports.annual': 'Annual Report',
    'reports.final': 'Final Project Report',
    'reports.allTypes': 'All Report Types',
    'reports.deadline': 'Submission Deadline',
    'reports.submitted': 'Date Submitted',
    'reports.author': 'Lead Author / Project Officer',
    'reports.reviewer': 'Reviewer / Donor Partner',
    'reports.highlights': 'Executive Summary & Highlights',
    'reports.keyAchievements': 'Key Achievements',
    'reports.challenges': 'Challenges & Mitigation',
    'reports.file': 'Report Document / Cloud Link',
    'reports.download': 'Download Report File',
    'reports.statusDraft': 'Draft',
    'reports.statusReview': 'Under Review',
    'reports.statusApproved': 'Approved',
    'reports.statusRevision': 'Revision Needed',
    'reports.statusPublished': 'Published',

    // Deliverables (backward compatibility)
    'deliverables.title': 'Project Reports & Deliverables Management',
    'deliverables.subtitle': 'Comprehensive repository of all project reports: Activity Reports, Monthly Reports, Quarterly Reports, Semester Reports, Annual Reports, and Final Project Reports.',
    'deliverables.add': '+ Add Project Report',
    'deliverables.monthly': 'Monthly Report',
    'deliverables.quarterly': 'Quarterly Report',
    'deliverables.midterm': 'Semester Report',
    'deliverables.annual': 'Annual Report',
    'deliverables.allTypes': 'All Report Types',
    'deliverables.deadline': 'Submission Deadline',
    'deliverables.submitted': 'Date Submitted',
    'deliverables.author': 'Lead Author / Project Officer',
    'deliverables.reviewer': 'Reviewer / Donor Partner',
    'deliverables.highlights': 'Executive Summary & Highlights',
    'deliverables.keyAchievements': 'Key Achievements',
    'deliverables.challenges': 'Challenges & Mitigation',
    'deliverables.file': 'Report Document / Cloud Link',
    'deliverables.statusDraft': 'Draft',
    'deliverables.statusReview': 'Under Review',
    'deliverables.statusApproved': 'Approved',
    'deliverables.statusRevision': 'Revision Needed',
    'deliverables.statusPublished': 'Published',

    // Learning
    'learning.title': 'Project Learning Matrix',
    'learning.subtitle': 'Structured documentation of Key Learnings, Adaptive Actions (What We Did Differently), Next Phase Conduct, Internal Capacity Needs, and Implementation Timeline.',
    'learning.add': '+ Add New Learning',
    'learning.colFocus': 'Learning Focus',
    'learning.colKey': 'Key Learning',
    'learning.colDifferent': 'What We Did Differently',
    'learning.colNext': 'How Will We Conduct Next Phase?',
    'learning.colCapacity': 'Internal Capacity, Advocacy & Communication',
    'learning.colWhen': 'When to Learn / Implement?'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'mone_app_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'id' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const t = (key: string, defaultText?: string): string => {
    const text = translations[language]?.[key] || translations['id']?.[key] || defaultText || key;
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'id',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string, defaultText?: string) => defaultText || key
    };
  }
  return context;
};
