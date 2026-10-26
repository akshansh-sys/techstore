import React, { useState, useEffect } from 'react';
import {
  Store,
  Trash2,
  Clock,
  LogOut,
  Mail,
  Phone,
  Sun,
  Moon,
} from 'lucide-react';
import { getShopProfile } from '../services/dataService';

export default function Header({
  onClearData,
  currentUser,
  onLogout,
  onNavigate,
  activeSection = 'dashboard',
  theme = 'dark',
  onToggleTheme,
}) {
  const shop = getShopProfile();
  const [timeString, setTimeString] = useState('');

  // Determine store name (from user account or saved shop profile)
  const storeDisplayName =
    currentUser?.shopName && currentUser.shopName.trim()
      ? currentUser.shopName.trim()
      : shop.name || 'Apna General Store';

  // Live Asia/Kolkata clock
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
    <header className="no-print bg-[#05070a]/85 backdrop-blur-md border-b border-[rgba(223,231,224,0.1)] sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Kage Shrine Seal & Clickable Store Brand */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-none group rounded-xl p-1.5 -ml-1 transition hover:bg-white/[0.04] active:scale-[0.99]"
          title="Go to Dashboard Overview"
        >
          {/* Vermilion Shrine Seal Mark */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e0231c] to-[#99140e] flex items-center justify-center text-white shadow-lg shadow-red-950/50 border border-[#ff5a3c]/30 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#dfe7e0] tracking-wider uppercase leading-tight truncate max-w-[150px] sm:max-w-xs">
                {storeDisplayName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest bg-red-950/40 text-red-300 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e0231c] animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>
            <p className="text-[10px] text-[#78837c] font-mono tracking-widest hidden sm:block truncate max-w-xs mt-0.5">
              {shop.tagline || 'RETAIL POS TERMINAL'}
            </p>
          </div>
        </button>

        {/* Right: Contacts, Live Time & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Clickable Store Phone */}
          {shop.phone && (
            <a
              href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
              className="hidden lg:flex items-center gap-1.5 text-xs text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.03] hover:bg-white/[0.08] px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors"
              title={`Call Store: ${shop.phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-[#c9a24a]" />
              <span className="font-mono text-[11px]">{shop.phone}</span>
            </a>
          )}

          {/* Clickable Owner Email */}
          {currentUser?.email && (
            <a
              href={`mailto:${currentUser.email}`}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] text-[#aab4ad] hover:text-[#dfe7e0] border border-white/10 rounded-lg text-xs transition-colors"
              title={`Send Email to: ${currentUser.email}`}
            >
              <Mail className="w-3.5 h-3.5 text-[#e0231c] shrink-0" />
              <span className="font-mono text-[11px] max-w-[120px] truncate">{currentUser.email}</span>
            </a>
          )}

          {/* Live IST Time */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#aab4ad] bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#78837c] shrink-0" />
            <span className="font-mono text-[11px] tracking-tight">{timeString || 'IST'}</span>
          </div>

          {/* White / Dark Mode Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg transition-all active:scale-95 shadow-sm border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08]"
              aria-label="Toggle white or dark theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#c9a24a]" />
                  <span className="hidden sm:inline text-[11px] text-[#dfe7e0]">White</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline text-[11px] text-[#141a16] font-semibold">Dark</span>
                </>
              )}
            </button>
          )}

          {/* Reset / Clear Data Button */}
          <button
            type="button"
            onClick={onClearData}
            title="Reset store records"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-[#78837c] hover:text-red-400 bg-white/[0.02] hover:bg-red-950/20 border border-white/10 hover:border-red-900/40 rounded-lg transition-colors active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Reset</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Sign out of store"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#dfe7e0] bg-white/[0.06] hover:bg-red-950/30 hover:text-red-300 border border-white/10 hover:border-red-500/30 rounded-lg transition-all active:scale-95 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-[#e0231c]" />
            <span className="text-[11px]">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
