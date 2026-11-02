import { useState } from 'react';
import { api } from '../api.js';
import { passwordProblems } from '../utils.js';
import { useToast } from '../ui/Toasts.jsx';

export default function AuthPage({ onAuthenticated }) {
  const toast = useToast();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isLogin = mode === 'login';
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function switchMode() {
    setError('');
    setMode(isLogin ? 'register' : 'login');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!isLogin) {
      const problems = passwordProblems(form.password, form.confirm);
      if (problems.length) {
        setError(problems[0]);
        toast.warning(problems[0]);
        return;
      }
    }
    setBusy(true);
    try {
      const result = isLogin
        ? await api.login({ username: form.username, password: form.password })
        : await api.register({ username: form.username, email: form.email, password: form.password });
      toast.success(
        isLogin
          ? `Welcome back, ${result.user.username}! You are now logged in.`
          : `Account created successfully! Welcome to WorkFlowHub, ${result.user.username}.`
      );
      onAuthenticated(result);
    } catch (err) {
      setError(err.message);
      toast.error(isLogin ? `Login failed. ${err.message}` : `Registration failed. ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="logo">
          <span className="logo-mark">W</span>
          <span>
            WorkFlow<b>Hub</b>
          </span>
        </div>
        <h1>Keep every piece of work moving.</h1>
        <p>A calm place to plan, track and finish your work, built for remote teams and independent professionals.</p>
        <ul>
          <li>Organise work on a three-column board</li>
          <li>Set priorities and due dates</li>
          <li>Your items are private to your account</li>
        </ul>
      </section>

      <form className="auth-card" onSubmit={submit} noValidate={false}>
        <h2>{isLogin ? 'Log in to your workspace' : 'Create your account'}</h2>
        <p className="muted">{isLogin ? 'Enter your details to continue.' : 'It takes less than a minute.'}</p>

        <label>
          Username
          <input value={form.username} onChange={update('username')} required autoComplete="username" placeholder="e.g. pawan" />
        </label>

        {!isLogin && (
          <label>
            Email
            <input type="email" value={form.email} onChange={update('email')} required autoComplete="email" placeholder="you@example.com" />
          </label>
        )}

        <label>
          Password
          <span className="password-row">
            <input
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={update('password')}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
            />
            <button type="button" className="link-btn" onClick={() => setShow(!show)}>
              {show ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>

        {!isLogin && (
          <label>
            Confirm password
            <input type={show ? 'text' : 'password'} value={form.confirm} onChange={update('confirm')} required autoComplete="new-password" />
          </label>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn primary wide" disabled={busy}>
          {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
        </button>

        <p className="switch">
          {isLogin ? 'New to WorkFlowHub?' : 'Already have an account?'}{' '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {isLogin ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}
