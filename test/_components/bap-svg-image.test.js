/**
 * Tests para bap-svg-image.js — Componente SVG
 * Grupo: 🔵 Prioridad Media
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BapSvgImage } from '../../src/_components/bap-svg-image/bap-svg-image.js';
import * as util from '../../src/_main/util.js';

// Mockeamos la utilidad para controlar el isMobile()
vi.mock('../../src/_main/util.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isMobile: vi.fn(() => false)
  };
});

if (!customElements.get('bap-svg-image')) {
  customElements.define('bap-svg-image', BapSvgImage);
}

describe('bap-svg-image.js — Web Component', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // SVG-01
  it('SVG-01: renderiza correctamente con name y size válidos', () => {
    element = document.createElement('bap-svg-image');
    element.setAttribute('name', 'book');
    element.setAttribute('size', 'x1');
    document.body.appendChild(element);

    const figure = element.querySelector('figure');
    expect(figure).not.toBeNull();
    // En sizes.icon.x1.px es 20
    expect(figure.style.width).toBe('20px');
    
    const svg = element.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 2 20 20');
  });

  // SVG-02
  it('SVG-02: lanza error si falta el atributo name', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    element = document.createElement('bap-svg-image');
    element.setAttribute('size', 'x1');
    document.body.appendChild(element); // Esto dispara el connectedCallback

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al importar la imagen SVG:',
      expect.objectContaining({ message: 'La propiedad name es requerida.' })
    );
  });

  // SVG-03
  it('SVG-03: lanza error si falta el atributo size', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    element = document.createElement('bap-svg-image');
    element.setAttribute('name', 'book');
    document.body.appendChild(element);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al importar la imagen SVG:',
      expect.objectContaining({ message: 'La propiedad size es requerida.' })
    );
  });

  // SVG-04
  it('SVG-04: lanza error si el nombre de la imagen no existe', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    element = document.createElement('bap-svg-image');
    element.setAttribute('name', 'missing_icon');
    element.setAttribute('size', 'x1');
    document.body.appendChild(element);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al importar la imagen SVG:',
      expect.objectContaining({ message: 'La imagen solicitada no existe: [icon] missing_icon' })
    );
  });

  // SVG-05
  it('SVG-05: usa el mobile-size cuando isMobile es true', () => {
    util.isMobile.mockReturnValue(true);

    element = document.createElement('bap-svg-image');
    element.setAttribute('name', 'book');
    element.setAttribute('size', 'x1');
    element.setAttribute('mobile-size', 'x2');
    document.body.appendChild(element);

    const figure = element.querySelector('figure');
    expect(figure).not.toBeNull();
    // En sizes.icon.x2.px es 35
    expect(figure.style.width).toBe('35px');
  });
});
