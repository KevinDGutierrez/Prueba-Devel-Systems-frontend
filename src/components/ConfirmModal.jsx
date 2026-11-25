import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
    },
    info: {
      icon: Info,
      iconColor: 'text-slate-800',
      iconBg: 'bg-slate-100',
      btnBg: 'bg-slate-900 hover:bg-slate-800 text-white'
    }
  };

  const style = variantStyles[variant] || variantStyles.danger;
  const Icon = style.icon;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 backdrop-blur-sm w-full max-w-sm rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-scale-in">
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-sm font-semibold text-slate-900">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${style.btnBg}`}
          >
            {loading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : null}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
