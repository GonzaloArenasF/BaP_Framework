/**
 * Tests para constants.js
 * Grupo: 🟡 Prioridad Media
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('constants.js', () => {
  let originalWindow;
  
  beforeEach(() => {
    vi.resetModules();
    // Guardar referencia si es posible
    originalWindow = global.window;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('CONST-01: Estructura de CONSTANT', async () => {
    const { CONSTANT } = await import('../../src/_main/constants.js');
    expect(CONSTANT).toHaveProperty('APP_NAME');
    expect(CONSTANT).toHaveProperty('APP_VERSION');
    expect(CONSTANT).toHaveProperty('STORAGE');
    expect(CONSTANT).toHaveProperty('NOTIFICATION');
    expect(CONSTANT).toHaveProperty('AUTH');
    expect(CONSTANT).toHaveProperty('FBC');
    expect(CONSTANT).toHaveProperty('RECAPTCHA');
    expect(CONSTANT).toHaveProperty('I18N');
    expect(CONSTANT).toHaveProperty('SOCIAL_MEDIA');
  });

  it('CONST-02: Valores de APP_NAME y APP_VERSION', async () => {
    const { CONSTANT } = await import('../../src/_main/constants.js');
    expect(CONSTANT.APP_NAME).toBe('BaP Framework');
    expect(CONSTANT.APP_VERSION).toBe('v2.3.1');
  });

  it('CONST-03: Claves de STORAGE', async () => {
    const { CONSTANT } = await import('../../src/_main/constants.js');
    expect(CONSTANT.STORAGE.KEYS.DIALOG_DATA).toBe('dd');
    expect(CONSTANT.STORAGE.SOURCE.LOCAL).toBe('localStorage');
    expect(CONSTANT.STORAGE.SOURCE.SESSION).toBe('sessionStorage');
    expect(CONSTANT.STORAGE.SOURCE.DB).toBe('realtime');
  });

  it('CONST-04: Tipos de NOTIFICATION', async () => {
    const { CONSTANT } = await import('../../src/_main/constants.js');
    expect(CONSTANT.NOTIFICATION.TYPE.ALERT).toBe('alert');
    expect(CONSTANT.NOTIFICATION.TYPE.TOAST).toBe('toast');
    expect(CONSTANT.NOTIFICATION.SEVERITY.INFO).toBe('info');
    expect(CONSTANT.NOTIFICATION.SEVERITY.WARNING).toBe('warning');
    expect(CONSTANT.NOTIFICATION.SEVERITY.ERROR).toBe('error');
  });

  it('CONST-05: AUTO_REMOVE_AFTER.INFO', async () => {
    const { CONSTANT } = await import('../../src/_main/constants.js');
    expect(CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO).toBe(4000);
  });

  it('CONST-06: Constantes de AUTH', async () => {
    const { CONSTANT } = await import('../../src/_main/constants.js');
    expect(CONSTANT.AUTH.SIGNED_IN).toBe('AUTH_SIGNED_IN');
    expect(CONSTANT.AUTH.SIGNED_OUT).toBe('AUTH_SIGNED_OUT');
    expect(CONSTANT.AUTH.LOGIN_ATTEMPTS).toBe(10);
  });

  it('CONST-07: I18N.DEFAULT y SUPPORTED', async () => {
    const { CONSTANT } = await import('../../src/_main/constants.js');
    expect(CONSTANT.I18N.DEFAULT).toBe('es');
    expect(CONSTANT.I18N.SUPPORTED).toContain('es');
  });

  // Tests de entorno para FIREBASE_AVAILABLE
  describe('Evaluación de FIREBASE_AVAILABLE', () => {
    
    it('CONST-08: FIREBASE_AVAILABLE en Node.js (sin window)', async () => {
      // Simular ausencia de window
      const tmpWindow = global.window;
      delete global.window;
      
      const { CONSTANT } = await import('../../src/_main/constants.js');
      expect(CONSTANT.FIREBASE_AVAILABLE).toBe('%%FIREBASE_AVAILABLE%%');
      
      global.window = tmpWindow;
    });

    it('CONST-09: FIREBASE_AVAILABLE en localhost', async () => {
      vi.stubGlobal('window', {
        location: { hostname: 'localhost' }
      });
      const { CONSTANT } = await import('../../src/_main/constants.js');
      // Localhost debe retornar el bypass
      expect(CONSTANT.FIREBASE_AVAILABLE).toBe('%%FIREBASE_AVAILABLE%%');
    });

    it('CONST-10: FIREBASE_AVAILABLE en IP local', async () => {
      vi.stubGlobal('window', {
        location: { hostname: '192.168.1.5' }
      });
      const { CONSTANT } = await import('../../src/_main/constants.js');
      // IP local debe retornar el bypass
      expect(CONSTANT.FIREBASE_AVAILABLE).toBe('%%FIREBASE_AVAILABLE%%');
    });

    it('CONST-11: FIREBASE_AVAILABLE en producción', async () => {
      vi.stubGlobal('window', {
        location: { hostname: 'midominio.com' }
      });
      const { CONSTANT } = await import('../../src/_main/constants.js');
      // En un dominio que no es localhost y asumiendo que "%%FIREBASE_AP%%" es true!
      // En el código original: const hasFirebaseCredentials = !!"%%FIREBASE_AP%%"; -> es string, por lo que es true.
      expect(CONSTANT.FIREBASE_AVAILABLE).toBe(true);
    });
  });
});
