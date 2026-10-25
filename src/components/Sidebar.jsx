import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Phone, Mail, ShieldCheck } from 'lucide-react';
import { getShopProfile } from '../services/dataService';

export default function Sidebar({ activeSection, onSelectSection }) {
  const shop = getShopProfile();

  // Exactly the 4 required sections - no unused navigation
  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Quick Stats',
    },
    {
      id: 'products',
      name: 'Products',
      icon: Package,
      description: 'Stock & Inventory',
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: ShoppingCart,
      description: 'Point of Sale & Invoices',
    },
    {
      id: 'udhaar',
      name: 'Customer Udhaar',
      icon: Users,
      description: 'Credit Ledger & Passbook',
    },
  ];

  return (
    <aside className="no-print hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Store Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition text-left ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <div>
                <div className="leading-tight">{item.name}</div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    isActive ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Clickable Support & Security Footer Links */}
      <div className="p-3 m-3 border border-slate-200 rounded-xl bg-slate-50/70 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local Store Data Active</span>
        </div>
        
        <div className="space-y-1.5 pt-1 border-t border-slate-200/80 text-[11px]">
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
