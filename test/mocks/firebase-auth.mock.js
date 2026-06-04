/**
 * Firebase Auth Mock
 * Reemplaza: https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js
 */
import { vi } from 'vitest';

export const getAuth = vi.fn(() => ({
  currentUser: null,
  onAuthStateChanged: vi.fn(),
}));

export const signInWithPopup = vi.fn();
export const signOut = vi.fn();
export const GoogleAuthProvider = vi.fn();
export const onAuthStateChanged = vi.fn();
