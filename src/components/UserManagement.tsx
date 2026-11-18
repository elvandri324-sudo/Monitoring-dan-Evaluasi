import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Mail, 
  Phone, 
  CheckCircle2, 
  X, 
  FileSpreadsheet, 
  Download, 
  KeyRound, 
  AlertTriangle,
  AlertCircle,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Save,
  Camera,
  Upload,
  Link2,
  Loader2
} from 'lucide-react';
import { UserAccount, UserRole, UserStatus, Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { exportUsersToXLSX } from '../utils/exportXlsx';
import { compressProfileImage } from '../utils/imageResize';

const UserAvatar: React.FC<{ user: Pick<UserAccount, 'avatarUrl' | 'fullName' | 'username'> }> = ({ user }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user.avatarUrl]);

  if (user.avatarUrl && !imgError) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        onError={() => setImgError(true)}
        className="w-10 h-10 rounded-full bg-orange-50 object-cover border border-orange-200 shadow-2xs shrink-0"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 border border-orange-400">
      {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
    </div>
  );
};

interface UserManagementProps {
  users: UserAccount[];
  projects: Project[];
  isAdmin: boolean;
  currentUserId?: string;
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (user: UserAccount) => void;
}

const ROLE_BADGES: Record<UserRole, { bg: string; text: string; border: string; desc: string }> = {
  'Super Admin': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', desc: 'Akses penuh ke semua fitur, proyek, dan administrasi akun.' },
  'Admin': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', desc: 'Dapat mengelola data proyek, logframe, dan penerima manfaat.' },
  'Staff M&E': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', desc: 'Input kegiatan, verifikasi presensi, dan input capaian indikator.' },
  'Field Coordinator': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', desc: 'Entri presensi lapangan & data penerima manfaat per desa.' },
  'Donor / Partner': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', desc: 'Akses melihat kemajuan proyek, laporan ringkas, dan unduh dokumen.' },
  'Viewer / Guest': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', desc: 'Hanya dapat melihat dashboard publik tanpa izin edit.' }
};

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  projects,
  isAdmin,
  currentUserId,
  onAddUser,
  onDeleteUser,
  onUpdateUser
}) => {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add / Edit Account Modal states
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [accountFormError, setAccountFormError] = useState('');
  const [showAccountPassword, setShowAccountPassword] = useState(false);

  // Quick Change Credentials (Username & Password) Modal states
  const [credentialsTarget, setCredentialsTarget] = useState<UserAccount | null>(null);
  const [credUsername, setCredUsername] = useState('');
  const [credNewPassword, setCredNewPassword] = useState('');
  const [credConfirmPassword, setCredConfirmPassword] = useState('');
  const [showCredNewPw, setShowCredNewPw] = useState(false);
  const [showCredConfirmPw, setShowCredConfirmPw] = useState(false);
  const [credError, setCredError] = useState('');

  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'Staff M&E' as UserRole,
    assignedProjectIds: ['all'] as string[],
    status: 'Aktif' as UserStatus,
    phone: '',
    avatarUrl: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setAccountFormError('');
    setShowAccountPassword(false);
    setAvatarLoadError(false);
    setShowAvatarUrlInput(false);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      role: 'Staff M&E',
      assignedProjectIds: ['all'],
      status: 'Aktif',
      phone: '',
      avatarUrl: ''
    });
    setIsAccountModalOpen(true);
  };

  const openEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setAccountFormError('');
    setShowAccountPassword(false);
    setAvatarLoadError(false);
    setShowAvatarUrlInput(false);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      assignedProjectIds: user.assignedProjectIds && user.assignedProjectIds.length > 0 ? user.assignedProjectIds : ['all'],
      status: user.status,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || ''
    });
    setIsAccountModalOpen(true);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAccountFormError('');
    setIsUploadingAvatar(true);

    try {
      const compressedDataUrl = await compressProfileImage(file, 256, 0.85);
      setFormData(prev => ({ ...prev, avatarUrl: compressedDataUrl }));
      setAvatarLoadError(false);
    } catch (err) {
      setAccountFormError(
        err instanceof Error
          ? err.message
          : (isId ? 'Gagal memproses foto profil.' : 'Failed to process profile photo.')
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const openCredentialsModal = (user: UserAccount) => {
    setCredentialsTarget(user);
    setCredUsername(user.username);
    setCredNewPassword('');
    setCredConfirmPassword('');
    setShowCredNewPw(false);
    setShowCredConfirmPw(false);
    setCredError('');
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery));
      
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const toggleProjectScope = (projectId: string) => {
    if (projectId === 'all') {
      setFormData(prev => ({ ...prev, assignedProjectIds: ['all'] }));
      return;
    }

    setFormData(prev => {
      const withoutAll = prev.assignedProjectIds.filter(id => id !== 'all');
      const exists = withoutAll.includes(projectId);
      const next = exists
        ? withoutAll.filter(id => id !== projectId)
        : [...withoutAll, projectId];

      return {
        ...prev,
        assignedProjectIds: next.length > 0 ? next : ['all']
      };
    });
  };

  // Handle Add / Edit User Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFormError('');

    const cleanFullName = formData.fullName.trim();
    const cleanUsername = formData.username.trim().toLowerCase().replace(/\s+/g, '');
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();

    if (!cleanUsername || !cleanFullName || !cleanEmail) {
      setAccountFormError(
        isId ? 'Nama Lengkap, Username, dan Email wajib diisi.' : 'Full Name, Username, and Email are required.'
      );
      return;
    }

    if (cleanUsername.length < 3) {
      setAccountFormError(
        isId ? 'Username minimal 3 karakter.' : 'Username must be at least 3 characters.'
      );
      return;
    }

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setAccountFormError(
        isId
          ? 'Username hanya boleh berisi huruf kecil, angka, titik (.), garis bawah (_), atau tanda hubung (-).'
          : 'Username can only contain lowercase letters, numbers, dots (.), underscores (_), or hyphens (-).'
      );
      return;
    }

    // Check duplicate username or email (excluding currently edited user)
    const duplicateUsername = users.find(
      u => u.id !== editingUser?.id && u.username.toLowerCase() === cleanUsername
    );
    if (duplicateUsername) {
      setAccountFormError(
        isId ? `Username "@${cleanUsername}" sudah terdaftar pada akun lain.` : `Username "@${cleanUsername}" is already registered.`
      );
      return;
    }

    const duplicateEmail = users.find(
      u => u.id !== editingUser?.id && u.email.toLowerCase() === cleanEmail.toLowerCase()
    );
    if (duplicateEmail) {
      setAccountFormError(
        isId ? `Email "${cleanEmail}" sudah terdaftar pada akun lain.` : `Email "${cleanEmail}" is already registered.`
      );
      return;
    }

    if (!editingUser) {
      // Creating a new user requires a password (min 6 chars)
      if (!cleanPassword || cleanPassword.length < 6) {
        setAccountFormError(
          isId
            ? 'Password wajib diisi (minimal 6 karakter) agar pengguna dapat masuk ke sistem.'
            : 'Password is required (minimum 6 characters) for system login.'
        );
        return;
      }

      const newUser: UserAccount = {
        id: `user-${Date.now().toString().slice(-6)}`,
        username: cleanUsername,
        fullName: cleanFullName,
        email: cleanEmail,
        password: cleanPassword,
        role: formData.role,
        assignedProjectIds: formData.assignedProjectIds.length > 0 ? formData.assignedProjectIds : ['all'],
        status: formData.status,
        phone: formData.phone.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '-'
      };

      onAddUser(newUser);
      setIsAccountModalOpen(false);
      showToast(isId ? `Akun "${newUser.fullName}" berhasil ditambahkan.` : `User account "${newUser.fullName}" added successfully.`);
    } else {
      // Editing existing user: password is optional (only updated if filled)
      if (cleanPassword && cleanPassword.length < 6) {
        setAccountFormError(
          isId
            ? 'Password baru minimal 6 karakter (atau kosongkan jika tidak ingin mengubah password).'
            : 'New password must be at least 6 characters (or leave blank to keep current password).'
        );
        return;
      }

      const updatedUser: UserAccount = {
        ...editingUser,
        username: cleanUsername,
        fullName: cleanFullName,
        email: cleanEmail,
        password: cleanPassword ? cleanPassword : (editingUser.password || 'password123'),
        role: formData.role,
        assignedProjectIds: formData.assignedProjectIds.length > 0 ? formData.assignedProjectIds : ['all'],
        status: formData.status,
        phone: formData.phone.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined
      };

      onUpdateUser(updatedUser);
      setIsAccountModalOpen(false);
      setEditingUser(null);
      showToast(isId ? `Akun "${updatedUser.fullName}" berhasil diperbarui.` : `User account "${updatedUser.fullName}" updated successfully.`);
    }
  };

  // Handle Quick Change Username & Password
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialsTarget) return;
    setCredError('');

    const cleanUsername = credUsername.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setCredError(
        isId ? 'Username minimal 3 karakter.' : 'Username must be at least 3 characters.'
      );
      return;
    }

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setCredError(
        isId
          ? 'Username hanya boleh berisi huruf kecil, angka, titik (.), garis bawah (_), atau tanda hubung (-).'
          : 'Username can only contain lowercase letters, numbers, dots (.), underscores (_), or hyphens (-).'
      );
      return;
    }

    const duplicateUsername = users.find(
      u => u.id !== credentialsTarget.id && u.username.toLowerCase() === cleanUsername
    );
    if (duplicateUsername) {
      setCredError(
        isId ? `Username "@${cleanUsername}" sudah digunakan oleh akun lain.` : `Username "@${cleanUsername}" is already taken.`
      );
      return;
    }

    const isChangingPassword = credNewPassword.length > 0 || credConfirmPassword.length > 0;
    const isChangingUsername = cleanUsername !== credentialsTarget.username.toLowerCase();

    if (!isChangingPassword && !isChangingUsername) {
      setCredError(
        isId ? 'Masukkan username baru atau password baru untuk menyimpan perubahan.' : 'Enter a new username or new password to save changes.'
      );
      return;
    }

    if (isChangingPassword) {
      if (credNewPassword.length < 6) {
        setCredError(
          isId ? 'Password baru minimal 6 karakter.' : 'New password must be at least 6 characters.'
        );
        return;
      }

      if (credNewPassword !== credConfirmPassword) {
        setCredError(
          isId ? 'Konfirmasi password baru tidak cocok.' : 'Password confirmation does not match.'
        );
        return;
      }
    }

    const updatedUser: UserAccount = {
      ...credentialsTarget,
      username: cleanUsername,
      password: isChangingPassword ? credNewPassword : (credentialsTarget.password || 'password123')
    };

    onUpdateUser(updatedUser);
    setCredentialsTarget(null);
    showToast(
      isId
        ? `Kredensial login untuk "${updatedUser.fullName}" (@${updatedUser.username}) berhasil diperbarui.`
        : `Login credentials for "${updatedUser.fullName}" (@${updatedUser.username}) updated.`
    );
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUserId) {
      setUserToDelete(null);
      showToast(isId ? 'Akun yang sedang aktif digunakan tidak dapat dihapus.' : 'Currently active account cannot be deleted.');
      return;
    }
    onDeleteUser(userToDelete.id);
    showToast(isId ? `Akun "${userToDelete.fullName}" berhasil dihapus.` : `User account "${userToDelete.fullName}" deleted.`);
    setUserToDelete(null);
  };

  // Handle Toggle Status
  const handleToggleStatus = (user: UserAccount) => {
    if (!isAdmin) return;
    if (user.id === currentUserId) {
      showToast(isId ? 'Tidak dapat menonaktifkan akun Anda sendiri yang sedang login.' : 'Cannot deactivate your own active session.');
      return;
    }
    const newStatus: UserStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    onUpdateUser({
      ...user,
      status: newStatus
    });
    showToast(isId ? `Status akun ${user.username} diubah menjadi ${newStatus}.` : `User ${user.username} status updated to ${newStatus}.`);
  };

  // Export XLSX
  const handleExportXLSX = () => {
    exportUsersToXLSX(filteredUsers, `Daftar_Pengguna_M&E_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(isId ? 'Daftar akun berhasil diekspor ke Excel (.xlsx)' : 'User list exported to Excel (.xlsx)');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Username', 'Nama Lengkap', 'Email', 'Role / Peran', 'Status', 'Nomor Telepon', 'Akses Proyek', 'Tanggal Dibuat', 'Login Terakhir'];
    const rows = filteredUsers.map(u => [
      `"${u.id}"`,
      `"${u.username}"`,
      `"${u.fullName}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.phone || '-'}"`,
      `"${u.assignedProjectIds.includes('all') ? 'Semua Proyek' : u.assignedProjectIds.join(', ')}"`,
      `"${u.createdAt}"`,
      `"${u.lastLogin || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Pengguna_M&E_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isId ? 'Daftar akun diekspor ke CSV' : 'User list exported to CSV');
  };

  const superAdminCount = users.filter(u => u.role === 'Super Admin').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-slate-900 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-orange-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-orange-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-orange-50 border border-white/25">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
              <span>{isId ? 'Kontrol Akses & Keamanan Sistem' : 'Access Control & Security'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isId ? 'Manajemen Akun Pengguna' : 'User Account Management'}
            </h1>
            <p className="text-sm text-orange-50/95 leading-relaxed">
              {isId 
                ? 'Kelola akun administrator, koordinator lapangan, staf M&E, dan mitra donor. Tambah akun baru, edit profil, ganti username & password, atau atur hak akses proyek.'
                : 'Manage administrator, field coordinator, M&E staff, and donor partner accounts. Add new users, edit profiles, change username & password, or assign project permissions.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <button
              onClick={handleExportXLSX}
              className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-md whitespace-nowrap shrink-0"
              title={isId ? 'Ekspor Daftar Akun ke Excel (.xlsx)' : 'Export Users to Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>{isId ? 'Ekspor Excel' : 'Export Excel'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 sm:px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 backdrop-blur-sm whitespace-nowrap shrink-0"
              title={isId ? 'Ekspor CSV' : 'Export CSV'}
            >
              <Download className="w-4 h-4 text-orange-100" />
              <span>CSV</span>
            </button>

            {isAdmin && (
              <button
                onClick={openAddModal}
                className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 bg-white hover:bg-orange-50 text-orange-700 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95 whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isId ? '+ Tambah Akun Baru' : '+ Add New User'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20">
          <div className="bg-white/15 backdrop-blur-xs rounded-xl p-3 border border-white/20">
            <div className="text-[11px] text-orange-50 font-medium">{isId ? 'Total Pengguna' : 'Total Users'}</div>
            <div className="text-2xl font-bold mt-0.5 text-white tabular-nums">{users.length}</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-xl p-3 border border-white/20">
            <div className="text-[11px] text-orange-50 font-medium">{isId ? 'Akun Aktif' : 'Active Users'}</div>
            <div className="text-2xl font-bold mt-0.5 text-white tabular-nums">{users.filter(u => u.status === 'Aktif').length}</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-xl p-3 border border-white/20">
            <div className="text-[11px] text-orange-50 font-medium">{isId ? 'Administrator' : 'Administrators'}</div>
            <div className="text-2xl font-bold mt-0.5 text-white tabular-nums">{users.filter(u => u.role === 'Super Admin' || u.role === 'Admin').length}</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-xl p-3 border border-white/20">
            <div className="text-[11px] text-orange-50 font-medium">{isId ? 'Staf & Lapangan' : 'Staff & Field'}</div>
            <div className="text-2xl font-bold mt-0.5 text-white tabular-nums">{users.filter(u => u.role === 'Staff M&E' || u.role === 'Field Coordinator').length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-orange-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex-1 w-full grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Search Box */}
          <div className="relative w-full sm:w-auto sm:min-w-[220px] sm:flex-1 min-w-0">
            <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isId ? 'Cari nama, username, email, no HP...' : 'Search name, username, email, phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-orange-50/40 border border-orange-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-orange-50/40 border border-orange-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">{isId ? 'Semua Peran / Role' : 'All Roles'}</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Staff M&E">Staff M&E</option>
              <option value="Field Coordinator">Field Coordinator</option>
              <option value="Donor / Partner">Donor / Partner</option>
              <option value="Viewer / Guest">Viewer / Guest</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-orange-50/40 border border-orange-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">{isId ? 'Semua Status' : 'All Status'}</option>
              <option value="Aktif">{isId ? 'Aktif' : 'Active'}</option>
              <option value="Nonaktif">{isId ? 'Nonaktif' : 'Inactive'}</option>
              <option value="Terkunci">{isId ? 'Terkunci' : 'Locked'}</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium tabular-nums shrink-0">
          {isId ? `Menampilkan ${filteredUsers.length} dari ${users.length} akun` : `Showing ${filteredUsers.length} of ${users.length} users`}
        </div>
      </div>

      {/* Mobile User Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => {
            const roleStyle = ROLE_BADGES[user.role] || ROLE_BADGES['Viewer / Guest'];
            const isCurrentSessionUser = user.id === currentUserId;
            const isLastSuperAdmin = user.role === 'Super Admin' && superAdminCount <= 1;
            const cannotDelete = isCurrentSessionUser || isLastSuperAdmin;

            return (
              <div key={user.id} className="bg-white rounded-2xl border border-orange-100 shadow-xs p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{user.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono truncate">@{user.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    disabled={isCurrentSessionUser || !isAdmin}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      user.status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : user.status === 'Terkunci'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span>{user.status}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                    {user.role}
                  </span>
                  {isCurrentSessionUser && (
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                      {isId ? 'Sesi Aktif' : 'Current'}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {user.assignedProjectIds.includes('all')
                      ? (isId ? 'Semua Proyek' : 'All Projects')
                      : `${user.assignedProjectIds.length} ${isId ? 'Proyek' : 'Projects'}`}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-orange-100/70">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px]">{user.phone}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {isId ? 'Login terakhir:' : 'Last login:'} {user.lastLogin || '-'}
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-orange-100/70">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-xs font-semibold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isId ? 'Edit Akun' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openCredentialsModal(user)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold transition whitespace-nowrap"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isId ? 'Username & Password' : 'Credentials'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => !cannotDelete && setUserToDelete(user)}
                      disabled={cannotDelete}
                      className={`p-2 rounded-xl border transition ${
                        cannotDelete
                          ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed'
                          : 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100'
                      }`}
                      aria-label={isId ? 'Hapus akun' : 'Delete user'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-orange-100 p-8 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-orange-200 mb-2" />
            <p className="font-semibold text-slate-600 text-sm">{isId ? 'Tidak ada akun pengguna yang cocok' : 'No user accounts found'}</p>
          </div>
        )}
      </div>

      {/* Users Table (Tablet & Desktop >= 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-orange-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold border-b border-orange-500">
                <th className="py-3.5 px-4">{isId ? 'Pengguna & Akun' : 'User & Profile'}</th>
                <th className="py-3.5 px-3">{isId ? 'Peran / Role' : 'Role'}</th>
                <th className="py-3.5 px-3">{isId ? 'Kontak' : 'Contact'}</th>
                <th className="py-3.5 px-3">{isId ? 'Akses Proyek' : 'Assigned Projects'}</th>
                <th className="py-3.5 px-3">{isId ? 'Status' : 'Status'}</th>
                <th className="py-3.5 px-3">{isId ? 'Login Terakhir' : 'Last Login'}</th>
                <th className="py-3.5 px-4 text-right">{isId ? 'Aksi' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/70 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const roleStyle = ROLE_BADGES[user.role] || ROLE_BADGES['Viewer / Guest'];
                  const isCurrentSessionUser = user.id === currentUserId;
                  const isLastSuperAdmin = user.role === 'Super Admin' && superAdminCount <= 1;
                  const cannotDelete = isCurrentSessionUser || isLastSuperAdmin;

                  return (
                    <tr key={user.id} className="hover:bg-orange-50/40 transition">
                      {/* User & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{user.fullName}</span>
                              {isCurrentSessionUser && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                  {isId ? 'Sesi Aktif' : 'Current'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">@{user.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-3 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Assigned Projects */}
                      <td className="py-3.5 px-3">
                        {user.assignedProjectIds.includes('all') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            {isId ? 'Semua Proyek' : 'All Projects'}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {user.assignedProjectIds.map(pId => {
                              const proj = projects.find(p => p.id === pId);
                              return (
                                <span key={pId} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200" title={proj?.title}>
                                  {proj?.code || pId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={isCurrentSessionUser || !isAdmin}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition whitespace-nowrap ${
                            user.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : user.status === 'Terkunci'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          } ${isCurrentSessionUser ? 'cursor-default' : 'cursor-pointer'}`}
                          title={isId ? 'Klik untuk mengubah status aktif' : 'Click to toggle status'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{user.status}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px] tabular-nums whitespace-nowrap">
                        {user.lastLogin || '-'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-[11px] font-semibold transition whitespace-nowrap shrink-0"
                              title={isId ? `Edit akun ${user.username}` : `Edit account ${user.username}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isId ? 'Edit' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openCredentialsModal(user)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-semibold transition whitespace-nowrap shrink-0"
                              title={isId ? `Ganti Username & Password ${user.username}` : `Change Username & Password ${user.username}`}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>{isId ? 'Username & Password' : 'Credentials'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => !cannotDelete && setUserToDelete(user)}
                              disabled={cannotDelete}
                              className={`p-1.5 rounded-lg transition ${
                                cannotDelete
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                              title={
                                isCurrentSessionUser
                                  ? (isId ? 'Tidak dapat menghapus akun yang sedang aktif login' : 'Cannot delete active session user')
                                  : isLastSuperAdmin
                                  ? (isId ? 'Minimal harus ada 1 Super Admin aktif' : 'At least 1 Super Admin is required')
                                  : (isId ? `Hapus akun ${user.username}` : `Delete user ${user.username}`)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">{isId ? 'Tidak ada akun pengguna yang cocok' : 'No user accounts found'}</p>
                    <p className="text-xs text-slate-400 mt-1">{isId ? 'Coba ubah kata kunci pencarian atau filter peran.' : 'Try changing search query or role filter.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit User Account */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-orange-100 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              type="button"
              onClick={() => {
                setIsAccountModalOpen(false);
                setEditingUser(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-orange-50 hover:text-orange-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
                {editingUser ? <Edit3 className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editingUser
                    ? (isId ? 'Edit Akun Pengguna' : 'Edit User Account')
                    : (isId ? 'Tambah Akun Pengguna Baru' : 'Add New User Account')}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingUser
                    ? (isId ? 'Perbarui profil, username, peran, cakupan proyek, atau kata sandi akun.' : 'Update profile, username, role, project scope, or password.')
                    : (isId ? 'Daftarkan pengguna baru beserta username dan password untuk login.' : 'Register a new user with username and password for login.')}
                </p>
              </div>
            </div>

            {accountFormError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{accountFormError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              {/* Profile Photo Picker */}
              <div className="p-3.5 bg-orange-50/40 border border-orange-100 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
                  <div className="relative shrink-0 self-start sm:self-center">
                    {formData.avatarUrl.trim() && !avatarLoadError ? (
                      <img
                        src={formData.avatarUrl}
                        alt={formData.fullName || formData.username || 'Avatar'}
                        onError={() => setAvatarLoadError(true)}
                        className="w-16 h-16 rounded-2xl object-cover border border-orange-200 bg-white shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                        {(formData.fullName || formData.username || 'U').trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-orange-600" />
                        <span>{isId ? 'Foto Profil Akun' : 'Account Profile Photo'}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {isId
                          ? 'Unggah foto JPG/PNG/WebP (maks. 5 MB), otomatis dipotong 1:1.'
                          : 'Upload JPG/PNG/WebP (max 5 MB), auto-cropped 1:1.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isUploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition whitespace-nowrap shrink-0 disabled:opacity-60"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isId ? 'Unggah Foto' : 'Upload Photo'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAvatarUrlInput(prev => !prev)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-orange-50 text-slate-700 border border-orange-200 rounded-lg text-[11px] font-semibold transition whitespace-nowrap shrink-0"
                      >
                        <Link2 className="w-3.5 h-3.5 text-orange-500" />
                        <span>{isId ? 'URL Foto' : 'Photo URL'}</span>
                      </button>

                      {formData.avatarUrl.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, avatarUrl: '' }));
                            setAvatarLoadError(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition whitespace-nowrap shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isId ? 'Hapus Foto' : 'Remove'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {showAvatarUrlInput && (
                  <div className="pt-2 border-t border-orange-100">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {isId ? 'Tempel Tautan URL Foto Profil' : 'Paste Profile Photo URL'}
                    </label>
                    <input
                      type="url"
                      value={formData.avatarUrl.startsWith('data:') ? '' : formData.avatarUrl}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, avatarUrl: e.target.value }));
                        setAvatarLoadError(false);
                      }}
                      placeholder="https://contoh.com/foto-profil.jpg"
                      className="w-full text-xs px-3 py-2 bg-white border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Nama Lengkap & Gelar *' : 'Full Name & Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isId ? 'Contoh: Siti Rahmawati, S.Stat' : 'e.g., Siti Rahmawati, S.Stat'}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium text-slate-900"
                />
              </div>

              {/* Username & Email in 2 Cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Username Login *' : 'Login Username *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="siti.rahma"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                    className="w-full text-xs px-3.5 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Email *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="siti@monitoring.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Password & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingUser
                      ? (isId ? 'Password Baru (Opsional)' : 'New Password (Optional)')
                      : (isId ? 'Password Login * (Min. 6 Karakter)' : 'Login Password * (Min. 6 Chars)')}
                  </label>
                  <div className="relative">
                    <input
                      type={showAccountPassword ? 'text' : 'password'}
                      required={!editingUser}
                      placeholder={editingUser ? (isId ? 'Kosongkan jika tetap' : 'Leave blank to keep') : 'Minimal 6 karakter'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full text-xs pl-3.5 pr-9 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountPassword(!showAccountPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-700"
                    >
                      {showAccountPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'No. Telepon / WhatsApp' : 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    placeholder="+62 812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Peran / Hak Akses (Role) *' : 'System Role *'}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    disabled={editingUser?.id === currentUserId && editingUser?.role === 'Super Admin'}
                    className="w-full text-xs px-3.5 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-semibold text-slate-900 disabled:opacity-60"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff M&E">Staff M&E</option>
                    <option value="Field Coordinator">Field Coordinator</option>
                    <option value="Donor / Partner">Donor / Partner</option>
                    <option value="Viewer / Guest">Viewer / Guest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Status Akun *' : 'Account Status *'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    disabled={editingUser?.id === currentUserId}
                    className="w-full text-xs px-3.5 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-semibold text-slate-900 disabled:opacity-60"
                  >
                    <option value="Aktif">{isId ? 'Aktif' : 'Active'}</option>
                    <option value="Nonaktif">{isId ? 'Nonaktif' : 'Inactive'}</option>
                    <option value="Terkunci">{isId ? 'Terkunci' : 'Locked'}</option>
                  </select>
                </div>
              </div>

              {/* Assigned Project Scope */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isId ? 'Cakupan Akses Proyek' : 'Assigned Project Scope'}
                </label>
                <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignedProjectIds.includes('all')}
                      onChange={() => toggleProjectScope('all')}
                      className="rounded border-orange-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                    />
                    <span>{isId ? 'Semua Proyek (Akses Global)' : 'All Projects (Global Access)'}</span>
                  </label>
                  <div className="border-t border-orange-100 pt-1.5 space-y-1.5">
                    {projects.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!formData.assignedProjectIds.includes('all') && formData.assignedProjectIds.includes(p.id)}
                          onChange={() => toggleProjectScope(p.id)}
                          className="rounded border-orange-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                        />
                        <span className="font-mono text-[11px] font-semibold text-orange-700">[{p.code}]</span>
                        <span className="truncate">{p.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-orange-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {editingUser
                      ? (isId ? 'Simpan Perubahan Akun' : 'Save Account Changes')
                      : (isId ? 'Simpan Akun Baru' : 'Save New Account')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Change Username & Password */}
      {credentialsTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-orange-100 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              type="button"
              onClick={() => setCredentialsTarget(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-orange-50 hover:text-orange-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-lg font-extrabold text-slate-900 truncate">
                  {isId ? 'Ganti Username & Password' : 'Change Username & Password'}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {credentialsTarget.fullName}
                </p>
              </div>
            </div>

            {credError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{credError}</span>
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Username Login *' : 'Login Username *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={credUsername}
                    onChange={(e) => setCredUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                    className="w-full text-xs pl-7 pr-3 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isId ? 'Login ke sistem wajib menggunakan username ini.' : 'System login requires this username.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Password Baru (Min. 6 Karakter)' : 'New Password (Min. 6 Characters)'}
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCredNewPw ? 'text' : 'password'}
                    placeholder={isId ? 'Kosongkan jika tidak ganti password' : 'Leave blank to keep current password'}
                    value={credNewPassword}
                    onChange={(e) => setCredNewPassword(e.target.value)}
                    className="w-full text-xs pl-8 pr-10 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredNewPw(!showCredNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-700"
                  >
                    {showCredNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Konfirmasi Password Baru' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCredConfirmPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={credConfirmPassword}
                    onChange={(e) => setCredConfirmPassword(e.target.value)}
                    className="w-full text-xs pl-8 pr-10 py-2.5 bg-orange-50/40 border border-orange-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredConfirmPw(!showCredConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-700"
                  >
                    {showCredConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-orange-100">
                <button
                  type="button"
                  onClick={() => setCredentialsTarget(null)}
                  className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isId ? 'Simpan Kredensial' : 'Save Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-orange-100 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              {isId ? 'Konfirmasi Hapus Akun' : 'Confirm Delete Account'}
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {isId 
                ? `Apakah Anda yakin ingin menghapus akun pengguna "${userToDelete.fullName}" (@${userToDelete.username})? Tindakan ini tidak dapat dibatalkan.`
                : `Are you sure you want to delete user account "${userToDelete.fullName}" (@${userToDelete.username})? This action cannot be undone.`}
            </p>

            <div className="p-3 bg-orange-50/40 rounded-xl border border-orange-100 mb-5 text-xs space-y-1">
              <div className="font-semibold text-slate-800">{userToDelete.fullName}</div>
              <div className="text-slate-500 font-mono">@{userToDelete.username} · {userToDelete.email} · {userToDelete.role}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                {isId ? 'Ya, Hapus Akun' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
