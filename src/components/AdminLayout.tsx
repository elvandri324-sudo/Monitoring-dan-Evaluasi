import { useState, ReactNode } from 'react';
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
  Building2
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
  showLoginToast: boolean;
  onDismissToast: () => void;
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
  showLoginToast,
  onDismissToast,
  children
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const isId = language === 'id';

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base leading-tight">Monitoring</h2>
                <p className="text-xs text-slate-400 font-medium leading-tight">Dashboard</p>
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
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all mb-3 shadow-2xs"
              >
                <Globe className="w-5 h-5 text-emerald-600" />
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
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
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
        <div className="pt-4 border-t border-slate-100 space-y-3">
          {/* Language Switcher in Sidebar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              {isId ? 'Bahasa' : 'Language'}:
            </span>
            <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  language === 'id' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇮🇩 ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  language === 'en' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          <button
            onClick={onOpenReportModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>{isId ? 'Generate Laporan M&E' : 'Generate M&E Report'}</span>
          </button>

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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {isId ? 'Sistem Monitoring M&E' : 'M&E Monitoring System'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {isId ? 'Platform Terintegrasi Capaian Proyek & Pembelajaran' : 'Integrated Project Outcomes & Learning Platform'}
              </p>
            </div>
          </div>

          {/* Header Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Top Bar Language Toggle */}
            <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-xl">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  language === 'id'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
                  <FolderKanban className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                    <span className="max-w-[180px] truncate">
                      {selectedProjectId === 'all' 
                        ? (isId ? 'Semua Proyek' : 'All Projects') 
                        : selectedProject?.code || (isId ? 'Pilih Proyek' : 'Select Project')}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {projectDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
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
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                              selectedProjectId === 'all' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <span>{isId ? '🌐 Semua Proyek (Agregat Nasional)' : '🌐 All Projects (National Aggregate)'}</span>
                            {selectedProjectId === 'all' && <span className="text-blue-600">✓</span>}
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                        </>
                      )}

                      {allowedProjects.map(proj => {
                        const startYear = proj.startDate ? new Date(proj.startDate).getFullYear() : '';
                        const isSelected = selectedProjectId === proj.id;
                        return (
                          <div
                            key={proj.id}
                            className={`group w-full px-3 py-2 text-xs flex items-center justify-between gap-2 hover:bg-slate-50 transition ${
                              isSelected ? 'text-blue-600 bg-blue-50/70 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <button
                              onClick={() => {
                                setSelectedProjectId(proj.id);
                                setProjectDropdownOpen(false);
                              }}
                              className="flex-1 text-left truncate min-w-0"
                            >
                              <p className="truncate font-semibold text-slate-800 group-hover:text-blue-600">
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
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100/60 rounded-md transition"
                                  title={isId ? `Edit Nama & Profil Proyek ${proj.code}` : `Edit Project Name & Profile ${proj.code}`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                            </div>
                          </div>
                        );
                      })}

                      {isAdmin && (
                        <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                          <button
                            onClick={() => {
                              setProjectDropdownOpen(false);
                              onOpenNewProjectModal();
                            }}
                            className="w-full text-center py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1 transition"
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
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold shadow-2xs transition"
                title={isId ? 'Lihat halaman statistik publik untuk pengunjung' : 'View public dashboard portal'}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isId ? 'Beranda Pengunjung' : 'Public Portal'}</span>
              </button>
            )}

            {/* User Profile Card */}
            <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/80 py-1.5 px-3 rounded-xl">
              {userSession?.avatarUrl ? (
                <img 
                  src={userSession.avatarUrl} 
                  alt={userSession.name} 
                  className="w-8 h-8 rounded-lg object-cover border border-slate-300 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm font-bold text-xs">
                  {userSession?.name ? userSession.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]" title={userSession?.name || userSession?.email}>
                  {userSession?.name || userSession?.username || userSession?.email || 'Administrator'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium leading-tight">
                  <span className="font-semibold text-blue-700">{userSession?.role || 'Admin'}</span>
                  {!canAccessAllProjects && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                      {allowedProjects.length} Proyek
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition"
              title={isId ? 'Keluar dari sesi' : 'Logout session'}
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{isId ? 'Keluar' : 'Logout'}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Login Success Toast (as in screenshot) */}
      {showLoginToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="bg-white border border-slate-200/90 shadow-2xl rounded-2xl p-4 flex items-center gap-3 max-w-sm">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
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
