import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const ICONS = { success: '✓', error: '!', info: 'i', warning: '!' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type, message, ms = 4500) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, type, message }]);
      setTimeout(() => dismiss(id), ms);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m, 7000),
      info: (m) => push('info', m),
      warning: (m) => push('warning', m, 6000),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <span className="toast-icon">{ICONS[t.type]}</span>
            <span className="toast-text">{t.message}</span>
            <button className="toast-close" aria-label="Dismiss message" onClick={() => dismiss(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
