import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ConfirmContext = createContext(null);
export const useConfirm = () => useContext(ConfirmContext);

// useConfirm()({ title, message, confirmText, danger }) -> Promise<boolean>
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setState({ ...options, resolve })),
    []
  );

  const close = (answer) => {
    state.resolve(answer);
    setState(null);
  };

  useEffect(() => {
    if (!state) return undefined;
    const onKey = (e) => e.key === 'Escape' && close(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close(false)}>
          <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className={`dialog-icon ${state.danger ? 'danger' : ''}`}>{state.danger ? '!' : '?'}</div>
            <h2 id="confirm-title">{state.title}</h2>
            <p>{state.message}</p>
            <div className="dialog-actions">
              <button className="btn" onClick={() => close(false)}>
                {state.cancelText || 'Cancel'}
              </button>
              <button className={`btn ${state.danger ? 'danger-solid' : 'primary'}`} autoFocus onClick={() => close(true)}>
                {state.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
