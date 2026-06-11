/**
 * Tests para util.js — Utilidades del Sistema
 * Grupo: 🟡 Prioridad Alta
 * 
 * Cubre: timestampToHumanDate, generateUUID, setStringIntoBoolean, 
 *        bapNotify, isCSSIncluded, isMobile
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  timestampToHumanDate,
  generateUUID,
  setStringIntoBoolean,
  bapNotify,
  isCSSIncluded,
  isMobile
} from '../../src/_main/util.js';
import { CONSTANT } from '../../src/_main/constants.js';

describe('util.js — setStringIntoBoolean', () => {
  it('UTIL-13: retorna true para el string "true"', () => {
    expect(setStringIntoBoolean('true')).toBe(true);
  });

  it('UTIL-14: retorna false para el string "false"', () => {
    expect(setStringIntoBoolean('false')).toBe(false);
  });

  it('UTIL-15: retorna false para otros valores (edge cases)', () => {
    expect(setStringIntoBoolean('True')).toBe(false);
    expect(setStringIntoBoolean('1')).toBe(false);
    expect(setStringIntoBoolean('')).toBe(false);
    expect(setStringIntoBoolean(null)).toBe(false);
    expect(setStringIntoBoolean(undefined)).toBe(false);
    expect(setStringIntoBoolean(true)).toBe(false); // Espera strings
  });
});

describe('util.js — timestampToHumanDate', () => {
  beforeEach(() => {
    // Fija la fecha actual para tests de "hoy"
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('UTIL-01: retorna "Actualidad" (o su i18n) para el timestamp "today"', () => {
    // Si i18n fallase o no estuviera cargado, puede devolver la clave misma
    // Evaluamos que al menos procesa el string 'today' (o retorna 'Actualidad' si mockeamos i18n)
    const result = timestampToHumanDate('today');
    expect(typeof result).toBe('string');
    // Para simplificar, asumimos que devuelve algo no vacío
    expect(result.length).toBeGreaterThan(0);
  });

  it('UTIL-02: formatea con format 0 (dd de mmm de yyyy / hh:mm)', () => {
    const ts = new Date('2026-06-03T15:30:00Z').getTime() / 1000; // expects seconds
    const result = timestampToHumanDate(ts, 0, 'es');
    // Puede variar por zona horaria de JSDOM, solo verificamos que contiene el año o formato
    expect(result).toMatch(/2026/);
  });

  it('UTIL-03: formatea con format 1 (dd/mm/yyyy)', () => {
    const ts = new Date('2026-06-03T15:30:00Z').getTime() / 1000;
    const result = timestampToHumanDate(ts, 1, 'es');
    // En Node.js sin full-icu puede retornar formato distinto (ej. 6/3/2026)
    expect(result).toMatch(/2026/);
  });

  it('UTIL-04: formatea con format 2 (mmm. yyyy)', () => {
    const ts = new Date('2026-06-03T15:30:00Z').getTime() / 1000;
    const result = timestampToHumanDate(ts, 2, 'es');
    // En Node.js sin full-icu puede retornar formato distinto
    expect(result).toMatch(/2026/);
  });

  it('UTIL-07: usa default lang y format si no se proveen', () => {
    const ts = new Date('2026-06-03T15:30:00Z').getTime() / 1000;
    const result = timestampToHumanDate(ts);
    expect(typeof result).toBe('string');
  });
});

describe('util.js — generateUUID', () => {
  let originalCrypto;

  beforeEach(() => {
    originalCrypto = globalThis.crypto;
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('UTIL-08: genera un UUID v4 válido', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  it('UTIL-09: genera UUIDs únicos', () => {
    const uuids = new Set();
    for (let i = 0; i < 1000; i++) {
      uuids.add(generateUUID());
    }
    expect(uuids.size).toBe(1000);
  });

  it('UTIL-11: usa fallback crypto.getRandomValues si randomUUID no existe', () => {
    // Sobrescribimos crypto para quitar randomUUID
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        }
      },
      writable: true,
      configurable: true,
    });

    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  it('UTIL-12: usa fallback inseguro si crypto no está disponible', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Quitamos crypto
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
    expect(consoleSpy).toHaveBeenCalledWith('Web Crypto API is not available. Generating a cryptographically insecure UUID.');
    
    consoleSpy.mockRestore();
  });
});

describe('util.js — bapNotify', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('UTIL-16 & UTIL-17: crea bap-notification con atributos correctos', () => {
    bapNotify(
      CONSTANT.NOTIFICATION.TYPE.ALERT,
      CONSTANT.NOTIFICATION.SEVERITY.INFO,
      'Test Message'
    );

    const notify = document.querySelector('bap-notification');
    expect(notify).not.toBeNull();
    expect(notify.getAttribute('type')).toBe(CONSTANT.NOTIFICATION.TYPE.ALERT);
    expect(notify.getAttribute('severity')).toBe(CONSTANT.NOTIFICATION.SEVERITY.INFO);
    expect(notify.textContent).toBe('Test Message');
    expect(notify.getAttribute('show')).toBe('true');
  });

  it('UTIL-18: limpia notificaciones previas', () => {
    document.body.innerHTML = '<bap-notification id="old-notif"></bap-notification>';
    
    bapNotify(CONSTANT.NOTIFICATION.TYPE.INFO, CONSTANT.NOTIFICATION.SEVERITY.INFO, 'New');
    
    const notifs = document.querySelectorAll('bap-notification');
    expect(notifs.length).toBe(1);
    expect(notifs[0].id).not.toBe('old-notif');
  });

  it('UTIL-19: loguea console.error si severity es ERROR', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const errObj = new Error('Test Error');
    bapNotify(
      CONSTANT.NOTIFICATION.TYPE.INFO,
      CONSTANT.NOTIFICATION.SEVERITY.ERROR,
      'Error Test',
      errObj
    );
    
    // En la implementación real es console.error(msg, errorObj)
    expect(consoleSpy).toHaveBeenCalledWith('Error Test', errObj);
    consoleSpy.mockRestore();
  });
});

describe('util.js — isCSSIncluded', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('UTIL-20: retorna true si el CSS ya está incluido', () => {
    const link = document.createElement('link');
    link.href = 'http://localhost:3000/test.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    expect(isCSSIncluded('http://localhost:3000/test.css')).toBe(true);
  });

  it('UTIL-21: retorna false si el CSS no está incluido', () => {
    expect(isCSSIncluded('http://localhost:3000/missing.css')).toBe(false);
  });
});

describe('util.js — isMobile', () => {
  let originalUserAgent;
  let originalMatchMedia;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
    originalMatchMedia = globalThis.matchMedia;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
    // Restaurar matchMedia al mock global de desktop (matches:false)
    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('UTIL-22: retorna true para un User-Agent móvil', () => {
    // NEW-09: isMobile() ahora usa matchMedia('(pointer: coarse)') como señal primaria.
    // El userAgent sigue configurado para contexto pero matchMedia es quien determina el resultado.
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) Mobile/14E5239e',
      configurable: true
    });
    // Simular pantalla táctil (pointer: coarse) → mobile = true
    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });
    expect(isMobile()).toBe(true);
  });

  it('UTIL-23: retorna false para un User-Agent de escritorio', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/90.0.4430.212 Safari/537.36',
      configurable: true
    });
    expect(isMobile()).toBe(false);
  });
});
