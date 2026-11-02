import { useCallback, useEffect, useState } from 'react';
import { api, tokenStore } from './api.js';
import { initials } from './utils.js';
import { ToastProvider, useToast } from './ui/Toasts.jsx';
import { ConfirmProvider, useConfirm } from './ui/ConfirmDialog.jsx';
import AuthPage from './components/AuthPage.jsx';
import Board from './components/Board.jsx';

function Shell() {
  const toast = useToast();
  const confirm = useConfirm();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(tokenStore.get()));

  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  const signOutLocally = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    const onExpired = () => {
      signOutLocally();
      toast.warning('Your session has expired. Please log in again.');
    };
    window.addEventListener('workflowhub:session-expired', onExpired);
    return () => window.removeEventListener('workflowhub:session-expired', onExpired);
  }, [signOutLocally, toast]);

  function handleAuthenticated({ token, user: signedIn }) {
    tokenStore.set(token);
    setUser(signedIn);
  }

  async function handleLogout() {
    const ok = await confirm({
      title: 'Log out?',
      message: 'You will need to log in again to see your workflow items.',
      confirmText: 'Yes, log out',
      cancelText: 'Stay logged in',
    });
    if (!ok) return;
    try {
      await api.logout();
    } catch {
      /* the saved login is removed here either way */
    }
    signOutLocally();
    toast.info('You have been logged out. See you soon!');
  }

  if (checking) return <p className="muted center">Loading&hellip;</p>;
  if (!user) return <AuthPage onAuthenticated={handleAuthenticated} />;

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">
          <span className="logo-mark">W</span>
          <span>
            WorkFlow<b>Hub</b>
          </span>
        </div>
        <div className="who">
          <span className="avatar">{initials(user.username)}</span>
          <span className="who-name">{user.username}</span>
          <button className="btn" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <main>
        <Board />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Shell />
      </ConfirmProvider>
    </ToastProvider>
  );
}
