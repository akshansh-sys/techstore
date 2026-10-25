import React from 'react';
import { Store, ArrowLeft, ShoppingCart, HelpCircle, Phone, Mail } from 'lucide-react';
import { getShopProfile } from '../services/dataService';

export default function NotFound({ onNavigate }) {
  const shop = getShopProfile();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full border border-slate-200 shadow-xl space-y-6">
        {/* Visual 404 Illustration */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
            <Store className="w-12 h-12 stroke-[1.5]" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-rose-600 text-white font-extrabold text-xs rounded-full shadow-md">
            404
          </span>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Oops! The section you are trying to visit does not exist or may have been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open Billing Counter</span>
          </button>
        </div>

        {/* Help & Support Clickable Contact */}
        <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need assistance with your store POS?</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {shop.phone && (
              <a
                href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{shop.phone}</span>
              </a>
            )}
            <a
              href="mailto:support@techstore.in"
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>support@techstore.in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
