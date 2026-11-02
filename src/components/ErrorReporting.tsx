import React, { useState, useMemo } from 'react';
import { 
  AlertOctagon, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Bug, 
  Layers, 
  User, 
  Calendar, 
  X, 
  Eye, 
  Send,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ErrorReport, ErrorSeverity, ErrorStatus, ErrorModule } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { exportErrorReportsToXLSX } from '../utils/exportXlsx';

interface ErrorReportingProps {
  errorReports: ErrorReport[];
  isAdmin: boolean;
  onAddErrorReport: (report: ErrorReport) => void;
  onUpdateErrorReport?: (report: ErrorReport) => void;
  onDeleteErrorReport?: (id: string) => void;
}

const SEVERITY_BADGES: Record<ErrorSeverity, { bg: string; text: string; border: string; icon: string }> = {
  'Kritis (Critical)': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', icon: '🚨' },
  'Tinggi (High)': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', icon: '⚠️' },
  'Sedang (Medium)': { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300', icon: '⚡' },
  'Rendah (Low)': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300', icon: 'ℹ️' }
};

const STATUS_BADGES: Record<ErrorStatus, { bg: string; text: string; border: string; icon: any }> = {
  'Baru (Open)': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
  'Dalam Investigasi': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: AlertOctagon },
  'Selesai (Resolved)': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  'Ditutup (Closed)': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', icon: XCircle }
};

export const ErrorReporting: React.FC<ErrorReportingProps> = ({
  errorReports,
  isAdmin,
  onAddErrorReport,
  onUpdateErrorReport,
  onDeleteErrorReport
}) => {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<ErrorReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Resolution Notes inside view modal
  const [resolutionInput, setResolutionInput] = useState('');
  const [statusUpdateInput, setStatusUpdateInput] = useState<ErrorStatus>('Selesai (Resolved)');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    module: 'Penerima Manfaat & GESI' as ErrorModule,
    severity: 'Sedang (Medium)' as ErrorSeverity,
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    reportedBy: 'Staff M&E',
    reporterEmail: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Error Reports
  const filteredReports = useMemo(() => {
    return errorReports.filter(r => {
      const matchSearch = 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity = severityFilter === 'all' || r.severity === severityFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchModule = moduleFilter === 'all' || r.module === moduleFilter;

      return matchSearch && matchSeverity && matchStatus && matchModule;
    });
  }, [errorReports, searchQuery, severityFilter, statusFilter, moduleFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: errorReports.length,
      open: errorReports.filter(r => r.status === 'Baru (Open)').length,
      investigating: errorReports.filter(r => r.status === 'Dalam Investigasi').length,
      resolved: errorReports.filter(r => r.status === 'Selesai (Resolved)' || r.status === 'Ditutup (Closed)').length,
      critical: errorReports.filter(r => r.severity === 'Kritis (Critical)' && r.status !== 'Selesai (Resolved)' && r.status !== 'Ditutup (Closed)').length
    };
  }, [errorReports]);

  // Submit New Error Ticket
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert(isId ? 'Judul laporan dan deskripsi kendala wajib diisi.' : 'Title and description are required.');
      return;
    }

    const newTicket: ErrorReport = {
      id: `ERR-${Date.now().toString().slice(-4)}`,
      title: formData.title.trim(),
      module: formData.module,
      severity: formData.severity,
      status: 'Baru (Open)',
      description: formData.description.trim(),
      stepsToReproduce: formData.stepsToReproduce.trim() || undefined,
      expectedBehavior: formData.expectedBehavior.trim() || undefined,
      actualBehavior: formData.actualBehavior.trim() || undefined,
      systemInfo: `Browser: ${navigator.userAgent.slice(0, 45)}...`,
      reportedBy: formData.reportedBy.trim() || 'Pengguna Sistem',
      reporterEmail: formData.reporterEmail.trim() || undefined,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    onAddErrorReport(newTicket);
    setIsSubmitModalOpen(false);
    setFormData({
      title: '',
      module: 'Penerima Manfaat & GESI',
      severity: 'Sedang (Medium)',
      description: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      reportedBy: 'Staff M&E',
      reporterEmail: ''
    });
    showToast(isId ? `Laporan kendala [${newTicket.id}] berhasil dikirim ke tim pengembang.` : `Bug report [${newTicket.id}] submitted successfully.`);
  };

  // Handle Update Status & Resolution
  const handleSaveResolution = () => {
    if (!viewingReport || !onUpdateErrorReport) return;

    const updated: ErrorReport = {
      ...viewingReport,
      status: statusUpdateInput,
      resolutionNotes: resolutionInput.trim() || viewingReport.resolutionNotes,
      resolvedAt: (statusUpdateInput === 'Selesai (Resolved)' || statusUpdateInput === 'Ditutup (Closed)')
        ? new Date().toISOString().replace('T', ' ').slice(0, 16)
        : undefined
    };

    onUpdateErrorReport(updated);
    setViewingReport(updated);
    showToast(isId ? `Status laporan [${updated.id}] diperbarui menjadi "${statusUpdateInput}".` : `Report [${updated.id}] status updated.`);
  };

  // Export XLSX
  const handleExportXLSX = () => {
    exportErrorReportsToXLSX(filteredReports, `Laporan_Error_SIMEV_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(isId ? 'Daftar laporan error diekspor ke Excel (.xlsx)' : 'Error reports exported to Excel (.xlsx)');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID Tiket', 'Judul Kendala / Error', 'Modul Sistem', 'Tingkat Keparahan', 'Status', 'Pelapor', 'Deskripsi', 'Langkah Reproduksi', 'Catatan Penyelesaian', 'Tanggal Lapor', 'Tanggal Selesai'];
    const rows = filteredReports.map(r => [
      `"${r.id}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.module}"`,
      `"${r.severity}"`,
      `"${r.status}"`,
      `"${r.reportedBy}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${(r.stepsToReproduce || '-').replace(/"/g, '""')}"`,
      `"${(r.resolutionNotes || '-').replace(/"/g, '""')}"`,
      `"${r.createdAt}"`,
      `"${r.resolvedAt || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Error_SIMEV_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isId ? 'Daftar laporan error diekspor ke CSV' : 'Error reports exported to CSV');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
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
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-rose-200 border border-white/15">
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span>{isId ? 'Pusat Bantuan & Laporan Kendala Sistem' : 'System Error & Bug Reporting'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isId ? 'Menu Laporan Error & Bug' : 'Error & Issue Tracker'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isId 
                ? 'Laporkan kendala teknis, error impor data, atau ketidaksesuaian perhitungan langsung ke tim teknis M&E. Pantau status investigasi dan resolusi tiket.'
                : 'Report technical glitches, data import errors, or calculation issues directly to the M&E engineering team. Track ticket investigation and resolution status.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportXLSX}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-md"
              title={isId ? 'Ekspor Daftar Error ke Excel (.xlsx)' : 'Export Error Tickets to Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{isId ? 'Ekspor Excel (XLSX)' : 'Export Excel (XLSX)'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold transition flex items-center gap-2 backdrop-blur-sm"
              title={isId ? 'Ekspor CSV' : 'Export CSV'}
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isId ? '+ Buat Laporan Kendala' : '+ Report an Issue'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300 font-medium">{isId ? 'Total Laporan' : 'Total Reports'}</div>
            <div className="text-2xl font-bold mt-0.5 text-white">{stats.total}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-300 font-medium">🔵 {isId ? 'Baru / Terbuka' : 'Open Tickets'}</div>
            <div className="text-2xl font-bold mt-0.5 text-blue-300">{stats.open}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-purple-300 font-medium">🟣 {isId ? 'Investigasi' : 'Investigating'}</div>
            <div className="text-2xl font-bold mt-0.5 text-purple-300">{stats.investigating}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-300 font-medium">🟢 {isId ? 'Selesai / Ditutup' : 'Resolved'}</div>
            <div className="text-2xl font-bold mt-0.5 text-emerald-400">{stats.resolved}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-rose-300 font-medium">🚨 {isId ? 'Kendala Kritis' : 'Critical Issues'}</div>
            <div className="text-2xl font-bold mt-0.5 text-rose-400">{stats.critical}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isId ? 'Cari judul kendala, nomor tiket, deskripsi, pelapor...' : 'Search issues, ticket ID, reporter...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
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

          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">{isId ? 'Semua Modul' : 'All Modules'}</option>
            <option value="Penerima Manfaat & GESI">Penerima Manfaat & GESI</option>
            <option value="Kegiatan & Presensi">Kegiatan & Presensi</option>
            <option value="Logframe & Indikator">Logframe & Indikator</option>
            <option value="Laporan Proyek">Laporan Proyek</option>
            <option value="Publikasi & Media">Publikasi & Media</option>
            <option value="Pembelajaran">Pembelajaran</option>
            <option value="Manajemen Akun">Manajemen Akun</option>
            <option value="Ekspor / Impor Berkas">Ekspor / Impor Berkas</option>
            <option value="Sistem Umum">Sistem Umum</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">{isId ? 'Semua Keparahan' : 'All Severities'}</option>
            <option value="Kritis (Critical)">🚨 Kritis (Critical)</option>
            <option value="Tinggi (High)">⚠️ Tinggi (High)</option>
            <option value="Sedang (Medium)">⚡ Sedang (Medium)</option>
            <option value="Rendah (Low)">ℹ️ Rendah (Low)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">{isId ? 'Semua Status' : 'All Status'}</option>
            <option value="Baru (Open)">🔵 Baru (Open)</option>
            <option value="Dalam Investigasi">🟣 Dalam Investigasi</option>
            <option value="Selesai (Resolved)">🟢 Selesai (Resolved)</option>
            <option value="Ditutup (Closed)">⚪ Ditutup (Closed)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {isId ? `${filteredReports.length} laporan ditampilkan` : `${filteredReports.length} reports showing`}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-semibold border-b border-slate-800">
                <th className="py-3.5 px-4 w-28">{isId ? 'ID Tiket' : 'Ticket ID'}</th>
                <th className="py-3.5 px-3">{isId ? 'Judul Kendala & Modul' : 'Issue Title & Module'}</th>
                <th className="py-3.5 px-3">{isId ? 'Keparahan' : 'Severity'}</th>
                <th className="py-3.5 px-3">{isId ? 'Status' : 'Status'}</th>
                <th className="py-3.5 px-3">{isId ? 'Pelapor' : 'Reported By'}</th>
                <th className="py-3.5 px-3">{isId ? 'Waktu Dilaporkan' : 'Reported At'}</th>
                <th className="py-3.5 px-4 text-right">{isId ? 'Aksi' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredReports.length > 0 ? (
                filteredReports.map(item => {
                  const sevStyle = SEVERITY_BADGES[item.severity] || SEVERITY_BADGES['Sedang (Medium)'];
                  const statusStyle = STATUS_BADGES[item.status] || STATUS_BADGES['Baru (Open)'];
                  const StatusIcon = statusStyle.icon;

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => {
                        setViewingReport(item);
                        setResolutionInput(item.resolutionNotes || '');
                        setStatusUpdateInput(item.status);
                      }}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                        {item.id}
                      </td>

                      {/* Title & Module */}
                      <td className="py-3.5 px-3 max-w-md">
                        <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {item.module}
                          </span>
                          {item.resolutionNotes && (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {isId ? 'Ada solusi' : 'Resolved'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                          <span>{sevStyle.icon}</span>
                          <span>{item.severity.split(' ')[0]}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{item.status.split(' ')[0]}</span>
                        </span>
                      </td>

                      {/* Reported By */}
                      <td className="py-3.5 px-3 text-slate-700">
                        <div className="font-medium">{item.reportedBy}</div>
                        {item.reporterEmail && <div className="text-[10px] text-slate-400 font-mono">{item.reporterEmail}</div>}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {item.createdAt}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingReport(item);
                            setResolutionInput(item.resolutionNotes || '');
                            setStatusUpdateInput(item.status);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isId ? 'Detail' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Bug className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">{isId ? 'Tidak ada laporan kendala yang cocok' : 'No error reports found'}</p>
                    <p className="text-xs text-slate-400 mt-1">{isId ? 'Semua modul sistem berjalan optimal tanpa kendala tercatat.' : 'All system modules are running smoothly.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Submit New Error Ticket */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <Bug className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {isId ? 'Buat Laporan Kendala / Bug Baru' : 'Submit New Bug / Error Report'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isId ? 'Kirimkan laporan rinci mengenai kendala sistem yang dihadapi.' : 'Send detailed report regarding technical issues encountered.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Judul Kendala / Error *' : 'Issue Summary / Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isId ? 'Contoh: Tombol ekspor data Excel tidak merespons saat filter disabilitas aktif' : 'e.g. Excel export button not responding when disability filter is active'}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              {/* Module & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Modul Sistem Terkait *' : 'System Module *'}
                  </label>
                  <select
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value as ErrorModule })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  >
                    <option value="Penerima Manfaat & GESI">Penerima Manfaat & GESI</option>
                    <option value="Kegiatan & Presensi">Kegiatan & Presensi</option>
                    <option value="Logframe & Indikator">Logframe & Indikator</option>
                    <option value="Laporan Proyek">Laporan Proyek</option>
                    <option value="Publikasi & Media">Publikasi & Media</option>
                    <option value="Pembelajaran">Pembelajaran</option>
                    <option value="Manajemen Akun">Manajemen Akun</option>
                    <option value="Ekspor / Impor Berkas">Ekspor / Impor Berkas</option>
                    <option value="Sistem Umum">Sistem Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Tingkat Keparahan *' : 'Severity Level *'}
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as ErrorSeverity })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold"
                  >
                    <option value="Kritis (Critical)">🚨 Kritis (Critical) - Sistem macet / tidak bisa dipakai</option>
                    <option value="Tinggi (High)">⚠️ Tinggi (High) - Fitur utama terganggu</option>
                    <option value="Sedang (Medium)">⚡ Sedang (Medium) - Fitur sekunder ada kendala</option>
                    <option value="Rendah (Low)">ℹ️ Rendah (Low) - Masalah tampilan / kosmetik</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Deskripsi Kendala *' : 'Issue Description *'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isId ? 'Jelaskan secara rinci kendala yang terjadi...' : 'Describe in detail what happened...'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium resize-none"
                />
              </div>

              {/* Steps to reproduce */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Langkah untuk Mereproduksi Error (Opsional)' : 'Steps to Reproduce (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isId ? '1. Buka menu Penerima Manfaat\n2. Klik tombol Ekspor XLSX\n3. Halaman tidak memuat unduhan' : '1. Open Beneficiary menu\n2. Click Export XLSX\n3. Nothing downloads'}
                  value={formData.stepsToReproduce}
                  onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono text-[11px] resize-none"
                />
              </div>

              {/* Reporter Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Nama Pelapor' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Email Pelapor' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    placeholder="nama@monitoring.org"
                    value={formData.reporterEmail}
                    onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isId ? 'Kirim Laporan Kendala' : 'Submit Error Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Update Report Detail */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setViewingReport(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 mb-5">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 shrink-0">
                <Bug className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-rose-700 text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {viewingReport.id}
                  </span>
                  {(() => {
                    const sevStyle = SEVERITY_BADGES[viewingReport.severity] || SEVERITY_BADGES['Sedang (Medium)'];
                    const statusStyle = STATUS_BADGES[viewingReport.status] || STATUS_BADGES['Baru (Open)'];
                    return (
                      <>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                          {viewingReport.severity}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {viewingReport.status}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{viewingReport.title}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Modul: <strong className="text-slate-700">{viewingReport.module}</strong></span>
                  <span>•</span>
                  <span>Dilaporkan oleh: <strong className="text-slate-700">{viewingReport.reportedBy}</strong></span>
                  <span>•</span>
                  <span>{viewingReport.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Description */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 mb-1">{isId ? 'Deskripsi Lengkap Kendala:' : 'Issue Description:'}</h4>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{viewingReport.description}</p>
              </div>

              {/* Steps to reproduce */}
              {viewingReport.stepsToReproduce && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-1">{isId ? 'Langkah Reproduksi Error:' : 'Steps to Reproduce:'}</h4>
                  <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap">{viewingReport.stepsToReproduce}</pre>
                </div>
              )}

              {/* Resolution / Admin Section */}
              {isAdmin && (
                <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-emerald-700" />
                    <span>{isId ? 'Panel Penyelesaian & Update Status Tiket' : 'Resolution & Status Update'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isId ? 'Ubah Status Tiket' : 'Update Status'}
                      </label>
                      <select
                        value={statusUpdateInput}
                        onChange={(e) => setStatusUpdateInput(e.target.value as ErrorStatus)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                      >
                        <option value="Baru (Open)">🔵 Baru (Open)</option>
                        <option value="Dalam Investigasi">🟣 Dalam Investigasi</option>
                        <option value="Selesai (Resolved)">🟢 Selesai (Resolved)</option>
                        <option value="Ditutup (Closed)">⚪ Ditutup (Closed)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isId ? 'Catatan Tindak Lanjut / Solusi Teknis' : 'Follow-up Notes / Resolution'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={isId ? 'Tuliskan catatan perbaikan atau penyebab error...' : 'Write fix notes or root cause...'}
                      value={resolutionInput}
                      onChange={(e) => setResolutionInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveResolution}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isId ? 'Simpan Pembaruan Tiket' : 'Save Ticket Update'}</span>
                  </button>
                </div>
              )}

              {/* Resolution Notes Display for Non-Admin */}
              {!isAdmin && viewingReport.resolutionNotes && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-900 mb-1">🟢 {isId ? 'Solusi / Catatan Penanganan:' : 'Resolution Notes:'}</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-wrap">{viewingReport.resolutionNotes}</p>
                  {viewingReport.resolvedAt && (
                    <div className="text-[10px] text-emerald-600 mt-2 font-mono">Diselesaikan pada: {viewingReport.resolvedAt}</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setViewingReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorReporting;
