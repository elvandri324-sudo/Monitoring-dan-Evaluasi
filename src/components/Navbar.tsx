import { useState } from 'react';
import { 
  BarChart3, 
  Layers, 
  Users, 
  CalendarCheck2, 
  FolderKanban, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Globe, 
  ChevronDown,
  Sparkles,
  Database,
  Info,
  Languages,
  Edit3
} from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentTab: 'home' | 'dashboard' | 'logframe' | 'activities' | 'beneficiaries' | 'team';
  setCurrentTab: (tab: 'home' | 'dashboard' | 'logframe' | 'activities' | 'beneficiaries' | 'team') => void;
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onOpenNewProjectModal: () => void;
  onEditProject?: (project: Project) => void;
  onOpenNewBeneficiaryModal: () => void;
  onOpenReportModal: () => void;
  onResetData: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  isAdmin,
  setIsAdmin,
  onOpenNewProjectModal,
  onEditProject,
  onOpenNewBeneficiaryModal,
  onOpenReportModal,
  onResetData
}: NavbarProps) {
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const isId = language === 'id';

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const navItems = [
    { id: 'home', label: isId ? 'Beranda M&E' : 'M&E Home', icon: Globe },
    { id: 'dashboard', label: isId ? 'Dashboard Analitik' : 'Analytics Dashboard', icon: BarChart3 },
    { id: 'logframe', label: isId ? 'Logframe & Indikator' : 'Logframe & Indicators', icon: Layers },
    { id: 'activities', label: isId ? 'Kegiatan & Partisipasi' : 'Activities & Attendance', icon: CalendarCheck2 },
    { id: 'beneficiaries', label: isId ? 'Penerima Manfaat' : 'Beneficiaries', icon: Users },
    { id: 'team', label: isId ? 'Proyek & Tim' : 'Projects & Team', icon: FolderKanban },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-orange-100 text-slate-900 shadow-xs">
      {/* Top utility bar */}
      <div className="bg-orange-50/80 px-4 sm:px-6 py-1.5 border-b border-orange-100 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-semibold text-orange-700">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            M&E Engine • {isId ? 'Zero Double-Counting Aktif' : 'Zero Double-Counting Active'}
          </span>
          <span className="hidden md:inline text-orange-200">|</span>
          <span className="hidden md:inline text-slate-500">
            {isId 
              ? 'Standar Disagregasi: GESI (Gender, Usia 0-14/15-24/25-64/65+, Ragam Disabilitas) & IPLC'
              : 'Disaggregation Standard: GESI (Gender, Age 0-14/15-24/25-64/65+, Disability Types) & IPLC'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher Button */}
          <div className="inline-flex items-center rounded-lg bg-white p-0.5 border border-orange-200">
            <button
              onClick={() => setLanguage('id')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                isId ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-orange-700'
              }`}
              title="Bahasa Indonesia"
            >
              🇮🇩 ID
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                !isId ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-orange-700'
              }`}
              title="English"
            >
              🇬🇧 EN
            </button>
          </div>

          {/* Admin toggle pill */}
          <div className="inline-flex items-center rounded-full bg-white p-0.5 border border-orange-200">
            <button
              id="role-public-btn"
              onClick={() => setIsAdmin(false)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                !isAdmin ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:text-orange-700'
              }`}
            >
              {isId ? 'Pengunjung Publik' : 'Public Viewer'}
            </button>
            <button
              id="role-admin-btn"
              onClick={() => setIsAdmin(true)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                isAdmin ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:text-orange-700'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {isId ? 'Administrator M&E' : 'M&E Administrator'}
            </button>
          </div>

          <button
            id="report-gen-btn"
            onClick={onOpenReportModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-orange-100/70 text-orange-800 border border-orange-200 transition"
            title={isId ? 'Generate Laporan M&E Otomatis' : 'Generate Automated M&E Report'}
          >
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">{isId ? 'Laporan M&E' : 'M&E Report'}</span>
          </button>

          <button
            id="reset-demo-btn"
            onClick={onResetData}
            className="text-slate-500 hover:text-orange-700 px-2 py-1 text-xs"
            title={isId ? 'Reset ke Data Standar Demo' : 'Reset to Standard Demo Data'}
          >
            {isId ? 'Reset Demo' : 'Reset Demo'}
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* App Brand & Project selector */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                  SIMEV PROYEK
                </span>
                <span className="block text-[10px] text-orange-600 font-semibold leading-none tracking-wider uppercase">
                  {isId ? 'Monitoring & Evaluasi' : 'Monitoring & Evaluation'}
                </span>
              </div>
            </div>

            {/* Project Filter Switcher */}
            <div className="relative hidden md:block">
              <button
                id="project-selector-dropdown-btn"
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50/70 hover:bg-orange-50 border border-orange-200 text-xs font-medium text-slate-700 transition"
              >
                <FolderKanban className="w-3.5 h-3.5 text-orange-600" />
                <span className="max-w-[200px] truncate">
                  {selectedProjectId === 'all' ? (isId ? '🌐 Semua Portofolio Proyek' : '🌐 All Project Portfolios') : selectedProject?.title || (isId ? 'Pilih Proyek' : 'Select Project')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-orange-400" />
              </button>

              {projectDropdownOpen && (
                <div 
                  className="absolute left-0 mt-1 w-80 bg-white border border-orange-100 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setProjectDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {isId ? 'Pilih Lingkup Proyek' : 'Select Project Scope'}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProjectId('all');
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${
                      selectedProjectId === 'all' ? 'text-orange-700 bg-orange-50 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>🌐 {isId ? 'Seluruh Portofolio (Agregat Nasional)' : 'Entire Portfolio (National Aggregate)'}</span>
                    {selectedProjectId === 'all' && <span className="text-orange-600 text-xs">✓</span>}
                  </button>
                  <div className="border-t border-orange-100 my-1"></div>
                  {projects.map(proj => (
                    <div
                      key={proj.id}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between gap-2 hover:bg-orange-50 transition ${
                        selectedProjectId === proj.id ? 'text-orange-700 bg-orange-50 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedProjectId(proj.id);
                          setProjectDropdownOpen(false);
                        }}
                        className="flex-1 text-left flex items-start gap-2 truncate min-w-0"
                      >
                        <span className="w-2 h-2 rounded-full bg-orange-500 mt-1 flex-shrink-0"></span>
                        <div className="flex-1 truncate">
                          <p className="truncate font-medium">{proj.title}</p>
                          <p className="text-[10px] text-slate-400">{proj.code} • {proj.province}</p>
                        </div>
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
                            className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-100 rounded transition"
                            title={isId ? `Edit Nama Proyek ${proj.code}` : `Edit Project Name ${proj.code}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {selectedProjectId === proj.id && <span className="text-orange-600 text-xs">✓</span>}
                      </div>
                    </div>
                  ))}

                  {isAdmin && (
                    <div className="border-t border-orange-100 pt-1 mt-1 px-2">
                      <button
                        onClick={() => {
                          setProjectDropdownOpen(false);
                          onOpenNewProjectModal();
                        }}
                        className="w-full text-center py-1.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> {isId ? 'Tambah Proyek Baru' : 'Add New Project'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                      : 'text-slate-600 hover:text-orange-700 hover:bg-orange-50/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  id="quick-add-beneficiary-btn"
                  onClick={onOpenNewBeneficiaryModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-xs font-medium shadow-md shadow-orange-500/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isId ? 'Input Penerima Manfaat' : 'Add Beneficiary'}</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation collapse */}
      {menuOpen && (
        <div className="lg:hidden border-t border-orange-100 bg-white px-4 py-3 space-y-1">
          <div className="mb-2 pb-2 border-b border-orange-100">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1">
              {isId ? 'PROYEK TERPILIH:' : 'SELECTED PROJECT:'}
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-orange-50/40 text-slate-800 text-xs rounded-lg p-2 border border-orange-200"
            >
              <option value="all">🌐 {isId ? 'Seluruh Portofolio Proyek' : 'All Project Portfolio'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-left ${
                    isActive ? 'bg-orange-50 text-orange-700 font-semibold border border-orange-200' : 'text-slate-600 hover:bg-orange-50/50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-orange-600" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {isAdmin && (
            <div className="pt-2 mt-2 border-t border-orange-100 flex gap-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenNewBeneficiaryModal();
                }}
                className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg text-xs font-medium text-center"
              >
                + {isId ? 'Penerima Manfaat' : 'Beneficiary'}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenNewProjectModal();
                }}
                className="flex-1 py-2 bg-orange-50 text-orange-800 rounded-lg text-xs font-medium text-center border border-orange-200"
              >
                + {isId ? 'Proyek Baru' : 'New Project'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

