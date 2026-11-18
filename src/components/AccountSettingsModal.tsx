import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  KeyRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save
} from 'lucide-react';
import { UserAccount } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSaveAccount: (updatedUser: UserAccount) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSaveAccount
}) => {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [activeSection, setActiveSection] = useState<'profile' | 'credentials'>('profile');

  // Profile & Username fields
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFullName(currentUser.fullName);
      setUsername(currentUser.username);
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfileAndUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanFullName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    const cleanEmail = email.trim();

    if (!cleanFullName || !cleanUsername || !cleanEmail) {
      setErrorMsg(
        isId
          ? 'Nama lengkap, username, dan email tidak boleh kosong.'
          : 'Full name, username, and email cannot be empty.'
      );
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMsg(
        isId
          ? 'Username minimal terdiri dari 3 karakter.'
          : 'Username must be at least 3 characters.'
      );
      return;
    }

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setErrorMsg(
        isId
          ? 'Username hanya boleh berisi huruf kecil, angka, titik (.), garis bawah (_), atau tanda hubung (-).'
          : 'Username can only contain lowercase letters, numbers, dots (.), underscores (_), or hyphens (-).'
      );
      return;
    }

    const duplicateUsername = allUsers.find(
      u => u.id !== currentUser.id && u.username.toLowerCase() === cleanUsername
    );
    if (duplicateUsername) {
      setErrorMsg(
        isId
          ? `Username "@${cleanUsername}" sudah digunakan oleh akun lain.`
          : `Username "@${cleanUsername}" is already taken by another account.`
      );
      return;
    }

    const duplicateEmail = allUsers.find(
      u => u.id !== currentUser.id && u.email.toLowerCase() === cleanEmail.toLowerCase()
    );
    if (duplicateEmail) {
      setErrorMsg(
        isId
          ? `Email "${cleanEmail}" sudah terdaftar pada akun lain.`
          : `Email "${cleanEmail}" is already registered to another account.`
      );
      return;
    }

    onSaveAccount({
      ...currentUser,
      fullName: cleanFullName,
      username: cleanUsername,
      email: cleanEmail,
      phone: phone.trim() || undefined
    });

    setSuccessMsg(
      isId
        ? 'Profil dan username akun berhasil diperbarui.'
        : 'Account profile and username updated successfully.'
    );
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg(
        isId
          ? 'Username minimal 3 karakter dan tidak boleh kosong.'
          : 'Username must be at least 3 characters.'
      );
      return;
    }

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setErrorMsg(
        isId
          ? 'Username hanya boleh berisi huruf kecil, angka, titik (.), garis bawah (_), atau tanda hubung (-).'
          : 'Username can only contain lowercase letters, numbers, dots (.), underscores (_), or hyphens (-).'
      );
      return;
    }

    const duplicateUsername = allUsers.find(
      u => u.id !== currentUser.id && u.username.toLowerCase() === cleanUsername
    );
    if (duplicateUsername) {
      setErrorMsg(
        isId
          ? `Username "@${cleanUsername}" sudah digunakan oleh akun lain.`
          : `Username "@${cleanUsername}" is already taken.`
      );
      return;
    }

    const isChangingPassword = newPassword.length > 0 || confirmPassword.length > 0;
    const isChangingUsername = cleanUsername !== currentUser.username.toLowerCase();

    if (!isChangingPassword && !isChangingUsername) {
      setErrorMsg(
        isId
          ? 'Tidak ada perubahan username atau password yang dimasukkan.'
          : 'No username or password changes entered.'
      );
      return;
    }

    // Verify current password whenever changing password (or username)
    const expectedPassword = currentUser.password || 'password123';
    if (!currentPassword || currentPassword !== expectedPassword) {
      setErrorMsg(
        isId
          ? 'Password saat ini tidak sesuai. Mohon masukkan password Anda saat ini untuk verifikasi.'
          : 'Current password is incorrect. Please enter your current password to verify.'
      );
      return;
    }

    if (isChangingPassword) {
      if (newPassword.length < 6) {
        setErrorMsg(
          isId
            ? 'Password baru minimal harus 6 karakter.'
            : 'New password must be at least 6 characters.'
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMsg(
          isId
            ? 'Konfirmasi password baru tidak cocok.'
            : 'New password confirmation does not match.'
        );
        return;
      }
    }

    onSaveAccount({
      ...currentUser,
      username: cleanUsername,
      password: isChangingPassword ? newPassword : currentUser.password
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg(
      isId
        ? isChangingPassword && isChangingUsername
          ? 'Username dan password berhasil diperbarui! Gunakan kredensial baru saat login berikutnya.'
          : isChangingPassword
          ? 'Password berhasil diperbarui!'
          : 'Username berhasil diperbarui!'
        : 'Credentials updated successfully!'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label={isId ? 'Tutup' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 pr-8">
            <h3 className="text-lg font-extrabold text-slate-900 truncate">
              {isId ? 'Pengaturan Akun Saya' : 'My Account Settings'}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="font-mono text-slate-600">@{currentUser.username}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-blue-700">{currentUser.role}</span>
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveSection('profile');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSection === 'profile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isId ? 'Edit Profil & Akun' : 'Edit Profile'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSection('credentials');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSection === 'credentials'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isId ? 'Ganti Username & Password' : 'Username & Password'}</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* TAB 1: Edit Profile & Username */}
        {activeSection === 'profile' && (
          <form onSubmit={handleSaveProfileAndUsername} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isId ? 'Nama Lengkap & Gelar *' : 'Full Name & Title *'}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Username Login *' : 'Login Username *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                    className="w-full text-xs pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Email *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isId ? 'No. Telepon / WhatsApp' : 'Phone / WhatsApp'}
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-xxxx-xxxx"
                  className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isId ? 'Simpan Perubahan' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Change Username & Password */}
        {activeSection === 'credentials' && (
          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isId ? 'Username Baru *' : 'New Username *'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                  className="w-full text-xs pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isId
                  ? 'Username ini wajib digunakan saat masuk (login) ke sistem.'
                  : 'This username is required when signing in to the system.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isId ? 'Password Saat Ini (Wajib untuk Verifikasi) *' : 'Current Password (Required) *'}
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-8 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isId ? 'Password Baru (Min. 6 Karakter)' : 'New Password (Min. 6 Chars)'}
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isId ? 'Kosongkan jika tetap' : 'Leave blank to keep'}
                    className="w-full text-xs pl-8 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-8 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isId ? 'Simpan Kredensial' : 'Update Credentials'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsModal;
