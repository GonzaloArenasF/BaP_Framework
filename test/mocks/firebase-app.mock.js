/**
 * Firebase App Mock
 * Reemplaza: https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js
 */
import { vi } from 'vitest';

export const initializeApp = vi.fn(() => ({
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false,
}));

export const getApp = vi.fn(() => initializeApp());
