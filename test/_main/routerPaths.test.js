/**
 * Tests para routerPaths.js
 * Grupo: 🟢 Prioridad Baja
 */
import { describe, it, expect } from 'vitest';
import { NAVIGATION_TYPES, routes } from '../../src/_main/routerPaths.js';

describe('routerPaths.js', () => {
  it('RTP-01: NAVIGATION_TYPES debe contener REDIRECT y LOAD_COMPONENT', () => {
    expect(NAVIGATION_TYPES).toHaveProperty('REDIRECT', 'redirect');
    expect(NAVIGATION_TYPES).toHaveProperty('LOAD_COMPONENT', 'loadComponent');
  });

  it('RTP-02: routes.landing debe estar configurado correctamente', () => {
    expect(routes).toHaveProperty('landing');
    expect(routes.landing.pathname).toBe('/');
    expect(routes.landing.navigation).toBe(NAVIGATION_TYPES.REDIRECT);
    expect(routes.landing.validate.signIn).toBe(false);
  });

  it('RTP-03: routes.error404 debe estar configurado correctamente', () => {
    expect(routes).toHaveProperty('error404');
    expect(routes.error404.pathname).toBe('/404.html');
    expect(routes.error404.navigation).toBe(NAVIGATION_TYPES.REDIRECT);
    expect(routes.error404.validate.signIn).toBe(false);
  });
});
