import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 animate-scale-up">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-2xl ${
              isDanger ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
        </div>

        <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl active:scale-[0.98] transition shadow-sm ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
