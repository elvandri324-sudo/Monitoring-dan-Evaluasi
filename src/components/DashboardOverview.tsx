import { useMemo, useState } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Target, 
  Accessibility, 
  Globe, 
  UserCheck, 
  Layers, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TreePine,
  MapPin,
  Building,
  Compass,
  Flag,
  Award,
  Edit3
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
import { Project, Beneficiary, ActivityAttendance } from '../types';
import { calculateDisaggregations, calculateLogframeProgress } from '../services/meEngine';
import { useLanguage } from '../context/LanguageContext';
import { formatUnit, formatAgeGroup, formatIPLC, formatGender, formatDisability } from '../utils/bilingual';
import ActivityCalendar from './ActivityCalendar';

interface DashboardOverviewProps {
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  selectedProjectId: string;
  onNavigate: (tab: 'dashboard' | 'activities' | 'beneficiaries' | 'indicators' | 'logframe' | 'team') => void;
  onOpenNewActivityModal?: () => void;
  isAdmin?: boolean;
  onEditProject?: (project: Project) => void;
}

const GENDER_COLORS = ['#3b82f6', '#ec4899'];
const AGE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
const IPLC_COLORS = ['#8b5cf6', '#10b981', '#94a3b8'];
const TARGET_GROUP_COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b'];
const LEVEL_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f43f5e'];

export default function DashboardOverview({
  projects,
  beneficiaries,
  attendances,
  selectedProjectId,
  onNavigate,
  onOpenNewActivityModal,
  isAdmin,
  onEditProject
}: DashboardOverviewProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const targetProjects = selectedProjectId === 'all' ? projects : (activeProject ? [activeProject] : projects);

  // Compute Disaggregation Summary
  const disaggSummary = useMemo(() => {
    return calculateDisaggregations(beneficiaries, attendances, selectedProjectId);
  }, [beneficiaries, attendances, selectedProjectId]);

  // Aggregate KPI Counts
  const stats = useMemo(() => {
    let totalActivities = 0;
    let goalIndicatorsCount = 0;
    let outputIndicatorsCount = 0;
    let outcomeIndicatorsCount = 0;
    let activityIndicatorsCount = 0;

    targetProjects.forEach(proj => {
      goalIndicatorsCount += (proj.goalIndicators || []).length;
      proj.outcomes.forEach(oc => {
        outcomeIndicatorsCount += oc.indicators.length;
        oc.outputs.forEach(op => {
          outputIndicatorsCount += op.indicators.length;
          totalActivities += op.activities.length;
          op.activities.forEach(act => {
            activityIndicatorsCount += act.indicators.length;
          });
        });
      });
    });

    return {
      totalActivities,
      goalIndicatorsCount,
      outputIndicatorsCount,
      outcomeIndicatorsCount,
      activityIndicatorsCount
    };
  }, [targetProjects]);

  // Goal / Impact Indicators Data for Quick Chart
  const goalData = useMemo(() => {
    const list: any[] = [];
    targetProjects.forEach(proj => {
      (proj.goalIndicators || []).forEach(ind => {
        list.push({
          code: ind.code,
          name: ind.name,
          target: ind.target,
          actual: ind.actual,
          unit: ind.unit,
          status: ind.status
        });
      });
    });
    return list.slice(0, 6);
  }, [targetProjects]);

  // Outcome Indicators Data for Quick Chart
  const outcomeData = useMemo(() => {
    const list: any[] = [];
    targetProjects.forEach(proj => {
      proj.outcomes.forEach(oc => {
        oc.indicators.forEach(ind => {
          list.push({
            code: ind.code,
            name: ind.name,
            target: ind.target,
            actual: ind.actual,
            unit: ind.unit,
            status: ind.status
          });
        });
      });
    });
    return list.slice(0, 6);
  }, [targetProjects]);

  // Output Indicators Data for Quick Chart
  const outputData = useMemo(() => {
    const list: any[] = [];
    targetProjects.forEach(proj => {
      proj.outcomes.forEach(oc => {
        oc.outputs.forEach(op => {
          op.indicators.forEach(ind => {
            list.push({
              code: ind.code,
              name: ind.name,
              target: ind.target,
              actual: ind.actual,
              unit: ind.unit,
              status: ind.status
            });
          });
        });
      });
    });
    return list.slice(0, 6);
  }, [targetProjects]);

  // Age group chart data
  const ageChartData = useMemo(() => [
    { name: formatAgeGroup('0-14', language), count: disaggSummary.ageGroupBreakdown['0-14'] },
    { name: formatAgeGroup('15-24', language), count: disaggSummary.ageGroupBreakdown['15-24'] },
    { name: formatAgeGroup('25-64', language), count: disaggSummary.ageGroupBreakdown['25-64'] },
    { name: formatAgeGroup('65+', language), count: disaggSummary.ageGroupBreakdown['65+'] },
  ], [disaggSummary, language]);

  // Gender chart data
  const genderChartData = useMemo(() => [
    { name: formatGender('Laki-laki', language), value: disaggSummary.genderBreakdown.lakiLaki },
    { name: formatGender('Perempuan', language), value: disaggSummary.genderBreakdown.perempuan },
  ], [disaggSummary, language]);

  // IPLC chart data
  const iplcChartData = useMemo(() => [
    { name: isId ? 'Masyarakat Adat' : 'Indigenous Peoples', value: disaggSummary.iplcBreakdown.indigenousPeoples },
    { name: isId ? 'Komunitas Lokal' : 'Local Communities', value: disaggSummary.iplcBreakdown.localCommunities },
    { name: isId ? 'Bukan IPLC' : 'Non-IPLC', value: disaggSummary.iplcBreakdown.nonIplc },
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

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isId ? 'Dashboard Ringkasan' : 'Dashboard Overview'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isId 
              ? 'Ringkasan data monitoring kegiatan, indikator, dan penerima manfaat'
              : 'Summary of project activities monitoring data, indicators, and beneficiaries'}
          </p>
        </div>

        {activeProject && selectedProjectId !== 'all' && (
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-orange-100 shadow-xs flex items-center justify-between gap-3 self-start sm:self-auto">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                  {activeProject.code}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs" title={activeProject.title}>
                  {activeProject.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {activeProject.province} • {activeProject.status}
              </p>
            </div>
            {isAdmin && onEditProject && (
              <button
                onClick={() => onEditProject(activeProject)}
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold flex items-center gap-1 border border-orange-200 transition shrink-0 whitespace-nowrap"
                title={isId ? 'Ubah Nama dan Detail Proyek' : 'Edit Project Name and Details'}
              >
                <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                <span>{isId ? 'Edit Proyek' : 'Edit Project'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* TOP KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Kegiatan */}
        <div 
          onClick={() => onNavigate('activities')}
          className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs hover:shadow-md hover:border-orange-200 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-slate-600 leading-snug">
              {isId ? 'Total' : 'Total'}<br />{isId ? 'Kegiatan' : 'Activities'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 border border-orange-100">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tabular-nums block">
              {stats.totalActivities}
            </span>
          </div>
        </div>

        {/* Card 2: Total Penerima Manfaat */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs hover:shadow-md hover:border-orange-200 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-slate-600 leading-snug">
              {isId ? 'Total' : 'Total'}<br />{isId ? 'Penerima Manfaat' : 'Beneficiaries'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-2 flex-wrap">
            <span className="text-3xl font-bold text-slate-900 tabular-nums block">
              {disaggSummary.totalUniqueBeneficiaries.toLocaleString(isId ? 'id-ID' : 'en-US')}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Zero Double-Count
            </span>
          </div>
        </div>

        {/* Card 3: Indikator Output */}
        <div 
          onClick={() => onNavigate('indicators')}
          className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs hover:shadow-md hover:border-orange-200 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-slate-600 leading-snug">
              {isId ? 'Indikator' : 'Output'}<br />{isId ? 'Output' : 'Indicators'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 border border-orange-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tabular-nums block">
              {stats.outputIndicatorsCount}
            </span>
          </div>
        </div>

        {/* Card 4: Indikator Outcome */}
        <div 
          onClick={() => onNavigate('indicators')}
          className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs hover:shadow-md hover:border-orange-200 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-slate-600 leading-snug">
              {isId ? 'Indikator' : 'Outcome'}<br />{isId ? 'Outcome' : 'Indicators'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 tabular-nums block">
              {stats.outcomeIndicatorsCount}
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2 KPI CARDS (Inclusion, Disabilities, IPLC) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 5: Penerima dengan Disabilitas */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs hover:shadow-md hover:border-orange-200 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-slate-600 leading-snug">
              {isId ? 'Penerima dengan' : 'Beneficiaries with'}<br />{isId ? 'Disabilitas' : 'Disabilities'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 border border-orange-100">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-2 flex-wrap">
            <span className="text-3xl font-bold text-slate-900 tabular-nums block">
              {disaggSummary.disabilityBreakdown.disabilityCount}
            </span>
            <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
              {disaggSummary.disabilityBreakdown.percentDisability}% {isId ? 'Inklusi' : 'Inclusion'}
            </span>
          </div>
        </div>

        {/* Card 6: Masyarakat Adat */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs hover:shadow-md hover:border-orange-200 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-slate-600 leading-snug">
              {isId ? 'Masyarakat' : 'Indigenous'}<br />{isId ? 'Adat' : 'Peoples'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
              <Globe className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-2 flex-wrap">
            <span className="text-3xl font-bold text-slate-900 tabular-nums block">
              {disaggSummary.iplcBreakdown.indigenousPeoples}
            </span>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
              Indigenous Peoples
            </span>
          </div>
        </div>

        {/* Card 7: Masyarakat Lokal */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs hover:shadow-md hover:border-orange-200 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-slate-600 leading-snug">
              {isId ? 'Masyarakat' : 'Local'}<br />{isId ? 'Lokal' : 'Communities'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <Globe className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-2 flex-wrap">
            <span className="text-3xl font-bold text-slate-900 tabular-nums block">
              {disaggSummary.iplcBreakdown.localCommunities}
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              Local Communities
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: GRAFIK INDIKATOR GOAL, OUTCOME & OUTPUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal / Impact Indicators Chart */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flag className="w-4 h-4 text-orange-600" />
                {isId ? 'Indikator Goal / Impact' : 'Goal / Impact Progress'}
              </h3>
              <p className="text-xs text-slate-500">
                {isId ? 'Dampak Jangka Panjang' : 'Long-term Project Impact'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('indicators')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              {isId ? 'Lihat Semua' : 'View All'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            {goalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff7ed" />
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white text-slate-900 border border-orange-200 p-2.5 rounded-xl text-xs shadow-xl space-y-0.5">
                            <p className="font-bold text-orange-700">{data.code}: {data.name}</p>
                            <p>{isId ? 'Target' : 'Target'}: <strong>{data.target} {formatUnit(data.unit, language)}</strong></p>
                            <p>{isId ? 'Aktual' : 'Actual'}: <strong className="text-amber-600">{data.actual} {formatUnit(data.unit, language)}</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="target" name={isId ? 'Target Goal' : 'Goal Target'} fill="#ea580c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name={isId ? 'Realisasi' : 'Actual'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                {isId ? 'Belum ada indikator Goal' : 'No Goal indicators'}
              </div>
            )}
          </div>
        </div>

        {/* Outcome Indicators Chart */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                {isId ? 'Capaian Outcome' : 'Outcome Progress'}
              </h3>
              <p className="text-xs text-slate-500">
                {isId ? 'Hasil Jangka Menengah' : 'Medium-term Results'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('indicators')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              {isId ? 'Lihat Semua' : 'View All'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff7ed" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white text-slate-900 border border-orange-200 p-2.5 rounded-xl text-xs shadow-xl space-y-0.5">
                          <p className="font-bold text-orange-700">{data.code}: {data.name}</p>
                          <p>{isId ? 'Target' : 'Target'}: <strong>{data.target} {formatUnit(data.unit, language)}</strong></p>
                          <p>{isId ? 'Aktual' : 'Actual'}: <strong className="text-emerald-600">{data.actual} {formatUnit(data.unit, language)}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="target" name={isId ? 'Target' : 'Target'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name={isId ? 'Realisasi' : 'Actual'} fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Output Indicators Chart */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                {isId ? 'Capaian Output' : 'Output Progress'}
              </h3>
              <p className="text-xs text-slate-500">
                {isId ? 'Keluaran Proyek' : 'Deliverables & Outputs'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('indicators')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              {isId ? 'Lihat Semua' : 'View All'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outputData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff7ed" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white text-slate-900 border border-orange-200 p-2.5 rounded-xl text-xs shadow-xl space-y-0.5">
                          <p className="font-bold text-orange-700">{data.code}: {data.name}</p>
                          <p>{isId ? 'Target' : 'Target'}: <strong>{data.target} {formatUnit(data.unit, language)}</strong></p>
                          <p>{isId ? 'Aktual' : 'Actual'}: <strong className="text-emerald-600">{data.actual} {formatUnit(data.unit, language)}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="target" name={isId ? 'Target' : 'Target'} fill="#ea580c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name={isId ? 'Realisasi' : 'Actual'} fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION: GESI & IPLC DISAGGREGATION VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Breakdown */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">
            {isId ? 'Disagregasi Jenis Kelamin' : 'Gender Disaggregation'}
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
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
          <div className="flex justify-around text-xs font-semibold pt-1 border-t border-orange-100">
            <span className="text-blue-600 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              {isId ? 'Laki-laki' : 'Male'}: {disaggSummary.genderBreakdown.percentLakiLaki}%
            </span>
            <span className="text-pink-600 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              {isId ? 'Perempuan' : 'Female'}: {disaggSummary.genderBreakdown.percentPerempuan}%
            </span>
          </div>
        </div>

        {/* 4 Age Groups Breakdown */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">
            {isId ? 'Disagregasi 4 Kelompok Usia' : '4 Age Group Brackets'}
          </h3>
          <div className="h-48 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fff7ed" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#ea580c" radius={[0, 4, 4, 0]}>
                  {ageChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center border-t border-orange-100 pt-1">
            {isId 
              ? 'Distribusi usia 0-14 (Anak), 15-24 (Pemuda), 25-64 (Dewasa), 65+ (Lansia)'
              : 'Age brackets: 0-14 (Children), 15-24 (Youth), 25-64 (Adults), 65+ (Elderly)'}
          </p>
        </div>

        {/* IPLC Status Breakdown */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">
            {isId ? 'Status Masyarakat Adat & Lokal (IPLC)' : 'IPLC Status Breakdown'}
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={iplcChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
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
          <div className="flex justify-around text-xs font-semibold pt-1 border-t border-orange-100">
            <span className="text-purple-600">{isId ? 'Adat' : 'Indigenous'}: {disaggSummary.iplcBreakdown.indigenousPeoples}</span>
            <span className="text-emerald-600">{isId ? 'Lokal' : 'Local'}: {disaggSummary.iplcBreakdown.localCommunities}</span>
            <span className="text-slate-500">{isId ? 'Non' : 'Non-IPLC'}: {disaggSummary.iplcBreakdown.nonIplc}</span>
          </div>
        </div>
      </div>

      {/* SECTION: TARGET GROUP & BENEFICIARY LEVEL BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Group Distribution */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                {isId ? 'Distribusi Target Group' : 'Target Group Distribution'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isId ? 'Klasifikasi kelompok sasaran penerima manfaat unik' : 'Classification of unique target group beneficiaries'}
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
                    <Cell key={`tg-${index}`} fill={TARGET_GROUP_COLORS[index % TARGET_GROUP_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, item: any) => [
                    `${value} ${isId ? 'orang' : 'people'} (${item.payload.pct}%)`, 
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #fed7aa', color: '#0f172a', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-100 text-xs">
            {targetGroupChartData.map((tg, idx) => (
              <div key={idx} className="bg-orange-50/40 p-2 rounded-lg border border-orange-100/70 flex items-start gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" 
                  style={{ backgroundColor: TARGET_GROUP_COLORS[idx % TARGET_GROUP_COLORS.length] }}
                ></span>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-slate-600 block truncate">{tg.name}</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">{tg.value} {isId ? 'org' : 'pax'} ({tg.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beneficiary Level (Tingkat Dampingan) */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-600" />
                {isId ? 'Level Penerima Manfaat (Tingkat Wilayah / Lembaga)' : 'Level of Beneficiaries (Jurisdiction)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isId ? 'Desa, Kecamatan, Kabupaten, Provinsi, hingga Nasional' : 'From village level up to national level'}
              </p>
            </div>
          </div>
          <div className="h-52 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelChartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff7ed" />
                <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} ${isId ? 'orang' : 'people'}`, isId ? 'Jumlah' : 'Count']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #fed7aa', color: '#0f172a', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]}>
                  {levelChartData.map((_, index) => (
                    <Cell key={`lvl-cell-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-orange-100 text-center text-xs">
            {levelChartData.map((lvl, idx) => (
              <div key={idx} className="bg-orange-50/40 p-1.5 rounded-lg border border-orange-100/70">
                <span className="text-[10px] text-slate-500 font-medium block truncate">{lvl.level}</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">{lvl.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: PEMBAGIAN PENERIMA MANFAAT PER DESA / KELURAHAN DAMPINGAN */}
      <div id="village-beneficiaries-breakdown" className="bg-white rounded-2xl border border-orange-100 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 border border-orange-100 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {isId 
                    ? 'Pembagian Penerima Manfaat Sesuai Desa / Kelurahan Dampingan'
                    : 'Beneficiary Distribution by Assisted Villages / Wards'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
                  {disaggSummary.villageBreakdown.length} {isId ? 'Desa/Kelurahan' : 'Villages/Wards'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isId 
                  ? 'Sebaran individu unik penerima manfaat langsung (Zero Double Counting) di seluruh desa/kelurahan dampingan proyek.'
                  : 'Distribution of unique direct beneficiaries (Zero Double-Counting) across all project assisted villages and communities.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('beneficiaries')}
            className="self-start sm:self-auto text-xs font-semibold text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-orange-200 whitespace-nowrap shrink-0"
          >
            {isId ? 'Database Lengkap' : 'Full Database'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {disaggSummary.villageBreakdown.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {isId 
              ? 'Belum ada data penerima manfaat dengan informasi desa/kelurahan untuk proyek ini.'
              : 'No beneficiary data with village/ward information available for this project yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart Column */}
            <div className="lg:col-span-5 bg-orange-50/30 p-4 rounded-xl border border-orange-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                {isId ? 'Grafik Komparasi Penerima Manfaat per Desa' : 'Village Beneficiary Comparison Chart'}
              </span>
              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={disaggSummary.villageBreakdown.slice(0, 8)} 
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fed7aa" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis 
                      dataKey="village" 
                      type="category" 
                      tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} 
                      width={110} 
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white text-slate-900 border border-orange-200 p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                              <p className="font-bold text-orange-700">{d.village}</p>
                              <p>{isId ? 'Total Unik' : 'Total Unique'}: <strong>{d.totalUnique} {isId ? 'orang' : 'people'}</strong> ({d.percentage}%)</p>
                              <p className="text-blue-600">{isId ? 'Laki-laki' : 'Male'}: {d.lakiLaki} {isId ? 'orang' : 'people'}</p>
                              <p className="text-pink-600">{isId ? 'Perempuan' : 'Female'}: {d.perempuan} {isId ? 'orang' : 'people'}</p>
                              <p className="text-rose-600">{isId ? 'Disabilitas' : 'Disability'}: {d.disabilityCount} {isId ? 'orang' : 'people'}</p>
                              <p className="text-purple-600">{isId ? 'IPLC (Adat/Lokal)' : 'IPLC (Indigenous/Local)'}: {d.iplcCount} {isId ? 'orang' : 'people'}</p>
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

            {/* Detailed Breakdown Table */}
            <div className="lg:col-span-7 overflow-hidden rounded-xl border border-orange-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold">
                      <th className="py-2.5 px-3">{isId ? 'Desa / Kelurahan' : 'Village / Ward'}</th>
                      <th className="py-2.5 px-2 text-center">{isId ? 'Total Unik' : 'Total Unique'}</th>
                      <th className="py-2.5 px-2">{isId ? 'Proporsi (%)' : 'Proportion (%)'}</th>
                      <th className="py-2.5 px-2 text-center">{isId ? 'L / P' : 'M / F'}</th>
                      <th className="py-2.5 px-2 text-center">{isId ? 'Disabilitas' : 'Disability'}</th>
                      <th className="py-2.5 px-2 text-center">IPLC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100/60">
                    {disaggSummary.villageBreakdown.map((item, idx) => (
                      <tr key={item.village} className={idx % 2 === 0 ? 'bg-white hover:bg-orange-50/40' : 'bg-orange-50/20 hover:bg-orange-50/60'}>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">
                            {item.village}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="font-bold text-slate-900 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded text-xs tabular-nums">
                            {item.totalUnique}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-orange-100/70 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" 
                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-600 text-[11px] w-9 text-right tabular-nums">
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
        )}
      </div>

      {/* SECTION: ACTIVITY CALENDAR & TIMELINE SCHEDULE */}
      <ActivityCalendar
        projects={projects}
        attendances={attendances}
        beneficiaries={beneficiaries}
        selectedProjectId={selectedProjectId}
        onNavigate={onNavigate}
        onOpenNewActivityModal={onOpenNewActivityModal}
      />
    </div>
  );
}
