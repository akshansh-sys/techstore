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

  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      subtitle: 'Overview & Analytics',
      icon: LayoutDashboard,
      shortcut: '1',
    },
    {
      id: 'products',
      name: 'Products',
      subtitle: 'Manage Stock & Pricing',
      icon: Package,
      shortcut: '2',
    },
    {
      id: 'billing',
      name: 'Billing',
      subtitle: 'Point of Sale & Invoices',
      icon: ShoppingCart,
      shortcut: '3',
    },
    {
      id: 'udhaar',
      name: 'Customer Udhaar',
      subtitle: 'Credit & Khata Records',
      icon: Users,
      shortcut: '4',
    },
  ];

  return (
    <aside className="no-print hidden md:flex flex-col w-64 bg-[#05070a]/75 backdrop-blur-md border-r border-white/10 shrink-0 min-h-[calc(100vh-4.5rem)]">
      <div className="p-4 flex-1 space-y-3">
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e0231c]/25 via-red-950/30 to-transparent text-[#dfe7e0] border border-[#e0231c]/50 shadow-[0_0_15px_rgba(224,35,28,0.15)] font-semibold'
                    : 'text-[#aab4ad] hover:bg-white/[0.04] hover:text-[#dfe7e0] border border-transparent active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#e0231c] text-white shadow-md shadow-red-950/60'
                        : 'bg-white/[0.05] text-[#78837c] group-hover:text-[#dfe7e0] group-hover:bg-white/[0.08]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="leading-tight truncate text-[#dfe7e0] text-xs font-semibold">{item.name}</div>
                    <div className={`text-[10px] truncate mt-0.5 font-mono ${isActive ? 'text-red-300' : 'text-[#78837c]'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                    isActive
                      ? 'bg-[#e0231c]/20 text-red-200 border-[#e0231c]/40'
                      : 'bg-black/30 text-[#78837c] border-white/10 group-hover:border-white/20'
                  }`}
                >
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Support & Security Card */}
      <div className="p-3.5 m-3.5 border border-white/10 rounded-xl bg-black/40 text-xs text-[#aab4ad] space-y-2 backdrop-blur-sm shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-[#dfe7e0] text-[11px] tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c9a24a]" />
            <span>Encrypted POS Terminal</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#e0231c] animate-pulse" title="System Online"></span>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
          {shop.phone && (
            <a
              href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
              className="flex items-center gap-1.5 text-[#78837c] hover:text-[#dfe7e0] transition"
              title="Call store phone"
            >
              <Phone className="w-3 h-3 text-[#c9a24a] shrink-0" />
              <span className="font-mono">{shop.phone}</span>
            </a>
          )}
          <a
            href="mailto:support@techstore.in"
            className="flex items-center gap-1.5 text-[#78837c] hover:text-[#dfe7e0] transition"
            title="Email store support"
          >
            <Mail className="w-3 h-3 text-[#e0231c] shrink-0" />
            <span className="font-mono truncate">support@techstore.in</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
