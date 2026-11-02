import React, { useState, useMemo, useRef, ChangeEvent } from 'react';
import { 
  Paperclip, 
  FolderCheck, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Link as LinkIcon, 
  Calendar, 
  User, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  X, 
  Upload, 
  ShieldCheck, 
  LayoutList, 
  Table as TableIcon, 
  Grid, 
  FolderKanban,
  FileCheck,
  FolderOpen,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  FileUp,
  HardDrive
} from 'lucide-react';
import { 
  Project, 
  Outcome, 
  Output, 
  Activity, 
  Indicator, 
  MoVDocument, 
  MoVCategory 
} from '../types';
import { downloadMoVDocument, formatBytes } from '../utils/movHelper';
import { useLanguage } from '../context/LanguageContext';
import { formatMoVCategory, formatIndicatorLevel } from '../utils/bilingual';

export interface FlattenedMoVItem {
  mov: MoVDocument;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  projectStartDate: string;
  projectEndDate: string;
  level: 'Goal' | 'Outcome' | 'Output' | 'Activity';
  outcomeId?: string;
  outcomeCode?: string;
  outcomeTitle?: string;
  outputId?: string;
  outputCode?: string;
  outputTitle?: string;
  activityId?: string;
  activityCode?: string;
  activityTitle?: string;
  indicatorId?: string;
  indicatorCode?: string;
  indicatorName?: string;
}

interface MoVRepositoryProps {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  isAdmin: boolean;
  onAddMoVDocument: (
    projectId: string, 
    targetLevel: 'goal' | 'outcome' | 'output' | 'activity', 
    targetId: string, 
    doc: MoVDocument,
    indicatorId?: string
  ) => void;
  onDeleteMoVDocument: (projectId: string, docId: string) => void;
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

export default function MoVRepository({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  isAdmin,
  onAddMoVDocument,
  onDeleteMoVDocument
}: MoVRepositoryProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  // View states
  const [viewMode, setViewMode] = useState<'tree' | 'table' | 'cards'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [expandedOutcomes, setExpandedOutcomes] = useState<Record<string, boolean>>({});
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({});
  const [expandedActivities, setExpandedActivities] = useState<Record<string, boolean>>({});

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modal states
  const [previewDoc, setPreviewDoc] = useState<FlattenedMoVItem | null>(null);
  const [deleteTargetDoc, setDeleteTargetDoc] = useState<{
    projectId: string;
    docId: string;
    docTitle: string;
    projectTitle?: string;
    level?: string;
  } | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{
    projectId: string;
    level: 'goal' | 'outcome' | 'output' | 'activity';
    targetId: string;
    targetTitle: string;
    indicatorId?: string;
  } | null>(null);

  // Form states for new MoV
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formLevel, setFormLevel] = useState<'goal' | 'outcome' | 'output' | 'activity'>('activity');
  const [formOutcomeId, setFormOutcomeId] = useState<string>('');
  const [formOutputId, setFormOutputId] = useState<string>('');
  const [formActivityId, setFormActivityId] = useState<string>('');
  const [formIndicatorId, setFormIndicatorId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<MoVCategory>('Daftar Hadir / Absensi');
  const [formFileName, setFormFileName] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileData, setFormFileData] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formUploadedBy, setFormUploadedBy] = useState('Petugas M&E / Admin');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sorted projects by start date and year
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const timeA = new Date(a.startDate || '').getTime() || 0;
      const timeB = new Date(b.startDate || '').getTime() || 0;
      return timeA - timeB;
    });
  }, [projects]);

  // Aggregate all MoV documents with their full hierarchy metadata
  const allFlattenedMoVs: FlattenedMoVItem[] = useMemo(() => {
    const items: FlattenedMoVItem[] = [];
    const seenIds = new Set<string>();

    sortedProjects.forEach(proj => {
      // 1. Goal indicators MoVs
      proj.goalIndicators?.forEach(ind => {
        ind.movDocuments?.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            items.push({
              mov: doc,
              projectId: proj.id,
              projectCode: proj.code,
              projectTitle: proj.title,
              projectStartDate: proj.startDate,
              projectEndDate: proj.endDate,
              level: 'Goal',
              indicatorId: ind.id,
              indicatorCode: ind.code,
              indicatorName: ind.name
            });
          }
        });

        // Also check progress history for goal
        ind.progressHistory?.forEach(log => {
          log.movDocuments?.forEach(doc => {
            if (!seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              items.push({
                mov: doc,
                projectId: proj.id,
                projectCode: proj.code,
                projectTitle: proj.title,
                projectStartDate: proj.startDate,
                projectEndDate: proj.endDate,
                level: 'Goal',
                indicatorId: ind.id,
                indicatorCode: ind.code,
                indicatorName: ind.name
              });
            }
          });
        });
      });

      // 2. Outcomes & Outcome indicators MoVs
      proj.outcomes?.forEach(oc => {
        oc.indicators?.forEach(ind => {
          ind.movDocuments?.forEach(doc => {
            if (!seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              items.push({
                mov: doc,
                projectId: proj.id,
                projectCode: proj.code,
                projectTitle: proj.title,
                projectStartDate: proj.startDate,
                projectEndDate: proj.endDate,
                level: 'Outcome',
                outcomeId: oc.id,
                outcomeCode: oc.code,
                outcomeTitle: oc.title,
                indicatorId: ind.id,
                indicatorCode: ind.code,
                indicatorName: ind.name
              });
            }
          });

          ind.progressHistory?.forEach(log => {
            log.movDocuments?.forEach(doc => {
              if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id);
                items.push({
                  mov: doc,
                  projectId: proj.id,
                  projectCode: proj.code,
                  projectTitle: proj.title,
                  projectStartDate: proj.startDate,
                  projectEndDate: proj.endDate,
                  level: 'Outcome',
                  outcomeId: oc.id,
                  outcomeCode: oc.code,
                  outcomeTitle: oc.title,
                  indicatorId: ind.id,
                  indicatorCode: ind.code,
                  indicatorName: ind.name
                });
              }
            });
          });
        });

        // 3. Outputs & Output indicators MoVs
        oc.outputs?.forEach(op => {
          op.indicators?.forEach(ind => {
            ind.movDocuments?.forEach(doc => {
              if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id);
                items.push({
                  mov: doc,
                  projectId: proj.id,
                  projectCode: proj.code,
                  projectTitle: proj.title,
                  projectStartDate: proj.startDate,
                  projectEndDate: proj.endDate,
                  level: 'Output',
                  outcomeId: oc.id,
                  outcomeCode: oc.code,
                  outcomeTitle: oc.title,
                  outputId: op.id,
                  outputCode: op.code,
                  outputTitle: op.title,
                  indicatorId: ind.id,
                  indicatorCode: ind.code,
                  indicatorName: ind.name
                });
              }
            });

            ind.progressHistory?.forEach(log => {
              log.movDocuments?.forEach(doc => {
                if (!seenIds.has(doc.id)) {
                  seenIds.add(doc.id);
                  items.push({
                    mov: doc,
                    projectId: proj.id,
                    projectCode: proj.code,
                    projectTitle: proj.title,
                    projectStartDate: proj.startDate,
                    projectEndDate: proj.endDate,
                    level: 'Output',
                    outcomeId: oc.id,
                    outcomeCode: oc.code,
                    outcomeTitle: oc.title,
                    outputId: op.id,
                    outputCode: op.code,
                    outputTitle: op.title,
                    indicatorId: ind.id,
                    indicatorCode: ind.code,
                    indicatorName: ind.name
                  });
                }
              });
            });
          });

          // 4. Activities & Activity indicators MoVs
          op.activities?.forEach(act => {
            act.indicators?.forEach(ind => {
              ind.movDocuments?.forEach(doc => {
                if (!seenIds.has(doc.id)) {
                  seenIds.add(doc.id);
                  items.push({
                    mov: doc,
                    projectId: proj.id,
                    projectCode: proj.code,
                    projectTitle: proj.title,
                    projectStartDate: proj.startDate,
                    projectEndDate: proj.endDate,
                    level: 'Activity',
                    outcomeId: oc.id,
                    outcomeCode: oc.code,
                    outcomeTitle: oc.title,
                    outputId: op.id,
                    outputCode: op.code,
                    outputTitle: op.title,
                    activityId: act.id,
                    activityCode: act.code,
                    activityTitle: act.title,
                    indicatorId: ind.id,
                    indicatorCode: ind.code,
                    indicatorName: ind.name
                  });
                }
              });

              ind.progressHistory?.forEach(log => {
                log.movDocuments?.forEach(doc => {
                  if (!seenIds.has(doc.id)) {
                    seenIds.add(doc.id);
                    items.push({
                      mov: doc,
                      projectId: proj.id,
                      projectCode: proj.code,
                      projectTitle: proj.title,
                      projectStartDate: proj.startDate,
                      projectEndDate: proj.endDate,
                      level: 'Activity',
                      outcomeId: oc.id,
                      outcomeCode: oc.code,
                      outcomeTitle: oc.title,
                      outputId: op.id,
                      outputCode: op.code,
                      outputTitle: op.title,
                      activityId: act.id,
                      activityCode: act.code,
                      activityTitle: act.title,
                      indicatorId: ind.id,
                      indicatorCode: ind.code,
                      indicatorName: ind.name
                    });
                  }
                });
              });
            });
          });
        });
      });
    });

    return items;
  }, [sortedProjects]);

  // Filtered MoVs based on search, project, category, level
  const filteredMoVs = useMemo(() => {
    return allFlattenedMoVs.filter(item => {
      // Project filter
      if (selectedProjectId !== 'all' && item.projectId !== selectedProjectId) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.mov.category !== selectedCategory) {
        return false;
      }
      // Level filter
      if (selectedLevel !== 'all' && item.level !== selectedLevel) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.mov.title.toLowerCase().includes(q);
        const matchFile = (item.mov.fileName || '').toLowerCase().includes(q);
        const matchUploader = item.mov.uploadedBy.toLowerCase().includes(q);
        const matchNotes = (item.mov.notes || '').toLowerCase().includes(q);
        const matchProject = item.projectTitle.toLowerCase().includes(q) || item.projectCode.toLowerCase().includes(q);
        const matchAct = (item.activityTitle || '').toLowerCase().includes(q) || (item.activityCode || '').toLowerCase().includes(q);
        const matchInd = (item.indicatorName || '').toLowerCase().includes(q) || (item.indicatorCode || '').toLowerCase().includes(q);

        return matchTitle || matchFile || matchUploader || matchNotes || matchProject || matchAct || matchInd;
      }
      return true;
    });
  }, [allFlattenedMoVs, selectedProjectId, selectedCategory, selectedLevel, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalDocs = filteredMoVs.length;
    const absensiCount = filteredMoVs.filter(m => m.mov.category === 'Daftar Hadir / Absensi').length;
    const laporanCount = filteredMoVs.filter(m => m.mov.category === 'Laporan Naratif / Laporan Kegiatan' || m.mov.category === 'Berita Acara / Notulensi').length;
    const fotoCount = filteredMoVs.filter(m => m.mov.category === 'Dokumentasi Foto & Video').length;
    const skCount = filteredMoVs.filter(m => m.mov.category === 'Kebijakan / SK / Perdes / Regulasi').length;
    const cloudCount = filteredMoVs.filter(m => m.mov.category === 'Tautan Link Cloud (Drive/Dropbox)' || !!m.mov.fileUrl).length;

    return {
      totalDocs,
      absensiCount,
      laporanCount,
      fotoCount,
      skCount,
      cloudCount
    };
  }, [filteredMoVs]);

  // Toggle tree expansion
  const toggleProject = (pId: string) => {
    setExpandedProjects(prev => ({ ...prev, [pId]: prev[pId] === undefined ? false : !prev[pId] }));
  };

  const toggleOutcome = (ocId: string) => {
    setExpandedOutcomes(prev => ({ ...prev, [ocId]: prev[ocId] === undefined ? false : !prev[ocId] }));
  };

  const toggleOutput = (opId: string) => {
    setExpandedOutputs(prev => ({ ...prev, [opId]: prev[opId] === undefined ? false : !prev[opId] }));
  };

  const toggleActivity = (actId: string) => {
    setExpandedActivities(prev => ({ ...prev, [actId]: prev[actId] === undefined ? false : !prev[actId] }));
  };

  // Helper for category badge styling
  const getCategoryBadge = (category: MoVCategory) => {
    switch (category) {
      case 'Daftar Hadir / Absensi':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Laporan Naratif / Laporan Kegiatan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dokumentasi Foto & Video':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Kebijakan / SK / Perdes / Regulasi':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Materi & Modul Pelatihan':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Berita Acara / Notulensi':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Tautan Link Cloud (Drive/Dropbox)':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper for file icon
  const getFileIcon = (mov: MoVDocument) => {
    if (mov.fileUrl) return <LinkIcon className="w-4 h-4 text-sky-600" />;
    const fn = (mov.fileName || '').toLowerCase();
    if (fn.endsWith('.pdf')) return <FileText className="w-4 h-4 text-rose-600" />;
    if (fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.png') || fn.endsWith('.webp')) {
      return <ImageIcon className="w-4 h-4 text-purple-600" />;
    }
    if (fn.endsWith('.xlsx') || fn.endsWith('.xls') || fn.endsWith('.csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    return <Paperclip className="w-4 h-4 text-slate-500" />;
  };

  // Safe MoV Download handler
  const handleDownloadMoV = (item: FlattenedMoVItem | { mov: MoVDocument; projectCode?: string; projectTitle?: string; level?: string; activityTitle?: string; indicatorName?: string }) => {
    const meta = {
      projectCode: 'projectCode' in item ? item.projectCode : undefined,
      projectTitle: 'projectTitle' in item ? item.projectTitle : undefined,
      level: 'level' in item ? item.level : undefined,
      outcomeTitle: 'outcomeTitle' in item ? item.outcomeTitle : undefined,
      outputTitle: 'outputTitle' in item ? item.outputTitle : undefined,
      activityTitle: 'activityTitle' in item ? item.activityTitle : undefined,
      indicatorCode: 'indicatorCode' in item ? item.indicatorCode : undefined,
      indicatorName: 'indicatorName' in item ? item.indicatorName : undefined,
    };

    const res = downloadMoVDocument(item.mov, meta);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Delete Request Handler (Opens confirmation dialog)
  const handleRequestDelete = (item: FlattenedMoVItem | { mov: MoVDocument; projectId: string; projectTitle?: string; level?: string }) => {
    setDeleteTargetDoc({
      projectId: item.projectId,
      docId: item.mov.id,
      docTitle: item.mov.title,
      projectTitle: item.projectTitle,
      level: item.level
    });
  };

  // Confirm Delete Execution
  const handleConfirmDelete = () => {
    if (!deleteTargetDoc) return;
    const docTitle = deleteTargetDoc.docTitle;
    onDeleteMoVDocument(deleteTargetDoc.projectId, deleteTargetDoc.docId);
    setDeleteTargetDoc(null);
    if (previewDoc && previewDoc.mov.id === deleteTargetDoc.docId) {
      setPreviewDoc(null);
    }
    showToast(isId ? `Dokumen MoV "${docTitle}" berhasil dihapus.` : `MoV document "${docTitle}" deleted successfully.`, 'success');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = isId ? [
      'Proyek Kode',
      'Judul Proyek',
      'Tingkat (Level)',
      'Kode Outcome',
      'Judul Outcome',
      'Kode Output',
      'Judul Output',
      'Kode Kegiatan',
      'Judul Kegiatan',
      'Kode Indikator',
      'Nama Indikator',
      'Kategori MoV',
      'Judul Dokumen MoV',
      'Nama File / URL',
      'Ukuran Berkas',
      'Tanggal Upload',
      'Diupload Oleh',
      'Catatan'
    ] : [
      'Project Code',
      'Project Title',
      'Level',
      'Outcome Code',
      'Outcome Title',
      'Output Code',
      'Output Title',
      'Activity Code',
      'Activity Title',
      'Indicator Code',
      'Indicator Name',
      'MoV Category',
      'MoV Document Title',
      'File Name / URL',
      'File Size',
      'Upload Date',
      'Uploaded By',
      'Notes'
    ];

    const rows = filteredMoVs.map(item => [
      `"${item.projectCode}"`,
      `"${item.projectTitle.replace(/"/g, '""')}"`,
      `"${formatIndicatorLevel(item.level, language)}"`,
      `"${item.outcomeCode || ''}"`,
      `"${(item.outcomeTitle || '').replace(/"/g, '""')}"`,
      `"${item.outputCode || ''}"`,
      `"${(item.outputTitle || '').replace(/"/g, '""')}"`,
      `"${item.activityCode || ''}"`,
      `"${(item.activityTitle || '').replace(/"/g, '""')}"`,
      `"${item.indicatorCode || ''}"`,
      `"${(item.indicatorName || '').replace(/"/g, '""')}"`,
      `"${formatMoVCategory(item.mov.category, language)}"`,
      `"${item.mov.title.replace(/"/g, '""')}"`,
      `"${item.mov.fileName || item.mov.fileUrl || ''}"`,
      `"${item.mov.fileSize || '-'}"`,
      `"${item.mov.uploadedAt}"`,
      `"${item.mov.uploadedBy.replace(/"/g, '""')}"`,
      `"${(item.mov.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoV_Verification_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isId ? 'Rekapitulasi bukti verifikasi MoV berhasil diekspor ke CSV.' : 'MoV verification data exported to CSV successfully.', 'info');
  };

  // Open Quick Upload Modal
  const handleOpenUploadModal = (target?: {
    projectId: string;
    level: 'goal' | 'outcome' | 'output' | 'activity';
    targetId: string;
    targetTitle: string;
    indicatorId?: string;
  }) => {
    if (target) {
      setUploadTarget(target);
      setFormProjectId(target.projectId);
      setFormLevel(target.level);
      setFormIndicatorId(target.indicatorId || '');
    } else {
      setUploadTarget(null);
      setFormProjectId(sortedProjects[0]?.id || '');
      setFormLevel('activity');
    }
    setFormTitle('');
    setFormCategory('Daftar Hadir / Absensi');
    setFormFileName('');
    setFormFileSize('');
    setFormFileUrl('');
    setFormFileData('');
    setFormNotes('');
    setShowUploadModal(true);
  };

  // Handle Real File Selection
  const handleProcessFile = (file: File) => {
    const sizeFormatted = formatBytes(file.size);
    setFormFileName(file.name);
    setFormFileSize(sizeFormatted);
    if (!formTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ');
      setFormTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormFileData(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Form Submit
  const handleSaveNewMoV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast(isId ? 'Judul dokumen bukti verifikasi (MoV) wajib diisi!' : 'MoV document title is required!', 'error');
      return;
    }
    if (!formProjectId) {
      showToast(isId ? 'Silakan pilih proyek tujuan!' : 'Please select a project!', 'error');
      return;
    }

    const docId = `mov-${Date.now().toString().slice(-6)}`;
    const newDoc: MoVDocument = {
      id: docId,
      title: formTitle.trim(),
      category: formCategory,
      fileName: formFileName.trim() || (formFileUrl ? (isId ? 'Tautan Eksternal Cloud' : 'External Cloud Link') : `${formTitle.trim().replace(/\s+/g, '_')}.pdf`),
      fileSize: formFileSize || '1.2 MB',
      fileUrl: formFileUrl.trim() || undefined,
      fileData: formFileData || undefined,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: formUploadedBy.trim() || (isId ? 'Admin M&E' : 'M&E Admin'),
      notes: formNotes.trim() || undefined
    };

    let targetId = '';
    if (formLevel === 'goal') {
      targetId = formProjectId;
    } else if (formLevel === 'outcome') {
      targetId = formOutcomeId;
    } else if (formLevel === 'output') {
      targetId = formOutputId;
    } else {
      targetId = formActivityId;
    }

    onAddMoVDocument(formProjectId, formLevel, targetId, newDoc, formIndicatorId || undefined);
    setShowUploadModal(false);
    showToast(isId ? `Dokumen MoV "${newDoc.title}" berhasil diunggah & diverifikasi.` : `MoV document "${newDoc.title}" uploaded & verified successfully.`, 'success');
  };

  // Selected project in form for dynamic cascading dropdowns
  const currentFormProject = sortedProjects.find(p => p.id === formProjectId);
  const currentFormOutcome = currentFormProject?.outcomes.find(o => o.id === formOutcomeId);
  const currentFormOutput = currentFormOutcome?.outputs.find(op => op.id === formOutputId);

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 max-w-md ${
            toast.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/30' :
            toast.type === 'error' ? 'bg-rose-900 text-white border-rose-700 shadow-rose-900/30' :
            'bg-slate-900 text-white border-slate-700 shadow-slate-900/30'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <FolderCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isId ? 'Repositori MoV & Bukti Verifikasi' : 'MoV & Means of Verification Repository'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {allFlattenedMoVs.length} {isId ? 'Dokumen Terverifikasi' : 'Verified Documents'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                {isId
                  ? 'Pusat arsip digital bukti capaian indikator (Means of Verification), presensi kegiatan, laporan naratif, surat keputusan regulasi, dan foto dokumentasi tersusun rapi berjenjang berdasarkan Proyek, Outcome, Output, dan Aktivitas. Dilengkapi fitur unduh langsung dan pengelolaan dokumen.'
                  : 'Digital archive of Means of Verification (MoV), event attendance, narrative reports, decree policies, and photo documentation organized by Project, Outcome, Output, and Activity. Equipped with direct download and document management.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition shadow-2xs"
              title={isId ? 'Unduh rekap bukti verifikasi ke format CSV/Excel' : 'Download verification summary to CSV/Excel'}
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>{isId ? 'Ekspor Rekap (CSV)' : 'Export CSV'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleOpenUploadModal()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>{isId ? '+ Unggah Dokumen MoV' : '+ Upload MoV Document'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] font-medium text-slate-500">{isId ? 'Total MoV' : 'Total MoVs'}</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.totalDocs} {isId ? 'Dokumen' : 'Docs'}</div>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <div className="text-[11px] font-medium text-emerald-700">{isId ? 'Daftar Hadir / Absensi' : 'Attendance Lists'}</div>
            <div className="text-lg font-bold text-emerald-900 mt-0.5">{stats.absensiCount} {isId ? 'Berkas' : 'Files'}</div>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
            <div className="text-[11px] font-medium text-blue-700">{isId ? 'Laporan & Notulensi' : 'Reports & Minutes'}</div>
            <div className="text-lg font-bold text-blue-900 mt-0.5">{stats.laporanCount} {isId ? 'Dokumen' : 'Docs'}</div>
          </div>
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
            <div className="text-[11px] font-medium text-purple-700">{isId ? 'Foto & Video Media' : 'Photos & Videos'}</div>
            <div className="text-lg font-bold text-purple-900 mt-0.5">{stats.fotoCount} {isId ? 'Media' : 'Media'}</div>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
            <div className="text-[11px] font-medium text-amber-700">{isId ? 'Regulasi & SK' : 'Decrees & Policies'}</div>
            <div className="text-lg font-bold text-amber-900 mt-0.5">{stats.skCount} {isId ? 'Berkas' : 'Files'}</div>
          </div>
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100">
            <div className="text-[11px] font-medium text-sky-700">{isId ? 'Tautan Cloud Drive' : 'Cloud Drive Links'}</div>
            <div className="text-lg font-bold text-sky-900 mt-0.5">{stats.cloudCount} {isId ? 'Link' : 'Links'}</div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isId ? "Cari nama MoV, kegiatan, indikator, uploader..." : "Search MoV title, activity, indicator, uploader..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
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

          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">🌐 {isId ? `Semua Proyek (${projects.length})` : `All Projects (${projects.length})`}</option>
              {sortedProjects.map(p => {
                const year = p.startDate ? new Date(p.startDate).getFullYear() : '';
                return (
                  <option key={p.id} value={p.id}>
                    {year ? `[${year}] ` : ''}{p.code} - {p.title.slice(0, 32)}...
                  </option>
                );
              })}
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">{isId ? 'Semua Kategori Bukti' : 'All MoV Categories'}</option>
            {MOV_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{formatMoVCategory(cat, language)}</option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">{isId ? 'Semua Tingkat (Level)' : 'All Hierarchy Levels'}</option>
            <option value="Activity">{isId ? 'Level Aktivitas' : 'Activity Level'}</option>
            <option value="Output">{isId ? 'Level Output' : 'Output Level'}</option>
            <option value="Outcome">{isId ? 'Level Outcome' : 'Outcome Level'}</option>
            <option value="Goal">{isId ? 'Level Goal Proyek' : 'Project Goal Level'}</option>
          </select>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'tree' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={isId ? "Tampilan Pohon Berjenjang Proyek -> Outcome -> Output -> Aktivitas" : "Hierarchical Tree View"}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isId ? 'Pohon Hierarki' : 'Tree View'}</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={isId ? "Tampilan Tabel Lengkap Audit MoV" : "Full Table View"}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{isId ? 'Tabel Matriks' : 'Matrix Table'}</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title={isId ? "Tampilan Galeri Kartu" : "Card Gallery"}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{isId ? 'Galeri Kartu' : 'Card Gallery'}</span>
          </button>
        </div>
      </div>

      {/* Main Content View Container */}
      {filteredMoVs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Paperclip className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada dokumen MoV ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' || selectedProjectId !== 'all'
              ? 'Coba sesuaikan kata kunci pencarian atau filter kategori Anda.'
              : 'Belum ada bukti verifikasi (MoV) yang diunggah. Klik tombol "+ Unggah Dokumen MoV" di atas untuk menambahkan.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => handleOpenUploadModal()}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Unggah MoV Sekarang
            </button>
          )}
        </div>
      ) : (
        <>
          {/* VIEW 1: HIERARCHICAL TREE VIEW (Project -> Outcome -> Output -> Activity) */}
          {viewMode === 'tree' && (
            <div className="space-y-6">
              {sortedProjects
                .filter(p => selectedProjectId === 'all' || p.id === selectedProjectId)
                .map(proj => {
                  const projMoVs = filteredMoVs.filter(m => m.projectId === proj.id);
                  if (projMoVs.length === 0 && (searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all')) {
                    return null;
                  }
                  const isProjExpanded = expandedProjects[proj.id] !== false; // default expanded

                  return (
                    <div key={proj.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                      {/* LEVEL 1: PROJECT HEADER */}
                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div 
                          className="flex items-center gap-3 cursor-pointer flex-1"
                          onClick={() => toggleProject(proj.id)}
                        >
                          <button className="p-1 rounded-lg hover:bg-slate-700 text-slate-300">
                            {isProjExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                PROYEK: {proj.code}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Mulai: {proj.startDate} • Sampai: {proj.endDate}
                              </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                              {proj.title}
                            </h2>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {projMoVs.length} MoV Terlampir
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenUploadModal({
                                projectId: proj.id,
                                level: 'goal',
                                targetId: proj.id,
                                targetTitle: proj.title
                              })}
                              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                              title="Unggah MoV untuk Proyek / Goal ini"
                            >
                              <Plus className="w-3.5 h-3.5" /> + MoV Proyek
                            </button>
                          )}
                        </div>
                      </div>

                      {/* PROJECT CONTENT (Outcomes & Goal Inds) */}
                      {isProjExpanded && (
                        <div className="p-4 sm:p-5 space-y-6">
                          {/* Goal Indicators MoVs if any */}
                          {proj.goalIndicators?.some(g => g.movDocuments && g.movDocuments.length > 0) && (
                            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                                <ShieldCheck className="w-4 h-4 text-amber-700" />
                                <span>Bukti Capaian Dampak / Goal Proyek</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {proj.goalIndicators.map(gInd => (
                                  gInd.movDocuments?.map(doc => {
                                    const flItem: FlattenedMoVItem = {
                                      mov: doc,
                                      projectId: proj.id,
                                      projectCode: proj.code,
                                      projectTitle: proj.title,
                                      projectStartDate: proj.startDate,
                                      projectEndDate: proj.endDate,
                                      level: 'Goal',
                                      indicatorId: gInd.id,
                                      indicatorCode: gInd.code,
                                      indicatorName: gInd.name
                                    };

                                    return (
                                      <div key={doc.id} className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-2xs flex items-start justify-between gap-3">
                                        <div className="space-y-1 min-w-0">
                                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(doc.category)}`}>
                                            {doc.category}
                                          </span>
                                          <p className="font-bold text-xs text-slate-900 truncate">{doc.title}</p>
                                          <p className="text-[11px] text-slate-500 truncate">{gInd.code} - {gInd.name}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={() => setPreviewDoc(flItem)}
                                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                                            title="Lihat Detail"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDownloadMoV(flItem)}
                                            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                                            title="Unduh Berkas MoV"
                                          >
                                            <Download className="w-4 h-4" />
                                          </button>
                                          {isAdmin && (
                                            <button
                                              onClick={() => handleRequestDelete(flItem)}
                                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                              title="Hapus MoV"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                ))}
                              </div>
                            </div>
                          )}

                          {/* OUTCOMES LIST */}
                          <div className="space-y-4">
                            {proj.outcomes?.map(oc => {
                              const isOcExpanded = expandedOutcomes[oc.id] !== false;
                              const ocMoVs = filteredMoVs.filter(m => m.projectId === proj.id && m.outcomeId === oc.id);

                              return (
                                <div key={oc.id} className="rounded-xl border border-blue-100 bg-blue-50/20 overflow-hidden">
                                  {/* LEVEL 2: OUTCOME HEADER */}
                                  <div className="bg-blue-50/80 border-b border-blue-100 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div 
                                      className="flex items-center gap-2.5 cursor-pointer flex-1"
                                      onClick={() => toggleOutcome(oc.id)}
                                    >
                                      <button className="p-1 rounded text-blue-700 hover:bg-blue-100">
                                        {isOcExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                      </button>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white font-mono">
                                            {oc.code}
                                          </span>
                                          <span className="font-bold text-xs sm:text-sm text-blue-950">
                                            {oc.title}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                      <span className="text-[11px] font-semibold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full">
                                        {ocMoVs.length} MoV
                                      </span>
                                      {isAdmin && (
                                        <button
                                          onClick={() => handleOpenUploadModal({
                                            projectId: proj.id,
                                            level: 'outcome',
                                            targetId: oc.id,
                                            targetTitle: `${oc.code}: ${oc.title}`
                                          })}
                                          className="px-2 py-1 bg-white hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" /> + MoV Outcome
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* OUTCOME BODY (Outputs) */}
                                  {isOcExpanded && (
                                    <div className="p-3 sm:p-4 space-y-4">
                                      {/* Outcome Indicator MoVs if any */}
                                      {oc.indicators?.some(i => i.movDocuments && i.movDocuments.length > 0) && (
                                        <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-2">
                                          <div className="text-[11px] font-bold text-blue-900">MoV Indikator Outcome:</div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {oc.indicators.map(ind => (
                                              ind.movDocuments?.map(doc => {
                                                const flItem: FlattenedMoVItem = {
                                                  mov: doc,
                                                  projectId: proj.id,
                                                  projectCode: proj.code,
                                                  projectTitle: proj.title,
                                                  projectStartDate: proj.startDate,
                                                  projectEndDate: proj.endDate,
                                                  level: 'Outcome',
                                                  outcomeId: oc.id,
                                                  outcomeCode: oc.code,
                                                  outcomeTitle: oc.title,
                                                  indicatorId: ind.id,
                                                  indicatorCode: ind.code,
                                                  indicatorName: ind.name
                                                };

                                                return (
                                                  <div key={doc.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs">
                                                    <div className="min-w-0">
                                                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${getCategoryBadge(doc.category)}`}>
                                                        {doc.category}
                                                      </span>
                                                      <p className="font-semibold text-slate-800 truncate mt-0.5">{doc.title}</p>
                                                      <p className="text-[10px] text-slate-400 truncate">{ind.code}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                      <button
                                                        onClick={() => setPreviewDoc(flItem)}
                                                        className="p-1 text-slate-500 hover:text-blue-600 rounded"
                                                        title="Detail"
                                                      >
                                                        <Eye className="w-4 h-4" />
                                                      </button>
                                                      <button
                                                        onClick={() => handleDownloadMoV(flItem)}
                                                        className="p-1 text-slate-500 hover:text-emerald-600 rounded"
                                                        title="Unduh"
                                                      >
                                                        <Download className="w-4 h-4" />
                                                      </button>
                                                      {isAdmin && (
                                                        <button
                                                          onClick={() => handleRequestDelete(flItem)}
                                                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                                          title="Hapus"
                                                        >
                                                          <Trash2 className="w-4 h-4" />
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                              })
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* OUTPUTS LIST */}
                                      <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-blue-200">
                                        {oc.outputs?.map(op => {
                                          const isOpExpanded = expandedOutputs[op.id] !== false;
                                          const opMoVs = filteredMoVs.filter(m => m.projectId === proj.id && m.outputId === op.id);

                                          return (
                                            <div key={op.id} className="rounded-xl border border-emerald-100 bg-white overflow-hidden shadow-2xs">
                                              {/* LEVEL 3: OUTPUT HEADER */}
                                              <div className="bg-emerald-50/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100">
                                                <div 
                                                  className="flex items-center gap-2 cursor-pointer flex-1"
                                                  onClick={() => toggleOutput(op.id)}
                                                >
                                                  <button className="p-1 rounded text-emerald-800 hover:bg-emerald-100">
                                                    {isOpExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                  </button>
                                                  <div>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white font-mono mr-2">
                                                      {op.code}
                                                    </span>
                                                    <span className="font-semibold text-xs sm:text-sm text-slate-900">
                                                      {op.title}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                    {opMoVs.length} MoV
                                                  </span>
                                                  {isAdmin && (
                                                    <button
                                                      onClick={() => handleOpenUploadModal({
                                                        projectId: proj.id,
                                                        level: 'output',
                                                        targetId: op.id,
                                                        targetTitle: `${op.code}: ${op.title}`
                                                      })}
                                                      className="px-2 py-1 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                                                    >
                                                      <Plus className="w-3 h-3" /> + MoV Output
                                                    </button>
                                                  )}
                                                </div>
                                              </div>

                                              {/* OUTPUT BODY (Activities) */}
                                              {isOpExpanded && (
                                                <div className="p-3 space-y-3">
                                                  {/* Output Indicator MoVs */}
                                                  {op.indicators?.some(i => i.movDocuments && i.movDocuments.length > 0) && (
                                                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                                                      <div className="text-[10px] font-bold text-slate-700">MoV Indikator Output:</div>
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {op.indicators.map(ind => (
                                                          ind.movDocuments?.map(doc => {
                                                            const flItem: FlattenedMoVItem = {
                                                              mov: doc,
                                                              projectId: proj.id,
                                                              projectCode: proj.code,
                                                              projectTitle: proj.title,
                                                              projectStartDate: proj.startDate,
                                                              projectEndDate: proj.endDate,
                                                              level: 'Output',
                                                              outcomeId: oc.id,
                                                              outcomeCode: oc.code,
                                                              outcomeTitle: oc.title,
                                                              outputId: op.id,
                                                              outputCode: op.code,
                                                              outputTitle: op.title,
                                                              indicatorId: ind.id,
                                                              indicatorCode: ind.code,
                                                              indicatorName: ind.name
                                                            };

                                                            return (
                                                              <div key={doc.id} className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between gap-2 text-xs">
                                                                <div className="min-w-0">
                                                                  <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${getCategoryBadge(doc.category)}`}>
                                                                    {doc.category}
                                                                  </span>
                                                                  <p className="font-semibold text-slate-800 truncate">{doc.title}</p>
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                  <button
                                                                    onClick={() => setPreviewDoc(flItem)}
                                                                    className="p-1 text-slate-500 hover:text-blue-600"
                                                                    title="Detail"
                                                                  >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                  </button>
                                                                  <button
                                                                    onClick={() => handleDownloadMoV(flItem)}
                                                                    className="p-1 text-slate-500 hover:text-emerald-600"
                                                                    title="Unduh"
                                                                  >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                  </button>
                                                                  {isAdmin && (
                                                                    <button
                                                                      onClick={() => handleRequestDelete(flItem)}
                                                                      className="p-1 text-slate-400 hover:text-rose-600"
                                                                      title="Hapus"
                                                                    >
                                                                      <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            );
                                                          })
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}

                                                  {/* ACTIVITIES LIST */}
                                                  <div className="space-y-2 pl-2 sm:pl-3 border-l-2 border-emerald-300">
                                                    {op.activities?.map(act => {
                                                      const isActExpanded = expandedActivities[act.id] !== false;
                                                      const actMoVs = filteredMoVs.filter(m => m.projectId === proj.id && m.activityId === act.id);

                                                      return (
                                                        <div key={act.id} className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden">
                                                          {/* LEVEL 4: ACTIVITY HEADER */}
                                                          <div className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100/70">
                                                            <div 
                                                              className="flex items-center gap-2 cursor-pointer flex-1"
                                                              onClick={() => toggleActivity(act.id)}
                                                            >
                                                              <button className="p-0.5 rounded text-slate-600 hover:bg-slate-200">
                                                                {isActExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                              </button>
                                                              <div>
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-white mr-1.5">
                                                                  {act.code}
                                                                </span>
                                                                <span className="font-semibold text-xs text-slate-800">
                                                                  {act.title}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">
                                                                  ({act.location} • {act.startDate})
                                                                </span>
                                                              </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                                              <span className="text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                                {actMoVs.length} Bukti
                                                              </span>
                                                              {isAdmin && (
                                                                <button
                                                                  onClick={() => handleOpenUploadModal({
                                                                    projectId: proj.id,
                                                                    level: 'activity',
                                                                    targetId: act.id,
                                                                    targetTitle: `${act.code}: ${act.title}`,
                                                                    indicatorId: act.indicators?.[0]?.id
                                                                  })}
                                                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold flex items-center gap-1"
                                                                >
                                                                  <Plus className="w-3 h-3" /> + MoV Kegiatan
                                                                </button>
                                                              )}
                                                            </div>
                                                          </div>

                                                          {/* ACTIVITY DOCUMENTS GRID */}
                                                          {isActExpanded && (
                                                            <div className="p-3 bg-white">
                                                              {actMoVs.length === 0 ? (
                                                                <p className="text-[11px] text-slate-400 italic">Belum ada dokumen MoV dilampirkan untuk kegiatan ini.</p>
                                                              ) : (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                                                  {actMoVs.map(item => (
                                                                    <div 
                                                                      key={item.mov.id} 
                                                                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition bg-slate-50/40 flex flex-col justify-between"
                                                                    >
                                                                      <div className="space-y-1">
                                                                        <div className="flex items-start justify-between gap-1.5">
                                                                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${getCategoryBadge(item.mov.category)}`}>
                                                                            {item.mov.category}
                                                                          </span>
                                                                          <div className="flex items-center text-slate-400">
                                                                            {getFileIcon(item.mov)}
                                                                          </div>
                                                                        </div>
                                                                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                                                                          {item.mov.title}
                                                                        </h4>
                                                                        {item.mov.notes && (
                                                                          <p className="text-[10px] text-slate-500 line-clamp-2">
                                                                            {item.mov.notes}
                                                                          </p>
                                                                        )}
                                                                      </div>

                                                                      <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
                                                                        <div>
                                                                          <span>{item.mov.uploadedAt}</span> • <span>{item.mov.fileSize || '1.2 MB'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                          <button
                                                                            onClick={() => setPreviewDoc(item)}
                                                                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-200 rounded"
                                                                            title="Pratinjau Dokumen"
                                                                          >
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                          </button>
                                                                          {item.mov.fileUrl ? (
                                                                            <a
                                                                              href={item.mov.fileUrl}
                                                                              target="_blank"
                                                                              rel="noreferrer"
                                                                              className="p-1 text-slate-600 hover:text-sky-600 hover:bg-slate-200 rounded"
                                                                              title="Buka Tautan Cloud"
                                                                            >
                                                                              <ExternalLink className="w-3.5 h-3.5" />
                                                                            </a>
                                                                          ) : (
                                                                            <button
                                                                              onClick={() => handleDownloadMoV(item)}
                                                                              className="p-1 text-slate-600 hover:text-emerald-600 hover:bg-emerald-100 rounded"
                                                                              title="Unduh Berkas"
                                                                            >
                                                                              <Download className="w-3.5 h-3.5" />
                                                                            </button>
                                                                          )}
                                                                          {isAdmin && (
                                                                            <button
                                                                              onClick={() => handleRequestDelete(item)}
                                                                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                                              title="Hapus MoV"
                                                                            >
                                                                              <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                          )}
                                                                        </div>
                                                                      </div>
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* VIEW 2: AUDIT TABLE SPREADSHEET MATRIX */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <TableIcon className="w-4 h-4 text-emerald-400" />
                  <span>Matriks Lengkap Bukti Verifikasi MoV Proyek ({filteredMoVs.length} Dokumen)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Tersusun berurutan berdasarkan Tanggal Mulai Proyek, Outcome, Output, dan Aktivitas
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold divide-x divide-slate-200">
                      <th className="p-3 w-40">Proyek & Periode</th>
                      <th className="p-3 w-48">Struktur Logframe</th>
                      <th className="p-3 w-40">Kategori Bukti</th>
                      <th className="p-3 w-64">Judul Dokumen & Keterangan</th>
                      <th className="p-3 w-40">File / Tautan</th>
                      <th className="p-3 w-32">Pengunggah & Tgl</th>
                      <th className="p-3 w-28 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredMoVs.map((item, idx) => (
                      <tr key={item.mov.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        {/* Proyek */}
                        <td className="p-3 align-top">
                          <span className="font-bold text-slate-900 block">{item.projectCode}</span>
                          <span className="text-[11px] text-slate-600 line-clamp-2">{item.projectTitle}</span>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            📅 {item.projectStartDate} s/d {item.projectEndDate}
                          </span>
                        </td>

                        {/* Hierarki */}
                        <td className="p-3 align-top space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                            {item.level}
                          </span>
                          {item.activityCode && (
                            <div className="text-[11px] font-semibold text-emerald-800">
                              {item.activityCode}: {item.activityTitle}
                            </div>
                          )}
                          {item.outputCode && (
                            <div className="text-[10px] text-slate-600">
                              Output: {item.outputCode}
                            </div>
                          )}
                          {item.indicatorCode && (
                            <div className="text-[10px] text-blue-700 font-medium">
                              Indikator: {item.indicatorCode}
                            </div>
                          )}
                        </td>

                        {/* Kategori */}
                        <td className="p-3 align-top">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(item.mov.category)}`}>
                            {item.mov.category}
                          </span>
                        </td>

                        {/* Judul & Catatan */}
                        <td className="p-3 align-top space-y-1">
                          <div className="font-bold text-slate-900">{item.mov.title}</div>
                          {item.mov.notes && (
                            <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-100/80 p-1.5 rounded">
                              {item.mov.notes}
                            </p>
                          )}
                        </td>

                        {/* File */}
                        <td className="p-3 align-top space-y-1">
                          <div className="flex items-center gap-1 text-slate-700 font-semibold text-[11px]">
                            {getFileIcon(item.mov)}
                            <span className="truncate max-w-[140px]">{item.mov.fileName || 'Link Cloud'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.mov.fileSize || '-'}
                          </div>
                        </td>

                        {/* Uploader */}
                        <td className="p-3 align-top space-y-0.5 text-[11px]">
                          <div className="font-semibold text-slate-800">{item.mov.uploadedBy}</div>
                          <div className="text-slate-400 text-[10px]">{item.mov.uploadedAt}</div>
                        </td>

                        {/* Aksi */}
                        <td className="p-3 align-top text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setPreviewDoc(item)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                              title="Pratinjau"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {item.mov.fileUrl ? (
                              <a
                                href={item.mov.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg"
                                title="Buka Link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            ) : (
                              <button
                                onClick={() => handleDownloadMoV(item)}
                                className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Unduh Berkas"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleRequestDelete(item)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Hapus MoV"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: CARDS GALLERY VIEW */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMoVs.map(item => (
                <div 
                  key={item.mov.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(item.mov.category)}`}>
                        {item.mov.category}
                      </span>
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                        {getFileIcon(item.mov)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {item.projectCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-2">
                        {item.mov.title}
                      </h3>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-800 truncate">
                        {item.activityCode ? `Kegiatan: ${item.activityCode}` : `${item.level}: ${item.indicatorCode || item.outputCode || item.outcomeCode || ''}`}
                      </div>
                      {item.activityTitle && (
                        <p className="text-slate-500 line-clamp-1 text-[10px]">{item.activityTitle}</p>
                      )}
                    </div>

                    {item.mov.notes && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.mov.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      <div className="font-semibold text-slate-800 truncate max-w-[120px]">{item.mov.uploadedBy}</div>
                      <div className="text-[10px] text-slate-400">{item.mov.uploadedAt}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewDoc(item)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {item.mov.fileUrl ? (
                        <a
                          href={item.mov.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg"
                          title="Buka Link Cloud"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          onClick={() => handleDownloadMoV(item)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg"
                          title="Unduh Berkas"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleRequestDelete(item)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg"
                          title="Hapus MoV"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL 1: PREVIEW / DETAIL MoV */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500 text-white">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Detail Dokumen Bukti Verifikasi (MoV)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Arsip Terverifikasi Sistem Monitoring & Evaluasi
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* MoV Title & Category */}
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mb-2 ${getCategoryBadge(previewDoc.mov.category)}`}>
                  {previewDoc.mov.category}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {previewDoc.mov.title}
                </h2>
              </div>

              {/* Hierarchy Context Breadcrumb Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Hierarki Logframe Terkait
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-700 min-w-[70px]">Proyek:</span>
                    <span className="font-semibold text-emerald-800">{previewDoc.projectCode} - {previewDoc.projectTitle}</span>
                  </div>
                  {previewDoc.outcomeCode && (
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-700 min-w-[70px]">Outcome:</span>
                      <span className="text-slate-800">{previewDoc.outcomeCode}: {previewDoc.outcomeTitle}</span>
                    </div>
                  )}
                  {previewDoc.outputCode && (
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-700 min-w-[70px]">Output:</span>
                      <span className="text-slate-800">{previewDoc.outputCode}: {previewDoc.outputTitle}</span>
                    </div>
                  )}
                  {previewDoc.activityCode && (
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-700 min-w-[70px]">Kegiatan:</span>
                      <span className="text-slate-800 font-semibold">{previewDoc.activityCode}: {previewDoc.activityTitle}</span>
                    </div>
                  )}
                  {previewDoc.indicatorCode && (
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-700 min-w-[70px]">Indikator:</span>
                      <span className="text-blue-700 font-semibold">{previewDoc.indicatorCode} - {previewDoc.indicatorName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Meta Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Nama Berkas</span>
                  <div className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                    {getFileIcon(previewDoc.mov)}
                    <span className="truncate">{previewDoc.mov.fileName || 'Tautan Cloud'}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Ukuran Berkas</span>
                  <div className="font-bold text-slate-800">{previewDoc.mov.fileSize || '1.5 MB'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Diupload Oleh</span>
                  <div className="font-bold text-slate-800">{previewDoc.mov.uploadedBy}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Tanggal Upload</span>
                  <div className="font-bold text-slate-800">{previewDoc.mov.uploadedAt}</div>
                </div>
              </div>

              {/* Notes / Narrative */}
              {previewDoc.mov.notes && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 text-xs">Catatan & Keterangan Bukti:</label>
                  <p className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-emerald-950 text-xs leading-relaxed">
                    {previewDoc.mov.notes}
                  </p>
                </div>
              )}

              {/* External Cloud Link Banner */}
              {previewDoc.mov.fileUrl && (
                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-sky-700" />
                      Tautan Penyimpanan Cloud
                    </div>
                    <p className="text-[11px] text-sky-700 truncate max-w-sm">{previewDoc.mov.fileUrl}</p>
                  </div>
                  <a
                    href={previewDoc.mov.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Tautan
                  </a>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                {isAdmin && (
                  <button
                    onClick={() => handleRequestDelete(previewDoc)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Dokumen
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleDownloadMoV(previewDoc)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" /> Unduh Dokumen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD NEW MoV */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-700 text-white">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Unggah Bukti Verifikasi (MoV) Baru
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Lampirkan dokumen bukti fisik/digital pada logframe proyek
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMoV} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Project Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 text-xs">
                  Pilih Proyek <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formProjectId}
                  onChange={e => {
                    setFormProjectId(e.target.value);
                    setFormOutcomeId('');
                    setFormOutputId('');
                    setFormActivityId('');
                  }}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">-- Pilih Proyek --</option>
                  {sortedProjects.map(p => {
                    const yr = p.startDate ? new Date(p.startDate).getFullYear() : '';
                    return (
                      <option key={p.id} value={p.id}>
                        {yr ? `[${yr}] ` : ''}{p.code} - {p.title}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Hierarchy Level */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 text-xs">
                  Tingkat Hierarki Sasaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formLevel}
                  onChange={e => setFormLevel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="activity">Level Kegiatan (Activity MoV) - Sangat Disarankan</option>
                  <option value="output">Level Keluaran (Output MoV)</option>
                  <option value="outcome">Level Capaian (Outcome MoV)</option>
                  <option value="goal">Level Dampak (Goal MoV)</option>
                </select>
              </div>

              {/* Cascading selectors if current project exists */}
              {currentFormProject && formLevel !== 'goal' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  {/* Outcome */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 text-xs">Outcome Terkait:</label>
                    <select
                      value={formOutcomeId}
                      onChange={e => {
                        setFormOutcomeId(e.target.value);
                        setFormOutputId('');
                        setFormActivityId('');
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="">-- Pilih Outcome --</option>
                      {currentFormProject.outcomes?.map(oc => (
                        <option key={oc.id} value={oc.id}>{oc.code}: {oc.title.slice(0, 45)}...</option>
                      ))}
                    </select>
                  </div>

                  {/* Output */}
                  {(formLevel === 'output' || formLevel === 'activity') && currentFormOutcome && (
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 text-xs">Output Terkait:</label>
                      <select
                        value={formOutputId}
                        onChange={e => {
                          setFormOutputId(e.target.value);
                          setFormActivityId('');
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">-- Pilih Output --</option>
                        {currentFormOutcome.outputs?.map(op => (
                          <option key={op.id} value={op.id}>{op.code}: {op.title.slice(0, 45)}...</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Activity */}
                  {formLevel === 'activity' && currentFormOutput && (
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 text-xs">Aktivitas/Kegiatan Terkait:</label>
                      <select
                        value={formActivityId}
                        onChange={e => setFormActivityId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">-- Pilih Kegiatan --</option>
                        {currentFormOutput.activities?.map(act => (
                          <option key={act.id} value={act.id}>{act.code}: {act.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Document Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 text-xs">
                  Kategori Bukti Verifikasi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as MoVCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {MOV_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Document Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 text-xs">
                  Judul Dokumen Bukti <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Daftar Presensi Pelatihan Pemetaan Spasial 2026"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* REAL FILE UPLOAD DROPZONE */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 text-xs">
                  Pilih / Unggah Berkas Dokumen Fisik (PDF, DOCX, XLSX, JPG, PNG, ZIP)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-50/70' 
                      : formFileName 
                      ? 'border-emerald-300 bg-emerald-50/30' 
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.webp,.zip"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <FileUp className="w-5 h-5" />
                    </div>
                    {formFileName ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1">
                          <Check className="w-4 h-4 text-emerald-600" /> {formFileName}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Ukuran: {formFileSize || '1.5 MB'} &bull; Klik untuk ganti berkas
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Tarik berkas ke sini atau <span className="text-emerald-600 underline">telusuri file dari perangkat</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Mendukung PDF, Excel, Word, Foto, ZIP hingga 25 MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* External Cloud Link */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 text-xs">
                  Atau Tautan Cloud URL (Google Drive / OneDrive / Dropbox)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formFileUrl}
                  onChange={e => setFormFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 text-xs">Catatan & Keterangan Bukti</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan kelengkapan berkas, nomor registrasi, dsb."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Uploader Name */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 text-xs">Petugas Pengunggah</label>
                <input
                  type="text"
                  value={formUploadedBy}
                  onChange={e => setFormUploadedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Upload className="w-4 h-4" /> Simpan Dokumen MoV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: IN-APP DELETE CONFIRMATION MODAL */}
      {deleteTargetDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Hapus Bukti Verifikasi (MoV)?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus dokumen berikut dari sistem repositori M&E?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900">
                {deleteTargetDoc.docTitle}
              </div>
              {deleteTargetDoc.projectTitle && (
                <div className="text-[11px] text-slate-500">
                  Proyek: {deleteTargetDoc.projectTitle}
                </div>
              )}
            </div>

            <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 leading-relaxed">
              ⚠️ Tindakan ini akan menghapus tautan dokumen dari indikator terkait secara permanen.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTargetDoc(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus MoV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
