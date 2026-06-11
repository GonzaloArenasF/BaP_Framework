/**
 * Setup global para Vitest
 * 
 * Configura el entorno de pruebas:
 * - Web Crypto API polyfill para jsdom
 * - localStorage/sessionStorage polyfill
 * - Limpieza de DOM entre tests
 */
import { vi, beforeEach, afterEach } from 'vitest';

// ── Web Crypto API ──────────────────────────────────────────────────────
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true,
  });
}

// ── localStorage / sessionStorage polyfill ───────────────────────────────
// jsdom en Vitest a veces no tiene localStorage disponible en todos los contextos.
// Creamos un polyfill minimal que funciona en todos los escenarios.
function createStorageMock() {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index) => Object.keys(store)[index] ?? null,
  };
}

// Solo establecer si no existen o no tienen .setItem como función
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorageMock(),
    writable: true,
    configurable: true,
  });
}

if (typeof globalThis.sessionStorage === 'undefined' || typeof globalThis.sessionStorage.setItem !== 'function') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createStorageMock(),
    writable: true,
    configurable: true,
  });
}

// ── fetch mock global ───────────────────────────────────────────────────────
// NEW-06 añadió validación de response.ok en todos los fetch() del framework.
// Este mock global asegura que los tests que no necesitan mockear fetch explícitamente
// reciban una respuesta con ok:true por defecto, evitando fallos en el .then() chain.
// Tests individuales pueden sobreescribir con vi.fn() según su necesidad.
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(''),
    json: () => Promise.resolve({}),
  })
);

// ── matchMedia mock global ──────────────────────────────────────────────────
// NEW-09 usa window.matchMedia('(pointer: coarse)') como señal primaria de isMobile().
// jsdom no implementa matchMedia, por lo que se provee un mock que simula dispositivo desktop.
if (typeof globalThis.matchMedia === 'undefined') {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query) => ({
      matches: false, // Simula dispositivo desktop por defecto
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// ── Limpieza entre tests ─────────────────────────────────────────────────
beforeEach(() => {
  // Limpiar el DOM
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  
  // Limpiar storage
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});
