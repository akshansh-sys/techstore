import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { getShopProfile } from '../services/dataService';

export default function Sidebar({ activeSection, onSelectSection }) {
  const shop = getShopProfile();

  // Exactly the 4 required sections with numeric shortcut hints
  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Live Stats & Overview',
      shortcut: '1',
    },
    {
      id: 'products',
      name: 'Products',
      icon: Package,
      description: 'Inventory & Stock Alert',
      shortcut: '2',
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: ShoppingCart,
      description: 'Point of Sale & Invoices',
      shortcut: '3',
    },
    {
      id: 'udhaar',
      name: 'Customer Udhaar',
      icon: Users,
      description: 'Credit Ledger & Passbook',
      shortcut: '4',
    },
  ];

  return (
    <aside className="no-print hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-2">
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Navigation</span>
          <span className="text-[9px] font-normal text-slate-400">Shortcuts</span>
        </div>

        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-150 group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-700/25 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="leading-tight truncate">{item.name}</div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-emerald-100 font-normal' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white border-white/20'
                      : 'bg-slate-50 text-slate-400 border-slate-200/80 group-hover:border-slate-300'
                  }`}
                >
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Clickable Support & Security Footer Card */}
      <div className="p-3 m-3.5 border border-slate-200/80 rounded-xl bg-slate-50/60 text-xs text-slate-600 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Store POS Terminal</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Terminal Online"></span>
        </div>

        <div className="space-y-1.5 pt-1.5 border-t border-slate-200/70 text-[11px]">
          {shop.phone && (
            <a
              href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
              className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 transition"
              title="Call store phone"
            >
              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="font-mono">{shop.phone}</span>
            </a>
          )}
          <a
            href="mailto:support@techstore.in"
            className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 transition"
            title="Email store support"
          >
            <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">support@techstore.in</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
