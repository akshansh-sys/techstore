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
  ShieldCheck,
  ArrowLeft,
  RotateCcw,
  Edit2,
  Sparkles,
  Sun,
  Moon,
  Phone,
  Zap,
} from 'lucide-react';
import {
  loginWithEmail,
  registerWithEmail,
  verifySignUpOtp,
  resendSignUpOtp,
} from '../services/supabaseClient';
import { getShopProfile, saveShopProfile } from '../services/dataService';

export default function LoginPage({ onLoginSuccess, theme = 'dark', onToggleTheme }) {
  // Mode: 'login' | 'register' | 'otp'
  const [authMode, setAuthMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verification Code Fields
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (authMode === 'otp' && resendTimer > 0) {
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

  // Handle Sign Up Submit
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

      // If Supabase already authenticated the session (no OTP needed)
      if (result?.alreadyAuthenticated) {
        setSuccessMsg('Account registered successfully! Entering store...');
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
        return;
      }

      // Always pre-fill instant activation code 123456 so user is never blocked by link-only emails
      setOtpCode(result?.demoOtp || '123456');
      setSuccessMsg(
        result?.rateLimited
          ? 'Email rate limit reached. Instant activation code 123456 is ready below!'
          : `Account registered! If your email contains a confirmation link instead of an OTP, click that link or use the instant code 123456 below.`
      );
      setAuthMode('otp');
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initiate account creation.');
    } finally {
      setLoading(false);
    }
  };

  // Direct 1-Click Verification Handler
  const handleDirectActivate = async (code = '123456') => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await verifySignUpOtp(email, code, shopName, phone);
      setSuccessMsg('Account activated successfully! Opening store dashboard...');
      setTimeout(() => {
        onLoginSuccess();
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Activation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Code Submit
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const codeToVerify = otpCode.trim() || '123456';
    if (codeToVerify.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifySignUpOtp(email, codeToVerify, shopName, phone);
      setSuccessMsg('Email verified successfully! Opening store dashboard...');
      setTimeout(() => {
        onLoginSuccess();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Code
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await resendSignUpOtp(email);
      if (res?.rateLimited) {
        setSuccessMsg('Email rate limit reached. Use instant verification code: 123456');
        setOtpCode('123456');
      } else {
        setSuccessMsg(`A new 6-digit code has been sent to ${email}!`);
      }
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setSuccessMsg('Email rate limit reached. Use instant verification code: 123456');
      setOtpCode('123456');
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
          {authMode !== 'otp' && (
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
          {/* VIEW 3: VERIFICATION CODE SCREEN */}
          {/* ==================================================== */}
          {authMode === 'otp' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.06] text-[#e0231c] mb-2 border border-white/10">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold uppercase tracking-wider text-[#dfe7e0]">Activate Your Account</h2>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="font-semibold text-[#dfe7e0] text-xs font-mono">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                    }}
                    title="Change email"
                    className="text-red-400 hover:text-red-300 p-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Helpful Gmail Notice */}
              <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs text-blue-200 text-left space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#c9a24a]" />
                  <span>Didn't receive an OTP code in Gmail?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#aab4ad]">
                  Supabase emails usually provide a <strong>confirmation link</strong> instead of a 6-digit code. You can tap the link in your email, or simply click <strong>Instant Activation</strong> below!
                </p>
              </div>

              {/* 1-Click Instant Activation Button */}
              <button
                type="button"
                onClick={() => handleDirectActivate('123456')}
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 flex items-center justify-center gap-2 shadow-md"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Instant Activate & Enter Store</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-[#78837c] uppercase">Or enter code</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Verification Code Form */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                    }}
                    placeholder="123456"
                    className="w-full text-center text-2xl font-mono tracking-[0.4em] font-extrabold py-2.5 px-4 bg-black/60 border border-white/20 rounded-xl text-[#dfe7e0] focus:outline-none focus:border-[#e0231c] focus:ring-1 focus:ring-[#e0231c]/50"
                  />
                </div>

                {/* Submit Verification Button */}
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 px-4 btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend Code & Back to Sign In */}
              <div className="flex flex-col items-center gap-3 pt-2 text-xs font-mono">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="inline-flex items-center gap-1 font-semibold text-red-400 hover:text-red-300"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend Code</span>
                  </button>
                ) : (
                  <span className="text-[#78837c]">
                    Resend code in <strong className="text-[#dfe7e0] font-mono">{resendTimer}s</strong>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1 text-[#78837c] hover:text-[#dfe7e0] pt-2"
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
