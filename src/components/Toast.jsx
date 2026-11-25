import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-900 text-white border-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400'
    },
    error: {
      bg: 'bg-rose-900 text-white border-rose-800',
      icon: AlertCircle,
      iconColor: 'text-rose-400'
    },
    info: {
      bg: 'bg-slate-900 text-white border-slate-800',
      icon: Info,
      iconColor: 'text-slate-300'
    }
  };

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  return (
    <div className="fixed bottom-5 right-5 z-[300] flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-medium animate-slide-up bg-slate-900 text-white">
      <Icon size={16} className={style.iconColor} />
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
