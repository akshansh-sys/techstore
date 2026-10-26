import React from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  LayoutDashboard,
  ShoppingCart,
  Users,
  ArrowRight,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatRupees, formatDateTime } from '../utils/formatters';

export default function Dashboard({ stats, onNavigate, onViewBill, storeName }) {
  const {
    todaySales = 0,
    todayBillCount = 0,
    totalProducts = 0,
    lowStockCount = 0,
    lowStockProducts = [],
    recentBills = [],
    totalPendingUdhaar = 0,
    totalCustomers = 0,
  } = stats;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-[#dfe7e0]">
      {/* Top Sanctuary Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c0f14] via-[#140b0b] to-[#07090c] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        {/* Ambient Vermilion & Gold Lighting Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#e0231c]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-[#c9a24a]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#dfe7e0] uppercase">
              {storeName || 'TechStore Terminal'}
            </h2>
            <p className="text-[#aab4ad] text-xs sm:text-sm max-w-xl leading-relaxed font-light">
              Real-time snapshot of daily counter transactions, stock health, and customer credit balance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="self-start md:self-auto inline-flex items-center gap-2.5 px-6 py-3.5 btn-vermilion font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Counter</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Today's Total Sales */}
        <div className="kage-card p-5 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-[#78837c]">
              Today's Sales
            </span>
            <div className="p-2 rounded-xl bg-white/[0.05] text-[#c9a24a] group-hover:scale-105 transition-transform border border-white/5">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#c9a24a] font-mono tracking-tight drop-shadow-sm">
            {formatRupees(todaySales)}
          </div>
          <div className="text-xs text-[#aab4ad] mt-2.5 flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-600/30">
              {todayBillCount} {todayBillCount === 1 ? 'bill' : 'bills'}
            </span>
            <span className="text-[11px] text-[#78837c]">recorded today</span>
          </div>
        </div>

        {/* Card 2: Total Active Products */}
        <div className="kage-card p-5 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-[#78837c]">
              Products Catalog
            </span>
            <div className="p-2 rounded-xl bg-white/[0.05] text-[#dfe7e0] group-hover:scale-105 transition-transform border border-white/5">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#dfe7e0] font-mono tracking-tight">
            {totalProducts}
          </div>
          <div className="text-xs text-[#aab4ad] mt-2.5 flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-[#dfe7e0] bg-white/[0.06] px-2 py-0.5 rounded border border-white/10">
              Active Items
            </span>
            <span className="text-[11px] text-[#78837c]">cataloged</span>
          </div>
        </div>

        {/* Card 3: Low-Stock Warnings */}
        <div
          className={`kage-card p-5 transition-all duration-200 group ${
            lowStockCount > 0 ? 'border-[#e0231c]/40 bg-red-950/15' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-[#78837c]">
              Low Stock Alerts
            </span>
            <div
              className={`p-2 rounded-xl transition-transform group-hover:scale-105 border ${
                lowStockCount > 0
                  ? 'bg-red-950/60 text-[#ff5a3c] border-red-500/30'
                  : 'bg-white/[0.05] text-emerald-400 border-white/5'
              }`}
            >
              {lowStockCount > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
              lowStockCount > 0 ? 'text-[#ff5a3c]' : 'text-[#dfe7e0]'
            }`}
          >
            {lowStockCount}
          </div>
          <div className="text-xs mt-2.5">
            {lowStockCount > 0 ? (
              <span className="text-red-400 font-mono text-[10px] flex items-center gap-1">
                <span>Items need reordering soon</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-mono text-[10px]">All inventory healthy</span>
            )}
          </div>
        </div>

        {/* Card 4: Total Customer Udhaar */}
        <div className="kage-card p-5 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-[#78837c]">
              Customer Udhaar
            </span>
            <div className="p-2 rounded-xl bg-white/[0.05] text-amber-400 group-hover:scale-105 transition-transform border border-white/5">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#c9a24a] font-mono tracking-tight">
            {formatRupees(totalPendingUdhaar)}
          </div>
          <div className="text-xs text-[#aab4ad] mt-2.5 flex items-center gap-1">
            <span className="text-[11px] text-[#78837c]">Pending across</span>
            <span className="font-bold text-[#dfe7e0] font-mono text-[11px]">{totalCustomers}</span>
            <span className="text-[11px] text-[#78837c]">customers</span>
          </div>
        </div>
      </div>



      {/* Split Section: Recent Activity & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="kage-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/[0.05] text-[#c9a24a]">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#dfe7e0]">
                  Recent Completed Invoices
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('billing')}
                className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 transition"
              >
                <span>New Bill</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentBills.length === 0 ? (
              <div className="text-center py-12 text-[#78837c] bg-black/30 rounded-xl border border-dashed border-white/10">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#dfe7e0]" />
                <p className="text-xs font-semibold text-[#aab4ad]">No Invoices Generated Yet</p>
                <p className="text-[11px] text-[#78837c] mt-1 max-w-xs mx-auto">
                  Sales completed at the billing counter will record here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/15 transition-all duration-150"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#dfe7e0]">
                          {bill.billNumber}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                            bill.paymentMethod === 'UPI'
                              ? 'bg-blue-950/50 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {bill.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-[#aab4ad] mt-1 font-light">
                        {bill.customerName || 'Walk-in Customer'} • {bill.itemCount || bill.items.length} item(s)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-sm text-[#c9a24a] font-mono">
                          {formatRupees(bill.totalAmount)}
                        </span>
                        <p className="text-[10px] text-[#78837c] mt-0.5 font-mono">
                          {formatDateTime(bill.date).split(',')[1] || formatDateTime(bill.date)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onViewBill(bill)}
                        title="View & Print Bill"
                        className="p-1.5 text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.08] rounded-lg border border-transparent hover:border-white/10 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low-Stock Warnings */}
        <div className="kage-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-950/40 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#dfe7e0]">
                  Restock Priority Items
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
              >
                <span>View Vault</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-12 text-[#aab4ad] bg-black/30 rounded-xl border border-dashed border-white/10">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400/80" />
                <p className="text-xs font-bold text-[#dfe7e0]">All Inventory Levels are Healthy</p>
                <p className="text-[11px] text-[#78837c] mt-1">
                  No items have fallen below their minimum threshold alert level.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 transition"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#dfe7e0]">{prod.name}</h4>
                      <span className="text-[10px] text-[#78837c] font-mono">{prod.category}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-red-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30 font-mono">
                          {prod.quantity} remaining
                        </span>
                        <p className="text-[10px] text-[#78837c] mt-0.5 font-mono">
                          Alert min: {prod.minStock}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('products')}
                        className="px-2.5 py-1 text-xs font-semibold bg-white/[0.06] text-[#dfe7e0] hover:bg-white/[0.12] border border-white/10 rounded-lg transition"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
