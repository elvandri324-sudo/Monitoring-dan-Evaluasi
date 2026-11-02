import React, { useState, useMemo, useRef, DragEvent } from 'react';
import { 
  Plus, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Edit, 
  Trash2, 
  ShieldCheck,
  Award,
  Layers,
  Search,
  CheckCircle2,
  X,
  MessageSquare,
  Building,
  Briefcase,
  UserPlus,
  Filter,
  Check,
  AlertCircle,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { Project, TeamMember } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProjectTeamManagerProps {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  isAdmin: boolean;
  onOpenNewProjectModal: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onAddTeamMember: (projectId: string, member: Omit<TeamMember, 'id'>) => void;
  onUpdateTeamMember?: (projectId: string, memberId: string, member: Partial<TeamMember>) => void;
  onRemoveTeamMember: (projectId: string, memberId: string) => void;
}

const PRESET_AVATARS = [
  { label: 'Pria Profesional 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' },
  { label: 'Pria Profesional 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
  { label: 'Pria Lapangan 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80' },
  { label: 'Wanita Profesional 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80' },
  { label: 'Wanita Profesional 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80' },
  { label: 'Wanita Lapangan 3', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80' },
  { label: 'Spesialis Teknis', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80' },
  { label: 'Fasilitator Komunitas', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=160&auto=format&fit=crop&q=80' }
];

const SUGGESTED_ROLES = [
  'Project Manager / Team Leader',
  'M&E Specialist / Coordinator',
  'Gender & Social Inclusion (GESI) Officer',
  'Field Livelihood Coordinator',
  'GIS & Spatial Mapping Specialist',
  'Agronomist / Agriculture Technical Lead',
  'Community Facilitator / Fasilitator Desa',
  'Finance & Grant Administrator',
  'Communication & Knowledge Management Officer',
  'Safeguards & Environmental Specialist',
  'Tenaga Ahli Konservasi Mangrove',
  'Koordinator Pemberdayaan Perempuan'
];

export default function ProjectTeamManager({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  isAdmin,
  onOpenNewProjectModal,
  onEditProject,
  onDeleteProject,
  onAddTeamMember,
  onUpdateTeamMember,
  onRemoveTeamMember
}: ProjectTeamManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal & Edit states
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Form input states (role is strictly manual text input)
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedOutcomesInput, setSelectedOutcomesInput] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  const activeProject = projects.find(p => p.id === (selectedProjectId === 'all' ? projects[0]?.id : selectedProjectId)) || projects[0];

  // Open modal for adding new member
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setNameInput('');
    setRoleInput('');
    setEmailInput('');
    setPhoneInput('');
    setAvatarUrlInput('');
    setShowUrlInput(false);
    setSelectedOutcomesInput([]);
    setShowMemberModal(true);
  };

  // Open modal for editing existing member
  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setNameInput(member.name);
    setRoleInput(member.role); // prefill existing role for manual editing
    setEmailInput(member.email || '');
    setPhoneInput(member.phone || '');
    setAvatarUrlInput(member.avatarUrl || '');
    setShowUrlInput(false);
    setSelectedOutcomesInput(member.assignedOutcomes || []);
    setShowMemberModal(true);
  };

  // Process File Upload to Data URL (Base64)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(isId ? 'Harap pilih file gambar (JPG, PNG, WebP, dll)' : 'Please select an image file (JPG, PNG, WebP, etc)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(isId ? 'Ukuran file maksimal 5MB' : 'Maximum file size is 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarUrlInput(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Save (Create or Update)
  const handleSaveMember = () => {
    if (!nameInput.trim()) {
      alert(isId ? 'Nama anggota tim wajib diisi!' : 'Team member name is required!');
      return;
    }
    if (!roleInput.trim()) {
      alert(isId ? 'Posisi / Jabatan wajib diisi!' : 'Role / Position is required!');
      return;
    }
    if (!activeProject) return;

    const trimmedName = nameInput.trim();
    const trimmedRole = roleInput.trim();
    const finalEmail = emailInput.trim() || `${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@project-mne.org`;
    const finalPhone = phoneInput.trim() || '+62 812-0000-0000';
    const finalAvatar = avatarUrlInput.trim() || undefined;

    if (editingMember && onUpdateTeamMember) {
      // Update existing team member
      onUpdateTeamMember(activeProject.id, editingMember.id, {
        name: trimmedName,
        role: trimmedRole,
        email: finalEmail,
        phone: finalPhone,
        avatarUrl: finalAvatar,
        assignedOutcomes: selectedOutcomesInput
      });
    } else {
      // Create new team member
      onAddTeamMember(activeProject.id, {
        name: trimmedName,
        role: trimmedRole,
        email: finalEmail,
        phone: finalPhone,
        avatarUrl: finalAvatar,
        assignedOutcomes: selectedOutcomesInput
      });
    }

    setShowMemberModal(false);
    setEditingMember(null);
  };

  // Confirm delete member
  const handleConfirmDeleteMember = () => {
    if (memberToDelete && activeProject) {
      onRemoveTeamMember(activeProject.id, memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  // Confirm delete project
  const handleConfirmDeleteProject = () => {
    if (projectToDelete && onDeleteProject) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!activeProject || !activeProject.teamMembers) return [];
    return activeProject.teamMembers.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.phone && m.phone.includes(searchQuery));

      const matchRole = selectedRoleFilter === 'ALL' || m.role === selectedRoleFilter;
      return matchSearch && matchRole;
    });
  }, [activeProject, searchQuery, selectedRoleFilter]);

  // Unique roles in current active project for filter buttons
  const uniqueRoles = useMemo(() => {
    if (!activeProject || !activeProject.teamMembers) return [];
    const set = new Set<string>();
    activeProject.teamMembers.forEach(m => {
      if (m.role) set.add(m.role);
    });
    return Array.from(set);
  }, [activeProject]);

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <Users className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">{isId ? 'Belum Ada Proyek Terdaftar' : 'No Projects Registered Yet'}</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {isId ? 'Mulai dengan menambahkan proyek baru untuk mengelola struktur tim pelaksana dan kerangka kerja logframe.' : 'Start by creating a new project to manage team personnel and logframe matrices.'}
        </p>
        {isAdmin && (
          <button
            onClick={onOpenNewProjectModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition"
          >
            <Plus className="w-4 h-4" /> {isId ? 'Tambah Proyek Pertama' : 'Add First Project'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
              Project Governance & Personnel
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isId ? 'CRUD Tim Proyek & Pelaksana' : 'Project Teams & Personnel Governance'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isId ? 'Manajemen Proyek & Tim Pelaksana' : 'Project Management & Team Personnel'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {isId 
              ? 'Kelola profil inisiatif proyek, alokasi anggaran, wilayah dampingan desa, serta struktur penanggung jawab dan personil lapangan.'
              : 'Manage project initiatives, budget allocations, assisted target villages, and field execution personnel structure.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={onOpenNewProjectModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>{isId ? 'Tambah Proyek' : 'Add Project'}</span>
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>{isId ? '+ Anggota Tim' : '+ Team Member'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Project Switcher Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {projects.map(p => (
          <div key={p.id} className="flex items-center group shrink-0">
            <button
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                activeProject.id === p.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeProject.id === p.id ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
              <span>{p.code}</span>
              <span className="opacity-70 text-[11px]">({p.teamMembers.length} {isId ? 'Personil' : 'Personnel'})</span>
            </button>
            {isAdmin && projects.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToDelete(p);
                }}
                className="ml-1 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title={isId ? `Hapus proyek ${p.code}` : `Delete project ${p.code}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Active Project Details Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {activeProject.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {isId ? `Status: ${activeProject.status}` : `Status: ${activeProject.status}`}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {isId ? `Provinsi ${activeProject.province}` : `Province of ${activeProject.province}`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">{activeProject.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{activeProject.goalStatement}</p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0 self-start">
              <button
                onClick={() => onEditProject(activeProject)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition"
                title={isId ? 'Edit data profil dan anggaran proyek' : 'Edit project profile and budget'}
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{isId ? 'Edit Info Proyek' : 'Edit Project Info'}</span>
              </button>
              <button
                onClick={() => setProjectToDelete(activeProject)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title={isId ? 'Hapus proyek ini' : 'Delete this project'}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{isId ? 'Hapus Proyek' : 'Delete Project'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Project Metadata Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 bg-slate-50/80 p-4 rounded-xl text-xs border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">{isId ? 'Lembaga Donor:' : 'Donor Agency:'}</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 block">{activeProject.donor}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">{isId ? 'Mitra Pelaksana:' : 'Implementing Partner:'}</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 block">{activeProject.partnerOrg}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">{isId ? 'Total Anggaran:' : 'Total Budget:'}</span>
            <span className="font-bold text-emerald-700 text-xs sm:text-sm mt-0.5 block">
              Rp {activeProject.budgetTotal.toLocaleString('id-ID')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">{isId ? 'Periode Proyek:' : 'Project Period:'}</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 block">
              {activeProject.startDate} - {activeProject.endDate}
            </span>
          </div>
        </div>

        {/* Target Locations & Villages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {isId ? 'Kecamatan & Wilayah Intervensi:' : 'Sub-districts & Intervention Areas:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeProject.targetLocations.map((loc, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 text-[11px] font-medium shadow-2xs">
                  {loc}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/60 space-y-1.5">
            <span className="font-bold text-emerald-900 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-emerald-700" />
              {isId ? 'Desa / Kelurahan Dampingan:' : 'Target Assisted Villages:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(activeProject.targetVillages && activeProject.targetVillages.length > 0 
                ? activeProject.targetVillages 
                : activeProject.targetLocations
              ).map((v, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-900 border border-emerald-300 text-[11px] font-semibold flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TEAM MEMBERS SECTION (FULL CRUD) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-5">
        {/* Team Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                {isId ? `Struktur Tim Proyek & Penanggung Jawab (${activeProject.teamMembers.length} Personil)` : `Project Team & Personnel Structure (${activeProject.teamMembers.length} Personnel)`}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isId ? 'Personil pelaksana lapangan, spesialis teknis, fasilitator masyarakat, dan tim monitoring & evaluasi.' : 'Field execution staff, technical specialists, community facilitators, and M&E personnel.'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isId ? '+ Tambah Anggota Tim' : '+ Add Team Member'}</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isId ? 'Cari nama personil, posisi/jabatan, atau email...' : 'Search personnel name, role, or email...'}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
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

          {/* Quick Role Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedRoleFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedRoleFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isId ? 'Semua' : 'All'} ({activeProject.teamMembers.length})
            </button>
            {uniqueRoles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  selectedRoleFilter === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role.length > 20 ? role.substring(0, 20) + '...' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Team Grid Cards */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => {
              const initials = member.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(n => n[0])
                .join('')
                .toUpperCase() || 'TM';

              return (
                <div 
                  key={member.id}
                  className="bg-slate-50/70 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-300 hover:shadow-2xs transition flex flex-col justify-between space-y-3.5 group"
                >
                  <div className="space-y-2.5">
                    {/* Header: Avatar, Name, Role Badge, Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0 mt-0.5">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                const fallback = (e.target as HTMLElement).parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span 
                            className={`avatar-fallback w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs items-center justify-center shadow-2xs shrink-0 ${member.avatarUrl ? 'hidden' : 'flex'}`}
                          >
                            {initials}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">
                            {member.name}
                          </h4>
                          {/* Manual Inputted Role Display */}
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
                              <Briefcase className="w-3 h-3 text-indigo-600" />
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title={isId ? 'Edit data anggota tim, foto & jabatan' : 'Edit member details, photo & role'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title={isId ? 'Hapus personil dari proyek' : 'Remove member from project'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="text-[10px] text-indigo-600 hover:underline font-semibold shrink-0"
                          >
                            {isId ? 'Kirim Email' : 'Send Email'}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                        {member.phone && (
                          <a
                            href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-600 hover:underline font-semibold shrink-0 flex items-center gap-0.5"
                          >
                            <MessageSquare className="w-3 h-3" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Assigned Outcomes or Responsibilities if any */}
                    {member.assignedOutcomes && member.assignedOutcomes.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase mb-1">
                          {isId ? 'Penugasan Outcome:' : 'Assigned Outcomes:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {member.assignedOutcomes.map((ocId) => {
                            const oc = activeProject.outcomes.find(o => o.id === ocId);
                            return (
                              <span key={ocId} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                                {oc ? `${oc.code}: ${oc.title.substring(0, 20)}...` : ocId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer status */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {isId ? 'Personil Aktif' : 'Active Personnel'}
                    </span>
                    <span>{activeProject.code}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p>{isId ? 'Tidak ada personil yang sesuai dengan pencarian atau filter.' : 'No personnel matched your filter or search query.'}</p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedRoleFilter('ALL'); }}
                className="text-emerald-600 font-semibold hover:underline text-xs"
              >
                {isId ? 'Reset Filter' : 'Reset Filters'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT TEAM MEMBER (WITH PHOTO UPLOAD & MANUAL ROLE INPUT) */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingMember ? (isId ? 'Edit Anggota Tim Proyek' : 'Edit Project Team Member') : (isId ? 'Tambah Anggota Tim Proyek' : 'Add Project Team Member')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isId ? 'Proyek:' : 'Project:'} <strong className="text-slate-700">{activeProject.title} ({activeProject.code})</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* SECTION: FOTO PROFIL (PROFILE PHOTO UPLOAD) */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>{isId ? 'Foto Profil Personil' : 'Personnel Profile Photo'}</span>
                  </label>
                  {avatarUrlInput && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrlInput('')}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      {isId ? 'Hapus Foto' : 'Remove Photo'}
                    </button>
                  )}
                </div>

                {/* Avatar Preview & Drop/Upload Area */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview Frame */}
                  <div className="relative shrink-0 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-emerald-500/40 shadow-xs flex items-center justify-center">
                      {avatarUrlInput ? (
                        <img 
                          src={avatarUrlInput} 
                          alt="Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const fb = (e.target as HTMLElement).parentElement?.querySelector('.avatar-modal-fallback') as HTMLElement;
                            if (fb) fb.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`avatar-modal-fallback w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xl flex items-center justify-center ${avatarUrlInput ? 'hidden' : 'flex'}`}
                      >
                        {nameInput 
                          ? nameInput.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'TM'
                          : 'TM'
                        }
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition"
                      title={isId ? 'Pilih foto dari komputer/HP' : 'Upload photo from device'}
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Drag and drop upload box */}
                  <div className="flex-1 w-full space-y-2">
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                        isDraggingOver 
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800' 
                          : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-slate-50/50 text-slate-600'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-[11px] text-slate-800">
                        {isId ? 'Klik untuk Unggah Foto atau Tarik File Gambar ke Sini' : 'Click to Upload Photo or Drag & Drop Image Here'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PNG, JPG, JPEG, WebP (Maks. 5 MB)
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[10px] text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        {showUrlInput ? (isId ? 'Tutup Input Link URL' : 'Hide URL input') : (isId ? 'Gunakan Link URL Gambar' : 'Use Image URL Link')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct Image URL input field (collapsible) */}
                {showUrlInput && (
                  <div className="pt-2 border-t border-slate-200/70 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      {isId ? 'Tautan / Link URL Foto Langsung:' : 'Direct Image URL Link:'}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        value={avatarUrlInput}
                        onChange={(e) => setAvatarUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-xxx atau link gambar lain"
                        className="w-full p-2 text-[11px] bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Preset Avatar Selection */}
                <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {isId ? 'Pilihan Avatar Cepat (Preset):' : 'Quick Avatar Presets:'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isId ? 'Klik untuk memilih' : 'Click to select'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrlInput(preset.url)}
                        title={preset.label}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition group hover:scale-105 ${
                          avatarUrlInput === preset.url 
                            ? 'border-emerald-600 ring-2 ring-emerald-400' 
                            : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {avatarUrlInput === preset.url && (
                          <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* NAMA LENGKAP INPUT */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isId ? 'Nama Lengkap & Gelar Personil' : 'Full Name & Degree'} <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={isId ? 'Contoh: Rian Pangestu, S.Kom / Dr. Maria Kusuma' : 'e.g. John Doe, M.Sc / Dr. Maria Kusuma'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900"
                  required
                />
              </div>

              {/* POSISI / JABATAN INPUT MANUAL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">
                    {isId ? 'Posisi / Jabatan Proyek (Input Bebas)' : 'Role / Project Position (Custom Input)'} <span className="text-rose-500">*</span>:
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    {isId ? 'Input Bebas / Custom' : 'Custom Input'}
                  </span>
                </div>
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  list="suggested-project-roles"
                  placeholder={isId ? 'Ketik jabatan (misal: Koordinator Lapangan, Agronomis, Fasilitator)' : 'Type role (e.g. Field Coordinator, Agronomist, Facilitator)'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900"
                  required
                />
                <datalist id="suggested-project-roles">
                  {SUGGESTED_ROLES.map((r, idx) => (
                    <option key={idx} value={r} />
                  ))}
                </datalist>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isId ? 'Ketik posisi/jabatan secara bebas atau pilih dari saran cepat di atas.' : 'Type custom position freely or select from suggestions.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isId ? 'Alamat Email:' : 'Email Address:'}
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name.personnel@project.org"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isId ? 'Nomor WhatsApp / HP:' : 'WhatsApp / Phone Number:'}
                  </label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Assigned Outcomes Checkbox selector */}
              {activeProject.outcomes.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    {isId ? 'Penugasan Tanggung Jawab Outcome (Opsional):' : 'Assigned Outcome Responsibilities (Optional):'}
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {activeProject.outcomes.map(oc => {
                      const isChecked = selectedOutcomesInput.includes(oc.id);
                      return (
                        <label key={oc.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer text-xs transition">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOutcomesInput(prev => [...prev, oc.id]);
                              } else {
                                setSelectedOutcomesInput(prev => prev.filter(id => id !== oc.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-bold text-slate-800">{oc.code}:</span>
                          <span className="text-slate-600 truncate">{oc.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveMember}
                className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-2xs transition"
              >
                {editingMember ? (isId ? 'Simpan Perubahan' : 'Save Changes') : (isId ? 'Tambahkan Personil' : 'Add Personnel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE TEAM MEMBER */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{isId ? 'Hapus Personil Tim?' : 'Remove Team Member?'}</h3>
                <p className="text-xs text-slate-500">{isId ? 'Tindakan ini tidak dapat dibatalkan.' : 'This action cannot be undone.'}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-2 text-slate-700">
              <div className="flex items-center gap-3">
                {memberToDelete.avatarUrl ? (
                  <img
                    src={memberToDelete.avatarUrl}
                    alt={memberToDelete.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center">
                    {memberToDelete.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900">{memberToDelete.name}</div>
                  <div className="text-indigo-700 font-semibold">{memberToDelete.role}</div>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-200/60">Email: <span>{memberToDelete.email}</span></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDeleteMember}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-2xs transition"
              >
                {isId ? 'Ya, Hapus Personil' : 'Yes, Remove Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE PROJECT */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{isId ? 'Hapus Seluruh Proyek?' : 'Delete Entire Project?'}</h3>
                <p className="text-xs text-slate-500">{isId ? 'Menghapus inisiatif proyek beserta seluruh logframe & kegiatan.' : 'Deletes project initiative along with all logframe hierarchy and activities.'}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl text-xs space-y-1.5 text-rose-900 border border-rose-200">
              <div>{isId ? 'Kode Proyek:' : 'Project Code:'} <strong>{projectToDelete.code}</strong></div>
              <div>{isId ? 'Judul:' : 'Title:'} <strong>{projectToDelete.title}</strong></div>
              <div>{isId ? 'Total Anggota Tim:' : 'Total Team Members:'} <strong>{projectToDelete.teamMembers.length} {isId ? 'personil' : 'personnel'}</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDeleteProject}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-2xs transition"
              >
                {isId ? 'Hapus Proyek Permanen' : 'Delete Project Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
