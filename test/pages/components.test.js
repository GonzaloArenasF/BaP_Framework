/**
 * Tests para src/pages/components/index.js
 * Grupo: 🟠 Pruebas de Páginas de Documentación
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencias
vi.mock('../../src/_components/customComponentsRegistration.js', () => ({
  setCustomComponents: vi.fn(),
}));

vi.mock('../../src/_main/analytics.js', () => ({
  analytic: {
    logEvent: {
      enterComponentsPage: vi.fn(),
    }
  }
}));

vi.mock('../../src/_main/router.js', () => ({
  sessionStartedControl: vi.fn(),
}));

vi.mock('../../src/_main/i18n.js', () => ({
  applyI18n: vi.fn((cb) => cb()),
}));

vi.mock('../../src/_main/util.js', () => ({
  bapNotify: vi.fn(),
}));

describe('pages/components/index.js', () => {
  let customReg, analytics, router, util;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = `
      <button id="btn_toast_info"></button>
      <button id="btn_alert_error"></button>
      <button id="btn_trigger_dialog"></button>
      <button id="btn_trigger_loading"></button>
    `;

    customReg = await import('../../src/_components/customComponentsRegistration.js');
    analytics = await import('../../src/_main/analytics.js');
    router = await import('../../src/_main/router.js');
    util = await import('../../src/_main/util.js');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('PAG-CMP-01: Inicializa sesión, componentes, internacionalización y telemetría al cargar', async () => {
    await import('../../src/pages/components/index.js');
    expect(router.sessionStartedControl).toHaveBeenCalledWith(undefined, false);
    expect(customReg.setCustomComponents).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('load'));
    expect(analytics.analytic.logEvent.enterComponentsPage).toHaveBeenCalledTimes(1);
  });

  it('PAG-CMP-02: El botón de toast dispara la notificación de información', async () => {
    await import('../../src/pages/components/index.js');
    window.dispatchEvent(new Event('load'));

    const btn = document.getElementById('btn_toast_info');
    btn.click();

    expect(util.bapNotify).toHaveBeenCalledWith('toast', 'info', expect.any(String));
  });

  it('PAG-CMP-03: El botón de alerta dispara la notificación de error', async () => {
    await import('../../src/pages/components/index.js');
    window.dispatchEvent(new Event('load'));

    const btn = document.getElementById('btn_alert_error');
    btn.click();

    expect(util.bapNotify).toHaveBeenCalledWith('alert', 'error', expect.any(String));
  });

  it('PAG-CMP-04: El botón de trigger dialog crea y añade bap-dialog al DOM', async () => {
    await import('../../src/pages/components/index.js');
    window.dispatchEvent(new Event('load'));

    const btn = document.getElementById('btn_trigger_dialog');
    btn.click();

    const dialog = document.querySelector('bap-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('title-main')).toBe('¡Diálogo Premium Activado!');
    expect(dialog.getAttribute('link-url-base64')).toBe('aHR0cHM6Ly9naXRodWIuY29tL0dvbnphbG9BcmVuYXNGL0JhUF9GcmFtZXdvcms=');
  });

  it('PAG-CMP-05: El botón de loading bloquea la pantalla temporalmente', async () => {
    vi.useFakeTimers();
    await import('../../src/pages/components/index.js');
    window.dispatchEvent(new Event('load'));

    const btn = document.getElementById('btn_trigger_loading');
    btn.click();

    let loading = document.querySelector('bap-loading-state');
    expect(loading).not.toBeNull();
    expect(loading.getAttribute('sub-message')).toBe('Simulando carga de componentes en segundo plano...');

    // Avanzar tiempo
    vi.advanceTimersByTime(3000);

    loading = document.querySelector('bap-loading-state');
    expect(loading).toBeNull();
    expect(util.bapNotify).toHaveBeenCalledWith('toast', 'info', expect.any(String));

    vi.useRealTimers();
  });
});
