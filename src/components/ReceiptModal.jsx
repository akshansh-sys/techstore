import React from 'react';
import { Printer, X, CheckCircle, Store } from 'lucide-react';
import { formatRupees, formatDateTime } from '../utils/formatters';
import { getShopProfile } from '../services/dataService';

export default function ReceiptModal({ isOpen, bill, onClose, storeName }) {
  if (!isOpen || !bill) return null;

  const shop = getShopProfile();
  const displayName = storeName || shop.name || 'TechStore';

  // Reliable Printing & PDF Generation via Dedicated Print Document
  const handlePrint = () => {
    try {
      let printFrame = document.getElementById('techstore-receipt-print-frame');
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'techstore-receipt-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        printFrame.style.zIndex = '-9999';
        document.body.appendChild(printFrame);
      }

      const itemsRows = (bill.items || [])
        .map(
          (item) => `
          <tr>
            <td style="padding: 6px 4px 6px 0; text-align: left; font-size: 12px; font-weight: 500; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${item.name}</td>
            <td style="padding: 6px 4px; text-align: center; font-size: 12px; font-family: monospace; color: #334155; border-bottom: 1px solid #f1f5f9;">${item.quantity}</td>
            <td style="padding: 6px 4px; text-align: right; font-size: 12px; font-family: monospace; color: #334155; border-bottom: 1px solid #f1f5f9;">₹${item.price}</td>
            <td style="padding: 6px 0 6px 4px; text-align: right; font-size: 12px; font-family: monospace; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">₹${item.total}</td>
          </tr>`
        )
        .join('');

      const doc = printFrame.contentWindow.document;
      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt - ${bill.billNumber || 'Bill'}</title>
  <style>
    @page {
      size: auto;
      margin: 6mm 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 12px 16px;
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    
    .shop-header {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 1px dashed #94a3b8;
      margin-bottom: 10px;
    }
    .shop-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .shop-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 1px;
    }
    
    .meta-box {
      padding: 8px 0;
      border-bottom: 1px dashed #94a3b8;
      font-family: ui-monospace, monospace;
      font-size: 11px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .meta-label { color: #64748b; }
    .meta-val { color: #0f172a; font-weight: 600; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      font-family: ui-monospace, monospace;
      border-bottom: 1.5px solid #cbd5e1;
      padding: 6px 2px;
    }
    
    .totals-box {
      padding: 8px 0;
      border-bottom: 1px dashed #94a3b8;
      font-family: ui-monospace, monospace;
      font-size: 12px;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      padding-top: 8px;
      margin-top: 4px;
      border-top: 1.5px solid #0f172a;
    }
    
    .footer-box {
      text-align: center;
      padding-top: 12px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer-box .thanks {
      font-weight: 700;
      color: #0f172a;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="shop-header">
    <div class="shop-title">${displayName}</div>
    ${shop.tagline ? `<div class="shop-subtitle">${shop.tagline}</div>` : ''}
    ${shop.address ? `<div class="shop-subtitle">${shop.address}</div>` : ''}
    ${shop.phone ? `<div class="shop-subtitle font-mono">Contact: ${shop.phone}</div>` : ''}
    ${shop.email ? `<div class="shop-subtitle font-mono">${shop.email}</div>` : ''}
    ${shop.gstin ? `<div class="shop-subtitle font-mono">GSTIN: ${shop.gstin}</div>` : ''}
  </div>

  <div class="meta-box">
    <div class="meta-row">
      <span class="meta-label">Bill No:</span>
      <span class="meta-val font-mono">${bill.billNumber || 'TS-BILL'}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Date & Time:</span>
      <span class="meta-val font-mono">${formatDateTime(bill.date)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Customer:</span>
      <span class="meta-val">${bill.customerName || 'Walk-in Customer'}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Payment Method:</span>
      <span class="meta-val">${bill.paymentMethod || 'Cash'}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align: left;">Item</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="meta-row">
      <span class="meta-label">Total Items:</span>
      <span class="meta-val font-mono">${bill.itemCount || (bill.items ? bill.items.length : 0)}</span>
    </div>
    <div class="grand-total-row">
      <span>Grand Total:</span>
      <span class="font-mono">${formatRupees(bill.totalAmount || 0)}</span>
    </div>
  </div>

  <div class="footer-box">
    <p class="thanks">Thank you for shopping with us!</p>
    <p>Please visit again • Have a wonderful day</p>
  </div>
</body>
</html>`);
      doc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (printErr) {
          console.warn('Iframe print error, falling back to window.print():', printErr);
          window.print();
        }
      }, 150);
    } catch (e) {
      console.warn('Print iframe error, fallback to window.print():', e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-[#0a0e12] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-[0_15px_60px_rgba(0,0,0,0.95)] border border-white/15 my-4 sm:my-8 max-h-[92vh] overflow-y-auto animate-scale-up text-[#dfe7e0]">
        {/* Header Controls (Hidden on print) */}
        <div className="no-print flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wider text-[#dfe7e0]">Sale Recorded Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.08] rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container (Clean white paper format for thermal printers) */}
        <div id="printable-receipt" className="text-slate-900 bg-white rounded-xl p-4 sm:p-5 shadow-inner">
          {/* Shop Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Store className="w-5 h-5 text-[#e0231c] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 uppercase">
                {displayName}
              </h2>
            </div>
            {shop.tagline && <p className="text-[11px] text-slate-500">{shop.tagline}</p>}
            {shop.address && <p className="text-[11px] text-slate-500">{shop.address}</p>}
            {shop.phone && (
              <p className="text-[11px] text-slate-600 font-medium mt-0.5 font-mono">
                Contact: {shop.phone}
              </p>
            )}
            {shop.email && (
              <p className="text-[11px] text-slate-600 font-medium mt-0.5 font-mono">
                {shop.email}
              </p>
            )}
          </div>

          {/* Bill Meta Info */}
          <div className="py-2.5 text-xs border-b border-dashed border-slate-300 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Bill No:</span>
              <span className="font-bold text-slate-900">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-medium text-slate-700">{formatDateTime(bill.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-medium text-slate-900">{bill.customerName || 'Walk-in Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-bold text-slate-900">{bill.paymentMethod}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-2.5 border-b border-dashed border-slate-300 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                  <th className="text-left pb-1 font-semibold">Item</th>
                  <th className="text-center pb-1 font-semibold">Qty</th>
                  <th className="text-right pb-1 font-semibold">Rate</th>
                  <th className="text-right pb-1 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(bill.items || []).map((item, index) => (
                  <tr key={index} className="py-1">
                    <td className="py-1.5 font-medium text-slate-900 pr-2 font-sans">{item.name}</td>
                    <td className="py-1.5 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-700">₹{item.price}</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">
                      ₹{item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="py-2.5 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Total Items:</span>
              <span className="font-medium">{bill.itemCount || (bill.items ? bill.items.length : 0)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Grand Total:</span>
              <span className="text-slate-900">{formatRupees(bill.totalAmount)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-800">Thank you for visiting us!</p>
            <p>Please visit again • Have a great day</p>
          </div>
        </div>

        {/* Action Buttons (Hidden on print) */}
        <div className="no-print mt-5 flex gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 btn-vermilion font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-xs font-mono text-[#dfe7e0] bg-white/[0.06] hover:bg-white/[0.12] rounded-xl transition active:scale-95 border border-white/10"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
