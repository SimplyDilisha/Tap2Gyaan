import React, { useState, useEffect } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const triggerToast = (message, type = 'success') => {
  const event = new CustomEvent('show-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-brand-success" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-brand-accent" />,
  };

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-brand-card text-white px-4 py-3 rounded-xl shadow-2xl border border-brand-border animate-slide-up z-[100] max-w-sm">
      {icons[toast.type] || icons.info}
      <span className="font-medium text-sm flex-1">{toast.message}</span>
      <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white transition-colors ml-1">
        <X size={14} />
      </button>
    </div>
  );
}
