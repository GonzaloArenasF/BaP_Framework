/**
 * Tests para src/pages/build/index.js
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
      enterBuildPage: vi.fn(),
    }
  }
}));

vi.mock('../../src/_main/router.js', () => ({
  sessionStartedControl: vi.fn(),
}));

vi.mock('../../src/_main/i18n.js', () => ({
  applyI18n: vi.fn((cb) => cb()),
}));

describe('pages/build/index.js', () => {
  let customReg, analytics, router;

  beforeEach(async () => {
    vi.resetModules();
    customReg = await import('../../src/_components/customComponentsRegistration.js');
    analytics = await import('../../src/_main/analytics.js');
    router = await import('../../src/_main/router.js');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('PAG-BLD-01: Inicializa sesión, componentes, internacionalización y telemetría al cargar', async () => {
    await import('../../src/pages/build/index.js');

    expect(router.sessionStartedControl).toHaveBeenCalledWith(undefined, false);
    expect(customReg.setCustomComponents).toHaveBeenCalledTimes(1);

    // Evento load
    window.dispatchEvent(new Event('load'));
    expect(analytics.analytic.logEvent.enterBuildPage).toHaveBeenCalledTimes(1);
  });
});
