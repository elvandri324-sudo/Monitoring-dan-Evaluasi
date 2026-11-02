import { useState, useEffect, FormEvent } from 'react';
import { 
  BarChart3, 
  Lock, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Send,
  Inbox,
  Clock,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { UserSession, UserAccount, Project } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LoginPageProps {
  users: UserAccount[];
  projects?: Project[];
  onLogin: (session: UserSession) => void;
  onResetPassword?: (userId: string, newPassword: string) => void;
  onBackToPublic?: () => void;
}

export default function LoginPage({ 
  users, 
  projects = [], 
  onLogin, 
  onResetPassword,
  onBackToPublic 
}: LoginPageProps) {
  const { language, setLanguage } = useLanguage();
  const isId = language === 'id';

  // Mode: 'login' | 'forgot-password'
  const [viewState, setViewState] = useState<'login' | 'forgot-password'>('login');

  // Login form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAccountsGuide, setShowAccountsGuide] = useState(false);

  // Email Reset password states
  // Step 1: Request Email Dispatch
  // Step 2: Enter Verification Code / Click Email Link
  // Step 3: Set New Password
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [verifiedUser, setVerifiedUser] = useState<UserAccount | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentTimestamp, setEmailSentTimestamp] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // New password inputs
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Countdown timer for resending email
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanIdentifier) {
      setErrorMessage(isId ? 'Silakan masukkan Email atau Username Anda.' : 'Please enter your Email or Username.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage(isId ? 'Silakan masukkan Kata Sandi Anda.' : 'Please enter your Password.');
      return;
    }

    // Lookup user in registered users database
    const matchedUser = users.find(u => 
      u.email.toLowerCase() === cleanIdentifier || 
      u.username.toLowerCase() === cleanIdentifier
    );

    if (!matchedUser) {
      setErrorMessage(
        isId 
          ? 'Akun tidak terdaftar dalam sistem. Hanya pengguna yang telah didaftarkan oleh Administrator yang dapat masuk.' 
          : 'Account is not registered. Only users authorized by the Administrator can log in.'
      );
      return;
    }

    // Check account status
    if (matchedUser.status === 'Nonaktif' || matchedUser.status === 'Terkunci') {
      setErrorMessage(
        isId 
          ? `Akun Anda berstatus "${matchedUser.status}". Akses dinonaktifkan. Silakan hubungi Administrator M&E.` 
          : `Your account is "${matchedUser.status}". Access disabled. Please contact the M&E Administrator.`
      );
      return;
    }

    // Verify password
    if (matchedUser.password && matchedUser.password !== cleanPassword) {
      setErrorMessage(
        isId 
          ? 'Kata sandi tidak sesuai. Silakan periksa kembali atau gunakan fitur "Lupa kata sandi?".' 
          : 'Incorrect password. Please verify and try again or use "Forgot password?".'
      );
      return;
    }

    // Successful login with registered user credentials and assigned projects
    onLogin({
      id: matchedUser.id,
      username: matchedUser.username,
      name: matchedUser.fullName,
      email: matchedUser.email,
      role: matchedUser.role,
      assignedProjectIds: matchedUser.assignedProjectIds && matchedUser.assignedProjectIds.length > 0 
        ? matchedUser.assignedProjectIds 
        : ['all'],
      avatarUrl: matchedUser.avatarUrl,
      isLoggedIn: true
    });
  };

  // Helper to generate a random 6-digit OTP
  const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Step 1: Send Reset Password Email
  const handleSendResetEmail = (e: FormEvent) => {
    e.preventDefault();
    setResetError('');

    const cleanInput = resetIdentifier.trim().toLowerCase();
    if (!cleanInput) {
      setResetError(isId ? 'Silakan masukkan Email atau Username terdaftar.' : 'Please enter your registered Email or Username.');
      return;
    }

    const matched = users.find(u => 
      u.email.toLowerCase() === cleanInput || 
      u.username.toLowerCase() === cleanInput
    );

    if (!matched) {
      setResetError(
        isId 
          ? 'Akun dengan Email/Username tersebut tidak ditemukan dalam sistem.' 
          : 'No account found matching that Email or Username.'
      );
      return;
    }

    if (matched.status === 'Terkunci') {
      setResetError(
        isId 
          ? 'Akun Anda saat ini berstatus "Terkunci". Silakan hubungi Super Admin untuk membuka kunci akun.' 
          : 'Your account is locked. Please contact the Super Admin to unlock it.'
      );
      return;
    }

    setIsSendingEmail(true);

    // Simulate sending email to user's registered inbox
    setTimeout(() => {
      const code = generateRandomOtp();
      setGeneratedOtp(code);
      setVerifiedUser(matched);
      setIsSendingEmail(false);
      setResetStep(2);
      setEnteredOtp('');
      setEmailSentTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setResendCountdown(60);
      setShowEmailPreviewModal(true);
    }, 600);
  };

  // Step 2: Verify OTP entered by user
  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    setResetError('');

    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp) {
      setResetError(isId ? 'Silakan masukkan 6-digit kode verifikasi yang dikirim ke email.' : 'Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (cleanOtp !== generatedOtp) {
      setResetError(
        isId 
          ? 'Kode verifikasi tidak sesuai atau telah kedaluwarsa. Silakan periksa kembali email Anda.' 
          : 'Invalid or expired verification code. Please check your email again.'
      );
      return;
    }

    // OTP is valid! Proceed to Step 3 (Set New Password)
    setResetStep(3);
  };

  // Direct fast link verification from simulated email
  const handleDirectLinkVerification = () => {
    setEnteredOtp(generatedOtp);
    setResetStep(3);
    setResetError('');
  };

  // Resend Email
  const handleResendEmail = () => {
    if (resendCountdown > 0 || !verifiedUser) return;
    setIsSendingEmail(true);
    setResetError('');

    setTimeout(() => {
      const code = generateRandomOtp();
      setGeneratedOtp(code);
      setIsSendingEmail(false);
      setEmailSentTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setResendCountdown(60);
      setEnteredOtp('');
    }, 500);
  };

  // Step 3: Set and save new password
  const handleSaveNewPassword = (e: FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!verifiedUser) return;

    if (!newPassword || newPassword.length < 6) {
      setResetError(isId ? 'Kata sandi baru minimal 6 karakter.' : 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError(isId ? 'Konfirmasi kata sandi tidak cocok. Mohon ulangi.' : 'Password confirmation does not match.');
      return;
    }

    // Call reset password callback
    if (onResetPassword) {
      onResetPassword(verifiedUser.id, newPassword);
    }

    setResetSuccess(true);
    setSuccessMessage(
      isId 
        ? `Kata sandi untuk akun "${verifiedUser.fullName}" berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.` 
        : `Password for "${verifiedUser.fullName}" updated successfully! Please sign in with your new password.`
    );

    // Switch back to login form after brief delay
    setTimeout(() => {
      setIdentifier(verifiedUser.username || verifiedUser.email);
      setPassword('');
      setViewState('login');
      setResetStep(1);
      setVerifiedUser(null);
      setNewPassword('');
      setConfirmPassword('');
      setGeneratedOtp('');
      setEnteredOtp('');
      setResetSuccess(false);
    }, 1400);
  };

  const handleOpenForgotPassword = () => {
    setViewState('forgot-password');
    setResetStep(1);
    setResetError('');
    setResetIdentifier(identifier || '');
    setVerifiedUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedOtp('');
    setEnteredOtp('');
    setResetSuccess(false);
  };

  const handleBackToLogin = () => {
    setViewState('login');
    setErrorMessage('');
    setResetError('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 py-10">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            M&E Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isId ? 'Sistem Informasi Monitoring dan Evaluasi Proyek Terintegrasi' : 'Integrated Project Monitoring & Evaluation System'}
          </p>

          {/* Language Toggle */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs mt-3 text-xs">
            <button
              onClick={() => setLanguage('id')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                isId ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇮🇩</span>
              <span>Bahasa ID</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                !isId ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-5">
          
          {/* VIEW 1: LOGIN FORM */}
          {viewState === 'login' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isId ? 'Masuk ke Sistem' : 'Sign in to System'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isId ? 'Hanya pengguna terdaftar yang dapat mengakses portal' : 'Only registered users can access the portal'}
                  </p>
                </div>
                {onBackToPublic && (
                  <button
                    type="button"
                    onClick={onBackToPublic}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition"
                  >
                    {isId ? '← Beranda' : '← Home'}
                  </button>
                )}
              </div>

              {/* Success Notification */}
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">
                    {successMessage}
                  </div>
                </div>
              )}

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">
                    {errorMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isId ? 'Email atau Username Terdaftar' : 'Registered Email or Username'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder={isId ? 'Contoh: elvandri.me atau elvandri.me@monitoring.org' : 'e.g. elvandri.me or elvandri.me@monitoring.org'}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      {isId ? 'Kata Sandi' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenForgotPassword}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
                    >
                      {isId ? 'Lupa kata sandi?' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 transition hover:translate-y-[-1px] cursor-pointer"
                >
                  <span>{isId ? 'Masuk ke Dashboard' : 'Sign in to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Registered Users Reference Accordion for testing */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAccountsGuide(!showAccountsGuide)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-blue-600 py-1 transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    {isId ? 'Daftar Akun Pengguna Terdaftar (Referensi)' : 'Registered User Accounts (Reference)'}
                  </span>
                  {showAccountsGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAccountsGuide && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 max-h-56 overflow-y-auto">
                    <p className="text-[11px] text-slate-500 italic">
                      {isId 
                        ? 'Gunakan salah satu email/username di bawah untuk login atau menguji reset sandi via email:' 
                        : 'Use any email/username below to log in or test email-based reset: '}
                    </p>
                    <div className="space-y-1.5 divide-y divide-slate-200/60">
                      {users.map(u => {
                        const isAll = u.assignedProjectIds?.includes('all');
                        const projectNames = isAll 
                          ? (isId ? 'Semua Proyek' : 'All Projects') 
                          : (u.assignedProjectIds || []).map(pId => projects.find(p => p.id === pId)?.code || pId).join(', ');

                        return (
                          <div key={u.id} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2 text-[11px]">
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <span>{u.fullName}</span>
                                <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-medium">
                                  {u.role}
                                </span>
                              </div>
                              <div className="text-slate-500 font-mono text-[10px]">
                                {u.email} ({u.username})
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                <FolderKanban className="w-2.5 h-2.5 text-slate-500" />
                                {projectNames}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW 2: FORGOT & RESET PASSWORD VIA EMAIL */}
          {viewState === 'forgot-password' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isId ? 'Kembali ke Login' : 'Back to Login'}</span>
                </button>
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <KeyRound className="w-3 h-3" />
                  <span>{isId ? `Langkah ${resetStep} dari 3` : `Step ${resetStep} of 3`}</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isId ? 'Kirim Reset Sandi ke Email' : 'Reset Password via Email'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {resetStep === 1 && (isId ? 'Masukkan email terdaftar untuk menerima tautan dan kode verifikasi reset kata sandi' : 'Enter your registered email to receive reset link and verification code')}
                  {resetStep === 2 && (isId ? 'Periksa email Anda dan masukkan kode 6-digit verifikasi' : 'Check your inbox and enter the 6-digit verification code')}
                  {resetStep === 3 && (isId ? 'Buat kata sandi baru untuk akun Anda' : 'Set a new secure password for your account')}
                </p>
              </div>

              {/* Error Message */}
              {resetError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">
                    {resetError}
                  </div>
                </div>
              )}

              {/* Success Final state */}
              {resetSuccess && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-emerald-950 text-sm">
                    {isId ? 'Kata Sandi Berhasil Direset!' : 'Password Reset Successfully!'}
                  </h3>
                  <p className="text-xs text-emerald-700">
                    {isId ? 'Kata sandi baru telah disimpan. Mengalihkan ke halaman masuk...' : 'New password saved. Redirecting to login...'}
                  </p>
                </div>
              )}

              {/* STEP 1: Input Email / Username to Send Reset Email */}
              {!resetSuccess && resetStep === 1 && (
                <form onSubmit={handleSendResetEmail} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {isId ? 'Alamat Email atau Username Terdaftar' : 'Registered Email Address or Username'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={resetIdentifier}
                        onChange={(e) => {
                          setResetIdentifier(e.target.value);
                          if (resetError) setResetError('');
                        }}
                        placeholder={isId ? 'Contoh: elvandri.me@monitoring.org' : 'e.g. elvandri.me@monitoring.org'}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                    <div className="mt-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
                      <Send className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        {isId 
                          ? 'Sistem akan mengirimkan instruksi dan kode verifikasi reset 6-digit langsung ke alamat email terdaftar akun tersebut.' 
                          : 'System will dispatch instructions and a 6-digit verification code directly to the registered email.'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 transition hover:translate-y-[-1px] cursor-pointer"
                  >
                    {isSendingEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isId ? 'Mengirim Email...' : 'Sending Email...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isId ? 'Kirim Tautan & Kode Reset ke Email' : 'Send Reset Link & Code to Email'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Email Sent Notification & OTP Verification */}
              {!resetSuccess && resetStep === 2 && verifiedUser && (
                <div className="space-y-4 text-sm">
                  {/* Email Sent Notice Card */}
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isId ? 'Email Reset Telah Dikirim!' : 'Reset Email Dispatched!'}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {isId ? (
                        <>Kami telah mengirim kode verifikasi reset sandi ke <strong className="font-semibold text-emerald-950">{verifiedUser.email}</strong> pada pukul {emailSentTimestamp}.</>
                      ) : (
                        <>We have sent a verification code to <strong className="font-semibold text-emerald-950">{verifiedUser.email}</strong> at {emailSentTimestamp}.</>
                      )}
                    </p>
                  </div>

                  {/* Simulated Email Inbox Preview Widget */}
                  <div className="border border-blue-200 bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-xl p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-blue-200/70 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <Inbox className="w-4 h-4 text-blue-600" />
                        <span>{isId ? 'Kotak Masuk Email (Simulasi Pengiriman)' : 'Email Inbox (Simulated Dispatch)'}</span>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                        {emailSentTimestamp}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                      <div className="text-[11px] text-slate-500 font-medium">
                        <span className="font-semibold text-slate-700">Kepada:</span> {verifiedUser.fullName} &lt;{verifiedUser.email}&gt;
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        <span className="font-semibold text-slate-700">Subjek:</span> [SIMEV M&E] Permintaan Reset Kata Sandi Akun
                      </div>
                      <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-700 leading-relaxed">
                        <p className="mb-1.5">Halo <strong>{verifiedUser.fullName}</strong>,</p>
                        <p className="mb-2 text-slate-600">
                          {isId 
                            ? 'Kami menerima permintaan untuk mereset kata sandi akun M&E Anda. Gunakan kode 6-digit berikut:'
                            : 'We received a request to reset your M&E account password. Use the 6-digit code below:'}
                        </p>
                        
                        {/* OTP Display in Email */}
                        <div className="flex items-center justify-between bg-slate-100 border border-slate-300/80 px-3 py-2 rounded-lg font-mono my-2">
                          <span className="text-base font-black tracking-widest text-blue-700">{generatedOtp}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(generatedOtp)}
                            className="text-[10px] text-slate-600 hover:text-blue-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 transition"
                          >
                            {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCode ? (isId ? 'Tersalin' : 'Copied') : (isId ? 'Salin Kode' : 'Copy')}</span>
                          </button>
                        </div>

                        {/* Direct 1-Click Verification Action inside email */}
                        <button
                          type="button"
                          onClick={handleDirectLinkVerification}
                          className="w-full mt-1.5 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{isId ? '⚡ Buka Tautan Reset Langsung (1-Klik)' : '⚡ Open Direct Reset Link (1-Click)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* OTP Input Form */}
                  <form onSubmit={handleVerifyOtp} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {isId ? 'Masukkan 6-Digit Kode Verifikasi' : 'Enter 6-Digit Verification Code'}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={enteredOtp}
                        onChange={(e) => {
                          setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''));
                          if (resetError) setResetError('');
                        }}
                        placeholder="Contoh: 849201"
                        className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {isId ? 'Tidak menerima email?' : 'Didn\'t get the email?'}
                      </span>
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={resendCountdown > 0 || isSendingEmail}
                        className={`font-semibold flex items-center gap-1 ${
                          resendCountdown > 0 
                            ? 'text-slate-400 cursor-not-allowed' 
                            : 'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer'
                        }`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isSendingEmail ? 'animate-spin' : ''}`} />
                        <span>
                          {resendCountdown > 0 
                            ? `${isId ? 'Kirim ulang dalam' : 'Resend in'} ${resendCountdown}s` 
                            : (isId ? 'Kirim Ulang Email' : 'Resend Email')}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setResetStep(1)}
                        className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                      >
                        {isId ? 'Ganti Email' : 'Change Email'}
                      </button>
                      <button
                        type="submit"
                        className="flex-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 transition hover:translate-y-[-1px] cursor-pointer"
                      >
                        <span>{isId ? 'Verifikasi Kode' : 'Verify Code'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: Set New Password after verification */}
              {!resetSuccess && resetStep === 3 && verifiedUser && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4 text-sm animate-in fade-in duration-200">
                  {/* Verified User Summary Card */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-3">
                    {verifiedUser.avatarUrl ? (
                      <img 
                        src={verifiedUser.avatarUrl} 
                        alt={verifiedUser.fullName} 
                        className="w-10 h-10 rounded-lg object-cover border border-blue-200 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {verifiedUser.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {verifiedUser.fullName}
                        </span>
                        <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-semibold">
                          {verifiedUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {verifiedUser.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {isId ? 'Kata Sandi Baru (Min. 6 Karakter)' : 'New Password (Min. 6 Characters)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (resetError) setResetError('');
                        }}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {isId ? 'Ulangi Kata Sandi Baru' : 'Confirm New Password'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (resetError) setResetError('');
                        }}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setResetStep(2)}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                    >
                      {isId ? 'Kembali' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/30 flex items-center justify-center gap-2 transition hover:translate-y-[-1px] cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isId ? 'Simpan Kata Sandi Baru' : 'Save New Password'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Feature Highlights */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {isId ? 'Anti Double-Counting' : 'Zero Double-Counting'}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {isId ? 'Disagregasi GESI & IPLC' : 'GESI & IPLC Disaggregation'}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} {isId ? 'Sistem Informasi Monitoring dan Evaluasi Proyek' : 'Project Monitoring & Evaluation Information System'}
        </div>
      </div>
    </div>
  );
}
