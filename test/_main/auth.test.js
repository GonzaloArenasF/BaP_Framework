/**
 * Tests para auth.js — Autenticación y Control de Acceso
 * Grupo: 🔴 Prioridad Crítica
 * 
 * Cubre: sanitizeUserKey, isUserAuthorized, userSignIn, userSignOut
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks de Firebase
import { signInWithPopup, signOut } from '../../test/mocks/firebase-auth.mock.js';
import { onValue } from '../../test/mocks/firebase-database.mock.js';

// Módulo bajo test
import { sanitizeUserKey, isUserAuthorized, userSignIn, userSignOut } from '../../src/_main/auth.js';
import { CONSTANT } from '../../src/_main/constants.js';

vi.mock('../../src/_main/storage.js', () => ({
  dbRoutes: {
    usersWhitelist: () => '/users_whitelist'
  }
}));

// ═══════════════════════════════════════════════════════════════════════
// Helpers: detectar si Firebase está "activo" en el entorno de test
// En test, FIREBASE_AVAILABLE = "%%FIREBASE_AVAILABLE%%" (truthy string)
// ═══════════════════════════════════════════════════════════════════════
const isFirebaseActive = !!CONSTANT.FIREBASE_AVAILABLE;

// ═══════════════════════════════════════════════════════════════════════
// sanitizeUserKey
// ═══════════════════════════════════════════════════════════════════════

describe('auth.js — sanitizeUserKey', () => {
  // AUTH-01
  it('AUTH-01: sanitiza email normal reemplazando puntos por comas', () => {
    expect(sanitizeUserKey('usuario.nombre@gmail.com')).toBe('usuario,nombre@gmail,com');
  });

  // AUTH-02
  it('AUTH-02: sanitiza email con múltiples puntos', () => {
    expect(sanitizeUserKey('a.b.c@d.e.f')).toBe('a,b,c@d,e,f');
  });

  // AUTH-03
  it('AUTH-03: retorna cadena vacía para email vacío', () => {
    expect(sanitizeUserKey('')).toBe('');
  });

  // AUTH-04
  it('AUTH-04: retorna cadena vacía para email null', () => {
    expect(sanitizeUserKey(null)).toBe('');
  });

  // AUTH-05
  it('AUTH-05: retorna cadena vacía para email undefined', () => {
    expect(sanitizeUserKey(undefined)).toBe('');
  });

  // AUTH-06
  it('AUTH-06: convierte email a minúsculas', () => {
    expect(sanitizeUserKey('USER@Gmail.COM')).toBe('user@gmail,com');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// isUserAuthorized
// ═══════════════════════════════════════════════════════════════════════

describe('auth.js — isUserAuthorized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AUTH-08: Usuario null con Firebase activo
  it('AUTH-08: retorna false con usuario null cuando Firebase está activo', async () => {
    if (isFirebaseActive) {
      const result = await isUserAuthorized(null);
      expect(result).toBe(false);
    }
  });

  // AUTH-09: Usuario sin email
  it('AUTH-09: retorna false con usuario sin email', async () => {
    if (isFirebaseActive) {
      const result = await isUserAuthorized({ uid: '123' });
      expect(result).toBe(false);
    }
  });

  // AUTH-10: Usuario autorizado en whitelist (mock onValue)
  it('AUTH-10: retorna true para usuario en whitelist', async () => {
    if (isFirebaseActive) {
      onValue.mockImplementation((dbRef, successCb, errorCb, options) => {
        successCb({ val: () => true });
      });

      const result = await isUserAuthorized({ email: 'test@test.com' });
      expect(result).toBe(true);
    }
  });

  // AUTH-11: Usuario NO autorizado
  it('AUTH-11: retorna false para usuario no autorizado', async () => {
    if (isFirebaseActive) {
      onValue.mockImplementation((dbRef, successCb, errorCb, options) => {
        successCb({ val: () => false });
      });

      const result = await isUserAuthorized({ email: 'blocked@test.com' });
      expect(result).toBe(false);
    }
  });

  // AUTH-12: Error en consulta RTDB
  it('AUTH-12: retorna false y loguea error al fallar consulta RTDB', async () => {
    if (isFirebaseActive) {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      onValue.mockImplementation((dbRef, successCb, errorCb) => {
        errorCb(new Error('Permission denied'));
      });

      const result = await isUserAuthorized({ email: 'test@test.com' });
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    }
  });

  it('AUT-16: bypass de isUserAuthorized cuando Firebase está desactivado', async () => {
    CONSTANT.FIREBASE_AVAILABLE = false;
    const result = await isUserAuthorized({ email: 'test@test.com' });
    expect(result).toBe(true);
    CONSTANT.FIREBASE_AVAILABLE = true; // restaurar
  });

  it('AUT-17: bypass de userSignIn cuando Firebase está desactivado', () => {
    CONSTANT.FIREBASE_AVAILABLE = false;
    const callbackOnSuccess = vi.fn();
    userSignIn({ callbackOnSuccess });
    expect(callbackOnSuccess).toHaveBeenCalled();
    CONSTANT.FIREBASE_AVAILABLE = true; // restaurar
  });

  it('AUT-18: bypass de userSignOut cuando Firebase está desactivado', () => {
    CONSTANT.FIREBASE_AVAILABLE = false;
    const callbackOnSuccess = vi.fn();
    userSignOut({ callbackOnSuccess });
    expect(callbackOnSuccess).toHaveBeenCalled();
    CONSTANT.FIREBASE_AVAILABLE = true; // restaurar
  });

  it('AUT-19: userSignIn deniega acceso si no está en whitelist y llama signOut y callbackOnFail', async () => {
    // Configurar el mock de signInWithPopup para simular login
    signInWithPopup.mockResolvedValueOnce({ user: { email: 'bad@test.com' } });
    
    // Configurar onValue para que el usuario NO esté en la whitelist
    onValue.mockImplementationOnce((ref, successCb) => {
      successCb({ val: () => false });
    });

    const callbackOnFail = vi.fn();
    userSignIn({ callbackOnFail });

    // Esperar un ciclo de promesas para que el then se resuelva
    await new Promise(process.nextTick);

    expect(signOut).toHaveBeenCalled();
    expect(callbackOnFail).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// userSignIn
// ═══════════════════════════════════════════════════════════════════════

describe('auth.js — userSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AUTH-14: Login exitoso + usuario autorizado
  it('AUTH-14: ejecuta callbackOnSuccess tras login exitoso y whitelist aprobada', async () => {
    if (isFirebaseActive) {
      const successCb = vi.fn();
      const mockUser = { email: 'auth@test.com' };

      signInWithPopup.mockResolvedValue({ user: mockUser });
      onValue.mockImplementation((dbRef, successCb, errorCb, options) => {
        successCb({ val: () => true });
      });

      userSignIn({ callbackOnSuccess: successCb });

      // Esperar a que las promesas se resuelvan
      await vi.waitFor(() => expect(successCb).toHaveBeenCalled(), { timeout: 2000 });
    }
  });

  // AUTH-16: Error en signInWithPopup
  it('AUTH-16: ejecuta callbackOnFail al fallar signInWithPopup', async () => {
    if (isFirebaseActive) {
      const failCb = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      signInWithPopup.mockRejectedValue(new Error('Popup blocked'));

      userSignIn({ callbackOnFail: failCb });

      await vi.waitFor(() => expect(failCb).toHaveBeenCalled(), { timeout: 2000 });
      consoleSpy.mockRestore();
    }
  });

  // AUTH-17: Sin callbacks definidos
  it('AUTH-17: no lanza excepción sin callbacks definidos', async () => {
    if (isFirebaseActive) {
      signInWithPopup.mockResolvedValue({ user: { email: 'test@test.com' } });
      onValue.mockImplementation((dbRef, successCb) => {
        successCb({ val: () => true });
      });

      // No debe lanzar error
      expect(() => userSignIn({})).not.toThrow();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// userSignOut
// ═══════════════════════════════════════════════════════════════════════

describe('auth.js — userSignOut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AUTH-19: Cierre exitoso
  it('AUTH-19: ejecuta callbackOnSuccess tras cierre exitoso', async () => {
    if (isFirebaseActive) {
      const successCb = vi.fn();
      signOut.mockResolvedValue();

      userSignOut({ callbackOnSuccess: successCb });

      await vi.waitFor(() => expect(successCb).toHaveBeenCalled(), { timeout: 2000 });
    }
  });

  // AUTH-20: Error en signOut
  it('AUTH-20: ejecuta callbackOnFail al fallar signOut', async () => {
    if (isFirebaseActive) {
      const failCb = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      signOut.mockRejectedValue(new Error('Sign out failed'));

      userSignOut({ callbackOnFail: failCb });

      await vi.waitFor(() => expect(failCb).toHaveBeenCalled(), { timeout: 2000 });
      consoleSpy.mockRestore();
    }
  });
});
