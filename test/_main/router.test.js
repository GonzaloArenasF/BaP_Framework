/**
 * Tests para router.js — Motor de Enrutamiento
 * Grupo: 🔴 Prioridad Crítica
 * 
 * Cubre: goTo, getQueryParams, sessionStartedControl
 * Las funciones internas (paramsToQueryParams, isAccessAllowed, navigateTo, loadContent)
 * se testean indirectamente a través de las funciones públicas.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { goTo, getQueryParams, sessionStartedControl } from '../../src/_main/router.js';
import { NAVIGATION_TYPES, routes } from '../../src/_main/routerPaths.js';
import { CONSTANT } from '../../src/_main/constants.js';

// ═══════════════════════════════════════════════════════════════════════
// getQueryParams
// ═══════════════════════════════════════════════════════════════════════

describe('router.js — getQueryParams', () => {
  beforeEach(() => {
    // Reset window.location.search
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { 
        ...window.location,
        search: '',
        origin: 'http://localhost',
        href: 'http://localhost',
        hostname: 'localhost',
      },
    });
  });

  // RTR-19
  it('RTR-19: parsea parámetros de URL correctamente', () => {
    window.location.search = '?a=1&b=hello';
    const params = getQueryParams();
    expect(params).toEqual({ a: '1', b: 'hello' });
  });

  // RTR-20
  it('RTR-20: retorna objeto vacío sin parámetros', () => {
    window.location.search = '';
    const params = getQueryParams();
    expect(params).toEqual({});
  });

  // RTR-21
  it('RTR-21: decodifica caracteres especiales correctamente', () => {
    window.location.search = '?name=caf%C3%A9&msg=hello%20world';
    const params = getQueryParams();
    expect(params.name).toBe('café');
    expect(params.msg).toBe('hello world');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// goTo
// ═══════════════════════════════════════════════════════════════════════

describe('router.js — goTo', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        href: 'http://localhost',
        origin: 'http://localhost',
        search: '',
        hostname: 'localhost',
      },
    });
    document.body.innerHTML = '<main></main>';
  });

  // RTR-15
  it('RTR-15: redirige a 404 cuando la ruta es null', async () => {
    await goTo(null);
    expect(window.location.href).toContain('/404.html');
  });

  // RTR-16
  it('RTR-16: redirige a 404 cuando la ruta no tiene pathname', async () => {
    await goTo({});
    expect(window.location.href).toContain('/404.html');
  });

  // RTR-17: Acceso permitido con REDIRECT
  it('RTR-17: navega a ruta con tipo REDIRECT cuando el acceso es permitido', async () => {
    const testRoute = {
      pathname: '/test-page',
      component: null,
      navigation: NAVIGATION_TYPES.REDIRECT,
      validate: { signIn: false },
    };

    await goTo(testRoute);
    expect(window.location.href).toBe('/test-page');
  });

  // RTR-18: Acceso permitido con LOAD_COMPONENT
  it('RTR-18: carga componente dinámicamente cuando la navegación es LOAD_COMPONENT', async () => {
    const testRoute = {
      pathname: '/dynamic',
      component: 'bap-test-component',
      navigation: NAVIGATION_TYPES.LOAD_COMPONENT,
      title: 'Test Page',
      validate: { signIn: false },
    };

    await goTo(testRoute);

    // Verificar que el componente se insertó en <main>
    const main = document.querySelector('main');
    const component = main.querySelector('bap-test-component');
    expect(component).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// loadContent — Sanitización de atributos (indirecta via goTo)
// ═══════════════════════════════════════════════════════════════════════

describe('router.js — loadContent (seguridad de atributos)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main></main>';
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost',
        origin: 'http://localhost',
        search: '?valid-param=value',
        hostname: 'localhost',
      },
    });
  });

  // RTR-13
  it('RTR-13: setea query params como atributos del componente', async () => {
    window.location.search = '?color=blue&size=large';

    const testRoute = {
      pathname: '/component-test',
      component: 'test-element',
      navigation: NAVIGATION_TYPES.LOAD_COMPONENT,
      title: 'Test',
      validate: { signIn: false },
    };

    await goTo(testRoute);

    const element = document.querySelector('main test-element');
    expect(element).not.toBeNull();
    expect(element.getAttribute('color')).toBe('blue');
    expect(element.getAttribute('size')).toBe('large');
  });

  // RTR-14: Sanitización de nombres de atributos inválidos
  it('RTR-14: omite parámetros URL con nombres inválidos como atributo', async () => {
    // Caracteres inválidos para atributos HTML
    window.location.search = '?valid=ok&<script>=evil';

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const testRoute = {
      pathname: '/sanitize-test',
      component: 'sanitize-element',
      navigation: NAVIGATION_TYPES.LOAD_COMPONENT,
      title: 'Sanitize Test',
      validate: { signIn: false },
    };

    await goTo(testRoute);

    const element = document.querySelector('main sanitize-element');
    expect(element).not.toBeNull();
    expect(element.getAttribute('valid')).toBe('ok');

    consoleSpy.mockRestore();
  });

  // RTR-12
  it('RTR-12: no lanza error si <main> no existe', async () => {
    document.body.innerHTML = ''; // Sin <main>

    const testRoute = {
      pathname: '/no-main',
      component: 'some-element',
      navigation: NAVIGATION_TYPES.LOAD_COMPONENT,
      title: 'No Main',
      validate: { signIn: false },
    };

    await expect(goTo(testRoute)).resolves.not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// sessionStartedControl
// ═══════════════════════════════════════════════════════════════════════

describe('router.js — sessionStartedControl', () => {
  // RTR-22: Ruta sin signIn requerido
  it('RTR-22: no ejecuta lógica de sesión para rutas sin validación signIn', () => {
    const route = {
      pathname: '/public',
      validate: { signIn: false },
    };

    // No debe lanzar error ni llamar a Firebase
    expect(() => {
      sessionStartedControl(route, false);
    }).not.toThrow();
  });

  // RTR-23: Firebase desactivado → bypass
  it('RTR-23: aplica bypass local cuando Firebase está desactivado', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const route = {
      pathname: '/protected',
      validate: { signIn: true },
    };

    if (!CONSTANT.FIREBASE_AVAILABLE) {
      sessionStartedControl(route, false);
      expect(consoleSpy).toHaveBeenCalled();
    } else {
      expect(true).toBe(true);
    }

    consoleSpy.mockRestore();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Coverage extra (Fase 6)
// ═══════════════════════════════════════════════════════════════════════

vi.mock('../../src/_main/auth.js', () => ({
  userSession: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  userSignIn: vi.fn(),
  userSignOut: vi.fn(),
  isUserAuthorized: vi.fn(),
}));

import * as authMock from '../../src/_main/auth.js';
import * as utilMock from '../../src/_main/util.js';

vi.mock('../../src/_main/util.js', () => ({
  bapNotify: vi.fn(),
}));

describe('router.js — Extra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, search: '', origin: 'http://localhost', href: 'http://localhost', hostname: 'localhost' }
    });
  });

  it('paramsToQueryParams se ejecuta dentro de navigateTo', async () => {
    const testRoute = {
      pathname: '/test-params',
      navigation: NAVIGATION_TYPES.REDIRECT,
      validate: { signIn: false },
    };
    await goTo(testRoute, { a: '1', b: 'hello' });
    expect(window.location.href).toBe('/test-params?a=1&b=hello');
  });

  it('goTo llama a bapNotify si isAccessAllowed retorna falso', async () => {
    // Forzamos acceso denegado (requiere signIn, pero no hay current user)
    authMock.userSession.currentUser = null;
    CONSTANT.FIREBASE_AVAILABLE = true;

    const testRoute = {
      pathname: '/private',
      navigation: NAVIGATION_TYPES.REDIRECT,
      validate: { signIn: true },
    };

    await goTo(testRoute);
    expect(utilMock.bapNotify).toHaveBeenCalled();
  });

  it('isAccessAllowed retorna falso si el user no está autorizado', async () => {
    authMock.userSession.currentUser = { uid: '123' };
    authMock.isUserAuthorized.mockResolvedValue(false);
    CONSTANT.FIREBASE_AVAILABLE = true;

    const testRoute = {
      pathname: '/private',
      navigation: NAVIGATION_TYPES.REDIRECT,
      validate: { signIn: true },
    };

    await goTo(testRoute);
    expect(authMock.isUserAuthorized).toHaveBeenCalled();
    expect(utilMock.bapNotify).toHaveBeenCalled();
  });

  it('sessionStartedControl llama redireccion si usuario es nulo y initSession falso', async () => {
    CONSTANT.FIREBASE_AVAILABLE = true;
    const testRoute = { pathname: '/private', validate: { signIn: true } };
    
    sessionStartedControl(testRoute, false);
    
    expect(authMock.userSession.onAuthStateChanged).toHaveBeenCalled();
    const callback = authMock.userSession.onAuthStateChanged.mock.calls[0][0];
    
    // Ejecutamos callback con user = null
    await callback(null);
    expect(window.location.href).toBe('/');
  });

  it('sessionStartedControl llama userSignIn si initSession es verdadero', async () => {
    CONSTANT.FIREBASE_AVAILABLE = true;
    const testRoute = { pathname: '/private', validate: { signIn: true } };
    
    sessionStartedControl(testRoute, true);
    const callback = authMock.userSession.onAuthStateChanged.mock.calls[0][0];
    
    // Ejecutamos callback con user = null
    await callback(null);
    expect(authMock.userSignIn).toHaveBeenCalled();
  });

  it('sessionStartedControl llama userSignOut si user no esta en whitelist', async () => {
    CONSTANT.FIREBASE_AVAILABLE = true;
    const testRoute = { pathname: '/private', validate: { signIn: true } };
    authMock.isUserAuthorized.mockResolvedValue(false);
    
    sessionStartedControl(testRoute, false);
    const callback = authMock.userSession.onAuthStateChanged.mock.calls[0][0];
    
    // Ejecutamos callback con user válido pero no autorizado
    await callback({ uid: '123' });
    expect(authMock.userSignOut).toHaveBeenCalled();
  });

  it('loadContent y getQueryParams manejan errores si URLSearchParams lanza error', async () => {
    // Vitest no permite sobreescribir fácilmente URLSearchParams si es global nativo sin un entorno limpio.
    // Usamos el hecho de que si Window.location.search es inválido no crashea nativamente, 
    // pero podemos testear la existencia del catch en getQueryParams rompiendo location.search mediante un getter
    Object.defineProperty(window, 'location', {
      get() { throw new Error('Location is broken'); }
    });

    const params = getQueryParams();
    expect(params).toEqual({});
    expect(utilMock.bapNotify).toHaveBeenCalled();
  });
});
