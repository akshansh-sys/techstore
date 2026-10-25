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
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Namaste! Welcome to {storeName || 'Your Store'}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Store POS • Today's live summary and quick actions
            </p>
          </div>
          <button
            onClick={() => onNavigate('billing')}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 font-bold text-sm rounded-xl hover:bg-emerald-50 transition shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Create New Bill</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Sales
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupees(todaySales)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-700">{todayBillCount}</span> bills created today
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Products
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {totalProducts}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Active items in inventory
          </div>
        </div>

        {/* Card 3: Low-Stock Count */}
        <div
          className={`bg-white rounded-2xl p-5 border shadow-xs transition ${
            lowStockCount > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low Stock Alert
            </span>
            <div
              className={`p-2.5 rounded-xl ${
                lowStockCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {lowStockCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {lowStockCount > 0 ? 'Needs reordering soon' : 'Stock levels healthy'}
          </div>
        </div>

        {/* Card 4: Total Udhaar Pending */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer Udhaar
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupees(totalPendingUdhaar)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Pending across <span className="font-semibold text-slate-700">{totalCustomers}</span> customers
          </div>
        </div>
      </div>

      {/* Four Large Action Buttons */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Button 1: Dashboard */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-emerald-500 hover:shadow-md transition text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 rounded-xl transition">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Dashboard</h4>
                <p className="text-xs text-slate-500">Overview stats</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
          </button>

          {/* Button 2: Products */}
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-500 hover:shadow-md transition text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl transition">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Products</h4>
                <p className="text-xs text-slate-500">Manage stock</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
          </button>

          {/* Button 3: Billing */}
          <button
            onClick={() => onNavigate('billing')}
            className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-emerald-500 hover:shadow-md transition text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl transition">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Billing</h4>
                <p className="text-xs text-slate-500">Create & print bill</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
          </button>

          {/* Button 4: Customer Udhaar */}
          <button
            onClick={() => onNavigate('udhaar')}
            className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-purple-500 hover:shadow-md transition text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl transition">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Customer Udhaar</h4>
                <p className="text-xs text-slate-500">Khata & payments</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Bills & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800">Recent Bills</h3>
            </div>
            <button
              onClick={() => onNavigate('billing')}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Go to Billing</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentBills.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No bills created yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Go to the Billing section to generate your first bill.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-xs text-slate-800">
                        {bill.billNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          bill.paymentMethod === 'UPI'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {bill.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {bill.customerName || 'Walk-in'} • {bill.itemCount || bill.items.length} item(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        {formatRupees(bill.totalAmount)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {formatDateTime(bill.date).split(',')[1] || formatDateTime(bill.date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewBill(bill)}
                      title="View & Print Bill"
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low-Stock Warnings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800">Low Stock Products</h3>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-emerald-600 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200">
              <Package className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-semibold">Stock Levels are Healthy!</p>
              <p className="text-xs text-emerald-600/80 mt-0.5">
                No products are currently at or below minimum threshold.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200 transition"
                >
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">{prod.name}</h4>
                    <span className="text-[10px] text-slate-500">{prod.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {prod.quantity} in stock
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Min alert: {prod.minStock}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('products')}
                      className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
