import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Layers, 
  Activity as ActivityIcon, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  BarChart2,
  Calendar,
  Award,
  Crown,
  Flag,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Project, Indicator, IndicatorLevel } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { exportIndicatorAchievementsToXLSX } from '../utils/exportXlsx';

interface IndicatorChartsViewProps {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
}

export default function IndicatorChartsView({
  projects,
  selectedProjectId,
  setSelectedProjectId
}: IndicatorChartsViewProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [levelFilter, setLevelFilter] = useState<'ALL' | 'Goal' | 'Outcome' | 'Output' | 'Activity'>('ALL');
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState<string>('ALL');

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Extract all indicators across hierarchical levels
  const allIndicators = useMemo(() => {
    const list: (Indicator & { projectName: string; parentCodeTitle: string })[] = [];

    const targetProjects = selectedProjectId === 'all' ? projects : (activeProject ? [activeProject] : projects);

    targetProjects.forEach(proj => {
      // Goal / Impact indicators
      (proj.goalIndicators || []).forEach(ind => {
        list.push({ ...ind, level: 'Goal', projectName: proj.title, parentCodeTitle: `Impact / Goal: ${proj.code} - ${proj.title}` });
      });

      // Outcomes
      proj.outcomes.forEach(oc => {
        oc.indicators.forEach(ind => {
          list.push({ ...ind, projectName: proj.title, parentCodeTitle: `Outcome: ${oc.code} - ${oc.title}` });
        });

        // Outputs
        oc.outputs.forEach(op => {
          op.indicators.forEach(ind => {
            list.push({ ...ind, projectName: proj.title, parentCodeTitle: `Output: ${op.code} - ${op.title}` });
          });

          // Activities
          op.activities.forEach(act => {
            act.indicators.forEach(ind => {
              list.push({ ...ind, projectName: proj.title, parentCodeTitle: `${isId ? 'Kegiatan' : 'Activity'}: ${act.code} - ${act.title}` });
            });
          });
        });
      });
    });

    return list;
  }, [projects, selectedProjectId, activeProject, isId]);

  // Filtered list
  const filteredIndicators = useMemo(() => {
    return allIndicators.filter(ind => {
      if (levelFilter !== 'ALL' && ind.level !== levelFilter) return false;
      return true;
    });
  }, [allIndicators, levelFilter]);

  // Indicators by specific levels
  const goalIndicators = useMemo(() => allIndicators.filter(ind => ind.level === 'Goal'), [allIndicators]);
  const outcomeIndicators = useMemo(() => allIndicators.filter(ind => ind.level === 'Outcome'), [allIndicators]);
  const outputIndicators = useMemo(() => allIndicators.filter(ind => ind.level === 'Output'), [allIndicators]);
  const activityIndicators = useMemo(() => allIndicators.filter(ind => ind.level === 'Activity'), [allIndicators]);

  // Prepare chart data for Goal / Impact indicators
  const goalChartData = useMemo(() => {
    return goalIndicators.map(ind => {
      const progress = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
      return {
        code: ind.code,
        name: ind.name.length > 25 ? ind.name.substring(0, 25) + '...' : ind.name,
        fullName: ind.name,
        baseline: ind.baseline,
        target: ind.target,
        actual: ind.actual,
        progress: progress,
        unit: ind.unit,
        status: ind.status
      };
    });
  }, [goalIndicators]);

  // Prepare chart data for Outcome indicators
  const outcomeChartData = useMemo(() => {
    return outcomeIndicators.map(ind => {
      const progress = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
      return {
        code: ind.code,
        name: ind.name.length > 25 ? ind.name.substring(0, 25) + '...' : ind.name,
        fullName: ind.name,
        baseline: ind.baseline,
        target: ind.target,
        actual: ind.actual,
        progress: progress,
        unit: ind.unit,
        status: ind.status
      };
    });
  }, [outcomeIndicators]);

  // Prepare chart data for Output indicators
  const outputChartData = useMemo(() => {
    return outputIndicators.map(ind => {
      const progress = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
      return {
        code: ind.code,
        name: ind.name.length > 25 ? ind.name.substring(0, 25) + '...' : ind.name,
        fullName: ind.name,
        baseline: ind.baseline,
        target: ind.target,
        actual: ind.actual,
        progress: progress,
        unit: ind.unit,
        status: ind.status
      };
    });
  }, [outputIndicators]);

  // Prepare chart data for Activity indicators
  const activityChartData = useMemo(() => {
    return activityIndicators.map(ind => {
      const progress = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
      return {
        code: ind.code,
        name: ind.name.length > 25 ? ind.name.substring(0, 25) + '...' : ind.name,
        fullName: ind.name,
        baseline: ind.baseline,
        target: ind.target,
        actual: ind.actual,
        progress: progress,
        unit: ind.unit,
        status: ind.status
      };
    });
  }, [activityIndicators]);

  // Status breakdown
  const statusStats = useMemo(() => {
    let achieved = 0;
    let onTrack = 0;
    let delayed = 0;
    let notStarted = 0;

    allIndicators.forEach(ind => {
      if (ind.status === 'Tercapai') achieved++;
      else if (ind.status === 'Sesuai Target (On-Track)') onTrack++;
      else if (ind.status === 'Perlu Perhatian (Delayed)') delayed++;
      else notStarted++;
    });

    const total = allIndicators.length || 1;
    return {
      achieved,
      onTrack,
      delayed,
      notStarted,
      total: allIndicators.length,
      achievedPct: Math.round((achieved / total) * 100),
      onTrackPct: Math.round((onTrack / total) * 100),
      delayedPct: Math.round((delayed / total) * 100)
    };
  }, [allIndicators]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Tercapai':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{isId ? 'Tercapai' : 'Achieved'}</span>;
      case 'Sesuai Target (On-Track)':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">{isId ? 'Sesuai Target' : 'On-Track'}</span>;
      case 'Perlu Perhatian (Delayed)':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{isId ? 'Perlu Perhatian' : 'Delayed'}</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{isId ? 'Belum Mulai' : 'Not Started'}</span>;
    }
  };

  const handleExportIndicatorCharts = () => {
    const targetProjects = selectedProjectId === 'all' ? projects : (activeProject ? [activeProject] : projects);
    const projTitle = selectedProjectId === 'all' 
      ? 'Portofolio_Semua_Proyek' 
      : (activeProject?.code || 'Proyek');

    const filename = `Capaian_Indikator_Grafik_${projTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    exportIndicatorAchievementsToXLSX({
      projects: targetProjects,
      projectName: selectedProjectId === 'all' ? 'Portofolio Agregat Seluruh Proyek' : `[${activeProject?.code}] ${activeProject?.title}`,
      filename
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Project Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
              M&E Analytics
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isId ? 'Grafik & Analitik Capaian Indikator' : 'Indicator Performance & Progress Analytics'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isId 
              ? 'Visualisasi target vs realisasi aktual indikator kerangka logis di tingkat Outcome, Output, dan Kegiatan.'
              : 'Target vs. Actual realization visualizer across Outcome, Output, and Activity indicator levels.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              {isId ? 'Filter Proyek:' : 'Filter Project:'}
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{isId ? 'Semua Proyek (Portofolio Agregat)' : 'All Projects (Portfolio Aggregated)'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportIndicatorCharts}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            title={isId ? 'Ekspor seluruh data capaian indikator ke file Excel (.xlsx)' : 'Export indicator dataset to Excel (.xlsx)'}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isId ? 'Ekspor Capaian' : 'Export Data'}</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">{isId ? 'Total Indikator' : 'Total Indicators'}</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{statusStats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {goalIndicators.length} Goal/Impact • {outcomeIndicators.length} Outcome • {outputIndicators.length} Output • {activityIndicators.length} {isId ? 'Kegiatan' : 'Activity'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-emerald-700">{isId ? 'Tercapai (Achieved)' : 'Achieved'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{statusStats.achieved}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            {statusStats.achievedPct}% {isId ? 'dari total indikator' : 'of total indicators'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-blue-700">{isId ? 'Sesuai Target (On-Track)' : 'On-Track'}</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{statusStats.onTrack}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            {statusStats.onTrackPct}% {isId ? 'dalam progres aman' : 'progressing steadily'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-amber-700">{isId ? 'Perlu Perhatian' : 'Needs Attention'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{statusStats.delayed}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            {statusStats.delayedPct}% {isId ? 'capaian tertunda' : 'delayed indicators'}
          </div>
        </div>
      </div>

      {/* Level Filter Buttons */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          {isId ? 'Tampilkan Tingkat:' : 'Display Level:'}
        </span>
        <button
          onClick={() => setLevelFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            levelFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isId ? 'Semua Level' : 'All Levels'} ({allIndicators.length})
        </button>
        <button
          onClick={() => setLevelFilter('Goal')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            levelFilter === 'Goal'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          {isId ? 'Goal / Impact (Dampak)' : 'Goal / Impact'} ({goalIndicators.length})
        </button>
        <button
          onClick={() => setLevelFilter('Outcome')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            levelFilter === 'Outcome'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Outcome ({outcomeIndicators.length})
        </button>
        <button
          onClick={() => setLevelFilter('Output')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            levelFilter === 'Output'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Output ({outputIndicators.length})
        </button>
        <button
          onClick={() => setLevelFilter('Activity')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            levelFilter === 'Activity'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
          }`}
        >
          <ActivityIcon className="w-3.5 h-3.5" />
          {isId ? 'Kegiatan (Activity)' : 'Activity'} ({activityIndicators.length})
        </button>
      </div>

      {/* SECTION 0: Grafik Indikator Goal / Impact */}
      {(levelFilter === 'ALL' || levelFilter === 'Goal') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Flag className="w-4 h-4" />
                </div>
                {isId ? 'Grafik Indikator Goal / Impact (Dampak Jangka Panjang Proyek)' : 'Goal / Impact Indicators Progress (Long-term Impact)'}
              </h2>
              <p className="text-xs text-slate-500">
                {isId 
                  ? 'Perbandingan Nilai Awal (Baseline), Target Akhir, dan Realisasi Aktual Indikator Tingkat Dampak / Goal'
                  : 'Baseline vs. Final Target vs. Current Actual per Goal/Impact indicator'}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              {goalIndicators.length} {isId ? 'Indikator Goal / Impact' : 'Goal/Impact Indicators'}
            </span>
          </div>

          {goalChartData.length > 0 ? (
            <div className="space-y-6">
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalChartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1">
                              <p className="font-bold text-emerald-400">{data.code}: {data.fullName}</p>
                              <p className="text-slate-300">Baseline: <strong className="text-white">{data.baseline} {data.unit}</strong></p>
                              <p className="text-slate-300">Target Goal: <strong className="text-emerald-300">{data.target} {data.unit}</strong></p>
                              <p className="text-slate-300">{isId ? 'Realisasi Aktual:' : 'Actual:'} <strong className="text-cyan-300">{data.actual} {data.unit}</strong></p>
                              <p className="text-slate-300">{isId ? 'Capaian:' : 'Progress:'} <strong className="text-white">{data.progress}%</strong> ({data.status})</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="baseline" name={isId ? "Baseline (Nilai Awal)" : "Baseline"} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name={isId ? "Target Goal / Impact" : "Goal Target"} fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name={isId ? "Realisasi Aktual" : "Actual Reached"} fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Goal cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {goalIndicators.map(ind => {
                  const progress = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
                  return (
                    <div key={ind.id} className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex flex-col justify-between gap-2">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200/80">
                            {ind.code}
                          </span>
                          {getStatusBadge(ind.status)}
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{ind.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ind.definition || ind.parentCodeTitle}</p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-emerald-200/60">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Target: <strong>{ind.target} {ind.unit}</strong></span>
                          <span className="text-slate-700 font-bold">{isId ? 'Aktual:' : 'Actual:'} <strong className="text-emerald-700">{ind.actual} {ind.unit}</strong> ({progress}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-600' : progress >= 60 ? 'bg-teal-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              {isId ? 'Tidak ada indikator Goal / Impact yang ditemukan untuk proyek ini.' : 'No Goal / Impact indicators found for this project.'}
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: Grafik Indikator Outcome */}
      {(levelFilter === 'ALL' || levelFilter === 'Outcome') && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" />
              {isId ? 'Grafik Indikator Outcome (Hasil Jangka Menengah)' : 'Outcome Indicators Progress (Medium-term Results)'}
            </h2>
            <p className="text-xs text-slate-500">
              {isId 
                ? 'Perbandingan Nilai Awal (Baseline), Target Akhir, dan Realisasi Aktual per Indikator Outcome'
                : 'Baseline vs. Final Target vs. Current Actual per Outcome indicator'}
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
            {outcomeIndicators.length} {isId ? 'Indikator Outcome' : 'Outcome Indicators'}
          </span>
        </div>

        {outcomeChartData.length > 0 ? (
          <div className="space-y-6">
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1">
                            <p className="font-bold text-amber-400">{data.code}: {data.fullName}</p>
                            <p className="text-slate-300">Baseline: <strong className="text-white">{data.baseline} {data.unit}</strong></p>
                            <p className="text-slate-300">Target: <strong className="text-amber-300">{data.target} {data.unit}</strong></p>
                            <p className="text-slate-300">{isId ? 'Realisasi Aktual:' : 'Actual:'} <strong className="text-emerald-400">{data.actual} {data.unit}</strong></p>
                            <p className="text-slate-300">{isId ? 'Capaian:' : 'Progress:'} <strong className="text-white">{data.progress}%</strong> ({data.status})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="baseline" name={isId ? "Baseline (Nilai Awal)" : "Baseline"} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name={isId ? "Target Outcome" : "Target"} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name={isId ? "Realisasi Aktual" : "Actual"} fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed outcome cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {outcomeIndicators.map(ind => {
                const progress = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
                return (
                  <div key={ind.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          {ind.code}
                        </span>
                        {getStatusBadge(ind.status)}
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{ind.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ind.definition}</p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Target: <strong>{ind.target} {ind.unit}</strong></span>
                        <span className="text-slate-700 font-bold">{isId ? 'Aktual:' : 'Actual:'} <strong className="text-emerald-600">{ind.actual} {ind.unit}</strong> ({progress}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : progress >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            {isId ? 'Tidak ada indikator outcome yang ditemukan.' : 'No outcome indicators found.'}
          </div>
        )}
      </div>
      )}

      {/* SECTION 2: Grafik Indikator Output */}
      {(levelFilter === 'ALL' || levelFilter === 'Output') && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              {isId ? 'Grafik Indikator Output (Keluaran Proyek)' : 'Output Indicators Progress (Project Deliverables)'}
            </h2>
            <p className="text-xs text-slate-500">
              {isId 
                ? 'Perbandingan Target vs Realisasi Aktual per Indikator Output (Pelatihan, Dokumen, Sarana, Fasilitas)'
                : 'Target vs. Actual realization per Output indicator'}
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold">
            {outputIndicators.length} {isId ? 'Indikator Output' : 'Output Indicators'}
          </span>
        </div>

        {outputChartData.length > 0 ? (
          <div className="space-y-6">
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outputChartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1">
                            <p className="font-bold text-purple-400">{data.code}: {data.fullName}</p>
                            <p className="text-slate-300">Baseline: <strong className="text-white">{data.baseline} {data.unit}</strong></p>
                            <p className="text-slate-300">Target Output: <strong className="text-purple-300">{data.target} {data.unit}</strong></p>
                            <p className="text-slate-300">{isId ? 'Realisasi:' : 'Actual:'} <strong className="text-emerald-400">{data.actual} {data.unit}</strong></p>
                            <p className="text-slate-300">{isId ? 'Capaian:' : 'Progress:'} <strong className="text-white">{data.progress}%</strong> ({data.status})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="target" name={isId ? "Target Output" : "Target Output"} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name={isId ? "Realisasi Aktual" : "Actual"} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Output cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {outputIndicators.map(ind => {
                const progress = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
                return (
                  <div key={ind.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          {ind.code}
                        </span>
                        {getStatusBadge(ind.status)}
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{ind.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {isId ? 'Bukti Verifikasi:' : 'Means of Verification:'} {ind.meansOfVerification}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Target: <strong>{ind.target} {ind.unit}</strong></span>
                        <span className="text-slate-700 font-bold">{isId ? 'Aktual:' : 'Actual:'} <strong className="text-purple-600">{ind.actual} {ind.unit}</strong> ({progress}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            {isId ? 'Tidak ada indikator output yang ditemukan.' : 'No output indicators found.'}
          </div>
        )}
      </div>
      )}

      {/* SECTION 3: Grafik Indikator Activity */}
      {(levelFilter === 'ALL' || levelFilter === 'Activity') && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-blue-600" />
              {isId ? 'Grafik Indikator Activity (Aktivitas Lapangan)' : 'Activity Indicators Progress (Field Activities)'}
            </h2>
            <p className="text-xs text-slate-500">
              {isId 
                ? 'Pelacakan kuantitatif penyelenggaraan sesi kegiatan, pelatihan teknis, dan target kehadiran'
                : 'Quantitative tracking of activity sessions, technical training events, and attendance targets'}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold">
            {activityIndicators.length} {isId ? 'Indikator Activity' : 'Activity Indicators'}
          </span>
        </div>

        {activityChartData.length > 0 ? (
          <div className="space-y-6">
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityChartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1">
                            <p className="font-bold text-blue-400">{data.code}: {data.fullName}</p>
                            <p className="text-slate-300">{isId ? 'Target Kegiatan:' : 'Activity Target:'} <strong className="text-blue-300">{data.target} {data.unit}</strong></p>
                            <p className="text-slate-300">{isId ? 'Realisasi:' : 'Actual:'} <strong className="text-emerald-400">{data.actual} {data.unit}</strong></p>
                            <p className="text-slate-300">{isId ? 'Capaian:' : 'Progress:'} <strong className="text-white">{data.progress}%</strong> ({data.status})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="target" name={isId ? "Target Partisipan/Sesi" : "Target"} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name={isId ? "Realisasi Hadir" : "Actual"} fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activity indicator list cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {activityIndicators.map(ind => {
                const progress = ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0;
                return (
                  <div key={ind.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {ind.code}
                        </span>
                        {getStatusBadge(ind.status)}
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{ind.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ind.parentCodeTitle}</p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Target: <strong>{ind.target} {ind.unit}</strong></span>
                        <span className="text-slate-700 font-bold">{isId ? 'Aktual:' : 'Actual:'} <strong className="text-blue-600">{ind.actual} {ind.unit}</strong> ({progress}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            {isId ? 'Tidak ada indikator activity yang ditemukan.' : 'No activity indicators found.'}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
