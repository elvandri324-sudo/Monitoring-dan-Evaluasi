import { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  TrendingUp, 
  HeartHandshake, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  TreePine, 
  Layers, 
  Lock, 
  Building, 
  ChevronRight,
  Eye,
  Info,
  Clock,
  Sparkles,
  BookOpen,
  Newspaper,
  ExternalLink,
  FileText,
  Video,
  Quote,
  Globe,
  Download,
  Bookmark,
  X,
  Lightbulb,
  Table as TableIcon,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Project, Beneficiary, ActivityAttendance, KnowledgeProduct, StoryOfChange, MediaCoverage, ProjectLearning } from '../types';
import { calculateDisaggregations, calculateLogframeProgress } from '../services/meEngine';
import { useLanguage } from '../context/LanguageContext';
import { exportIndicatorAchievementsToXLSX } from '../utils/exportXlsx';

interface PublicHomePageProps {
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  knowledgeProducts?: KnowledgeProduct[];
  storiesOfChange?: StoryOfChange[];
  mediaCoverages?: MediaCoverage[];
  learnings?: ProjectLearning[];
  onGoToAdmin: () => void;
}

const GENDER_COLORS = ['#3b82f6', '#ec4899'];
const AGE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
const IPLC_COLORS = ['#8b5cf6', '#10b981', '#94a3b8'];
const TARGET_GROUP_COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b'];
const LEVEL_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f43f5e'];

export default function PublicHomePage({
  projects,
  beneficiaries,
  attendances,
  knowledgeProducts = [],
  storiesOfChange = [],
  mediaCoverages = [],
  learnings = [],
  onGoToAdmin
}: PublicHomePageProps) {
  const { language, setLanguage } = useLanguage();
  const isId = language === 'id';

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [publicPubTab, setPublicPubTab] = useState<'products' | 'stories' | 'media' | 'learnings'>('products');
  const [selectedStoryModal, setSelectedStoryModal] = useState<StoryOfChange | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const targetProjects = selectedProjectId === 'all' ? projects : (activeProject ? [activeProject] : projects);

  // Compute Disaggregations
  const disaggSummary = useMemo(() => {
    return calculateDisaggregations(beneficiaries, attendances, selectedProjectId);
  }, [beneficiaries, attendances, selectedProjectId]);

  // Aggregate Key Metadata & Numbers
  const meta = useMemo(() => {
    let totalBudget = 0;
    let totalIndicators = 0;
    let reachedIndicators = 0;
    let totalSumPercent = 0;
    let countWithTarget = 0;

    targetProjects.forEach(p => {
      totalBudget += p.budgetTotal;
      p.goalIndicators?.forEach(ind => {
        totalIndicators++;
        if (ind.target > 0) {
          totalSumPercent += Math.min(100, (ind.actual / ind.target) * 100);
          countWithTarget++;
        }
        if (ind.actual >= ind.target && ind.target > 0) reachedIndicators++;
      });
      p.outcomes?.forEach(oc => {
        oc.indicators?.forEach(ind => {
          totalIndicators++;
          if (ind.target > 0) {
            totalSumPercent += Math.min(100, (ind.actual / ind.target) * 100);
            countWithTarget++;
          }
          if (ind.actual >= ind.target && ind.target > 0) reachedIndicators++;
        });
        oc.outputs?.forEach(op => {
          op.indicators?.forEach(ind => {
            totalIndicators++;
            if (ind.target > 0) {
              totalSumPercent += Math.min(100, (ind.actual / ind.target) * 100);
              countWithTarget++;
            }
            if (ind.actual >= ind.target && ind.target > 0) reachedIndicators++;
          });
        });
      });
    });

    const avgIndicatorProgress = countWithTarget > 0 ? Math.round(totalSumPercent / countWithTarget) : 0;

    let sectorLabel = isId 
      ? 'Semua Sektor (Kehutanan, Pangan, Pesisir & Inklusi Sosial)' 
      : 'All Sectors (Forestry, Food, Coastal & Social Inclusion)';
    let teamLeadLabel = isId 
      ? 'Seluruh Tim M&E & Mitra Pelaksana' 
      : 'All M&E Teams & Implementing Partners';
    let dateRange = '2024 - 2027 (Multi-Year)';

    if (activeProject) {
      sectorLabel = isId 
        ? `Sektor ${activeProject.province} (${activeProject.partnerOrg})`
        : `Sector ${activeProject.province} (${activeProject.partnerOrg})`;
      teamLeadLabel = activeProject.teamMembers?.[0]?.name || activeProject.partnerOrg;
      dateRange = `${activeProject.startDate.slice(0, 4)} - ${activeProject.endDate.slice(0, 4)}`;
    }

    return {
      totalBudget,
      avgIndicatorProgress,
      sectorLabel,
      teamLeadLabel,
      dateRange
    };
  }, [targetProjects, activeProject, isId]);

  // Chart datasets
  const genderChartData = useMemo(() => [
    { name: isId ? 'Laki-laki' : 'Male', value: disaggSummary.genderBreakdown.lakiLaki },
    { name: isId ? 'Perempuan' : 'Female', value: disaggSummary.genderBreakdown.perempuan },
  ], [disaggSummary, isId]);

  const ageChartData = useMemo(() => [
    { name: isId ? '0-14 Thn (Anak)' : '0-14 Yrs (Child)', count: disaggSummary.ageGroupBreakdown['0-14'] },
    { name: isId ? '15-24 Thn (Pemuda)' : '15-24 Yrs (Youth)', count: disaggSummary.ageGroupBreakdown['15-24'] },
    { name: isId ? '25-64 Thn (Dewasa)' : '25-64 Yrs (Adult)', count: disaggSummary.ageGroupBreakdown['25-64'] },
    { name: isId ? '65+ Thn (Lansia)' : '65+ Yrs (Elderly)', count: disaggSummary.ageGroupBreakdown['65+'] },
  ], [disaggSummary, isId]);

  const iplcChartData = useMemo(() => [
    { name: isId ? 'Masyarakat Adat' : 'Indigenous Peoples', value: disaggSummary.iplcBreakdown.indigenousPeoples },
    { name: isId ? 'Komunitas Lokal' : 'Local Communities', value: disaggSummary.iplcBreakdown.localCommunities },
    { name: 'Non-IPLC', value: disaggSummary.iplcBreakdown.nonIplc },
  ], [disaggSummary, isId]);

  // Target Group chart data
  const targetGroupChartData = useMemo(() => [
    { name: isId ? 'Warga Komunitas' : 'Communities', value: disaggSummary.targetGroupBreakdown.population, pct: disaggSummary.targetGroupBreakdown.percentPopulation },
    { name: isId ? 'Aparatur / Pemda' : 'Gov / OPD', value: disaggSummary.targetGroupBreakdown.administrations, pct: disaggSummary.targetGroupBreakdown.percentAdministrations },
    { name: isId ? 'Lembaga Perantara' : 'Intermediaries', value: disaggSummary.targetGroupBreakdown.intermediaries, pct: disaggSummary.targetGroupBreakdown.percentIntermediaries },
    { name: isId ? 'Lainnya (Other)' : 'Other', value: disaggSummary.targetGroupBreakdown.other, pct: disaggSummary.targetGroupBreakdown.percentOther },
  ].filter(d => d.value > 0), [disaggSummary.targetGroupBreakdown, isId]);

  // Beneficiary Level chart data
  const levelChartData = useMemo(() => [
    { level: isId ? 'Desa' : 'Village', count: disaggSummary.beneficiaryLevelBreakdown.desa },
    { level: isId ? 'Kecamatan' : 'Sub-District', count: disaggSummary.beneficiaryLevelBreakdown.kecamatan },
    { level: isId ? 'Kabupaten' : 'District', count: disaggSummary.beneficiaryLevelBreakdown.kabupaten },
    { level: isId ? 'Provinsi' : 'Province', count: disaggSummary.beneficiaryLevelBreakdown.provinsi },
    { level: isId ? 'Nasional' : 'National', count: disaggSummary.beneficiaryLevelBreakdown.nasional },
  ], [disaggSummary.beneficiaryLevelBreakdown, isId]);

  // Level filter for indicators tab on public page
  const [publicIndicatorLevelFilter, setPublicIndicatorLevelFilter] = useState<'ALL' | 'GOAL' | 'OUTCOME' | 'OUTPUT'>('ALL');

  // Key goal, outcome, and output indicators for public dashboard
  const keyIndicatorsData = useMemo(() => {
    const list: any[] = [];
    targetProjects.forEach(p => {
      // 1. Goal / Impact indicators
      (p.goalIndicators || []).forEach(ind => {
        list.push({
          code: ind.code,
          name: ind.name,
          target: ind.target,
          actual: ind.actual,
          unit: ind.unit,
          status: ind.status,
          level: 'Goal',
          levelLabel: isId ? 'Goal / Impact' : 'Goal / Impact',
          projectName: p.title
        });
      });

      // 2. Outcome indicators
      p.outcomes.forEach(oc => {
        oc.indicators.forEach(ind => {
          list.push({
            code: ind.code,
            name: ind.name,
            target: ind.target,
            actual: ind.actual,
            unit: ind.unit,
            status: ind.status,
            level: 'Outcome',
            levelLabel: isId ? 'Outcome' : 'Outcome',
            projectName: p.title
          });
        });

        // 3. Output indicators
        (oc.outputs || []).forEach(op => {
          (op.indicators || []).forEach(ind => {
            list.push({
              code: ind.code,
              name: ind.name,
              target: ind.target,
              actual: ind.actual,
              unit: ind.unit,
              status: ind.status,
              level: 'Output',
              levelLabel: isId ? 'Output' : 'Output',
              projectName: p.title
            });
          });
        });
      });
    });
    return list;
  }, [targetProjects, isId]);

  // Filtered indicators based on selected level tab
  const filteredPublicIndicators = useMemo(() => {
    if (publicIndicatorLevelFilter === 'ALL') return keyIndicatorsData;
    if (publicIndicatorLevelFilter === 'GOAL') return keyIndicatorsData.filter(d => d.level === 'Goal');
    if (publicIndicatorLevelFilter === 'OUTCOME') return keyIndicatorsData.filter(d => d.level === 'Outcome');
    if (publicIndicatorLevelFilter === 'OUTPUT') return keyIndicatorsData.filter(d => d.level === 'Output');
    return keyIndicatorsData;
  }, [keyIndicatorsData, publicIndicatorLevelFilter]);

  // Indicator level counts
  const indicatorCounts = useMemo(() => ({
    all: keyIndicatorsData.length,
    goal: keyIndicatorsData.filter(d => d.level === 'Goal').length,
    outcome: keyIndicatorsData.filter(d => d.level === 'Outcome').length,
    output: keyIndicatorsData.filter(d => d.level === 'Output').length,
  }), [keyIndicatorsData]);

  // Export public indicators to Excel
  const handleExportPublicIndicators = () => {
    const filename = `Capaian_Indikator_Publik_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportIndicatorAchievementsToXLSX({
      projects: targetProjects,
      projectName: selectedProjectId === 'all' ? 'Seluruh Portofolio Program & Proyek' : `[${activeProject?.code}] ${activeProject?.title}`,
      filename
    });
  };

  // Calendar activities list
  const allActivities = useMemo(() => {
    const list: {
      id: string;
      code: string;
      title: string;
      location: string;
      startDate: string;
      endDate?: string;
      status: string;
      projectTitle: string;
      beneficiariesCount: number;
    }[] = [];

    targetProjects.forEach(p => {
      p.outcomes.forEach(oc => {
        oc.outputs.forEach(op => {
          op.activities.forEach(act => {
            const count = attendances.filter(a => a.activityId === act.id).length;
            list.push({
              id: act.id,
              code: act.code,
              title: act.title,
              location: act.location,
              startDate: act.startDate,
              endDate: act.endDate,
              status: act.status,
              projectTitle: p.title,
              beneficiariesCount: count
            });
          });
        });
      });
    });

    return list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [targetProjects, attendances]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo and Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-xs flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
                M&E Platform by Elvandri
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {isId ? 'Sistem Monitoring, Evaluasi, Pembelajaran & Dampak' : 'Monitoring, Evaluation, Learning & Impact System'}
              </p>
            </div>
          </div>

          {/* Right Action Header Bar */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  isId ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇮🇩</span>
                <span>ID</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  !isId ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
            </div>

            {/* System Status Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/90 text-emerald-700 text-xs font-semibold border border-emerald-200/80 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isId ? 'Sistem Terintegrasi Tanpa Double Counting' : 'Integrated Zero Double-Counting System'}</span>
            </div>

            {/* Navigation Buttons */}
            <div className="inline-flex items-center gap-2">
              <button
                id="btn-nav-admin-entry"
                onClick={onGoToAdmin}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold border border-emerald-600 shadow-xs flex items-center gap-1.5 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isId ? 'Administrator & Entri Data' : 'Admin & Data Entry'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* CARD 1: FILTER ANALISIS PROYEK */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {isId ? 'Filter Analisis Proyek' : 'Project Analysis Filter'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isId 
                  ? 'Pilih proyek spesifik untuk memfilter indikator kinerja, logframe, dan partisipan'
                  : 'Select a specific project to filter performance indicators, logframe, and participants'}
              </p>
            </div>

            {/* Dropdown Project Selector */}
            <div className="min-w-[260px] sm:min-w-[320px]">
              <select
                id="public-project-filter"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">{isId ? 'Semua Proyek (Konsolidasi Multi-Sektor)' : 'All Projects (Multi-Sector Consolidation)'}</option>
                {projects.map(p => {
                  const startYear = p.startDate ? new Date(p.startDate).getFullYear() : '';
                  return (
                    <option key={p.id} value={p.id}>
                      {startYear ? `[${startYear}] ` : ''}{p.code}: {p.title}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Project Metadata Info Bar (4 Columns) */}
          <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-200/70 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">{isId ? 'Sektor Proyek' : 'Project Sector'}</span>
              <span className="font-bold text-slate-900 block mt-0.5 leading-snug">
                {meta.sectorLabel}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">{isId ? 'Penanggung Jawab (Lead)' : 'Team Lead'}</span>
              <span className="font-bold text-slate-900 block mt-0.5 leading-snug">
                {meta.teamLeadLabel}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">{isId ? 'Periode Pelaksanaan' : 'Implementation Period'}</span>
              <span className="font-bold text-slate-900 block mt-0.5 leading-snug">
                {meta.dateRange}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">{isId ? 'Total Anggaran' : 'Total Budget'}</span>
              <span className="font-extrabold text-emerald-600 block mt-0.5 text-sm leading-snug">
                Rp {meta.totalBudget.toLocaleString(isId ? 'id-ID' : 'en-US')}
              </span>
            </div>
          </div>
        </section>

        {/* 4 TOP KEY STATISTICAL METRIC CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Penerima Manfaat Unik */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {isId ? 'Penerima Manfaat Unik' : 'Unique Beneficiaries'}
              </span>
              <div className="w-8 h-8 rounded-lg text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {disaggSummary.totalUniqueBeneficiaries}
              </div>
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                {isId ? 'Individu unik terverifikasi (No Double Counting)' : 'Verified unique individuals (No Double Counting)'}
              </p>
            </div>
          </div>

          {/* Card 2: Total Partisipasi Kegiatan */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {isId ? 'Total Partisipasi Kegiatan' : 'Gross Activity Participation'}
              </span>
              <div className="w-8 h-8 rounded-lg text-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {disaggSummary.totalGrossParticipation}
              </div>
              <p className="text-xs font-semibold text-indigo-600 mt-1">
                {isId ? 'Akumulasi log absensi pada seluruh sesi kegiatan' : 'Cumulative attendance logs across all sessions'}
              </p>
            </div>
          </div>

          {/* Card 3: Capaian Indikator Kinerja */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {isId ? 'Capaian Indikator Kinerja' : 'Key Indicator Achievement'}
              </span>
              <div className="w-8 h-8 rounded-lg text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600 tracking-tight">
                {meta.avgIndicatorProgress}%
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {isId ? 'Rata-rata realisasi terhadap target indikator' : 'Average achievement rate against indicator targets'}
              </p>
            </div>
          </div>

          {/* Card 4: Inklusi IPLC & Disabilitas */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {isId ? 'Inklusi IPLC & Disabilitas' : 'IPLC & Disability Inclusion'}
              </span>
              <div className="w-8 h-8 rounded-lg text-amber-600 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {disaggSummary.iplcBreakdown.percentIplcTotal}% / {disaggSummary.disabilityBreakdown.percentDisability}%
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {isId ? '% Masyarakat Adat & Lokal / % Disabilitas' : '% Indigenous & Local / % Disabilities'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: ANALISIS DISAGREGASI PENERIMA MANFAAT & INKLUSI SOSIAL (GESI & IPLC) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {isId ? 'Analisis Disagregasi Penerima Manfaat & Inklusi Sosial' : 'Beneficiary Disaggregation & Social Inclusion Analysis'}
            </h2>
            <p className="text-xs text-slate-500">
              {isId 
                ? 'Visualisasi komprehensif profil penerima manfaat berdasarkan Gender, 4 Kelompok Usia, Ragam Disabilitas, dan Masyarakat Adat/Lokal (IPLC).'
                : 'Comprehensive visualization of beneficiary profiles by Gender, 4 Age Groups, Disability Categories, and Indigenous Peoples & Local Communities (IPLC).'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Gender Disaggregation */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{isId ? 'Disagregasi Gender' : 'Gender Disaggregation'}</span>
                <span className="text-[10px] text-slate-400">{isId ? 'Total' : 'Total'}: {disaggSummary.totalUniqueBeneficiaries} {isId ? 'org' : 'ppl'}</span>
              </div>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={66}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {genderChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100 text-center">
                  <span className="text-[10px] text-blue-600 block font-semibold">{isId ? 'Laki-laki' : 'Male'}</span>
                  <span className="font-bold text-blue-900 text-sm">{disaggSummary.genderBreakdown.lakiLaki}</span>
                  <span className="text-[10px] text-blue-600 block">({disaggSummary.genderBreakdown.percentLakiLaki}%)</span>
                </div>
                <div className="bg-pink-50/60 p-2 rounded-lg border border-pink-100 text-center">
                  <span className="text-[10px] text-pink-600 block font-semibold">{isId ? 'Perempuan' : 'Female'}</span>
                  <span className="font-bold text-pink-900 text-sm">{disaggSummary.genderBreakdown.perempuan}</span>
                  <span className="text-[10px] text-pink-600 block">({disaggSummary.genderBreakdown.percentPerempuan}%)</span>
                </div>
              </div>
            </div>

            {/* 4 Age Groups Disaggregation */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{isId ? '4 Kelompok Usia' : '4 Age Cohorts'}</span>
                <span className="text-[10px] text-slate-400">{isId ? 'Standar Internasional' : 'Global Standards'}</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageChartData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }} width={85} />
                    <Tooltip />
                    <Bar dataKey="count" name={isId ? 'Jumlah' : 'Count'} fill="#10b981" radius={[0, 4, 4, 0]}>
                      {ageChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                0-14 ({isId ? 'Anak' : 'Child'}), 15-24 ({isId ? 'Pemuda' : 'Youth'}), 25-64 ({isId ? 'Dewasa' : 'Adult'}), 65+ ({isId ? 'Lansia' : 'Elderly'})
              </p>
            </div>

            {/* IPLC & Disability Status */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{isId ? 'Masyarakat Adat & Lokal (IPLC)' : 'Indigenous & Local Peoples (IPLC)'}</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  {disaggSummary.iplcBreakdown.percentIplcTotal}% {isId ? 'Inklusif' : 'Inclusive'}
                </span>
              </div>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={iplcChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={66}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {iplcChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={IPLC_COLORS[index % IPLC_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 font-medium">
                <span className="text-purple-700">{isId ? 'Adat' : 'Indigenous'}: {disaggSummary.iplcBreakdown.indigenousPeoples}</span>
                <span className="text-emerald-700">{isId ? 'Lokal' : 'Local'}: {disaggSummary.iplcBreakdown.localCommunities}</span>
                <span className="text-slate-500">Non: {disaggSummary.iplcBreakdown.nonIplc}</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: TARGET GROUP & LEVEL OF BENEFICIARIES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {isId ? 'Target Group & Level Penerima Manfaat' : 'Target Group & Beneficiary Level'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isId 
                  ? 'Klasifikasi penerima manfaat berdasarkan kelompok sasaran program dan tingkat wilayah yurisdiksi' 
                  : 'Beneficiary classification by project target group and jurisdiction intervention level'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Target Group Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    {isId ? 'Distribusi Target Group (Kelompok Sasaran)' : 'Target Group Distribution'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isId ? 'Warga Komunitas, Aparatur Pemerintah, Lembaga Perantara (NGO/CSO)' : 'Community Population, Gov/OPD, Intermediaries (NGO/CSO)'}
                  </p>
                </div>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={targetGroupChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ pct }) => `${pct}%`}
                    >
                      {targetGroupChartData.map((_, index) => (
                        <Cell key={`pub-tg-${index}`} fill={TARGET_GROUP_COLORS[index % TARGET_GROUP_COLORS.length]} />
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

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {targetGroupChartData.map((tg, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" 
                      style={{ backgroundColor: TARGET_GROUP_COLORS[idx % TARGET_GROUP_COLORS.length] }}
                    ></span>
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-slate-600 block truncate">{tg.name}</span>
                      <span className="text-xs font-bold text-slate-900">{tg.value} {isId ? 'org' : 'pax'} ({tg.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Beneficiary Level (Tingkat Dampingan) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    {isId ? 'Level Penerima Manfaat (Tingkat Dampingan)' : 'Level of Beneficiaries (Jurisdiction)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isId ? 'Tingkat Desa, Kecamatan, Kabupaten, Provinsi, hingga Nasional' : 'Desa, Kecamatan, Kabupaten, Provinsi, and National'}
                  </p>
                </div>
              </div>

              <div className="h-52 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelChartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value: any) => [`${value} ${isId ? 'orang' : 'people'}`, isId ? 'Jumlah' : 'Count']}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {levelChartData.map((_, index) => (
                        <Cell key={`pub-lvl-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-100 text-center text-xs">
                {levelChartData.map((lvl, idx) => (
                  <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-medium block truncate">{lvl.level}</span>
                    <span className="text-xs font-bold text-slate-900">{lvl.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: PEMBAGIAN PENERIMA MANFAAT PER DESA / KELURAHAN DAMPINGAN */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">
                    {isId ? 'Pembagian Penerima Manfaat Sesuai Desa / Kelurahan Dampingan' : 'Beneficiary Distribution by Assisted Village / Sub-District'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    {disaggSummary.villageBreakdown.length} {isId ? 'Desa Terdaftar' : 'Registered Villages'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isId 
                    ? 'Distribusi data peserta dampingan terverifikasi (No Double Counting) di setiap desa/kelurahan wilayah intervensi.'
                    : 'Distribution of verified assisted participants (Zero Double-Counting) in each target village.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart */}
            <div className="lg:col-span-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                {isId ? 'Grafik Penerima Manfaat per Desa' : 'Beneficiary Chart by Village'}
              </span>
              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={disaggSummary.villageBreakdown.slice(0, 8)} 
                    layout="vertical"
                    margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis 
                      dataKey="village" 
                      type="category" 
                      tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} 
                      width={105} 
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                              <p className="font-bold text-emerald-400">{d.village}</p>
                              <p>{isId ? 'Total Unik' : 'Unique Total'}: <strong>{d.totalUnique} {isId ? 'orang' : 'people'}</strong> ({d.percentage}%)</p>
                              <p className="text-blue-300">{isId ? 'Laki-laki' : 'Male'}: {d.lakiLaki}</p>
                              <p className="text-pink-300">{isId ? 'Perempuan' : 'Female'}: {d.perempuan}</p>
                              <p className="text-rose-300">{isId ? 'Disabilitas' : 'Disability'}: {d.disabilityCount}</p>
                              <p className="text-purple-300">IPLC: {d.iplcCount}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="lakiLaki" name={isId ? 'Laki-laki' : 'Male'} stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="perempuan" name={isId ? 'Perempuan' : 'Female'} stackId="a" fill="#ec4899" radius={[0, 4, 4, 0]} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="lg:col-span-7 overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">{isId ? 'Desa / Kelurahan' : 'Village / Sub-District'}</th>
                      <th className="py-2.5 px-2 text-center">{isId ? 'Total Unik' : 'Unique Total'}</th>
                      <th className="py-2.5 px-2">{isId ? 'Proporsi (%)' : 'Proportion (%)'}</th>
                      <th className="py-2.5 px-2 text-center">{isId ? 'L / P' : 'M / F'}</th>
                      <th className="py-2.5 px-2 text-center">{isId ? 'Disabilitas' : 'Disability'}</th>
                      <th className="py-2.5 px-2 text-center">IPLC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {disaggSummary.villageBreakdown.map((item, idx) => (
                      <tr key={item.village} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/60'}>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {item.village}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                            {item.totalUnique}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full" 
                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-600 text-[11px] w-9 text-right">
                              {item.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold">
                            <span className="text-blue-600 font-bold">{item.lakiLaki}{isId ? 'L' : 'M'}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-pink-600 font-bold">{item.perempuan}{isId ? 'P' : 'F'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {item.disabilityCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                              ♿ {item.disabilityCount}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {item.iplcCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                              🌿 {item.iplcCount}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: CAPAIAN INDIKATOR UTAMA LOGFRAME (GOAL, OUTCOME & OUTPUT) */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {isId ? 'Matriks Capaian Kinerja' : 'Performance Logframe Matrix'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isId ? 'Capaian Indikator Kinerja (Goal, Outcome & Output)' : 'Key Performance Indicators (Goal, Outcome & Output)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isId 
                  ? 'Transparansi target baseline vs realisasi aktual pada tingkat Dampak (Goal/Impact), Hasil Antara (Outcome), dan Keluaran (Output).'
                  : 'Transparent tracking of baseline targets vs real achievements across Goal/Impact, Outcome, and Output levels.'}
              </p>
            </div>

            {/* Level Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => setPublicIndicatorLevelFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  publicIndicatorLevelFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{isId ? 'Semua Indikator' : 'All Indicators'}</span>
                <span className="px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded-full text-[10px]">{indicatorCounts.all}</span>
              </button>
              <button
                onClick={() => setPublicIndicatorLevelFilter('GOAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  publicIndicatorLevelFilter === 'GOAL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span>🎯 Goal / Impact</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  publicIndicatorLevelFilter === 'GOAL' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>{indicatorCounts.goal}</span>
              </button>
              <button
                onClick={() => setPublicIndicatorLevelFilter('OUTCOME')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  publicIndicatorLevelFilter === 'OUTCOME'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span>🌟 Outcome</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  publicIndicatorLevelFilter === 'OUTCOME' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
                }`}>{indicatorCounts.outcome}</span>
              </button>
              <button
                onClick={() => setPublicIndicatorLevelFilter('OUTPUT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  publicIndicatorLevelFilter === 'OUTPUT'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <span>📦 Output</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  publicIndicatorLevelFilter === 'OUTPUT' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800'
                }`}>{indicatorCounts.output}</span>
              </button>
            </div>

            <button
              onClick={handleExportPublicIndicators}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition whitespace-nowrap self-start md:self-auto"
              title={isId ? 'Unduh seluruh laporan capaian indikator dalam format Excel (.xlsx)' : 'Download all indicator achievement reports in Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isId ? 'Ekspor Capaian (.xlsx)' : 'Export Achievements (.xlsx)'}</span>
            </button>
          </div>

          {/* Indicators Content: Chart + Detailed Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart */}
            <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {isId ? 'Grafik Perbandingan Target vs Capaian' : 'Target vs Actual Comparison Chart'}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {filteredPublicIndicators.length} {isId ? 'Indikator Ditampilkan' : 'Indicators Shown'}
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={filteredPublicIndicators.slice(0, 10)} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="code" 
                      tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} 
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const pct = data.target > 0 ? Math.round((data.actual / data.target) * 100) : 0;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1.5 max-w-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-emerald-400">{data.code}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  data.level === 'Goal' ? 'bg-emerald-500/30 text-emerald-300' :
                                  data.level === 'Outcome' ? 'bg-blue-500/30 text-blue-300' :
                                  'bg-purple-500/30 text-purple-300'
                                }`}>
                                  {data.levelLabel}
                                </span>
                              </div>
                              <p className="font-medium text-slate-200 line-clamp-2">{data.name}</p>
                              <div className="pt-1 border-t border-slate-700/80 space-y-0.5">
                                <p>Target: <strong>{data.target} {data.unit}</strong></p>
                                <p>{isId ? 'Aktual' : 'Actual'}: <strong className="text-emerald-300">{data.actual} {data.unit}</strong></p>
                                <p className="text-cyan-300 font-bold">{pct}% {isId ? 'Tercapai' : 'Achieved'}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="target" name={isId ? 'Target' : 'Target'} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar 
                      dataKey="actual" 
                      name={isId ? 'Realisasi Aktual' : 'Actual Reached'} 
                      fill="#059669" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Cards List */}
            <div className="lg:col-span-7 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {filteredPublicIndicators.map((ind, idx) => {
                const percent = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
                const isOver = percent >= 100;
                const badgeColor = 
                  ind.level === 'Goal' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  ind.level === 'Outcome' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-purple-100 text-purple-800 border-purple-200';

                return (
                  <div 
                    key={`${ind.code}-${idx}`} 
                    className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-white hover:shadow-xs transition border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-xs bg-slate-200/80 px-2 py-0.5 rounded">
                            {ind.code}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                            {ind.level === 'Goal' && '🎯 '}
                            {ind.level === 'Outcome' && '🌟 '}
                            {ind.level === 'Output' && '📦 '}
                            {ind.levelLabel}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ind.status === 'Tercapai' || ind.status === 'Melampaui Target'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {ind.status}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs font-semibold leading-snug line-clamp-2" title={ind.name}>
                          {ind.name}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-extrabold text-emerald-700 text-sm">
                          {ind.actual} <span className="text-[11px] font-normal text-slate-500">/ {ind.target} {ind.unit}</span>
                        </div>
                        <div className={`text-[11px] font-bold ${isOver ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {percent}% {isId ? 'Tercapai' : 'Achieved'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          ind.level === 'Goal' ? 'bg-emerald-500' :
                          ind.level === 'Outcome' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {filteredPublicIndicators.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  {isId ? 'Tidak ada indikator pada tingkat ini.' : 'No indicators recorded for this level.'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION: KALENDER PELAKSANAAN KEGIATAN PUBLIK */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isId ? 'Jadwal & Agenda Pelaksanaan Kegiatan Proyek' : 'Project Activity Schedule & Implementation Calendar'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isId 
                    ? 'Transparansi jadwal pelatihan, sosialisasi, dan monitoring lapangan bagi publik & pemangku kepentingan.'
                    : 'Transparent calendar of training workshops, field visits, and stakeholder events.'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-800 font-bold text-xs rounded-full border border-indigo-200 self-start sm:self-auto">
              {allActivities.length} {isId ? 'Agenda Kegiatan' : 'Activities Scheduled'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allActivities.map(act => (
              <div key={act.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-xs transition space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      {act.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      act.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{act.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{act.projectTitle}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{act.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>{act.startDate} {act.endDate ? `${isId ? 's/d' : 'to'} ${act.endDate}` : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: PUBLIKASI, PRODUK PENGETAHUAN & CERITA PERUBAHAN */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isId ? 'Pusat Pengetahuan & Pembelajaran' : 'Knowledge & Learning Hub'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {isId ? 'Publikasi, Produk Pengetahuan & Cerita Perubahan' : 'Publications, Knowledge Products & Stories of Change'}
              </h2>
              <p className="text-xs text-slate-500">
                {isId 
                  ? 'Akses dokumen panduan, lembar fakta, modul, kisah inspiratif penerima manfaat, dan rekam jejak liputan media.'
                  : 'Access policy briefs, technical guides, modules, inspiring beneficiary stories, and media coverage archive.'}
              </p>
            </div>

            {/* Sub Tab Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setPublicPubTab('products')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  publicPubTab === 'products'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isId ? 'Produk' : 'Products'} ({knowledgeProducts.length})</span>
              </button>
              <button
                onClick={() => setPublicPubTab('stories')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  publicPubTab === 'stories'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isId ? 'Cerita Perubahan' : 'Stories'} ({storiesOfChange.length})</span>
              </button>
              <button
                onClick={() => setPublicPubTab('media')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  publicPubTab === 'media'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Media ({mediaCoverages.length})</span>
              </button>
              <button
                onClick={() => setPublicPubTab('learnings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  publicPubTab === 'learnings'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{isId ? 'Pembelajaran' : 'Learnings'} ({learnings.length})</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Knowledge Products Grid */}
          {publicPubTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {knowledgeProducts.map((kp) => (
                <div 
                  key={kp.id} 
                  className="bg-slate-50/70 hover:bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                        {kp.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {kp.language}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                      {kp.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {kp.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{isId ? 'Penerbit' : 'Publisher'}: <strong>{kp.publisherAuthor}</strong></span>
                      {kp.fileSize && <span className="text-slate-400">{kp.fileSize}</span>}
                    </div>

                    {kp.contributeToOutputOutcome && (
                      <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-medium">
                        {kp.contributeToOutputOutcome}
                      </div>
                    )}

                    {kp.linkDocument && (
                      <a
                        href={kp.linkDocument}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isId ? 'Unduh / Buka Dokumen' : 'Download / Open Document'}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Stories of Change Grid */}
          {publicPubTab === 'stories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storiesOfChange.map((soc) => (
                <div 
                  key={soc.id} 
                  className="bg-slate-50/70 hover:bg-white rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-amber-300 hover:shadow-sm transition flex flex-col justify-between space-y-3.5"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold">
                        {soc.categoryTheme || (isId ? 'Cerita Perubahan' : 'Story of Change')}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {soc.storiesLocation}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {soc.storyTitle}
                    </h3>

                    <div className="text-xs text-slate-600 font-medium">
                      {isId ? 'Penerima Manfaat / Tokoh' : 'Key Figure / Beneficiary'}: <strong className="text-slate-800">{soc.whoHasChanged}</strong>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100 text-slate-700">
                        <strong className="text-rose-700 block text-[11px] mb-0.5">{isId ? 'Sebelum Program:' : 'Before Program:'}</strong>
                        <p className="line-clamp-2">{soc.highlightBefore}</p>
                      </div>

                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-slate-700">
                        <strong className="text-emerald-700 block text-[11px] mb-0.5">{isId ? 'Setelah Intervensi:' : 'After Intervention:'}</strong>
                        <p className="line-clamp-2">{soc.highlightAfter}</p>
                      </div>
                    </div>

                    {soc.importantQuotes && (
                      <div className="p-2.5 bg-amber-50/80 border-l-3 border-amber-500 rounded-r-lg">
                        <p className="text-xs italic text-amber-950 font-medium line-clamp-2">
                          {soc.importantQuotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {soc.dateRecorded ? `${isId ? 'Direkam' : 'Recorded'}: ${soc.dateRecorded}` : ''}
                    </span>
                    <button
                      onClick={() => setSelectedStoryModal(soc)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      {isId ? 'Baca Cerita Lengkap →' : 'Read Full Story →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Media Coverage List */}
          {publicPubTab === 'media' && (
            <div className="space-y-2.5">
              {mediaCoverages.map((mc) => (
                <div 
                  key={mc.id} 
                  className="bg-slate-50/70 hover:bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                        {mc.platform}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {mc.type}
                      </span>
                      {mc.publisherMedia && (
                        <span className="text-[11px] text-slate-600 font-medium">
                          • {mc.publisherMedia}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                      {mc.title}
                    </h3>

                    {mc.summaryNotes && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {mc.summaryNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {mc.releaseDate}
                    </span>
                    <a
                      href={mc.linkToPublication}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>{isId ? 'Buka Artikel' : 'Open Article'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Project Learning Matrix */}
          {publicPubTab === 'learnings' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                  <span>{isId ? 'Matriks Temuan Kunci & Praktik Pembelajaran Proyek' : 'Project Key Learnings & Reflection Matrix'} (*Project Learning Matrix*)</span>
                </div>
                <div className="text-[11px] text-emerald-200">
                  {learnings.length} {isId ? 'Catatan Pembelajaran Terdokumentasi' : 'Documented Learnings'}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs border-collapse min-w-[1000px] bg-white">
                  <thead>
                    <tr className="bg-emerald-800 text-white border-b border-emerald-950 font-bold divide-x divide-emerald-700">
                      <th className="p-3 w-52">{isId ? 'Fokus Pembelajaran' : 'Learning Focus'}</th>
                      <th className="p-3 w-64">{isId ? 'Temuan Kunci (Key Learning)' : 'Key Learning'}</th>
                      <th className="p-3 w-64">{isId ? 'Tindakan Berbeda (Differently)' : 'What we did differently'}</th>
                      <th className="p-3 w-64">{isId ? 'Rencana Fase Berikutnya' : 'Next Phase Conduct'}</th>
                      <th className="p-3 w-60">{isId ? 'Kapasitas/Advokasi Internal' : 'Internal capacity/advocacy/comms'}</th>
                      <th className="p-3 w-40">{isId ? 'Waktu Implementasi' : 'When to implement'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {learnings.map((lrn, idx) => {
                      const proj = projects.find(p => p.id === lrn.projectId);
                      return (
                        <tr key={lrn.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="p-3 align-top divide-x-0 space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              {lrn.learningFocus}
                            </span>
                            <div className="font-bold text-slate-900 text-xs">{lrn.title}</div>
                            {proj && (
                              <div className="text-[10px] text-emerald-700 font-semibold">{proj.code}</div>
                            )}
                          </td>
                          <td className="p-3 align-top text-slate-700 leading-relaxed border-l border-slate-200">
                            {lrn.keyLearning}
                          </td>
                          <td className="p-3 align-top border-l border-slate-200">
                            <div className="p-2 bg-emerald-50 text-emerald-950 rounded-lg text-[11px] leading-relaxed border border-emerald-200">
                              {lrn.whatWeDidDifferently || '-'}
                            </div>
                          </td>
                          <td className="p-3 align-top border-l border-slate-200">
                            <div className="p-2 bg-blue-50 text-blue-950 rounded-lg text-[11px] leading-relaxed border border-blue-200">
                              {lrn.nextPhaseConduct || '-'}
                            </div>
                          </td>
                          <td className="p-3 align-top text-slate-600 text-[11px] border-l border-slate-200">
                            {lrn.internalCapacityAdvocacyComm || '-'}
                          </td>
                          <td className="p-3 align-top border-l border-slate-200 space-y-1">
                            <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {lrn.whenToLearnImplement}
                            </div>
                            {lrn.status && (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                {lrn.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Public Modal for Full Story */}
        {selectedStoryModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold text-base">{isId ? 'Cerita Perubahan' : 'Story of Change'}</h3>
                </div>
                <button
                  onClick={() => setSelectedStoryModal(null)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-xs leading-relaxed">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">
                      {selectedStoryModal.categoryTheme}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {selectedStoryModal.storiesLocation}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {selectedStoryModal.storyTitle}
                  </h2>
                  <div className="text-slate-500 mt-1 font-medium">
                    {isId ? 'Tokoh / Kelompok' : 'Key Actor / Group'}: <strong className="text-slate-800">{selectedStoryModal.whoHasChanged}</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                    <h4 className="font-bold text-rose-800 mb-1">{isId ? 'Kondisi Sebelum Program:' : 'Condition Before Program:'}</h4>
                    <p className="text-slate-700">{selectedStoryModal.highlightBefore}</p>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 mb-1">{isId ? 'Transformasi Setelah Intervensi:' : 'Transformation After Intervention:'}</h4>
                    <p className="text-slate-700">{selectedStoryModal.highlightAfter}</p>
                  </div>
                </div>

                {selectedStoryModal.importantQuotes && (
                  <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
                    <div className="font-semibold text-amber-800 mb-0.5">{isId ? 'Testimoni:' : 'Quote / Testimonial:'}</div>
                    <p className="italic text-amber-950 font-medium">
                      {selectedStoryModal.importantQuotes}
                    </p>
                  </div>
                )}

                <div className="text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span>{selectedStoryModal.noteFullStory || (isId ? 'Terdokumentasi dalam sistem M&E program.' : 'Documented in the project M&E system.')}</span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedStoryModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
                >
                  {isId ? 'Tutup' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: DAFTAR INISIATIF PROYEK AKTIF */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {isId ? 'Inisiatif & Proyek Dampingan Aktif' : 'Active Initiatives & Projects'}
            </h2>
            <p className="text-xs text-slate-500">
              {isId 
                ? 'Program keberlanjutan lingkungan, ketahanan iklim, dan inklusi sosial yang sedang berjalan.'
                : 'Ongoing environmental sustainability, climate resilience, and social inclusion initiatives.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {p.code}
                      </span>
                      {p.startDate && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          🗓️ {isId ? 'Mulai' : 'Start'}: {p.startDate}
                        </span>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {p.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.goalStatement}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">{isId ? 'Lembaga Donor:' : 'Donor Organization:'}</span>
                      <span className="font-semibold text-slate-800">{p.donor}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">{isId ? 'Mitra Pelaksana:' : 'Implementing Partner:'}</span>
                      <span className="font-semibold text-slate-800">{p.partnerOrg}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">🏡 {isId ? 'Desa / Kelurahan Dampingan:' : 'Assisted Target Villages:'}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(p.targetVillages || p.targetLocations).map((v, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-md border border-emerald-200">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">M&E Platform by Elvandri</span>
            <span>&bull;</span>
            <span>{isId ? 'Verifikasi Tanpa Double Counting' : 'Verified Zero Double-Counting'}</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onGoToAdmin}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <Lock className="w-3.5 h-3.5" />
              {isId ? 'Login Administrator & Entri Data' : 'Admin Login & Data Entry'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
