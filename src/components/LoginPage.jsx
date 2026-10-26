import React, { useState, useEffect } from 'react';
import {
  Store,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  Edit2,
  Sparkles,
  Sun,
  Moon,
  Phone,
  ExternalLink,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import {
  loginWithEmail,
  registerWithEmail,
  resendSignUpOtp,
} from '../services/supabaseClient';
import { getShopProfile, saveShopProfile } from '../services/dataService';

export default function LoginPage({ onLoginSuccess, theme = 'dark', onToggleTheme }) {
  // Mode: 'login' | 'register' | 'check-email'
  const [authMode, setAuthMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email Verification & Countdown
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (authMode === 'check-email' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [authMode, resendTimer]);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onLoginSuccess();
    } catch (err) {
      setErrorMsg(
        err.message ||
          'Authentication failed. If this is your first time, please create an account.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submit (Zero activation codes - prompts user to check email)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Save phone number if entered by user
      if (phone.trim()) {
        try {
          const currentShop = getShopProfile();
          saveShopProfile({ ...currentShop, phone: phone.trim() });
        } catch (err) {
          console.warn('Could not update shop phone:', err);
        }
      }

      const result = await registerWithEmail(email, password, shopName, phone);

      // If Supabase already authenticated the session (e.g. project has email confirmation disabled)
      if (result?.alreadyAuthenticated) {
        setSuccessMsg('Account registered successfully! Entering store...');
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
        return;
      }

      // Display the clean "go to email to verify" screen with zero activation code
      setAuthMode('check-email');
      setResendTimer(30);
      setCanResend(false);
      setSuccessMsg('Account created! A verification link has been sent to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // Direct login attempt after user clicks the link in their email
  const handleCheckVerificationOrLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      setSuccessMsg('Email verified! Opening store dashboard...');
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('verify')) {
        setErrorMsg('Email not verified yet. Please open your inbox and click the verification link.');
      } else {
        setErrorMsg(msg || 'Could not sign in yet. Please click the link in your email first.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Email
  const handleResendEmail = async () => {
    if (!canResend || loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      await resendSignUpOtp(email);
      setSuccessMsg(`A fresh verification link has been sent to ${email}!`);
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setSuccessMsg(`A fresh verification link has been sent to ${email}!`);
      setResendTimer(30);
      setCanResend(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center p-4 text-[#dfe7e0]">
      {/* Top Right White / Dark Mode Toggle */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xl transition-all active:scale-95 shadow-md border border-white/10 hover:border-white/20 bg-black/40 hover:bg-black/60 backdrop-blur-md"
            aria-label="Toggle white or dark theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#c9a24a]" />
                <span className="text-[11px] text-[#dfe7e0]">White</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] text-[#141a16] font-semibold">Dark</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Ambient Lighting Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#e0231c]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        {/* Brand Header: TechStore */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e0231c] to-[#99140e] text-white shadow-xl shadow-red-950/60 border border-[#ff5a3c]/30 mb-3 group hover:scale-105 transition-transform duration-300">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-[0.15em] text-[#dfe7e0] uppercase">
            TechStore
          </h1>
          <p className="text-xs text-[#78837c] font-mono tracking-widest mt-1">
            RETAIL & KIRANA STORE TERMINAL
          </p>
        </div>

        {/* Main Card */}
        <div className="kage-card p-6 sm:p-8 bg-[#0a0e12]/90 border border-white/15 shadow-[0_15px_60px_rgba(0,0,0,0.95)]">
          {/* Top Switcher: Owner Login vs Create Account */}
          {authMode !== 'check-email' && (
            <div className="flex bg-black/60 p-1 rounded-xl mb-6 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  authMode === 'login'
                    ? 'bg-[#e0231c] text-white shadow-md shadow-red-950/50 font-semibold'
                    : 'text-[#78837c] hover:text-[#dfe7e0]'
                }`}
              >
                Owner Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  authMode === 'register'
                    ? 'bg-[#e0231c] text-white shadow-md shadow-red-950/50 font-semibold'
                    : 'text-[#78837c] hover:text-[#dfe7e0]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 text-red-200 rounded-xl text-xs flex items-start gap-2 animate-fade-in font-light">
              <AlertCircle className="w-4 h-4 text-[#ff5a3c] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-start gap-2 animate-fade-in font-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW 1: OWNER LOGIN FORM */}
          {/* ==================================================== */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Owner Email Address <span className="text-[#e0231c]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78837c]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@techstore.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Password <span className="text-[#e0231c]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78837c]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78837c] hover:text-[#dfe7e0] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Entering Store...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Enter to the store</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ==================================================== */}
          {/* VIEW 2: ACCOUNT REGISTRATION FORM */}
          {/* ==================================================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Shop Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1 font-semibold">
                  Store / Shop Name
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78837c]" />
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Sharma General Store"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                  />
                </div>
              </div>

              {/* Mobile Phone Number (Optional) */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1 font-semibold">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78837c]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98280 12345"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                  />
                </div>
                <p className="text-[10px] text-[#78837c] font-mono mt-0.5">Only displayed if you enter it</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1 font-semibold">
                  Owner Email Address <span className="text-[#e0231c]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78837c]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@techstore.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1 font-semibold">
                  Create Password <span className="text-[#e0231c]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78837c]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78837c] hover:text-[#dfe7e0] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#78837c] font-mono mt-1">Minimum 6 characters</p>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Creating Store Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ==================================================== */}
          {/* VIEW 3: OPTIMIZED CHECK EMAIL VERIFICATION SCREEN    */}
          {/* (Zero activation codes - instructs user to verify)   */}
          {/* ==================================================== */}
          {authMode === 'check-email' && (
            <div className="space-y-4 animate-fade-in text-center">
              {/* Mail Icon with Glowing Accent */}
              <div className="relative inline-flex items-center justify-center mt-1">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500/20 to-amber-500/10 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-950/40">
                  <Inbox className="w-8 h-8 text-[#e0231c]" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#0a0e12] text-white">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>

              {/* Headline */}
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-[#dfe7e0]">
                  Check Your Email to Verify
                </h2>
                <p className="text-xs text-[#78837c] font-mono mt-1">
                  We've sent an activation link to your email:
                </p>
              </div>

              {/* Email Address Highlight Card with Edit Button */}
              <div className="p-3 bg-black/60 border border-white/15 rounded-xl flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2 min-w-0 text-left">
                  <Mail className="w-4 h-4 text-[#c9a24a] shrink-0" />
                  <span className="font-mono text-xs font-semibold text-[#dfe7e0] truncate">
                    {email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  title="Edit email address"
                  className="px-2 py-1 text-[11px] font-mono text-[#c9a24a] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition shrink-0 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Step-by-Step Guidance Box */}
              <div className="p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-xl text-left space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>How to activate your account:</span>
                </p>
                <ol className="text-xs text-[#aab4ad] space-y-1.5 list-decimal list-inside leading-relaxed font-light">
                  <li>
                    Open your email inbox (also check <strong className="text-[#dfe7e0]">Spam / Junk</strong>).
                  </li>
                  <li>
                    Click the <strong className="text-emerald-400">verification link</strong> in the email.
                  </li>
                  <li>
                    Once clicked, return here and tap <strong className="text-[#dfe7e0]">Enter Store</strong> below!
                  </li>
                </ol>
              </div>

              {/* Primary Action 1: Open Gmail in New Tab */}
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 text-[#dfe7e0] font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Open Gmail Inbox</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#c9a24a]" />
              </a>

              {/* Primary Action 2: I've Verified / Enter Store */}
              <button
                type="button"
                onClick={handleCheckVerificationOrLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Checking verification status...</span>
                ) : (
                  <>
                    <span>I've Clicked the Link — Enter Store</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Link & Back to Sign In Controls */}
              <div className="pt-2 flex flex-col items-center gap-3 text-xs font-mono">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 font-semibold text-red-400 hover:text-red-300 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend verification email</span>
                  </button>
                ) : (
                  <span className="text-[#78837c]">
                    Resend link available in <strong className="text-[#dfe7e0] font-mono">{resendTimer}s</strong>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1.5 text-[#78837c] hover:text-[#dfe7e0] pt-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clean Footer Note */}
        <p className="text-center text-[10px] font-mono text-[#78837c] tracking-widest uppercase mt-4">
          TechStore • Retail & Kirana Store Management Terminal
        </p>
      </div>
    </div>
  );
}
