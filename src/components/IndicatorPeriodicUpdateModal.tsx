import { useState, ChangeEvent } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Upload, 
  Link as LinkIcon, 
  Paperclip, 
  Trash2, 
  ExternalLink, 
  Download, 
  TrendingUp, 
  Plus, 
  Calendar, 
  AlertCircle, 
  FileCheck, 
  Layers,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Indicator, StatusProgress, MoVDocument, MoVCategory, PeriodicProgressLog } from '../types';
import { downloadMoVDocument, formatBytes } from '../utils/movHelper';
import { useLanguage } from '../context/LanguageContext';

interface IndicatorPeriodicUpdateModalProps {
  projectId: string;
  indicator: Indicator;
  onClose: () => void;
  onSave: (
    projectId: string,
    indicatorId: string,
    newActual: number,
    newStatus: StatusProgress,
    notes?: string,
    periodicLog?: PeriodicProgressLog,
    newMovDocuments?: MoVDocument[]
  ) => void;
}

const MOV_CATEGORIES: MoVCategory[] = [
  'Daftar Hadir / Absensi',
  'Laporan Naratif / Laporan Kegiatan',
  'Dokumentasi Foto & Video',
  'Kebijakan / SK / Perdes / Regulasi',
  'Materi & Modul Pelatihan',
  'Berita Acara / Notulensi',
  'Tautan Link Cloud (Drive/Dropbox)',
  'Lain-lain'
];

export default function IndicatorPeriodicUpdateModal({
  projectId,
  indicator,
  onClose,
  onSave
}: IndicatorPeriodicUpdateModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [activeTab, setActiveTab] = useState<'update' | 'mov' | 'history'>('update');

  // Periodic input states
  const [periodType, setPeriodType] = useState<'preset' | 'custom'>('preset');
  const [periodPreset, setPeriodPreset] = useState<string>('Triwulan 1 (Q1) 2025');
  const [customPeriod, setCustomPeriod] = useState<string>('');
  const [dateRecorded, setDateRecorded] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [inputMode, setInputMode] = useState<'delta' | 'total'>('delta');
  const [deltaValue, setDeltaValue] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(indicator.actual);
  
  const [status, setStatus] = useState<StatusProgress>(indicator.status || 'Sesuai Target (On-Track)');
  const [notes, setNotes] = useState<string>('');

  // MoV Attachments states
  const [newMovDocs, setNewMovDocs] = useState<MoVDocument[]>([]);
  const [movCategory, setMovCategory] = useState<MoVCategory>('Daftar Hadir / Absensi');
  const [movTitle, setMovTitle] = useState('');
  const [movSourceType, setMovSourceType] = useState<'file' | 'link'>('file');
  const [movLinkUrl, setMovLinkUrl] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [selectedFileData, setSelectedFileData] = useState('');
  const [movNotes, setMovNotes] = useState('');
  const [movFormError, setMovFormError] = useState('');

  // Calculate projected new actual
  const computedActual = inputMode === 'delta' 
    ? Math.max(0, indicator.actual + Number(deltaValue || 0))
    : Math.max(0, Number(totalValue || 0));

  const progressPercent = indicator.target > 0 
    ? Math.min(100, Math.round((computedActual / indicator.target) * 100))
    : 0;

  // Handle adding a new MoV document to staging
  const handleAddMoVToStaging = () => {
    if (!movTitle.trim()) {
      setMovFormError(isId ? 'Silakan masukkan judul atau deskripsi dokumen MoV' : 'Please enter the title or description of the MoV document');
      return;
    }
    setMovFormError('');

    const newDoc: MoVDocument = {
      id: `mov-${Date.now().toString().slice(-6)}`,
      title: movTitle.trim(),
      category: movCategory,
      fileName: movSourceType === 'file' ? (selectedFileName || `${movTitle.trim()}.pdf`) : undefined,
      fileSize: movSourceType === 'file' ? (selectedFileSize || '1.4 MB') : undefined,
      fileUrl: movSourceType === 'link' ? (movLinkUrl.trim() || 'https://drive.google.com') : undefined,
      fileData: movSourceType === 'file' ? (selectedFileData || undefined) : undefined,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: isId ? 'Tim M&E (Administrator)' : 'M&E Team (Admin)',
      notes: movNotes.trim() || undefined
    };

    setNewMovDocs(prev => [...prev, newDoc]);
    setMovTitle('');
    setMovLinkUrl('');
    setSelectedFileName('');
    setSelectedFileSize('');
    setSelectedFileData('');
    setMovNotes('');
  };

  const handleRemoveStagingMoV = (id: string) => {
    setNewMovDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(formatBytes(file.size));
      if (!movTitle) {
        setMovTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' '));
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedFileData(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const finalPeriodLabel = periodType === 'preset' ? periodPreset : (customPeriod.trim() || (isId ? 'Periode Baru' : 'New Period'));

    const periodicLog: PeriodicProgressLog = {
      id: `log-${Date.now().toString().slice(-6)}`,
      periodLabel: finalPeriodLabel,
      dateRecorded: dateRecorded,
      periodValue: inputMode === 'delta' ? Number(deltaValue || 0) : (computedActual - indicator.actual),
      cumulativeActual: computedActual,
      notes: notes.trim() || undefined,
      recordedBy: isId ? 'Administrator M&E' : 'M&E Administrator',
      movDocuments: newMovDocs.length > 0 ? newMovDocs : undefined
    };

    onSave(
      projectId,
      indicator.id,
      computedActual,
      status,
      notes.trim() || undefined,
      periodicLog,
      newMovDocs.length > 0 ? newMovDocs : undefined
    );
  };

  const existingMovDocs = indicator.movDocuments || [];
  const existingHistory = indicator.progressHistory || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {indicator.code}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Level: {indicator.level} &bull; {isId ? 'Frekuensi:' : 'Frequency:'} {indicator.frequency}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mt-1 leading-snug">
              {indicator.name}
            </h3>
            {indicator.definition && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {indicator.definition}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Current Progress Summary Banner */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Baseline:</span>
              <span className="font-bold text-slate-700">{indicator.baseline} {indicator.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">{isId ? 'Capaian Saat Ini:' : 'Current Actual:'}</span>
              <span className="font-extrabold text-blue-700 text-sm">{indicator.actual} {indicator.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">{isId ? 'Target Total:' : 'Total Target:'}</span>
              <span className="font-bold text-slate-900">{indicator.target} {indicator.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">{isId ? 'Proyeksi Baru:' : 'New Projection:'}</span>
              <span className="font-extrabold text-emerald-700 text-sm">{computedActual} {indicator.unit} ({progressPercent}%)</span>
            </div>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('update')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'update'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isId ? '1. Catat Capaian Berkala' : '1. Record Periodic Progress'}</span>
          </button>

          <button
            onClick={() => setActiveTab('mov')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'mov'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>{isId ? '2. Lampiran Dokumen MoV' : '2. MoV Documents'} ({existingMovDocs.length + newMovDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isId ? '3. Riwayat Capaian' : '3. Progress History'} ({existingHistory.length})</span>
          </button>
        </div>

        {/* TAB 1: CATAT CAPAIAN BERKALA */}
        {activeTab === 'update' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Periode Pelaporan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Periode Pelaporan:' : 'Reporting Period:'}
                </label>
                <div className="space-y-1.5">
                  <select
                    value={periodType === 'preset' ? periodPreset : 'custom'}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setPeriodType('custom');
                      } else {
                        setPeriodType('preset');
                        setPeriodPreset(e.target.value);
                      }
                    }}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Bulan Januari 2025">{isId ? 'Bulan Januari 2025' : 'January 2025'}</option>
                    <option value="Bulan Februari 2025">{isId ? 'Bulan Februari 2025' : 'February 2025'}</option>
                    <option value="Bulan Maret 2025">{isId ? 'Bulan Maret 2025' : 'March 2025'}</option>
                    <option value="Bulan April 2025">{isId ? 'Bulan April 2025' : 'April 2025'}</option>
                    <option value="Bulan Mei 2025">{isId ? 'Bulan Mei 2025' : 'May 2025'}</option>
                    <option value="Bulan Juni 2025">{isId ? 'Bulan Juni 2025' : 'June 2025'}</option>
                    <option value="Triwulan 1 (Q1) 2025">{isId ? 'Triwulan 1 (Q1) 2025' : 'Quarter 1 (Q1) 2025'}</option>
                    <option value="Triwulan 2 (Q2) 2025">{isId ? 'Triwulan 2 (Q2) 2025' : 'Quarter 2 (Q2) 2025'}</option>
                    <option value="Triwulan 3 (Q3) 2025">{isId ? 'Triwulan 3 (Q3) 2025' : 'Quarter 3 (Q3) 2025'}</option>
                    <option value="Triwulan 4 (Q4) 2025">{isId ? 'Triwulan 4 (Q4) 2025' : 'Quarter 4 (Q4) 2025'}</option>
                    <option value="Semester 1 2025">{isId ? 'Semester 1 2025' : 'Semester 1 2025'}</option>
                    <option value="Semester 2 2025">{isId ? 'Semester 2 2025' : 'Semester 2 2025'}</option>
                    <option value="Tahunan 2025">{isId ? 'Tahunan 2025' : 'Annual 2025'}</option>
                    <option value="custom">{isId ? '+ Kustom Periode Lainnya...' : '+ Custom Other Period...'}</option>
                  </select>

                  {periodType === 'custom' && (
                    <input
                      type="text"
                      placeholder={isId ? 'Masukkan nama periode kustom (misal: Monev Lapangan Mei 2025)' : 'Enter custom period name (e.g. Field M&E May 2025)'}
                      value={customPeriod}
                      onChange={(e) => setCustomPeriod(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                </div>
              </div>

              {/* Tanggal Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Tanggal Pencatatan:' : 'Date Recorded:'}
                </label>
                <input
                  type="date"
                  value={dateRecorded}
                  onChange={(e) => setDateRecorded(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Input Nilai Capaian */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  {isId ? `Metode Pengisian Nilai (${indicator.unit}):` : `Input Method (${indicator.unit}):`}
                </span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setInputMode('delta')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      inputMode === 'delta' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isId ? '+ Tambah Capaian Periode Ini' : '+ Add Period Progress'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('total')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      inputMode === 'total' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isId ? 'Set Total Akumulatif Baru' : 'Set New Cumulative Total'}
                  </button>
                </div>
              </div>

              {inputMode === 'delta' ? (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={deltaValue}
                      onChange={(e) => setDeltaValue(Number(e.target.value))}
                      placeholder="0"
                      className="w-40 text-base font-bold p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <span className="text-slate-600 font-medium">
                      {isId ? `${indicator.unit} ditambahkan pada periode ini` : `${indicator.unit} added in this period`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isId ? 'Capaian sebelumnya:' : 'Previous actual:'} <strong>{indicator.actual}</strong> + {isId ? 'Tambahan' : 'Addition'} ({deltaValue || 0}) = <strong>{computedActual} {indicator.unit}</strong>
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={totalValue}
                      onChange={(e) => setTotalValue(Number(e.target.value))}
                      className="w-40 text-base font-bold p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <span className="text-slate-600 font-medium">{indicator.unit} ({isId ? 'Total Akumulatif' : 'Cumulative Total'})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Progress */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Status Kinerja Indikator:' : 'Indicator Performance Status:'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusProgress)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
              >
                <option value="Sesuai Target (On-Track)">{isId ? '🟢 Sesuai Target (On-Track)' : '🟢 On-Track'}</option>
                <option value="Tercapai">{isId ? '🌟 Tercapai (Target Selesai / Melampaui)' : '🌟 Achieved / Completed'}</option>
                <option value="Perlu Perhatian (Delayed)">{isId ? '🟡 Perlu Perhatian (Delayed / Ada Kendala)' : '🟡 Delayed / Needs Attention'}</option>
                <option value="Belum Dimulai">{isId ? '⚪ Belum Dimulai' : '⚪ Not Started'}</option>
              </select>
            </div>

            {/* Catatan Kemajuan & Narasi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Catatan Narasi & Kemajuan Periode Ini:' : 'Narrative Notes & Progress this Period:'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isId ? 'Tuliskan ringkasan kemajuan, kendala yang dihadapi, atau justifikasi pencapaian...' : 'Summarize progress, challenges faced, or justification for achievements...'}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: UNGGAH & KELOLA DOKUMEN MoV */}
        {activeTab === 'mov' && (
          <div className="space-y-4 text-xs">
            {/* Form Tambah Dokumen MoV Baru */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  {isId ? 'Tambah Dokumen Bukti Verifikasi (MoV) Baru' : 'Add New Means of Verification (MoV) Document'}
                </span>
                <span className="text-[10px] text-slate-400">{isId ? 'Bukti Audit & Akuntabilitas' : 'Audit & Verification Trail'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isId ? 'Kategori Dokumen MoV:' : 'MoV Document Category:'}
                  </label>
                  <select
                    value={movCategory}
                    onChange={(e) => setMovCategory(e.target.value as MoVCategory)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {MOV_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isId ? 'Judul / Nama Dokumen:' : 'Document Title / Name:'}
                  </label>
                  <input
                    type="text"
                    placeholder={isId ? 'Contoh: Daftar Hadir Pelatihan HHBK Desa Menjalin' : 'e.g. Training Attendance Sheet Menjalin Village'}
                    value={movTitle}
                    onChange={(e) => setMovTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Tipe Sumber: File vs Tautan Cloud Link */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="movSourceType"
                      checked={movSourceType === 'file'}
                      onChange={() => setMovSourceType('file')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isId ? 'Unggah Berkas / Dokumen Digital' : 'Upload Digital Document'}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="movSourceType"
                      checked={movSourceType === 'link'}
                      onChange={() => setMovSourceType('link')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isId ? 'Tautan Link Cloud (Google Drive / OneDrive / Dropbox)' : 'Cloud Storage Link (Drive / Dropbox)'}</span>
                  </label>
                </div>

                {movSourceType === 'file' ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-white hover:bg-slate-50 transition text-center space-y-1">
                    <input
                      type="file"
                      id="mov-file-input"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="mov-file-input"
                      className="cursor-pointer inline-flex items-center gap-2 text-emerald-700 font-semibold text-xs py-1 px-3 bg-emerald-50 rounded-lg border border-emerald-200"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isId ? 'Pilih Berkas dari Komputer' : 'Browse File from Device'}
                    </label>
                    {selectedFileName ? (
                      <p className="text-[11px] font-bold text-slate-800">
                        📄 {selectedFileName} ({selectedFileSize})
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        {isId ? 'Mendukung PDF, Word, Excel, Foto/Scan JPG/PNG (Maks 10MB)' : 'Supports PDF, Word, Excel, JPG/PNG (Max 10MB)'}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={movLinkUrl}
                      onChange={(e) => setMovLinkUrl(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder={isId ? 'Keterangan tambahan dokumen (opsional)...' : 'Additional document notes (optional)...'}
                  value={movNotes}
                  onChange={(e) => setMovNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddMoVToStaging}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isId ? '+ Lampirkan Dokumen ke Sesi Ini' : '+ Attach Document to Session'}
                </button>
              </div>
            </div>

            {/* List Dokumen MoV Terlampir */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs block">
                {isId ? 'Daftar Dokumen MoV Terverifikasi:' : 'Verified MoV Document List:'}
              </span>

              {existingMovDocs.length === 0 && newMovDocs.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                  {isId ? 'Belum ada dokumen MoV yang dilampirkan untuk indikator ini. Silakan tambahkan formulir di atas.' : 'No MoV documents attached yet for this indicator.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Dokumen yang baru ditambahkan di sesi ini */}
                  {newMovDocs.map(doc => (
                    <div key={doc.id} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{doc.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {isId ? 'Baru (Sesi Ini)' : 'New (This Session)'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {isId ? 'Kategori:' : 'Category:'} {doc.category} &bull; {doc.fileName || (isId ? 'Tautan Cloud' : 'Cloud Link')} ({doc.fileSize || 'Link'})
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveStagingMoV(doc.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                        title={isId ? 'Hapus lampiran' : 'Remove attachment'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Dokumen yang sudah tersimpan sebelumnya */}
                  {existingMovDocs.map(doc => (
                    <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{doc.title}</span>
                          <p className="text-[10px] text-slate-500">
                            {doc.category} &bull; {doc.fileName || (isId ? 'Tautan Eksternal' : 'External Link')} &bull; {isId ? 'Diunggah:' : 'Uploaded:'} {doc.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {doc.fileUrl ? (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {isId ? 'Buka' : 'Open'}
                          </a>
                        ) : (
                          <button
                            onClick={() => downloadMoVDocument(doc, { indicatorCode: indicator.code, indicatorName: indicator.name })}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            {isId ? 'Unduh' : 'Download'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RIWAYAT CAPAIAN BERKALA */}
        {activeTab === 'history' && (
          <div className="space-y-3 text-xs">
            <span className="font-bold text-slate-800 block">
              {isId ? 'Timeline Kronologis Riwayat Capaian Indikator:' : 'Chronological Indicator Progress History:'}
            </span>

            {existingHistory.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                {isId ? 'Belum ada catatan riwayat capaian berkala sebelumnya.' : 'No periodic progress history recorded yet.'}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {existingHistory.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.periodLabel}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({item.dateRecorded})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 text-[11px]">
                        +{item.periodValue} &rarr; {isId ? 'Akumulasi:' : 'Cumulative:'} {item.cumulativeActual} {indicator.unit}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{isId ? 'Dicatat oleh:' : 'Recorded by:'} {item.recordedBy}</span>
                      {item.movDocuments && item.movDocuments.length > 0 && (
                        <span className="text-blue-600 font-semibold flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {item.movDocuments.length} {isId ? 'Dokumen MoV Terlampir' : 'MoV Documents Attached'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            {isId ? 'Batal' : 'Cancel'}
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isId ? 'Simpan Capaian & Dokumen MoV' : 'Save Progress & MoV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
