import React from 'react';
import { Printer, X, CheckCircle, Store, Phone } from 'lucide-react';
import { formatRupees, formatDateTime } from '../utils/formatters';
import { getShopProfile } from '../services/dataService';

export default function ReceiptModal({ isOpen, bill, onClose, storeName }) {
  if (!isOpen || !bill) return null;

  const shop = getShopProfile();
  const displayName = storeName || shop.name || 'Apna General Store';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Header Controls (Hidden on print) */}
        <div className="no-print flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm">Sale Completed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Container */}
        <div id="printable-receipt" className="text-slate-800 bg-white">
          {/* Shop Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {displayName}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500">{shop.tagline}</p>
            {shop.address && <p className="text-[11px] text-slate-500">{shop.address}</p>}
            {shop.phone && (
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Contact:{' '}
                <a
                  href={`tel:${shop.phone.replace(/[\s-]/g, '')}`}
                  className="text-slate-700 hover:text-emerald-700 underline font-mono"
                >
                  {shop.phone}
                </a>
              </p>
            )}
          </div>

          {/* Bill Meta Info */}
          <div className="py-2.5 text-xs border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Bill No:</span>
              <span className="font-bold text-slate-800 font-mono">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-medium text-slate-700">{formatDateTime(bill.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-medium text-slate-800">{bill.customerName || 'Walk-in Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold text-emerald-700">{bill.paymentMethod}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-2.5 border-b border-dashed border-slate-300 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="text-left pb-1 font-semibold">Item</th>
                  <th className="text-center pb-1 font-semibold">Qty</th>
                  <th className="text-right pb-1 font-semibold">Rate</th>
                  <th className="text-right pb-1 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, index) => (
                  <tr key={index} className="py-1">
                    <td className="py-1.5 font-medium text-slate-800 pr-2">{item.name}</td>
                    <td className="py-1.5 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-600 font-mono">₹{item.price}</td>
                    <td className="py-1.5 text-right font-bold text-slate-800 font-mono">
                      ₹{item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="py-2.5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Items:</span>
              <span className="font-medium">{bill.itemCount || bill.items.length}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Grand Total:</span>
              <span className="text-emerald-700 font-mono">{formatRupees(bill.totalAmount)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">Thank you for shopping with us!</p>
            <p>Please visit again • Have a great day</p>
          </div>
        </div>

        {/* Action Buttons (Hidden on print) */}
        <div className="no-print mt-5 flex gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-md hover:shadow-lg active:scale-95 text-xs sm:text-sm"
          >
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Print Bill</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
