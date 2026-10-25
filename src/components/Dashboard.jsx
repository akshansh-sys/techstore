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
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-card">
        {/* Ambient Decorative Glow */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-teal-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Merchant Terminal Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Namaste, {storeName || 'Store Owner'}
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              Real-time snapshot of your counter sales, inventory health, and customer credit ledger.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="self-start md:self-auto inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all duration-150 shadow-md hover:shadow-lg active:scale-95 shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Create New Bill</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Today's Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Today's Sales
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            {formatRupees(todaySales)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {todayBillCount} {todayBillCount === 1 ? 'sale' : 'sales'}
            </span>
            <span>recorded today</span>
          </div>
        </div>

        {/* Card 2: Total Active Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Inventory Stock
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            {totalProducts}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              Active Items
            </span>
            <span>registered in store</span>
          </div>
        </div>

        {/* Card 3: Low-Stock Warnings */}
        <div
          className={`bg-white rounded-2xl p-5 border transition-all duration-200 group shadow-card ${
            lowStockCount > 0
              ? 'border-amber-300/80 bg-amber-50/20 shadow-amber-500/5'
              : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Low Stock Alerts
            </span>
            <div
              className={`p-2 rounded-xl transition-transform group-hover:scale-105 ${
                lowStockCount > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-50 text-emerald-600'
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
            className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {lowStockCount}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {lowStockCount > 0 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span>Items need reordering soon</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">All stock levels healthy</span>
            )}
          </div>
        </div>

        {/* Card 4: Total Customer Udhaar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Market Udhaar
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 font-mono tracking-tight">
            {formatRupees(totalPendingUdhaar)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Pending across</span>
            <span className="font-bold text-slate-800">{totalCustomers}</span>
            <span>customers</span>
          </div>
        </div>
      </div>

      {/* Four Large Action Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Actions
          </h3>
          <span className="text-[11px] text-slate-400">Click to switch sections</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Button 1: Dashboard Overview */}
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-card hover:border-emerald-500 hover:shadow-card-hover transition-all duration-150 text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 rounded-xl transition-colors">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Dashboard
                </h4>
                <p className="text-[11px] text-slate-500">Store summary</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-150" />
          </button>

          {/* Button 2: Products */}
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-card hover:border-blue-500 hover:shadow-card-hover transition-all duration-150 text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                  Products
                </h4>
                <p className="text-[11px] text-slate-500">Manage stock</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-150" />
          </button>

          {/* Button 3: Billing Counter */}
          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-card hover:border-emerald-500 hover:shadow-card-hover transition-all duration-150 text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Billing
                </h4>
                <p className="text-[11px] text-slate-500">Generate receipt</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-150" />
          </button>

          {/* Button 4: Customer Udhaar */}
          <button
            type="button"
            onClick={() => onNavigate('udhaar')}
            className="flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-card hover:border-purple-500 hover:shadow-card-hover transition-all duration-150 text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                  Customer Udhaar
                </h4>
                <p className="text-[11px] text-slate-500">Khata & ledger</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-150" />
          </button>
        </div>
      </div>

      {/* Split Section: Recent Activity & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Recent Completed Invoices</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('billing')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
              >
                <span>New Bill</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentBills.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">No Invoices Generated Yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Sales created at the counter will appear here immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/60 transition-all duration-150"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {bill.billNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            bill.paymentMethod === 'UPI'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {bill.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {bill.customerName || 'Walk-in Customer'} • {bill.itemCount || bill.items.length} item(s)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900 font-mono">
                          {formatRupees(bill.totalAmount)}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatDateTime(bill.date).split(',')[1] || formatDateTime(bill.date)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onViewBill(bill)}
                        title="View & Print Bill"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition shadow-2xs"
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Restock Priority Items</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
              >
                <span>View All Inventory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-12 text-emerald-700 bg-emerald-50/40 rounded-xl border border-dashed border-emerald-200">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="text-xs font-bold text-emerald-800">Inventory Levels are Fully Stocked</p>
                <p className="text-[11px] text-emerald-600 mt-1">
                  No items have fallen below their minimum threshold alert level.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 transition"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{prod.name}</h4>
                      <span className="text-[10px] text-slate-500">{prod.category}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-mono">
                          {prod.quantity} remaining
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Alert min: {prod.minStock}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('products')}
                        className="px-2.5 py-1 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition shadow-2xs"
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
