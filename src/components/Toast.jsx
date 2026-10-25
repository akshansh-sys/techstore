import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-slide-up shadow-xl shadow-slate-900/10">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950 shadow-emerald-500/10'
            : isError
            ? 'bg-rose-50/95 border-rose-200 text-rose-950 shadow-rose-500/10'
            : 'bg-slate-900/95 border-slate-800 text-white shadow-slate-900/20'
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-slate-300" />}
        </div>
        <div className="flex-1 text-xs sm:text-sm font-semibold leading-snug">{toast.message}</div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
