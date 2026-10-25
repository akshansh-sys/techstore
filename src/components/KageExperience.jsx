import React, { useEffect } from 'react';
import { Store, ArrowLeft, ShoppingCart, LayoutDashboard, Sparkles, Compass } from 'lucide-react';
import Scene from './KageScene';

export default function KageExperience({ onBack, onNavigate }) {
  // Return to previous view on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onBack ? onBack() : onNavigate('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, onNavigate]);

  return (
    <div className="fixed inset-0 z-40 bg-black text-white flex flex-col overflow-hidden select-none">
      {/* Floating Agency HUD / Overlay Header */}
      <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none flex items-center justify-between gap-4">
        {/* Left Branding Pill */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-2xl transition">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-red-600/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs tracking-tight text-white">TechStore</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-amber-300 border border-white/10 font-bold">
                Kage 3D World
              </span>
            </div>
            <p className="text-[10px] text-white/60 hidden sm:block">
              Authored ThreeUI & Three.js Temple Experience
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Quick Billing */}
          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 font-medium text-xs rounded-xl backdrop-blur-md border border-white/10 transition shadow-lg"
            title="Open Billing Counter"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open POS Counter</span>
          </button>

          {/* Back to Dashboard */}
          <button
            type="button"
            onClick={onBack ? onBack : () => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition border border-white/10"
            title="Return to Store Management (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store</span>
            <span className="hidden md:inline text-[10px] font-mono opacity-70 bg-black/30 px-1 py-0.2 rounded">
              Esc
            </span>
          </button>
        </div>
      </div>

      {/* Main Kage Three.js Scene */}
      <div className="flex-1 w-full h-full relative">
        <Scene />
      </div>
    </div>
  );
}
