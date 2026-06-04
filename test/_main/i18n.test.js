/**
 * Tests para i18n.js — Internacionalización y Sanitización HTML
 * Grupo: 🔴 Prioridad Crítica
 * 
 * Cubre: getI18nContent, flattenObject, sanitizeHTML, replaceTokensInDOM
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getI18nContent, flattenObject, sanitizeHTML, replaceTokensInDOM } from '../../src/_main/i18n.js';

// ═══════════════════════════════════════════════════════════════════════
// getI18nContent
// ═══════════════════════════════════════════════════════════════════════

describe('i18n.js — getI18nContent', () => {
  // I18N-01
  it('I18N-01: retorna objeto de página landing con head y body', () => {
    const result = getI18nContent('page', 'landing');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('head');
    expect(result).toHaveProperty('body');
  });

  // I18N-02
  it('I18N-02: retorna objeto de componente bapFooter', () => {
    const result = getI18nContent('component', 'bapFooter');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('tc');
    expect(result).toHaveProperty('brandDesc');
    expect(result).toHaveProperty('versionLabel');
    expect(result).toHaveProperty('resourcesLabel');
    expect(result).toHaveProperty('btnExplore');
    expect(result).toHaveProperty('contactLabel');
  });

  // I18N-03
  it('I18N-03: loguea error para grupo inválido', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = getI18nContent('invalidGroup', 'item');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // I18N-04
  it('I18N-04: retorna undefined para item inexistente sin excepción', () => {
    const result = getI18nContent('page', 'noExiste');
    expect(result).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// flattenObject
// ═══════════════════════════════════════════════════════════════════════

describe('i18n.js — flattenObject', () => {
  // I18N-05
  it('I18N-05: aplana objeto plano sin cambios', () => {
    expect(flattenObject({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });

  // I18N-06
  it('I18N-06: aplana objeto anidado con notación punto', () => {
    expect(flattenObject({ a: { b: { c: 1 } } })).toEqual({ 'a.b.c': 1 });
  });

  // I18N-07
  it('I18N-07: aplana objeto mixto de valores planos y anidados', () => {
    const input = { x: 10, nested: { y: 20, deep: { z: 30 } } };
    const result = flattenObject(input);
    expect(result).toEqual({
      x: 10,
      'nested.y': 20,
      'nested.deep.z': 30,
    });
  });

  // I18N-08
  it('I18N-08: retorna objeto vacío para input vacío', () => {
    expect(flattenObject({})).toEqual({});
  });

  // I18N-09
  it('I18N-09: usa prefijo correctamente', () => {
    const result = flattenObject({ key: 'value' }, 'prefix');
    expect(result).toEqual({ 'prefix.key': 'value' });
  });

  // I18N-10
  it('I18N-10: preserva claves existentes en el acumulador', () => {
    const existing = { existing: 'data' };
    const result = flattenObject({ new: 'value' }, '', existing);
    expect(result).toEqual({ existing: 'data', new: 'value' });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// sanitizeHTML — Defensa contra XSS
// ═══════════════════════════════════════════════════════════════════════

describe('i18n.js — sanitizeHTML (XSS Prevention)', () => {
  // I18N-11
  it('I18N-11: pasa HTML seguro sin modificaciones significativas', () => {
    const safe = '<p>Hola mundo</p>';
    const result = sanitizeHTML(safe);
    expect(result).toContain('<p>Hola mundo</p>');
  });

  // I18N-12
  it('I18N-12: elimina etiquetas <script>', () => {
    const xss = "<script>alert('xss')</script><p>Contenido seguro</p>";
    const result = sanitizeHTML(xss);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Contenido seguro</p>');
  });

  // I18N-13
  it('I18N-13: elimina etiquetas <iframe>', () => {
    const xss = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeHTML(xss);
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('evil.com');
  });

  // I18N-14
  it('I18N-14: elimina etiquetas object, embed y style', () => {
    const xss = '<object data="evil.swf"></object><embed src="evil.swf"><style>body{display:none}</style>';
    const result = sanitizeHTML(xss);
    expect(result).not.toContain('<object');
    expect(result).not.toContain('<embed');
    expect(result).not.toContain('<style');
  });

  // I18N-15
  it('I18N-15: elimina atributos on* (onclick, onerror, etc.)', () => {
    const xss = '<p onclick="alert(1)" onerror="steal()">text</p>';
    const result = sanitizeHTML(xss);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onerror');
    expect(result).toContain('text');
  });

  // I18N-16
  it('I18N-16: elimina javascript: en valores de atributos', () => {
    const xss = '<a href="javascript:void(0)">link</a>';
    const result = sanitizeHTML(xss);
    expect(result).not.toContain('javascript:');
  });

  // I18N-17
  it('I18N-17: maneja HTML con caracteres especiales correctamente', () => {
    const html = '<p>Caf&eacute; &amp; t&eacute;</p>';
    const result = sanitizeHTML(html);
    expect(result).toContain('Café');
    expect(result).toContain('&amp;');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// replaceTokensInDOM
// ═══════════════════════════════════════════════════════════════════════

describe('i18n.js — replaceTokensInDOM', () => {
  // I18N-18
  it('I18N-18: reemplaza tokens en nodos de texto', () => {
    document.body.innerHTML = '<p>{greeting} mundo</p>';
    const tokenMap = { greeting: 'Hola' };
    replaceTokensInDOM(document.body, tokenMap);
    expect(document.body.textContent).toContain('Hola mundo');
  });

  // I18N-19
  it('I18N-19: reemplaza tokens en atributos de elementos', () => {
    document.body.innerHTML = '<a href="{url}">Link</a>';
    const tokenMap = { url: 'https://example.com' };
    replaceTokensInDOM(document.body, tokenMap);
    const link = document.querySelector('a');
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  // I18N-20
  it('I18N-20: tokens sin valor en mapa no causan errores', () => {
    document.body.innerHTML = '<p>{unknown_token}</p>';
    const tokenMap = { other: 'value' };
    expect(() => {
      replaceTokensInDOM(document.body, tokenMap);
    }).not.toThrow();
    // El token sin match se mantiene
    expect(document.body.textContent).toContain('{unknown_token}');
  });

  // I18N-21: Contenido HTML en reemplazo
  it('I18N-21: inyecta HTML sanitizado cuando el reemplazo contiene tags', () => {
    document.body.innerHTML = '<div>{content}</div>';
    const tokenMap = { content: '<strong>Texto negrita</strong>' };
    replaceTokensInDOM(document.body, tokenMap);
    const strong = document.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong.textContent).toBe('Texto negrita');
  });

  // I18N-22: Contenido solo texto
  it('I18N-22: reemplaza tokens de solo texto via textNode.nodeValue', () => {
    document.body.innerHTML = '<span>Versión: {version}</span>';
    const tokenMap = { version: 'v2.3.0' };
    replaceTokensInDOM(document.body, tokenMap);
    expect(document.body.textContent).toContain('Versión: v2.3.0');
  });
});
