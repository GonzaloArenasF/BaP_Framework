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

  it('ANL-02: invocar funciones registradas en analytic.logEvent llama a logAnalyticEvent', () => {
    // Si existen métodos dinámicos (ej: enterLandingPage), probar la invocación
    const keys = Object.keys(analytic.logEvent);
    keys.forEach(key => {
      expect(typeof analytic.logEvent[key]).toBe('function');
      analytic.logEvent[key]();
      expect(firebaseInit.logAnalyticEvent).toHaveBeenCalled();
    });
  });
});
