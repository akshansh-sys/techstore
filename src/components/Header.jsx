import React, { useState, useEffect } from 'react';
import {
  Store,
  Trash2,
  Clock,
  LogOut,
  Mail,
  Phone,
  Circle,
  Sparkles,
} from 'lucide-react';
import { getShopProfile } from '../services/dataService';

export default function Header({
  onClearData,
  currentUser,
  onLogout,
  onNavigate,
}) {
  const shop = getShopProfile();
  const [timeString, setTimeString] = useState('');

  // Determine store name (from user account or saved shop profile)
  const storeDisplayName =
    currentUser?.shopName && currentUser.shopName.trim()
      ? currentUser.shopName.trim()
      : shop.name || 'Apna General Store';

  // Keep a live clock in Asia/Kolkata time format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now);
      setTimeString(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Clickable Store Brand & Logo */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-none group rounded-xl p-1 -ml-1 transition hover:bg-slate-50/80 active:scale-[0.99]"
          title="Go to Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:shadow-md group-hover:shadow-emerald-600/30 transition-all duration-200 shrink-0">
            <Store className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate max-w-[160px] sm:max-w-xs md:max-w-sm">
                {storeDisplayName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xs mt-0.5">
              {shop.tagline || 'General Store & Daily Essentials'}
            </p>
          </div>
        </button>

        {/* Right: Contact Links, Live Time & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Clickable Store Phone */}
          {shop.phone && (
            <a
              href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:border-emerald-300 transition-colors duration-150"
              title={`Call Store: ${shop.phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono font-medium">{shop.phone}</span>
            </a>
          )}

          {/* Clickable Owner Email */}
          {currentUser?.email && (
            <a
              href={`mailto:${currentUser.email}`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50/80 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-300 rounded-lg text-xs text-slate-700 transition-colors duration-150"
              title={`Send Email to: ${currentUser.email}`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium max-w-[130px] truncate">{currentUser.email}</span>
            </a>
          )}

          {/* Live Date / Time in Asia/Kolkata */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-mono font-medium tracking-tight">{timeString || 'IST'}</span>
          </div>

          {/* 3D Temple Experience Button */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('experience')}
            title="Explore 3D Kage Temple Experience"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 rounded-lg transition-all shadow-2xs hover:shadow-xs active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">3D World</span>
          </button>

          {/* Reset / Clear Data Button */}
          <button
            type="button"
            onClick={onClearData}
            title="Reset store records"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 rounded-lg transition-colors active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Sign out of store"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
