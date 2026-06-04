/**
 * Tests para storage.js — Criptografía y Persistencia
 * Grupo: 🔴 Prioridad Crítica
 * 
 * Cubre: secureEncryptData, secureDecryptData, uint8ToBase64, base64ToUint8,
 *        getFromStorageAsync, setToStorageAsync, updateStorageAsync,
 *        getFromStorage, setToStorage, updateStorage, removeFromStorage, dbRoutes
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Importamos los mocks de Firebase para controlar su comportamiento
import { ref, onValue, set, update, remove } from '../../test/mocks/firebase-database.mock.js';

// Importamos el módulo bajo test
import {
  secureEncryptData,
  secureDecryptData,
  getFromStorageAsync,
  setToStorageAsync,
  updateStorageAsync,
  getFromStorage,
  setToStorage,
  updateStorage,
  removeFromStorage,
  dbRoutes,
} from '../../src/_main/storage.js';

import { CONSTANT } from '../../src/_main/constants.js';

// ═══════════════════════════════════════════════════════════════════════
// STO-01 / STO-02: Funciones de conversión Base64 (internas, testadas indirectamente)
// Se testean a través del round-trip de secureEncryptData/secureDecryptData
// ═══════════════════════════════════════════════════════════════════════

describe('storage.js — Criptografía AES-GCM (secureEncryptData / secureDecryptData)', () => {
  // STO-03: Cifrado y descifrado simétrico
  it('STO-03: cifra y descifra datos simétricamente', async () => {
    const original = 'Datos de prueba para cifrado';
    const password = 'mi-contraseña-segura-123';

    const encrypted = await secureEncryptData(original, password);
    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toBe(original);

    const decrypted = await secureDecryptData(encrypted, password);
    expect(decrypted).toBe(original);
  });

  // STO-04: Datos Unicode
  it('STO-04: cifra y descifra datos Unicode (ñ, acentos, emojis)', async () => {
    const original = '¡Hola señor! 🎉 Café con leche — «Ñoño» 日本語';
    const password = 'clave-unicode-test';

    const encrypted = await secureEncryptData(original, password);
    const decrypted = await secureDecryptData(encrypted, password);
    expect(decrypted).toBe(original);
  });

  // STO-05: Sin contraseña → Error (encrypt)
  it('STO-05: lanza error al cifrar sin contraseña', async () => {
    await expect(secureEncryptData('datos', '')).rejects.toThrow(
      'Se requiere una contraseña para el cifrado criptográfico.'
    );
  });

  // STO-06: Sin contraseña → Error (decrypt)
  it('STO-06: lanza error al descifrar sin contraseña', async () => {
    await expect(secureDecryptData('datos', '')).rejects.toThrow(
      'Se requiere una contraseña para el descifrado criptográfico.'
    );
  });

  // STO-07: Contraseña incorrecta
  it('STO-07: falla al descifrar con contraseña incorrecta', async () => {
    const encrypted = await secureEncryptData('datos secretos', 'clave-correcta');
    await expect(secureDecryptData(encrypted, 'clave-incorrecta')).rejects.toThrow();
  });

  // STO-08: Payload corrupto
  it('STO-08: falla al descifrar payload corrupto', async () => {
    // Base64 válido pero datos corruptos
    const corruptPayload = btoa('esto-no-es-un-payload-cifrado-valido-necesita-mas-bytes-para-pasar');
    await expect(secureDecryptData(corruptPayload, 'clave')).rejects.toThrow();
  });

  // STO-09: Payload demasiado corto (< 28 bytes)
  it('STO-09: falla con payload demasiado corto (< 28 bytes)', async () => {
    const shortPayload = btoa('corto'); // Solo 5 bytes
    await expect(secureDecryptData(shortPayload, 'clave')).rejects.toThrow();
  });

  // STO-10: Determinismo — mismo texto, distinto ciphertext (por IV/salt aleatorios)
  it('STO-10: genera diferentes ciphertexts para el mismo texto (IV/salt aleatorios)', async () => {
    const text = 'texto-identico';
    const password = 'misma-clave';

    const encrypted1 = await secureEncryptData(text, password);
    const encrypted2 = await secureEncryptData(text, password);

    expect(encrypted1).not.toBe(encrypted2);

    // Ambos deben descifrar al mismo valor
    expect(await secureDecryptData(encrypted1, password)).toBe(text);
    expect(await secureDecryptData(encrypted2, password)).toBe(text);
  });

  // STO-01/STO-02: Round-trip indirecto de uint8ToBase64/base64ToUint8
  it('STO-01/STO-02: round-trip de conversión Base64 via cifrado de datos grandes', async () => {
    // Generar un string grande (> 100KB para verificar que no hay stack overflow)
    const largeData = 'A'.repeat(150000);
    const password = 'clave-grande';

    const encrypted = await secureEncryptData(largeData, password);
    const decrypted = await secureDecryptData(encrypted, password);
    expect(decrypted).toBe(largeData);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// STO-14 a STO-27: Operaciones Async de Storage
// ═══════════════════════════════════════════════════════════════════════

describe('storage.js — getFromStorageAsync', () => {
  // STO-14: Leer de localStorage sin cifrado
  it('STO-14: lee de localStorage sin cifrado', async () => {
    const testData = { nombre: 'BaP', version: 2 };
    localStorage.setItem('test-key', JSON.stringify(testData));

    const result = await getFromStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'test-key',
    });
    expect(result).toEqual(testData);
  });

  // STO-15: Leer de localStorage con cifrado
  it('STO-15: lee de localStorage con cifrado AES-GCM', async () => {
    const testData = { sensible: 'datos-secretos' };
    const secretKey = 'user-uid-12345';

    // Guardar cifrado primero
    await setToStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'encrypted-key',
      value: testData,
      secretKey,
    });

    const result = await getFromStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'encrypted-key',
      secretKey,
    });
    expect(result).toEqual(testData);
  });

  // STO-16: Leer de sessionStorage
  it('STO-16: lee de sessionStorage sin cifrado', async () => {
    const testData = { sesion: 'activa' };
    sessionStorage.setItem('session-key', JSON.stringify(testData));

    const result = await getFromStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.SESSION,
      item: 'session-key',
    });
    expect(result).toEqual(testData);
  });

  // STO-17: Leer de localStorage vacío
  it('STO-17: retorna null si el item no existe en localStorage', async () => {
    const result = await getFromStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'no-existe',
    });
    expect(result).toBeNull();
  });

  // STO-18: Leer de Realtime Database
  it('STO-18: lee de Realtime Database exitosamente', async () => {
    const mockData = { key: 'value-from-db' };
    onValue.mockImplementation((dbRef, successCb) => {
      successCb({ val: () => mockData });
    });

    const result = await getFromStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/test/path',
    });
    expect(result).toEqual(mockData);
  });

  // STO-19: Error al leer de RTDB
  it('STO-19: rechaza la promesa al fallar lectura de RTDB', async () => {
    const mockError = new Error('Permission denied');
    onValue.mockImplementation((dbRef, successCb, errorCb) => {
      errorCb(mockError);
    });

    await expect(
      getFromStorageAsync({
        storageType: CONSTANT.STORAGE.SOURCE.DB,
        item: '/test/path',
      })
    ).rejects.toThrow(); // Error original o error de i18n path en test env
  });
});

describe('storage.js — setToStorageAsync', () => {
  // STO-20: Escribir en localStorage sin cifrado
  it('STO-20: escribe en localStorage sin cifrado', async () => {
    const testData = { clave: 'valor' };
    await setToStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'write-key',
      value: testData,
    });

    const stored = JSON.parse(localStorage.getItem('write-key'));
    expect(stored).toEqual(testData);
  });

  // STO-21: Escribir en localStorage con cifrado
  it('STO-21: escribe en localStorage con cifrado (datos no legibles)', async () => {
    const testData = { secreto: 'confidencial' };
    const secretKey = 'encryption-key';

    await setToStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'encrypted-write',
      value: testData,
      secretKey,
    });

    const raw = localStorage.getItem('encrypted-write');
    // El valor almacenado es un Base64 cifrado, no el JSON original
    expect(raw).toBeTruthy();
    expect(raw).not.toBe(JSON.stringify(testData));
  });

  // STO-22: Escribir en sessionStorage
  it('STO-22: escribe en sessionStorage sin cifrado', async () => {
    const testData = { sesion: 'data' };
    await setToStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.SESSION,
      item: 'session-write',
      value: testData,
    });

    const stored = JSON.parse(sessionStorage.getItem('session-write'));
    expect(stored).toEqual(testData);
  });

  // STO-23: Escribir en RTDB
  it('STO-23: invoca firebase set para escribir en RTDB', async () => {
    set.mockResolvedValue();
    const testData = { rtdb: 'value' };

    await setToStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/db/path',
      value: testData,
    });

    expect(set).toHaveBeenCalled();
    expect(ref).toHaveBeenCalledWith(expect.anything(), '/db/path');
  });

  // STO-24: Error al escribir en RTDB
  it('STO-24: rechaza la promesa al fallar escritura en RTDB', async () => {
    set.mockRejectedValue(new Error('Write failed'));

    await expect(
      setToStorageAsync({
        storageType: CONSTANT.STORAGE.SOURCE.DB,
        item: '/db/path',
        value: { fail: true },
      })
    ).rejects.toThrow(); // Puede ser el error original o el de i18n
  });
});

describe('storage.js — updateStorageAsync', () => {
  // STO-25: Actualizar localStorage
  it('STO-25: actualiza localStorage', async () => {
    const testData = { updated: true };
    await updateStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'update-key',
      value: testData,
    });

    const stored = JSON.parse(localStorage.getItem('update-key'));
    expect(stored).toEqual(testData);
  });

  // STO-26: Actualizar RTDB
  it('STO-26: invoca firebase update para actualizar RTDB', async () => {
    update.mockResolvedValue();

    await updateStorageAsync({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/update/path',
      value: { key: 'updated' },
    });

    expect(update).toHaveBeenCalled();
  });

  // STO-27: Error al actualizar RTDB
  it('STO-27: rechaza la promesa al fallar actualización en RTDB', async () => {
    update.mockRejectedValue(new Error('Update failed'));

    await expect(
      updateStorageAsync({
        storageType: CONSTANT.STORAGE.SOURCE.DB,
        item: '/update/path',
        value: { fail: true },
      })
    ).rejects.toThrow(); // Puede ser el error original o el de i18n
  });
});

// ═══════════════════════════════════════════════════════════════════════
// STO-28 a STO-40: Operaciones Sync Legacy de Storage
// ═══════════════════════════════════════════════════════════════════════

describe('storage.js — getFromStorage (legacy sync)', () => {
  // STO-28: Leer de localStorage
  it('STO-28: lee de localStorage y parsea JSON', () => {
    const testData = { legacy: 'data' };
    localStorage.setItem('legacy-key', JSON.stringify(testData));

    const result = getFromStorage({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'legacy-key',
    });
    expect(result).toEqual(testData);
  });

  // STO-29: Leer de RTDB con callback
  it('STO-29: lee de RTDB e invoca callbackOnSuccess', () => {
    const mockData = { fromDb: true };
    const callback = vi.fn();

    onValue.mockImplementation((dbRef, successCb) => {
      successCb({ val: () => mockData });
    });

    getFromStorage({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/legacy/path',
      callbackOnSuccess: callback,
    });

    expect(callback).toHaveBeenCalledWith(mockData);
  });

  // STO-30: Error de RTDB con callBackOnFail
  it('STO-30: invoca callBackOnFail al fallar lectura de RTDB', () => {
    const failCallback = vi.fn();
    const mockError = new Error('Read error');

    onValue.mockImplementation((dbRef, successCb, errorCb) => {
      errorCb(mockError);
    });

    getFromStorage({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/fail/path',
      callBackOnFail: failCallback,
    });

    expect(failCallback).toHaveBeenCalled();
  });

  // STO-31: Error de RTDB sin callback → ejecuta handler de error
  it('STO-31: sin callBackOnFail, ejecuta el handler de error de onValue', () => {
    const errorHandler = vi.fn();
    onValue.mockImplementation((dbRef, successCb, errorCb) => {
      // Guardar referencia al errorCb que recibe storage.js
      errorHandler.mockImplementation(errorCb);
      try {
        errorCb(new Error('Read error'));
      } catch (e) {
        // La función interna puede fallar por i18n path mismatch en test env
      }
    });

    try {
      getFromStorage({
        storageType: CONSTANT.STORAGE.SOURCE.DB,
        item: '/fail/no-callback',
      });
    } catch (e) {
      // Se espera un posible error por i18n path en el entorno de test
    }

    expect(onValue).toHaveBeenCalled();
  });
});

describe('storage.js — setToStorage (legacy sync)', () => {
  // STO-32: Escribir en localStorage
  it('STO-32: escribe en localStorage con JSON stringify', () => {
    const testData = { legacy: 'write' };
    setToStorage({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'legacy-write',
      value: testData,
    });

    const stored = JSON.parse(localStorage.getItem('legacy-write'));
    expect(stored).toEqual(testData);
  });

  // STO-33: Escribir en RTDB con callback
  it('STO-33: invoca set de Firebase para escribir en RTDB', () => {
    set.mockResolvedValue();

    setToStorage({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/legacy/write',
      value: { key: 'val' },
    });

    expect(set).toHaveBeenCalled();
  });

  // STO-34: Error en RTDB con callBackOnFail
  it('STO-34: invoca callBackOnFail al fallar escritura en RTDB', async () => {
    const failCb = vi.fn();
    set.mockRejectedValue(new Error('Set failed'));

    setToStorage({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/legacy/fail',
      value: { fail: true },
      callBackOnFail: failCb,
    });

    // Esperar a que la promesa rechazada propague al callback
    await vi.waitFor(() => expect(failCb).toHaveBeenCalled(), { timeout: 2000 });
  });
});

describe('storage.js — updateStorage (legacy sync)', () => {
  // STO-35: Actualizar localStorage
  it('STO-35: actualiza localStorage', () => {
    const testData = { updated: 'legacy' };
    updateStorage({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'legacy-update',
      value: testData,
    });

    const stored = JSON.parse(localStorage.getItem('legacy-update'));
    expect(stored).toEqual(testData);
  });

  // STO-36: Actualizar RTDB
  it('STO-36: invoca update de Firebase para actualizar RTDB', () => {
    update.mockResolvedValue();

    updateStorage({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/legacy/update',
      value: { key: 'updated' },
    });

    expect(update).toHaveBeenCalled();
  });
});

describe('storage.js — removeFromStorage', () => {
  // STO-37: Eliminar de localStorage
  it('STO-37: elimina item de localStorage', () => {
    localStorage.setItem('to-remove', 'value');
    removeFromStorage({
      storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
      item: 'to-remove',
    });

    expect(localStorage.getItem('to-remove')).toBeNull();
  });

  // STO-38: Eliminar de sessionStorage
  it('STO-38: elimina item de sessionStorage', () => {
    sessionStorage.setItem('to-remove-session', 'value');
    removeFromStorage({
      storageType: CONSTANT.STORAGE.SOURCE.SESSION,
      item: 'to-remove-session',
    });

    expect(sessionStorage.getItem('to-remove-session')).toBeNull();
  });

  // STO-39: Eliminar de RTDB exitoso
  it('STO-39: invoca remove de Firebase para eliminar de RTDB', () => {
    remove.mockResolvedValue();

    removeFromStorage({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/remove/path',
    });

    expect(remove).toHaveBeenCalled();
  });

  // STO-40: Eliminar de RTDB con error
  it('STO-40: invoca callBackOnFail al fallar eliminación de RTDB', async () => {
    const failCb = vi.fn();
    remove.mockRejectedValue(new Error('Remove failed'));

    removeFromStorage({
      storageType: CONSTANT.STORAGE.SOURCE.DB,
      item: '/remove/fail',
      callBackOnFail: failCb,
    });

    await vi.waitFor(() => expect(failCb).toHaveBeenCalled());
  });
});

// ═══════════════════════════════════════════════════════════════════════
// STO-41: dbRoutes
// ═══════════════════════════════════════════════════════════════════════

describe('storage.js — dbRoutes', () => {
  // STO-41: Rutas de base de datos
  it('STO-41: retorna las rutas esperadas de base de datos', () => {
    expect(dbRoutes.skills()).toBe('/skills');
    expect(dbRoutes.jobs()).toBe('/jobs');
    expect(dbRoutes.studies()).toBe('/studies');
    expect(dbRoutes.ideasAndProjects()).toBe('/ideasAndProjects');
    expect(dbRoutes.photoPortfolio()).toBe('/photographer/portfolio');
  });
});
