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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0a0e12] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/15 animate-scale-up text-[#dfe7e0]">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-2xl border ${
              isDanger
                ? 'bg-red-950/40 text-red-400 border-red-500/30'
                : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#dfe7e0]">
            {title}
          </h3>
        </div>

        <p className="text-[#aab4ad] text-xs sm:text-sm mb-6 leading-relaxed font-light">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-mono text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] rounded-xl transition border border-white/10"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl active:scale-[0.98] transition shadow-md ${
              isDanger
                ? 'btn-vermilion shadow-red-950/50'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
