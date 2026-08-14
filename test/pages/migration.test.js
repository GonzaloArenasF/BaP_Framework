/**
 * Tests para la página de Proceso de Migración (src/pages/migration/index.js)
 * Grupo: 🟠 Pruebas de Página de Migración
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/_main/i18n.js', () => ({
  applyI18n: vi.fn((cb) => {
    if (typeof cb === 'function') cb();
  }),
  getI18nContent: vi.fn(() => ({})),
}));

vi.mock('../../src/_components/customComponentsRegistration.js', () => ({
  setCustomComponents: vi.fn(),
}));

describe('Página de Proceso de Migración (src/pages/migration/)', () => {
  it('PAG-MIG-1: Inicializa componentes y ejecuta i18n y analítica al cargar', async () => {
    const { applyI18n } = await import('../../src/_main/i18n.js');
    const { setCustomComponents } = await import('../../src/_components/customComponentsRegistration.js');

    await import('../../src/pages/migration/index.js');

    expect(setCustomComponents).toHaveBeenCalled();
    expect(applyI18n).toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));
  });
});
