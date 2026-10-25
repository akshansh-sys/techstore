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
    <footer className="no-print bg-white border-t border-slate-200 mt-auto text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Col 1: Store Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>{storeDisplayName}</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {shop.tagline || 'Daily Essentials, Kirana & Retail Store POS Management'}
            </p>
            {shop.address && (
              <p className="flex items-start gap-1.5 text-slate-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{shop.address}</span>
              </p>
            )}
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
              Store Sections
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-emerald-700 transition"
                >
                  Dashboard Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-emerald-700 transition"
                >
                  Products & Stock
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('billing')}
                  className="hover:text-emerald-700 transition"
                >
                  Billing Counter (POS)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('udhaar')}
                  className="hover:text-emerald-700 transition"
                >
                  Customer Udhaar Ledger
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clickable Contacts */}
          <div>
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
              Direct Contact
            </h4>
            <ul className="space-y-2">
              {shop.phone && (
                <li>
                  <a
                    href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-medium transition"
                    title="Tap to call phone"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono">{shop.phone}</span>
                  </a>
                </li>
              )}
              {currentUser?.email && (
                <li>
                  <a
                    href={`mailto:${currentUser.email}`}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-medium transition truncate"
                    title="Tap to send email"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{currentUser.email}</span>
                  </a>
                </li>
              )}
              <li>
                <a
                  href="mailto:support@techstore.in"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 transition truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>support@techstore.in</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Data Security & Help */}
          <div>
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
              Data & Privacy
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Offline Storage Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('help')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kirana POS Help Guide</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('notfound-demo')}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  View 404 Error Page
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} {storeDisplayName} • All rights reserved</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Secure Offline POS
            </span>
            <span>Asia/Kolkata (IST)</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Offline Data & Privacy Policy</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <p>
                <strong>100% Local Control:</strong> Your products, completed bills, customer directory, and udhaar balances are saved directly within your browser's persistent storage.
              </p>
              <p>
                <strong>No Third-Party Tracking:</strong> No external trackers or advertisements are embedded. Your customer transactions remain strictly confidential to your store.
              </p>
              <p>
                <strong>Cloud Backups:</strong> When connected to Supabase, your owner credentials and authentication remain encrypted with industry standard Row-Level Security.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Kirana POS Quick Guide</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>• <strong>Products:</strong> Add items, purchase rate, selling price, and set low-stock thresholds.</p>
              <p>• <strong>Billing:</strong> Search product by name to see instant recommendations, add to cart, and print clean customer receipts.</p>
              <p>• <strong>Udhaar:</strong> Record debit purchases and partial cash/UPI repayments with an audit passbook.</p>
              <p>• <strong>Phone Links:</strong> Tap any phone number to place a direct phone call from your smartphone.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs"
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
