import React, { useState, useEffect } from 'react';
import {
  Store,
  Trash2,
  Clock,
  LogOut,
  Mail,
  Phone,
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
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Clickable Store Brand & Logo (Navigates to Dashboard) */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none group rounded-xl p-1 -ml-1 transition hover:bg-slate-50"
          title="Go to Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-200 transition shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate max-w-[170px] sm:max-w-xs md:max-w-sm">
              {storeDisplayName}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xs">
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
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition"
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
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs text-slate-700 transition"
              title={`Send Email to: ${currentUser.email}`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium max-w-[130px] truncate">{currentUser.email}</span>
            </a>
          )}

          {/* Live Date / Time in Asia/Kolkata */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono font-medium">{timeString || 'IST'}</span>
          </div>

          {/* Reset / Clear Data Button */}
          <button
            type="button"
            onClick={onClearData}
            title="Reset store data"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition shadow-2xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
