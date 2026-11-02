// Small pure helpers (easy to unit test).
export const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const labelOf = (list, value) => list.find((x) => x.value === value)?.label ?? value;

// Returns 'none' | 'overdue' | 'today' | 'soon' | 'later' for a YYYY-MM-DD due date.
export function dueState(due, completed = false, now = new Date()) {
  if (!due || completed) return 'none';
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = due.split('-').map(Number);
  const days = Math.round((new Date(y, m - 1, d) - start) / 86400000);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return 'later';
}

export function formatDate(due) {
  if (!due) return '';
  const [y, m, d] = due.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const initials = (name = '') => name.trim().slice(0, 2).toUpperCase() || '?';

export function countByStatus(items) {
  const counts = { pending: 0, in_progress: 0, completed: 0 };
  items.forEach((i) => { if (i.status in counts) counts[i.status] += 1; });
  return counts;
}

// Password rules shown on the registration form (the server checks them again).
export function passwordProblems(password, confirm) {
  const problems = [];
  if (password.length < 8) problems.push('Use at least 8 characters.');
  if (/^\d+$/.test(password)) problems.push('The password cannot be only numbers.');
  if (confirm !== undefined && password !== confirm) problems.push('The two passwords do not match.');
  return problems;
}
