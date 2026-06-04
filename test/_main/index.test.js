/**
 * Tests para index.js
 * Grupo: 🟣 Prioridad Complementaria (Coverage)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencias
vi.mock('../../src/_components/customComponentsRegistration.js', () => ({
  setCustomComponents: vi.fn(),
}));

vi.mock('../../src/_main/analytics.js', () => ({
  analytic: {
    logEvent: {
      enterLandingPage: vi.fn(),
      logEventCustomDialog: vi.fn(),
    }
  }
}));

vi.mock('../../src/_main/constants.js', () => ({
  CONSTANT: {
    APP_VERSION: 'v1',
    NOTIFICATION: {
      TYPE: { TOAST: 'toast', ALERT: 'alert' },
      SEVERITY: { INFO: 'info', ERROR: 'error' }
    }
  },
  CDN_URL: 'cdn',
  ENV_URL: 'env'
}));

vi.mock('../../src/_main/i18n.js', () => ({
  getI18nContent: vi.fn().mockReturnValue({
    head: { meta: { description: 'desc', title: 'title', keywords: 'keys' }, title: 'headTitle' },
  }),
  applyI18n: vi.fn((cb) => cb()), // ejecutar sincrónicamente
  replaceTokensInDOM: vi.fn(),
}));

vi.mock('../../src/_main/router.js', () => ({
  sessionStartedControl: vi.fn(),
}));

vi.mock('../../src/_main/routerPaths.js', () => ({
  routes: {
    landing: { pathname: '/' }
  }
}));

vi.mock('../../src/_main/util.js', () => ({
  bapNotify: vi.fn(),
}));

describe('index.js', () => {
  let customReg, analytics, i18n, router, util;

  beforeEach(async () => {
    vi.resetModules();
    document.head.innerHTML = '';
    document.body.innerHTML = `
      <button id="btn_toast_info"></button>
      <button id="btn_alert_error"></button>
      <button id="btn_trigger_dialog"></button>
      <button id="btn_trigger_loading"></button>
    `;

    customReg = await import('../../src/_components/customComponentsRegistration.js');
    analytics = await import('../../src/_main/analytics.js');
    i18n = await import('../../src/_main/i18n.js');
    router = await import('../../src/_main/router.js');
    util = await import('../../src/_main/util.js');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('IDX-01: Al cargar el script, se configuran componentes, rutas, idioma e interacciones', async () => {
    // Para setTimeout en el loading state
    vi.useFakeTimers();

    await import('../../src/index.js');

    // Inicializaciones automáticas
    expect(router.sessionStartedControl).toHaveBeenCalledTimes(1);
    expect(customReg.setCustomComponents).toHaveBeenCalledTimes(1);
    expect(i18n.applyI18n).toHaveBeenCalledTimes(1);
    expect(i18n.replaceTokensInDOM).toHaveBeenCalledTimes(1);

    // Evento load
    window.dispatchEvent(new Event('load'));
    expect(analytics.analytic.logEvent.enterLandingPage).toHaveBeenCalledTimes(1);

    // Simular clics en botones de UI
    document.getElementById('btn_toast_info').click();
    expect(util.bapNotify).toHaveBeenCalledWith('toast', 'info', '¡Notificación del BaP Framework!');

    document.getElementById('btn_alert_error').click();
    expect(util.bapNotify).toHaveBeenCalledWith('alert', 'error', '¡Notificación del BaP Framework!');

    // Dialog demo
    document.getElementById('btn_trigger_dialog').click();
    const dialogs = document.querySelectorAll('bap-dialog');
    expect(dialogs.length).toBe(1);
    expect(analytics.analytic.logEvent.logEventCustomDialog).toHaveBeenCalledTimes(1);

    // Loading demo
    document.getElementById('btn_trigger_loading').click();
    const loadingStates = document.querySelectorAll('bap-loading-state');
    expect(loadingStates.length).toBe(1);

    // Avanzar timer 3s para que termine el loading y llame showNotification()
    vi.advanceTimersByTime(3000);
    expect(document.querySelectorAll('bap-loading-state').length).toBe(0);
    // Notificación toast de carga completada
    expect(util.bapNotify).toHaveBeenCalledWith('toast', 'info', '¡Simulación de carga completada con éxito!');

    vi.useRealTimers();
  });
});
