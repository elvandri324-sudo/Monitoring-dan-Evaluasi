import React, { useState, useMemo, FormEvent } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  ExternalLink, 
  FileCheck, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  X, 
  FileSpreadsheet, 
  LayoutGrid, 
  Table as TableIcon, 
  Paperclip, 
  Check, 
  Award, 
  Eye, 
  Send, 
  FolderCheck,
  ChevronRight,
  BookMarked,
  Upload,
  File,
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Project, ReportItem, ReportType, ReportStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { downloadReportDocument, formatBytes } from '../utils/reportHelper';
import { exportReportsListToXLSX } from '../utils/exportXlsx';

interface ReportManagerProps {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId?: (id: string) => void;
  reports: ReportItem[];
  isAdmin: boolean;
  onSaveReport: (report: ReportItem) => void;
  onDeleteReport: (id: string) => void;
  onUpdateStatus?: (id: string, status: ReportStatus, reviewNotes?: string) => void;
}

export const REPORT_TYPE_CONFIG: Record<ReportType, { 
  labelId: string; 
  labelEn: string; 
  color: string; 
  badgeBg: string; 
  icon: string;
  descriptionId: string;
}> = {
  'Laporan Kegiatan': {
    labelId: 'Laporan Kegiatan',
    labelEn: 'Activity Report',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    badgeBg: 'bg-indigo-600',
    icon: '📌',
    descriptionId: 'Dokumentasi pelaksanaan kegiatan, pelatihan, lokakarya & output spesifik.'
  },
  'Laporan Bulanan': {
    labelId: 'Laporan Bulanan',
    labelEn: 'Monthly Report',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-600',
    icon: '🗓️',
    descriptionId: 'Kemajuan rutin bulanan, aktivitas lapangan, dan monitoring penerima manfaat.'
  },
  'Laporan Kuartal': {
    labelId: 'Laporan Kuartal',
    labelEn: 'Quarterly Report',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-600',
    icon: '📊',
    descriptionId: 'Rekap capaian indikator kuartalan (Q1-Q4), serapan anggaran & mitigasi kendala.'
  },
  'Laporan Semester': {
    labelId: 'Laporan Semester',
    labelEn: 'Semester Report',
    color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    badgeBg: 'bg-cyan-600',
    icon: '📑',
    descriptionId: 'Evaluasi paruh tahun (Semester 1 / 2) terhadap target rencana kerja tahunan.'
  },
  'Laporan Tahunan': {
    labelId: 'Laporan Tahunan',
    labelEn: 'Annual Report',
    color: 'text-amber-800 bg-amber-50 border-amber-200',
    badgeBg: 'bg-amber-600',
    icon: '🏆',
    descriptionId: 'Laporan komprehensif tahunan, audit naratif & finansial, serta capaian dampak.'
  },
  'Laporan Final': {
    labelId: 'Laporan Final (Akhir Proyek)',
    labelEn: 'Final Project Report',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    badgeBg: 'bg-rose-600',
    icon: '🎓',
    descriptionId: 'Laporan penutupan proyek, evaluasi dampak akhir & rencana keberlanjutan.'
  }
};

export const STATUS_CONFIG: Record<ReportStatus, { labelId: string; labelEn: string; color: string; dot: string }> = {
  'Draft': {
    labelId: 'Draft / Konsep',
    labelEn: 'Draft',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  },
  'Dalam Review': {
    labelId: 'Dalam Review',
    labelEn: 'Under Review',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500'
  },
  'Disetujui (Approved)': {
    labelId: 'Disetujui (Approved)',
    labelEn: 'Approved',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  'Revisi Diperlukan': {
    labelId: 'Revisi Diperlukan',
    labelEn: 'Revision Needed',
    color: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-500'
  },
  'Telah Diterbitkan': {
    labelId: 'Telah Diterbitkan',
    labelEn: 'Published',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-500'
  }
};

export const DEFAULT_REPORT_TYPE_CONFIG = {
  labelId: 'Laporan Proyek',
  labelEn: 'Project Report',
  color: 'text-slate-700 bg-slate-50 border-slate-200',
  badgeBg: 'bg-slate-600',
  icon: '📄',
  descriptionId: 'Dokumentasi laporan kemajuan proyek.'
};

export const DEFAULT_STATUS_CONFIG = {
  labelId: 'Draft / Konsep',
  labelEn: 'Draft',
  color: 'bg-slate-100 text-slate-700 border-slate-200',
  dot: 'bg-slate-400'
};

export function getReportTypeConfig(type?: string) {
  if (!type) return DEFAULT_REPORT_TYPE_CONFIG;
  return (REPORT_TYPE_CONFIG as any)[type] || DEFAULT_REPORT_TYPE_CONFIG;
}

export function getReportStatusConfig(status?: string) {
  if (!status) return DEFAULT_STATUS_CONFIG;
  return (STATUS_CONFIG as any)[status] || DEFAULT_STATUS_CONFIG;
}

export default function ReportManager({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  reports,
  isAdmin,
  onSaveReport,
  onDeleteReport,
  onUpdateStatus
}: ReportManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  // Filters state
  const [activeTypeTab, setActiveTypeTab] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [viewingReport, setViewingReport] = useState<ReportItem | null>(null);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formProjectId, setFormProjectId] = useState<string>(projects[0]?.id || '');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formType, setFormType] = useState<ReportType>('Laporan Kegiatan');
  const [formPeriod, setFormPeriod] = useState<string>('');
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formDeadline, setFormDeadline] = useState<string>('');
  const [formSubmittedDate, setFormSubmittedDate] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('');
  const [formReviewer, setFormReviewer] = useState<string>('');
  const [formStatus, setFormStatus] = useState<ReportStatus>('Draft');
  const [formHighlights, setFormHighlights] = useState<string>('');
  const [formAchievements, setFormAchievements] = useState<string[]>(['']);
  const [formChallenges, setFormChallenges] = useState<string>('');
  const [formFileUrl, setFormFileUrl] = useState<string>('');
  const [formFileName, setFormFileName] = useState<string>('');
  const [formFileSize, setFormFileSize] = useState<string>('');
  const [formFileData, setFormFileData] = useState<string>('');
  const [formTargetBen, setFormTargetBen] = useState<string>('');
  const [formActualBen, setFormActualBen] = useState<string>('');
  const [formBudgetSpent, setFormBudgetSpent] = useState<string>('');
  const [formReviewNotes, setFormReviewNotes] = useState<string>('');
  const [formRating, setFormRating] = useState<number>(95);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(item => {
      // Filter by Project
      if (selectedProjectId !== 'all' && item.projectId !== selectedProjectId) {
        return false;
      }
      // Filter by Report Type
      if (activeTypeTab !== 'all' && item.type !== activeTypeTab) {
        return false;
      }
      // Filter by Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Filter by Year
      if (selectedYear !== 'all' && item.year.toString() !== selectedYear) {
        return false;
      }
      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const project = projects.find(p => p.id === item.projectId);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchPeriod = item.period.toLowerCase().includes(q);
        const matchAuthor = item.authorOrLead.toLowerCase().includes(q);
        const matchReviewer = (item.reviewerOrDonor || '').toLowerCase().includes(q);
        const matchProject = project ? project.title.toLowerCase().includes(q) || project.code.toLowerCase().includes(q) : false;
        const matchSummary = item.summaryHighlights.toLowerCase().includes(q);
        const matchFile = (item.fileName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchPeriod && !matchAuthor && !matchReviewer && !matchProject && !matchSummary && !matchFile) {
          return false;
        }
      }
      return true;
    });
  }, [reports, selectedProjectId, activeTypeTab, selectedStatus, selectedYear, searchQuery, projects]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredReports.length;
    const byType = {
      kegiatan: filteredReports.filter(d => d.type === 'Laporan Kegiatan').length,
      bulanan: filteredReports.filter(d => d.type === 'Laporan Bulanan').length,
      kuartal: filteredReports.filter(d => d.type === 'Laporan Kuartal').length,
      semester: filteredReports.filter(d => d.type === 'Laporan Semester').length,
      tahunan: filteredReports.filter(d => d.type === 'Laporan Tahunan').length,
      final: filteredReports.filter(d => d.type === 'Laporan Final').length,
    };
    const approved = filteredReports.filter(d => d.status === 'Disetujui (Approved)' || d.status === 'Telah Diterbitkan').length;
    const inReview = filteredReports.filter(d => d.status === 'Dalam Review').length;
    const withFiles = filteredReports.filter(d => d.fileName || d.fileUrl || d.fileData).length;

    return { total, byType, approved, inReview, withFiles };
  }, [filteredReports]);

  // Handle Open Create / Edit Modal
  const handleOpenModal = (report?: ReportItem) => {
    if (report) {
      setEditingReport(report);
      setFormProjectId(report.projectId);
      setFormTitle(report.title);
      setFormType(report.type);
      setFormPeriod(report.period);
      setFormYear(report.year);
      setFormDeadline(report.submissionDeadline || '');
      setFormSubmittedDate(report.submittedDate || '');
      setFormAuthor(report.authorOrLead);
      setFormReviewer(report.reviewerOrDonor || '');
      setFormStatus(report.status);
      setFormHighlights(report.summaryHighlights);
      setFormAchievements(report.keyAchievements && report.keyAchievements.length > 0 ? report.keyAchievements : ['']);
      setFormChallenges(report.challengesAndMitigation || '');
      setFormFileUrl(report.fileUrl || '');
      setFormFileName(report.fileName || '');
      setFormFileSize(report.fileSize || '');
      setFormFileData(report.fileData || '');
      setFormTargetBen(report.targetBeneficiariesPeriod ? report.targetBeneficiariesPeriod.toString() : '');
      setFormActualBen(report.actualBeneficiariesPeriod ? report.actualBeneficiariesPeriod.toString() : '');
      setFormBudgetSpent(report.budgetSpentPeriod ? report.budgetSpentPeriod.toString() : '');
      setFormReviewNotes(report.reviewNotes || '');
      setFormRating(report.ratingOrScore || 95);
    } else {
      setEditingReport(null);
      setFormProjectId(selectedProjectId !== 'all' ? selectedProjectId : (projects[0]?.id || ''));
      setFormTitle('');
      setFormType('Laporan Kegiatan');
      setFormPeriod('Kegiatan ' + new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
      setFormYear(new Date().getFullYear());
      setFormDeadline(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setFormSubmittedDate(new Date().toISOString().split('T')[0]);
      setFormAuthor('Tim Program & M&E');
      setFormReviewer('Mitra Donor / Pengarah');
      setFormStatus('Draft');
      setFormHighlights('');
      setFormAchievements(['']);
      setFormChallenges('');
      setFormFileUrl('');
      setFormFileName('');
      setFormFileSize('');
      setFormFileData('');
      setFormTargetBen('');
      setFormActualBen('');
      setFormBudgetSpent('');
      setFormReviewNotes('');
      setFormRating(95);
    }
    setIsModalOpen(true);
  };

  // Handle File Input Change with Base64 conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFileName(file.name);
      setFormFileSize(formatBytes(file.size));
      if (!formTitle) {
        setFormTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' '));
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setFormFileData(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submission
  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formProjectId) {
      alert(isId ? 'Judul laporan dan proyek wajib diisi' : 'Report title and project are required');
      return;
    }

    const cleanAchievements = formAchievements.filter(a => a.trim().length > 0);

    const reportItem: ReportItem = {
      id: editingReport ? editingReport.id : `rep-${Date.now().toString().slice(-6)}`,
      projectId: formProjectId,
      title: formTitle.trim(),
      type: formType,
      period: formPeriod.trim() || `${formType} ${formYear}`,
      year: Number(formYear) || new Date().getFullYear(),
      submissionDeadline: formDeadline || new Date().toISOString().split('T')[0],
      submittedDate: formSubmittedDate || undefined,
      authorOrLead: formAuthor.trim() || 'Tim Program M&E',
      reviewerOrDonor: formReviewer.trim() || undefined,
      status: formStatus,
      summaryHighlights: formHighlights.trim() || 'Laporan capaian kemajuan dan dokumentasi kegiatan proyek.',
      keyAchievements: cleanAchievements.length > 0 ? cleanAchievements : undefined,
      challengesAndMitigation: formChallenges.trim() || undefined,
      fileUrl: formFileUrl.trim() || undefined,
      fileName: formFileName.trim() || (formFileData ? `${formTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf` : undefined),
      fileSize: formFileSize || (formFileName ? '2.4 MB' : undefined),
      fileData: formFileData || undefined,
      targetBeneficiariesPeriod: formTargetBen ? Number(formTargetBen) : undefined,
      actualBeneficiariesPeriod: formActualBen ? Number(formActualBen) : undefined,
      budgetSpentPeriod: formBudgetSpent ? Number(formBudgetSpent) : undefined,
      reviewNotes: formReviewNotes.trim() || undefined,
      ratingOrScore: formRating,
      createdAt: editingReport ? editingReport.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveReport(reportItem);
    setIsModalOpen(false);
    showToast(isId ? `Laporan "${reportItem.title}" berhasil disimpan!` : `Report "${reportItem.title}" saved successfully!`);
  };

  // Handle Download Report
  const handleDownload = (report: ReportItem) => {
    const project = projects.find(p => p.id === report.projectId);
    const result = downloadReportDocument(report, project);
    showToast(result.message);
  };

  // Handle Quick Approve
  const handleQuickApprove = (report: ReportItem) => {
    if (onUpdateStatus) {
      onUpdateStatus(report.id, 'Disetujui (Approved)', 'Laporan telah diverifikasi dan disetujui resmi oleh Tim Manajemen M&E.');
      showToast(isId ? `Laporan disetujui: ${report.title}` : `Report approved: ${report.title}`);
    } else {
      onSaveReport({
        ...report,
        status: 'Disetujui (Approved)',
        reviewNotes: 'Laporan telah diverifikasi dan disetujui resmi oleh Tim Manajemen M&E.'
      });
      showToast(isId ? `Laporan disetujui: ${report.title}` : `Report approved: ${report.title}`);
    }
    if (viewingReport && viewingReport.id === report.id) {
      setViewingReport(prev => prev ? { ...prev, status: 'Disetujui (Approved)' } : null);
    }
  };

  // Handle Export XLSX
  const handleExportXLSX = () => {
    exportReportsListToXLSX(
      filteredReports,
      projects,
      `Rekapitulasi_Laporan_SIMEV_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    showToast(isId ? 'Rekapitulasi laporan berhasil diekspor ke Excel (.xlsx)' : 'Report summary exported to Excel (.xlsx)');
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Kode Proyek', 'Nama Proyek', 'Kategori Laporan', 'Judul Laporan', 'Periode', 'Tahun', 'Penyusun', 'Mitra/Donor', 'Status', 'Target Jiwa', 'Realisasi Jiwa', 'Realisasi Anggaran (Rp)', 'Nama Berkas'];
    const rows = filteredReports.map(item => {
      const p = projects.find(proj => proj.id === item.projectId);
      return [
        `"${item.id}"`,
        `"${p?.code || '-'}"`,
        `"${p?.title?.replace(/"/g, '""') || '-'}"`,
        `"${item.type}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.period}"`,
        item.year,
        `"${item.authorOrLead.replace(/"/g, '""')}"`,
        `"${(item.reviewerOrDonor || '-').replace(/"/g, '""')}"`,
        `"${item.status}"`,
        item.targetBeneficiariesPeriod || 0,
        item.actualBeneficiariesPeriod || 0,
        item.budgetSpentPeriod || 0,
        `"${item.fileName || '-'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekapitulasi_Laporan_SIMEV_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isId ? 'Rekapitulasi laporan berhasil diekspor ke CSV' : 'Report summary exported to CSV');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-blue-100 border border-white/15">
              <FileCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isId ? 'Repositori Laporan Proyek & Arsip Berkas' : 'Project Reports Hub & Document Archive'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isId ? 'Kumpulan Laporan Proyek (Reports Hub)' : 'Project Reports & Deliverables'}
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              {isId 
                ? 'Pusat manajemen dan pengunduhan seluruh laporan proyek: Laporan Kegiatan, Laporan Bulanan, Laporan Kuartal, Laporan Semester, Laporan Tahunan, hingga Laporan Final beserta berkas terunggah.'
                : 'Central repository for all project reports: Activity Reports, Monthly Reports, Quarterly Reports, Semester Reports, Annual Reports, and Final Project Reports with instant file downloads.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportXLSX}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-md"
              title={isId ? 'Ekspor Rekapitulasi Excel (.xlsx)' : 'Export Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>{isId ? 'Ekspor Excel (XLSX)' : 'Export Excel (XLSX)'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold transition flex items-center gap-2 backdrop-blur-sm"
              title={isId ? 'Ekspor Rekapitulasi CSV' : 'Export CSV'}
            >
              <Download className="w-4 h-4" />
              <span>{isId ? 'Ekspor CSV' : 'Export CSV'}</span>
            </button>

            {isAdmin && (
              <button
                id="btn-add-new-report"
                onClick={() => handleOpenModal()}
                className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95"
              >
                <Upload className="w-4 h-4 text-blue-700" />
                <span>{isId ? '+ Unggah / Tambah Laporan' : '+ Upload / Add Report'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">{isId ? 'Total Laporan' : 'Total Reports'}</div>
            <div className="text-xl font-bold mt-0.5 text-white">{stats.total}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-medium">📌 {isId ? 'Kegiatan' : 'Activity'}</div>
            <div className="text-xl font-bold mt-0.5 text-white">{stats.byType.kegiatan}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">🗓️ {isId ? 'Bulanan' : 'Monthly'}</div>
            <div className="text-xl font-bold mt-0.5 text-white">{stats.byType.bulanan}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-200 font-medium">📊 {isId ? 'Kuartal (Q)' : 'Quarterly'}</div>
            <div className="text-xl font-bold mt-0.5 text-white">{stats.byType.kuartal}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-cyan-200 font-medium">📑 {isId ? 'Semester' : 'Semester'}</div>
            <div className="text-xl font-bold mt-0.5 text-white">{stats.byType.semester}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-amber-200 font-medium">🏆 {isId ? 'Tahunan' : 'Annual'}</div>
            <div className="text-xl font-bold mt-0.5 text-white">{stats.byType.tahunan}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-rose-200 font-medium">🎓 {isId ? 'Final' : 'Final'}</div>
            <div className="text-xl font-bold mt-0.5 text-white">{stats.byType.final}</div>
          </div>
        </div>
      </div>

      {/* Category Pills Tab Bar */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTypeTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTypeTab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>📁 {isId ? 'Semua Kategori' : 'All Reports'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTypeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {reports.filter(r => selectedProjectId === 'all' || r.projectId === selectedProjectId).length}
          </span>
        </button>

        {(['Laporan Kegiatan', 'Laporan Bulanan', 'Laporan Kuartal', 'Laporan Semester', 'Laporan Tahunan', 'Laporan Final'] as ReportType[]).map(type => {
          const cfg = getReportTypeConfig(type);
          const count = reports.filter(r => (selectedProjectId === 'all' || r.projectId === selectedProjectId) && r.type === type).length;
          const isActive = activeTypeTab === type;
          return (
            <button
              key={type}
              onClick={() => setActiveTypeTab(type)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{isId ? cfg.labelId : cfg.labelEn}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isId ? 'Cari judul laporan, penyusun, periode, nama berkas...' : 'Search reports, author, period, filename...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project Filter */}
          {setSelectedProjectId && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{isId ? '🌐 Semua Proyek' : '🌐 All Projects'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.title.slice(0, 30)}...</option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{isId ? 'Semua Status' : 'All Status'}</option>
            <option value="Disetujui (Approved)">Disetujui (Approved)</option>
            <option value="Dalam Review">Dalam Review</option>
            <option value="Draft">Draft / Konsep</option>
            <option value="Revisi Diperlukan">Revisi Diperlukan</option>
            <option value="Telah Diterbitkan">Telah Diterbitkan</option>
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{isId ? 'Semua Tahun' : 'All Years'}</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        {/* View Toggle Mode */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewLayout('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              viewLayout === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={isId ? 'Tampilan Kartu Galeri' : 'Card View'}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">{isId ? 'Kartu' : 'Cards'}</span>
          </button>
          <button
            onClick={() => setViewLayout('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              viewLayout === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={isId ? 'Tampilan Tabel Register' : 'Table View'}
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{isId ? 'Tabel' : 'Table'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Cards or Table */}
      {viewLayout === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.length > 0 ? (
            filteredReports.map(item => {
              const project = projects.find(p => p.id === item.projectId);
              const typeCfg = getReportTypeConfig(item.type);
              const statusCfg = getReportStatusConfig(item.status);

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-blue-300"
                >
                  {/* Card Top Header */}
                  <div className="p-5 space-y-3.5">
                    {/* Badges Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${typeCfg.color}`}>
                        <span>{typeCfg.icon}</span>
                        <span>{isId ? typeCfg.labelId : typeCfg.labelEn}</span>
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                        <span>{isId ? statusCfg.labelId : statusCfg.labelEn}</span>
                      </span>
                    </div>

                    {/* Title & Project Name */}
                    <div>
                      <h3 
                        onClick={() => setViewingReport(item)}
                        className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition cursor-pointer line-clamp-2"
                      >
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                        <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{project?.code} • {project?.title}</span>
                      </div>
                    </div>

                    {/* Summary Highlights */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {item.summaryHighlights}
                    </p>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-semibold">{item.period}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.authorOrLead}</span>
                      </div>
                    </div>

                    {/* File Attachment & Size Badge */}
                    <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <File className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 text-[11px] truncate">
                            {item.fileName || `${item.type}_${item.year}.pdf`}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.fileSize || '3.4 MB'} • {item.fileData ? (isId ? 'Berkas Asli Tersimpan' : 'Binary File Ready') : (isId ? 'Terarsip SIMEV' : 'Archived')}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(item)}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 shadow-2xs active:scale-95"
                        title={isId ? 'Unduh Berkas Laporan' : 'Download Report File'}
                      >
                        <Download className="w-3 h-3" />
                        <span>{isId ? 'Unduh' : 'Download'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingReport(item)}
                      className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isId ? 'Detail & Pratinjau' : 'Preview'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition"
                            title={isId ? 'Edit Laporan' : 'Edit Report'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setReportToDelete(item)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition"
                            title={isId ? 'Hapus Laporan' : 'Delete Report'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                {isId ? 'Tidak ada laporan yang sesuai kriteria' : 'No reports match the filter'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isId ? 'Silakan ubah filter kategori, proyek, atau kata kunci pencarian Anda.' : 'Try adjusting your category, project, or keyword search.'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleOpenModal()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition inline-flex items-center gap-1.5 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isId ? 'Tambah Laporan Pertama' : 'Add First Report'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>{isId ? 'Daftar Terverifikasi Laporan Proyek' : 'Verified Project Reports Register'}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {isId ? 'Menampilkan' : 'Showing'} <strong>{filteredReports.length}</strong> {isId ? 'laporan' : 'reports'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">{isId ? 'Kategori' : 'Category'}</th>
                  <th className="py-3 px-4">{isId ? 'Judul Laporan & Proyek' : 'Report Title & Project'}</th>
                  <th className="py-3 px-4">{isId ? 'Periode' : 'Period'}</th>
                  <th className="py-3 px-4">{isId ? 'Penyusun / Tim' : 'Author / Team'}</th>
                  <th className="py-3 px-4">{isId ? 'Status' : 'Status'}</th>
                  <th className="py-3 px-4">{isId ? 'Berkas & Unduh' : 'File & Download'}</th>
                  <th className="py-3 px-4 text-center">{isId ? 'Aksi' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length > 0 ? (
                  filteredReports.map((item) => {
                    const project = projects.find(p => p.id === item.projectId);
                    const typeCfg = getReportTypeConfig(item.type);
                    const statusCfg = getReportStatusConfig(item.status);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1 ${typeCfg.color}`}>
                            <span>{typeCfg.icon}</span>
                            <span>{item.type}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div 
                            onClick={() => setViewingReport(item)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition line-clamp-1"
                          >
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <span>{project?.code}</span>
                            <span>•</span>
                            <span className="truncate">{project?.title}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{item.period}</div>
                          <div className="text-[10px] text-slate-400">Tahun {item.year}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{item.authorOrLead}</div>
                          {item.reviewerOrDonor && (
                            <div className="text-[10px] text-slate-400">Rev: {item.reviewerOrDonor}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${statusCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                            <span>{item.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownload(item)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                              title={isId ? 'Unduh Berkas' : 'Download File'}
                            >
                              <Download className="w-3 h-3" />
                              <span>{isId ? 'Unduh' : 'Download'}</span>
                            </button>
                            <span className="text-[10px] text-slate-400">{item.fileSize || '3.4 MB'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingReport(item)}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded transition"
                              title={isId ? 'Lihat Detail' : 'View Details'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenModal(item)}
                                  className="p-1 text-slate-500 hover:text-emerald-600 rounded transition"
                                  title={isId ? 'Edit Laporan' : 'Edit Report'}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setReportToDelete(item)}
                                  className="p-1 text-slate-500 hover:text-rose-600 rounded transition"
                                  title={isId ? 'Hapus Laporan' : 'Delete Report'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      {isId ? 'Tidak ada laporan yang ditemukan.' : 'No reports found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail / Preview Report */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const typeCfg = getReportTypeConfig(viewingReport.type);
                    const statusCfg = getReportStatusConfig(viewingReport.status);
                    return (
                      <>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${typeCfg.color}`}>
                          {typeCfg.icon} {viewingReport.type || typeCfg.labelId}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.color}`}>
                          {viewingReport.status || statusCfg.labelId}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <h2 className="text-xl font-bold leading-snug text-white">
                  {viewingReport.title}
                </h2>
                <p className="text-xs text-slate-300">
                  {projects.find(p => p.id === viewingReport.projectId)?.title} ({projects.find(p => p.id === viewingReport.projectId)?.code})
                </p>
              </div>
              <button 
                onClick={() => setViewingReport(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Meta Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400">{isId ? 'Periode Laporan' : 'Period'}</div>
                  <span className="font-bold text-slate-800">{viewingReport.period}</span>
                </div>
                <div>
                  <div className="text-slate-400">{isId ? 'Batas Waktu' : 'Deadline'}</div>
                  <span className="font-bold text-slate-800">{viewingReport.submissionDeadline}</span>
                </div>
                <div>
                  <div className="text-slate-400">{isId ? 'Penyusun / Lead' : 'Author'}</div>
                  <span className="font-bold text-slate-800">{viewingReport.authorOrLead}</span>
                </div>
                <div>
                  <div className="text-slate-400">{isId ? 'Pemeriksa / Donor' : 'Reviewer'}</div>
                  <span className="font-bold text-slate-800">{viewingReport.reviewerOrDonor || '-'}</span>
                </div>
              </div>

              {/* Summary Highlights */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{isId ? 'Ringkasan Eksekutif & Capaian Periode' : 'Executive Summary & Highlights'}</span>
                </h4>
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
                  {viewingReport.summaryHighlights}
                </div>
              </div>

              {/* Key Achievements */}
              {viewingReport.keyAchievements && viewingReport.keyAchievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isId ? 'Poin Capaian Kunci (Key Achievements)' : 'Key Achievements'}</span>
                  </h4>
                  <div className="space-y-2">
                    {viewingReport.keyAchievements.map((ach, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges and Mitigation */}
              {viewingReport.challengesAndMitigation && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>{isId ? 'Kendala & Tindakan Mitigasi' : 'Challenges & Mitigation'}</span>
                  </h4>
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-slate-700">
                    {viewingReport.challengesAndMitigation}
                  </div>
                </div>
              )}

              {/* Real File Download & Attachment Box */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{viewingReport.fileName || `${viewingReport.type}_${viewingReport.year}.pdf`}</div>
                    <div className="text-[11px] text-slate-300">{viewingReport.fileSize || '3.5 MB'} • {isId ? 'Arsip Berkas Resmi Terverifikasi' : 'Official Verified File'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {viewingReport.fileUrl && (
                    <a
                      href={viewingReport.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Cloud</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleDownload(viewingReport)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isId ? 'Unduh Berkas Laporan' : 'Download Report File'}</span>
                  </button>
                </div>
              </div>

              {/* Reviewer Feedback Notes */}
              {viewingReport.reviewNotes && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isId ? 'Catatan Verifikasi & Review:' : 'Verification Notes:'}</span>
                  </div>
                  <p className="font-semibold">{viewingReport.reviewNotes}</p>
                  {viewingReport.ratingOrScore && (
                    <div className="text-[11px] text-emerald-700 pt-1">
                      {isId ? 'Skor Kepatuhan Format & Substansi:' : 'Substantive Compliance Score:'} <strong>{viewingReport.ratingOrScore}%</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                {isAdmin && viewingReport.status !== 'Disetujui (Approved)' && (
                  <button
                    onClick={() => handleQuickApprove(viewingReport)}
                    className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isId ? 'Setujui Laporan Ini' : 'Approve Report'}</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Report Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingReport 
                      ? (isId ? 'Edit Laporan Proyek' : 'Edit Project Report') 
                      : (isId ? 'Unggah / Tambah Laporan Proyek Baru' : 'Upload / Add New Project Report')}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isId ? 'Formulir dokumentasi resmi laporan kegiatan, bulanan, kuartal, semester, tahunan & final' : 'Official documentation form for project reports'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Proyek & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Proyek Terkait *' : 'Associated Project *'}
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Kategori Laporan (Report Type) *' : 'Report Type *'}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ReportType)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    <option value="Laporan Kegiatan">📌 Laporan Kegiatan (Activity Report)</option>
                    <option value="Laporan Bulanan">🗓️ Laporan Bulanan (Monthly Report)</option>
                    <option value="Laporan Kuartal">📊 Laporan Kuartal (Quarterly Report)</option>
                    <option value="Laporan Semester">📑 Laporan Semester (Semester Report)</option>
                    <option value="Laporan Tahunan">🏆 Laporan Tahunan (Annual Report)</option>
                    <option value="Laporan Final">🎓 Laporan Final (Final Project Report)</option>
                  </select>
                </div>
              </div>

              {/* Judul Laporan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {isId ? 'Judul Lengkap Laporan *' : 'Full Report Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isId ? 'Contoh: Laporan Kegiatan Pelatihan SMART Patrol / Laporan Kuartal I 2026...' : 'e.g. Activity Report SMART Patrol Training...'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Periode, Tahun & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Periode / Tanggal Kegiatan' : 'Period / Date'}
                  </label>
                  <input
                    type="text"
                    placeholder={isId ? 'Contoh: 12-14 Jan 2026 / Q1 2026 / Semester 1' : 'e.g. Jan 2026 / Q1 2026'}
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Tahun Pelaporan' : 'Report Year'}
                  </label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Batas Waktu (Deadline)' : 'Submission Deadline'}
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Author & Reviewer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Penyusun / Penanggung Jawab *' : 'Lead Author / Officer *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isId ? 'Nama tim penyusun atau koordinator' : 'Name of author or coordinator'}
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Pemeriksa / Mitra Donor' : 'Reviewer / Donor Partner'}
                  </label>
                  <input
                    type="text"
                    placeholder={isId ? 'Contoh: Bappenas / Tim M&E GGEF' : 'e.g. Donor Lead / Reviewer'}
                    value={formReviewer}
                    onChange={(e) => setFormReviewer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Status Laporan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {isId ? 'Status Laporan *' : 'Report Status *'}
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="Draft">Draft / Konsep</option>
                  <option value="Dalam Review">Dalam Review</option>
                  <option value="Disetujui (Approved)">Disetujui (Approved)</option>
                  <option value="Revisi Diperlukan">Revisi Diperlukan</option>
                  <option value="Telah Diterbitkan">Telah Diterbitkan</option>
                </select>
              </div>

              {/* Summary Highlights */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {isId ? 'Ringkasan Eksekutif & Capaian (Summary) *' : 'Executive Summary & Highlights *'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={isId ? 'Tuliskan rangkuman capaian, progres kegiatan, dan hasil penting yang diperoleh...' : 'Brief summary of achievements...'}
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Dynamic Achievements List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    {isId ? 'Poin-Poin Capaian Kunci (Key Achievements)' : 'Key Achievement Bullet Points'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormAchievements(prev => [...prev, ''])}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isId ? 'Tambah Butir Capaian' : 'Add Point'}</span>
                  </button>
                </div>
                {formAchievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`${isId ? 'Capaian kunci' : 'Key achievement'} #${idx + 1}...`}
                      value={ach}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormAchievements(prev => {
                          const updated = [...prev];
                          updated[idx] = val;
                          return updated;
                        });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-xs"
                    />
                    {formAchievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormAchievements(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Challenges & Mitigation */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {isId ? 'Kendala yang Dihadapi & Langkah Mitigasi' : 'Challenges & Mitigation'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isId ? 'Deskripsikan hambatan operasional dan bagaimana tim menyelesaikannya...' : 'Describe challenges and actions taken...'}
                  value={formChallenges}
                  onChange={(e) => setFormChallenges(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* FILE UPLOAD SECTION (DRAG & DROP / FILE INPUT) */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>{isId ? 'Unggah Berkas Laporan Asli (Upload File)' : 'Upload Report File'}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2 shrink-0">
                    <File className="w-4 h-4" />
                    <span>{isId ? 'Pilih Berkas Komputer' : 'Choose Local File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 w-full truncate">
                    {formFileName ? (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-300 text-emerald-800 font-semibold truncate text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{formFileName}</span>
                        <span className="text-[10px] text-slate-500">({formFileSize})</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">
                        {isId ? 'Mendukung PDF, DOCX, XLSX, ZIP, Foto Dokumen (Maks. 50MB)' : 'Supports PDF, DOCX, XLSX, ZIP, Images'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <label className="text-[11px] font-medium text-slate-500 shrink-0">
                    {isId ? 'Atau Tautan Cloud (Google Drive / OneDrive):' : 'Or Cloud Link (Drive / OneDrive):'}
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formFileUrl}
                    onChange={(e) => setFormFileUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Beneficiary & Budget Spent */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Target Penerima (Jiwa)' : 'Target Beneficiaries'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formTargetBen}
                    onChange={(e) => setFormTargetBen(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Realisasi Penerima (Jiwa)' : 'Actual Beneficiaries'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formActualBen}
                    onChange={(e) => setFormActualBen(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Realisasi Anggaran (Rp)' : 'Budget Spent (Rp)'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formBudgetSpent}
                    onChange={(e) => setFormBudgetSpent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Review Notes & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Catatan Pemeriksa / Reviewer' : 'Reviewer Feedback Notes'}
                  </label>
                  <input
                    type="text"
                    placeholder={isId ? 'Catatan kelayakan substantif atau persetujuan...' : 'Compliance or approval notes...'}
                    value={formReviewNotes}
                    onChange={(e) => setFormReviewNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isId ? 'Skor Kepatuhan (%)' : 'Score (%)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition text-xs"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition text-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingReport ? (isId ? 'Simpan Perubahan' : 'Save Changes') : (isId ? 'Simpan & Publikasikan Laporan' : 'Save & Publish Report')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {isId ? 'Hapus Laporan Proyek?' : 'Delete Project Report?'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isId 
                ? `Apakah Anda yakin ingin menghapus laporan "${reportToDelete.title}"? Tindakan ini tidak dapat dibatalkan.`
                : `Are you sure you want to delete the report "${reportToDelete.title}"? This action cannot be undone.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteReport(reportToDelete.id);
                  showToast(isId ? `Laporan "${reportToDelete.title}" telah dihapus.` : `Report "${reportToDelete.title}" deleted.`);
                  setReportToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {isId ? 'Ya, Hapus Laporan' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
