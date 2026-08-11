import { describe, it, expect, beforeEach } from 'vitest';
import './component-template.js';

describe('Custom Component: <app-custom-element>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('debe registrarse e instanciarse en el DOM correctamente', () => {
    const element = document.createElement('app-custom-element');
    document.body.appendChild(element);

    expect(element).not.toBeNull();
    expect(element.tagName.toLowerCase()).toBe('app-custom-element');
  });

  it('debe renderizar el contenedor interno', () => {
    const element = document.createElement('app-custom-element');
    document.body.appendChild(element);

    const container = element.querySelector('.app-custom-element-container');
    expect(container).not.toBeNull();
  });
});
