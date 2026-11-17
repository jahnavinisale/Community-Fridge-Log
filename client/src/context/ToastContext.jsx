import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container with accessible live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-md border text-sm transition-all ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : isError
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : isWarning
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-stone-900 border-stone-800 text-white'
              }`}
            >
              <div className="shrink-0 mt-0.5" aria-hidden="true">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#1F5E43]" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-700" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-700" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-stone-400" />}
              </div>
              <div className="flex-1 font-medium">{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-stone-500 hover:text-stone-800 p-1 rounded-md focus:outline-none"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
