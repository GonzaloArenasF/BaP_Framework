/**
 * Firebase Realtime Database Mock
 * Reemplaza: https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js
 */
import { vi } from 'vitest';

export const getDatabase = vi.fn(() => ({}));

export const ref = vi.fn((db, path) => ({ db, path, toString: () => path }));

export const onValue = vi.fn((dbRef, successCb, errorCb, options) => {
  // Default: call success with empty snapshot
  // Override in tests by using onValue.mockImplementation(...)
});

export const set = vi.fn(() => Promise.resolve());
export const update = vi.fn(() => Promise.resolve());
export const remove = vi.fn(() => Promise.resolve());
export const get = vi.fn(() => Promise.resolve({ val: () => null }));
