import React, { useState } from 'react';
import { Phone, Mail, ShieldCheck, MapPin, Store, HelpCircle, X } from 'lucide-react';
import { getShopProfile } from '../services/dataService';

export default function Footer({ onNavigate, currentUser }) {
  const shop = getShopProfile();
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'help' | null

  const storeDisplayName =
    currentUser?.shopName && currentUser.shopName.trim()
      ? currentUser.shopName.trim()
      : shop.name || 'Apna General Store';

  return (
    <footer className="no-print bg-[#05070a]/90 backdrop-blur-md border-t border-white/10 mt-auto text-xs text-[#78837c] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Col 1: Store Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#dfe7e0] font-bold text-sm uppercase tracking-wider">
              <Store className="w-4 h-4 text-[#e0231c]" />
              <span>{storeDisplayName}</span>
            </div>
            <p className="text-[#aab4ad] text-[11px] leading-relaxed">
              {shop.tagline || 'Daily Essentials, Kirana & Retail POS Management Sanctuary'}
            </p>
            {shop.address && (
              <p className="flex items-start gap-1.5 text-[#78837c] text-[11px] font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#78837c] shrink-0 mt-0.5" />
                <span>{shop.address}</span>
              </p>
            )}
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="font-mono font-medium text-[#dfe7e0] text-[10px] uppercase tracking-[0.2em] mb-2.5">
              Store Pavilions
            </h4>
            <ul className="space-y-1.5 text-xs font-mono">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-[#dfe7e0] transition"
                >
                  Sanctuary Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#dfe7e0] transition"
                >
                  Inventory Vault
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('billing')}
                  className="hover:text-[#dfe7e0] transition"
                >
                  Billing Counter (POS)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('udhaar')}
                  className="hover:text-[#dfe7e0] transition"
                >
                  Customer Udhaar Ledger
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clickable Contacts */}
          <div>
            <h4 className="font-mono font-medium text-[#dfe7e0] text-[10px] uppercase tracking-[0.2em] mb-2.5">
              Direct Contact
            </h4>
            <ul className="space-y-2">
              {shop.phone && (
                <li>
                  <a
                    href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
                    className="flex items-center gap-1.5 text-[#aab4ad] hover:text-[#dfe7e0] transition"
                    title="Tap to call phone"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#c9a24a]" />
                    <span className="font-mono text-xs">{shop.phone}</span>
                  </a>
                </li>
              )}
              {currentUser?.email && (
                <li>
                  <a
                    href={`mailto:${currentUser.email}`}
                    className="flex items-center gap-1.5 text-[#aab4ad] hover:text-[#dfe7e0] transition truncate"
                    title="Tap to send email"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#e0231c] shrink-0" />
                    <span className="font-mono text-xs truncate">{currentUser.email}</span>
                  </a>
                </li>
              )}
              <li>
                <a
                  href="mailto:support@techstore.in"
                  className="flex items-center gap-1.5 text-[#78837c] hover:text-[#dfe7e0] transition truncate font-mono text-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-[#78837c] shrink-0" />
                  <span>support@techstore.in</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Data Security & Help */}
          <div>
            <h4 className="font-mono font-medium text-[#dfe7e0] text-[10px] uppercase tracking-[0.2em] mb-2.5">
              Data & Security
            </h4>
            <ul className="space-y-1.5 text-xs font-mono">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="flex items-center gap-1.5 text-[#aab4ad] hover:text-[#dfe7e0] transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c9a24a]" />
                  <span>Offline Storage Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('help')}
                  className="flex items-center gap-1.5 text-[#aab4ad] hover:text-[#dfe7e0] transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#78837c]" />
                  <span>Sanctuary POS Guide</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('notfound-demo')}
                  className="text-[#78837c] hover:text-[#aab4ad] transition"
                >
                  View 404 Page
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#78837c] text-[11px] font-mono">
          <p>© {new Date().getFullYear()} {storeDisplayName} • Kage 3D Temple POS</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0231c] animate-pulse"></span>
              Secure Offline Engine
            </span>
            <span>Asia/Kolkata (IST)</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/15 animate-scale-up text-[#dfe7e0]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#dfe7e0] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c9a24a]" />
                <span>Offline Data & Privacy Policy</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#aab4ad] space-y-2.5 leading-relaxed font-light">
              <p>
                <strong className="text-[#dfe7e0]">Local Sovereignty:</strong> Your items, sales records, customer directories, and udhaar balances reside securely in your browser's persistent client storage.
              </p>
              <p>
                <strong className="text-[#dfe7e0]">Zero External Tracking:</strong> No tracking telemetry or advertisements are embedded. Your commercial transactions remain strictly private.
              </p>
              <p>
                <strong className="text-[#dfe7e0]">Cloud Protection:</strong> When connected to Supabase, merchant authentication is guarded with standard Row-Level Security.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 btn-vermilion font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/15 animate-scale-up text-[#dfe7e0]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#dfe7e0] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#e0231c]" />
                <span>Sanctuary POS Guide</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#aab4ad] space-y-2 leading-relaxed font-light">
              <p>• <strong className="text-[#dfe7e0]">Products:</strong> Catalog items, purchase cost, selling price, and low-stock threshold triggers.</p>
              <p>• <strong className="text-[#dfe7e0]">Billing:</strong> Real-time search with recommendations, quick additions, and clean receipt printing.</p>
              <p>• <strong className="text-[#dfe7e0]">Udhaar:</strong> Record debits and cash/UPI repayments with an immutable passbook ledger.</p>
              <p>• <strong className="text-[#dfe7e0]">Phone Calling:</strong> Click any phone link to place an immediate phone call.</p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 btn-vermilion font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
