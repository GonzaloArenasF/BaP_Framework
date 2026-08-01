/**
 * Tests para las 11 subpáginas de src/pages/core/<modulo>/index.js
 * Grupo: 🟠 Pruebas de Subpáginas de Core
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/_main/i18n.js', () => ({
  applyI18n: vi.fn(),
  getI18nContent: vi.fn(() => ({})),
}));

vi.mock('../../src/_components/customComponentsRegistration.js', () => ({
  setCustomComponents: vi.fn(),
}));

describe('Subpáginas de src/pages/core/', () => {
  const modules = [
    'analytics',
    'auth',
    'constants',
    'firebaseInit',
    'googleDrive',
    'i18n',
    'markdown',
    'router',
    'routerPaths',
    'storage',
    'util'
  ];

  modules.forEach((mod) => {
    it(`PAG-COR-SUB-${mod}: Inicializa applyI18n al cargar el DOM en ${mod}`, async () => {
      const { applyI18n } = await import('../../src/_main/i18n.js');
      await import(`../../src/pages/core/${mod}/index.js`);

      document.dispatchEvent(new Event('DOMContentLoaded'));
      expect(applyI18n).toHaveBeenCalled();
    });
  });
});
