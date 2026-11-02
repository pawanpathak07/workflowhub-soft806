import { describe, expect, it } from 'vitest';
import { countByStatus, dueState, initials, labelOf, passwordProblems, STATUSES } from './utils.js';

const NOW = new Date(2026, 10, 6, 12, 0, 0); // 6 Nov 2026

describe('dueState', () => {
  it('flags overdue, today, soon and later dates', () => {
    expect(dueState('2026-11-05', false, NOW)).toBe('overdue');
    expect(dueState('2026-11-06', false, NOW)).toBe('today');
    expect(dueState('2026-11-08', false, NOW)).toBe('soon');
    expect(dueState('2026-12-01', false, NOW)).toBe('later');
  });

  it('ignores missing dates and completed items', () => {
    expect(dueState(null, false, NOW)).toBe('none');
    expect(dueState('2026-11-01', true, NOW)).toBe('none');
  });
});

describe('helpers', () => {
  it('counts items by status', () => {
    const counts = countByStatus([{ status: 'pending' }, { status: 'completed' }, { status: 'completed' }]);
    expect(counts).toEqual({ pending: 1, in_progress: 0, completed: 2 });
  });

  it('finds readable labels', () => {
    expect(labelOf(STATUSES, 'in_progress')).toBe('In Progress');
  });

  it('creates initials', () => {
    expect(initials('pawan')).toBe('PA');
    expect(initials('')).toBe('?');
  });

  it('reports password problems', () => {
    expect(passwordProblems('abc', 'abc')).toContain('Use at least 8 characters.');
    expect(passwordProblems('12345678', '12345678')).toContain('The password cannot be only numbers.');
    expect(passwordProblems('Secure-pass1', 'other')).toContain('The two passwords do not match.');
    expect(passwordProblems('Secure-pass1', 'Secure-pass1')).toEqual([]);
  });
});
