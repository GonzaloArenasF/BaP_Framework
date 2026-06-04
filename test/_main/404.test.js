/**
 * Tests para 404.js
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
      pageNotFound: vi.fn(),
    }
  }
}));

vi.mock('../../src/_main/i18n.js', () => ({
  getI18nContent: vi.fn().mockReturnValue({
    head: { meta: { description: 'desc', title: 'title', keywords: 'keys' }, title: 'headTitle' },
    body: { message: 'msg', backHome: 'back' }
  }),
  applyI18n: vi.fn((cb) => cb()), // ejecutar sincrónicamente
  replaceTokensInDOM: vi.fn(),
}));

describe('404.js', () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('F04-01: Al cargar el script, se debe configurar y traducir la página 404', async () => {
    const customReg = await import('../../src/_components/customComponentsRegistration.js');
    const analytics = await import('../../src/_main/analytics.js');
    const i18n = await import('../../src/_main/i18n.js');
    
    // Importamos dinámicamente para que se ejecute el top-level code
    await import('../../src/404.js');

    // 1. setCustomComponents() fue llamado
    expect(customReg.setCustomComponents).toHaveBeenCalledTimes(1);

    // 2. applyI18n() fue llamado
    expect(i18n.applyI18n).toHaveBeenCalledTimes(1);

    // 3. Dentro de applyI18n(), getI18nContent fue llamado para 'notFound'
    expect(i18n.getI18nContent).toHaveBeenCalledWith('page', 'notFound');

    // 4. replaceTokensInDOM fue llamado para head y body
    expect(i18n.replaceTokensInDOM).toHaveBeenCalledTimes(2);
    expect(i18n.replaceTokensInDOM).toHaveBeenNthCalledWith(1, document.head, expect.any(Object));
    expect(i18n.replaceTokensInDOM).toHaveBeenNthCalledWith(2, document.body, expect.any(Object));

    // 5. Al disparar el evento "load" en window, debe registrar analytics
    window.dispatchEvent(new Event('load'));
    expect(analytics.analytic.logEvent.pageNotFound).toHaveBeenCalledTimes(1);
  });
});
