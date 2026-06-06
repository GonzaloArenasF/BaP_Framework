/**
 * Tests para analytics.js
 * Grupo: 🟢 Prioridad Baja
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analytic } from '../../src/_main/analytics.js';
import * as firebaseInit from '../../src/_main/firebaseInit.js';

// Mock de firebaseInit
vi.mock('../../src/_main/firebaseInit.js', () => ({
  logAnalyticEvent: vi.fn(),
}));

describe('analytics.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ANL-01: analytic.logEvent debe ser un objeto poblado dinámicamente', () => {
    expect(typeof analytic.logEvent).toBe('object');
  });
});
