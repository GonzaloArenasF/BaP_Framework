/**
 * Firebase App Check Mock
 * Reemplaza: https://www.gstatic.com/firebasejs/10.11.0/firebase-app-check.js
 */
import { vi } from 'vitest';

export const initializeAppCheck = vi.fn(() => ({}));
export const ReCaptchaEnterpriseProvider = vi.fn();
export const getToken = vi.fn(() => Promise.resolve({ token: 'mock-token' }));
