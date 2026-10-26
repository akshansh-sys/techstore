import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-slide-up shadow-2xl">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl ${
          isSuccess
            ? 'bg-[#0a0e12]/95 border-emerald-500/40 text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
            : isError
            ? 'bg-[#0a0e12]/95 border-red-500/40 text-red-300 shadow-[0_4px_20px_rgba(239,68,68,0.15)]'
            : 'bg-[#0a0e12]/95 border-white/20 text-[#dfe7e0] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-[#ff5a3c]" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-[#c9a24a]" />}
        </div>
        <div className="flex-1 text-xs sm:text-sm font-semibold leading-snug">{toast.message}</div>
        <button
          onClick={onClose}
          className="text-[#78837c] hover:text-[#dfe7e0] p-0.5 rounded-lg transition"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
