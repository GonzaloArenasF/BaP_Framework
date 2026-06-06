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

  it('RTP-02: routes debe exportarse como un objeto (poblado dinámicamente en build)', () => {
    expect(typeof routes).toBe('object');
  });
});
