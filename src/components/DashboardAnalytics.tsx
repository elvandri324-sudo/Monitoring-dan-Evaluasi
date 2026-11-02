import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  TreePine, 
  Layers, 
  Filter, 
  Sparkles, 
  Download,
  AlertCircle,
  HelpCircle,
  BarChart2,
  Calendar,
  CheckCircle,
  RefreshCcw,
  Building,
  MapPin,
  Compass
} from 'lucide-react';
import { Project, Beneficiary, ActivityAttendance } from '../types';
import { calculateDisaggregations, calculateLogframeProgress } from '../services/meEngine';
import { useLanguage } from '../context/LanguageContext';
import { formatTargetGroup, formatBeneficiaryLevel } from '../utils/bilingual';

interface DashboardAnalyticsProps {
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  onOpenReportModal: () => void;
  onNavigateToBeneficiaries: () => void;
}

const GENDER_COLORS = ['#3b82f6', '#ec4899'];
const AGE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
const IPLC_COLORS = ['#059669', '#0d9488', '#64748b'];
const DISABILITY_COLORS = ['#f43f5e', '#e2e8f0'];
const TARGET_GROUP_COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b'];
const LEVEL_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f43f5e'];

export default function DashboardAnalytics({
  projects,
  beneficiaries,
  attendances,
  selectedProjectId,
  setSelectedProjectId,
  onOpenReportModal,
  onNavigateToBeneficiaries
}: DashboardAnalyticsProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  // Local filter states
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all');
  const [filterDisability, setFilterDisability] = useState<string>('all');
  const [filterIplc, setFilterIplc] = useState<string>('all');
  const [filterTargetGroup, setFilterTargetGroup] = useState<string>('all');
  const [filterBeneficiaryLevel, setFilterBeneficiaryLevel] = useState<string>('all');
  const [disabilityViewMode, setDisabilityViewMode] = useState<'types' | 'difficulty'>('types');
  const [indicatorLevelFilter, setIndicatorLevelFilter] = useState<'ALL' | 'Goal' | 'Outcome' | 'Output'>('ALL');

  // Filtered beneficiaries based on active filters
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter(b => {
      if (filterGender !== 'all' && b.gender !== filterGender) return false;
      if (filterAgeGroup !== 'all' && b.ageGroup !== filterAgeGroup) return false;
      if (filterDisability === 'yes' && !b.hasDisability) return false;
      if (filterDisability === 'no' && b.hasDisability) return false;
      if (filterIplc === 'ip' && b.iplcStatus !== 'Masyarakat Adat (Indigenous Peoples)') return false;
      if (filterIplc === 'lc' && b.iplcStatus !== 'Komunitas Lokal (Local Communities)') return false;
      if (filterIplc === 'non' && b.iplcStatus !== 'Bukan IPLC (Non-IPLC)') return false;
      if (filterTargetGroup !== 'all') {
        const tg = b.targetGroup || 'Population of the project communities';
        if (tg !== filterTargetGroup) return false;
      }
      if (filterBeneficiaryLevel !== 'all') {
        const lvl = b.beneficiaryLevel || 'Desa';
        if (lvl !== filterBeneficiaryLevel) return false;
      }
      return true;
    });
  }, [beneficiaries, filterGender, filterAgeGroup, filterDisability, filterIplc, filterTargetGroup, filterBeneficiaryLevel]);

  // Compute standard disaggregation summary
  const summary = useMemo(() => {
    return calculateDisaggregations(
      filteredBeneficiaries,
      attendances,
      selectedProjectId
    );
  }, [filteredBeneficiaries, attendances, selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const logframeStats = selectedProject 
    ? calculateLogframeProgress(selectedProject)
    : { totalIndicators: 0, averageAchievement: 0, achievedCount: 0, onTrackCount: 0, delayedCount: 0 };

  // Data for Age x Gender Chart
  const ageGenderData = useMemo(() => {
    const groups = ['0-14', '15-24', '25-64', '65+'] as const;
    let scopedAttendances = attendances;
    if (selectedProjectId !== 'all') {
      scopedAttendances = scopedAttendances.filter(a => a.projectId === selectedProjectId);
    }
    const scopedBeneficiaryIds = new Set(scopedAttendances.map(a => a.beneficiaryId));
    const scopedBeneficiaries = filteredBeneficiaries.filter(b => scopedBeneficiaryIds.has(b.id));

    return groups.map(grp => {
      const male = scopedBeneficiaries.filter(b => b.ageGroup === grp && b.gender === 'Laki-laki').length;
      const female = scopedBeneficiaries.filter(b => b.ageGroup === grp && b.gender === 'Perempuan').length;
      return {
        ageGroup: grp === '0-14' 
          ? (isId ? '0-14 (Anak)' : '0-14 (Child)') 
          : grp === '15-24' 
          ? (isId ? '15-24 (Pemuda)' : '15-24 (Youth)') 
          : grp === '25-64' 
          ? (isId ? '25-64 (Dewasa)' : '25-64 (Adult)') 
          : (isId ? '65+ (Lansia)' : '65+ (Elderly)'),
        LakiLaki: male,
        Perempuan: female,
        Total: male + female
      };
    });
  }, [filteredBeneficiaries, attendances, selectedProjectId, isId]);

  // Data for IPLC Pie Chart
  const iplcPieData = [
    { name: isId ? 'Masyarakat Adat (IP)' : 'Indigenous Peoples (IP)', value: summary.iplcBreakdown.indigenousPeoples },
    { name: isId ? 'Komunitas Lokal (LC)' : 'Local Communities (LC)', value: summary.iplcBreakdown.localCommunities },
    { name: isId ? 'Bukan IPLC' : 'Non-IPLC', value: summary.iplcBreakdown.nonIplc }
  ].filter(d => d.value > 0);

  // Data for Target Group Chart
  const targetGroupPieData = useMemo(() => [
    { 
      name: isId ? 'Warga Komunitas Dampingan' : 'Project Communities', 
      rawName: 'Population of the project communities',
      value: summary.targetGroupBreakdown.population, 
      pct: summary.targetGroupBreakdown.percentPopulation 
    },
    { 
      name: isId ? 'Aparatur / Dinas (Pemda/OPD)' : 'Gov / Administrations', 
      rawName: 'Actors in the municipal, district and provincial administrations',
      value: summary.targetGroupBreakdown.administrations, 
      pct: summary.targetGroupBreakdown.percentAdministrations 
    },
    { 
      name: isId ? 'Lembaga Perantara (LSM/CSO)' : 'Intermediaries (CSOs/NGOs)', 
      rawName: 'Intermediaries: NGOs / CSOs',
      value: summary.targetGroupBreakdown.intermediaries, 
      pct: summary.targetGroupBreakdown.percentIntermediaries 
    },
    { 
      name: isId ? 'Lainnya (Other)' : 'Other', 
      rawName: 'Other',
      value: summary.targetGroupBreakdown.other, 
      pct: summary.targetGroupBreakdown.percentOther 
    }
  ].filter(d => d.value > 0), [summary.targetGroupBreakdown, isId]);

  // Data for Beneficiary Level Chart
  const levelBarData = useMemo(() => [
    { 
      level: isId ? 'Desa' : 'Village', 
      rawLevel: 'Desa',
      count: summary.beneficiaryLevelBreakdown.desa,
      percent: summary.totalUniqueBeneficiaries > 0 ? Math.round((summary.beneficiaryLevelBreakdown.desa / summary.totalUniqueBeneficiaries) * 100) : 0
    },
    { 
      level: isId ? 'Kecamatan' : 'Sub-District', 
      rawLevel: 'Kecamatan',
      count: summary.beneficiaryLevelBreakdown.kecamatan,
      percent: summary.totalUniqueBeneficiaries > 0 ? Math.round((summary.beneficiaryLevelBreakdown.kecamatan / summary.totalUniqueBeneficiaries) * 100) : 0
    },
    { 
      level: isId ? 'Kabupaten' : 'District/Regency', 
      rawLevel: 'Kabupaten',
      count: summary.beneficiaryLevelBreakdown.kabupaten,
      percent: summary.totalUniqueBeneficiaries > 0 ? Math.round((summary.beneficiaryLevelBreakdown.kabupaten / summary.totalUniqueBeneficiaries) * 100) : 0
    },
    { 
      level: isId ? 'Provinsi' : 'Province', 
      rawLevel: 'Provinsi',
      count: summary.beneficiaryLevelBreakdown.provinsi,
      percent: summary.totalUniqueBeneficiaries > 0 ? Math.round((summary.beneficiaryLevelBreakdown.provinsi / summary.totalUniqueBeneficiaries) * 100) : 0
    },
    { 
      level: isId ? 'Nasional' : 'National', 
      rawLevel: 'Nasional',
      count: summary.beneficiaryLevelBreakdown.nasional,
      percent: summary.totalUniqueBeneficiaries > 0 ? Math.round((summary.beneficiaryLevelBreakdown.nasional / summary.totalUniqueBeneficiaries) * 100) : 0
    }
  ], [summary.beneficiaryLevelBreakdown, summary.totalUniqueBeneficiaries, isId]);

  // Data for Disability Barriers Bar Chart
  const disabilityBarriersData = useMemo(() => {
    return Object.entries(summary.disabilityBreakdown.barriers).map(([barrier, count]) => ({
      barrier: barrier.replace(' / ', '/'),
      Jumlah: count
    }));
  }, [summary]);

  // Data for Disability Difficulty Levels (Washington Group Scale 1-6)
  const disabilityDifficultyData = useMemo(() => {
    const scaleOrder = [
      '1. Extremely difficult',
      '2. Very difficult',
      '3. Fairly difficult',
      '4. Slightly difficult',
      '5. Almost no difficulty',
      '6. No difficulty'
    ];
    return scaleOrder.map(scale => {
      const labelId = scale === '1. Extremely difficult' ? '1. Sangat Berat / Ekstrem'
        : scale === '2. Very difficult' ? '2. Berat (Very Difficult)'
        : scale === '3. Fairly difficult' ? '3. Sedang (Fairly Difficult)'
        : scale === '4. Slightly difficult' ? '4. Ringan (Slightly Difficult)'
        : scale === '5. Almost no difficulty' ? '5. Sangat Ringan'
        : '6. Tanpa Hambatan';
      const count = summary.disabilityBreakdown.difficultyLevels?.[scale] || 0;
      return {
        level: isId ? labelId : scale,
        rawLevel: scale,
        Jumlah: count
      };
    }).filter(d => d.Jumlah > 0 || summary.disabilityBreakdown.disabilityCount > 0);
  }, [summary, isId]);

  // Indicator Performance Data for Project
  const indicatorsComparisonData = useMemo(() => {
    const list: { name: string; target: number; actual: number; code: string; percent: number; level: string }[] = [];
    const targetProjects = selectedProject ? [selectedProject] : projects;

    targetProjects.forEach(p => {
      if (indicatorLevelFilter === 'ALL' || indicatorLevelFilter === 'Goal') {
        p.goalIndicators?.forEach(ind => {
          list.push({
            code: `${selectedProject ? '' : p.code + ' '}${ind.code}`,
            name: ind.name.length > 28 ? ind.name.substring(0, 28) + '...' : ind.name,
            target: ind.target,
            actual: ind.actual,
            percent: Math.min(120, Math.round((ind.actual / (ind.target || 1)) * 100)),
            level: 'Goal / Impact'
          });
        });
      }

      if (indicatorLevelFilter === 'ALL' || indicatorLevelFilter === 'Outcome') {
        p.outcomes.forEach(oc => {
          oc.indicators.forEach(ind => {
            list.push({
              code: `${selectedProject ? '' : p.code + ' '}${ind.code}`,
              name: ind.name.length > 28 ? ind.name.substring(0, 28) + '...' : ind.name,
              target: ind.target,
              actual: ind.actual,
              percent: Math.min(120, Math.round((ind.actual / (ind.target || 1)) * 100)),
              level: 'Outcome'
            });
          });
        });
      }

      if (indicatorLevelFilter === 'Output') {
        p.outcomes.forEach(oc => {
          oc.outputs.forEach(op => {
            op.indicators.forEach(ind => {
              list.push({
                code: `${selectedProject ? '' : p.code + ' '}${ind.code}`,
                name: ind.name.length > 28 ? ind.name.substring(0, 28) + '...' : ind.name,
                target: ind.target,
                actual: ind.actual,
                percent: Math.min(120, Math.round((ind.actual / (ind.target || 1)) * 100)),
                level: 'Output'
              });
            });
          });
        });
      }
    });

    return list.slice(0, 8);
  }, [selectedProject, projects, indicatorLevelFilter]);

  const deduplicationRate = summary.totalGrossParticipation > 0 
    ? Math.round(((summary.totalGrossParticipation - summary.totalUniqueBeneficiaries) / summary.totalGrossParticipation) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col items-stretch justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            {isId ? 'Filter Analitik:' : 'Analytics Filter:'}
          </span>

          {/* Project Selector */}
          <select
            id="dash-filter-project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">{isId ? '🌐 Seluruh Proyek (Portofolio Nasional)' : '🌐 All Projects (National Portfolio)'}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
            ))}
          </select>

          {/* Target Group Filter */}
          <select
            id="dash-filter-target-group"
            value={filterTargetGroup}
            onChange={(e) => setFilterTargetGroup(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="all">{isId ? 'Semua Target Group' : 'All Target Groups'}</option>
            <option value="Population of the project communities">{isId ? 'Warga Komunitas Dampingan' : 'Project Communities'}</option>
            <option value="Actors in the municipal, district and provincial administrations">{isId ? 'Aparatur / Dinas (Pemda/OPD)' : 'Gov / Administrations'}</option>
            <option value="Intermediaries: NGOs / CSOs">{isId ? 'Lembaga Perantara (LSM/CSO)' : 'Intermediaries (NGOs/CSOs)'}</option>
            <option value="Other">{isId ? 'Lainnya (Other)' : 'Other'}</option>
          </select>

          {/* Beneficiary Level Filter */}
          <select
            id="dash-filter-level"
            value={filterBeneficiaryLevel}
            onChange={(e) => setFilterBeneficiaryLevel(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="all">{isId ? 'Semua Level Dampingan' : 'All Beneficiary Levels'}</option>
            <option value="Desa">{isId ? 'Tingkat Desa' : 'Village Level'}</option>
            <option value="Kecamatan">{isId ? 'Tingkat Kecamatan' : 'Sub-District Level'}</option>
            <option value="Kabupaten">{isId ? 'Tingkat Kabupaten' : 'District Level'}</option>
            <option value="Provinsi">{isId ? 'Tingkat Provinsi' : 'Provincial Level'}</option>
            <option value="Nasional">{isId ? 'Tingkat Nasional' : 'National Level'}</option>
          </select>

          {/* Gender Filter */}
          <select
            id="dash-filter-gender"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">{isId ? 'Semua Gender' : 'All Genders'}</option>
            <option value="Perempuan">{isId ? 'Perempuan' : 'Female'}</option>
            <option value="Laki-laki">{isId ? 'Laki-laki' : 'Male'}</option>
          </select>

          {/* Age Group Filter */}
          <select
            id="dash-filter-age"
            value={filterAgeGroup}
            onChange={(e) => setFilterAgeGroup(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">{isId ? 'Semua Usia' : 'All Ages'}</option>
            <option value="0-14">{isId ? '0-14 Tahun (Anak-anak)' : '0-14 Years (Children)'}</option>
            <option value="15-24">{isId ? '15-24 Tahun (Pemuda)' : '15-24 Years (Youth)'}</option>
            <option value="25-64">{isId ? '25-64 Tahun (Dewasa)' : '25-64 Years (Adults)'}</option>
            <option value="65+">{isId ? '65+ Tahun (Lansia)' : '65+ Years (Elderly)'}</option>
          </select>

          {/* Disability Filter */}
          <select
            id="dash-filter-disability"
            value={filterDisability}
            onChange={(e) => setFilterDisability(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">{isId ? 'Semua Status Disabilitas' : 'All Disability Statuses'}</option>
            <option value="yes">{isId ? 'Penyandang Disabilitas' : 'Persons with Disability'}</option>
            <option value="no">{isId ? 'Non-Disabilitas' : 'Non-Disability'}</option>
          </select>

          {/* IPLC Filter */}
          <select
            id="dash-filter-iplc"
            value={filterIplc}
            onChange={(e) => setFilterIplc(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">{isId ? 'Semua Status IPLC' : 'All IPLC Statuses'}</option>
            <option value="ip">{isId ? 'Masyarakat Adat (IP)' : 'Indigenous Peoples (IP)'}</option>
            <option value="lc">{isId ? 'Komunitas Lokal (LC)' : 'Local Communities (LC)'}</option>
            <option value="non">{isId ? 'Bukan IPLC' : 'Non-IPLC'}</option>
          </select>

          {(filterGender !== 'all' || filterAgeGroup !== 'all' || filterDisability !== 'all' || filterIplc !== 'all' || filterTargetGroup !== 'all' || filterBeneficiaryLevel !== 'all') && (
            <button
              onClick={() => {
                setFilterGender('all');
                setFilterAgeGroup('all');
                setFilterDisability('all');
                setFilterIplc('all');
                setFilterTargetGroup('all');
                setFilterBeneficiaryLevel('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 px-2 py-1 bg-rose-50 rounded"
            >
              <RefreshCcw className="w-3 h-3" /> {isId ? 'Reset Filter' : 'Reset Filters'}
            </button>
          )}

          <div className="ml-auto">
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isId ? 'Ekspor M&E Summary' : 'Export M&E Summary'}
            </button>
          </div>
        </div>
      </div>

      {/* Zero Double Counting Banner & KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Anti Double Counting Counter */}
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-xl p-5 border border-emerald-800 shadow-md relative overflow-hidden">
          <div className="absolute right-2 -bottom-6 w-36 h-36 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isId ? 'Sistem Anti Double-Counting Aktif' : 'Anti Double-Counting Active'}
            </span>
            <span className="text-[11px] text-slate-300">
              {isId ? 'Deduplikasi via NIK / ID Unik' : 'Deduplicated via National ID / Unique ID'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            <div>
              <span className="text-xs text-slate-300 block">{isId ? 'Penerima Manfaat Unik (Net):' : 'Unique Beneficiaries (Net):'}</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {summary.totalUniqueBeneficiaries.toLocaleString(isId ? 'id-ID' : 'en-US')}
                <span className="text-sm font-normal text-emerald-300 ml-1">{isId ? 'orang' : 'people'}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-300 block">{isId ? 'Total Partisipasi (Gross):' : 'Total Participation (Gross):'}</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-300">
                {summary.totalGrossParticipation.toLocaleString(isId ? 'id-ID' : 'en-US')}
                <span className="text-sm font-normal text-slate-400 ml-1">{isId ? 'kehadiran' : 'attendances'}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-800/80 flex items-center justify-between text-xs text-slate-200">
            <span>
              <strong>{summary.repeatedParticipantsCount}</strong> {isId ? `orang mengikuti lebih dari 1 kegiatan (${deduplicationRate}% deduplikasi)` : `people attended >1 activity (${deduplicationRate}% deduplication)`}
            </span>
            <button
              onClick={onNavigateToBeneficiaries}
              className="text-emerald-300 hover:text-white underline text-xs font-medium"
            >
              {isId ? 'Lihat Roster Penerima Manfaat →' : 'View Beneficiary Roster →'}
            </button>
          </div>
        </div>

        {/* Target Group & Level KPI Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>{isId ? 'Target Group Proyek' : 'Project Target Group'}</span>
              <Building className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 truncate max-w-[150px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span> {isId ? 'Warga Komunitas:' : 'Communities:'}
                </span>
                <span className="font-bold text-slate-900">
                  {summary.targetGroupBreakdown.population} ({summary.targetGroupBreakdown.percentPopulation}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 truncate max-w-[150px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span> {isId ? 'Aparatur / Pemda:' : 'Gov / OPD:'}
                </span>
                <span className="font-bold text-slate-900">
                  {summary.targetGroupBreakdown.administrations} ({summary.targetGroupBreakdown.percentAdministrations}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 truncate max-w-[150px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0"></span> {isId ? 'Lembaga Perantara:' : 'Intermediaries:'}
                </span>
                <span className="font-bold text-slate-900">
                  {summary.targetGroupBreakdown.intermediaries} ({summary.targetGroupBreakdown.percentIntermediaries}%)
                </span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
            <span>{isId ? 'Tingkat Dampingan:' : 'Level:'}</span>
            <span className="font-semibold text-slate-700">
              {summary.beneficiaryLevelBreakdown.desa} {isId ? 'Desa' : 'Villages'}, {summary.beneficiaryLevelBreakdown.kecamatan + summary.beneficiaryLevelBreakdown.kabupaten + summary.beneficiaryLevelBreakdown.provinsi + summary.beneficiaryLevelBreakdown.nasional} {isId ? 'Instansi/Lainnya' : 'Agencies/Others'}
            </span>
          </div>
        </div>

        {/* GESI & IPLC Highlights */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>{isId ? 'Inklusi GESI & IPLC' : 'GESI & IPLC Inclusion'}</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="space-y-1.5 mt-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> {isId ? 'Perempuan:' : 'Female:'}
                </span>
                <span className="font-bold text-slate-900">
                  {summary.genderBreakdown.perempuan} ({summary.genderBreakdown.percentPerempuan}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {isId ? 'Disabilitas:' : 'Disability:'}
                </span>
                <span className="font-bold text-slate-900">
                  {summary.disabilityBreakdown.disabilityCount} ({summary.disabilityBreakdown.percentDisability}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {isId ? 'Masyarakat Adat & Lokal:' : 'IPLC:'}
                </span>
                <span className="font-bold text-slate-900">
                  {summary.iplcBreakdown.indigenousPeoples + summary.iplcBreakdown.localCommunities} ({summary.iplcBreakdown.percentIplcTotal}%)
                </span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            {isId ? 'Disagregasi lengkap terintegrasi' : 'Complete integrated disaggregation'}
          </div>
        </div>
      </div>

      {/* NEW SECTION: TARGET GROUP & BENEFICIARY LEVEL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Target Group Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                {isId ? 'Grafik Distribusi Target Group (Kelompok Sasaran Proyek)' : 'Target Group Distribution Chart'}
              </h3>
              <p className="text-xs text-slate-500">
                {isId 
                  ? 'Komposisi penerima manfaat unik berdasarkan kelompok sasaran standar proyek' 
                  : 'Breakdown of unique beneficiaries by standard project target groups'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              {summary.totalUniqueBeneficiaries} {isId ? 'Total Unik' : 'Unique Total'}
            </span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetGroupPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, pct }) => `${pct}%`}
                >
                  {targetGroupPieData.map((_, index) => (
                    <Cell key={`tg-cell-${index}`} fill={TARGET_GROUP_COLORS[index % TARGET_GROUP_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, item: any) => [
                    `${value} ${isId ? 'orang' : 'people'} (${item.payload.pct}%)`, 
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Target Group Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {targetGroupPieData.map((tg, idx) => (
              <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-2">
                <span 
                  className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" 
                  style={{ backgroundColor: TARGET_GROUP_COLORS[idx % TARGET_GROUP_COLORS.length] }}
                ></span>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-slate-700 block truncate">{tg.name}</span>
                  <span className="text-xs font-bold text-slate-900">{tg.value} {isId ? 'orang' : 'pax'} ({tg.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart B: Beneficiary Level (Tingkat Dampingan) Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                {isId ? 'Grafik Level of Beneficiaries (Tingkat Wilayah / Lembaga)' : 'Level of Beneficiaries Distribution Chart'}
              </h3>
              <p className="text-xs text-slate-500">
                {isId 
                  ? 'Distribusi tingkat intervensi: Desa, Kecamatan, Kabupaten, Provinsi, Nasional' 
                  : 'Intervention levels: Village, Sub-District, District, Province, National'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              5 {isId ? 'Tingkat Dampingan' : 'Levels'}
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelBarData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} ${isId ? 'orang' : 'people'}`, isId ? 'Penerima Manfaat' : 'Beneficiaries']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name={isId ? 'Jumlah Penerima Manfaat' : 'Beneficiaries Count'} radius={[4, 4, 0, 0]}>
                  {levelBarData.map((_, index) => (
                    <Cell key={`lvl-cell-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Level Summary Pills */}
          <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-slate-100 text-center">
            {levelBarData.map((lvl, idx) => (
              <div key={idx} className="bg-slate-50 p-1.5 rounded-lg">
                <span className="text-[10px] text-slate-500 font-medium block truncate">{lvl.level}</span>
                <span className="text-xs font-bold text-slate-900">{lvl.count}</span>
                <span className="text-[9px] text-slate-400 block">{lvl.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid: Age, Gender, IPLC, Disabilities, Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Age Groups Disaggregation with Gender Stack */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isId ? 'Disagregasi Kelompok Usia (0-14, 15-24, 25-64, 65+) & Gender' : 'Age Groups Disaggregation (0-14, 15-24, 25-64, 65+) & Gender'}
              </h3>
              <p className="text-xs text-slate-500">{isId ? 'Distribusi penerima manfaat unik berdasarkan kelompok usia standar' : 'Distribution of unique beneficiaries by standard age groups'}</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
              {isId ? 'Unik (No Duplikat)' : 'Unique (No Duplicates)'}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGenderData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="ageGroup" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="LakiLaki" name={isId ? 'Laki-laki' : 'Male'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Perempuan" name={isId ? 'Perempuan' : 'Female'} fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
            {Object.entries(summary.ageGroupBreakdown).map(([grp, count]) => (
              <div key={grp} className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 font-medium block">{isId ? `Usia ${grp}` : `Age ${grp}`}</span>
                <span className="text-sm font-bold text-slate-900">{count} {isId ? 'org' : 'pax'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: IPLC Community Status */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isId ? 'Distribusi Status IPLC (Masyarakat Adat & Komunitas Lokal)' : 'IPLC Status Distribution (Indigenous Peoples & Local Communities)'}
              </h3>
              <p className="text-xs text-slate-500">{isId ? 'Proporsi keikutsertaan masyarakat adat dan komunitas lokal' : 'Proportion of indigenous peoples and local community participation'}</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              {summary.iplcBreakdown.percentIplcTotal}% IPLC
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={iplcPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {iplcPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={IPLC_COLORS[index % IPLC_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Indigenous Communities Table */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-1.5">
              {isId ? 'Komunitas / Suku Adat Terdaftar:' : 'Registered Indigenous / Traditional Communities:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {summary.iplcBreakdown.topCommunities.map((item, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                >
                  {item.name} ({item.count} {isId ? 'penerima' : 'recipients'})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Disability Barriers Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isId ? 'Penyandang Disabilitas & Tingkat Kesulitan' : 'Disability Barriers & Difficulty Scale'}
              </h3>
              <p className="text-xs text-slate-500">
                {disabilityViewMode === 'types' 
                  ? (isId ? 'Ragam jenis hambatan untuk akomodasi yang layak' : 'Specific barrier types recorded for accommodation')
                  : (isId ? 'Skala tingkat kesulitan Washington Group (Scale 1-6)' : 'Washington Group difficulty severity scale (1-6)')}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setDisabilityViewMode('types')}
                  className={`px-2 py-1 rounded-md transition ${disabilityViewMode === 'types' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {isId ? 'Ragam Jenis' : 'Barrier Types'}
                </button>
                <button
                  onClick={() => setDisabilityViewMode('difficulty')}
                  className={`px-2 py-1 rounded-md transition ${disabilityViewMode === 'difficulty' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {isId ? 'Tingkat Kesulitan (WG)' : 'Difficulty Scale'}
                </button>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                {summary.disabilityBreakdown.disabilityCount} {isId ? 'Orang' : 'Pax'}
              </span>
            </div>
          </div>

          {disabilityViewMode === 'types' ? (
            disabilityBarriersData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disabilityBarriersData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="barrier" width={110} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="Jumlah" name={isId ? 'Jumlah' : 'Count'} fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic">
                {isId ? 'Belum ada partisipan disabilitas pada filter yang dipilih' : 'No disability participants recorded under selected filter'}
              </div>
            )
          ) : (
            disabilityDifficultyData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disabilityDifficultyData} layout="vertical" margin={{ top: 5, right: 30, left: 55, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="level" width={140} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="Jumlah" name={isId ? 'Jumlah' : 'Count'} fill="#e11d48" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic">
                {isId ? 'Belum ada data tingkat kesulitan disabilitas' : 'No disability difficulty data available'}
              </div>
            )
          )}

          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-900 border border-amber-200/60 mt-2">
            <strong>{isId ? 'Catatan Akomodasi:' : 'Accommodation Note:'}</strong> {isId ? 'Setiap kegiatan menyediakan materi audio/visual untuk rungu/netra, serta akses fisik bertingkat (raised beds & ramp) bagi disabilitas mobilitas.' : 'All activities provide accessible audio/visual materials for deaf/blind participants, as well as physical accessibility (raised beds & ramps) for mobility needs.'}
          </div>
        </div>

        {/* Chart 4: Indicator Target vs Actual Comparison */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isId ? 'Kinerja Indikator Utama (Target vs Capaian Aktual)' : 'Key Indicator Performance (Target vs Actual Achievement)'}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedProject ? selectedProject.title : (isId ? 'Seluruh Indikator Kunci Proyek' : 'All Key Project Indicators')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setIndicatorLevelFilter('ALL')}
                  className={`px-2 py-1 rounded-md transition ${indicatorLevelFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {isId ? 'Semua' : 'All'}
                </button>
                <button
                  onClick={() => setIndicatorLevelFilter('Goal')}
                  className={`px-2 py-1 rounded-md transition ${indicatorLevelFilter === 'Goal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Goal/Impact
                </button>
                <button
                  onClick={() => setIndicatorLevelFilter('Outcome')}
                  className={`px-2 py-1 rounded-md transition ${indicatorLevelFilter === 'Outcome' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Outcome
                </button>
                <button
                  onClick={() => setIndicatorLevelFilter('Output')}
                  className={`px-2 py-1 rounded-md transition ${indicatorLevelFilter === 'Output' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Output
                </button>
              </div>
              {selectedProject && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  {isId ? `Rata-rata: ${logframeStats.averageAchievement}%` : `Average: ${logframeStats.averageAchievement}%`}
                </span>
              )}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorsComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="target" name={isId ? 'Target' : 'Target'} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name={isId ? 'Capaian Aktual' : 'Actual Achievement'} fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {indicatorsComparisonData.slice(0, 3).map((ind, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-slate-600 font-medium truncate max-w-[240px]">{ind.code}: {ind.name}</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {ind.percent}% {isId ? 'Capaian' : 'Achieved'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

