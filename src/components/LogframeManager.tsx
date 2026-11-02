import { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FolderTree, 
  Target,
  Search,
  Trash2,
  Paperclip,
  Table as TableIcon,
  Filter,
  Calendar,
  Sparkles,
  ArrowUpDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Project, 
  Outcome, 
  Output, 
  Activity, 
  Indicator, 
  StatusProgress, 
  MoVDocument, 
  PeriodicProgressLog,
  IndicatorLevel,
  IndicatorUnit
} from '../types';
import IndicatorPeriodicUpdateModal from './IndicatorPeriodicUpdateModal';
import { useLanguage } from '../context/LanguageContext';
import { 
  formatUnit, 
  formatStatusProgress, 
  formatIndicatorLevel, 
  formatReportingFrequency 
} from '../utils/bilingual';
import { exportIndicatorAchievementsToXLSX } from '../utils/exportXlsx';

interface LogframeManagerProps {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  isAdmin: boolean;
  onEditProject?: (project: Project) => void;
  onUpdateIndicator: (
    projectId: string, 
    indicatorId: string, 
    newActual: number, 
    newStatus: StatusProgress, 
    notes?: string,
    periodicLog?: PeriodicProgressLog,
    newMovDocuments?: MoVDocument[]
  ) => void;
  onAddOutcome: (projectId: string, outcome: Partial<Outcome>) => void;
  onUpdateOutcome?: (projectId: string, outcomeId: string, outcome: Partial<Outcome>) => void;
  onDeleteOutcome?: (projectId: string, outcomeId: string) => void;
  onAddOutput: (projectId: string, outcomeId: string, output: Partial<Output>) => void;
  onUpdateOutput?: (projectId: string, outcomeId: string, outputId: string, output: Partial<Output>) => void;
  onDeleteOutput?: (projectId: string, outcomeId: string, outputId: string) => void;
  onAddActivity: (projectId: string, outputId: string, activity: Partial<Activity>) => void;
  onAddIndicator: (projectId: string, parentLevel: IndicatorLevel, parentId: string, indicator: Partial<Indicator>) => void;
  onUpdateIndicatorDetails?: (projectId: string, indicatorId: string, indicator: Partial<Indicator>) => void;
  onDeleteIndicator?: (projectId: string, indicatorId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onOpenNewActivityModal?: (projectId: string, outputId: string) => void;
}

export default function LogframeManager({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  isAdmin,
  onEditProject,
  onUpdateIndicator,
  onAddOutcome,
  onUpdateOutcome,
  onDeleteOutcome,
  onAddOutput,
  onUpdateOutput,
  onDeleteOutput,
  onAddActivity,
  onAddIndicator,
  onUpdateIndicatorDetails,
  onDeleteIndicator,
  onDeleteProject,
  onOpenNewActivityModal
}: LogframeManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  // View mode: 'table' (Tabel Rapi) or 'tree' (Hirarki Logframe)
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

  const [expandedOutcomes, setExpandedOutcomes] = useState<Record<string, boolean>>({
    'oc-1': true,
    'oc-2': true,
    'oc-2-1': true
  });
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({
    'op-1.1': true,
    'op-2.1': true,
    'op-2-1.1': true
  });

  // Table filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | IndicatorLevel>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'code' | 'name' | 'progress' | 'actual'>('progress');
  const [sortAsc, setSortAsc] = useState(false);

  // Modal states for indicator progress & MoV updating
  const [editingIndicatorProgress, setEditingIndicatorProgress] = useState<{
    projectId: string;
    indicator: Indicator;
  } | null>(null);

  // Outcome CRUD modal states
  const [showAddOutcomeModal, setShowAddOutcomeModal] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<{ projectId: string; outcome: Outcome } | null>(null);
  const [outcomeToDelete, setOutcomeToDelete] = useState<{ projectId: string; outcome: Outcome } | null>(null);
  const [outcomeFormCode, setOutcomeFormCode] = useState('');
  const [outcomeFormTitle, setOutcomeFormTitle] = useState('');
  const [outcomeFormDesc, setOutcomeFormDesc] = useState('');

  // Output CRUD modal states
  const [showAddOutputModal, setShowAddOutputModal] = useState<{ projectId: string; outcomeId: string } | null>(null);
  const [editingOutput, setEditingOutput] = useState<{ projectId: string; outcomeId: string; output: Output } | null>(null);
  const [outputToDelete, setOutputToDelete] = useState<{ projectId: string; outcomeId: string; output: Output } | null>(null);
  const [outputFormOutcomeId, setOutputFormOutcomeId] = useState('');
  const [outputFormCode, setOutputFormCode] = useState('');
  const [outputFormTitle, setOutputFormTitle] = useState('');
  const [outputFormDesc, setOutputFormDesc] = useState('');
  const [outputFormTargetDate, setOutputFormTargetDate] = useState('2026-12-31');

  // Indicator CRUD modal states
  const [showAddIndicatorModal, setShowAddIndicatorModal] = useState<{
    parentLevel: IndicatorLevel;
    parentId: string;
    parentTitle: string;
  } | null>(null);
  const [editingIndicatorDetails, setEditingIndicatorDetails] = useState<{ projectId: string; indicator: Indicator } | null>(null);
  const [indicatorToDelete, setIndicatorToDelete] = useState<{ projectId: string; indicator: Indicator } | null>(null);

  // Indicator Form state
  const [indFormCode, setIndFormCode] = useState('');
  const [indFormName, setIndFormName] = useState('');
  const [indFormDef, setIndFormDef] = useState('');
  const [indFormBaseline, setIndFormBaseline] = useState<number>(0);
  const [indFormTarget, setIndFormTarget] = useState<number>(100);
  const [indFormActual, setIndFormActual] = useState<number>(0);
  const [indFormUnit, setIndFormUnit] = useState<IndicatorUnit>('Orang / Individu');
  const [indFormMov, setIndFormMov] = useState('');
  const [indFormFreq, setIndFormFreq] = useState<'Bulanan' | 'Triwulanan' | 'Semesteran' | 'Tahunan' | 'Akhir Proyek'>('Semesteran');
  const [indFormStatus, setIndFormStatus] = useState<StatusProgress>('Belum Dimulai');

  const activeProject = projects.find(p => p.id === (selectedProjectId === 'all' ? projects[0]?.id : selectedProjectId)) || projects[0];

  const toggleOutcome = (id: string) => {
    setExpandedOutcomes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOutput = (id: string) => {
    setExpandedOutputs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Extract all indicators of activeProject (or all projects) for Table View
  const allFlattenedIndicators = useMemo(() => {
    const list: {
      indicator: Indicator;
      projectId: string;
      projectName: string;
      projectCode: string;
      parentContext: string;
      progressPct: number;
    }[] = [];

    const targetProjects = selectedProjectId === 'all' ? projects : (activeProject ? [activeProject] : projects);

    targetProjects.forEach(proj => {
      // Goal indicators
      proj.goalIndicators?.forEach(ind => {
        const pct = ind.target > 0 ? (ind.actual / ind.target) * 100 : 0;
        list.push({
          indicator: ind,
          projectId: proj.id,
          projectName: proj.title,
          projectCode: proj.code,
          parentContext: `Goal / Impact: ${proj.code}`,
          progressPct: pct
        });
      });

      // Outcomes
      proj.outcomes?.forEach(oc => {
        oc.indicators?.forEach(ind => {
          const pct = ind.target > 0 ? (ind.actual / ind.target) * 100 : 0;
          list.push({
            indicator: ind,
            projectId: proj.id,
            projectName: proj.title,
            projectCode: proj.code,
            parentContext: `Outcome: ${oc.code} - ${oc.title}`,
            progressPct: pct
          });
        });

        // Outputs
        oc.outputs?.forEach(op => {
          op.indicators?.forEach(ind => {
            const pct = ind.target > 0 ? (ind.actual / ind.target) * 100 : 0;
            list.push({
              indicator: ind,
              projectId: proj.id,
              projectName: proj.title,
              projectCode: proj.code,
              parentContext: `Output: ${op.code} - ${op.title}`,
              progressPct: pct
            });
          });

          // Activities
          op.activities?.forEach(act => {
            act.indicators?.forEach(ind => {
              const pct = ind.target > 0 ? (ind.actual / ind.target) * 100 : 0;
              list.push({
                indicator: ind,
                projectId: proj.id,
                projectName: proj.title,
                projectCode: proj.code,
                parentContext: `${isId ? 'Kegiatan' : 'Activity'}: ${act.code} - ${act.title}`,
                progressPct: pct
              });
            });
          });
        });
      });
    });

    return list;
  }, [projects, selectedProjectId, activeProject, isId]);

  // Filtered and sorted table indicators
  const filteredTableIndicators = useMemo(() => {
    return allFlattenedIndicators
      .filter(item => {
        const ind = item.indicator;
        if (levelFilter !== 'ALL' && ind.level !== levelFilter) return false;
        if (statusFilter !== 'ALL' && ind.status !== statusFilter) return false;
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchCode = ind.code.toLowerCase().includes(term);
          const matchName = ind.name.toLowerCase().includes(term);
          const matchDef = (ind.definition || '').toLowerCase().includes(term);
          const matchContext = item.parentContext.toLowerCase().includes(term);
          const matchProj = item.projectName.toLowerCase().includes(term);
          const matchUnit = ind.unit.toLowerCase().includes(term);
          return matchCode || matchName || matchDef || matchContext || matchProj || matchUnit;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'progress') {
          return sortAsc ? a.progressPct - b.progressPct : b.progressPct - a.progressPct;
        }
        if (sortField === 'code') {
          return sortAsc ? a.indicator.code.localeCompare(b.indicator.code) : b.indicator.code.localeCompare(a.indicator.code);
        }
        if (sortField === 'name') {
          return sortAsc ? a.indicator.name.localeCompare(b.indicator.name) : b.indicator.name.localeCompare(a.indicator.name);
        }
        if (sortField === 'actual') {
          return sortAsc ? a.indicator.actual - b.indicator.actual : b.indicator.actual - a.indicator.actual;
        }
        return 0;
      });
  }, [allFlattenedIndicators, levelFilter, statusFilter, searchTerm, sortField, sortAsc]);

  // Metric stats for table header
  const stats = useMemo(() => {
    const total = allFlattenedIndicators.length;
    if (total === 0) return { total: 0, avgProgress: 0, achieved: 0, onTrack: 0, delayed: 0, notStarted: 0 };

    const sumProgress = allFlattenedIndicators.reduce((acc, curr) => acc + curr.progressPct, 0);
    const achieved = allFlattenedIndicators.filter(i => i.indicator.status === 'Tercapai' || i.progressPct >= 100).length;
    const onTrack = allFlattenedIndicators.filter(i => i.indicator.status === 'Sesuai Target (On-Track)' && i.progressPct < 100).length;
    const delayed = allFlattenedIndicators.filter(i => i.indicator.status === 'Perlu Perhatian (Delayed)').length;
    const notStarted = allFlattenedIndicators.filter(i => i.indicator.status === 'Belum Dimulai').length;

    return {
      total,
      avgProgress: Math.round(sumProgress / total),
      achieved,
      onTrack,
      delayed,
      notStarted
    };
  }, [allFlattenedIndicators]);

  // Export handlers
  const handleExportAllIndicators = () => {
    const filename = `Capaian_Indikator_${activeProject?.code || 'Proyek'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportIndicatorAchievementsToXLSX({
      projects: activeProject ? [activeProject] : projects,
      projectName: activeProject ? `[${activeProject.code}] ${activeProject.title}` : 'Semua Proyek Aktif',
      filename
    });
  };

  const handleExportFilteredIndicators = () => {
    if (!activeProject) return;
    const customList = filteredTableIndicators.map(item => ({
      id: item.indicator.id,
      code: item.indicator.code,
      level: item.level,
      name: item.indicator.name,
      projectName: activeProject.title,
      parentContext: item.parentContext,
      definition: item.indicator.definition,
      baseline: item.indicator.baseline,
      target: item.indicator.target,
      actual: item.indicator.actual,
      unit: item.indicator.unit,
      status: item.indicator.status,
      meansOfVerification: item.indicator.meansOfVerification,
      movDocuments: item.indicator.movDocuments,
      frequency: item.indicator.frequency,
      lastUpdated: item.indicator.lastUpdated,
      progressHistory: item.indicator.progressHistory
    }));

    const filename = `Capaian_Indikator_Tersaring_${activeProject.code || 'Proyek'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportIndicatorAchievementsToXLSX({
      customIndicators: customList,
      projectName: `[${activeProject.code}] ${activeProject.title} (Filter: ${levelFilter})`,
      filename
    });
  };

  // Status badge renderer
  const getStatusBadge = (status: StatusProgress) => {
    switch (status) {
      case 'Tercapai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {formatStatusProgress('Tercapai', language)}
          </span>
        );
      case 'Sesuai Target (On-Track)':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" /> {formatStatusProgress('Sesuai Target (On-Track)', language)}
          </span>
        );
      case 'Perlu Perhatian (Delayed)':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> {formatStatusProgress('Perlu Perhatian (Delayed)', language)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            {formatStatusProgress('Belum Dimulai', language)}
          </span>
        );
    }
  };

  // Level badge renderer
  const getLevelBadge = (level: IndicatorLevel) => {
    switch (level) {
      case 'Goal':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">{formatIndicatorLevel('Goal', language)}</span>;
      case 'Outcome':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">{formatIndicatorLevel('Outcome', language)}</span>;
      case 'Output':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">{formatIndicatorLevel('Output', language)}</span>;
      case 'Activity':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">{formatIndicatorLevel('Activity', language)}</span>;
    }
  };

  // Progress Bar renderer with dynamic aesthetics
  const renderProgressBar = (actual: number, target: number, pct: number) => {
    const safePct = Math.round(pct);
    let barColor = 'bg-slate-400';
    let textColor = 'text-slate-700';
    let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';

    if (safePct >= 100) {
      barColor = 'bg-emerald-500';
      textColor = 'text-emerald-700';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    } else if (safePct >= 75) {
      barColor = 'bg-blue-500';
      textColor = 'text-blue-700';
      badgeColor = 'bg-blue-50 text-blue-700 border-blue-300';
    } else if (safePct >= 40) {
      barColor = 'bg-amber-500';
      textColor = 'text-amber-700';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
    } else if (safePct > 0) {
      barColor = 'bg-rose-500';
      textColor = 'text-rose-700';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-300';
    }

    return (
      <div className="w-full space-y-1.5 min-w-[130px]">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-bold ${textColor}`}>
            {safePct}%
          </span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${badgeColor}`}>
            {safePct >= 100 ? (isId ? 'Tercapai' : 'Achieved') : safePct >= 75 ? (isId ? 'On-Track' : 'On-Track') : safePct >= 40 ? (isId ? 'Proses' : 'In Progress') : (isId ? 'Rendah' : 'Low')}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, safePct))}%` }}
          />
        </div>
      </div>
    );
  };

  // --- OUTCOME CRUD HANDLERS ---
  const handleOpenAddOutcome = () => {
    const nextNum = (activeProject?.outcomes?.length || 0) + 1;
    setOutcomeFormCode(`OC-${nextNum}`);
    setOutcomeFormTitle('');
    setOutcomeFormDesc('');
    setShowAddOutcomeModal(true);
  };

  const handleOpenEditOutcome = (outcome: Outcome) => {
    setEditingOutcome({ projectId: activeProject.id, outcome });
    setOutcomeFormCode(outcome.code);
    setOutcomeFormTitle(outcome.title);
    setOutcomeFormDesc(outcome.description || '');
  };

  const handleSaveOutcome = () => {
    if (!outcomeFormTitle.trim()) {
      alert(isId ? 'Mohon masukkan judul outcome.' : 'Please enter an outcome title.');
      return;
    }

    if (editingOutcome) {
      onUpdateOutcome?.(editingOutcome.projectId, editingOutcome.outcome.id, {
        code: outcomeFormCode.trim() || editingOutcome.outcome.code,
        title: outcomeFormTitle.trim(),
        description: outcomeFormDesc.trim()
      });
      setEditingOutcome(null);
    } else {
      onAddOutcome(activeProject.id, {
        code: outcomeFormCode.trim() || `OC-${Date.now().toString().slice(-2)}`,
        title: outcomeFormTitle.trim(),
        description: outcomeFormDesc.trim(),
        indicators: [],
        outputs: []
      });
      setShowAddOutcomeModal(false);
    }
  };

  const handleConfirmDeleteOutcome = () => {
    if (!outcomeToDelete) return;
    onDeleteOutcome?.(outcomeToDelete.projectId, outcomeToDelete.outcome.id);
    setOutcomeToDelete(null);
  };

  // --- OUTPUT CRUD HANDLERS ---
  const handleOpenAddOutput = (outcomeId?: string) => {
    const targetOcId = outcomeId || activeProject?.outcomes?.[0]?.id || '';
    const parentOc = activeProject?.outcomes?.find(o => o.id === targetOcId);
    const opIndex = (parentOc?.outputs?.length || 0) + 1;
    const ocCodeClean = parentOc ? parentOc.code.replace('OC-', '') : '1';

    setOutputFormOutcomeId(targetOcId);
    setOutputFormCode(`OP-${ocCodeClean}.${opIndex}`);
    setOutputFormTitle('');
    setOutputFormDesc('');
    setOutputFormTargetDate('2026-12-31');
    setShowAddOutputModal({ projectId: activeProject.id, outcomeId: targetOcId });
  };

  const handleOpenEditOutput = (outcomeId: string, output: Output) => {
    setEditingOutput({ projectId: activeProject.id, outcomeId, output });
    setOutputFormOutcomeId(outcomeId);
    setOutputFormCode(output.code);
    setOutputFormTitle(output.title);
    setOutputFormDesc(output.description || '');
    setOutputFormTargetDate(output.targetDate || '2026-12-31');
  };

  const handleSaveOutput = () => {
    if (!outputFormTitle.trim()) {
      alert(isId ? 'Mohon masukkan judul output.' : 'Please enter an output title.');
      return;
    }

    if (editingOutput) {
      onUpdateOutput?.(editingOutput.projectId, editingOutput.outcomeId, editingOutput.output.id, {
        code: outputFormCode.trim() || editingOutput.output.code,
        title: outputFormTitle.trim(),
        description: outputFormDesc.trim(),
        targetDate: outputFormTargetDate
      });
      setEditingOutput(null);
    } else if (showAddOutputModal) {
      onAddOutput(showAddOutputModal.projectId, outputFormOutcomeId || showAddOutputModal.outcomeId, {
        code: outputFormCode.trim() || `OP-${Date.now().toString().slice(-2)}`,
        title: outputFormTitle.trim(),
        description: outputFormDesc.trim(),
        targetDate: outputFormTargetDate,
        indicators: [],
        activities: []
      });
      setShowAddOutputModal(null);
    }
  };

  const handleConfirmDeleteOutput = () => {
    if (!outputToDelete) return;
    onDeleteOutput?.(outputToDelete.projectId, outputToDelete.outcomeId, outputToDelete.output.id);
    setOutputToDelete(null);
  };

  // --- INDICATOR CRUD HANDLERS ---
  const handleOpenAddIndicator = (parentLevel: IndicatorLevel, parentId: string, parentTitle: string) => {
    const randomCode = `IND-${Date.now().toString().slice(-4)}`;
    setIndFormCode(randomCode);
    setIndFormName('');
    setIndFormDef('');
    setIndFormBaseline(0);
    setIndFormTarget(100);
    setIndFormActual(0);
    setIndFormUnit('Orang / Individu');
    setIndFormMov(isId ? 'Daftar Presensi & Laporan Pelaksanaan' : 'Attendance List & Implementation Report');
    setIndFormFreq('Semesteran');
    setIndFormStatus('Belum Dimulai');

    setShowAddIndicatorModal({ parentLevel, parentId, parentTitle });
  };

  const handleOpenEditIndicatorDetails = (projectId: string, indicator: Indicator) => {
    setEditingIndicatorDetails({ projectId, indicator });
    setIndFormCode(indicator.code);
    setIndFormName(indicator.name);
    setIndFormDef(indicator.definition || '');
    setIndFormBaseline(indicator.baseline);
    setIndFormTarget(indicator.target);
    setIndFormActual(indicator.actual);
    setIndFormUnit(indicator.unit);
    setIndFormMov(indicator.meansOfVerification);
    setIndFormFreq(indicator.frequency);
    setIndFormStatus(indicator.status);
  };

  const handleSaveIndicatorForm = () => {
    if (!indFormName.trim()) {
      alert(isId ? 'Mohon masukkan nama indikator.' : 'Please enter indicator name.');
      return;
    }

    if (editingIndicatorDetails) {
      onUpdateIndicatorDetails?.(editingIndicatorDetails.projectId, editingIndicatorDetails.indicator.id, {
        code: indFormCode.trim() || editingIndicatorDetails.indicator.code,
        name: indFormName.trim(),
        definition: indFormDef.trim(),
        baseline: Number(indFormBaseline),
        target: Number(indFormTarget),
        actual: Number(indFormActual),
        unit: indFormUnit,
        meansOfVerification: indFormMov.trim(),
        frequency: indFormFreq,
        status: indFormStatus
      });
      setEditingIndicatorDetails(null);
    } else if (showAddIndicatorModal) {
      onAddIndicator(
        activeProject.id,
        showAddIndicatorModal.parentLevel,
        showAddIndicatorModal.parentId,
        {
          code: indFormCode.trim() || `IND-${Date.now().toString().slice(-4)}`,
          name: indFormName.trim(),
          definition: indFormDef.trim(),
          baseline: Number(indFormBaseline),
          target: Number(indFormTarget),
          actual: Number(indFormBaseline),
          unit: indFormUnit,
          meansOfVerification: indFormMov.trim() || (isId ? 'Laporan Dokumentasi & Verifikasi' : 'Documentation & Verification Report'),
          frequency: indFormFreq,
          status: indFormStatus,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      );
      setShowAddIndicatorModal(null);
    }
  };

  const handleConfirmDeleteIndicator = () => {
    if (!indicatorToDelete) return;
    onDeleteIndicator?.(indicatorToDelete.projectId, indicatorToDelete.indicator.id);
    setIndicatorToDelete(null);
  };

  if (!activeProject) {
    return <div className="p-8 text-center text-slate-500">{isId ? 'Belum ada proyek yang dipilih.' : 'No project selected.'}</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Project Selector, View Mode Switcher, and Main Action */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
              {activeProject.code}
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isId ? 'Logframe & Matriks Capaian Indikator' : 'Logframe & Indicator Achievement Matrix'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            {isId 
              ? 'Sistem Manajemen Kerangka Logis Terpadu: Kelola hirarki Goal ➔ Outcome ➔ Output ➔ Activity serta pemantauan capaian target & bukti verifikasi (MoV).'
              : 'Integrated Logical Framework Management System: Manage Goal ➔ Outcome ➔ Output ➔ Activity hierarchy along with target achievement tracking & means of verification (MoV).'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{isId ? 'Proyek:' : 'Project:'}</span>
            <select
              value={activeProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              {isId ? 'Tabel Matriks' : 'Matrix Table'}
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'tree'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              {isId ? 'Struktur Hirarki' : 'Hierarchy Structure'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAllIndicators}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title={isId ? 'Ekspor seluruh capaian indikator proyek ke Excel (.xlsx)' : 'Export all indicator achievements to Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {isId ? 'Ekspor Capaian' : 'Export Progress'}
            </button>

            {isAdmin && (
              <>
                {onEditProject && (
                  <button
                    onClick={() => onEditProject(activeProject)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                    title={isId ? 'Edit Nama, Kode, dan Profil Proyek' : 'Edit Project Name, Code, and Profile'}
                  >
                    <Edit3 className="w-4 h-4 text-slate-600" />
                    <span>{isId ? 'Edit Proyek' : 'Edit Project'}</span>
                  </button>
                )}
                <button
                  onClick={handleOpenAddOutcome}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  + Outcome
                </button>
                <button
                  onClick={() => handleOpenAddOutput()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  + Output
                </button>
                {onDeleteProject && (
                  <button
                    onClick={() => onDeleteProject(activeProject.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition"
                    title={isId ? "Hapus Proyek" : "Delete Project"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            {isId ? 'Total Indikator' : 'Total Indicators'}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {isId ? 'Semua level kerangka logis' : 'All logical framework levels'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            {isId ? 'Rata-Rata Capaian' : 'Average Progress'}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-600">{stats.avgProgress}%</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {isId ? 'Akumulasi seluruh target' : 'Accumulated across all targets'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
            {isId ? 'Tercapai (100%+)' : 'Achieved (100%+)'}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{stats.achieved}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">
            {isId ? 'Target telah terpenuhi' : 'Target has been met'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider block mb-1">
            On-Track (75-99%)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-500">{stats.onTrack}</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {isId ? 'Sesuai linimasa kerja' : 'In line with work timeline'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block mb-1">
            {isId ? 'Perlu Perhatian' : 'Needs Attention'}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{stats.delayed}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-700/80 mt-1 block">
            {isId ? 'Perlu akselerasi' : 'Needs acceleration'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TABEL MATRIKS INDIKATOR YANG RAPI & BERSIH                        */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
          {/* Table Filters & Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isId ? "Cari kode, nama indikator, definisi, atau unit..." : "Search code, indicator name, definition, or unit..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Level Filter */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                >
                  <option value="ALL">{isId ? 'Semua Level' : 'All Levels'}</option>
                  <option value="Goal">{formatIndicatorLevel('Goal', language)}</option>
                  <option value="Outcome">{formatIndicatorLevel('Outcome', language)}</option>
                  <option value="Output">{formatIndicatorLevel('Output', language)}</option>
                  <option value="Activity">{formatIndicatorLevel('Activity', language)}</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="ALL">{isId ? 'Semua Status' : 'All Statuses'}</option>
                <option value="Tercapai">{formatStatusProgress('Tercapai', language)}</option>
                <option value="Sesuai Target (On-Track)">{formatStatusProgress('Sesuai Target (On-Track)', language)}</option>
                <option value="Perlu Perhatian (Delayed)">{formatStatusProgress('Perlu Perhatian (Delayed)', language)}</option>
                <option value="Belum Dimulai">{formatStatusProgress('Belum Dimulai', language)}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportFilteredIndicators}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                title={isId ? 'Ekspor tabel capaian indikator tersaring ke Excel' : 'Export filtered indicator table to Excel'}
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isId ? 'Ekspor Excel' : 'Export Excel'}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleOpenAddIndicator('Outcome', activeProject.outcomes[0]?.id || activeProject.id, activeProject.outcomes[0]?.title || activeProject.title)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" /> + {isId ? 'Indikator' : 'Indicator'}
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                  <th 
                    onClick={() => {
                      if (sortField === 'code') setSortAsc(!sortAsc);
                      else { setSortField('code'); setSortAsc(true); }
                    }}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isId ? 'Kode & Level' : 'Code & Level'}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => {
                      if (sortField === 'name') setSortAsc(!sortAsc);
                      else { setSortField('name'); setSortAsc(true); }
                    }}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition min-w-[220px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isId ? 'Indikator Kinerja' : 'Performance Indicator'}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Baseline</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Target</th>
                  <th 
                    onClick={() => {
                      if (sortField === 'actual') setSortAsc(!sortAsc);
                      else { setSortField('actual'); setSortAsc(false); }
                    }}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isId ? 'Realisasi Aktual' : 'Actual Value'}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => {
                      if (sortField === 'progress') setSortAsc(!sortAsc);
                      else { setSortField('progress'); setSortAsc(false); }
                    }}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition min-w-[160px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>{isId ? 'Capaian (%)' : 'Progress (%)'}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 min-w-[140px]">{isId ? 'Bukti MoV' : 'MoV Evidence'}</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">{isId ? 'Aksi' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTableIndicators.length > 0 ? (
                  filteredTableIndicators.map((item) => {
                    const ind = item.indicator;
                    return (
                      <tr key={ind.id} className="hover:bg-slate-50/70 transition">
                        {/* Kode & Level */}
                        <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block font-mono text-xs">
                              {ind.code}
                            </span>
                            {getLevelBadge(ind.level)}
                          </div>
                        </td>

                        {/* Indikator & Hirarki */}
                        <td className="py-3.5 px-3.5 align-top">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-xs leading-snug">
                              {ind.name}
                            </p>
                            {ind.definition && (
                              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                {ind.definition}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                              <span>{isId ? 'Frekuensi' : 'Freq'}: {formatReportingFrequency(ind.frequency, language)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Baseline */}
                        <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                          <div className="text-slate-600 font-medium">
                            {ind.baseline.toLocaleString(isId ? 'id-ID' : 'en-US')}
                            <span className="text-[10px] text-slate-400 block">{formatUnit(ind.unit, language)}</span>
                          </div>
                        </td>

                        {/* Target */}
                        <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                          <div className="font-bold text-slate-900">
                            {ind.target.toLocaleString(isId ? 'id-ID' : 'en-US')}
                            <span className="text-[10px] text-slate-400 block font-normal">{formatUnit(ind.unit, language)}</span>
                          </div>
                        </td>

                        {/* Realisasi Aktual */}
                        <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                          <div className="font-bold text-blue-600">
                            {ind.actual.toLocaleString(isId ? 'id-ID' : 'en-US')}
                            <span className="text-[10px] text-slate-400 block font-normal">{formatUnit(ind.unit, language)}</span>
                          </div>
                          {ind.lastUpdated && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              Rev: {ind.lastUpdated}
                            </span>
                          )}
                        </td>

                        {/* Capaian (%) */}
                        <td className="py-3.5 px-3.5 align-top">
                          {renderProgressBar(ind.actual, ind.target, item.progressPct)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                          {getStatusBadge(ind.status)}
                        </td>

                        {/* Bukti MoV */}
                        <td className="py-3.5 px-3.5 align-top">
                          <div className="space-y-1">
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                              {ind.meansOfVerification || (isId ? 'Dokumentasi & Laporan' : 'Documentation & Reports')}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              {ind.movDocuments && ind.movDocuments.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  <Paperclip className="w-2.5 h-2.5" />
                                  {ind.movDocuments.length} {isId ? 'Bukti MoV' : 'MoV Proof'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">{isId ? 'Belum ada file' : 'No files attached'}</span>
                              )}
                              {ind.progressHistory && ind.progressHistory.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  <Clock className="w-2.5 h-2.5" />
                                  {ind.progressHistory.length} Log
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-3.5 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => setEditingIndicatorProgress({ projectId: item.projectId, indicator: ind })}
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs flex items-center gap-1 transition"
                                  title={isId ? "Catat Realisasi Berkala & Lampirkan Dokumen MoV" : "Record Periodic Progress & Attach MoV"}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">{isId ? 'Catat Capaian' : 'Record Progress'}</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditIndicatorDetails(item.projectId, ind)}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                  title={isId ? "Edit Definisi & Target Indikator" : "Edit Indicator Definition & Target"}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setIndicatorToDelete({ projectId: item.projectId, indicator: ind })}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                  title={isId ? "Hapus Indikator Ini" : "Delete Indicator"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                      {isId ? 'Tidak ada indikator yang sesuai dengan filter atau kata kunci pencarian.' : 'No indicators found matching the filter or search criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STRUKTUR HIRARKI LOGFRAME (TREE VIEW DENGAN FULL CRUD)            */}
      {/* ========================================================================= */}
      {viewMode === 'tree' && (
        <div className="space-y-6">
          {/* Goal / Impact Level Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    {isId ? `Goal / Impact Proyek (${activeProject.code})` : `Project Goal / Impact (${activeProject.code})`}
                  </span>
                  <h3 className="font-bold text-sm text-emerald-200">{activeProject.title}</h3>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {onEditProject && (
                    <button
                      onClick={() => onEditProject(activeProject)}
                      className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600 flex items-center gap-1.5 transition shadow-xs"
                      title={isId ? "Edit Nama, Kode, dan Informasi Profil Proyek" : "Edit Project Name, Code, and Profile Details"}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      {isId ? 'Edit Nama & Info Proyek' : 'Edit Project Details'}
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenAddIndicator('Goal', activeProject.id, 'Goal / Impact')}
                    className="text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-900/40 hover:bg-emerald-800/60 px-3 py-1.5 rounded-lg border border-emerald-600/40 flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> + {isId ? 'Indikator Goal' : 'Goal Indicator'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm font-medium text-slate-100 leading-relaxed mb-4 max-w-4xl">
              {activeProject.goalStatement}
            </p>

            {/* Goal Indicators Cards */}
            {activeProject.goalIndicators && activeProject.goalIndicators.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-700/60">
                <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                  {isId ? 'Indikator Capaian Dampak Jangka Panjang (Goal Indicators):' : 'Long-Term Impact Achievement Indicators (Goal Indicators):'}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activeProject.goalIndicators.map(ind => {
                    const pct = ind.target > 0 ? (ind.actual / ind.target) * 100 : 0;
                    return (
                      <div key={ind.id} className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 text-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-emerald-400 font-mono text-xs">{ind.code}</span>
                            <h4 className="text-white font-bold text-xs mt-0.5">{ind.name}</h4>
                          </div>
                          {getStatusBadge(ind.status)}
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-lg text-[11px] text-slate-300 border border-slate-700/50">
                          <div>Baseline: <strong className="text-white block">{ind.baseline} {formatUnit(ind.unit, language)}</strong></div>
                          <div>Target: <strong className="text-white block">{ind.target} {formatUnit(ind.unit, language)}</strong></div>
                          <div>{isId ? 'Realisasi:' : 'Actual:'} <strong className="text-emerald-400 block">{ind.actual} {formatUnit(ind.unit, language)}</strong></div>
                        </div>

                        {renderProgressBar(ind.actual, ind.target, pct)}

                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 pt-2 border-t border-slate-700/50">
                          <div className="flex items-center gap-2">
                            {ind.movDocuments && ind.movDocuments.length > 0 && (
                              <span className="text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/40">
                                <Paperclip className="w-3 h-3" />
                                {ind.movDocuments.length} MoV
                              </span>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingIndicatorProgress({ projectId: activeProject.id, indicator: ind })}
                                className="text-emerald-400 hover:text-white font-semibold flex items-center gap-1 px-2 py-1 bg-emerald-900/40 hover:bg-emerald-800/60 rounded-lg border border-emerald-600/40 transition"
                              >
                                <Edit3 className="w-3 h-3" /> {isId ? 'Catat Capaian' : 'Record Progress'}
                              </button>
                              <button
                                onClick={() => handleOpenEditIndicatorDetails(activeProject.id, ind)}
                                className="p-1 text-slate-400 hover:text-white"
                                title={isId ? "Edit Detail" : "Edit Details"}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setIndicatorToDelete({ projectId: activeProject.id, indicator: ind })}
                                className="p-1 text-rose-400 hover:text-rose-300"
                                title={isId ? "Hapus" : "Delete"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Outcomes Hierarchy Container */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-indigo-600" />
                {isId ? 'Struktur Outcomes, Outputs & Activities' : 'Outcomes, Outputs & Activities Structure'}
              </h2>
              {isAdmin && (
                <button
                  onClick={handleOpenAddOutcome}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> + {isId ? 'Tambah Outcome' : 'Add Outcome'}
                </button>
              )}
            </div>

            {activeProject.outcomes?.map(outcome => {
              const isOcExpanded = expandedOutcomes[outcome.id] !== false;

              return (
                <div 
                  key={outcome.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Outcome Header Bar */}
                  <div className="bg-slate-50/90 p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div 
                      onClick={() => toggleOutcome(outcome.id)}
                      className="flex items-start gap-3 cursor-pointer flex-1"
                    >
                      <button className="mt-1 text-slate-400 hover:text-slate-700">
                        {isOcExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {outcome.code}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            {outcome.title}
                          </h3>
                        </div>
                        {outcome.description && (
                          <p className="text-xs text-slate-500">{outcome.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Outcome Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto flex-wrap">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenAddIndicator('Outcome', outcome.id, outcome.title)}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs transition"
                            title={isId ? "Tambah Indikator untuk Outcome ini" : "Add Indicator for this Outcome"}
                          >
                            <Plus className="w-3 h-3 text-indigo-600" /> + {isId ? 'Indikator' : 'Indicator'}
                          </button>
                          <button
                            onClick={() => handleOpenAddOutput(outcome.id)}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                            title={isId ? "Tambah Output di bawah Outcome ini" : "Add Output under this Outcome"}
                          >
                            <Plus className="w-3 h-3" /> + Output
                          </button>
                          <button
                            onClick={() => handleOpenEditOutcome(outcome)}
                            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 rounded-lg transition"
                            title={isId ? "Edit Data Outcome" : "Edit Outcome"}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setOutcomeToDelete({ projectId: activeProject.id, outcome })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition"
                            title={isId ? "Hapus Outcome ini" : "Delete Outcome"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Outcome Body */}
                  {isOcExpanded && (
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Outcome Level Indicators */}
                      {outcome.indicators && outcome.indicators.length > 0 && (
                        <div className="bg-indigo-50/40 rounded-xl p-4 border border-indigo-100 space-y-3">
                          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                            {isId ? `Indikator Capaian Tingkat Outcome (${outcome.code}):` : `Outcome-Level Achievement Indicators (${outcome.code}):`}
                          </span>
                          <div className="space-y-2.5">
                            {outcome.indicators.map(ind => {
                              const pct = ind.target > 0 ? (ind.actual / ind.target) * 100 : 0;
                              return (
                                <div key={ind.id} className="bg-white p-3.5 rounded-xl border border-indigo-200/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-indigo-700 font-mono text-xs">{ind.code}</span>
                                      {getStatusBadge(ind.status)}
                                      <span className="text-[10px] text-slate-400">{isId ? 'Frekuensi' : 'Freq'}: {formatReportingFrequency(ind.frequency, language)}</span>
                                      {ind.movDocuments && ind.movDocuments.length > 0 && (
                                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                                          <Paperclip className="w-2.5 h-2.5" />
                                          {ind.movDocuments.length} MoV
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-bold text-slate-900 text-xs">{ind.name}</p>
                                    <p className="text-[11px] text-slate-500">{isId ? 'Bukti' : 'Evidence'}: {ind.meansOfVerification}</p>
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-[240px]">
                                    <div className="flex-1">
                                      {renderProgressBar(ind.actual, ind.target, pct)}
                                      <div className="text-[10px] text-slate-500 mt-1">
                                        {isId ? 'Aktual' : 'Actual'}: <strong className="text-indigo-700">{ind.actual}</strong> / Target: <strong>{ind.target} {formatUnit(ind.unit, language)}</strong>
                                      </div>
                                    </div>

                                    {isAdmin && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => setEditingIndicatorProgress({ projectId: activeProject.id, indicator: ind })}
                                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                                        >
                                          <Edit3 className="w-3 h-3" /> Update
                                        </button>
                                        <button
                                          onClick={() => handleOpenEditIndicatorDetails(activeProject.id, ind)}
                                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                          title={isId ? "Edit" : "Edit"}
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => setIndicatorToDelete({ projectId: activeProject.id, indicator: ind })}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                          title={isId ? "Hapus" : "Delete"}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Nested Outputs Section */}
                      <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-200">
                        {outcome.outputs && outcome.outputs.length > 0 ? (
                          outcome.outputs.map(output => {
                            const isOpExpanded = expandedOutputs[output.id] !== false;

                            return (
                              <div key={output.id} className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div 
                                    onClick={() => toggleOutput(output.id)}
                                    className="flex items-start gap-2.5 cursor-pointer flex-1"
                                  >
                                    <button className="mt-0.5 text-slate-400 hover:text-slate-700">
                                      {isOpExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    </button>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                          {output.code}
                                        </span>
                                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                                          {output.title}
                                        </h4>
                                        {output.targetDate && (
                                          <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                            <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                            Target: {output.targetDate}
                                          </span>
                                        )}
                                      </div>
                                      {output.description && (
                                        <p className="text-[11px] text-slate-500 mt-0.5">{output.description}</p>
                                      )}
                                    </div>
                                  </div>

                                  {isAdmin && (
                                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                                      <button
                                        onClick={() => handleOpenAddIndicator('Output', output.id, output.title)}
                                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium shadow-2xs"
                                        title={isId ? "Tambah Indikator Output" : "Add Output Indicator"}
                                      >
                                        + {isId ? 'Indikator' : 'Indicator'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (onOpenNewActivityModal) {
                                            onOpenNewActivityModal(activeProject.id, output.id);
                                          } else {
                                            const actCode = `ACT-${output.code.replace('OP-', '')}.${output.activities.length + 1}`;
                                            onAddActivity(activeProject.id, output.id, {
                                              code: actCode,
                                              title: isId ? 'Kegiatan Teknis Lapangan Baru' : 'New Technical Field Activity',
                                              description: isId ? 'Pelaksanaan kegiatan sesuai rencana kerja' : 'Activity implementation according to work plan',
                                              location: isId ? 'Lokasi Proyek' : 'Project Location',
                                              province: activeProject.province,
                                              regency: isId ? 'Kabupaten Terkait' : 'Related Regency',
                                              startDate: new Date().toISOString().split('T')[0],
                                              endDate: new Date().toISOString().split('T')[0],
                                              budgetAllocated: 35000000,
                                              budgetSpent: 0,
                                              status: 'Direncanakan',
                                              leadPerson: activeProject.teamMembers[0]?.name || 'Project Officer',
                                              indicators: [],
                                              createdAt: new Date().toISOString().split('T')[0]
                                            });
                                          }
                                        }}
                                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                                        title={isId ? "Tambah Kegiatan di bawah Output ini" : "Add Activity under this Output"}
                                      >
                                        + {isId ? 'Kegiatan' : 'Activity'}
                                      </button>
                                      <button
                                        onClick={() => handleOpenEditOutput(outcome.id, output)}
                                        className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                                        title={isId ? "Edit Output" : "Edit Output"}
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setOutputToDelete({ projectId: activeProject.id, outcomeId: outcome.id, output })}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                        title={isId ? "Hapus Output" : "Delete Output"}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isOpExpanded && (
                                  <div className="space-y-3 pt-1">
                                    {/* Output Indicators */}
                                    {output.indicators && output.indicators.length > 0 && (
                                      <div className="space-y-2">
                                        {output.indicators.map(ind => {
                                          const pct = ind.target > 0 ? (ind.actual / ind.target) * 100 : 0;
                                          return (
                                            <div key={ind.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                                              <div className="flex-1 space-y-0.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                  <span className="font-bold text-amber-900 font-mono text-xs">{ind.code}</span>
                                                  <span className="font-bold text-slate-800">{ind.name}</span>
                                                  {getStatusBadge(ind.status)}
                                                  {ind.movDocuments && ind.movDocuments.length > 0 && (
                                                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                                                      <Paperclip className="w-2.5 h-2.5" />
                                                      {ind.movDocuments.length} MoV
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-[11px] text-slate-500">{isId ? 'Bukti' : 'Evidence'}: {ind.meansOfVerification}</p>
                                              </div>

                                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-[220px]">
                                                <div className="flex-1">
                                                  {renderProgressBar(ind.actual, ind.target, pct)}
                                                  <div className="text-[10px] text-slate-500 mt-1">
                                                    {isId ? 'Aktual' : 'Actual'}: <strong className="text-amber-700">{ind.actual}</strong> / Target: <strong>{ind.target} {formatUnit(ind.unit, language)}</strong>
                                                  </div>
                                                </div>
                                                {isAdmin && (
                                                  <div className="flex items-center gap-1">
                                                    <button
                                                      onClick={() => setEditingIndicatorProgress({ projectId: activeProject.id, indicator: ind })}
                                                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-blue-700 rounded-lg"
                                                      title={isId ? "Catat Capaian & MoV" : "Record Progress & MoV"}
                                                    >
                                                      <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                      onClick={() => handleOpenEditIndicatorDetails(activeProject.id, ind)}
                                                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                                                      title={isId ? "Edit Indikator" : "Edit Indicator"}
                                                    >
                                                      <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                      onClick={() => setIndicatorToDelete({ projectId: activeProject.id, indicator: ind })}
                                                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                                                      title={isId ? "Hapus Indikator" : "Delete Indicator"}
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Activities in this output */}
                                    <div className="space-y-1.5 pl-3 border-l-2 border-amber-300 pt-1">
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                        {isId ? `Daftar Aktivitas / Kegiatan Lapangan (${output.activities?.length || 0}):` : `Field Activities List (${output.activities?.length || 0}):`}
                                      </span>
                                      {output.activities && output.activities.length > 0 ? (
                                        output.activities.map(act => (
                                          <div key={act.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                                            <div>
                                              <span className="font-bold text-emerald-700 mr-2 font-mono text-xs">{act.code}</span>
                                              <span className="text-slate-800 font-semibold">{act.title}</span>
                                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                                PIC: {act.leadPerson} • {act.location} • Status: {act.status}
                                              </span>
                                            </div>
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                                              Rp {(act.budgetAllocated / 1000000).toFixed(0)} {isId ? 'Jt' : 'M'}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-[11px] text-slate-400 italic">{isId ? 'Belum ada kegiatan yang terdaftar di bawah output ini.' : 'No activities registered under this output yet.'}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-400 italic py-2">{isId ? 'Belum ada output di bawah outcome ini. Klik tombol "+ Output" untuk menambahkan output baru.' : 'No outputs under this outcome. Click "+ Output" button to add a new output.'}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: CRUD UNTUK OUTCOME, OUTPUT, DAN INDIKATOR                         */}
      {/* ========================================================================= */}

      {/* MODAL 1: ADD / EDIT OUTCOME */}
      {(showAddOutcomeModal || editingOutcome) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                {editingOutcome 
                  ? (isId ? 'Edit Data Outcome' : 'Edit Outcome Data') 
                  : (isId ? 'Tambah Outcome Logframe Baru' : 'Add New Logframe Outcome')}
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isId ? 'Kode Outcome:' : 'Outcome Code:'}</label>
                <input
                  type="text"
                  value={outcomeFormCode}
                  onChange={(e) => setOutcomeFormCode(e.target.value)}
                  placeholder={isId ? "Contoh: OC-1, OC-2" : "Example: OC-1, OC-2"}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isId ? 'Judul / Pernyataan Outcome:' : 'Outcome Title / Statement:'}</label>
                <input
                  type="text"
                  value={outcomeFormTitle}
                  onChange={(e) => setOutcomeFormTitle(e.target.value)}
                  placeholder={isId ? "Contoh: Peningkatan Kapasitas & Pendapatan Kelompok..." : "Example: Capacity Building & Community Income Enhancement..."}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isId ? 'Deskripsi & Ruang Lingkup:' : 'Description & Scope:'}</label>
                <textarea
                  rows={3}
                  value={outcomeFormDesc}
                  onChange={(e) => setOutcomeFormDesc(e.target.value)}
                  placeholder={isId ? "Penjelasan perubahan jangka menengah yang ditargetkan..." : "Explanation of targeted medium-term changes..."}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowAddOutcomeModal(false);
                  setEditingOutcome(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveOutcome}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition"
              >
                {editingOutcome ? (isId ? 'Simpan Perubahan' : 'Save Changes') : (isId ? 'Simpan Outcome' : 'Save Outcome')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE OUTCOME */}
      {outcomeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">{isId ? 'Hapus Outcome?' : 'Delete Outcome?'}</h3>
              <p className="text-xs text-slate-500">
                {isId ? 'Apakah Anda yakin ingin menghapus outcome' : 'Are you sure you want to delete outcome'} <strong className="text-rose-600">{outcomeToDelete.outcome.code}: {outcomeToDelete.outcome.title}</strong>?
              </p>
              <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2 text-left">
                {isId 
                  ? 'Peringatan: Seluruh Output, Kegiatan, dan Indikator yang berada di bawah Outcome ini akan ikut terhapus.'
                  : 'Warning: All Outputs, Activities, and Indicators under this Outcome will also be permanently deleted.'}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOutcomeToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDeleteOutcome}
                className="px-5 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
              >
                {isId ? 'Ya, Hapus Outcome' : 'Yes, Delete Outcome'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT OUTPUT */}
      {(showAddOutputModal || editingOutput) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                {editingOutput ? (isId ? 'Edit Data Output Proyek' : 'Edit Project Output Data') : (isId ? 'Tambah Output Baru' : 'Add New Output')}
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Parent Outcome Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isId ? 'Induk Outcome:' : 'Parent Outcome:'}</label>
                <select
                  value={outputFormOutcomeId}
                  onChange={(e) => setOutputFormOutcomeId(e.target.value)}
                  disabled={!!editingOutput}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {activeProject.outcomes?.map(oc => (
                    <option key={oc.id} value={oc.id}>{oc.code} - {oc.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isId ? 'Kode Output:' : 'Output Code:'}</label>
                  <input
                    type="text"
                    value={outputFormCode}
                    onChange={(e) => setOutputFormCode(e.target.value)}
                    placeholder="OP-1.1"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isId ? 'Target Tanggal Selesai:' : 'Target Completion Date:'}</label>
                  <input
                    type="date"
                    value={outputFormTargetDate}
                    onChange={(e) => setOutputFormTargetDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isId ? 'Judul / Keluaran Terukur (Output):' : 'Title / Measurable Output:'}</label>
                <input
                  type="text"
                  value={outputFormTitle}
                  onChange={(e) => setOutputFormTitle(e.target.value)}
                  placeholder={isId ? "Contoh: Penyelenggaraan 10 Sesi Pelatihan Pertanian Berkelanjutan..." : "Example: Delivery of 10 Sustainable Farming Training Sessions..."}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isId ? 'Deskripsi Output:' : 'Output Description:'}</label>
                <textarea
                  rows={2}
                  value={outputFormDesc}
                  onChange={(e) => setOutputFormDesc(e.target.value)}
                  placeholder={isId ? "Keterangan spesifik mengenai produk, layanan, atau kapasitas yang dihasilkan..." : "Specific description of products, services, or capacity generated..."}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowAddOutputModal(null);
                  setEditingOutput(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveOutput}
                className="px-5 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs"
              >
                {editingOutput ? (isId ? 'Simpan Perubahan' : 'Save Changes') : (isId ? 'Simpan Output' : 'Save Output')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM DELETE OUTPUT */}
      {outputToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">{isId ? 'Hapus Output?' : 'Delete Output?'}</h3>
              <p className="text-xs text-slate-500">
                {isId ? 'Apakah Anda yakin ingin menghapus output' : 'Are you sure you want to delete output'} <strong className="text-rose-600">{outputToDelete.output.code}: {outputToDelete.output.title}</strong>?
              </p>
              <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2 text-left">
                {isId ? 'Peringatan: Seluruh kegiatan dan indikator output ini akan ikut terhapus.' : 'Warning: All activities and indicators under this output will also be deleted.'}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOutputToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDeleteOutput}
                className="px-5 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
              >
                {isId ? 'Ya, Hapus Output' : 'Yes, Delete Output'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD / EDIT INDICATOR DETAILS */}
      {(showAddIndicatorModal || editingIndicatorDetails) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                {editingIndicatorDetails 
                  ? (isId ? 'Edit Data & Parameter Indikator' : 'Edit Indicator Parameters & Data') 
                  : (isId ? `Tambah Indikator Baru (${formatIndicatorLevel(showAddIndicatorModal?.parentLevel || 'Outcome', language)})` : `Add New Indicator (${showAddIndicatorModal?.parentLevel})`)}
              </h3>
            </div>

            {showAddIndicatorModal && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                {isId ? 'Terhubung pada:' : 'Linked to:'} <strong>{showAddIndicatorModal.parentTitle}</strong>
              </p>
            )}

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">{isId ? 'Kode Indikator:' : 'Indicator Code:'}</label>
                  <input
                    type="text"
                    value={indFormCode}
                    onChange={(e) => setIndFormCode(e.target.value)}
                    placeholder="IND-01"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold block mb-1 text-slate-700">{isId ? 'Nama Indikator:' : 'Indicator Name:'}</label>
                  <input
                    type="text"
                    value={indFormName}
                    onChange={(e) => setIndFormName(e.target.value)}
                    placeholder={isId ? "Contoh: Jumlah petani yang menerapkan praktik..." : "Example: Number of farmers adopting practices..."}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">{isId ? 'Definisi Operasional / Kriteria Pengukuran:' : 'Operational Definition / Measurement Criteria:'}</label>
                <textarea
                  rows={2}
                  value={indFormDef}
                  onChange={(e) => setIndFormDef(e.target.value)}
                  placeholder={isId ? "Kriteria standar untuk menentukan bahwa target tercapai..." : "Standard criteria used to determine that the target is achieved..."}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">Baseline:</label>
                  <input
                    type="number"
                    value={indFormBaseline}
                    onChange={(e) => setIndFormBaseline(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">Target:</label>
                  <input
                    type="number"
                    value={indFormTarget}
                    onChange={(e) => setIndFormTarget(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">{isId ? 'Satuan (Unit):' : 'Unit:'}</label>
                  <select
                    value={indFormUnit}
                    onChange={(e) => setIndFormUnit(e.target.value as IndicatorUnit)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Orang / Individu">{formatUnit('Orang / Individu', language)}</option>
                    <option value="Kepala Keluarga (KK)">{formatUnit('Kepala Keluarga (KK)', language)}</option>
                    <option value="Kelompok / Organisasi">{formatUnit('Kelompok / Organisasi', language)}</option>
                    <option value="Hektar (Ha)">{formatUnit('Hektar (Ha)', language)}</option>
                    <option value="Ton">{formatUnit('Ton', language)}</option>
                    <option value="Dokumen / Kebijakan">{formatUnit('Dokumen / Kebijakan', language)}</option>
                    <option value="Pelatihan / Event">{formatUnit('Pelatihan / Event', language)}</option>
                    <option value="Persentase (%)">{formatUnit('Persentase (%)', language)}</option>
                    <option value="Rupiah (IDR)">{formatUnit('Rupiah (IDR)', language)}</option>
                    <option value="Unit / Sarana">{formatUnit('Unit / Sarana', language)}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">{isId ? 'Frekuensi Pelaporan:' : 'Reporting Frequency:'}</label>
                  <select
                    value={indFormFreq}
                    onChange={(e) => setIndFormFreq(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Bulanan">{formatReportingFrequency('Bulanan', language)}</option>
                    <option value="Triwulanan">{formatReportingFrequency('Triwulanan', language)}</option>
                    <option value="Semesteran">{formatReportingFrequency('Semesteran', language)}</option>
                    <option value="Tahunan">{formatReportingFrequency('Tahunan', language)}</option>
                    <option value="Akhir Proyek">{formatReportingFrequency('Akhir Proyek', language)}</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700">{isId ? 'Status Progres Awal:' : 'Initial Progress Status:'}</label>
                  <select
                    value={indFormStatus}
                    onChange={(e) => setIndFormStatus(e.target.value as StatusProgress)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Belum Dimulai">{formatStatusProgress('Belum Dimulai', language)}</option>
                    <option value="Sesuai Target (On-Track)">{formatStatusProgress('Sesuai Target (On-Track)', language)}</option>
                    <option value="Perlu Perhatian (Delayed)">{formatStatusProgress('Perlu Perhatian (Delayed)', language)}</option>
                    <option value="Tercapai">{formatStatusProgress('Tercapai', language)}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700">Means of Verification (MoV / {isId ? 'Bukti Verifikasi' : 'Evidence'}):</label>
                <input
                  type="text"
                  value={indFormMov}
                  onChange={(e) => setIndFormMov(e.target.value)}
                  placeholder={isId ? "Contoh: Daftar Hadir Peserta, SK Kepala Desa, Foto Kegiatan..." : "Example: Attendance List, Village Decree, Activity Photos..."}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowAddIndicatorModal(null);
                  setEditingIndicatorDetails(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveIndicatorForm}
                className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
              >
                {editingIndicatorDetails ? (isId ? 'Simpan Perubahan' : 'Save Changes') : (isId ? 'Simpan Indikator' : 'Save Indicator')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIRM DELETE INDICATOR */}
      {indicatorToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">{isId ? 'Hapus Indikator?' : 'Delete Indicator?'}</h3>
              <p className="text-xs text-slate-500">
                {isId ? 'Apakah Anda yakin ingin menghapus indikator' : 'Are you sure you want to delete indicator'} <strong className="text-rose-600">{indicatorToDelete.indicator.code}: {indicatorToDelete.indicator.name}</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIndicatorToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDeleteIndicator}
                className="px-5 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
              >
                {isId ? 'Ya, Hapus Indikator' : 'Yes, Delete Indicator'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: RECORD PERIODIC ACTUAL & MOV DOCUMENTS (Existing rich modal) */}
      {editingIndicatorProgress && (
        <IndicatorPeriodicUpdateModal
          projectId={editingIndicatorProgress.projectId}
          indicator={editingIndicatorProgress.indicator}
          onClose={() => setEditingIndicatorProgress(null)}
          onSave={(projId, indId, newActual, newStatus, notes, periodicLog, newMovDocuments) => {
            onUpdateIndicator(projId, indId, newActual, newStatus, notes, periodicLog, newMovDocuments);
            setEditingIndicatorProgress(null);
          }}
        />
      )}
    </div>
  );
}
