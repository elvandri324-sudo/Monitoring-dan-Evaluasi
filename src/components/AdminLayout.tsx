import { useState, useEffect, ReactNode } from 'react';
import { 
  BarChart3, 
  LayoutGrid, 
  Calendar, 
  Users, 
  BarChart2, 
  Layers, 
  LogOut, 
  User, 
  ChevronDown, 
  Plus, 
  ShieldCheck, 
  FileText, 
  Globe,
  FolderKanban,
  CheckCircle2,
  X,
  Menu,
  BookOpen,
  Lightbulb,
  FolderCheck,
  FileCheck,
  Languages,
  UserPlus,
  Bug,
  Edit3,
  Building2,
  KeyRound,
  Cloud,
  CloudOff
} from 'lucide-react';
import { Project, UserSession } from '../types';
import { useLanguage } from '../context/LanguageContext';

export type AdminTabType = 
  | 'dashboard' 
  | 'activities' 
  | 'beneficiaries' 
  | 'groups'
  | 'indicators' 
  | 'logframe' 
  | 'reports' 
  | 'mov' 
  | 'team' 
  | 'publications' 
  | 'learning'
  | 'users'
  | 'errors';

interface AdminLayoutProps {
  currentTab: AdminTabType;
  setCurrentTab: (tab: AdminTabType) => void;
  userSession: UserSession | null;
  onLogout: () => void;
  onGoToPublic?: () => void;
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  onOpenNewProjectModal: () => void;
  onEditProject?: (project: Project) => void;
  onOpenNewActivityModal?: () => void;
  onOpenNewBeneficiaryModal: () => void;
  onOpenReportModal: () => void;
  onOpenAccountSettings?: () => void;
  showLoginToast: boolean;
  onDismissToast: () => void;
  firebaseUser?: { email: string | null; uid: string } | null;
  firebaseSyncing?: boolean;
  onConnectFirebase?: () => void;
  onDisconnectFirebase?: () => void;
  children: ReactNode;
}

export default function AdminLayout({
  currentTab,
  setCurrentTab,
  userSession,
  onLogout,
  onGoToPublic,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  onOpenNewProjectModal,
  onEditProject,
  onOpenNewActivityModal,
  onOpenNewBeneficiaryModal,
  onOpenReportModal,
  onOpenAccountSettings,
  showLoginToast,
  onDismissToast,
  firebaseUser,
  firebaseSyncing = false,
  onConnectFirebase,
  onDisconnectFirebase,
  children
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [headerAvatarError, setHeaderAvatarError] = useState(false);
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const isId = language === 'id';

  useEffect(() => {
    setHeaderAvatarError(false);
  }, [userSession?.avatarUrl]);

  const canAccessAllProjects = userSession?.role === 'Super Admin' || (userSession?.assignedProjectIds && userSession.assignedProjectIds.includes('all'));
  const isAdmin = userSession?.role === 'Super Admin' || userSession?.role === 'Admin';

  const sortedProjects = [...projects].sort((a, b) => {
    const timeA = new Date(a.startDate || '').getTime() || 0;
    const timeB = new Date(b.startDate || '').getTime() || 0;
    return timeA - timeB;
  });

  // Filter projects available to the user
  const allowedProjects = canAccessAllProjects 
    ? sortedProjects 
    : sortedProjects.filter(p => userSession?.assignedProjectIds?.includes(p.id));

  const selectedProject = sortedProjects.find(p => p.id === selectedProjectId);

  const navMenuItems = [
    { id: 'dashboard', label: isId ? 'Dashboard' : 'Dashboard', icon: LayoutGrid },
    { id: 'activities', label: isId ? 'Kegiatan' : 'Activities', icon: Calendar },
    { id: 'beneficiaries', label: isId ? 'Penerima Manfaat' : 'Beneficiaries', icon: Users },
    { id: 'groups', label: isId ? 'Kelompok Dampingan' : 'Accompanied Groups', icon: Building2 },
    { id: 'indicators', label: isId ? 'Indikator' : 'Indicators', icon: BarChart2 },
    { id: 'logframe', label: isId ? 'Proyek & Logframe' : 'Projects & Logframe', icon: Layers },
    { id: 'reports', label: isId ? 'Laporan Proyek' : 'Project Reports', icon: FileText, badge: isId ? 'Arsip Berkas' : 'Archive' },
    { id: 'mov', label: isId ? 'Repositori MoV' : 'MoV Repository', icon: FolderCheck },
    { id: 'team', label: isId ? 'Tim Proyek' : 'Project Team', icon: FolderKanban },
    { id: 'publications', label: isId ? 'Publikasi & Cerita' : 'Publications & Stories', icon: BookOpen },
    { id: 'learning', label: isId ? 'Matriks Pembelajaran' : 'Learning Matrix', icon: Lightbulb },
    { id: 'users', label: isId ? 'Manajemen Akun' : 'User Accounts', icon: UserPlus, badge: isId ? 'Admin' : 'Admin', adminOnly: true },
    { id: 'errors', label: isId ? 'Laporan Error' : 'Error Reports', icon: Bug, badge: isId ? 'Bantuan' : 'Help' },
  ] as const;

  // Filter out admin-only menu items for non-admin users
  const visibleNavMenuItems = navMenuItems.filter(item => {
    if ((item as any).adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-orange-100 p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out overflow-y-auto shrink-0 md:sticky md:top-0 md:h-screen md:translate-x-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base leading-tight">Monitoring</h2>
                <p className="text-xs text-orange-600 font-semibold leading-tight">Dashboard</p>
              </div>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)} 
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {onGoToPublic && (
              <button
                id="sidebar-nav-public-home"
                onClick={onGoToPublic}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all mb-3 shadow-2xs"
              >
                <Globe className="w-5 h-5 text-orange-600" />
                <span>{isId ? '🌐 Beranda Pengunjung' : '🌐 Public Portal'}</span>
              </button>
            )}

            {visibleNavMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const badge = (item as any).badge;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-slate-600 hover:text-orange-800 hover:bg-orange-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                      isActive ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="pt-4 border-t border-orange-100 space-y-3">
          {/* Firebase Cloud Sync Control */}
          <div className={`px-3 py-2 rounded-xl border text-xs space-y-1.5 ${
            firebaseUser
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-orange-50/70 border-orange-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {firebaseUser ? (
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <CloudOff className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                )}
                <span className="font-bold truncate">
                  {firebaseUser
                    ? (firebaseSyncing ? (isId ? 'Menyinkronkan...' : 'Syncing...') : (isId ? 'Firebase Tersinkron' : 'Firebase Synced'))
                    : (isId ? 'Cloud Belum Aktif' : 'Cloud Not Linked')}
                </span>
              </div>
              {firebaseUser ? (
                onDisconnectFirebase && (
                  <button
                    type="button"
                    onClick={onDisconnectFirebase}
                    className="text-[10px] font-semibold text-emerald-700 hover:underline shrink-0"
                  >
                    {isId ? 'Putuskan' : 'Unlink'}
                  </button>
                )
              ) : (
                onConnectFirebase && (
                  <button
                    type="button"
                    onClick={onConnectFirebase}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-600 text-white hover:bg-orange-700 shrink-0 transition"
                  >
                    {isId ? 'Hubungkan' : 'Connect'}
                  </button>
                )
              )}
            </div>
            {firebaseUser?.email && (
              <p className="text-[10px] text-emerald-700 truncate">{firebaseUser.email}</p>
            )}
          </div>

          {/* Language Switcher in Sidebar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-orange-50/50 border border-orange-100 rounded-xl text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-orange-600" />
              {isId ? 'Bahasa' : 'Language'}:
            </span>
            <div className="flex items-center gap-1 bg-orange-100/80 p-0.5 rounded-lg">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  language === 'id' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇮🇩 ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  language === 'en' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          <button
            onClick={onOpenReportModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200/80 text-orange-900 rounded-xl text-xs font-semibold transition"
          >
            <FileText className="w-4 h-4 text-orange-600" />
            <span>{isId ? 'Generate Laporan M&E' : 'Generate M&E Report'}</span>
          </button>

          {onOpenAccountSettings && (
            <button
              id="sidebar-account-settings-btn"
              onClick={onOpenAccountSettings}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-orange-700 hover:bg-orange-50 border border-orange-100 transition"
            >
              <KeyRound className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="truncate">{isId ? 'Profil, Foto & Password' : 'Profile, Photo & Password'}</span>
            </button>
          )}

          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-600" />
            <span>{isId ? 'Keluar (Logout)' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-clip">
        {/* Top Header */}
        <header className="bg-white border-b border-orange-100 px-3.5 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-2.5 sm:gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl shrink-0"
              aria-label={isId ? 'Buka menu navigasi' : 'Open navigation menu'}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {isId ? 'Sistem Monitoring M&E' : 'M&E Monitoring System'}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {isId ? 'Platform Terintegrasi Capaian Proyek & Pembelajaran' : 'Integrated Project Outcomes & Learning Platform'}
              </p>
            </div>
          </div>

          {/* Header Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Top Bar Language Toggle */}
            <div className="flex items-center bg-orange-50/80 border border-orange-200/70 p-0.5 rounded-xl">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  language === 'id'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-orange-800'
                }`}
                title="Beralih ke Bahasa Indonesia"
              >
                <span>🇮🇩</span>
                <span className="hidden sm:inline">ID</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-orange-800'
                }`}
                title="Switch to English"
              >
                <span>🇬🇧</span>
                <span className="hidden sm:inline">EN</span>
              </button>
            </div>

            {/* Project Filter Selector */}
            <div className="relative hidden sm:block">
              {/* If user is strictly assigned to only 1 project, show locked indicator */}
              {!canAccessAllProjects && allowedProjects.length === 1 ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/90 text-xs font-semibold text-amber-900 shadow-2xs">
                  <FolderKanban className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="max-w-[170px] truncate" title={allowedProjects[0]?.title}>
                    {allowedProjects[0]?.code}
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold shrink-0">
                    {isId ? '🔒 Ditugaskan' : '🔒 Assigned'}
                  </span>
                </div>
              ) : (
                <>
                  <button
                    id="header-project-selector-btn"
                    onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 lg:px-3 py-2 rounded-xl bg-orange-50/50 hover:bg-orange-50 border border-orange-200/70 text-xs font-semibold text-slate-700 transition"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="max-w-[115px] lg:max-w-[180px] truncate">
                      {selectedProjectId === 'all' 
                        ? (isId ? 'Semua Proyek' : 'All Projects') 
                        : selectedProject?.code || (isId ? 'Pilih Proyek' : 'Select Project')}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  </button>

                  {projectDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-1 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white border border-orange-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setProjectDropdownOpen(false)}
                    >
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{isId ? 'Lingkup Monitoring Proyek' : 'Project Scope'}</span>
                        {!canAccessAllProjects && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {isId ? 'Akses Terbatas' : 'Restricted'}
                          </span>
                        )}
                      </div>

                      {/* Only Super Admin & Admin or all-assigned can choose Aggregate All Projects */}
                      {canAccessAllProjects && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedProjectId('all');
                              setProjectDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50/70 ${
                              selectedProjectId === 'all' ? 'text-orange-700 bg-orange-50 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <span>{isId ? '🌐 Semua Proyek (Agregat Nasional)' : '🌐 All Projects (National Aggregate)'}</span>
                            {selectedProjectId === 'all' && <span className="text-orange-600">✓</span>}
                          </button>
                          <div className="border-t border-orange-100 my-1"></div>
                        </>
                      )}

                      {allowedProjects.map(proj => {
                        const startYear = proj.startDate ? new Date(proj.startDate).getFullYear() : '';
                        const isSelected = selectedProjectId === proj.id;
                        return (
                          <div
                            key={proj.id}
                            className={`group w-full px-3 py-2 text-xs flex items-center justify-between gap-2 hover:bg-orange-50/60 transition ${
                              isSelected ? 'text-orange-700 bg-orange-50/80 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <button
                              onClick={() => {
                                setSelectedProjectId(proj.id);
                                setProjectDropdownOpen(false);
                              }}
                              className="flex-1 text-left truncate min-w-0"
                            >
                              <p className="truncate font-semibold text-slate-800 group-hover:text-orange-700">
                                {startYear ? `[${startYear}] ` : ''}{proj.title}
                              </p>
                              <p className="text-[10px] text-slate-400 font-normal">
                                {proj.code} • {isId ? 'Mulai' : 'Start'}: {proj.startDate || '-'} • {proj.province}
                              </p>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              {isAdmin && onEditProject && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectDropdownOpen(false);
                                    onEditProject(proj);
                                  }}
                                  className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-100/70 rounded-md transition"
                                  title={isId ? `Edit Nama & Profil Proyek ${proj.code}` : `Edit Project Name & Profile ${proj.code}`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isSelected && <span className="text-orange-600 font-bold">✓</span>}
                            </div>
                          </div>
                        );
                      })}

                      {isAdmin && (
                        <div className="border-t border-orange-100 pt-1 mt-1 px-2">
                          <button
                            onClick={() => {
                              setProjectDropdownOpen(false);
                              onOpenNewProjectModal();
                            }}
                            className="w-full text-center py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold flex items-center justify-center gap-1 transition"
                          >
                            <Plus className="w-3.5 h-3.5" /> + {isId ? 'Tambah Proyek Baru' : 'Add New Project'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Switch to Public Home Button */}
            {onGoToPublic && (
              <button
                id="header-goto-public-btn"
                onClick={onGoToPublic}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-xl text-xs font-semibold shadow-2xs transition"
                title={isId ? 'Lihat halaman statistik publik untuk pengunjung' : 'View public dashboard portal'}
              >
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>{isId ? 'Beranda Pengunjung' : 'Public Portal'}</span>
              </button>
            )}

            {/* User Profile Card (Clickable to Edit Account, Photo, Username & Password) */}
            <button
              type="button"
              id="header-account-settings-btn"
              onClick={onOpenAccountSettings}
              className="flex items-center gap-2.5 bg-orange-50/50 hover:bg-orange-50 border border-orange-200/70 hover:border-orange-300 py-1.5 px-3 rounded-xl transition text-left cursor-pointer group"
              title={isId ? 'Edit Profil, Ganti Foto, Username & Password' : 'Edit Profile, Photo, Username & Password'}
            >
              {userSession?.avatarUrl && !headerAvatarError ? (
                <img 
                  src={userSession.avatarUrl} 
                  alt={userSession.name} 
                  onError={() => setHeaderAvatarError(true)}
                  className="w-8 h-8 rounded-lg object-cover border border-orange-200 shadow-2xs shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-sm font-bold text-xs shrink-0">
                  {userSession?.name ? userSession.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 group-hover:text-orange-700 leading-tight truncate max-w-[115px] lg:max-w-[155px]" title={userSession?.name || userSession?.email}>
                  {userSession?.name || userSession?.username || userSession?.email || 'Administrator'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium leading-tight">
                  <span className="font-mono text-slate-500 truncate max-w-[85px]">@{userSession?.username}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-orange-700 whitespace-nowrap">{userSession?.role || 'Admin'}</span>
                  {!canAccessAllProjects && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold whitespace-nowrap">
                      {allowedProjects.length} Proyek
                    </span>
                  )}
                </div>
              </div>
              <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 shrink-0 hidden md:block" />
            </button>

            {/* Logout Button */}
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 border border-orange-200 hover:border-orange-300 bg-white hover:bg-orange-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition shrink-0"
              title={isId ? 'Keluar dari sesi' : 'Logout session'}
            >
              <LogOut className="w-4 h-4 text-orange-600" />
              <span className="hidden lg:inline">{isId ? 'Keluar' : 'Logout'}</span>
            </button>
          </div>
        </header>

        {/* Mobile Project Filter Strip (< 640px) */}
        <div className="sm:hidden bg-white border-b border-orange-100 px-3.5 py-2 flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-orange-600 shrink-0" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={!canAccessAllProjects && allowedProjects.length === 1}
            className="flex-1 min-w-0 text-xs font-semibold bg-orange-50/40 border border-orange-200/80 rounded-lg px-2.5 py-1.5 text-slate-800 truncate focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            aria-label={isId ? 'Pilih lingkup proyek' : 'Select project scope'}
          >
            {canAccessAllProjects && (
              <option value="all">{isId ? 'Semua Proyek (Agregat)' : 'All Projects (Aggregate)'}</option>
            )}
            {allowedProjects.map(proj => (
              <option key={proj.id} value={proj.id}>
                [{proj.code}] {proj.title}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>

      {/* Floating Login Success Toast */}
      {showLoginToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="bg-white border border-orange-200 shadow-2xl rounded-2xl p-4 flex items-center gap-3 max-w-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 pr-2">
              <p className="text-xs font-bold text-slate-900">{isId ? 'Login berhasil' : 'Login successful'}</p>
              <p className="text-[11px] text-slate-500">{isId ? 'Selamat datang di sistem monitoring M&E' : 'Welcome to the M&E monitoring system'}</p>
            </div>
            <button
              onClick={onDismissToast}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
