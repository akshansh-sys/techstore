import React from 'react';
import { Store, ArrowLeft, ShoppingCart, HelpCircle, Phone, Mail } from 'lucide-react';
import { getShopProfile } from '../services/dataService';

export default function NotFound({ onNavigate }) {
  const shop = getShopProfile();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in text-[#dfe7e0]">
      <div className="kage-card p-8 sm:p-12 max-w-lg w-full border border-white/15 shadow-[0_15px_60px_rgba(0,0,0,0.9)] space-y-6 animate-scale-up">
        {/* Visual 404 Seal */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-white/[0.04] text-[#e0231c] flex items-center justify-center mx-auto border border-white/10 shadow-inner">
            <Store className="w-12 h-12 stroke-[1.5]" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-[#e0231c] text-white font-mono font-bold text-xs rounded-full shadow-lg">
            404
          </span>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#dfe7e0]">
            Pavilion Not Found
          </h2>
          <p className="text-xs text-[#aab4ad] max-w-sm mx-auto leading-relaxed font-light">
            The sanctuary pavilion you are trying to visit does not exist or may have been relocated.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 btn-vermilion font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sanctuary</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/[0.06] hover:bg-white/[0.12] text-[#dfe7e0] font-mono text-xs uppercase tracking-wider rounded-xl border border-white/10 transition"
          >
            <ShoppingCart className="w-4 h-4 text-[#c9a24a]" />
            <span>Open POS Counter</span>
          </button>
        </div>

        {/* Help & Support Clickable Contact */}
        <div className="pt-6 border-t border-white/10 text-xs text-[#78837c] space-y-2 font-mono">
          <div className="flex items-center justify-center gap-1.5 text-[#78837c]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need assistance with your store POS?</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {shop.phone && (
              <a
                href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
                className="inline-flex items-center gap-1 text-[#c9a24a] hover:text-[#dfe7e0] transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{shop.phone}</span>
              </a>
            )}
            <a
              href="mailto:support@techstore.in"
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition"
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
