import { useEffect, useState } from 'react';
import { PRIORITIES, STATUSES } from '../utils.js';

const EMPTY = { title: '', description: '', status: 'pending', priority: 'medium', due_date: '' };

export default function ItemModal({ item, defaultStatus, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    item
      ? { title: item.title, description: item.description, status: item.status, priority: item.priority, due_date: item.due_date || '' }
      : { ...EMPTY, status: defaultStatus || 'pending' }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Please give the item a title.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave({ ...form, title: form.title.trim(), due_date: form.due_date || null });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="dialog modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{item ? 'Edit workflow item' : 'New workflow item'}</h2>

        <label>
          Title
          <input value={form.title} maxLength={120} onChange={update('title')} autoFocus placeholder="What needs to be done?" />
        </label>
        <label>
          Description
          <textarea rows={3} value={form.description} onChange={update('description')} placeholder="Optional details" />
        </label>
        <div className="grid3">
          <label>
            Status
            <select value={form.status} onChange={update('status')}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={update('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input type="date" value={form.due_date} onChange={update('due_date')} />
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : item ? 'Save changes' : 'Add item'}</button>
        </div>
      </form>
    </div>
  );
}
