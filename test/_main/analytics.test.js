/**
 * Tests para analytics.js
 * Grupo: 🟢 Prioridad Baja
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { USER_TYPE, analytic } from '../../src/_main/analytics.js';
import * as firebaseInit from '../../src/_main/firebaseInit.js';

// Mock de firebaseInit
vi.mock('../../src/_main/firebaseInit.js', () => ({
  logAnalyticEvent: vi.fn(),
}));

describe('analytics.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ANL-01: USER_TYPE debe contener ADMIN y USER', () => {
    expect(USER_TYPE).toHaveProperty('ADMIN', 'Admin');
    expect(USER_TYPE).toHaveProperty('USER', 'User');
  });

  it('ANL-02: enterLandingPage debe llamar a logAnalyticEvent con los parámetros correctos', () => {
    analytic.logEvent.enterLandingPage();
    expect(firebaseInit.logAnalyticEvent).toHaveBeenCalledWith({
      type: 'enter_page',
      name: 'enter_landing_page',
      func: 'landing_page',
      userType: USER_TYPE.USER,
    });
  });

  it('ANL-03: pageNotFound debe llamar a logAnalyticEvent con los parámetros correctos', () => {
    analytic.logEvent.pageNotFound();
    expect(firebaseInit.logAnalyticEvent).toHaveBeenCalledWith({
      type: 'enter_page',
      name: 'page_not_found',
      func: '404',
      userType: USER_TYPE.USER,
    });
  });
});
