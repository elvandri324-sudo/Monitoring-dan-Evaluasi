import { useState, useMemo, FormEvent } from 'react';
import { 
  Lightbulb, 
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
  Layers, 
  ExternalLink, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  FileSpreadsheet, 
  LayoutGrid, 
  Table as TableIcon,
  X,
  AlertCircle,
  TrendingUp,
  Target,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { Project, ProjectLearning, LearningFocusCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LearningManagerProps {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId?: (id: string) => void;
  learnings: ProjectLearning[];
  isAdmin: boolean;
  onSaveLearning: (learning: ProjectLearning) => void;
  onDeleteLearning: (id: string) => void;
}

export const LEARNING_FOCUS_OPTIONS: { 
  value: LearningFocusCategory; 
  labelId: string; 
  labelEn: string;
  descriptionId: string;
  descriptionEn: string;
  color: string;
}[] = [
  { 
    value: 'Situation/problems', 
    labelId: 'Situasi & Masalah Awal (Situation / Problems)', 
    labelEn: 'Situation / Problems',
    descriptionId: 'Kondisi awal, dinamika lapangan, atau masalah tak terduga yang dihadapi di lokasi.',
    descriptionEn: 'Initial conditions, field dynamics, or unforeseen problems encountered.',
    color: 'bg-rose-50 text-rose-800 border-rose-200' 
  },
  { 
    value: 'Key activities/Outputs/Outcomes', 
    labelId: 'Aktivitas Kunci & Capaian (Activities / Outputs)', 
    labelEn: 'Key Activities / Outputs / Outcomes',
    descriptionId: 'Pembelajaran spesifik dari pelaksanaan aktivitas kunci dan pencapaian target output.',
    descriptionEn: 'Specific learnings from executing key activities and achieving milestone outputs.',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200' 
  },
  { 
    value: 'Linking with other SO/Projects/SO-HQ/RIK', 
    labelId: 'Sinergi & Kemitraan (Linking Projects / HQ / RIK)', 
    labelEn: 'Linking with other Projects / HQ / RIK',
    descriptionId: 'Sinergi, koordinasi lintas program, kemitraan strategis & integrasi kelembagaan.',
    descriptionEn: 'Synergy, cross-program coordination, strategic partnerships & institutional linkage.',
    color: 'bg-blue-50 text-blue-800 border-blue-200' 
  },
  { 
    value: 'Issues & Challenges', 
    labelId: 'Isu & Tantangan (Issues & Challenges)', 
    labelEn: 'Issues & Challenges',
    descriptionId: 'Tantangan teknis, sosial, cuaca, logistik, atau regulasi yang menghambat proses.',
    descriptionEn: 'Technical, social, environmental, logistics, or policy obstacles faced.',
    color: 'bg-amber-50 text-amber-800 border-amber-200' 
  },
  { 
    value: 'Influencing activities', 
    labelId: 'Kegiatan Pengaruh & Advokasi (Influencing Activities)', 
    labelEn: 'Influencing Activities',
    descriptionId: 'Faktor eksternal atau kegiatan advokasi/kampanye yang mempengaruhi capaian.',
    descriptionEn: 'External factors or policy advocacy/campaign activities influencing outcomes.',
    color: 'bg-purple-50 text-purple-800 border-purple-200' 
  },
  { 
    value: 'Specific Needs', 
    labelId: 'Kebutuhan Khusus / GESI (Gender, Disabilitas, Adat)', 
    labelEn: 'Specific Needs (Gender / Disability / IPLC)',
    descriptionId: 'Kebutuhan khusus kelompok rentan, aksesibilitas disabilitas, dan kearifan lokal.',
    descriptionEn: 'Special needs of vulnerable groups, disability accessibility, and indigenous knowledge.',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200' 
  },
  { 
    value: 'Resilience', 
    labelId: 'Ketahanan Komunitas (Resilience)', 
    labelEn: 'Resilience',
    descriptionId: 'Daya lentur masyarakat dan ekosistem dalam menghadapi guncangan dan bencana.',
    descriptionEn: 'Adaptive capacity of communities and ecosystems against shocks and disasters.',
    color: 'bg-teal-50 text-teal-800 border-teal-200' 
  },
  { 
    value: 'Sustainability', 
    labelId: 'Keberlanjutan Program (Sustainability)', 
    labelEn: 'Sustainability',
    descriptionId: 'Model kepemilikan lokal, kemandirian ekonomi, dan adopsi pasca proyek berakhir.',
    descriptionEn: 'Local ownership models, economic viability, and post-project continuation.',
    color: 'bg-amber-50 text-amber-900 border-amber-300' 
  },
  { 
    value: 'Lainnya', 
    labelId: 'Fokus Pembelajaran Tematik Lainnya', 
    labelEn: 'Other Thematic Focus',
    descriptionId: 'Topik pembelajaran tematik lainnya yang relevan.',
    descriptionEn: 'Other relevant cross-cutting learning topics.',
    color: 'bg-slate-50 text-slate-800 border-slate-200' 
  }
];

export default function LearningManager({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  learnings,
  isAdmin,
  onSaveLearning,
  onDeleteLearning
}: LearningManagerProps) {
  const { language, t } = useLanguage();
  const isId = language === 'id';
  // Views: Matrix Table (matching the image) or Card View
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Filters & Search
  const [filterProjectId, setFilterProjectId] = useState<string>(selectedProjectId || 'all');
  const [filterFocus, setFilterFocus] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Selection
  const [showModal, setShowModal] = useState(false);
  const [editingLearning, setEditingLearning] = useState<ProjectLearning | null>(null);
  const [learningToDelete, setLearningToDelete] = useState<ProjectLearning | null>(null);
  const [selectedLearningDetail, setSelectedLearningDetail] = useState<ProjectLearning | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    projectId: string;
    title: string;
    learningFocus: LearningFocusCategory;
    customFocus: string;
    keyLearning: string;
    whatWeDidDifferently: string;
    nextPhaseConduct: string;
    internalCapacityAdvocacyComm: string;
    whenToLearnImplement: string;
    status: 'Teridentifikasi' | 'Dalam Penerapan (Actioned)' | 'Telah Terintegrasi' | 'Ditinjau';
    recordedBy: string;
    dateRecorded: string;
  }>({
    projectId: projects[0]?.id || '',
    title: '',
    learningFocus: 'Situation/problems',
    customFocus: '',
    keyLearning: '',
    whatWeDidDifferently: '',
    nextPhaseConduct: '',
    internalCapacityAdvocacyComm: '',
    whenToLearnImplement: '',
    status: 'Teridentifikasi',
    recordedBy: '',
    dateRecorded: new Date().toISOString().slice(0, 10)
  });

  // Open create modal
  const handleOpenCreateModal = () => {
    setEditingLearning(null);
    setFormData({
      projectId: filterProjectId !== 'all' ? filterProjectId : (projects[0]?.id || ''),
      title: '',
      learningFocus: 'Situation/problems',
      customFocus: '',
      keyLearning: '',
      whatWeDidDifferently: '',
      nextPhaseConduct: '',
      internalCapacityAdvocacyComm: '',
      whenToLearnImplement: '',
      status: 'Teridentifikasi',
      recordedBy: '',
      dateRecorded: new Date().toISOString().slice(0, 10)
    });
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: ProjectLearning) => {
    setEditingLearning(item);
    setFormData({
      projectId: item.projectId || projects[0]?.id || '',
      title: item.title,
      learningFocus: item.learningFocus,
      customFocus: item.customFocus || '',
      keyLearning: item.keyLearning,
      whatWeDidDifferently: item.whatWeDidDifferently,
      nextPhaseConduct: item.nextPhaseConduct,
      internalCapacityAdvocacyComm: item.internalCapacityAdvocacyComm,
      whenToLearnImplement: item.whenToLearnImplement,
      status: item.status || 'Teridentifikasi',
      recordedBy: item.recordedBy || '',
      dateRecorded: item.dateRecorded || new Date().toISOString().slice(0, 10)
    });
    setShowModal(true);
  };

  // Save Learning
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul pembelajaran wajib diisi!');
      return;
    }
    if (!formData.keyLearning.trim()) {
      alert('Kolom "Key Learning" wajib diisi!');
      return;
    }

    const payload: ProjectLearning = {
      id: editingLearning ? editingLearning.id : `lrn-${Date.now().toString().slice(-6)}`,
      projectId: formData.projectId,
      title: formData.title.trim(),
      learningFocus: formData.learningFocus,
      customFocus: formData.customFocus.trim(),
      keyLearning: formData.keyLearning.trim(),
      whatWeDidDifferently: formData.whatWeDidDifferently.trim(),
      nextPhaseConduct: formData.nextPhaseConduct.trim(),
      internalCapacityAdvocacyComm: formData.internalCapacityAdvocacyComm.trim(),
      whenToLearnImplement: formData.whenToLearnImplement.trim(),
      status: formData.status,
      recordedBy: formData.recordedBy.trim() || 'Tim M&E',
      dateRecorded: formData.dateRecorded || new Date().toISOString().slice(0, 10),
      createdAt: editingLearning ? editingLearning.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveLearning(payload);
    setShowModal(false);
    setEditingLearning(null);
  };

  // Filtered Learnings
  const filteredLearnings = useMemo(() => {
    return learnings.filter(item => {
      // Filter Project
      if (filterProjectId !== 'all' && item.projectId !== filterProjectId) {
        return false;
      }
      // Filter Learning Focus
      if (filterFocus !== 'ALL' && item.learningFocus !== filterFocus) {
        return false;
      }
      // Filter Status
      if (filterStatus !== 'ALL' && item.status !== filterStatus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchKey = item.keyLearning.toLowerCase().includes(q);
        const matchAction = item.whatWeDidDifferently.toLowerCase().includes(q);
        const matchNext = item.nextPhaseConduct.toLowerCase().includes(q);
        const matchFocus = item.learningFocus.toLowerCase().includes(q);
        const matchRecorder = (item.recordedBy || '').toLowerCase().includes(q);
        return matchTitle || matchKey || matchAction || matchNext || matchFocus || matchRecorder;
      }
      return true;
    });
  }, [learnings, filterProjectId, filterFocus, filterStatus, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Proyek',
      'Judul Pembelajaran',
      'Learning Focus',
      'Key Learning',
      'What We Did/Do Differently?',
      'How Will We Conduct Next Phase of Project?',
      'Internal Capacity/Advocacy/Communication',
      'When to Learn/Implement?',
      'Status Penerapan',
      'Pencatat/PIC',
      'Tanggal Dicatat'
    ];

    const rows = filteredLearnings.map(item => {
      const proj = projects.find(p => p.id === item.projectId);
      return [
        `"${item.id}"`,
        `"${proj ? `${proj.code} - ${proj.title}` : '-'}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.learningFocus}"`,
        `"${item.keyLearning.replace(/"/g, '""')}"`,
        `"${item.whatWeDidDifferently.replace(/"/g, '""')}"`,
        `"${item.nextPhaseConduct.replace(/"/g, '""')}"`,
        `"${item.internalCapacityAdvocacyComm.replace(/"/g, '""')}"`,
        `"${item.whenToLearnImplement.replace(/"/g, '""')}"`,
        `"${item.status || 'Teridentifikasi'}"`,
        `"${item.recordedBy || '-'}"`,
        `"${item.dateRecorded}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Matriks_Pembelajaran_Proyek_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper focus color
  const getFocusBadgeColor = (focus: LearningFocusCategory) => {
    const match = LEARNING_FOCUS_OPTIONS.find(f => f.value === focus);
    return match ? match.color : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              {isId ? 'Kerangka & Matriks Pembelajaran M&E Proyek' : 'Project M&E Learning Framework & Matrix'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isId ? 'Manajemen Pembelajaran Berkelanjutan' : 'Continuous Adaptive Management'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isId ? 'Matriks Pembelajaran Proyek (Learning Matrix)' : 'Project Learning Matrix'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {isId 
              ? 'Dokumentasi terstruktur temuan kunci (Key Learning), tindakan adaptif berbeda (What We Did Differently), rencana pelaksanaan fase lanjutan, kebutuhan kapasitas internal & advokasi, serta jadwal implementasi.'
              : 'Structured documentation of Key Learnings, adaptive actions (What We Did Differently), next phase implementation plans, internal capacity & advocacy needs, and timeline.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title={isId ? 'Tampilan Tabel Matriks (Spreadsheet)' : 'Matrix Table View'}
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isId ? 'Matriks Tabel' : 'Matrix Table'}</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title={isId ? 'Tampilan Kartu Ringkasan' : 'Card Grid View'}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
              <span>{isId ? 'Kartu Narasi' : 'Card View'}</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            title={isId ? 'Ekspor matriks pembelajaran ke CSV/Excel' : 'Export learning matrix to CSV'}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isId ? 'Ekspor CSV' : 'Export CSV'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>{isId ? '+ Tambah Pembelajaran' : '+ Add Learning'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{isId ? 'Total Pembelajaran' : 'Total Learnings'}</span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{learnings.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{isId ? 'Terdokumentasi dalam sistem' : 'Documented in system'}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{isId ? 'Telah Diterapkan' : 'Actioned / Implemented'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {learnings.filter(l => l.status === 'Dalam Penerapan (Actioned)' || l.status === 'Telah Terintegrasi').length}
          </div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">{isId ? 'Menjadi aksi nyata proyek' : 'Turned into adaptive actions'}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{isId ? 'Fokus Utama' : 'Key Focus Categories'}</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            {isId ? '8 Kategori Standar M&E' : '8 M&E Standard Categories'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{isId ? 'Situasi, Aktivitas, Sinergi & GESI' : 'Situation, Outputs, Synergy & GESI'}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{isId ? 'Inisiatif Terbantu' : 'Projects Covered'}</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{projects.length} {isId ? 'Proyek' : 'Projects'}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">{isId ? 'Mendukung fase lanjutan' : 'Supporting future phases'}</div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isId ? "Cari kata kunci pembelajaran, tindakan berbeda, atau fokus..." : "Search key learnings, actions, or focus topics..."}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project Selector */}
          <div className="sm:col-span-4">
            <select
              value={filterProjectId}
              onChange={(e) => {
                setFilterProjectId(e.target.value);
                if (setSelectedProjectId && e.target.value !== 'all') {
                  setSelectedProjectId(e.target.value);
                }
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
            >
              <option value="all">{isId ? `Semua Inisiatif Proyek (${projects.length})` : `All Projects (${projects.length})`}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="ALL">{isId ? 'Semua Status Penerapan' : 'All Implementation Statuses'}</option>
              <option value="Teridentifikasi">{isId ? 'Teridentifikasi' : 'Identified'}</option>
              <option value="Dalam Penerapan (Actioned)">{isId ? 'Dalam Penerapan (Actioned)' : 'In Implementation (Actioned)'}</option>
              <option value="Telah Terintegrasi">{isId ? 'Telah Terintegrasi' : 'Fully Integrated'}</option>
              <option value="Ditinjau">{isId ? 'Ditinjau' : 'Under Review'}</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tabs for Learning Focus */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> {isId ? 'Fokus:' : 'Focus:'}
          </span>
          <button
            onClick={() => setFilterFocus('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
              filterFocus === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isId ? 'Semua' : 'All'} ({learnings.length})
          </button>
          {LEARNING_FOCUS_OPTIONS.map(opt => {
            const count = learnings.filter(l => l.learningFocus === opt.value).length;
            const label = isId ? opt.labelId : opt.labelEn;
            return (
              <button
                key={opt.value}
                onClick={() => setFilterFocus(opt.value)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  filterFocus === opt.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterFocus === opt.value ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: MATRIX TABLE VIEW (Matching the uploaded Excel/Table image exactly with full Indonesian headers) */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Banner Header explaining the 6 Columns */}
          <div className="p-3 bg-emerald-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>
                {isId 
                  ? 'Matriks Standar Pembelajaran M&E Proyek (Project Learning Framework Table)' 
                  : 'Project M&E Learning Framework & Matrix Table'}
              </span>
            </div>
            <div className="text-[11px] text-emerald-200">
              {isId ? 'Menampilkan' : 'Showing'} <strong>{filteredLearnings.length}</strong> {isId ? 'catatan pembelajaran' : 'learning records'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1150px]">
              {/* Header Row matching the exact green table with Bahasa Indonesia primary and English subtitle */}
              <thead>
                <tr className="bg-emerald-800 text-white border-b-2 border-emerald-950 font-bold divide-x divide-emerald-700 text-center">
                  <th className="p-3 w-56 text-left shrink-0">
                    <div className="text-xs font-bold text-white">
                      {isId ? 'Fokus Pembelajaran' : 'Learning Focus'}
                    </div>
                    <div className="text-[10px] font-normal text-emerald-200 italic mt-0.5">
                      {isId ? 'Learning Focus (Situasi, Aktivitas, Sinergi, GESI, dll.)' : 'Situation, Activities, Linking, Issues, Resilience, etc.'}
                    </div>
                  </th>
                  <th className="p-3 w-72 text-left">
                    <div className="text-xs font-bold text-white">
                      {isId ? 'Pembelajaran Kunci' : 'Key Learning'}
                    </div>
                    <div className="text-[10px] font-normal text-emerald-200 italic mt-0.5">
                      {isId ? 'Apa pembelajaran kunci dari setiap fokus pembelajaran?' : 'What are the key learnings from every learning focus?'}
                    </div>
                  </th>
                  <th className="p-3 w-72 text-left">
                    <div className="text-xs font-bold text-white">
                      {isId ? 'Apa yang Dilakukan Berbeda?' : 'What we did/do differently?'}
                    </div>
                    <div className="text-[10px] font-normal text-emerald-200 italic mt-0.5">
                      {isId ? 'Tindakan/perubahan apa yang dilakukan berbeda dalam proyek?' : 'What action that was/is done differently in the project?'}
                    </div>
                  </th>
                  <th className="p-3 w-72 text-left">
                    <div className="text-xs font-bold text-white">
                      {isId ? 'Pelaksanaan Fase Proyek Selanjutnya' : 'How will we conduct the next phase'}
                    </div>
                    <div className="text-[10px] font-normal text-emerald-200 italic mt-0.5">
                      {isId ? 'Bagaimana dampak & penerapan pembelajaran untuk fase selanjutnya?' : 'What and how is the effect of learning for the next phase?'}
                    </div>
                  </th>
                  <th className="p-3 w-72 text-left">
                    <div className="text-xs font-bold text-white">
                      {isId ? 'Kapasitas Internal / Advokasi / Komunikasi' : 'Internal capacity/advocacy/communication'}
                    </div>
                    <div className="text-[10px] font-normal text-emerald-200 italic mt-0.5">
                      {isId ? 'Apa konsekuensi & kebutuhan peningkatan kapasitas/advokasi?' : 'What are the consequences & needs for capacity/advocacy/comms?'}
                    </div>
                  </th>
                  <th className="p-3 w-48 text-left">
                    <div className="text-xs font-bold text-white">
                      {isId ? 'Kapan Dipelajari / Diterapkan?' : 'When to learn/implement?'}
                    </div>
                    <div className="text-[10px] font-normal text-emerald-200 italic mt-0.5">
                      {isId ? 'Kapan kapasitas, advokasi, dan komunikasi dilaksanakan?' : 'When will capacity, advocacy, and comms be conducted?'}
                    </div>
                  </th>
                  {isAdmin && (
                    <th className="p-3 w-20 text-center">
                      <div className="text-xs font-bold text-emerald-100">{isId ? 'Aksi' : 'Action'}</div>
                    </th>
                  )}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200">
                {filteredLearnings.length > 0 ? (
                  filteredLearnings.map((item, idx) => {
                    const proj = projects.find(p => p.id === item.projectId);
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-amber-50/40 transition divide-x divide-slate-200 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        {/* Col 1: Learning Focus */}
                        <td className="p-3 align-top space-y-1.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getFocusBadgeColor(item.learningFocus)}`}>
                            {item.learningFocus}
                          </span>
                          {item.customFocus && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              Sub: {item.customFocus}
                            </div>
                          )}
                          <div className="font-bold text-slate-900 text-xs leading-snug">
                            {item.title}
                          </div>
                          {proj && (
                            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {proj.code}
                            </div>
                          )}
                        </td>

                        {/* Col 2: Key Learning */}
                        <td className="p-3 align-top text-slate-700 text-xs leading-relaxed font-normal">
                          <p>{item.keyLearning}</p>
                        </td>

                        {/* Col 3: What we did/do differently? */}
                        <td className="p-3 align-top text-slate-700 text-xs leading-relaxed">
                          <div className="p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-emerald-950">
                            {item.whatWeDidDifferently || '-'}
                          </div>
                        </td>

                        {/* Col 4: How will we conduct the next phase? */}
                        <td className="p-3 align-top text-slate-700 text-xs leading-relaxed">
                          <div className="p-2 bg-blue-50/70 border border-blue-200/80 rounded-lg text-blue-950">
                            {item.nextPhaseConduct || '-'}
                          </div>
                        </td>

                        {/* Col 5: Internal capacity/advocacy/communication */}
                        <td className="p-3 align-top text-slate-700 text-xs leading-relaxed">
                          <p>{item.internalCapacityAdvocacyComm || '-'}</p>
                        </td>

                        {/* Col 6: When to learn/implement? */}
                        <td className="p-3 align-top space-y-1.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {item.whenToLearnImplement || '-'}
                          </div>
                          {item.status && (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Dalam Penerapan (Actioned)' || item.status === 'Telah Terintegrasi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400">
                            Dicatat: {item.recordedBy || 'Staf M&E'}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        {isAdmin && (
                          <td className="p-3 align-top text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="Edit data pembelajaran ini"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setLearningToDelete(item)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus pembelajaran ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="p-12 text-center text-slate-400 text-xs space-y-2">
                      <Lightbulb className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600">Belum ada data pembelajaran yang cocok dengan filter.</p>
                      <p className="text-[11px]">Gunakan tombol "+ Tambah Pembelajaran" untuk mendokumentasikan temuan baru.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CARD GRID VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLearnings.map(item => {
            const proj = projects.find(p => p.id === item.projectId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-sm transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getFocusBadgeColor(item.learningFocus)}`}>
                          {item.learningFocus}
                        </span>
                        {proj && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {proj.code}
                          </span>
                        )}
                        {item.status && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                            {item.status}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug pt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setLearningToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Key Learning Section */}
                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Key Learning:
                    </div>
                    <p className="text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 font-medium">
                      {item.keyLearning}
                    </p>
                  </div>

                  {/* Actions Matrix 2-col */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                      <strong className="text-emerald-900 block text-[11px] mb-0.5">What we did/do differently:</strong>
                      <p className="text-slate-700 text-[11px] leading-relaxed">{item.whatWeDidDifferently || '-'}</p>
                    </div>

                    <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/60">
                      <strong className="text-blue-900 block text-[11px] mb-0.5">Next Phase of Project:</strong>
                      <p className="text-slate-700 text-[11px] leading-relaxed">{item.nextPhaseConduct || '-'}</p>
                    </div>
                  </div>

                  {item.internalCapacityAdvocacyComm && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700 block text-[11px] mb-0.5">
                        Internal Capacity / Advocacy / Communication:
                      </span>
                      <p className="text-[11px]">{item.internalCapacityAdvocacyComm}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Waktu: {item.whenToLearnImplement}
                  </span>
                  <span>Oleh: {item.recordedBy || 'Tim M&E'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL: ADD / EDIT PROJECT LEARNING */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-white">
                  <Lightbulb className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingLearning ? 'Edit Catatan Pembelajaran Proyek' : 'Tambah Pembelajaran Proyek (*Project Learning*)'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Isi matriks pembelajaran terstruktur sesuai standar kerangka kerja M&E.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Proyek */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Inisiatif Proyek Terkait <span className="text-rose-500">*</span>:
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Penerapan */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Status Penerapan Tindakan:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Teridentifikasi">Teridentifikasi (Baru Direkam)</option>
                    <option value="Dalam Penerapan (Actioned)">Dalam Penerapan (Actioned / Sedang Berjalan)</option>
                    <option value="Telah Terintegrasi">Telah Terintegrasi (Menjadi SOP/Regulasi)</option>
                    <option value="Ditinjau">Ditinjau / Review Berkala</option>
                  </select>
                </div>
              </div>

              {/* Judul Pembelajaran */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Topik / Judul Pembelajaran <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Adaptasi Pola Tanam Berbasis Kalender Musim & Cuaca Ekstrem"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-900"
                  required
                />
              </div>

              {/* Learning Focus Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Learning Focus (Kategori Fokus Pembelajaran) <span className="text-rose-500">*</span>:
                </label>
                <select
                  value={formData.learningFocus}
                  onChange={(e) => setFormData({ ...formData, learningFocus: e.target.value as LearningFocusCategory })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-900"
                  required
                >
                  {LEARNING_FOCUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {isId ? opt.labelId : opt.labelEn} — {isId ? opt.descriptionId : opt.descriptionEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Key Learning Textarea */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <label className="font-bold text-amber-950 block text-xs flex items-center justify-between">
                  <span>2. Key Learning <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-normal text-amber-800 italic">
                    "What are the key learning from every learning focus?"
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={formData.keyLearning}
                  onChange={(e) => setFormData({ ...formData, keyLearning: e.target.value })}
                  placeholder="Tuliskan temuan pembelajaran kunci yang diperoleh dari pengalaman dan data di lapangan..."
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 leading-relaxed"
                  required
                />
              </div>

              {/* What we did differently */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <label className="font-bold text-emerald-950 block text-xs flex items-center justify-between">
                  <span>3. What we did/do differently?</span>
                  <span className="text-[11px] font-normal text-emerald-800 italic">
                    "What action that being done differently in the project?"
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={formData.whatWeDidDifferently}
                  onChange={(e) => setFormData({ ...formData, whatWeDidDifferently: e.target.value })}
                  placeholder="Aksi atau pendekatan baru apa yang dilakukan berbeda dari rencana awal?"
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                />
              </div>

              {/* Next phase conduct */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <label className="font-bold text-blue-950 block text-xs flex items-center justify-between">
                  <span>4. How will we conduct the next phase of the project</span>
                  <span className="text-[11px] font-normal text-blue-800 italic">
                    "What and how is the effect of learning for the next phase of the project?"
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={formData.nextPhaseConduct}
                  onChange={(e) => setFormData({ ...formData, nextPhaseConduct: e.target.value })}
                  placeholder="Bagaimana pembelajaran ini akan diterapkan untuk menyempurnakan fase proyek selanjutnya?"
                  className="w-full p-2.5 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>

              {/* Internal capacity / advocacy / communication */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                <label className="font-bold text-purple-950 block text-xs flex items-center justify-between">
                  <span>5. Internal capacity / advocacy / communication</span>
                  <span className="text-[11px] font-normal text-purple-800 italic">
                    "What are consequence & needs for capacity development, advocacy, and communication?"
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={formData.internalCapacityAdvocacyComm}
                  onChange={(e) => setFormData({ ...formData, internalCapacityAdvocacyComm: e.target.value })}
                  placeholder="Kebutuhan pelatihan internal staf, advokasi regulasi daerah, atau kampanye komunikasi..."
                  className="w-full p-2.5 bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-800"
                />
              </div>

              {/* When to learn/implement & Recorder metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    6. When to learn/implement? <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={formData.whenToLearnImplement}
                    onChange={(e) => setFormData({ ...formData, whenToLearnImplement: e.target.value })}
                    placeholder="Contoh: Q2 2025 / Setiap Siklus Pelatihan"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pencatat / Penanggung Jawab:
                  </label>
                  <input
                    type="text"
                    value={formData.recordedBy}
                    onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                    placeholder="Nama Staf / Jabatan"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tanggal Dicatat:
                  </label>
                  <input
                    type="date"
                    value={formData.dateRecorded}
                    onChange={(e) => setFormData({ ...formData, dateRecorded: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {editingLearning ? 'Simpan Perubahan' : 'Simpan Pembelajaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE LEARNING */}
      {learningToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Pembelajaran?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
              <div>Topik: <strong className="text-slate-900">{learningToDelete.title}</strong></div>
              <div>Fokus: <span className="text-emerald-700 font-semibold">{learningToDelete.learningFocus}</span></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLearningToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteLearning(learningToDelete.id);
                  setLearningToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition"
              >
                Hapus Pembelajaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
