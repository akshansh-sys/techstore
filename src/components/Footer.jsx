import React, { useState } from 'react';
import { Phone, Mail, ShieldCheck, MapPin, Store, HelpCircle, X } from 'lucide-react';
import { getShopProfile } from '../services/dataService';

export default function Footer({ onNavigate, currentUser }) {
  const shop = getShopProfile();
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'help' | null

  const storeDisplayName =
    currentUser?.shopName && currentUser.shopName.trim()
      ? currentUser.shopName.trim()
      : shop.name || 'TechStore';

  return (
    <footer className="no-print bg-[#05070a]/95 backdrop-blur-md border-t border-white/10 mt-auto text-xs text-[#78837c] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Col 1: Store Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#dfe7e0] font-bold text-sm uppercase tracking-wider">
              <Store className="w-4 h-4 text-[#e0231c]" />
              <span>{storeDisplayName}</span>
            </div>
            <p className="text-[#aab4ad] text-xs leading-relaxed">
              {shop.tagline || 'Retail Terminal, Inventory Vault & Store Management System'}
            </p>
            {shop.address && (
              <p className="flex items-start gap-1.5 text-[#78837c] text-xs font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#78837c] shrink-0 mt-0.5" />
                <span>{shop.address}</span>
              </p>
            )}
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="font-mono font-bold text-[#dfe7e0] text-xs uppercase tracking-wider mb-2.5">
              Quick Navigation
            </h4>
            <ul className="space-y-1.5 text-xs font-mono font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-[#dfe7e0] transition text-left"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#dfe7e0] transition text-left"
                >
                  Products Inventory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('billing')}
                  className="hover:text-[#dfe7e0] transition text-left"
                >
                  Billing Counter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('udhaar')}
                  className="hover:text-[#dfe7e0] transition text-left"
                >
                  Customer Udhaar
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clickable Contacts */}
          <div>
            <h4 className="font-mono font-bold text-[#dfe7e0] text-xs uppercase tracking-wider mb-2.5">
              Direct Contact
            </h4>
            <ul className="space-y-2">
              {shop.phone && shop.phone.trim() && (
                <li>
                  <a
                    href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
                    className="flex items-center gap-1.5 text-[#aab4ad] hover:text-[#dfe7e0] transition font-medium"
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
                    className="flex items-center gap-1.5 text-[#aab4ad] hover:text-[#dfe7e0] transition truncate font-medium"
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
                  className="flex items-center gap-1.5 text-[#78837c] hover:text-[#dfe7e0] transition truncate font-mono text-xs font-medium"
                >
                  <Mail className="w-3.5 h-3.5 text-[#78837c] shrink-0" />
                  <span>support@techstore.in</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Data Security & Help */}
          <div>
            <h4 className="font-mono font-bold text-[#dfe7e0] text-xs uppercase tracking-wider mb-2.5">
              Data & Security
            </h4>
            <ul className="space-y-1.5 text-xs font-mono font-medium">
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
                  <span>Store POS Guide</span>
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
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#78837c] text-xs font-mono">
          <p className="font-medium">© {new Date().getFullYear()} {storeDisplayName} • Retail Terminal</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0231c] animate-pulse"></span>
              Secure Offline Engine
            </span>
            <span className="font-medium">Asia/Kolkata (IST)</span>
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
                <span>Offline Storage Policy</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#aab4ad] leading-relaxed font-mono">
              <p>• All business inventory, invoices, and customer credit ledgers are persisted in your local browser sandbox.</p>
              <p>• Data never leaves your machine unless you configure Supabase credentials for multi-device sync.</p>
              <p>• You can export or clear records at any time using the Reset option in the top header.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2.5 btn-vermilion rounded-xl text-xs font-bold uppercase tracking-wider transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Store POS Guide Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/15 animate-scale-up text-[#dfe7e0]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#dfe7e0] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#c9a24a]" />
                <span>Store POS Guide & Shortcuts</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#aab4ad] leading-relaxed">
              <p>• <strong className="text-[#dfe7e0]">Shortcuts:</strong> Press <code className="bg-white/10 px-1 py-0.5 rounded text-white">[1]</code> Dashboard, <code className="bg-white/10 px-1 py-0.5 rounded text-white">[2]</code> Products, <code className="bg-white/10 px-1 py-0.5 rounded text-white">[3]</code> Billing, <code className="bg-white/10 px-1 py-0.5 rounded text-white">[4]</code> Udhaar.</p>
              <p>• <strong className="text-[#dfe7e0]">Live Recommendations:</strong> In Billing, begin typing any product name for instant live suggestions.</p>
              <p>• <strong className="text-[#dfe7e0]">QR Code Payments:</strong> In Billing, select UPI to show your store's QR code directly on screen for customer scanning.</p>
              <p>• <strong className="text-[#dfe7e0]">Khata Auditing:</strong> View individual customer statements anytime in Customer Udhaar.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2.5 btn-vermilion rounded-xl text-xs font-bold uppercase tracking-wider transition"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
