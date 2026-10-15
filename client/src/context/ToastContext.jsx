import { createContext, useContext, useEffect, useRef, useState } from 'react';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] animate-[fadeIn_0.2s_ease-out]">
          <div
            className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-[0_20px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm ${
              toast.type === 'success'
                ? 'border-emerald-300 bg-emerald-500 text-white shadow-emerald-200/70 dark:border-emerald-400 dark:bg-emerald-500 dark:text-white'
                : 'border-red-300 bg-red-500 text-white shadow-red-200/70 dark:border-red-400 dark:bg-red-500 dark:text-white'
            }`}
          >
            <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}
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
