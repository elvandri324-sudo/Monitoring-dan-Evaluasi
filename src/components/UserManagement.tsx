import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X, 
  FileSpreadsheet, 
  Download, 
  KeyRound, 
  AlertTriangle,
  Lock,
  Building,
  UserCheck,
  UserX
} from 'lucide-react';
import { UserAccount, UserRole, UserStatus, Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { exportUsersToXLSX } from '../utils/exportXlsx';

interface UserManagementProps {
  users: UserAccount[];
  projects: Project[];
  isAdmin: boolean;
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser?: (user: UserAccount) => void;
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
  onAddUser,
  onDeleteUser,
  onUpdateUser
}) => {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'Staff M&E' as UserRole,
    assignedProjectIds: ['all'],
    status: 'Aktif' as UserStatus,
    phone: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  // Handle Add User Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      alert(isId ? 'Nama Lengkap, Username, dan Email wajib diisi.' : 'Full Name, Username, and Email are required.');
      return;
    }

    // Check duplicate username or email
    const duplicate = users.find(
      u => u.username.toLowerCase() === formData.username.trim().toLowerCase() ||
           u.email.toLowerCase() === formData.email.trim().toLowerCase()
    );
    if (duplicate) {
      alert(isId ? 'Username atau Email sudah terdaftar dalam sistem!' : 'Username or Email is already registered!');
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now().toString().slice(-6)}`,
      username: formData.username.trim().toLowerCase(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password.trim() || 'password123',
      role: formData.role,
      assignedProjectIds: formData.assignedProjectIds.length > 0 ? formData.assignedProjectIds : ['all'],
      status: formData.status,
      phone: formData.phone.trim() || undefined,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.username.trim())}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '-'
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      role: 'Staff M&E',
      assignedProjectIds: ['all'],
      status: 'Aktif',
      phone: ''
    });
    showToast(isId ? `Akun "${newUser.fullName}" berhasil ditambahkan.` : `User account "${newUser.fullName}" added successfully.`);
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!userToDelete) return;
    if (userToDelete.username === 'admin') {
      alert(isId ? 'Akun Super Administrator Utama tidak dapat dihapus!' : 'Main Super Administrator account cannot be deleted!');
      setUserToDelete(null);
      return;
    }
    onDeleteUser(userToDelete.id);
    showToast(isId ? `Akun "${userToDelete.fullName}" berhasil dihapus.` : `User account "${userToDelete.fullName}" deleted.`);
    setUserToDelete(null);
  };

  // Handle Toggle Status
  const handleToggleStatus = (user: UserAccount) => {
    if (!onUpdateUser) return;
    if (user.username === 'admin') return;
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

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-indigo-200 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isId ? 'Kontrol Akses & Keamanan Sistem' : 'Access Control & Security'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isId ? 'Manajemen Akun Pengguna' : 'User Account Management'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isId 
                ? 'Kelola akun administrator, koordinator lapangan, staf M&E, dan mitra donor. Tambah akun baru, atur hak akses per proyek, atau hapus akun pengguna.'
                : 'Manage administrator, field coordinator, M&E staff, and donor partner accounts. Add new users, assign project permissions, or remove user accounts.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportXLSX}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-md"
              title={isId ? 'Ekspor Daftar Akun ke Excel (.xlsx)' : 'Export Users to Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{isId ? 'Ekspor Excel (XLSX)' : 'Export Excel (XLSX)'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold transition flex items-center gap-2 backdrop-blur-sm"
              title={isId ? 'Ekspor CSV' : 'Export CSV'}
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>CSV</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isId ? '+ Tambah Akun Baru' : '+ Add New User'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300 font-medium">{isId ? 'Total Pengguna' : 'Total Users'}</div>
            <div className="text-2xl font-bold mt-0.5 text-white">{users.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-300 font-medium">🟢 {isId ? 'Akun Aktif' : 'Active Users'}</div>
            <div className="text-2xl font-bold mt-0.5 text-emerald-400">{users.filter(u => u.status === 'Aktif').length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-purple-300 font-medium">🛡️ {isId ? 'Administrator' : 'Administrators'}</div>
            <div className="text-2xl font-bold mt-0.5 text-purple-300">{users.filter(u => u.role === 'Super Admin' || u.role === 'Admin').length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-amber-300 font-medium">👥 {isId ? 'Staf & Lapangan' : 'Staff & Field'}</div>
            <div className="text-2xl font-bold mt-0.5 text-amber-300">{users.filter(u => u.role === 'Staff M&E' || u.role === 'Field Coordinator').length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isId ? 'Cari nama, username, email, no HP...' : 'Search name, username, email, phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{isId ? 'Semua Status' : 'All Status'}</option>
            <option value="Aktif">{isId ? '🟢 Aktif' : '🟢 Active'}</option>
            <option value="Nonaktif">{isId ? '⚪ Nonaktif' : '⚪ Inactive'}</option>
            <option value="Terkunci">{isId ? '🔒 Terkunci' : '🔒 Locked'}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {isId ? `Menampilkan ${filteredUsers.length} dari ${users.length} akun` : `Showing ${filteredUsers.length} of ${users.length} users`}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-semibold border-b border-slate-800">
                <th className="py-3.5 px-4">{isId ? 'Pengguna & Akun' : 'User & Profile'}</th>
                <th className="py-3.5 px-3">{isId ? 'Peran / Role' : 'Role'}</th>
                <th className="py-3.5 px-3">{isId ? 'Kontak' : 'Contact'}</th>
                <th className="py-3.5 px-3">{isId ? 'Akses Proyek' : 'Assigned Projects'}</th>
                <th className="py-3.5 px-3">{isId ? 'Status' : 'Status'}</th>
                <th className="py-3.5 px-3">{isId ? 'Login Terakhir' : 'Last Login'}</th>
                <th className="py-3.5 px-4 text-right">{isId ? 'Aksi' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const roleStyle = ROLE_BADGES[user.role] || ROLE_BADGES['Viewer / Guest'];
                  const isProtected = user.username === 'admin';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      {/* User & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                            alt={user.fullName} 
                            className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200 shadow-2xs" 
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {isProtected && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  MASTER
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">@{user.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            🌐 {isId ? 'Semua Proyek' : 'All Projects'}
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
                          disabled={isProtected || !isAdmin}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                            user.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : user.status === 'Terkunci'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          } ${isProtected ? 'cursor-default' : 'cursor-pointer'}`}
                          title={isId ? 'Klik untuk mengubah status aktif' : 'Click to toggle status'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{user.status}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                        {user.lastLogin || '-'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin && !isProtected && (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                              title={isId ? `Hapus akun ${user.username}` : `Delete user ${user.username}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {isProtected && (
                            <span className="text-[10px] text-slate-400 italic px-2 py-1 bg-slate-50 rounded-md">
                              {isId ? 'Terkunci' : 'Protected'}
                            </span>
                          )}
                        </div>
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

      {/* Modal: Add New User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {isId ? 'Tambah Akun Pengguna Baru' : 'Add New User Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isId ? 'Daftarkan pengguna baru dan tentukan hak akses peran sistem.' : 'Register a new user and assign permission role.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
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
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Username & Email in 2 Cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Username *' : 'Username *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="siti.rahma"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Password & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isId ? 'Password Awal' : 'Initial Password'}
                  </label>
                  <input
                    type="text"
                    placeholder="password123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Aktif">🟢 Aktif</option>
                    <option value="Nonaktif">⚪ Nonaktif</option>
                    <option value="Terkunci">🔒 Terkunci</option>
                  </select>
                </div>
              </div>

              {/* Assigned Project Scope */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Cakupan Akses Proyek' : 'Assigned Project Scope'}
                </label>
                <select
                  value={formData.assignedProjectIds[0] || 'all'}
                  onChange={(e) => setFormData({ ...formData, assignedProjectIds: [e.target.value] })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="all">🌐 {isId ? 'Semua Proyek (Global)' : 'All Projects (Global)'}</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95"
                >
                  {isId ? 'Simpan Akun Baru' : 'Save New Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
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

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5 text-xs space-y-1">
              <div className="font-semibold text-slate-800">{userToDelete.fullName}</div>
              <div className="text-slate-500 font-mono">{userToDelete.email} • Role: {userToDelete.role}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
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
