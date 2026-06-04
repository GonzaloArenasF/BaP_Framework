/**
 * Firebase Analytics Mock
 * Reemplaza: https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js
 */
import { vi } from 'vitest';

export const getAnalytics = vi.fn(() => ({}));
export const logEvent = vi.fn();
export const setAnalyticsCollectionEnabled = vi.fn();
