/**
 * Tests para firebaseInit.js — Inicialización de Firebase
 * Grupo: 🟡 Prioridad Alta
 * 
 * Cubre: logAnalyticEvent, exports condicionales
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CONSTANT, IS_PROD } from '../../src/_main/constants.js';
import { logEvent } from '../../test/mocks/firebase-analytics.mock.js';

// No podemos importar directamente todo al principio si queremos probar condicionales.
// En Vitest, podemos aislar módulos o verificar comportamiento basado en los mocks actuales.

// Helpers: detectar si Firebase está "activo" en el entorno de test
const isFirebaseActive = !!CONSTANT.FIREBASE_AVAILABLE && CONSTANT.FIREBASE_AVAILABLE !== '%%FIREBASE_AVAILABLE%%';

describe('firebaseInit.js — Exports condicionales', () => {
  it('FIR-09 / FIR-10: verifica estado de exports según configuración de entorno', async () => {
    // Importamos el módulo dinámicamente
    const firebaseInit = await import('../../src/_main/firebaseInit.js');
    
    // En el test env por defecto, CONSTANT.FIREBASE_AVAILABLE es "%%FIREBASE_AVAILABLE%%" (truthy)
    // Así que se inicializan los módulos.
    if (CONSTANT.FIREBASE_AVAILABLE) {
      // FIR-10: Firebase activado → exports inicializados
      expect(firebaseInit.bapFirebaseApp).toBeDefined();
      expect(firebaseInit.bapAuth).toBeDefined();
      expect(firebaseInit.bapDB).toBeDefined();
    } else {
      // FIR-09: Firebase desactivado → exports null
      expect(firebaseInit.bapFirebaseApp).toBeNull();
      expect(firebaseInit.bapAuth).toBeNull();
      expect(firebaseInit.bapDB).toBeNull();
    }
  });
});

describe('firebaseInit.js — logAnalyticEvent', () => {
  let firebaseInit;

  beforeEach(async () => {
    vi.resetModules();
    
    // Mockeamos constants.js para forzar IS_PROD = true y FIREBASE_AVAILABLE = true
    vi.mock('../../src/_main/constants.js', async (importOriginal) => {
      const original = await importOriginal();
      return {
        ...original,
        IS_PROD: true,
        CONSTANT: {
          ...original.CONSTANT,
          FIREBASE_AVAILABLE: true
        }
      };
    });

    firebaseInit = await import('../../src/_main/firebaseInit.js');
  });

  it('FIR-04 a FIR-07: valida requerimiento de propiedades', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // FIR-04
    firebaseInit.logAnalyticEvent({ name: 'n', func: 'f', userType: 'u' });
    expect(consoleSpy).toHaveBeenCalledWith('Analytic logging event', expect.objectContaining({ message: 'Event type name not included' }));
    
    // FIR-05
    firebaseInit.logAnalyticEvent({ type: 't', func: 'f', userType: 'u' });
    expect(consoleSpy).toHaveBeenCalledWith('Analytic logging event', expect.objectContaining({ message: 'Event name not included' }));
      
    // FIR-06
    firebaseInit.logAnalyticEvent({ type: 't', name: 'n', userType: 'u' });
    expect(consoleSpy).toHaveBeenCalledWith('Analytic logging event', expect.objectContaining({ message: 'Functionality name not included' }));
      
    // FIR-07
    firebaseInit.logAnalyticEvent({ type: 't', name: 'n', func: 'f' });
    expect(consoleSpy).toHaveBeenCalledWith('Analytic logging event', expect.objectContaining({ message: 'User type not included' }));
    
    consoleSpy.mockRestore();
  });

  it('FIR-08: errores capturados se envían a console.error sin propagarse', async () => {
    const { logEvent } = await import('../../test/mocks/firebase-analytics.mock.js');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    logEvent.mockImplementationOnce(() => {
      throw new Error('Analytics failure');
    });

    expect(() => {
      firebaseInit.logAnalyticEvent({
        type: 'test_event',
        name: 'test_name',
        func: 'test_func',
        userType: 'Admin'
      });
    }).not.toThrow();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('FIR-03: en producción y con Firebase activo, invoca logEvent con parámetros correctos', async () => {
    const { logEvent } = await import('../../test/mocks/firebase-analytics.mock.js');
    firebaseInit.logAnalyticEvent({
      type: 'custom_type',
      name: 'custom_name',
      func: 'custom_func',
      userType: 'User',
      detail: { extra: 'data' }
    });
    
    expect(logEvent).toHaveBeenCalledWith(
      expect.anything(),
      'custom_name',
      expect.objectContaining({
        func: 'custom_func',
        type: 'custom_type',
        user_type: 'User',
        extra: 'data'
      })
    );
  });
});
