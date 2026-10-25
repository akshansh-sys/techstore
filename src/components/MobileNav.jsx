import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Sparkles } from 'lucide-react';

export default function MobileNav({ activeSection, onSelectSection }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'billing', name: 'Billing', icon: ShoppingCart },
    { id: 'udhaar', name: 'Udhaar', icon: Users },
    { id: 'experience', name: '3D World', icon: Sparkles },
  ];

  return (
    <nav
      className="no-print md:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-lg border border-slate-200/90 rounded-2xl z-40 px-2 py-1.5 shadow-[0_4px_20px_rgba(15,23,42,0.12)] transition-all"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-100/90 text-emerald-800 scale-105 shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-normal'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
