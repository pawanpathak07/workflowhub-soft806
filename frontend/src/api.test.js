import { describe, expect, it } from 'vitest';
import { errorMessage } from './api.js';

describe('errorMessage', () => {
  it('uses the detail field when present', () => {
    expect(errorMessage({ detail: 'Invalid username or password.' })).toBe('Invalid username or password.');
  });

  it('joins field errors into a readable sentence', () => {
    expect(errorMessage({ email: ['Enter a valid email address.'] })).toBe('email: Enter a valid email address.');
  });

  it('keeps non-field errors without a prefix', () => {
    expect(errorMessage({ non_field_errors: ['Try again.'] })).toBe('Try again.');
  });

  it('falls back when there is no body', () => {
    expect(errorMessage(null, 'Oops')).toBe('Oops');
  });
});
