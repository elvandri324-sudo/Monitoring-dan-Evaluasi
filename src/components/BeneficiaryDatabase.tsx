import { useState, useMemo, useRef, useEffect, MouseEvent } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  FileSpreadsheet,
  AlertTriangle,
  AlertCircle,
  X,
  Sparkles,
  Check,
  Upload,
  Layers,
  Building2,
  MapPin
} from 'lucide-react';
import { Beneficiary, ActivityAttendance, Project, TargetGroup, BeneficiaryLevel } from '../types';
import ImportBeneficiariesModal from './ImportBeneficiariesModal';
import { useLanguage } from '../context/LanguageContext';
import { formatGender, formatIplcStatus, formatAgeGroup, formatTargetGroup, formatBeneficiaryLevel, formatDisabilityDifficultyLevel } from '../utils/bilingual';
import { exportBeneficiariesToXLSX } from '../utils/exportXlsx';

interface BeneficiaryDatabaseProps {
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  projects: Project[];
  isAdmin: boolean;
  onOpenNewBeneficiaryModal: () => void;
  onEditBeneficiary: (ben: Beneficiary) => void;
  onDeleteBeneficiary: (id: string) => void;
  onDeleteMultipleBeneficiaries?: (ids: string[]) => void;
  onBatchImportBeneficiaries?: (newBeneficiaries: Omit<Beneficiary, 'id'>[], updatedBeneficiaries?: Beneficiary[]) => void;
}

export default function BeneficiaryDatabase({
  beneficiaries,
  attendances,
  projects,
  isAdmin,
  onOpenNewBeneficiaryModal,
  onEditBeneficiary,
  onDeleteBeneficiary,
  onDeleteMultipleBeneficiaries,
  onBatchImportBeneficiaries
}: BeneficiaryDatabaseProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all');
  const [filterDisability, setFilterDisability] = useState<string>('all');
  const [filterIplc, setFilterIplc] = useState<string>('all');
  const [filterTargetGroup, setFilterTargetGroup] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterVillage, setFilterVillage] = useState<string>('all');
  const [selectedBeneficiaryDetail, setSelectedBeneficiaryDetail] = useState<Beneficiary | null>(null);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal delete states
  const [singleDeleteCandidate, setSingleDeleteCandidate] = useState<Beneficiary | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);

  // Import Modal state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // Collect unique villages from beneficiaries and projects
  const allVillages = useMemo(() => {
    const vSet = new Set<string>();
    beneficiaries.forEach(b => { if (b.village) vSet.add(b.village.trim()); });
    projects.forEach(p => (p.targetVillages || []).forEach(v => { if (v) vSet.add(v.trim()); }));
    return Array.from(vSet).sort();
  }, [beneficiaries, projects]);

  // Filter logic
  const filteredList = useMemo(() => {
    return beneficiaries.filter(b => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.fullName.toLowerCase().includes(q);
        const matchNik = b.nikOrIdentifier.toLowerCase().includes(q);
        const matchVillage = b.village.toLowerCase().includes(q);
        const matchComm = (b.customIplcCommunityName || '').toLowerCase().includes(q);
        const matchBarrier = (b.disabilityBarrierNotes || '').toLowerCase().includes(q);
        const matchTg = (b.targetGroup || '').toLowerCase().includes(q);
        const matchLevel = (b.beneficiaryLevel || '').toLowerCase().includes(q);
        const matchLevelName = (b.levelName || '').toLowerCase().includes(q);
        const matchInst = (b.institutionOrAgency || '').toLowerCase().includes(q);
        if (!matchName && !matchNik && !matchVillage && !matchComm && !matchBarrier && !matchTg && !matchLevel && !matchLevelName && !matchInst) {
          return false;
        }
      }

      // Gender
      if (filterGender !== 'all' && b.gender !== filterGender) return false;

      // Age Group
      if (filterAgeGroup !== 'all' && b.ageGroup !== filterAgeGroup) return false;

      // Disability & Levels of Difficulty
      if (filterDisability === 'yes' && !b.hasDisability) return false;
      if (filterDisability === 'no' && b.hasDisability) return false;
      if (filterDisability.startsWith('level:') && (!b.hasDisability || (b.disabilityDifficultyLevel || '') !== filterDisability.replace('level:', ''))) {
        return false;
      }

      // IPLC
      if (filterIplc === 'ip' && b.iplcStatus !== 'Masyarakat Adat (Indigenous Peoples)') return false;
      if (filterIplc === 'lc' && b.iplcStatus !== 'Komunitas Lokal (Local Communities)') return false;
      if (filterIplc === 'non' && b.iplcStatus !== 'Bukan IPLC (Non-IPLC)') return false;

      // Target Group
      if (filterTargetGroup !== 'all') {
        const tg = b.targetGroup || 'Population of the project communities';
        if (tg !== filterTargetGroup) return false;
      }

      // Beneficiary Level
      if (filterLevel !== 'all') {
        const bl = b.beneficiaryLevel || 'Desa';
        if (bl !== filterLevel) return false;
      }

      // Village
      if (filterVillage !== 'all' && b.village.trim().toLowerCase() !== filterVillage.toLowerCase()) return false;

      return true;
    });
  }, [beneficiaries, searchQuery, filterGender, filterAgeGroup, filterDisability, filterIplc, filterTargetGroup, filterLevel, filterVillage]);

  // Calculate selection states for current filtered list
  const filteredIds = useMemo(() => filteredList.map(b => b.id), [filteredList]);
  const selectedFilteredCount = useMemo(() => {
    return filteredIds.filter(id => selectedIds.has(id)).length;
  }, [filteredIds, selectedIds]);

  const isAllFilteredSelected = filteredIds.length > 0 && selectedFilteredCount === filteredIds.length;
  const isSomeFilteredSelected = selectedFilteredCount > 0 && !isAllFilteredSelected;

  // Manage indeterminate checkbox state
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeFilteredSelected;
    }
  }, [isSomeFilteredSelected]);

  // Auto clean up selectedIds if beneficiaries change
  useEffect(() => {
    const existingIdSet = new Set(beneficiaries.map(b => b.id));
    setSelectedIds(prev => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach(id => {
        if (existingIdSet.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [beneficiaries]);

  // Multi-select handlers
  const handleToggleSelectOne = (id: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (isAllFilteredSelected) {
        // Deselect all filtered
        filteredIds.forEach(id => next.delete(id));
      } else {
        // Select all filtered
        filteredIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Quick preset selector
  const handleSelectPreset = (preset: 'all' | 'female' | 'disability' | 'iplc') => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      filteredList.forEach(b => {
        if (preset === 'all') next.add(b.id);
        if (preset === 'female' && b.gender === 'Perempuan') next.add(b.id);
        if (preset === 'disability' && b.hasDisability) next.add(b.id);
        if (preset === 'iplc' && b.iplcStatus !== 'Bukan IPLC (Non-IPLC)') next.add(b.id);
      });
      return next;
    });
  };

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Single Delete
  const handleConfirmSingleDelete = () => {
    if (!singleDeleteCandidate) return;
    const name = singleDeleteCandidate.fullName;
    onDeleteBeneficiary(singleDeleteCandidate.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(singleDeleteCandidate.id);
      return next;
    });
    setSingleDeleteCandidate(null);
    showToast(isId ? `Penerima manfaat "${name}" berhasil dihapus.` : `Beneficiary "${name}" deleted successfully.`);
  };

  // Bulk Delete
  const handleConfirmBulkDelete = () => {
    const idsToDelete: string[] = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    if (onDeleteMultipleBeneficiaries) {
      onDeleteMultipleBeneficiaries(idsToDelete);
    } else {
      idsToDelete.forEach(id => onDeleteBeneficiary(id));
    }

    const count = idsToDelete.length;
    setSelectedIds(new Set());
    setShowBulkDeleteModal(false);
    showToast(isId ? `${count} penerima manfaat terpilih berhasil dihapus.` : `${count} selected beneficiaries deleted successfully.`);
  };

  // Export to XLSX
  const handleExportXLSX = (selectedOnly: boolean = false) => {
    const targetList = selectedOnly
      ? filteredList.filter(b => selectedIds.has(b.id))
      : filteredList;

    if (targetList.length === 0) {
      alert(isId ? 'Tidak ada data untuk diekspor.' : 'No data to export.');
      return;
    }

    exportBeneficiariesToXLSX(
      targetList,
      projects,
      `Penerima_Manfaat_ME_${selectedOnly ? 'Terpilih_' : ''}${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Export to CSV (all filtered or selected only)
  const handleExportCSV = (selectedOnly: boolean = false) => {
    const targetList = selectedOnly
      ? filteredList.filter(b => selectedIds.has(b.id))
      : filteredList;

    if (targetList.length === 0) {
      alert(isId ? 'Tidak ada data untuk diekspor.' : 'No data to export.');
      return;
    }

    const headers = isId ? [
      'NIK/ID',
      'Nama Lengkap',
      'Target Group',
      'Level of Beneficiaries (Wilayah / Dinas)',
      'Tingkat Wilayah Dampingan',
      'Instansi / Lembaga',
      'Jenis Kelamin',
      'Usia',
      'Kelompok Usia',
      'Status Disabilitas',
      'Ragam Hambatan Disabilitas',
      'Deskripsi Hambatan',
      'Status IPLC',
      'Nama Suku/Komunitas Adat',
      'Provinsi',
      'Kabupaten',
      'Desa',
      'Pekerjaan',
      'Total Kegiatan Diikuti'
    ] : [
      'NIK/ID',
      'Full Name',
      'Target Group',
      'Level of Beneficiaries',
      'Beneficiary Level Type',
      'Agency / Institution',
      'Gender',
      'Age',
      'Age Group',
      'Disability Status',
      'Disability Type',
      'Barrier Description',
      'IPLC Status',
      'Custom Indigenous/Community Name',
      'Province',
      'Regency',
      'Village',
      'Occupation',
      'Total Activities Attended'
    ];

    const rows = targetList.map(b => {
      const actCount = attendances.filter(a => a.beneficiaryId === b.id).length;
      return [
        `"${b.nikOrIdentifier}"`,
        `"${b.fullName}"`,
        `"${b.targetGroup || 'Population of the project communities'}"`,
        `"${b.levelName || b.village}"`,
        `"${formatBeneficiaryLevel(b.beneficiaryLevel || 'Desa', language)}"`,
        `"${b.institutionOrAgency || '-'}"`,
        `"${formatGender(b.gender, language)}"`,
        b.age,
        `"${formatAgeGroup(b.ageGroup, language)}"`,
        b.hasDisability ? (isId ? 'Ya (Disabilitas)' : 'Yes (Disability)') : (isId ? 'Tidak (Non-Disabilitas)' : 'No (Non-Disability)'),
        `"${b.disabilityType || '-'}"`,
        `"${b.disabilityBarrierNotes || '-'}"`,
        `"${formatIplcStatus(b.iplcStatus, language)}"`,
        `"${b.customIplcCommunityName || '-'}"`,
        `"${b.province}"`,
        `"${b.regency}"`,
        `"${b.village}"`,
        `"${b.occupation || '-'}"`,
        actCount
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Beneficiaries_ME_${selectedOnly ? 'Selected_' : ''}${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Detail Modal data
  const detailAttendances = useMemo(() => {
    if (!selectedBeneficiaryDetail) return [];
    return attendances.filter(a => a.beneficiaryId === selectedBeneficiaryDetail.id);
  }, [selectedBeneficiaryDetail, attendances]);

  // Selected Beneficiaries Objects for bulk modal summary
  const selectedBeneficiariesList = useMemo(() => {
    return beneficiaries.filter(b => selectedIds.has(b.id));
  }, [beneficiaries, selectedIds]);

  const selectedTotalAttendancesCount = useMemo(() => {
    return attendances.filter(a => selectedIds.has(a.beneficiaryId)).length;
  }, [attendances, selectedIds]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200">
              Master Beneficiary Registry
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isId ? 'Database Penerima Manfaat' : 'Beneficiary Database'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            {isId 
              ? 'Daftar terverifikasi individu penerima manfaat langsung (Zero Double Counting) dengan disagregasi GESI & IPLC. Dilengkapi seleksi multi-pilihan & penghapusan batch.'
              : 'Verified registry of unique direct beneficiaries (Zero Double Counting) disaggregated by GESI & IPLC. Supports batch selection and multi-delete.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 shadow-2xs transition"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              {isId ? 'Import Excel / CSV' : 'Import Excel / CSV'}
            </button>
          )}

          <button
            onClick={() => handleExportXLSX(false)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            {isId ? `Ekspor XLSX (${filteredList.length})` : `Export XLSX (${filteredList.length})`}
          </button>

          <button
            onClick={() => handleExportCSV(false)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            {isId ? 'Ekspor CSV' : 'Export CSV'}
          </button>

          {isAdmin && (
            <button
              onClick={onOpenNewBeneficiaryModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            >
              <Plus className="w-4 h-4" />
              {isId ? '+ Input Penerima Baru' : '+ Add New Beneficiary'}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isId ? 'Cari berdasarkan Nama, NIK, Desa, Suku Adat, atau Hambatan...' : 'Search by Name, ID, Village, Indigenous Community, or Barrier...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Quick filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 font-medium text-slate-700 rounded-xl px-3 py-2 outline-hidden"
            >
              <option value="all">{isId ? 'Semua Gender' : 'All Genders'}</option>
              <option value="Perempuan">{isId ? 'Perempuan' : 'Female'}</option>
              <option value="Laki-laki">{isId ? 'Laki-laki' : 'Male'}</option>
            </select>

            <select
              value={filterAgeGroup}
              onChange={(e) => setFilterAgeGroup(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 font-medium text-slate-700 rounded-xl px-3 py-2 outline-hidden"
            >
              <option value="all">{isId ? 'Semua Rentang Usia' : 'All Age Ranges'}</option>
              <option value="0-5">0-5 {isId ? 'Thn (Balita)' : 'Yrs (Toddlers)'}</option>
              <option value="6-12">6-12 {isId ? 'Thn (Anak-anak)' : 'Yrs (Children)'}</option>
              <option value="13-17">13-17 {isId ? 'Thn (Remaja)' : 'Yrs (Adolescents)'}</option>
              <option value="18-24">18-24 {isId ? 'Thn (Pemuda)' : 'Yrs (Youth)'}</option>
              <option value="25-40">25-40 {isId ? 'Thn (Dewasa Muda)' : 'Yrs (Young Adults)'}</option>
              <option value="41-64">41-64 {isId ? 'Thn (Dewasa Madya)' : 'Yrs (Middle Adults)'}</option>
              <option value="65+">65+ {isId ? 'Thn (Lansia)' : 'Yrs (Elderly)'}</option>
            </select>

            <select
              value={filterDisability}
              onChange={(e) => setFilterDisability(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 font-medium text-slate-700 rounded-xl px-3 py-2 outline-hidden"
            >
              <option value="all">{isId ? 'Status Disabilitas' : 'Disability Status'}</option>
              <option value="yes">{isId ? 'Penyandang Disabilitas (Semua)' : 'Persons with Disability (All)'}</option>
              <option value="level:1. Extremely difficult">♿ 1. Extremely difficult</option>
              <option value="level:2. Very difficult">♿ 2. Very difficult</option>
              <option value="level:3. Fairly difficult">♿ 3. Fairly difficult</option>
              <option value="level:4. Slightly difficult">♿ 4. Slightly difficult</option>
              <option value="level:5. Almost no difficulty">♿ 5. Almost no difficulty</option>
              <option value="level:6. No difficulty">♿ 6. No difficulty</option>
              <option value="no">{isId ? 'Non-Disabilitas' : 'Non-Disability'}</option>
            </select>

            <select
              value={filterIplc}
              onChange={(e) => setFilterIplc(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 font-medium text-slate-700 rounded-xl px-3 py-2 outline-hidden"
            >
              <option value="all">{isId ? 'Status IPLC' : 'IPLC Status'}</option>
              <option value="ip">{isId ? 'Masyarakat Adat (IP)' : 'Indigenous Peoples (IP)'}</option>
              <option value="lc">{isId ? 'Komunitas Lokal (LC)' : 'Local Communities (LC)'}</option>
              <option value="non">{isId ? 'Bukan IPLC' : 'Non-IPLC'}</option>
            </select>

            <select
              value={filterTargetGroup}
              onChange={(e) => setFilterTargetGroup(e.target.value)}
              className="text-xs bg-indigo-50 border border-indigo-200 font-semibold text-indigo-900 rounded-xl px-3 py-2 outline-hidden"
            >
              <option value="all">🎯 {isId ? 'Semua Target Group' : 'All Target Groups'}</option>
              <option value="Population of the project communities">{isId ? 'Population of project communities' : 'Population of project communities'}</option>
              <option value="Actors in the municipal, district and provincial administrations">{isId ? 'Actors in administrations' : 'Actors in administrations'}</option>
              <option value="Intermediaries: NGOs / CSOs">{isId ? 'Intermediaries: NGOs / CSOs' : 'Intermediaries: NGOs / CSOs'}</option>
              <option value="Other">{isId ? 'Other' : 'Other'}</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="text-xs bg-purple-50 border border-purple-200 font-semibold text-purple-900 rounded-xl px-3 py-2 outline-hidden"
            >
              <option value="all">📊 {isId ? 'Semua Level Beneficiaries' : 'All Beneficiary Levels'}</option>
              <option value="Desa">{isId ? 'Tingkat Desa Dampingan' : 'Village Level'}</option>
              <option value="Kecamatan">{isId ? 'Tingkat Kecamatan Dampingan' : 'Sub-district Level'}</option>
              <option value="Kabupaten">{isId ? 'Tingkat Kabupaten Dampingan' : 'District Level'}</option>
              <option value="Provinsi">{isId ? 'Tingkat Provinsi Dampingan' : 'Province Level'}</option>
              <option value="Nasional">{isId ? 'Tingkat Nasional' : 'National Level'}</option>
            </select>

            <select
              value={filterVillage}
              onChange={(e) => setFilterVillage(e.target.value)}
              className="text-xs bg-emerald-50 border border-emerald-300 font-semibold text-emerald-950 rounded-xl px-3 py-2 outline-hidden"
            >
              <option value="all">🏡 {isId ? 'Semua Desa/Kelurahan' : 'All Villages'}</option>
              {allVillages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              {isId 
                ? <>Menampilkan <strong>{filteredList.length}</strong> dari total <strong>{beneficiaries.length}</strong> penerima manfaat unik.</>
                : <>Showing <strong>{filteredList.length}</strong> of <strong>{beneficiaries.length}</strong> unique direct beneficiaries.</>}
            </span>
            {selectedIds.size > 0 && (
              <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <Check className="w-3 h-3 text-blue-600" />
                {selectedIds.size} {isId ? 'orang sedang dipilih' : 'selected'}
              </span>
            )}
          </div>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {isId ? 'Terverifikasi Tanpa Double Counting' : 'Verified Zero Double-Counting'}
          </span>
        </div>
      </div>

      {/* FLOATING / STICKY SELECTION ACTION BAR (Appears when 1+ selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold text-xs">
              {selectedIds.size}
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {selectedIds.size} {isId ? 'Penerima Manfaat Terpilih' : 'Selected Beneficiaries'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isId 
                  ? 'Gunakan aksi cepat berikut untuk mengelola penerima manfaat terpilih sekaligus.'
                  : 'Apply batch actions for the selected beneficiaries.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick preset selector buttons */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-[11px]">
              <span className="text-slate-400 px-2 font-medium">{isId ? 'Pilih cepat:' : 'Quick select:'}</span>
              <button
                onClick={() => handleSelectPreset('female')}
                className="px-2 py-1 hover:bg-slate-700 rounded-lg text-pink-300 font-medium transition"
                title={isId ? 'Pilih semua perempuan di hasil filter' : 'Select all female in filter'}
              >
                ♀ {isId ? 'Perempuan' : 'Female'}
              </button>
              <button
                onClick={() => handleSelectPreset('disability')}
                className="px-2 py-1 hover:bg-slate-700 rounded-lg text-rose-300 font-medium transition"
                title={isId ? 'Pilih semua disabilitas di hasil filter' : 'Select all with disability in filter'}
              >
                ♿ {isId ? 'Disabilitas' : 'Disability'}
              </button>
              <button
                onClick={() => handleSelectPreset('iplc')}
                className="px-2 py-1 hover:bg-slate-700 rounded-lg text-emerald-300 font-medium transition"
                title={isId ? 'Pilih semua masyarakat adat / komunitas lokal' : 'Select all IPLC'}
              >
                🌿 IPLC
              </button>
            </div>

            {/* Export selected */}
            <button
              onClick={() => handleExportXLSX(true)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              {isId ? `XLSX (${selectedIds.size})` : `XLSX (${selectedIds.size})`}
            </button>

            <button
              onClick={() => handleExportCSV(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              {isId ? `CSV (${selectedIds.size})` : `CSV (${selectedIds.size})`}
            </button>

            {/* Bulk Delete Button */}
            {isAdmin && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isId ? `Hapus Terpilih (${selectedIds.size})` : `Delete Selected (${selectedIds.size})`}
              </button>
            )}

            {/* Clear Selection */}
            <button
              onClick={handleClearSelection}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs transition"
              title={isId ? 'Batalkan Semua Pilihan' : 'Clear Selection'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Beneficiaries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-semibold border-b border-slate-800">
                {/* Checkbox Column */}
                <th className="py-3.5 px-3.5 w-10 text-center">
                  <div className="flex items-center justify-center">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleToggleSelectAllFiltered}
                      className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      title={isAllFilteredSelected ? (isId ? 'Batalkan pilihan semua' : 'Deselect all') : (isId ? 'Pilih semua di daftar ini' : 'Select all in this list')}
                    />
                  </div>
                </th>
                {/* CRUD Action Column (Left, before Name) */}
                <th className="py-3.5 px-2 text-center w-24">{isId ? 'Aksi' : 'Action'}</th>
                <th className="py-3.5 px-3">{isId ? 'Nama & Identitas (NIK)' : 'Name & ID (NIK)'}</th>
                <th className="py-3.5 px-2">{isId ? 'Gender & Usia' : 'Gender & Age'}</th>
                <th className="py-3.5 px-2">{isId ? 'Disabilitas & Hambatan' : 'Disability & Barriers'}</th>
                <th className="py-3.5 px-2">{isId ? 'Status IPLC & Adat' : 'IPLC & Indigenous Status'}</th>
                <th className="py-3.5 px-2">{isId ? 'Lokasi / Desa' : 'Location / Village'}</th>
                <th className="py-3.5 px-2 text-center">{isId ? 'Kegiatan Diikuti' : 'Activities Attended'}</th>
                {/* Far Right: Target Group & Level of Beneficiaries */}
                <th className="py-3.5 px-2">{isId ? 'Target Group' : 'Target Group'}</th>
                <th className="py-3.5 px-3">{isId ? 'Level of Beneficiaries' : 'Beneficiary Level'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredList.length > 0 ? (
                filteredList.map(b => {
                  const attendedCount = attendances.filter(a => a.beneficiaryId === b.id).length;
                  const isChecked = selectedIds.has(b.id);
                  const tg = b.targetGroup || 'Population of the project communities';
                  const lvl = b.beneficiaryLevel || 'Desa';
                  const lvlName = b.levelName || b.village;

                  return (
                    <tr 
                      key={b.id} 
                      onClick={() => handleToggleSelectOne(b.id)}
                      className={`transition cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-blue-50/70 hover:bg-blue-50/90 text-slate-900' 
                          : 'hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleToggleSelectOne(b.id, e)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            aria-label={`Select ${b.fullName}`}
                          />
                        </div>
                      </td>

                      {/* Aksi (CRUD) on Left */}
                      <td className="py-3.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedBeneficiaryDetail(b)}
                            className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 hover:text-emerald-700 transition"
                            title={isId ? 'Lihat Detail & Riwayat' : 'View Detail & History'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => onEditBeneficiary(b)}
                                className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 hover:text-blue-700 transition"
                                title={isId ? 'Edit Data' : 'Edit Details'}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSingleDeleteCandidate(b)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                title={isId ? 'Hapus Penerima Manfaat Ini' : 'Delete this beneficiary'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Nama & Identitas (NIK) */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{b.fullName}</span>
                          {isChecked && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">NIK: {b.nikOrIdentifier}</div>
                        {b.occupation && <div className="text-[10px] text-slate-500 italic mt-0.5">{b.occupation}</div>}
                      </td>

                      {/* Gender & Usia */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.gender === 'Perempuan' ? 'bg-pink-100 text-pink-800 border border-pink-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {formatGender(b.gender, language)}
                        </span>
                        <div className="text-[11px] text-slate-700 mt-0.5 font-medium">
                          {b.age} {isId ? 'thn' : 'yo'} <span className="font-semibold text-slate-500">({formatAgeGroup(b.ageGroup, language)})</span>
                        </div>
                      </td>

                      {/* Disabilitas & Hambatan */}
                      <td className="py-3.5 px-2 max-w-[220px]">
                        {b.hasDisability ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-block">
                                ♿ {b.disabilityType}
                              </span>
                              {b.disabilityDifficultyLevel && (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-block" title="Tingkat Kesulitan / Levels of Difficulty">
                                  {formatDisabilityDifficultyLevel(b.disabilityDifficultyLevel, language)}
                                </span>
                              )}
                            </div>
                            {b.disabilityBarrierNotes && (
                              <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight" title={b.disabilityBarrierNotes}>
                                {b.disabilityBarrierNotes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">{isId ? 'Non-Disabilitas' : 'Non-Disability'}</span>
                        )}
                      </td>

                      {/* Status IPLC & Adat */}
                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                          {formatIplcStatus(b.iplcStatus, language)}
                        </span>
                        {b.customIplcCommunityName && (
                          <div className="text-[10px] text-slate-700 font-medium mt-0.5">
                            {b.customIplcCommunityName}
                          </div>
                        )}
                      </td>

                      {/* Lokasi / Desa */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <div className="text-slate-900 font-semibold">{b.village}</div>
                        <div className="text-[10px] text-slate-400">{b.regency}, {b.province}</div>
                      </td>

                      {/* Kegiatan Diikuti */}
                      <td className="py-3.5 px-2 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                          attendedCount > 1 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : attendedCount === 1 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {attendedCount}x {isId ? 'Kegiatan' : 'Activities'}
                        </span>
                      </td>

                      {/* Target Group (Far Right) */}
                      <td className="py-3.5 px-2 max-w-[180px]">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tg === 'Population of the project communities'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : tg === 'Actors in the municipal, district and provincial administrations'
                            ? 'bg-amber-50 text-amber-900 border border-amber-300'
                            : tg === 'Intermediaries: NGOs / CSOs'
                            ? 'bg-purple-50 text-purple-900 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {formatTargetGroup(tg, language)}
                        </span>
                      </td>

                      {/* Level of Beneficiaries (Far Right) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            lvl === 'Desa'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : lvl === 'Kecamatan'
                              ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                              : lvl === 'Kabupaten'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : lvl === 'Provinsi'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {formatBeneficiaryLevel(lvl, language)}
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[130px]" title={lvlName}>
                            {lvlName}
                          </span>
                        </div>
                        {b.institutionOrAgency && (
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1 truncate max-w-[160px]" title={b.institutionOrAgency}>
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{b.institutionOrAgency}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    {isId ? 'Tidak ada penerima manfaat yang sesuai dengan filter atau kata kunci pencarian.' : 'No beneficiaries match the selected filter or search query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: SINGLE DELETE CONFIRMATION DIALOG                            */}
      {/* ===================================================================== */}
      {singleDeleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{isId ? 'Hapus Penerima Manfaat?' : 'Delete Beneficiary?'}</h3>
                <p className="text-xs text-slate-500">{isId ? 'Tindakan ini akan menghapus data profil & absensi terkait secara permanen.' : 'This will permanently remove the beneficiary profile and associated attendance records.'}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">{isId ? 'Nama Lengkap:' : 'Full Name:'}</span>
                <span className="font-bold text-slate-900">{singleDeleteCandidate.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isId ? 'NIK / ID:' : 'NIK / ID:'}</span>
                <span className="font-mono font-medium text-slate-800">{singleDeleteCandidate.nikOrIdentifier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isId ? 'Lokasi / Desa:' : 'Location / Village:'}</span>
                <span className="text-slate-800">{singleDeleteCandidate.village}, {singleDeleteCandidate.regency}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">{isId ? 'Catatan Absensi Terdaftar:' : 'Registered Attendances:'}</span>
                <span className="font-bold text-amber-700">
                  {attendances.filter(a => a.beneficiaryId === singleDeleteCandidate.id).length} {isId ? 'kegiatan' : 'activities'}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{isId ? 'Semua riwayat partisipasi kegiatan orang ini akan otomatis dibersihkan untuk menjaga integritas data M&E.' : 'All attendance history for this individual will be cleaned up to safeguard M&E data integrity.'}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSingleDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isId ? 'Ya, Hapus Penerima Manfaat' : 'Yes, Delete Beneficiary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: BULK / BATCH DELETE CONFIRMATION DIALOG                      */}
      {/* ===================================================================== */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isId ? `Hapus ${selectedIds.size} Penerima Manfaat Terpilih?` : `Delete ${selectedIds.size} Selected Beneficiaries?`}
                </h3>
                <p className="text-xs text-slate-500">{isId ? 'Konfirmasi penghapusan massal penerima manfaat dari database.' : 'Confirm bulk deletion of beneficiaries from database.'}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">{isId ? 'Daftar yang akan dihapus:' : 'Items to be deleted:'}</span>
                <span className="font-bold text-rose-700">{selectedIds.size} {isId ? 'orang' : 'records'}</span>
              </div>

              {/* Sample list */}
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {selectedBeneficiariesList.slice(0, 6).map(b => (
                  <div key={b.id} className="flex justify-between text-slate-700 text-[11px] py-0.5">
                    <span className="font-medium truncate max-w-[240px]">• {b.fullName} ({b.village})</span>
                    <span className="font-mono text-slate-400">{b.nikOrIdentifier}</span>
                  </div>
                ))}
                {selectedBeneficiariesList.length > 6 && (
                  <div className="text-[11px] font-semibold text-slate-500 italic pt-1">
                    {isId ? `...dan ${selectedBeneficiariesList.length - 6} orang lainnya.` : `...and ${selectedBeneficiariesList.length - 6} others.`}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                <span className="text-slate-500">{isId ? 'Total riwayat absensi terhapus:' : 'Total attendance records removed:'}</span>
                <span className="font-bold text-amber-700">{selectedTotalAttendancesCount} {isId ? 'catatan kehadiran' : 'attendance logs'}</span>
              </div>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-[11px] text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>{isId ? 'Peringatan Penting:' : 'Important Warning:'}</strong> {isId 
                  ? 'Penghapusan massal ini bersifat permanen dan tidak dapat dibatalkan. Semua catatan partisipasi kegiatan orang-orang terpilih akan ikut terhapus.'
                  : 'This bulk deletion is permanent and cannot be undone. All activity participation logs for these individuals will also be deleted.'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isId ? `Hapus ${selectedIds.size} Orang Sekaligus` : `Delete ${selectedIds.size} Records`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary Detail Modal */}
      {selectedBeneficiaryDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  {isId ? 'Profil Penerima Manfaat Terdaftar' : 'Registered Beneficiary Profile'}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{selectedBeneficiaryDetail.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedBeneficiaryDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">{isId ? 'NIK / ID:' : 'NIK / ID:'}</span>
                <span className="font-mono font-bold text-slate-800">{selectedBeneficiaryDetail.nikOrIdentifier}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isId ? 'Gender & Usia:' : 'Gender & Age:'}</span>
                <span className="font-bold text-slate-800">{formatGender(selectedBeneficiaryDetail.gender, language)}, {selectedBeneficiaryDetail.age} {isId ? 'thn' : 'yo'} ({formatAgeGroup(selectedBeneficiaryDetail.ageGroup, language)})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isId ? 'Target Group:' : 'Target Group:'}</span>
                <span className="font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px] inline-block">
                  {formatTargetGroup(selectedBeneficiaryDetail.targetGroup || 'Population of the project communities', language)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isId ? 'Level of Beneficiaries:' : 'Beneficiary Level:'}</span>
                <span className="font-semibold text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[11px] inline-block">
                  {formatBeneficiaryLevel(selectedBeneficiaryDetail.beneficiaryLevel || 'Desa', language)}: {selectedBeneficiaryDetail.levelName || selectedBeneficiaryDetail.village}
                </span>
              </div>
              {selectedBeneficiaryDetail.institutionOrAgency && (
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block">{isId ? 'Instansi / Lembaga / Dinas:' : 'Institution / Agency / Department:'}</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {selectedBeneficiaryDetail.institutionOrAgency}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[10px] text-slate-400 block">{isId ? 'Lokasi Wilayah:' : 'Location:'}</span>
                <span className="font-medium text-slate-800">{selectedBeneficiaryDetail.village}, {selectedBeneficiaryDetail.regency}, {selectedBeneficiaryDetail.province}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isId ? 'Status IPLC:' : 'IPLC Status:'}</span>
                <span className="font-bold text-slate-800">{formatIplcStatus(selectedBeneficiaryDetail.iplcStatus, language)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isId ? 'Status Disabilitas:' : 'Disability Status:'}</span>
                <span className="font-bold text-slate-800">
                  {selectedBeneficiaryDetail.hasDisability ? `${isId ? 'Ya' : 'Yes'} (${selectedBeneficiaryDetail.disabilityType})` : (isId ? 'Non-Disabilitas' : 'Non-Disability')}
                </span>
                {selectedBeneficiaryDetail.hasDisability && selectedBeneficiaryDetail.disabilityDifficultyLevel && (
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-block">
                      {isId ? 'Tingkat Kesulitan: ' : 'Level of Difficulty: '}
                      {formatDisabilityDifficultyLevel(selectedBeneficiaryDetail.disabilityDifficultyLevel, language)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isId ? 'Komunitas / Suku Adat:' : 'Indigenous / Local Community:'}</span>
                <span className="font-medium text-slate-800">{selectedBeneficiaryDetail.customIplcCommunityName || '-'}</span>
              </div>
              {selectedBeneficiaryDetail.disabilityBarrierNotes && (
                <div className="col-span-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-rose-900">
                  <span className="font-bold block text-[10px]">{isId ? 'Hambatan Spesifik & Kebutuhan Akomodasi:' : 'Specific Barriers & Accommodation Needs:'}</span>
                  {selectedBeneficiaryDetail.disabilityBarrierNotes}
                </div>
              )}
            </div>

            {/* Riwayat Kegiatan Diikuti */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                {isId ? `Riwayat Partisipasi Kegiatan (${detailAttendances.length} sesi):` : `Activity Participation History (${detailAttendances.length} sessions):`}
              </span>
              {detailAttendances.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {detailAttendances.map(att => {
                    return (
                      <div key={att.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{att.roleInActivity}</span>
                          <span className="text-[10px] text-slate-400">{att.attendanceDate}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{att.notes}</p>
                        <span className="text-[10px] text-emerald-700 font-medium">{isId ? 'Verifikator' : 'Verified by'}: {att.verifiedBy || 'M&E'}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">{isId ? 'Belum ada riwayat kegiatan tercatat.' : 'No activity participation history recorded yet.'}</div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {isAdmin && (
                <button
                  onClick={() => {
                    const ben = selectedBeneficiaryDetail;
                    setSelectedBeneficiaryDetail(null);
                    setSingleDeleteCandidate(ben);
                  }}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isId ? 'Hapus Orang Ini' : 'Delete Beneficiary'}
                </button>
              )}
              <button
                onClick={() => setSelectedBeneficiaryDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-xl ml-auto transition"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportBeneficiariesModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingBeneficiaries={beneficiaries}
        projects={projects}
        onImportSuccess={(newBens, updatedBens) => {
          if (onBatchImportBeneficiaries) {
            onBatchImportBeneficiaries(newBens, updatedBens);
          }
          setToastMessage(isId ? `Berhasil mengimpor ${newBens.length} penerima manfaat baru!` : `Successfully imported ${newBens.length} new beneficiaries!`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
}
