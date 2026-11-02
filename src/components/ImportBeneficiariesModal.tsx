import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  X, 
  Users, 
  ShieldCheck, 
  Info, 
  Filter, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';
import { Beneficiary, Project } from '../types';
import { analyzeImportBeneficiaries, ParsedImportRow } from '../utils/beneficiaryDeduplication';
import { downloadExcelTemplate, downloadCSVTemplate, parseBeneficiaryFile } from '../utils/beneficiaryTemplate';
import { useLanguage } from '../context/LanguageContext';

interface ImportBeneficiariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBeneficiaries: Beneficiary[];
  projects?: Project[];
  onImportSuccess: (
    newBeneficiaries: Omit<Beneficiary, 'id'>[],
    updatedBeneficiaries?: Beneficiary[]
  ) => void;
}

export default function ImportBeneficiariesModal({
  isOpen,
  onClose,
  existingBeneficiaries,
  projects = [],
  onImportSuccess
}: ImportBeneficiariesModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  
  // Parsed & Analyzed Data
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [summary, setSummary] = useState({
    totalRows: 0,
    validNewCount: 0,
    duplicateDatabaseCount: 0,
    duplicateInFileCount: 0,
    invalidCount: 0
  });

  // Duplicate resolution strategy
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update' | 'manual'>('skip');

  // Preview filtering
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'valid_new' | 'duplicate' | 'invalid'>('all');
  const [previewSearch, setPreviewSearch] = useState('');

  // Result counts after import
  const [importResultCount, setImportResultCount] = useState({ added: 0, updated: 0, skipped: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('upload');
    setFileName('');
    setFileSize('');
    setParsedRows([]);
    setSummary({
      totalRows: 0,
      validNewCount: 0,
      duplicateDatabaseCount: 0,
      duplicateInFileCount: 0,
      invalidCount: 0
    });
    setDuplicateStrategy('skip');
    setActiveFilterTab('all');
    setPreviewSearch('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // File Handling
  const processUploadedFile = async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      alert(isId ? 'Format file tidak didukung. Mohon unggah file berekstensi .xlsx, .xls, atau .csv' : 'Unsupported file format. Please upload .xlsx, .xls, or .csv');
      return;
    }

    try {
      setIsLoading(true);
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');

      const rawJson = await parseBeneficiaryFile(file);

      if (rawJson.length === 0) {
        alert(isId ? 'File yang diunggah kosong atau tidak memiliki baris data!' : 'Uploaded file is empty or has no data rows!');
        setIsLoading(false);
        return;
      }

      // Analyze against existing database with strict (Nama + Gender + Alamat) deduplication
      const analysis = analyzeImportBeneficiaries(
        rawJson,
        existingBeneficiaries,
        projects[0]?.province || 'Kalimantan Barat',
        projects[0]?.targetLocations?.[0] || 'Kabupaten Landak',
        projects[0]?.targetVillages?.[0] || 'Desa Menjalin'
      );

      setParsedRows(analysis.parsedRows);
      setSummary(analysis.summary);
      setStep('preview');
    } catch (err: any) {
      console.error('Error reading file:', err);
      alert(isId ? `Gagal memproses file: ${err?.message || 'Format data tidak valid'}` : `Failed to process file: ${err?.message || 'Invalid format'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Change individual row selection
  const handleToggleRowSelection = (rowNumber: number) => {
    setParsedRows(prev => prev.map(r => {
      if (r.rowNumber === rowNumber) {
        return { ...r, selectedForImport: !r.selectedForImport };
      }
      return r;
    }));
  };

  // Apply Strategy changes to row selections
  const handleStrategyChange = (newStrategy: 'skip' | 'update' | 'manual') => {
    setDuplicateStrategy(newStrategy);
    if (newStrategy === 'skip') {
      setParsedRows(prev => prev.map(r => ({
        ...r,
        selectedForImport: r.status === 'valid_new'
      })));
    } else if (newStrategy === 'update') {
      setParsedRows(prev => prev.map(r => ({
        ...r,
        selectedForImport: r.status === 'valid_new' || r.status === 'duplicate_database'
      })));
    }
  };

  // Select all or deselect in preview
  const handleSelectAllVisible = (select: boolean) => {
    const visibleRowNumbers = new Set(filteredPreviewRows.map(r => r.rowNumber));
    setParsedRows(prev => prev.map(r => {
      if (visibleRowNumbers.has(r.rowNumber) && r.status !== 'invalid') {
        return { ...r, selectedForImport: select };
      }
      return r;
    }));
  };

  // Filtered rows for preview table
  const filteredPreviewRows = parsedRows.filter(r => {
    if (activeFilterTab === 'valid_new' && r.status !== 'valid_new') return false;
    if (activeFilterTab === 'duplicate' && r.status !== 'duplicate_database' && r.status !== 'duplicate_in_file') return false;
    if (activeFilterTab === 'invalid' && r.status !== 'invalid') return false;

    if (previewSearch.trim()) {
      const q = previewSearch.toLowerCase();
      const matchName = r.fullName.toLowerCase().includes(q);
      const matchVillage = r.village.toLowerCase().includes(q);
      const matchNik = r.nikOrIdentifier.toLowerCase().includes(q);
      if (!matchName && !matchVillage && !matchNik) return false;
    }

    return true;
  });

  const countSelected = parsedRows.filter(r => r.selectedForImport).length;

  // Execute Import
  const handleConfirmImport = () => {
    const toImportNew: Omit<Beneficiary, 'id'>[] = [];
    const toUpdateExisting: Beneficiary[] = [];

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    parsedRows.forEach(r => {
      if (!r.selectedForImport || r.status === 'invalid') {
        skippedCount++;
        return;
      }

      if (r.status === 'valid_new') {
        toImportNew.push({
          nikOrIdentifier: r.nikOrIdentifier,
          fullName: r.fullName,
          gender: r.gender,
          birthYear: r.birthYear,
          age: r.age,
          ageGroup: r.ageGroup,
          hasDisability: r.hasDisability,
          disabilityType: r.disabilityType,
          disabilityDifficultyLevel: r.disabilityDifficultyLevel,
          disabilityBarrierNotes: r.disabilityBarrierNotes,
          iplcStatus: r.iplcStatus,
          customIplcCommunityName: r.customIplcCommunityName,
          targetGroup: (r.raw?.targetGroup || (r as any).targetGroup || 'Population of the project communities') as any,
          beneficiaryLevel: (r.raw?.beneficiaryLevel || (r as any).beneficiaryLevel || 'Desa') as any,
          levelName: (r.raw?.levelName || (r as any).levelName || r.village),
          institutionOrAgency: (r.raw?.institutionOrAgency || (r as any).institutionOrAgency),
          province: r.province,
          regency: r.regency,
          village: r.village,
          phone: r.phone,
          occupation: r.occupation,
          createdAt: new Date().toISOString()
        });
        addedCount++;
      } else if (r.status === 'duplicate_database' && duplicateStrategy === 'update' && r.matchedExistingBeneficiary) {
        const existing = r.matchedExistingBeneficiary;
        const updated: Beneficiary = {
          ...existing,
          age: r.age || existing.age,
          ageGroup: r.ageGroup || existing.ageGroup,
          hasDisability: r.hasDisability || existing.hasDisability,
          disabilityType: r.disabilityType || existing.disabilityType,
          disabilityDifficultyLevel: r.disabilityDifficultyLevel || existing.disabilityDifficultyLevel,
          disabilityBarrierNotes: r.disabilityBarrierNotes || existing.disabilityBarrierNotes,
          iplcStatus: r.iplcStatus || existing.iplcStatus,
          customIplcCommunityName: r.customIplcCommunityName || existing.customIplcCommunityName,
          targetGroup: (r as any).targetGroup || existing.targetGroup,
          beneficiaryLevel: (r as any).beneficiaryLevel || existing.beneficiaryLevel,
          levelName: (r as any).levelName || existing.levelName,
          institutionOrAgency: (r as any).institutionOrAgency || existing.institutionOrAgency,
          phone: r.phone || existing.phone,
          occupation: r.occupation || existing.occupation
        };
        toUpdateExisting.push(updated);
        updatedCount++;
      } else {
        skippedCount++;
      }
    });

    onImportSuccess(toImportNew, toUpdateExisting);
    setImportResultCount({ added: addedCount, updated: updatedCount, skipped: skippedCount });
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  {isId ? 'M&E Zero Double Counting' : 'Zero Double Counting M&E'}
                </span>
                <h3 className="font-bold text-base text-white">
                  {isId ? 'Import Penerima Manfaat (Excel / CSV)' : 'Import Beneficiaries (Excel / CSV)'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {isId 
                  ? <>Pencocokan identitas cerdas berbasis kombinasi <strong>(Nama + Jenis Kelamin + Desa/Alamat)</strong> tanpa bergantung pada NIK.</>
                  : <>Intelligent deduplication based on <strong>(Name + Gender + Village/Address)</strong> regardless of ID numbers.</>}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isId ? 'Tutup Modal' : 'Close Modal'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Rule Explainer Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>{isId ? 'Aturan Deteksi Double Counting M&E' : 'M&E Deduplication Rules'}</span>
              </div>
              <p className="leading-relaxed text-blue-900">
                {isId 
                  ? 'Untuk menjaga akurasi laporan capaian penerima manfaat langsung (direct beneficiaries), sistem secara otomatis menerapkan aturan deduplikasi:'
                  : 'To guarantee the integrity of direct beneficiary reach figures, the system executes automatic deduplication:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium">
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">!</span>
                  <div>
                    <strong className="text-slate-900 block">{isId ? 'Dinyatakan Double Counting (Duplikat):' : 'Classified as Duplicate:'}</strong>
                    <span>{isId ? <>Jika <strong>Nama Lengkap</strong>, <strong>Jenis Kelamin</strong>, dan <strong>Alamat/Desa</strong> sama persis.</> : <>When <strong>Full Name</strong>, <strong>Gender</strong>, and <strong>Village</strong> match existing records.</>}</span>
                  </div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-900 block">{isId ? 'Dinyatakan Orang Berbeda (Unik):' : 'Classified as Unique Individual:'}</strong>
                    <span>{isId ? 'Jika salah satu kriteria berbeda (misal beda desa atau beda gender).' : 'If any of the demographic keys differ (e.g. different village).'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Download Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {isId ? 'Belum Punya Format Standar? Unduh Template Terlebih Dahulu' : 'Need the Standard Spreadsheet Template?'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xl">
                  {isId 
                    ? 'Gunakan template resmi untuk memudahkan pengisian data GESI (disabilitas) dan IPLC (masyarakat adat) secara lengkap.'
                    : 'Download the official template pre-formatted with GESI (disability) and IPLC columns.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={downloadExcelTemplate}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {isId ? 'Unduh Excel (.xlsx)' : 'Download Excel (.xlsx)'}
                </button>
                <button
                  onClick={downloadCSVTemplate}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileText className="w-4 h-4" />
                  {isId ? 'Unduh CSV (.csv)' : 'Download CSV (.csv)'}
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]' 
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                {isLoading ? (
                  <RotateCcw className="w-8 h-8 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-8 h-8 text-emerald-600" />
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {isLoading 
                    ? (isId ? 'Sedang Memproses & Menganalisis Data...' : 'Processing & Analyzing Data...') 
                    : (isId ? 'Pilih atau Tarik File XLSX / CSV ke Sini' : 'Drop XLSX / CSV File Here or Click to Browse')}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isId 
                    ? <>Mendukung format Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) dan Comma Separated Values (<strong>.csv</strong>)</>
                    : <>Supports Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) and CSV (<strong>.csv</strong>)</>}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                  {isId ? 'Klik untuk Memilih File dari Komputer' : 'Browse Files on Device'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 'preview' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Top Analysis Metrics */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isId ? 'Hasil Analisis File:' : 'File Analysis Results:'} {fileName}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">({fileSize})</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isId 
                      ? `Total ${summary.totalRows} baris data dipindai dengan mesin anti-double counting.`
                      : `Total ${summary.totalRows} rows scanned with deduplication engine.`}
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isId ? 'Ganti File' : 'Change File'}
                </button>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                <div 
                  onClick={() => setActiveFilterTab('valid_new')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    activeFilterTab === 'valid_new' 
                      ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-500' 
                      : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">{isId ? 'Penerima Manfaat Baru' : 'New Beneficiaries'}</span>
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      {summary.validNewCount}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">{isId ? 'Unik, belum ada di sistem' : 'Unique, not in database'}</p>
                </div>

                <div 
                  onClick={() => setActiveFilterTab('duplicate')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    activeFilterTab === 'duplicate' 
                      ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-500' 
                      : 'bg-amber-50 border-amber-200 hover:bg-amber-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">{isId ? 'Duplikat Database' : 'Database Duplicates'}</span>
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      {summary.duplicateDatabaseCount}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">{isId ? 'Identik Nama, Gender & Desa' : 'Matches existing demographic key'}</p>
                </div>

                <div 
                  onClick={() => setActiveFilterTab('duplicate')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    activeFilterTab === 'duplicate' 
                      ? 'bg-orange-100/80 border-orange-400 ring-2 ring-orange-500' 
                      : 'bg-orange-50 border-orange-200 hover:bg-orange-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-900">{isId ? 'Duplikat dalam File' : 'In-File Duplicates'}</span>
                    <span className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                      {summary.duplicateInFileCount}
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-700 mt-1">{isId ? 'Muncul >1x di file' : 'Repeated within uploaded file'}</p>
                </div>

                <div 
                  onClick={() => setActiveFilterTab('invalid')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    activeFilterTab === 'invalid' 
                      ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-500' 
                      : 'bg-rose-50 border-rose-200 hover:bg-rose-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900">{isId ? 'Tidak Valid / Kosong' : 'Invalid / Missing Data'}</span>
                    <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                      {summary.invalidCount}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-1">{isId ? 'Nama lengkap wajib terisi' : 'Full name is required'}</p>
                </div>
              </div>

              {/* Deduplication Strategy Chooser */}
              {(summary.duplicateDatabaseCount > 0 || summary.duplicateInFileCount > 0) && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{isId ? 'Opsi Data Duplikat:' : 'Duplicate Action:'}</span>
                    <span className="text-slate-500">{isId ? 'Pilih tindakan untuk data yang terdeteksi double counting' : 'Choose how to resolve double counting'}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleStrategyChange('skip')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        duplicateStrategy === 'skip'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      🛡️ {isId ? 'Lewati Duplikat (Rekomendasi M&E)' : 'Skip Duplicates (M&E Rule)'}
                    </button>

                    <button
                      onClick={() => handleStrategyChange('update')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        duplicateStrategy === 'update'
                          ? 'bg-blue-700 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      🔄 {isId ? 'Perbarui Profil yang Ada' : 'Update Existing Profile'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter and Search Bar for Table */}
            <div className="p-3 sm:px-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveFilterTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeFilterTab === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isId ? 'Semua' : 'All'} ({parsedRows.length})
                </button>
                <button
                  onClick={() => setActiveFilterTab('valid_new')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeFilterTab === 'valid_new'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  ✓ {isId ? 'Baru' : 'New'} ({summary.validNewCount})
                </button>
                <button
                  onClick={() => setActiveFilterTab('duplicate')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeFilterTab === 'duplicate'
                      ? 'bg-amber-700 text-white'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  ⚠️ {isId ? 'Duplikat' : 'Duplicates'} ({summary.duplicateDatabaseCount + summary.duplicateInFileCount})
                </button>
                {summary.invalidCount > 0 && (
                  <button
                    onClick={() => setActiveFilterTab('invalid')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeFilterTab === 'invalid'
                        ? 'bg-rose-700 text-white'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    ✕ {isId ? 'Tidak Valid' : 'Invalid'} ({summary.invalidCount})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isId ? 'Filter preview...' : 'Search preview...'}
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-full sm:w-48 font-medium"
                />
                <button
                  onClick={() => handleSelectAllVisible(true)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold whitespace-nowrap"
                  title={isId ? 'Pilih semua yang tampil' : 'Select all visible'}
                >
                  {isId ? 'Pilih Semua' : 'Select All'}
                </button>
                <button
                  onClick={() => handleSelectAllVisible(false)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold whitespace-nowrap"
                  title={isId ? 'Batalkan pilihan yang tampil' : 'Deselect all visible'}
                >
                  {isId ? 'Batal' : 'Deselect'}
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">{isId ? 'Impor' : 'Import'}</th>
                    <th className="py-2.5 px-2 w-12 text-center">{isId ? 'Baris' : 'Row'}</th>
                    <th className="py-2.5 px-3">{isId ? 'Nama Lengkap' : 'Full Name'}</th>
                    <th className="py-2.5 px-2">{isId ? 'Gender & Usia' : 'Gender & Age'}</th>
                    <th className="py-2.5 px-3">{isId ? 'Desa / Alamat (Kunci Deduplikasi)' : 'Village / Address (Deduplication Key)'}</th>
                    <th className="py-2.5 px-2">{isId ? 'Disabilitas & IPLC' : 'Disability & IPLC'}</th>
                    <th className="py-2.5 px-3">{isId ? 'Status Verifikasi & Double Counting' : 'Verification & Deduplication Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPreviewRows.length > 0 ? (
                    filteredPreviewRows.map(r => {
                      const isSelected = r.selectedForImport;
                      const isNew = r.status === 'valid_new';
                      const isDbDup = r.status === 'duplicate_database';
                      const isFileDup = r.status === 'duplicate_in_file';
                      const isInvalid = r.status === 'invalid';

                      return (
                        <tr 
                          key={r.rowNumber}
                          onClick={() => r.status !== 'invalid' && handleToggleRowSelection(r.rowNumber)}
                          className={`transition cursor-pointer select-none ${
                            isSelected 
                              ? 'bg-emerald-50/50 hover:bg-emerald-50/80' 
                              : isInvalid 
                              ? 'bg-rose-50/30 opacity-70 cursor-not-allowed' 
                              : 'hover:bg-slate-50/80 opacity-75'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isInvalid}
                              onChange={() => handleToggleRowSelection(r.rowNumber)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 disabled:opacity-30"
                            />
                          </td>

                          <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-400">
                            #{r.rowNumber}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{r.fullName || <span className="text-rose-500 italic">{isId ? 'Nama Kosong' : 'Empty Name'}</span>}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NIK: {r.nikOrIdentifier || '-'}</div>
                          </td>

                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.gender === 'Perempuan' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {r.gender}
                            </span>
                            <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {r.ageGroup} {isId ? 'thn' : 'yrs'}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{r.village}</div>
                            <div className="text-[10px] text-slate-400">{r.regency}, {r.province}</div>
                          </td>

                          <td className="py-2.5 px-2">
                            <div className="flex flex-wrap gap-1">
                              {r.hasDisability && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                                  ♿ {r.disabilityType || (isId ? 'Disabilitas' : 'PwD')}
                                </span>
                              )}
                              {r.iplcStatus.includes('Adat') && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  🌿 {isId ? 'Adat' : 'Indigenous'}
                                </span>
                              )}
                              {!r.hasDisability && !r.iplcStatus.includes('Adat') && (
                                <span className="text-[10px] text-slate-400">{isId ? 'Umum' : 'General'}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            {isNew && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {isId ? 'Data Baru (Unik)' : 'New (Unique)'}
                              </span>
                            )}

                            {isDbDup && (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  {isId ? 'Double Counting (Ada di DB)' : 'Duplicate in Database'}
                                </span>
                                <p className="text-[10px] text-amber-800 leading-tight">
                                  {isId ? 'Identik dengan:' : 'Matches:'} <strong>{r.matchedExistingBeneficiary?.fullName}</strong> ({r.matchedExistingBeneficiary?.village})
                                </p>
                              </div>
                            )}

                            {isFileDup && (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-300">
                                  <AlertCircle className="w-3 h-3 text-orange-600" />
                                  {isId ? 'Duplikat Internal File' : 'Duplicate within File'}
                                </span>
                                <p className="text-[10px] text-orange-800 leading-tight">
                                  {isId ? 'Identik dengan baris' : 'Identical to row'} <strong>#{r.duplicateOfRowNumber}</strong>
                                </p>
                              </div>
                            )}

                            {isInvalid && (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  ✕ {r.validationErrors.join(', ')}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        {isId ? 'Tidak ada data yang cocok dengan kriteria filter atau pencarian.' : 'No data matching filter criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5 max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-lg">
                {isId ? 'Proses Import Berhasil!' : 'Import Completed Successfully!'}
              </h3>
              <p className="text-xs text-slate-500">
                {isId 
                  ? 'Data penerima manfaat telah terverifikasi dan masuk ke dalam database M&E dengan aturan Zero Double Counting.'
                  : 'Beneficiary data has been processed into the M&E database with Zero Double Counting enforcement.'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center text-emerald-800 font-bold">
                <span>{isId ? 'Data Baru Ditambahkan:' : 'New Records Added:'}</span>
                <span>+{importResultCount.added} {isId ? 'orang' : 'people'}</span>
              </div>
              {importResultCount.updated > 0 && (
                <div className="flex justify-between items-center text-blue-800 font-medium">
                  <span>{isId ? 'Profil Diperbarui:' : 'Profiles Updated:'}</span>
                  <span>{importResultCount.updated} {isId ? 'orang' : 'people'}</span>
                </div>
              )}
              {importResultCount.skipped > 0 && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>{isId ? 'Duplikat / Dilewati:' : 'Duplicates Skipped:'}</span>
                  <span>{importResultCount.skipped} {isId ? 'baris' : 'rows'}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
            >
              {isId ? 'Selesai & Lihat Database Penerima Manfaat' : 'Done & View Beneficiary Directory'}
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        {step === 'preview' && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-600">
              <span>{isId ? 'Siap diimpor: ' : 'Ready to import: '}</span>
              <strong className="text-emerald-700">
                {countSelected} {isId ? 'penerima manfaat terpilih' : 'selected beneficiaries'}
              </strong>
              {duplicateStrategy === 'skip' && summary.duplicateDatabaseCount > 0 && (
                <span className="text-slate-400"> ({summary.duplicateDatabaseCount} {isId ? 'duplikat dilewati' : 'duplicates skipped'})</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={countSelected === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isId ? `Simpan & Import (${countSelected}) Data` : `Import (${countSelected}) Records`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
