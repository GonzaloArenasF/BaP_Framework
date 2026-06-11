/**
 * Tests para customComponentsRegistration.js — Constructor de Componentes
 * Grupo: 🔵 Prioridad Media
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCustomComponent, setCustomComponents } from '../../src/_components/customComponentsRegistration.js';

describe('customComponentsRegistration.js — createCustomComponent', () => {
  let element;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    element = document.createElement('div');
    document.body.appendChild(element);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // CCR-03
  it('CCR-03: lanza error si no se provee cssPath', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    createCustomComponent(element, {
      htmlCode: '<div></div>'
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('createCustomComponent()', expect.any(Error));
    expect(consoleSpy.mock.calls[0][1].message).toBe('cssPath is not provided');
  });

  // CCR-04
  it('CCR-04: lanza error si no se provee htmlPath ni htmlCode', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    createCustomComponent(element, {
      cssPath: '/test.css'
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('createCustomComponent()', expect.any(Error));
    expect(consoleSpy.mock.calls[0][1].message).toBe('html is not provided');
  });

  // CCR-01, CCR-06, CCR-07, CCR-08, CCR-09
  it('CCR-01, CCR-06, CCR-07, CCR-08, CCR-09: renderiza con htmlCode, agrega CSS, ejecuta preRender/postRender y asinga props', () => {
    const preRender = vi.fn((html, props) => html.replace('{id}', props.id));
    const postRender = vi.fn();

    createCustomComponent(element, {
      cssPath: '/test.css',
      htmlCode: '<span id="{id}">Hello</span>',
      preRender,
      postRender
    });

    // CCR-06: Verifica CSS
    const link = document.head.querySelector('link[href="/test.css"]');
    expect(link).not.toBeNull();

    // CCR-01: Verifica HTML (element.innerHTML debe ser seteado)
    expect(element.innerHTML).toContain('<span id="');
    expect(element.innerHTML).toContain('">Hello</span>');

    // CCR-07: Verifica preRender
    expect(preRender).toHaveBeenCalled();
    const propsArg = preRender.mock.calls[0][1];
    
    // CCR-09: Verifica que props.id se generó si no existía
    expect(propsArg.id).toMatch(/^bapCustomId\d+$/);

    // CCR-08: Verifica postRender
    expect(postRender).toHaveBeenCalledWith(element, propsArg);
  });

  // CCR-05
  it('CCR-05: no duplica el CSS si ya está incluido', () => {
    const link = document.createElement('link');
    link.href = '/test.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    createCustomComponent(element, {
      cssPath: '/test.css',
      htmlCode: '<div></div>'
    });

    const links = document.head.querySelectorAll('link[href="/test.css"]');
    expect(links.length).toBe(1); // No debe haberse agregado un segundo
  });

  // CCR-02
  it('CCR-02: renderiza con htmlPath usando fetch', async () => {
    const mockHtml = '<p>Template {id}</p>';
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml)
      })
    );

    const preRender = vi.fn((html, props) => html.replace('{id}', props.id));
    const postRender = vi.fn();

    createCustomComponent(element, {
      cssPath: '/test.css',
      htmlPath: '/template.html',
      preRender,
      postRender
    });

    // En htmlPath, la lógica usa promesas, esperamos a que se resuelvan
    await vi.waitFor(() => {
      // Con htmlPath, inserta el contenido en un template, lo clona antes o despues del element original, y borra el original.
      expect(document.body.innerHTML).toContain('<p>Template bapCustomId');
      expect(postRender).toHaveBeenCalled();
    });
  });
});

describe('customComponentsRegistration.js — setCustomComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CCR-10: registra los componentes si no existen', () => {
    const defineSpy = vi.spyOn(customElements, 'define');
    
    // Mock customElements.get to return false for our components
    const getSpy = vi.spyOn(customElements, 'get').mockReturnValue(undefined);

    setCustomComponents();

    expect(defineSpy).toHaveBeenCalledTimes(9);
    expect(defineSpy).toHaveBeenCalledWith('bap-header', expect.anything());
    expect(defineSpy).toHaveBeenCalledWith('bap-dialog', expect.anything());
    // ...
  });

  it('CCR-11: no lanza error ni duplica el registro si ya existen', () => {
    const defineSpy = vi.spyOn(customElements, 'define');
    
    // Mock customElements.get to return true (already defined)
    const getSpy = vi.spyOn(customElements, 'get').mockReturnValue(class {});

    setCustomComponents();

    expect(defineSpy).not.toHaveBeenCalled();
  });
});
