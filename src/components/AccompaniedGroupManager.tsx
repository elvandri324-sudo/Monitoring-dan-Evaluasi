import React, { useState, useMemo, FormEvent } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  UserPlus, 
  Phone, 
  Sparkles, 
  X, 
  Filter, 
  Check, 
  Settings, 
  HeartHandshake, 
  Recycle, 
  Compass, 
  Sprout, 
  Trees, 
  Building2, 
  Calendar,
  Grid,
  List,
  UserCheck,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  AccompaniedGroup, 
  AccompaniedGroupMember, 
  AccompaniedGroupType, 
  GroupMemberRole, 
  Beneficiary, 
  Project,
  ActivityAttendance
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { exportAccompaniedGroupsToXLSX } from '../utils/exportXlsx';

interface AccompaniedGroupManagerProps {
  groups: AccompaniedGroup[];
  beneficiaries: Beneficiary[];
  projects: Project[];
  attendances?: ActivityAttendance[];
  selectedProjectId: string;
  isAdmin: boolean;
  onAddGroup: (newGroup: AccompaniedGroup) => void;
  onUpdateGroup: (updatedGroup: AccompaniedGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddMembersToGroup: (groupId: string, newMembers: AccompaniedGroupMember[]) => void;
  onRemoveMemberFromGroup: (groupId: string, beneficiaryId: string) => void;
  onUpdateMemberRole: (groupId: string, beneficiaryId: string, newRole: string) => void;
  onNavigateToBeneficiary?: (benId: string) => void;
}

const GROUP_TYPES: AccompaniedGroupType[] = [
  'OPS (Organisasi Pengelola Sarana / Sanitasi)',
  'POKJA (Kelompok Kerja)',
  'KADER Perubahan Perilaku (SBCC / Higiene)',
  'TPS3R (Tempat Pengolahan Sampah 3R)',
  'PDU (Pusat Daur Ulang)',
  'Bank Sampah',
  'Pokdarwis (Kelompok Sadar Wisata)',
  'Kelompok Tani / KWT',
  'KUPS / Lembaga Pengelola Hutan Desa (LPHD)',
  'Lembaga Adat / Komunitas Adat',
  'Kelompok Pemuda / Karang Taruna',
  'Koperasi / KUBE',
  'Lainnya'
];

const MEMBER_ROLES: GroupMemberRole[] = [
  'Ketua',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Koordinator Lapangan',
  'Kader Aktif',
  'Anggota Inti',
  'Anggota'
];

export default function AccompaniedGroupManager({
  groups,
  beneficiaries,
  projects,
  attendances = [],
  selectedProjectId,
  isAdmin,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddMembersToGroup,
  onRemoveMemberFromGroup,
  onUpdateMemberRole,
  onNavigateToBeneficiary
}: AccompaniedGroupManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  // Filters & View state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVillage, setFilterVillage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Drawers state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AccompaniedGroup | null>(null);
  const [activeGroupForMembers, setActiveGroupForMembers] = useState<AccompaniedGroup | null>(null);
  const [showMemberPickerModal, setShowMemberPickerModal] = useState(false);
  const [detailGroup, setDetailGroup] = useState<AccompaniedGroup | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AccompaniedGroup | null>(null);

  // Beneficiary quick map for fast lookup
  const beneficiaryMap = useMemo(() => {
    const map = new Map<string, Beneficiary>();
    beneficiaries.forEach(b => map.set(b.id, b));
    return map;
  }, [beneficiaries]);

  // Project quick map
  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach(p => map.set(p.id, p));
    return map;
  }, [projects]);

  // Unique villages for filter
  const allVillages = useMemo(() => {
    const set = new Set<string>();
    groups.forEach(g => {
      if (g.village) set.add(g.village);
    });
    beneficiaries.forEach(b => {
      if (b.village) set.add(b.village);
    });
    return Array.from(set).sort();
  }, [groups, beneficiaries]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      // Filter project
      if (selectedProjectId !== 'all' && g.projectId !== 'all' && g.projectId !== selectedProjectId) {
        return false;
      }
      // Filter type
      if (filterType !== 'all' && g.type !== filterType) {
        return false;
      }
      // Filter status
      if (filterStatus !== 'all' && g.status !== filterStatus) {
        return false;
      }
      // Filter village
      if (filterVillage !== 'all' && g.village !== filterVillage) {
        return false;
      }
      // Filter search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = g.name.toLowerCase().includes(query);
        const matchCode = g.code.toLowerCase().includes(query);
        const matchLeader = (g.leaderName || '').toLowerCase().includes(query);
        const matchVillage = g.village.toLowerCase().includes(query);
        const matchFocus = (g.focusArea || '').toLowerCase().includes(query);
        const matchType = g.type.toLowerCase().includes(query);
        
        // Search in member names too!
        const matchMember = g.members.some(m => {
          const ben = beneficiaryMap.get(m.beneficiaryId);
          return ben && (ben.fullName.toLowerCase().includes(query) || ben.nikOrIdentifier.includes(query));
        });

        return matchName || matchCode || matchLeader || matchVillage || matchFocus || matchType || matchMember;
      }
      return true;
    });
  }, [groups, selectedProjectId, filterType, filterStatus, filterVillage, searchQuery, beneficiaryMap]);

  // Aggregate Statistics
  const stats = useMemo(() => {
    const totalGroups = filteredGroups.length;
    
    // Unique member IDs across filtered groups
    const uniqueMemberIds = new Set<string>();
    filteredGroups.forEach(g => {
      g.members.forEach(m => uniqueMemberIds.add(m.beneficiaryId));
    });

    let womenCount = 0;
    let menCount = 0;
    let disabilityCount = 0;
    let iplcCount = 0;

    uniqueMemberIds.forEach(id => {
      const ben = beneficiaryMap.get(id);
      if (ben) {
        if (ben.gender === 'Perempuan') womenCount++;
        if (ben.gender === 'Laki-laki') menCount++;
        if (ben.hasDisability) disabilityCount++;
        if (ben.iplcStatus && ben.iplcStatus !== 'Bukan IPLC (Non-IPLC)') iplcCount++;
      }
    });

    const totalUnique = uniqueMemberIds.size;
    const percentWomen = totalUnique > 0 ? Math.round((womenCount / totalUnique) * 100) : 0;
    const percentDisability = totalUnique > 0 ? Math.round((disabilityCount / totalUnique) * 100) : 0;
    const percentIplc = totalUnique > 0 ? Math.round((iplcCount / totalUnique) * 100) : 0;

    // Type breakdown count
    const typeCounts: Record<string, number> = {};
    filteredGroups.forEach(g => {
      typeCounts[g.type] = (typeCounts[g.type] || 0) + 1;
    });

    return {
      totalGroups,
      totalUnique,
      womenCount,
      menCount,
      percentWomen,
      disabilityCount,
      percentDisability,
      iplcCount,
      percentIplc,
      typeCounts
    };
  }, [filteredGroups, beneficiaryMap]);

  // Helper icon for group type
  const getTypeBadge = (type: string) => {
    if (type.includes('OPS')) {
      return {
        icon: Settings,
        bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        dot: 'bg-cyan-500',
        shortName: 'OPS'
      };
    }
    if (type.includes('POKJA')) {
      return {
        icon: Users,
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
        shortName: 'POKJA'
      };
    }
    if (type.includes('KADER')) {
      return {
        icon: HeartHandshake,
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        shortName: 'KADER SBCC'
      };
    }
    if (type.includes('TPS3R')) {
      return {
        icon: Recycle,
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        dot: 'bg-teal-500',
        shortName: 'TPS3R'
      };
    }
    if (type.includes('PDU')) {
      return {
        icon: Layers,
        bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        dot: 'bg-cyan-500',
        shortName: 'PDU'
      };
    }
    if (type.includes('Bank Sampah')) {
      return {
        icon: Recycle,
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        shortName: 'Bank Sampah'
      };
    }
    if (type.includes('Pokdarwis')) {
      return {
        icon: Compass,
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        shortName: 'Pokdarwis'
      };
    }
    if (type.includes('Tani') || type.includes('KWT')) {
      return {
        icon: Sprout,
        bg: 'bg-lime-50 text-lime-800 border-lime-200',
        dot: 'bg-lime-500',
        shortName: 'Kelompok Tani / KWT'
      };
    }
    if (type.includes('KUPS') || type.includes('Hutan')) {
      return {
        icon: Trees,
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        dot: 'bg-teal-500',
        shortName: 'KUPS / Hutan Desa'
      };
    }
    if (type.includes('Adat')) {
      return {
        icon: ShieldCheck,
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        dot: 'bg-purple-500',
        shortName: 'Lembaga Adat'
      };
    }
    return {
      icon: Building2,
      bg: 'bg-slate-50 text-slate-800 border-slate-200',
      dot: 'bg-slate-500',
      shortName: type
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Mandiri':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Aktif':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Rintisan / Pemula':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Perlu Penguatan':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Nonaktif':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Open Form modal
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setShowFormModal(true);
  };

  const handleOpenEditGroup = (group: AccompaniedGroup) => {
    setEditingGroup(group);
    setShowFormModal(true);
  };

  // Open Manage Members
  const handleOpenManageMembers = (group: AccompaniedGroup) => {
    setActiveGroupForMembers(group);
  };

  // Export
  const handleExportXLSX = () => {
    exportAccompaniedGroupsToXLSX(filteredGroups, beneficiaries, projects);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              {isId ? 'Organisasi & Kelompok Dampingan' : 'Accompanied Community Groups'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            {isId ? 'Kelompok Masyarakat yang Didampingi' : 'Facilitated Community Groups'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            {isId 
              ? 'Kelola data kelompok berbasis masyarakat (OPS, POKJA, KADER SBCC, TPS3R, PDU, Bank Sampah, Pokdarwis, KWT, KUPS, Lembaga Adat) dan integrasi anggota langsung dari basis data Penerima Manfaat terdaftar.' 
              : 'Manage facilitated community-based organizations (OPS, POKJA, SBCC Cadres, TPS3R, PDU, Waste Banks, Tourism Groups, etc.) with member rosters linked directly to registered beneficiaries.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            onClick={handleExportXLSX}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition"
            title={isId ? 'Ekspor Data Kelompok dan Anggota ke Excel (.xlsx)' : 'Export Groups and Members to Excel'}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{isId ? 'Ekspor Excel' : 'Export XLSX'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenAddGroup}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{isId ? 'Tambah Kelompok' : 'Add Group'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Groups */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isId ? 'Total Kelompok' : 'Total Groups'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalGroups}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isId ? 'Organisasi & Tim Dampingan' : 'Facilitated Organizations'}
          </p>
        </div>

        {/* Total Unique Members */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isId ? 'Anggota Terdata' : 'Group Members'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalUnique}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {isId ? 'Terhubung dari Penerima Manfaat' : 'Linked from Beneficiaries'}
          </p>
        </div>

        {/* Women in Groups */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isId ? 'Perempuan (GESI)' : 'Women (GESI)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{stats.womenCount}</span>
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">
              {stats.percentWomen}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isId ? 'Kepemimpinan & Anggota Perempuan' : 'Female Leadership & Members'}
          </p>
        </div>

        {/* Disability Members */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isId ? 'Disabilitas Inklusif' : 'Disability Inclusive'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{stats.disabilityCount}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              {stats.percentDisability}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isId ? 'Penyandang Disabilitas Aktif' : 'Active Disabled Members'}
          </p>
        </div>

        {/* IPLC Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isId ? 'Masyarakat Adat / IPLC' : 'IPLC Members'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{stats.iplcCount}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              {stats.percentIplc}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isId ? 'Masyarakat Adat / Lokal' : 'Indigenous & Local People'}
          </p>
        </div>
      </div>

      {/* QUICK FILTER PILLS FOR GROUP TYPES */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>{isId ? 'Semua Jenis Kelompok' : 'All Group Types'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white">
            {groups.length}
          </span>
        </button>

        {GROUP_TYPES.map(gt => {
          const badge = getTypeBadge(gt);
          const Icon = badge.icon;
          const count = groups.filter(g => g.type === gt).length;
          if (count === 0 && filterType !== gt) return null;

          return (
            <button
              key={gt}
              onClick={() => setFilterType(filterType === gt ? 'all' : gt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                filterType === gt
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${filterType === gt ? 'text-white' : 'text-slate-500'}`} />
              <span>{badge.shortName}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterType === gt ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH AND ADVANCED FILTERS BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isId ? 'Cari nama kelompok, kode, nama ketua, desa, bidang fokus, atau anggota...' : 'Search by group name, code, leader, village, focus, or member...'}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{isId ? 'Semua Status' : 'All Statuses'}</option>
            <option value="Aktif">Aktif</option>
            <option value="Mandiri">Mandiri</option>
            <option value="Rintisan / Pemula">Rintisan / Pemula</option>
            <option value="Perlu Penguatan">Perlu Penguatan</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>

          {/* Filter Village */}
          <select
            value={filterVillage}
            onChange={(e) => setFilterVillage(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{isId ? 'Semua Desa / Lokasi' : 'All Villages'}</option>
            {allVillages.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Tampilan Kartu"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GROUPS LIST CONTAINER */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            {isId ? 'Tidak Ada Kelompok Dampingan Ditemukan' : 'No Accompanied Groups Found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterVillage !== 'all'
              ? (isId ? 'Tidak ada kelompok yang sesuai dengan kriteria filter pencarian Anda. Coba reset filter.' : 'No groups match your current filter criteria.')
              : (isId ? 'Belum ada kelompok dampingan yang didaftarkan. Klik tombol di bawah untuk menambahkan kelompok baru (OPS, POKJA, Kader, Bank Sampah, Pokdarwis, dll).' : 'No accompanied groups registered yet.')}
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAddGroup}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{isId ? 'Tambah Kelompok Baru' : 'Add New Group'}</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map(group => {
            const badge = getTypeBadge(group.type);
            const Icon = badge.icon;
            const project = projectMap.get(group.projectId);

            // Compute member demographics
            const members = group.members.map(m => {
              const ben = beneficiaryMap.get(m.beneficiaryId);
              return { ...m, beneficiary: ben };
            });

            const womenInGroup = members.filter(m => m.beneficiary?.gender === 'Perempuan').length;
            const disabilityInGroup = members.filter(m => m.beneficiary?.hasDisability).length;
            const iplcInGroup = members.filter(m => m.beneficiary?.iplcStatus && m.beneficiary.iplcStatus !== 'Bukan IPLC (Non-IPLC)').length;

            return (
              <div 
                key={group.id} 
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{badge.shortName}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {group.code}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(group.status)}`}>
                      {group.status}
                    </span>
                  </div>

                  {/* Group Name */}
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition">
                    {group.name}
                  </h3>

                  {/* Project Tag */}
                  {project && (
                    <p className="text-[10px] text-blue-600 font-semibold mt-1 truncate">
                      📁 {project.code} - {project.title}
                    </p>
                  )}

                  {/* Location & Legalitas */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{group.village}, {group.regency}</span>
                    </div>
                    {group.legalDocumentNumber && (
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate text-[11px] font-mono text-slate-500">
                          {group.legalStatus || 'SK'}: {group.legalDocumentNumber}
                        </span>
                      </div>
                    )}
                    {group.leaderName && (
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">
                          {isId ? 'Ketua' : 'Leader'}: <strong className="text-slate-800">{group.leaderName}</strong>
                          {group.leaderPhone && <span className="text-slate-400 ml-1">({group.leaderPhone})</span>}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Focus Area */}
                  {group.focusArea && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                      <span className="font-semibold text-slate-700">{isId ? 'Fokus Dampingan: ' : 'Focus: '}</span>
                      {group.focusArea}
                    </div>
                  )}

                  {/* Member Summary Section */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{group.members.length} {isId ? 'Anggota Terdata' : 'Members'}</span>
                      </span>

                      <button
                        onClick={() => handleOpenManageMembers(group)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>{isId ? 'Kelola Anggota' : 'Manage Members'}</span>
                      </button>
                    </div>

                    {/* Member Demographic Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-semibold">
                        👩 {womenInGroup} {isId ? 'Perempuan' : 'Women'}
                      </span>
                      {disabilityInGroup > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                          ♿ {disabilityInGroup} {isId ? 'Disabilitas' : 'Disabled'}
                        </span>
                      )}
                      {iplcInGroup > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                          🌿 {iplcInGroup} IPLC
                        </span>
                      )}
                    </div>

                    {/* Avatar preview of members */}
                    <div className="flex items-center gap-1 mt-2.5 overflow-hidden">
                      {members.slice(0, 4).map((m, idx) => (
                        <span
                          key={idx}
                          className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center border border-white shrink-0"
                          title={`${m.beneficiary?.fullName || 'Anggota'} (${m.roleInGroup})`}
                        >
                          {(m.beneficiary?.fullName || 'U').charAt(0).toUpperCase()}
                        </span>
                      ))}
                      {members.length > 4 && (
                        <span className="text-[10px] font-bold text-slate-400 ml-1">
                          +{members.length - 4} {isId ? 'lainnya' : 'more'}
                        </span>
                      )}
                      {members.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">
                          {isId ? 'Belum ada anggota. Klik Kelola Anggota.' : 'No members yet.'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailGroup(group)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isId ? 'Detail' : 'View'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditGroup(group)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition"
                          title={isId ? 'Edit Profil Kelompok' : 'Edit Group'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(group)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition"
                          title={isId ? 'Hapus Kelompok' : 'Delete Group'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Kode & Nama Kelompok</th>
                  <th className="p-3.5">Jenis Kelompok</th>
                  <th className="p-3.5">Desa & Wilayah</th>
                  <th className="p-3.5">Ketua / Kontak</th>
                  <th className="p-3.5">Legalitas SK</th>
                  <th className="p-3.5 text-center">Anggota (P/L/Dis)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredGroups.map(group => {
                  const badge = getTypeBadge(group.type);
                  const Icon = badge.icon;

                  const members = group.members.map(m => beneficiaryMap.get(m.beneficiaryId));
                  const womenCount = members.filter(b => b?.gender === 'Perempuan').length;
                  const disCount = members.filter(b => b?.hasDisability).length;

                  return (
                    <tr key={group.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {group.code}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{group.name}</p>
                            {group.focusArea && (
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{group.focusArea}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1 ${badge.bg}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.shortName}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800">{group.village}</p>
                        <p className="text-[10px] text-slate-400">{group.regency}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800">{group.leaderName || '-'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{group.leaderPhone || '-'}</p>
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-500">
                        {group.legalDocumentNumber ? `${group.legalStatus || 'SK'}: ${group.legalDocumentNumber}` : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenManageMembers(group)}
                          className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{group.members.length}</span>
                          <span className="text-[10px] font-normal text-slate-500">({womenCount} 👩 / {disCount} ♿)</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(group.status)}`}>
                          {group.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailGroup(group)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenManageMembers(group)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                            title="Kelola Anggota"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditGroup(group)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteCandidate(group)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. MODAL / DRAWER KELOLA ANGGOTA KELOMPOK */}
      {/* ======================================================== */}
      {activeGroupForMembers && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 font-mono font-bold text-xs">
                    {activeGroupForMembers.code}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {activeGroupForMembers.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {isId ? 'Manajemen Anggota: ' : 'Member Roster: '} {activeGroupForMembers.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  📍 {activeGroupForMembers.village}, {activeGroupForMembers.regency} • {activeGroupForMembers.members.length} {isId ? 'Anggota Terdaftar' : 'Members'}
                </p>
              </div>

              <button
                onClick={() => setActiveGroupForMembers(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar inside Drawer */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-semibold">{isId ? 'Hubungkan Penerima Manfaat: ' : 'Link Beneficiaries: '}</span>
                {isId ? 'Pilih individu yang telah diinput pada data Penerima Manfaat untuk dijadikan anggota kelompok ini.' : 'Select individuals from beneficiary database to add as members.'}
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowMemberPickerModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isId ? '+ Tambah Anggota dari Penerima Manfaat' : '+ Add Members from Beneficiaries'}</span>
                </button>
              )}
            </div>

            {/* Members List Table */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeGroupForMembers.members.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    {isId ? 'Belum Ada Anggota yang Ditambahkan' : 'No Members Added Yet'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    {isId 
                      ? 'Klik tombol "+ Tambah Anggota dari Penerima Manfaat" di atas untuk memilih peserta/warga yang telah didata dalam sistem.' 
                      : 'Click the button above to add members from registered beneficiaries.'}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setShowMemberPickerModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isId ? 'Pilih Penerima Manfaat Sekarang' : 'Select Beneficiaries'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-3">No</th>
                        <th className="p-3">Nama Lengkap & NIK</th>
                        <th className="p-3">Gender & Usia</th>
                        <th className="p-3">Desa / Domisili</th>
                        <th className="p-3">Status Inklusi / GESI</th>
                        <th className="p-3">Peran dalam Kelompok</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeGroupForMembers.members.map((member, index) => {
                        const ben = beneficiaryMap.get(member.beneficiaryId);
                        return (
                          <tr key={member.beneficiaryId} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 text-slate-400 font-mono">{index + 1}</td>
                            <td className="p-3">
                              {ben ? (
                                <div>
                                  <button
                                    onClick={() => onNavigateToBeneficiary && onNavigateToBeneficiary(ben.id)}
                                    className="font-bold text-slate-900 hover:text-blue-600 text-left"
                                  >
                                    {ben.fullName}
                                  </button>
                                  <p className="text-[10px] font-mono text-slate-400">{ben.nikOrIdentifier}</p>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">ID: {member.beneficiaryId} (Tidak Ditemukan)</span>
                              )}
                            </td>
                            <td className="p-3">
                              {ben ? (
                                <div className="space-y-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    ben.gender === 'Perempuan' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {ben.gender}
                                  </span>
                                  <p className="text-[10px] text-slate-500">{ben.age} tahun ({ben.ageGroup})</p>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-3">
                              {ben ? (
                                <div>
                                  <p className="font-medium text-slate-800">{ben.village}</p>
                                  <p className="text-[10px] text-slate-400">{ben.regency}</p>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-3">
                              {ben ? (
                                <div className="space-y-1">
                                  {ben.hasDisability ? (
                                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold block w-fit">
                                      ♿ {ben.disabilityType || 'Disabilitas'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">Non-Disabilitas</span>
                                  )}
                                  {ben.iplcStatus && ben.iplcStatus !== 'Bukan IPLC (Non-IPLC)' && (
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold block w-fit">
                                      🌿 {ben.customIplcCommunityName || 'IPLC'}
                                    </span>
                                  )}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-3">
                              {isAdmin ? (
                                <select
                                  value={member.roleInGroup}
                                  onChange={(e) => {
                                    onUpdateMemberRole(activeGroupForMembers.id, member.beneficiaryId, e.target.value);
                                    // Update local state preview
                                    setActiveGroupForMembers({
                                      ...activeGroupForMembers,
                                      members: activeGroupForMembers.members.map(m => 
                                        m.beneficiaryId === member.beneficiaryId ? { ...m, roleInGroup: e.target.value } : m
                                      )
                                    });
                                  }}
                                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                                >
                                  {MEMBER_ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold text-xs border border-blue-200">
                                  {member.roleInGroup}
                                </span>
                              )}
                              {member.notes && (
                                <p className="text-[10px] text-slate-400 mt-0.5 italic">{member.notes}</p>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    if (confirm(isId ? `Hapus ${ben?.fullName || 'anggota'} dari kelompok ini?` : 'Remove this member?')) {
                                      onRemoveMemberFromGroup(activeGroupForMembers.id, member.beneficiaryId);
                                      setActiveGroupForMembers({
                                        ...activeGroupForMembers,
                                        members: activeGroupForMembers.members.filter(m => m.beneficiaryId !== member.beneficiaryId)
                                      });
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Hapus dari kelompok"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {isId ? 'Perubahan peran dan anggota otomatis tersimpan dalam basis data.' : 'Changes are automatically saved.'}
              </span>
              <button
                onClick={() => setActiveGroupForMembers(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MODAL PICKER: PILIH PENERIMA MANFAAT UNTUK DITAMBAHKAN */}
      {/* ======================================================== */}
      {showMemberPickerModal && activeGroupForMembers && (
        <MemberPickerModal
          isOpen={showMemberPickerModal}
          onClose={() => setShowMemberPickerModal(false)}
          targetGroup={activeGroupForMembers}
          beneficiaries={beneficiaries}
          existingMemberIds={new Set(activeGroupForMembers.members.map(m => m.beneficiaryId))}
          onAddMembers={(selectedMembers) => {
            onAddMembersToGroup(activeGroupForMembers.id, selectedMembers);
            // Update local view
            setActiveGroupForMembers({
              ...activeGroupForMembers,
              members: [...activeGroupForMembers.members, ...selectedMembers]
            });
            setShowMemberPickerModal(false);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 3. MODAL TAMBAH / EDIT KELOMPOK DAMPINGAN */}
      {/* ======================================================== */}
      {showFormModal && (
        <GroupFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          editingGroup={editingGroup}
          projects={projects}
          beneficiaries={beneficiaries}
          onSave={(groupData) => {
            if (editingGroup) {
              onUpdateGroup(groupData);
            } else {
              onAddGroup(groupData);
            }
            setShowFormModal(false);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 4. MODAL DETAIL KELOMPOK */}
      {/* ======================================================== */}
      {detailGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 font-mono font-bold text-xs">
                  {detailGroup.code}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{detailGroup.name}</h3>
                <p className="text-xs text-blue-200 mt-0.5">{detailGroup.type}</p>
              </div>
              <button
                onClick={() => setDetailGroup(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">{isId ? 'Status Kelompok' : 'Status'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(detailGroup.status)}`}>
                    {detailGroup.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">{isId ? 'Lokasi / Desa' : 'Village'}</span>
                  <span className="font-bold text-slate-800">{detailGroup.village}, {detailGroup.regency}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">{isId ? 'Tanggal Terbentuk' : 'Est. Date'}</span>
                  <span className="font-bold text-slate-800">{detailGroup.establishmentDate || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">{isId ? 'Status Legalitas' : 'Legal Status'}</span>
                  <span className="font-bold text-slate-800">{detailGroup.legalStatus || 'Belum Berbadan Hukum'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-medium block mb-0.5">{isId ? 'Nomor SK / Izin' : 'Document No'}</span>
                  <span className="font-mono font-bold text-slate-800">{detailGroup.legalDocumentNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">{isId ? 'Nama Ketua' : 'Leader'}</span>
                  <span className="font-bold text-slate-800">{detailGroup.leaderName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">{isId ? 'No. Kontak Ketua' : 'Phone'}</span>
                  <span className="font-mono font-bold text-slate-800">{detailGroup.leaderPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">{isId ? 'Total Anggota' : 'Total Members'}</span>
                  <span className="font-bold text-blue-600">{detailGroup.members.length} Orang</span>
                </div>
              </div>

              {/* Focus Area */}
              {detailGroup.focusArea && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{isId ? 'Bidang Fokus & Program Kerja Dampingan' : 'Focus Area & Workplan'}</h4>
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-slate-700 leading-relaxed">
                    {detailGroup.focusArea}
                  </div>
                </div>
              )}

              {/* Notes */}
              {detailGroup.notes && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{isId ? 'Catatan Tambahan' : 'Notes'}</h4>
                  <p className="text-slate-600 leading-relaxed">{detailGroup.notes}</p>
                </div>
              )}

              {/* Roster of members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{isId ? 'Daftar Anggota Kelompok' : 'Group Members Roster'} ({detailGroup.members.length})</h4>
                  <button
                    onClick={() => {
                      const g = detailGroup;
                      setDetailGroup(null);
                      handleOpenManageMembers(g);
                    }}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    {isId ? 'Kelola / Ubah Anggota' : 'Manage Members'}
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-2.5">Nama Anggota</th>
                        <th className="p-2.5">Gender / Usia</th>
                        <th className="p-2.5">Status GESI / IPLC</th>
                        <th className="p-2.5">Peran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detailGroup.members.map(m => {
                        const ben = beneficiaryMap.get(m.beneficiaryId);
                        return (
                          <tr key={m.beneficiaryId} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <p className="font-bold text-slate-900">{ben ? ben.fullName : m.beneficiaryId}</p>
                              {ben && <p className="text-[10px] font-mono text-slate-400">{ben.nikOrIdentifier}</p>}
                            </td>
                            <td className="p-2.5">
                              {ben ? `${ben.gender} • ${ben.age} th` : '-'}
                            </td>
                            <td className="p-2.5">
                              {ben?.hasDisability && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold mr-1">
                                  ♿ {ben.disabilityType || 'Disabilitas'}
                                </span>
                              )}
                              {ben?.iplcStatus && ben.iplcStatus !== 'Bukan IPLC (Non-IPLC)' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                                  🌿 {ben.customIplcCommunityName || 'IPLC'}
                                </span>
                              )}
                              {!ben?.hasDisability && ben?.iplcStatus === 'Bukan IPLC (Non-IPLC)' && (
                                <span className="text-slate-400 text-[10px]">-</span>
                              )}
                            </td>
                            <td className="p-2.5 font-bold text-blue-700">
                              {m.roleInGroup}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDetailGroup(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL KONFIRMASI HAPUS */}
      {/* ======================================================== */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isId ? 'Hapus Kelompok Dampingan?' : 'Delete Accompanied Group?'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isId ? `Apakah Anda yakin ingin menghapus data kelompok "${deleteCandidate.name}" (${deleteCandidate.code})? Data anggota pada kelompok ini akan terhapus, tetapi data Penerima Manfaat asal tetap tersimpan di database.` : `Are you sure you want to delete "${deleteCandidate.name}"?`}
            </p>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteGroup(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
              >
                {isId ? 'Hapus Sekarang' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// SUB-COMPONENT: MEMBER PICKER MODAL
// ========================================================
interface MemberPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGroup: AccompaniedGroup;
  beneficiaries: Beneficiary[];
  existingMemberIds: Set<string>;
  onAddMembers: (newMembers: AccompaniedGroupMember[]) => void;
}

function MemberPickerModal({
  isOpen,
  onClose,
  targetGroup,
  beneficiaries,
  existingMemberIds,
  onAddMembers
}: MemberPickerModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [search, setSearch] = useState('');
  const [filterVillage, setFilterVillage] = useState(targetGroup.village || 'all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterDisability, setFilterDisability] = useState('all');
  const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = useState<Set<string>>(new Set());
  const [defaultRole, setDefaultRole] = useState<GroupMemberRole>('Anggota');

  // Candidate beneficiaries (excluding already added members or indicating them)
  const candidateBeneficiaries = useMemo(() => {
    return beneficiaries.filter(b => {
      // Village filter
      if (filterVillage !== 'all' && b.village !== filterVillage) return false;
      // Gender filter
      if (filterGender !== 'all' && b.gender !== filterGender) return false;
      // Disability filter
      if (filterDisability === 'disability' && !b.hasDisability) return false;
      if (filterDisability === 'non-disability' && b.hasDisability) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = b.fullName.toLowerCase().includes(q);
        const matchNik = b.nikOrIdentifier.toLowerCase().includes(q);
        const matchOcc = (b.occupation || '').toLowerCase().includes(q);
        const matchIplc = (b.customIplcCommunityName || '').toLowerCase().includes(q);
        return matchName || matchNik || matchOcc || matchIplc;
      }
      return true;
    });
  }, [beneficiaries, filterVillage, filterGender, filterDisability, search]);

  const toggleSelect = (id: string) => {
    if (existingMemberIds.has(id)) return; // already in group
    const next = new Set(selectedBeneficiaryIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedBeneficiaryIds(next);
  };

  const handleSelectAllFiltered = () => {
    const available = candidateBeneficiaries.filter(b => !existingMemberIds.has(b.id));
    if (selectedBeneficiaryIds.size === available.length && available.length > 0) {
      setSelectedBeneficiaryIds(new Set());
    } else {
      setSelectedBeneficiaryIds(new Set(available.map(b => b.id)));
    }
  };

  const handleConfirmAdd = () => {
    if (selectedBeneficiaryIds.size === 0) return;
    const newMembers: AccompaniedGroupMember[] = Array.from(selectedBeneficiaryIds).map((id: string) => ({
      beneficiaryId: id,
      roleInGroup: defaultRole,
      joinedDate: new Date().toISOString().slice(0, 10),
      notes: `Ditambahkan ke ${targetGroup.name}`
    }));
    onAddMembers(newMembers);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-700 px-2 py-0.5 rounded text-blue-100">
              {isId ? 'Integrasi Penerima Manfaat Terdaftar' : 'Registered Beneficiaries Integration'}
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {isId ? 'Pilih Anggota untuk: ' : 'Select Members for: '} {targetGroup.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-blue-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isId ? 'Cari nama lengkap, NIK, profesi...' : 'Search name, NIK, occupation...'}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={filterVillage}
                onChange={(e) => setFilterVillage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">{isId ? 'Semua Desa' : 'All Villages'}</option>
                {Array.from(new Set(beneficiaries.map(b => b.village))).sort().map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">{isId ? 'Semua Gender' : 'All Genders'}</option>
                <option value="Perempuan">Perempuan (Women)</option>
                <option value="Laki-laki">Laki-laki (Men)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                {selectedBeneficiaryIds.size > 0 ? (isId ? 'Batal Pilih Semua' : 'Deselect All') : (isId ? 'Pilih Semua yang Tampil' : 'Select All Filtered')}
              </button>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 font-medium">
                {selectedBeneficiaryIds.size} {isId ? 'individu dipilih' : 'individuals selected'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="font-semibold text-slate-700">
                {isId ? 'Tetapkan Peran Default: ' : 'Assign Default Role: '}
              </label>
              <select
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value as GroupMemberRole)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              >
                {MEMBER_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Candidate List */}
        <div className="p-4 overflow-y-auto flex-1 text-xs">
          {candidateBeneficiaries.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {isId ? 'Tidak ada penerima manfaat yang sesuai dengan filter pencarian.' : 'No beneficiaries found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {candidateBeneficiaries.map(ben => {
                const isAlreadyMember = existingMemberIds.has(ben.id);
                const isSelected = selectedBeneficiaryIds.has(ben.id);

                return (
                  <div
                    key={ben.id}
                    onClick={() => !isAlreadyMember && toggleSelect(ben.id)}
                    className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                      isAlreadyMember 
                        ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'bg-blue-50/80 border-blue-500 shadow-xs cursor-pointer ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isAlreadyMember || isSelected}
                        disabled={isAlreadyMember}
                        onChange={() => toggleSelect(ben.id)}
                        className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{ben.fullName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{ben.nikOrIdentifier}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                          📍 {ben.village}, {ben.regency} • {ben.age} th
                        </p>
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            ben.gender === 'Perempuan' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ben.gender}
                          </span>
                          {ben.hasDisability && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">
                              ♿ {ben.disabilityType || 'Disabilitas'}
                            </span>
                          )}
                          {ben.iplcStatus && ben.iplcStatus !== 'Bukan IPLC (Non-IPLC)' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-semibold">
                              🌿 {ben.customIplcCommunityName || 'IPLC'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isAlreadyMember && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold whitespace-nowrap">
                        {isId ? 'Sudah Anggota' : 'Already Member'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            {isId ? 'Batal' : 'Cancel'}
          </button>

          <button
            onClick={handleConfirmAdd}
            disabled={selectedBeneficiaryIds.size === 0}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white shadow-xs flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4" />
            <span>
              {isId 
                ? `Tambahkan (${selectedBeneficiaryIds.size}) Anggota ke Kelompok` 
                : `Add (${selectedBeneficiaryIds.size}) Members`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================================
// SUB-COMPONENT: GROUP FORM MODAL (TAMBAH / EDIT KELOMPOK)
// ========================================================
interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup: AccompaniedGroup | null;
  projects: Project[];
  beneficiaries: Beneficiary[];
  onSave: (group: AccompaniedGroup) => void;
}

function GroupFormModal({
  isOpen,
  onClose,
  editingGroup,
  projects,
  beneficiaries,
  onSave
}: GroupFormModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [projectId, setProjectId] = useState(editingGroup?.projectId || (projects[0]?.id || 'all'));
  const [code, setCode] = useState(editingGroup?.code || '');
  const [name, setName] = useState(editingGroup?.name || '');
  const [type, setType] = useState<AccompaniedGroupType | string>(editingGroup?.type || 'OPS (Organisasi Pengelola Sarana / Sanitasi)');
  const [province, setProvince] = useState(editingGroup?.province || 'Kalimantan Barat');
  const [regency, setRegency] = useState(editingGroup?.regency || 'Kabupaten Landak');
  const [district, setDistrict] = useState(editingGroup?.district || '');
  const [village, setVillage] = useState(editingGroup?.village || 'Desa Menjalin');
  const [establishmentDate, setEstablishmentDate] = useState(editingGroup?.establishmentDate || new Date().toISOString().slice(0, 10));
  const [legalStatus, setLegalStatus] = useState(editingGroup?.legalStatus || 'SK Kepala Desa');
  const [legalDocumentNumber, setLegalDocumentNumber] = useState(editingGroup?.legalDocumentNumber || '');
  const [leaderName, setLeaderName] = useState(editingGroup?.leaderName || '');
  const [leaderPhone, setLeaderPhone] = useState(editingGroup?.leaderPhone || '');
  const [focusArea, setFocusArea] = useState(editingGroup?.focusArea || '');
  const [status, setStatus] = useState<'Aktif' | 'Mandiri' | 'Rintisan / Pemula' | 'Perlu Penguatan' | 'Nonaktif'>(editingGroup?.status || 'Aktif');
  const [notes, setNotes] = useState(editingGroup?.notes || '');

  // Auto-generate suggested code when type or village changes if empty
  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (!editingGroup && (!code || code.startsWith('GRP-') || code.startsWith('OPS-') || code.startsWith('POKJA-') || code.startsWith('BS-') || code.startsWith('KADER-') || code.startsWith('POKDARWIS-') || code.startsWith('KWT-') || code.startsWith('KUPS-'))) {
      let prefix = 'GRP-';
      if (newType.includes('OPS')) prefix = 'OPS-';
      else if (newType.includes('POKJA')) prefix = 'POKJA-';
      else if (newType.includes('KADER')) prefix = 'KADER-SBCC-';
      else if (newType.includes('Bank Sampah')) prefix = 'BS-';
      else if (newType.includes('Pokdarwis')) prefix = 'POKDARWIS-';
      else if (newType.includes('Tani') || newType.includes('KWT')) prefix = 'KWT-';
      else if (newType.includes('KUPS')) prefix = 'KUPS-';
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      setCode(`${prefix}${randomSuffix}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !village.trim()) {
      alert(isId ? 'Mohon lengkapi kode kelompok, nama kelompok, dan desa.' : 'Please fill in required fields.');
      return;
    }

    const payload: AccompaniedGroup = {
      id: editingGroup ? editingGroup.id : `grp-${Date.now()}`,
      projectId,
      code: code.trim(),
      name: name.trim(),
      type,
      province,
      regency,
      district,
      village,
      establishmentDate,
      legalStatus,
      legalDocumentNumber: legalDocumentNumber.trim(),
      leaderName: leaderName.trim(),
      leaderPhone: leaderPhone.trim(),
      focusArea: focusArea.trim(),
      status,
      notes: notes.trim(),
      members: editingGroup ? editingGroup.members : [],
      createdAt: editingGroup ? editingGroup.createdAt : new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              {editingGroup ? (isId ? 'Ubah Data Kelompok' : 'Edit Group Data') : (isId ? 'Registrasi Kelompok Dampingan Baru' : 'Register New Facilitated Group')}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {editingGroup ? editingGroup.name : (isId ? 'Formulir Kelompok / Komunitas Dampingan' : 'Accompanied Group Setup')}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Proyek & Jenis Kelompok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isId ? 'Proyek Terkait *:' : 'Associated Project *:'}
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isId ? 'Seluruh Portofolio / Multi-Proyek' : 'All Projects / Multi-Project'}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>[{p.code}] {p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isId ? 'Jenis Kelompok / Organisasi *:' : 'Group Category *:'}
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {GROUP_TYPES.map(gt => (
                  <option key={gt} value={gt}>{gt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kode & Nama Kelompok */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isId ? 'Kode Kelompok *:' : 'Group Code *:'}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. OPS-01"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                {isId ? 'Nama Lengkap Kelompok / Komunitas *:' : 'Full Group / Community Name *:'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isId ? 'Contoh: OPS Tirta Lestari Desa Mahu / Bank Sampah Berkah Sejahtera' : 'e.g. Clean Water CBO...'}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Wilayah / Lokasi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Provinsi:' : 'Province:'}</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Kabupaten/Kota:' : 'Regency:'}</label>
              <input
                type="text"
                value={regency}
                onChange={(e) => setRegency(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Kecamatan:' : 'District:'}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Kecamatan..."
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Desa/Kelurahan *:' : 'Village *:'}</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Nama Desa..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold"
              />
            </div>
          </div>

          {/* Legalitas SK & Tanggal Pembentukan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Status Legalitas:' : 'Legal Status:'}</label>
              <select
                value={legalStatus}
                onChange={(e) => setLegalStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold"
              >
                <option value="SK Kepala Desa">SK Kepala Desa</option>
                <option value="SK Camat">SK Camat</option>
                <option value="SK Bupati">SK Bupati</option>
                <option value="Akta Notaris / Kemenkumham">Akta Notaris / Kemenkumham</option>
                <option value="Belum Berbadan Hukum / Informal">Belum Berbadan Hukum / Informal</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Nomor SK / Izin Legalitas:' : 'SK Number:'}</label>
              <input
                type="text"
                value={legalDocumentNumber}
                onChange={(e) => setLegalDocumentNumber(e.target.value)}
                placeholder="e.g. 140/05/SK-KADES/2024"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Tanggal Pembentukan:' : 'Est. Date:'}</label>
              <input
                type="date"
                value={establishmentDate}
                onChange={(e) => setEstablishmentDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Ketua & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Nama Ketua / Koordinator:' : 'Leader Name:'}</label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder={isId ? 'Nama lengkap ketua kelompok...' : 'Leader full name...'}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Nomor HP / WhatsApp:' : 'Leader Phone:'}</label>
              <input
                type="text"
                value={leaderPhone}
                onChange={(e) => setLeaderPhone(e.target.value)}
                placeholder="0812xxxx"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Bidang Fokus & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                {isId ? 'Bidang Fokus / Program Kerja Dampingan:' : 'Focus Area & Scope:'}
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder={isId ? 'Contoh: Pengelolaan Sampah Plastik Sirkular & Pemilahan Rumah Tangga' : 'e.g. Behavior change, waste management, etc.'}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{isId ? 'Status Kelompok:' : 'Group Status:'}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold"
              >
                <option value="Aktif">Aktif</option>
                <option value="Mandiri">Mandiri</option>
                <option value="Rintisan / Pemula">Rintisan / Pemula</option>
                <option value="Perlu Penguatan">Perlu Penguatan</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">{isId ? 'Catatan / Keterangan Tambahan:' : 'Notes / Description:'}</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isId ? 'Informasi riwayat pembinaan, fasilitas yang dikelola, atau kemitraan...' : 'Additional notes...'}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              {isId ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              {editingGroup ? (isId ? 'Simpan Perubahan' : 'Save Changes') : (isId ? 'Simpan Kelompok' : 'Save Group')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
