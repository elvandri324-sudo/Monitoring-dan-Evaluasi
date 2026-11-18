import { useState, useEffect, useMemo, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import {
  batchDeleteFromFirestore,
  batchUpsertToFirestore,
  connectFirebaseAndFetchUsers,
  deleteDocFromFirestore,
  ensureWorkspaceSeeded,
  PublicPortalData,
  publishPublicSnapshot,
  signInWithGoogleFirebase,
  signOutFirebase,
  subscribeToPublicSnapshot,
  subscribeToWorkspace,
  upsertDocToFirestore,
} from './services/firebaseSync';
import { 
  Project, 
  Beneficiary, 
  ActivityAttendance, 
  Outcome, 
  Output, 
  Activity, 
  Indicator, 
  StatusProgress, 
  TeamMember,
  UserSession,
  KnowledgeProduct,
  StoryOfChange,
  MediaCoverage,
  ProjectLearning,
  MoVDocument,
  ReportItem,
  ReportStatus,
  ReportType,
  UserAccount,
  ErrorReport,
  AccompaniedGroup,
  AccompaniedGroupMember
} from './types';
import { INITIAL_PROJECTS, INITIAL_BENEFICIARIES, INITIAL_ATTENDANCES } from './data/initialData';
import { INITIAL_ACCOMPANIED_GROUPS } from './data/groupData';
import { INITIAL_KNOWLEDGE_PRODUCTS, INITIAL_STORIES_OF_CHANGE, INITIAL_MEDIA_COVERAGES } from './data/publicationData';
import { INITIAL_PROJECT_LEARNINGS } from './data/learningData';
import { INITIAL_REPORTS } from './data/reportData';
import { INITIAL_USERS } from './data/userData';
import { INITIAL_ERROR_REPORTS } from './data/errorData';
import LoginPage from './components/LoginPage';
import AdminLayout, { AdminTabType } from './components/AdminLayout';
import DashboardOverview from './components/DashboardOverview';
import IndicatorChartsView from './components/IndicatorChartsView';
import LogframeManager from './components/LogframeManager';
import ActivityManager from './components/ActivityManager';
import BeneficiaryDatabase from './components/BeneficiaryDatabase';
import AccompaniedGroupManager from './components/AccompaniedGroupManager';
import ProjectTeamManager from './components/ProjectTeamManager';
import PublicationManager from './components/PublicationManager';
import LearningManager from './components/LearningManager';
import ReportManager from './components/ReportManager';
import MoVRepository from './components/MoVRepository';
import UserManagement from './components/UserManagement';
import ErrorReporting from './components/ErrorReporting';
import BeneficiaryFormModal from './components/BeneficiaryFormModal';
import ProjectFormModal from './components/ProjectFormModal';
import ReportGeneratorModal from './components/ReportGeneratorModal';
import DeleteProjectModal from './components/DeleteProjectModal';
import ActivityFormModal from './components/ActivityFormModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import PublicHomePage from './components/PublicHomePage';

export default function App() {
  // View mode: 'public' (Home page statistik pengunjung) vs 'admin' (Entri data & manajemen)
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');

  // Authentication & User Session state (Mandatory login with username & password)
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    localStorage.removeItem('simev_user_session_v3');
    const saved = localStorage.getItem('simev_user_session_v4');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn && parsed.username) {
          return {
            ...parsed,
            assignedProjectIds: parsed.assignedProjectIds || ['all']
          };
        }
      } catch (e) { /* ignore */ }
    }
    return null;
  });

  const [showLoginToast, setShowLoginToast] = useState(false);

  // Navigation state
  const [currentTab, setCurrentTab] = useState<AdminTabType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Persistent States
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('simev_projects_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return INITIAL_PROJECTS;
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem('simev_beneficiaries_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_BENEFICIARIES;
  });

  const [attendances, setAttendances] = useState<ActivityAttendance[]>(() => {
    const saved = localStorage.getItem('simev_attendances_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ATTENDANCES;
  });

  const [knowledgeProducts, setKnowledgeProducts] = useState<KnowledgeProduct[]>(() => {
    const saved = localStorage.getItem('simev_knowledge_products_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_KNOWLEDGE_PRODUCTS;
  });

  const [storiesOfChange, setStoriesOfChange] = useState<StoryOfChange[]>(() => {
    const saved = localStorage.getItem('simev_stories_of_change_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_STORIES_OF_CHANGE;
  });

  const [mediaCoverages, setMediaCoverages] = useState<MediaCoverage[]>(() => {
    const saved = localStorage.getItem('simev_media_coverages_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MEDIA_COVERAGES;
  });

  const [learnings, setLearnings] = useState<ProjectLearning[]>(() => {
    const saved = localStorage.getItem('simev_learnings_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PROJECT_LEARNINGS;
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem('simev_reports_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    const oldSaved = localStorage.getItem('simev_deliverables_v1');
    if (oldSaved) {
      try { return JSON.parse(oldSaved); } catch (e) { /* ignore */ }
    }
    return INITIAL_REPORTS;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('simev_users_v1');
    if (saved) {
      try { 
        const parsed: UserAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(u => u.id !== 'user-001' && u.email !== 'admin@monitoring.com' && u.username !== 'admin');
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS;
  });

  const [accompaniedGroups, setAccompaniedGroups] = useState<AccompaniedGroup[]>(() => {
    const saved = localStorage.getItem('simev_accompanied_groups_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ACCOMPANIED_GROUPS;
  });

  const [errorReports, setErrorReports] = useState<ErrorReport[]>(() => {
    const saved = localStorage.getItem('simev_error_reports_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ERROR_REPORTS;
  });

  // Save to LocalStorage
  useEffect(() => {
    if (userSession && userSession.isLoggedIn) {
      localStorage.setItem('simev_user_session_v4', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('simev_user_session_v4');
    }
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem('simev_projects_v2', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('simev_accompanied_groups_v1', JSON.stringify(accompaniedGroups));
  }, [accompaniedGroups]);

  useEffect(() => {
    localStorage.setItem('simev_beneficiaries_v2', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  useEffect(() => {
    localStorage.setItem('simev_attendances_v2', JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem('simev_knowledge_products_v1', JSON.stringify(knowledgeProducts));
  }, [knowledgeProducts]);

  useEffect(() => {
    localStorage.setItem('simev_stories_of_change_v1', JSON.stringify(storiesOfChange));
  }, [storiesOfChange]);

  useEffect(() => {
    localStorage.setItem('simev_media_coverages_v1', JSON.stringify(mediaCoverages));
  }, [mediaCoverages]);

  useEffect(() => {
    localStorage.setItem('simev_learnings_v1', JSON.stringify(learnings));
  }, [learnings]);

  useEffect(() => {
    localStorage.setItem('simev_reports_v2', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('simev_users_v1', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('simev_error_reports_v1', JSON.stringify(errorReports));
  }, [errorReports]);

  // Modals state
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityModalProjectId, setActivityModalProjectId] = useState<string>('');
  const [activityModalOutputId, setActivityModalOutputId] = useState<string>('');

  const [showReportModal, setShowReportModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Firebase Auth & Real-Time Firestore Synchronization State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseSyncing, setFirebaseSyncing] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [workspaceSyncedOnce, setWorkspaceSyncedOnce] = useState(false);
  const [publicSnapshot, setPublicSnapshot] = useState<PublicPortalData | null>(null);

  const latestDataRef = useRef({
    projects,
    beneficiaries,
    attendances,
    accompaniedGroups,
    knowledgeProducts,
    storiesOfChange,
    mediaCoverages,
    learnings,
    reports,
    users,
    errorReports,
  });

  latestDataRef.current = {
    projects,
    beneficiaries,
    attendances,
    accompaniedGroups,
    knowledgeProducts,
    storiesOfChange,
    mediaCoverages,
    learnings,
    reports,
    users,
    errorReports,
  };

  useEffect(() => {
    let unsubscribeWorkspace: (() => void) | null = null;
    let isCancelled = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeWorkspace) {
        unsubscribeWorkspace();
        unsubscribeWorkspace = null;
      }

      if (!user || !user.emailVerified) {
        setFirebaseUser(null);
        setFirebaseSyncing(false);
        setWorkspaceSyncedOnce(false);
        return;
      }

      setFirebaseUser(user);
      setFirebaseError(null);
      setFirebaseSyncing(true);

      try {
        await ensureWorkspaceSeeded(user, latestDataRef.current);
        if (isCancelled) return;

        unsubscribeWorkspace = subscribeToWorkspace(user, {
          onProjects: (data) => setProjects(data),
          onBeneficiaries: (data) => setBeneficiaries(data),
          onAttendances: (data) => setAttendances(data),
          onAccompaniedGroups: (data) => setAccompaniedGroups(data),
          onKnowledgeProducts: (data) => setKnowledgeProducts(data),
          onStoriesOfChange: (data) => setStoriesOfChange(data),
          onMediaCoverages: (data) => setMediaCoverages(data),
          onLearnings: (data) => setLearnings(data),
          onReports: (data) => setReports(data),
          onUsers: (data) => {
            if (data.length > 0) setUsers(data);
          },
          onErrorReports: (data) => setErrorReports(data),
          onSyncUpdate: () => {
            setFirebaseSyncing(false);
            setWorkspaceSyncedOnce(true);
          },
        });
      } catch (err) {
        if (!isCancelled) {
          setFirebaseSyncing(false);
          setFirebaseError(err instanceof Error ? err.message : 'Gagal menyambung ke Firebase Firestore.');
        }
      }
    });

    return () => {
      isCancelled = true;
      unsubscribeAuth();
      if (unsubscribeWorkspace) unsubscribeWorkspace();
    };
  }, []);

  const isCloudConnected = Boolean(firebaseUser && firebaseUser.emailVerified);

  // Automatic Public Portal listener so visitors across Preview and any other browser immediately see identical live data
  useEffect(() => {
    if (isCloudConnected) return;
    const unsubscribePublic = subscribeToPublicSnapshot((data) => {
      setPublicSnapshot(data);
    });
    return () => unsubscribePublic();
  }, [isCloudConnected]);

  // Automatically keep the zero-PII publicPortal/snapshot synchronized whenever workspace data updates
  useEffect(() => {
    if (!isCloudConnected || !workspaceSyncedOnce) return;
    const timer = setTimeout(() => {
      void publishPublicSnapshot({
        projects,
        beneficiaries,
        attendances,
        knowledgeProducts,
        storiesOfChange,
        mediaCoverages,
        learnings,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [
    isCloudConnected,
    workspaceSyncedOnce,
    projects,
    beneficiaries,
    attendances,
    knowledgeProducts,
    storiesOfChange,
    mediaCoverages,
    learnings,
  ]);

  const handleConnectFirebase = async () => {
    setFirebaseError(null);
    setFirebaseSyncing(true);
    try {
      await signInWithGoogleFirebase();
    } catch (err) {
      setFirebaseSyncing(false);
      setFirebaseError(
        err instanceof Error
          ? err.message
          : 'Gagal menghubungkan akun Google ke Firebase.'
      );
    }
  };

  const handleConnectAndFetchUsers = async (): Promise<UserAccount[] | null> => {
    setFirebaseError(null);
    setFirebaseSyncing(true);
    try {
      const result = await connectFirebaseAndFetchUsers(latestDataRef.current);
      if (result.users.length > 0) {
        setUsers(result.users);
      }
      return result.users;
    } catch (err) {
      setFirebaseSyncing(false);
      // Do not block username/password login if popup was closed or blocked; log cleanly
      const msg = err instanceof Error ? err.message : '';
      if (msg && !msg.includes('popup-closed-by-user') && !msg.includes('cancelled-popup-request')) {
        setFirebaseError(msg);
      }
      return null;
    }
  };

  const handleDisconnectFirebase = async () => {
    setFirebaseError(null);
    await signOutFirebase();
    setFirebaseUser(null);
    setWorkspaceSyncedOnce(false);
  };

  // Login / Logout Handlers
  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    setShowLoginToast(true);

    // Update lastLogin in users state & Firestore
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedUsers = users.map(u =>
      u.email.toLowerCase() === session.email.toLowerCase() || (session.username && u.username.toLowerCase() === session.username.toLowerCase())
        ? { ...u, lastLogin: formattedDate }
        : u
    );
    setUsers(updatedUsers);
    if (isCloudConnected) {
      const targetUser = updatedUsers.find(
        u => u.email.toLowerCase() === session.email.toLowerCase() || (session.username && u.username.toLowerCase() === session.username.toLowerCase())
      );
      if (targetUser) void upsertDocToFirestore('appUsers', targetUser);
    }

    // Determine initial project scope
    const hasAllAccess = session.role === 'Super Admin' || session.assignedProjectIds?.includes('all');
    if (!hasAllAccess && session.assignedProjectIds && session.assignedProjectIds.length > 0) {
      setSelectedProjectId(session.assignedProjectIds[0]);
    } else {
      setSelectedProjectId('all');
    }

    // Auto-dismiss toast after 4 seconds
    setTimeout(() => {
      setShowLoginToast(false);
    }, 4000);
  };

  const handleLogout = () => {
    setUserSession(null);
    setViewMode('public');
  };

  // Beneficiary Handlers
  const handleSaveBeneficiary = (beneficiaryData: Omit<Beneficiary, 'id'> | Beneficiary) => {
    let savedRecord: Beneficiary;
    if ('id' in beneficiaryData && beneficiaryData.id) {
      savedRecord = beneficiaryData as Beneficiary;
      setBeneficiaries(prev => prev.map(b => b.id === savedRecord.id ? savedRecord : b));
    } else {
      savedRecord = {
        ...beneficiaryData,
        id: `ben-${Date.now().toString().slice(-6)}`
      };
      setBeneficiaries(prev => [savedRecord, ...prev]);
    }
    if (isCloudConnected) void upsertDocToFirestore('beneficiaries', savedRecord);
    setEditingBeneficiary(null);
  };

  const handleEditBeneficiary = (b: Beneficiary) => {
    setEditingBeneficiary(b);
    setShowBeneficiaryModal(true);
  };

  const handleDeleteBeneficiary = (id: string) => {
    const removedAttendanceIds = attendances.filter(a => a.beneficiaryId === id).map(a => a.id);
    setBeneficiaries(prev => prev.filter(b => b.id !== id));
    setAttendances(prev => prev.filter(a => a.beneficiaryId !== id));
    if (isCloudConnected) {
      void deleteDocFromFirestore('beneficiaries', id);
      if (removedAttendanceIds.length > 0) void batchDeleteFromFirestore('attendances', removedAttendanceIds);
    }
  };

  const handleDeleteMultipleBeneficiaries = (ids: string[]) => {
    const idSet = new Set(ids);
    const removedAttendanceIds = attendances.filter(a => idSet.has(a.beneficiaryId)).map(a => a.id);
    setBeneficiaries(prev => prev.filter(b => !idSet.has(b.id)));
    setAttendances(prev => prev.filter(a => !idSet.has(a.beneficiaryId)));
    if (isCloudConnected) {
      void batchDeleteFromFirestore('beneficiaries', ids);
      if (removedAttendanceIds.length > 0) void batchDeleteFromFirestore('attendances', removedAttendanceIds);
    }
  };

  const handleBatchImportBeneficiaries = (
    newBeneficiariesData: Omit<Beneficiary, 'id'>[],
    updatedBeneficiariesData: Beneficiary[] = []
  ) => {
    const timestamp = Date.now().toString().slice(-6);
    const newItems: Beneficiary[] = newBeneficiariesData.map((data, index) => ({
      ...data,
      id: `ben-imp-${timestamp}-${index + 1}`
    }));

    setBeneficiaries(prev => {
      let updatedList = [...prev];

      // Update existing if any were merged
      if (updatedBeneficiariesData.length > 0) {
        const updateMap = new Map(updatedBeneficiariesData.map(u => [u.id, u]));
        updatedList = updatedList.map(item => updateMap.has(item.id) ? updateMap.get(item.id)! : item);
      }

      // Prepend new unique beneficiaries
      return [...newItems, ...updatedList];
    });
    if (isCloudConnected) {
      void batchUpsertToFirestore('beneficiaries', [...newItems, ...updatedBeneficiariesData]);
    }
  };

  const updateProjectAndSync = (projectId: string, updater: (project: Project) => Project) => {
    const nextProjects = projects.map(p => (p.id === projectId ? updater(p) : p));
    setProjects(nextProjects);
    if (isCloudConnected) {
      const updated = nextProjects.find(p => p.id === projectId);
      if (updated) void upsertDocToFirestore('projects', updated);
    }
  };

  // Project Handlers
  const handleSaveProject = (projectData: Project) => {
    if (projects.some(p => p.id === projectData.id)) {
      setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
    } else {
      setProjects(prev => [...prev, projectData]);
      setSelectedProjectId(projectData.id);
    }
    if (isCloudConnected) void upsertDocToFirestore('projects', projectData);
    setEditingProject(null);
  };

  const handleEditProject = (p: Project) => {
    setEditingProject(p);
    setShowProjectModal(true);
  };

  const handlePromptDeleteProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      setProjectToDelete(proj);
    }
  };

  const handleConfirmDeleteProject = (projectId: string) => {
    const removedAttendanceIds = attendances.filter(a => a.projectId === projectId).map(a => a.id);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setAttendances(prev => prev.filter(a => a.projectId !== projectId));
    if (isCloudConnected) {
      void deleteDocFromFirestore('projects', projectId);
      if (removedAttendanceIds.length > 0) void batchDeleteFromFirestore('attendances', removedAttendanceIds);
    }
    if (selectedProjectId === projectId) {
      setSelectedProjectId('all');
    }
    setProjectToDelete(null);
  };

  // Team Member Handlers
  const handleAddTeamMember = (projectId: string, memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: `tm-${Date.now().toString().slice(-5)}`
    };
    updateProjectAndSync(projectId, p => ({
      ...p,
      teamMembers: [...p.teamMembers, newMember]
    }));
  };

  const handleUpdateTeamMember = (projectId: string, memberId: string, updatedData: Partial<TeamMember>) => {
    updateProjectAndSync(projectId, p => ({
      ...p,
      teamMembers: p.teamMembers.map(m => m.id === memberId ? { ...m, ...updatedData } : m)
    }));
  };

  const handleRemoveTeamMember = (projectId: string, memberId: string) => {
    updateProjectAndSync(projectId, p => ({
      ...p,
      teamMembers: p.teamMembers.filter(m => m.id !== memberId)
    }));
  };

  // Logframe Indicator Handlers
  const handleUpdateIndicator = (
    projectId: string,
    indicatorId: string,
    newActual: number,
    newStatus: StatusProgress,
    notes?: string,
    periodicLog?: any,
    movDocuments?: any[]
  ) => {
    const updateHelper = (ind: Indicator): Indicator => {
      if (ind.id !== indicatorId) return ind;

      const updatedHistory = periodicLog 
        ? [...(ind.progressHistory || []), periodicLog]
        : (ind.progressHistory || []);

      const updatedMov = movDocuments 
        ? [...(ind.movDocuments || []), ...movDocuments]
        : (ind.movDocuments || []);

      return {
        ...ind,
        actual: newActual,
        status: newStatus,
        notes: notes || ind.notes,
        progressHistory: updatedHistory,
        movDocuments: updatedMov,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    };

    updateProjectAndSync(projectId, p => {
      const updatedGoalInds = p.goalIndicators?.map(ind => updateHelper(ind));

      const updatedOutcomes = p.outcomes.map(oc => {
        const ocInds = oc.indicators.map(ind => updateHelper(ind));

        const updatedOutputs = oc.outputs.map(op => {
          const opInds = op.indicators.map(ind => updateHelper(ind));

          const updatedActivities = op.activities.map(act => {
            const actInds = act.indicators?.map(ind => updateHelper(ind));
            return { ...act, indicators: actInds || [] };
          });

          return { ...op, indicators: opInds, activities: updatedActivities };
        });

        return { ...oc, indicators: ocInds, outputs: updatedOutputs };
      });

      return {
        ...p,
        goalIndicators: updatedGoalInds,
        outcomes: updatedOutcomes
      };
    });
  };

  const handleAddOutcome = (projectId: string, outcome: Partial<Outcome>) => {
    const newOc: Outcome = {
      id: `oc-${Date.now().toString().slice(-6)}`,
      projectId,
      code: outcome.code || `OC-${Date.now().toString().slice(-2)}`,
      title: outcome.title || 'Outcome Baru',
      description: outcome.description || '',
      indicators: outcome.indicators || [],
      outputs: outcome.outputs || []
    };

    updateProjectAndSync(projectId, p => ({ ...p, outcomes: [...p.outcomes, newOc] }));
  };

  const handleUpdateOutcome = (projectId: string, outcomeId: string, updatedData: Partial<Outcome>) => {
    updateProjectAndSync(projectId, p => ({
      ...p,
      outcomes: p.outcomes.map(oc => {
        if (oc.id !== outcomeId) return oc;
        return { ...oc, ...updatedData };
      })
    }));
  };

  const handleDeleteOutcome = (projectId: string, outcomeId: string) => {
    updateProjectAndSync(projectId, p => ({
      ...p,
      outcomes: p.outcomes.filter(oc => oc.id !== outcomeId)
    }));
  };

  const handleAddOutput = (projectId: string, outcomeId: string, output: Partial<Output>) => {
    const newOp: Output = {
      id: `op-${Date.now().toString().slice(-6)}`,
      outcomeId,
      code: output.code || `OP-${Date.now().toString().slice(-2)}`,
      title: output.title || 'Output Baru',
      description: output.description || '',
      targetDate: output.targetDate || '2026-12-31',
      indicators: output.indicators || [],
      activities: output.activities || []
    };

    updateProjectAndSync(projectId, p => ({
      ...p,
      outcomes: p.outcomes.map(oc => {
        if (oc.id !== outcomeId) return oc;
        return { ...oc, outputs: [...oc.outputs, newOp] };
      })
    }));
  };

  const handleUpdateOutput = (projectId: string, outcomeId: string, outputId: string, updatedData: Partial<Output>) => {
    updateProjectAndSync(projectId, p => ({
      ...p,
      outcomes: p.outcomes.map(oc => {
        if (oc.id !== outcomeId) return oc;
        return {
          ...oc,
          outputs: oc.outputs.map(op => {
            if (op.id !== outputId) return op;
            return { ...op, ...updatedData };
          })
        };
      })
    }));
  };

  const handleDeleteOutput = (projectId: string, outcomeId: string, outputId: string) => {
    updateProjectAndSync(projectId, p => ({
      ...p,
      outcomes: p.outcomes.map(oc => {
        if (oc.id !== outcomeId) return oc;
        return {
          ...oc,
          outputs: oc.outputs.filter(op => op.id !== outputId)
        };
      })
    }));
  };

  const handleUpdateIndicatorDetails = (projectId: string, indicatorId: string, updatedData: Partial<Indicator>) => {
    const updateDetails = (ind: Indicator): Indicator => {
      if (ind.id !== indicatorId) return ind;
      return {
        ...ind,
        ...updatedData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    };

    updateProjectAndSync(projectId, p => {
      const updatedGoalInds = p.goalIndicators?.map(ind => updateDetails(ind));

      const updatedOutcomes = p.outcomes.map(oc => {
        const ocInds = oc.indicators.map(ind => updateDetails(ind));

        const updatedOutputs = oc.outputs.map(op => {
          const opInds = op.indicators.map(ind => updateDetails(ind));

          const updatedActivities = op.activities.map(act => {
            const actInds = act.indicators?.map(ind => updateDetails(ind));
            return { ...act, indicators: actInds || [] };
          });

          return { ...op, indicators: opInds, activities: updatedActivities };
        });

        return { ...oc, indicators: ocInds, outputs: updatedOutputs };
      });

      return {
        ...p,
        goalIndicators: updatedGoalInds,
        outcomes: updatedOutcomes
      };
    });
  };

  const handleDeleteIndicator = (projectId: string, indicatorId: string) => {
    updateProjectAndSync(projectId, p => {
      const updatedGoalInds = p.goalIndicators?.filter(ind => ind.id !== indicatorId);

      const updatedOutcomes = p.outcomes.map(oc => {
        const ocInds = oc.indicators.filter(ind => ind.id !== indicatorId);

        const updatedOutputs = oc.outputs.map(op => {
          const opInds = op.indicators.filter(ind => ind.id !== indicatorId);

          const updatedActivities = op.activities.map(act => {
            const actInds = act.indicators?.filter(ind => ind.id !== indicatorId);
            return { ...act, indicators: actInds || [] };
          });

          return { ...op, indicators: opInds, activities: updatedActivities };
        });

        return { ...oc, indicators: ocInds, outputs: updatedOutputs };
      });

      return {
        ...p,
        goalIndicators: updatedGoalInds,
        outcomes: updatedOutcomes
      };
    });
  };

  const handleOpenNewActivity = (projectId?: string, outputId?: string) => {
    setEditingActivity(null);
    setActivityModalProjectId(projectId || (selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || ''));
    setActivityModalOutputId(outputId || '');
    setShowActivityModal(true);
  };

  const handleOpenEditActivity = (activity: Activity, projectId: string, outputId: string) => {
    setEditingActivity(activity);
    setActivityModalProjectId(projectId);
    setActivityModalOutputId(outputId);
    setShowActivityModal(true);
  };

  const handleSaveActivity = (projectId: string, outputId: string, activityData: Partial<Activity>) => {
    const actId = activityData.id || `act-${Date.now().toString().slice(-6)}`;
    
    const newAct: Activity = {
      id: actId,
      outputId: outputId,
      code: activityData.code || `ACT-${Date.now().toString().slice(-2)}`,
      title: activityData.title || 'Kegiatan Baru',
      description: activityData.description || '',
      location: activityData.location || 'Lokasi Kegiatan',
      province: activityData.province || 'Jawa Barat',
      regency: activityData.regency || 'Kabupaten Terkait',
      startDate: activityData.startDate || new Date().toISOString().split('T')[0],
      endDate: activityData.endDate || new Date().toISOString().split('T')[0],
      budgetAllocated: Number(activityData.budgetAllocated) || 0,
      budgetSpent: Number(activityData.budgetSpent) || 0,
      status: activityData.status || 'Direncanakan',
      leadPerson: activityData.leadPerson || 'Project Officer',
      indicators: activityData.indicators || [],
      createdAt: activityData.createdAt || new Date().toISOString()
    };

    updateProjectAndSync(projectId, p => {
      // Check if this activity already exists in any output to update it
      let activityUpdated = false;

      const updatedOutcomes = p.outcomes.map(oc => ({
        ...oc,
        outputs: oc.outputs.map(op => {
          const hasExisting = op.activities.some(a => a.id === actId);
          if (hasExisting) {
            activityUpdated = true;
            return {
              ...op,
              activities: op.activities.map(a => a.id === actId ? newAct : a)
            };
          }

          // If this is the target output and it wasn't existing, append it
          if (op.id === outputId && !activityUpdated) {
            activityUpdated = true;
            return {
              ...op,
              activities: [...op.activities, newAct]
            };
          }

          return op;
        })
      }));

      // If output wasn't matched directly (e.g. first outcome/output fallback)
      if (!activityUpdated && updatedOutcomes[0]?.outputs[0]) {
        updatedOutcomes[0] = {
          ...updatedOutcomes[0],
          outputs: updatedOutcomes[0].outputs.map((op, idx) =>
            idx === 0 ? { ...op, activities: [...op.activities, newAct] } : op
          ),
        };
      }

      return {
        ...p,
        outcomes: updatedOutcomes
      };
    });

    setShowActivityModal(false);
    setEditingActivity(null);
  };

  const handleAddActivity = (projectId: string, outputId: string, activity: Partial<Activity>) => {
    handleSaveActivity(projectId, outputId, activity);
  };

  const handleDeleteActivity = (projectId: string, activityId: string) => {
    const removedAttendanceIds = attendances.filter(att => att.activityId === activityId).map(att => att.id);
    updateProjectAndSync(projectId, p => ({
      ...p,
      outcomes: p.outcomes.map(oc => ({
        ...oc,
        outputs: oc.outputs.map(op => ({
          ...op,
          activities: op.activities.filter(a => a.id !== activityId)
        }))
      }))
    }));
    setAttendances(prev => prev.filter(att => att.activityId !== activityId));
    if (isCloudConnected && removedAttendanceIds.length > 0) {
      void batchDeleteFromFirestore('attendances', removedAttendanceIds);
    }
  };

  const handleAddIndicator = (
    projectId: string,
    parentLevel: 'Goal' | 'Outcome' | 'Output' | 'Activity',
    parentId: string,
    indicator: Partial<Indicator>
  ) => {
    const newInd: Indicator = {
      id: `ind-${Date.now().toString().slice(-6)}`,
      code: indicator.code || `IND-${Date.now().toString().slice(-4)}`,
      level: parentLevel,
      parentId,
      name: indicator.name || 'Indikator Baru',
      definition: indicator.definition || '',
      baseline: indicator.baseline || 0,
      target: indicator.target || 100,
      actual: indicator.actual || 0,
      unit: indicator.unit || 'Orang / Individu',
      meansOfVerification: indicator.meansOfVerification || 'Daftar Presensi / Laporan',
      frequency: indicator.frequency || 'Kuartal',
      disaggregationRequired: indicator.disaggregationRequired ?? true,
      status: indicator.status || 'Belum Dimulai',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    updateProjectAndSync(projectId, p => {
      if (parentLevel === 'Goal') {
        return { ...p, goalIndicators: [...(p.goalIndicators || []), newInd] };
      }

      if (parentLevel === 'Outcome') {
        return {
          ...p,
          outcomes: p.outcomes.map(oc => {
            if (oc.id !== parentId) return oc;
            return { ...oc, indicators: [...oc.indicators, newInd] };
          })
        };
      }

      if (parentLevel === 'Output') {
        return {
          ...p,
          outcomes: p.outcomes.map(oc => ({
            ...oc,
            outputs: oc.outputs.map(op => {
              if (op.id !== parentId) return op;
              return { ...op, indicators: [...op.indicators, newInd] };
            })
          }))
        };
      }

      if (parentLevel === 'Activity') {
        return {
          ...p,
          outcomes: p.outcomes.map(oc => ({
            ...oc,
            outputs: oc.outputs.map(op => ({
              ...op,
              activities: op.activities.map(act => {
                if (act.id !== parentId) return act;
                return { ...act, indicators: [...(act.indicators || []), newInd] };
              })
            }))
          }))
        };
      }

      return p;
    });
  };

  // Attendance Handlers
  const handleAddAttendance = (attendanceData: Omit<ActivityAttendance, 'id'>) => {
    const exists = attendances.some(
      a => a.activityId === attendanceData.activityId && a.beneficiaryId === attendanceData.beneficiaryId
    );
    if (exists) {
      return { success: false, message: 'Penerima manfaat ini sudah terdaftar dalam kegiatan ini (anti duplikasi).' };
    }

    const newAtt: ActivityAttendance = {
      ...attendanceData,
      id: `att-${Date.now().toString().slice(-6)}`
    };
    setAttendances(prev => [newAtt, ...prev]);
    if (isCloudConnected) void upsertDocToFirestore('attendances', newAtt);
    return { success: true, message: 'Peserta berhasil ditambahkan ke daftar hadir.' };
  };

  const handleRemoveAttendance = (attendanceId: string) => {
    setAttendances(prev => prev.filter(a => a.id !== attendanceId));
    if (isCloudConnected) void deleteDocFromFirestore('attendances', attendanceId);
  };

  const handleRestoreBackup = (backupData: any) => {
    if (backupData.projects) {
      setProjects(backupData.projects);
      if (isCloudConnected) void batchUpsertToFirestore('projects', backupData.projects);
    }
    if (backupData.beneficiaries) {
      setBeneficiaries(backupData.beneficiaries);
      if (isCloudConnected) void batchUpsertToFirestore('beneficiaries', backupData.beneficiaries);
    }
    if (backupData.attendances) {
      setAttendances(backupData.attendances);
      if (isCloudConnected) void batchUpsertToFirestore('attendances', backupData.attendances);
    }
    if (backupData.accompaniedGroups) {
      setAccompaniedGroups(backupData.accompaniedGroups);
      if (isCloudConnected) void batchUpsertToFirestore('accompaniedGroups', backupData.accompaniedGroups);
    }
    if (backupData.knowledgeProducts) {
      setKnowledgeProducts(backupData.knowledgeProducts);
      if (isCloudConnected) void batchUpsertToFirestore('knowledgeProducts', backupData.knowledgeProducts);
    }
    if (backupData.storiesOfChange) {
      setStoriesOfChange(backupData.storiesOfChange);
      if (isCloudConnected) void batchUpsertToFirestore('storiesOfChange', backupData.storiesOfChange);
    }
    if (backupData.mediaCoverages) {
      setMediaCoverages(backupData.mediaCoverages);
      if (isCloudConnected) void batchUpsertToFirestore('mediaCoverages', backupData.mediaCoverages);
    }
    if (backupData.learnings) {
      setLearnings(backupData.learnings);
      if (isCloudConnected) void batchUpsertToFirestore('learnings', backupData.learnings);
    }
    if (backupData.reports) {
      setReports(backupData.reports);
      if (isCloudConnected) void batchUpsertToFirestore('reports', backupData.reports);
    } else if (backupData.deliverables) {
      setReports(backupData.deliverables);
      if (isCloudConnected) void batchUpsertToFirestore('reports', backupData.deliverables);
    }
  };

  // Reports Handlers
  const handleSaveReport = (item: ReportItem) => {
    const exists = reports.some(d => d.id === item.id);
    const savedItem: ReportItem = exists
      ? { ...item, updatedAt: new Date().toISOString() }
      : { ...item, createdAt: item.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    setReports(prev => (exists ? prev.map(d => d.id === item.id ? savedItem : d) : [savedItem, ...prev]));
    if (isCloudConnected) void upsertDocToFirestore('reports', savedItem);
  };

  const handleDeleteReport = (id: string) => {
    setReports(prev => prev.filter(d => d.id !== id));
    if (isCloudConnected) void deleteDocFromFirestore('reports', id);
  };

  const handleUpdateReportStatus = (id: string, status: ReportStatus, reviewNotes?: string) => {
    const target = reports.find(d => d.id === id);
    if (!target) return;
    const updatedItem: ReportItem = {
      ...target,
      status,
      reviewNotes: reviewNotes !== undefined ? reviewNotes : target.reviewNotes,
      updatedAt: new Date().toISOString()
    };
    setReports(prev => prev.map(d => (d.id === id ? updatedItem : d)));
    if (isCloudConnected) void upsertDocToFirestore('reports', updatedItem);
  };

  // Learning Matrix Handlers
  const handleSaveLearning = (item: ProjectLearning) => {
    const exists = learnings.some(l => l.id === item.id);
    const savedItem: ProjectLearning = exists ? { ...item, updatedAt: new Date().toISOString() } : item;
    setLearnings(prev => (exists ? prev.map(l => l.id === item.id ? savedItem : l) : [savedItem, ...prev]));
    if (isCloudConnected) void upsertDocToFirestore('learnings', savedItem);
  };

  const handleDeleteLearning = (id: string) => {
    setLearnings(prev => prev.filter(l => l.id !== id));
    if (isCloudConnected) void deleteDocFromFirestore('learnings', id);
  };

  // Publication Handlers: Knowledge Products
  const handleSaveKnowledgeProduct = (item: KnowledgeProduct) => {
    const exists = knowledgeProducts.some(k => k.id === item.id);
    const savedItem: KnowledgeProduct = exists ? { ...item, updatedAt: new Date().toISOString() } : item;
    setKnowledgeProducts(prev => (exists ? prev.map(k => k.id === item.id ? savedItem : k) : [savedItem, ...prev]));
    if (isCloudConnected) void upsertDocToFirestore('knowledgeProducts', savedItem);
  };

  const handleDeleteKnowledgeProduct = (id: string) => {
    setKnowledgeProducts(prev => prev.filter(k => k.id !== id));
    if (isCloudConnected) void deleteDocFromFirestore('knowledgeProducts', id);
  };

  // Publication Handlers: Stories of Change
  const handleSaveStoryOfChange = (item: StoryOfChange) => {
    const exists = storiesOfChange.some(s => s.id === item.id);
    const savedItem: StoryOfChange = exists ? { ...item, updatedAt: new Date().toISOString() } : item;
    setStoriesOfChange(prev => (exists ? prev.map(s => s.id === item.id ? savedItem : s) : [savedItem, ...prev]));
    if (isCloudConnected) void upsertDocToFirestore('storiesOfChange', savedItem);
  };

  const handleDeleteStoryOfChange = (id: string) => {
    setStoriesOfChange(prev => prev.filter(s => s.id !== id));
    if (isCloudConnected) void deleteDocFromFirestore('storiesOfChange', id);
  };

  // Publication Handlers: Media Coverage
  const handleSaveMediaCoverage = (item: MediaCoverage) => {
    const exists = mediaCoverages.some(m => m.id === item.id);
    const savedItem: MediaCoverage = exists ? { ...item, updatedAt: new Date().toISOString() } : item;
    setMediaCoverages(prev => (exists ? prev.map(m => m.id === item.id ? savedItem : m) : [savedItem, ...prev]));
    if (isCloudConnected) void upsertDocToFirestore('mediaCoverages', savedItem);
  };

  const handleDeleteMediaCoverage = (id: string) => {
    setMediaCoverages(prev => prev.filter(m => m.id !== id));
    if (isCloudConnected) void deleteDocFromFirestore('mediaCoverages', id);
  };

  // User Management Handlers
  const handleAddUser = (newUser: UserAccount) => {
    setUsers(prev => [newUser, ...prev]);
    if (isCloudConnected) void upsertDocToFirestore('appUsers', newUser);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (isCloudConnected) void upsertDocToFirestore('appUsers', updatedUser);
    if (userSession && (userSession.id === updatedUser.id || (userSession.username && userSession.username.toLowerCase() === updatedUser.username.toLowerCase()))) {
      setUserSession(prev => prev ? {
        ...prev,
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        assignedProjectIds: updatedUser.assignedProjectIds && updatedUser.assignedProjectIds.length > 0 ? updatedUser.assignedProjectIds : ['all'],
        avatarUrl: updatedUser.avatarUrl
      } : prev);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (isCloudConnected) void deleteDocFromFirestore('appUsers', userId);
  };

  // Error Report Handlers
  const handleAddErrorReport = (newReport: ErrorReport) => {
    setErrorReports(prev => [newReport, ...prev]);
    if (isCloudConnected) void upsertDocToFirestore('errorReports', newReport);
  };

  const handleUpdateErrorReport = (updatedReport: ErrorReport) => {
    setErrorReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    if (isCloudConnected) void upsertDocToFirestore('errorReports', updatedReport);
  };

  const handleDeleteErrorReport = (reportId: string) => {
    setErrorReports(prev => prev.filter(r => r.id !== reportId));
    if (isCloudConnected) void deleteDocFromFirestore('errorReports', reportId);
  };

  // Accompanied Community Groups Handlers
  const handleAddAccompaniedGroup = (newGroup: AccompaniedGroup) => {
    setAccompaniedGroups(prev => [newGroup, ...prev]);
    if (isCloudConnected) void upsertDocToFirestore('accompaniedGroups', newGroup);
  };

  const handleUpdateAccompaniedGroup = (updatedGroup: AccompaniedGroup) => {
    setAccompaniedGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    if (isCloudConnected) void upsertDocToFirestore('accompaniedGroups', updatedGroup);
  };

  const handleDeleteAccompaniedGroup = (groupId: string) => {
    setAccompaniedGroups(prev => prev.filter(g => g.id !== groupId));
    if (isCloudConnected) void deleteDocFromFirestore('accompaniedGroups', groupId);
  };

  const handleAddMembersToGroup = (groupId: string, newMembers: AccompaniedGroupMember[]) => {
    const target = accompaniedGroups.find(g => g.id === groupId);
    if (!target) return;
    const existingIds = new Set(target.members.map(m => m.beneficiaryId));
    const filteredNew = newMembers.filter(m => !existingIds.has(m.beneficiaryId));
    const updatedGroup: AccompaniedGroup = {
      ...target,
      members: [...target.members, ...filteredNew],
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setAccompaniedGroups(prev => prev.map(g => (g.id === groupId ? updatedGroup : g)));
    if (isCloudConnected) void upsertDocToFirestore('accompaniedGroups', updatedGroup);
  };

  const handleRemoveMemberFromGroup = (groupId: string, beneficiaryId: string) => {
    const target = accompaniedGroups.find(g => g.id === groupId);
    if (!target) return;
    const updatedGroup: AccompaniedGroup = {
      ...target,
      members: target.members.filter(m => m.beneficiaryId !== beneficiaryId),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setAccompaniedGroups(prev => prev.map(g => (g.id === groupId ? updatedGroup : g)));
    if (isCloudConnected) void upsertDocToFirestore('accompaniedGroups', updatedGroup);
  };

  const handleUpdateMemberRole = (groupId: string, beneficiaryId: string, newRole: string) => {
    const target = accompaniedGroups.find(g => g.id === groupId);
    if (!target) return;
    const updatedGroup: AccompaniedGroup = {
      ...target,
      members: target.members.map(m => m.beneficiaryId === beneficiaryId ? { ...m, roleInGroup: newRole } : m),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setAccompaniedGroups(prev => prev.map(g => (g.id === groupId ? updatedGroup : g)));
    if (isCloudConnected) void upsertDocToFirestore('accompaniedGroups', updatedGroup);
  };

  // Projects sorted by Start Date & Year
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const timeA = new Date(a.startDate || '').getTime() || 0;
      const timeB = new Date(b.startDate || '').getTime() || 0;
      return timeA - timeB;
    });
  }, [projects]);

  // Role and access control calculations
  const canAccessAllProjects = useMemo(() => {
    if (!userSession) return false;
    return userSession.role === 'Super Admin' || (userSession.assignedProjectIds && userSession.assignedProjectIds.includes('all'));
  }, [userSession]);

  const currentUserAccount = useMemo(() => {
    if (!userSession) return null;
    return users.find(
      u => (userSession.id && u.id === userSession.id) ||
           (userSession.username && u.username.toLowerCase() === userSession.username.toLowerCase())
    ) || null;
  }, [users, userSession]);

  // Keep active userSession in sync if account details change from another device via Firestore
  useEffect(() => {
    if (!userSession || !currentUserAccount) return;
    const nextProjects =
      currentUserAccount.assignedProjectIds && currentUserAccount.assignedProjectIds.length > 0
        ? currentUserAccount.assignedProjectIds
        : ['all'];
    const projectsChanged =
      JSON.stringify(userSession.assignedProjectIds || []) !== JSON.stringify(nextProjects);
    if (
      userSession.name !== currentUserAccount.fullName ||
      userSession.email !== currentUserAccount.email ||
      userSession.username !== currentUserAccount.username ||
      userSession.role !== currentUserAccount.role ||
      userSession.avatarUrl !== currentUserAccount.avatarUrl ||
      projectsChanged
    ) {
      setUserSession(prev =>
        prev
          ? {
              ...prev,
              id: currentUserAccount.id,
              username: currentUserAccount.username,
              name: currentUserAccount.fullName,
              email: currentUserAccount.email,
              role: currentUserAccount.role,
              assignedProjectIds: nextProjects,
              avatarUrl: currentUserAccount.avatarUrl,
            }
          : prev
      );
    }
  }, [currentUserAccount, userSession]);

  const isAdmin = userSession?.role === 'Super Admin' || userSession?.role === 'Admin';
  const canEdit = isAdmin || userSession?.role === 'Staff M&E' || userSession?.role === 'Field Coordinator';

  // Projects strictly accessible to the logged in user
  const accessibleProjects = useMemo(() => {
    if (!userSession) return sortedProjects;
    if (canAccessAllProjects) return sortedProjects;
    return sortedProjects.filter(p => userSession.assignedProjectIds?.includes(p.id));
  }, [sortedProjects, userSession, canAccessAllProjects]);

  const accessibleProjectIds = useMemo(() => {
    return accessibleProjects.map(p => p.id);
  }, [accessibleProjects]);

  // Ensure selectedProjectId is always valid for the active user session
  useEffect(() => {
    if (userSession && !canAccessAllProjects && accessibleProjects.length > 0) {
      if (selectedProjectId === 'all' || !accessibleProjectIds.includes(selectedProjectId)) {
        setSelectedProjectId(accessibleProjects[0].id);
      }
    }
  }, [userSession, canAccessAllProjects, accessibleProjects, accessibleProjectIds, selectedProjectId]);

  // Prevent non-admin users from accessing the user management tab
  useEffect(() => {
    if (userSession && !isAdmin && currentTab === 'users') {
      setCurrentTab('dashboard');
    }
  }, [userSession, isAdmin, currentTab]);

  // Filter project-specific data when assigned to specific projects
  const userAccessibleAttendances = useMemo(() => {
    if (canAccessAllProjects) return attendances;
    return attendances.filter(att => accessibleProjectIds.includes(att.projectId));
  }, [attendances, canAccessAllProjects, accessibleProjectIds]);

  const userAccessibleBeneficiaries = useMemo(() => {
    if (canAccessAllProjects) return beneficiaries;
    const attendedBeneficiaryIds = new Set(userAccessibleAttendances.map(a => a.beneficiaryId));
    return beneficiaries.filter(b => 
      (b.registeredProjectId && accessibleProjectIds.includes(b.registeredProjectId)) ||
      attendedBeneficiaryIds.has(b.id)
    );
  }, [beneficiaries, canAccessAllProjects, accessibleProjectIds, userAccessibleAttendances]);

  const userAccessibleReports = useMemo(() => {
    if (canAccessAllProjects) return reports;
    return reports.filter(r => !r.projectId || r.projectId === 'all' || accessibleProjectIds.includes(r.projectId));
  }, [reports, canAccessAllProjects, accessibleProjectIds]);

  const userAccessibleLearnings = useMemo(() => {
    if (canAccessAllProjects) return learnings;
    return learnings.filter(l => !l.projectId || l.projectId === 'all' || accessibleProjectIds.includes(l.projectId));
  }, [learnings, canAccessAllProjects, accessibleProjectIds]);

  const userAccessibleKnowledgeProducts = useMemo(() => {
    if (canAccessAllProjects) return knowledgeProducts;
    return knowledgeProducts.filter(k => !k.projectId || k.projectId === 'all' || accessibleProjectIds.includes(k.projectId));
  }, [knowledgeProducts, canAccessAllProjects, accessibleProjectIds]);

  const userAccessibleStories = useMemo(() => {
    if (canAccessAllProjects) return storiesOfChange;
    return storiesOfChange.filter(s => !s.projectId || s.projectId === 'all' || accessibleProjectIds.includes(s.projectId));
  }, [storiesOfChange, canAccessAllProjects, accessibleProjectIds]);

  const userAccessibleMedia = useMemo(() => {
    if (canAccessAllProjects) return mediaCoverages;
    return mediaCoverages.filter(m => !m.projectId || m.projectId === 'all' || accessibleProjectIds.includes(m.projectId));
  }, [mediaCoverages, canAccessAllProjects, accessibleProjectIds]);

  // MoV Handlers
  const handleAddMoVDocument = (
    projectId: string,
    targetLevel: 'goal' | 'outcome' | 'output' | 'activity',
    targetId: string,
    doc: MoVDocument,
    indicatorId?: string
  ) => {
    updateProjectAndSync(projectId, p => {
      const appendToInd = (ind: Indicator): Indicator => {
        const existingDocs = ind.movDocuments || [];
        return {
          ...ind,
          movDocuments: [doc, ...existingDocs],
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      };

      if (targetLevel === 'goal') {
        const targetInd = p.goalIndicators?.find(ind => indicatorId ? ind.id === indicatorId : true);
        if (targetInd) {
          return {
            ...p,
            goalIndicators: p.goalIndicators?.map(ind => ind.id === targetInd.id ? appendToInd(ind) : ind)
          };
        } else {
          const newGoalInd: Indicator = {
            id: `ind-goal-${Date.now().toString().slice(-4)}`,
            code: `IND-GOAL.${(p.goalIndicators?.length || 0) + 1}`,
            level: 'Goal',
            parentId: p.id,
            name: 'Indikator Capaian Dampak Proyek',
            definition: 'Verifikasi bukti fisik/digital sasaran dampak',
            baseline: 0,
            target: 100,
            actual: 100,
            unit: 'Dokumen / Kebijakan',
            meansOfVerification: doc.title,
            movDocuments: [doc],
            frequency: 'Annual',
            status: 'Tercapai',
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          return {
            ...p,
            goalIndicators: [...(p.goalIndicators || []), newGoalInd]
          };
        }
      }

      if (targetLevel === 'outcome') {
        return {
          ...p,
          outcomes: p.outcomes.map(oc => {
            if (oc.id !== targetId && p.outcomes.length > 1) return oc;
            if (oc.indicators && oc.indicators.length > 0) {
              const targetInd = oc.indicators.find(ind => indicatorId ? ind.id === indicatorId : true) || oc.indicators[0];
              return {
                ...oc,
                indicators: oc.indicators.map(ind => ind.id === targetInd.id ? appendToInd(ind) : ind)
              };
            } else {
              const newOcInd: Indicator = {
                id: `ind-oc-${Date.now().toString().slice(-4)}`,
                code: `IND-${oc.code}.1`,
                level: 'Outcome',
                parentId: oc.id,
                name: `Indikator Capaian ${oc.code}`,
                definition: 'Verifikasi bukti pencapaian outcome',
                baseline: 0,
                target: 100,
                actual: 100,
                unit: 'Dokumen / Kebijakan',
                meansOfVerification: doc.title,
                movDocuments: [doc],
                frequency: 'Mid Year',
                status: 'Tercapai',
                lastUpdated: new Date().toISOString().split('T')[0]
              };
              return {
                ...oc,
                indicators: [newOcInd]
              };
            }
          })
        };
      }

      if (targetLevel === 'output') {
        return {
          ...p,
          outcomes: p.outcomes.map(oc => ({
            ...oc,
            outputs: oc.outputs.map(op => {
              if (op.id !== targetId) return op;
              if (op.indicators && op.indicators.length > 0) {
                const targetInd = op.indicators.find(ind => indicatorId ? ind.id === indicatorId : true) || op.indicators[0];
                return {
                  ...op,
                  indicators: op.indicators.map(ind => ind.id === targetInd.id ? appendToInd(ind) : ind)
                };
              } else {
                const newOpInd: Indicator = {
                  id: `ind-op-${Date.now().toString().slice(-4)}`,
                  code: `IND-${op.code}.1`,
                  level: 'Output',
                  parentId: op.id,
                  name: `Indikator Output ${op.code}`,
                  definition: 'Verifikasi bukti keluaran kegiatan',
                  baseline: 0,
                  target: 100,
                  actual: 100,
                  unit: 'Dokumen / Kebijakan',
                  meansOfVerification: doc.title,
                  movDocuments: [doc],
                  frequency: 'Kuartal',
                  status: 'Tercapai',
                  lastUpdated: new Date().toISOString().split('T')[0]
                };
                return {
                  ...op,
                  indicators: [newOpInd]
                };
              }
            })
          }))
        };
      }

      if (targetLevel === 'activity') {
        return {
          ...p,
          outcomes: p.outcomes.map(oc => ({
            ...oc,
            outputs: oc.outputs.map(op => ({
              ...op,
              activities: op.activities.map(act => {
                if (act.id !== targetId) return act;
                if (act.indicators && act.indicators.length > 0) {
                  const targetInd = act.indicators.find(ind => indicatorId ? ind.id === indicatorId : true) || act.indicators[0];
                  return {
                    ...act,
                    indicators: act.indicators.map(ind => ind.id === targetInd.id ? appendToInd(ind) : ind)
                  };
                } else {
                  const newActInd: Indicator = {
                    id: `ind-act-${Date.now().toString().slice(-4)}`,
                    code: `IND-${act.code}`,
                    level: 'Activity',
                    parentId: act.id,
                    name: `Bukti Pelaksanaan Kegiatan ${act.code}`,
                    definition: 'Presensi, dokumentasi foto, dan berita acara',
                    baseline: 0,
                    target: 1,
                    actual: 1,
                    unit: 'Dokumen / Kebijakan',
                    meansOfVerification: doc.title,
                    movDocuments: [doc],
                    frequency: 'Akhir Proyek',
                    status: 'Tercapai',
                    lastUpdated: new Date().toISOString().split('T')[0]
                  };
                  return {
                    ...act,
                    indicators: [newActInd]
                  };
                }
              })
            }))
          }))
        };
      }

      return p;
    });
  };

  const handleDeleteMoVDocument = (projectId: string, docId: string) => {
    const changedProjects: Project[] = [];
    const nextProjects = projects.map(p => {
      if (projectId && projectId !== 'all' && p.id !== projectId) {
        return p;
      }

      let modified = false;
      const filterDocs = (ind: Indicator): Indicator => {
        const hasDoc = ind.movDocuments?.some(d => d.id === docId);
        const hasHistoryDoc = ind.progressHistory?.some(h => h.movDocuments?.some(d => d.id === docId));
        if (!hasDoc && !hasHistoryDoc) return ind;
        modified = true;

        return {
          ...ind,
          movDocuments: ind.movDocuments ? ind.movDocuments.filter(d => d.id !== docId) : [],
          progressHistory: ind.progressHistory?.map(log => ({
            ...log,
            movDocuments: log.movDocuments ? log.movDocuments.filter(d => d.id !== docId) : []
          })),
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      };

      const updatedGoalInds = p.goalIndicators?.map(ind => filterDocs(ind));

      const updatedOutcomes = p.outcomes.map(oc => {
        const ocInds = oc.indicators?.map(ind => filterDocs(ind));
        const updatedOutputs = oc.outputs?.map(op => {
          const opInds = op.indicators?.map(ind => filterDocs(ind));
          const updatedActivities = op.activities?.map(act => {
            const actInds = act.indicators?.map(ind => filterDocs(ind));
            return { ...act, indicators: actInds || [] };
          });
          return { ...op, indicators: opInds, activities: updatedActivities };
        });
        return { ...oc, indicators: ocInds, outputs: updatedOutputs };
      });

      const updatedProj = {
        ...p,
        goalIndicators: updatedGoalInds,
        outcomes: updatedOutcomes
      };
      if (modified) changedProjects.push(updatedProj);
      return updatedProj;
    });

    setProjects(nextProjects);
    if (isCloudConnected && changedProjects.length > 0) {
      void batchUpsertToFirestore('projects', changedProjects);
    }
  };

  // If in Public Visitor Mode, display the Public Home & Statistics Page
  if (viewMode === 'public') {
    const useSnapshot = !isCloudConnected && publicSnapshot !== null;
    const publicProjects = useSnapshot
      ? [...publicSnapshot.projects].sort((a, b) => (new Date(a.startDate || '').getTime() || 0) - (new Date(b.startDate || '').getTime() || 0))
      : sortedProjects;
    return (
      <PublicHomePage
        projects={publicProjects}
        beneficiaries={useSnapshot ? publicSnapshot.beneficiaries : beneficiaries}
        attendances={useSnapshot ? publicSnapshot.attendances : attendances}
        knowledgeProducts={useSnapshot ? publicSnapshot.knowledgeProducts : knowledgeProducts}
        storiesOfChange={useSnapshot ? publicSnapshot.storiesOfChange : storiesOfChange}
        mediaCoverages={useSnapshot ? publicSnapshot.mediaCoverages : mediaCoverages}
        learnings={useSnapshot ? publicSnapshot.learnings : learnings}
        onGoToAdmin={() => setViewMode('admin')}
      />
    );
  }

  // If in Admin Mode and user is not logged in, display the Login Screen
  if (!userSession || !userSession.isLoggedIn) {
    return (
      <LoginPage 
        users={users}
        projects={sortedProjects}
        onLogin={handleLogin} 
        onResetPassword={(userId, newPassword) => {
          const updatedUsers = users.map(u => u.id === userId ? { ...u, password: newPassword } : u);
          setUsers(updatedUsers);
          if (isCloudConnected) {
            const target = updatedUsers.find(u => u.id === userId);
            if (target) void upsertDocToFirestore('appUsers', target);
          }
        }}
        onBackToPublic={() => setViewMode('public')}
        firebaseUser={firebaseUser ? { email: firebaseUser.email, uid: firebaseUser.uid } : null}
        firebaseSyncing={firebaseSyncing}
        firebaseError={firebaseError}
        onConnectAndFetchUsers={handleConnectAndFetchUsers}
      />
    );
  }

  // If user is logged in to Admin workspace, display the Admin Dashboard Layout
  return (
    <AdminLayout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      userSession={userSession}
      onLogout={handleLogout}
      onGoToPublic={() => setViewMode('public')}
      projects={accessibleProjects}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={setSelectedProjectId}
      onOpenNewProjectModal={() => {
        if (!isAdmin) return;
        setEditingProject(null);
        setShowProjectModal(true);
      }}
      onEditProject={handleEditProject}
      onOpenNewActivityModal={() => handleOpenNewActivity()}
      onOpenNewBeneficiaryModal={() => {
        setEditingBeneficiary(null);
        setShowBeneficiaryModal(true);
      }}
      onOpenReportModal={() => setShowReportModal(true)}
      onOpenAccountSettings={() => setShowAccountSettingsModal(true)}
      showLoginToast={showLoginToast}
      onDismissToast={() => setShowLoginToast(false)}
      firebaseUser={firebaseUser ? { email: firebaseUser.email, uid: firebaseUser.uid } : null}
      firebaseSyncing={firebaseSyncing}
      onConnectFirebase={handleConnectFirebase}
      onDisconnectFirebase={handleDisconnectFirebase}
    >
      {/* Dynamic View by Selected Tab */}
      {currentTab === 'dashboard' && (
        <DashboardOverview
          projects={accessibleProjects}
          beneficiaries={userAccessibleBeneficiaries}
          attendances={userAccessibleAttendances}
          selectedProjectId={selectedProjectId}
          onNavigate={setCurrentTab}
          onOpenNewActivityModal={() => handleOpenNewActivity()}
          isAdmin={isAdmin}
          onEditProject={handleEditProject}
        />
      )}

      {currentTab === 'indicators' && (
        <IndicatorChartsView
          projects={accessibleProjects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />
      )}

      {currentTab === 'activities' && (
        <ActivityManager
          projects={accessibleProjects}
          beneficiaries={userAccessibleBeneficiaries}
          attendances={userAccessibleAttendances}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          isAdmin={canEdit}
          onAddAttendance={handleAddAttendance}
          onRemoveAttendance={handleRemoveAttendance}
          onOpenNewActivityModal={() => handleOpenNewActivity()}
          onOpenEditActivityModal={(act, pId, opId) => handleOpenEditActivity(act, pId, opId)}
          onDeleteActivity={handleDeleteActivity}
          onOpenNewBeneficiaryModal={() => {
            setEditingBeneficiary(null);
            setShowBeneficiaryModal(true);
          }}
        />
      )}

      {currentTab === 'beneficiaries' && (
        <BeneficiaryDatabase
          beneficiaries={userAccessibleBeneficiaries}
          attendances={userAccessibleAttendances}
          projects={accessibleProjects}
          isAdmin={canEdit}
          onOpenNewBeneficiaryModal={() => {
            setEditingBeneficiary(null);
            setShowBeneficiaryModal(true);
          }}
          onEditBeneficiary={handleEditBeneficiary}
          onDeleteBeneficiary={handleDeleteBeneficiary}
          onDeleteMultipleBeneficiaries={handleDeleteMultipleBeneficiaries}
          onBatchImportBeneficiaries={handleBatchImportBeneficiaries}
        />
      )}

      {currentTab === 'groups' && (
        <AccompaniedGroupManager
          groups={accompaniedGroups}
          beneficiaries={userAccessibleBeneficiaries}
          projects={accessibleProjects}
          attendances={userAccessibleAttendances}
          selectedProjectId={selectedProjectId}
          isAdmin={canEdit}
          onAddGroup={handleAddAccompaniedGroup}
          onUpdateGroup={handleUpdateAccompaniedGroup}
          onDeleteGroup={handleDeleteAccompaniedGroup}
          onAddMembersToGroup={handleAddMembersToGroup}
          onRemoveMemberFromGroup={handleRemoveMemberFromGroup}
          onUpdateMemberRole={handleUpdateMemberRole}
          onNavigateToBeneficiary={() => {
            setCurrentTab('beneficiaries');
          }}
        />
      )}

      {currentTab === 'logframe' && (
        <LogframeManager
          projects={accessibleProjects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          isAdmin={isAdmin}
          onEditProject={handleEditProject}
          onUpdateIndicator={handleUpdateIndicator}
          onAddOutcome={handleAddOutcome}
          onUpdateOutcome={handleUpdateOutcome}
          onDeleteOutcome={handleDeleteOutcome}
          onAddOutput={handleAddOutput}
          onUpdateOutput={handleUpdateOutput}
          onDeleteOutput={handleDeleteOutput}
          onAddActivity={handleAddActivity}
          onAddIndicator={handleAddIndicator}
          onUpdateIndicatorDetails={handleUpdateIndicatorDetails}
          onDeleteIndicator={handleDeleteIndicator}
          onDeleteProject={handlePromptDeleteProject}
          onOpenNewActivityModal={(pId, opId) => handleOpenNewActivity(pId, opId)}
        />
      )}

      {currentTab === 'mov' && (
        <MoVRepository
          projects={accessibleProjects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          isAdmin={canEdit}
          onAddMoVDocument={handleAddMoVDocument}
          onDeleteMoVDocument={handleDeleteMoVDocument}
        />
      )}

      {currentTab === 'team' && (
        <ProjectTeamManager
          projects={accessibleProjects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          isAdmin={isAdmin}
          onOpenNewProjectModal={() => {
            if (!isAdmin) return;
            setEditingProject(null);
            setShowProjectModal(true);
          }}
          onEditProject={handleEditProject}
          onDeleteProject={handleConfirmDeleteProject}
          onAddTeamMember={handleAddTeamMember}
          onUpdateTeamMember={handleUpdateTeamMember}
          onRemoveTeamMember={handleRemoveTeamMember}
        />
      )}

      {currentTab === 'publications' && (
        <PublicationManager
          projects={accessibleProjects}
          selectedProjectId={selectedProjectId}
          knowledgeProducts={userAccessibleKnowledgeProducts}
          storiesOfChange={userAccessibleStories}
          mediaCoverages={userAccessibleMedia}
          isAdmin={canEdit}
          onSaveKnowledgeProduct={handleSaveKnowledgeProduct}
          onDeleteKnowledgeProduct={handleDeleteKnowledgeProduct}
          onSaveStoryOfChange={handleSaveStoryOfChange}
          onDeleteStoryOfChange={handleDeleteStoryOfChange}
          onSaveMediaCoverage={handleSaveMediaCoverage}
          onDeleteMediaCoverage={handleDeleteMediaCoverage}
        />
      )}

      {currentTab === 'learning' && (
        <LearningManager
          projects={accessibleProjects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          learnings={userAccessibleLearnings}
          isAdmin={canEdit}
          onSaveLearning={handleSaveLearning}
          onDeleteLearning={handleDeleteLearning}
        />
      )}

      {(currentTab === 'reports' || (currentTab as string) === 'deliverables') && (
        <ReportManager
          projects={accessibleProjects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          reports={userAccessibleReports}
          isAdmin={canEdit}
          onSaveReport={handleSaveReport}
          onDeleteReport={handleDeleteReport}
          onUpdateStatus={handleUpdateReportStatus}
        />
      )}

      {currentTab === 'users' && (
        <UserManagement
          users={users}
          projects={sortedProjects}
          isAdmin={isAdmin}
          currentUserId={userSession.id}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {currentTab === 'errors' && (
        <ErrorReporting
          errorReports={errorReports}
          isAdmin={isAdmin}
          onAddErrorReport={handleAddErrorReport}
          onUpdateErrorReport={handleUpdateErrorReport}
          onDeleteErrorReport={handleDeleteErrorReport}
        />
      )}

      {/* Global Modals */}
      <ActivityFormModal
        isOpen={showActivityModal}
        onClose={() => {
          setShowActivityModal(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        projects={accessibleProjects}
        defaultProjectId={activityModalProjectId}
        defaultOutputId={activityModalOutputId}
        editingActivity={editingActivity}
      />

      <BeneficiaryFormModal
        isOpen={showBeneficiaryModal}
        onClose={() => {
          setShowBeneficiaryModal(false);
          setEditingBeneficiary(null);
        }}
        onSave={handleSaveBeneficiary}
        editingBeneficiary={editingBeneficiary}
        existingBeneficiaries={userAccessibleBeneficiaries}
        projects={accessibleProjects}
      />

      <ProjectFormModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        editingProject={editingProject}
      />

      <ReportGeneratorModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        projects={accessibleProjects}
        beneficiaries={userAccessibleBeneficiaries}
        attendances={userAccessibleAttendances}
        selectedProjectId={selectedProjectId}
        onRestoreBackup={handleRestoreBackup}
      />

      <DeleteProjectModal
        project={projectToDelete}
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirmDelete={handleConfirmDeleteProject}
      />

      {currentUserAccount && (
        <AccountSettingsModal
          isOpen={showAccountSettingsModal}
          onClose={() => setShowAccountSettingsModal(false)}
          currentUser={currentUserAccount}
          allUsers={users}
          onSaveAccount={handleUpdateUser}
        />
      )}
    </AdminLayout>
  );
}
