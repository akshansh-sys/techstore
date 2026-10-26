import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react';

export default function MobileNav({ activeSection, onSelectSection }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'billing', name: 'Billing', icon: ShoppingCart },
    { id: 'udhaar', name: 'Udhaar', icon: Users },
  ];

  return (
    <nav
      className="no-print md:hidden fixed bottom-3 left-3 right-3 bg-[#05070a]/90 backdrop-blur-xl border border-white/10 rounded-2xl z-40 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-all"
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
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-[#78837c] hover:text-[#dfe7e0]'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#e0231c] text-white shadow-lg shadow-red-950/60 scale-105'
                    : 'text-[#78837c] hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[10px] mt-1 font-mono tracking-wide ${isActive ? 'font-bold text-[#dfe7e0]' : 'text-[#78837c]'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
