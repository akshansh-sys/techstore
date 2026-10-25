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
} from 'lucide-react';
import {
  loginWithEmail,
  registerWithEmail,
  verifySignUpOtp,
  resendSignUpOtp,
} from '../services/supabaseClient';

export default function LoginPage({ onLoginSuccess }) {
  // Mode: 'login' | 'register' | 'otp'
  const [authMode, setAuthMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
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
      await registerWithEmail(email, password, shopName);
      setSuccessMsg(`Verification code sent to ${email.trim()}! Please check your email inbox.`);
      setAuthMode('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtpCode('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initiate account creation.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Code Submit
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifySignUpOtp(email, otpCode, shopName);
      setSuccessMsg('Email verified successfully! Opening dashboard...');
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
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
      await resendSignUpOtp(email);
      setSuccessMsg(`A new 6-digit code has been sent to ${email}!`);
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center items-center p-4 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Subtle ambient lighting meshes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-gradient-to-b from-emerald-100/60 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tl from-teal-100/40 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        {/* Brand Header: TechStore */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 ring-4 ring-emerald-50 mb-3 group hover:scale-105 transition-transform duration-300">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">TechStore</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Next-Gen Retail & Kirana Store Management System
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 backdrop-blur-xs">
          {/* Top Switcher: Owner Login vs Create Account */}
          {authMode !== 'otp' && (
            <div className="flex bg-slate-100/80 p-1 rounded-xl mb-6 border border-slate-200/50">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
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
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                  authMode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Owner Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@techstore.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ==================================================== */}
          {/* VIEW 2: ACCOUNT REGISTRATION FORM */}
          {/* ==================================================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Shop Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store / Shop Name
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Sharma General Store"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Owner Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@techstore.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters</p>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Creating Account...</span>
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
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Verify Your Email</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the 6-digit verification code sent to:
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="font-semibold text-slate-800 text-xs font-mono">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                    }}
                    title="Change email"
                    className="text-emerald-600 hover:text-emerald-800 p-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Verification Code Form */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                    Enter 6-Digit Code
                  </label>
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
                    placeholder="••••••"
                    className="w-full text-center text-2xl font-mono tracking-[0.4em] font-extrabold py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Submit Verification Button */}
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg flex items-center justify-center gap-2"
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
              <div className="flex flex-col items-center gap-3 pt-2 text-xs">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Didn't receive code? Resend Code</span>
                  </button>
                ) : (
                  <span className="text-slate-400">
                    Resend code in <strong className="text-slate-600 font-mono">{resendTimer}s</strong>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 pt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clean Footer Note */}
        <p className="text-center text-xs text-slate-400 mt-4">
          TechStore • Retail & Kirana Store Management System
        </p>
      </div>
    </div>
  );
}
