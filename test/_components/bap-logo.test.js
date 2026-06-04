/**
 * Tests para bap-logo.js
 * Grupo: 🟣 Prioridad Complementaria (Coverage)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BapLogo } from '../../src/_components/bap-logo/bap-logo.js';
import * as customReg from '../../src/_components/customComponentsRegistration.js';
import { ENV_URL } from '../../src/_main/constants.js';

// Mock dependencias
vi.mock('../../src/_components/customComponentsRegistration.js', () => ({
  createCustomComponent: vi.fn(),
}));

describe('bap-logo.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('LOG-01: BapLogo debe invocar createCustomComponent con los parámetros correctos en connectedCallback', () => {
    if (!customElements.get('bap-logo')) {
      customElements.define('bap-logo', BapLogo);
    }

    const el = document.createElement('bap-logo');
    document.body.appendChild(el);

    expect(customReg.createCustomComponent).toHaveBeenCalledTimes(1);
    
    // Validar argumentos
    const callArgs = customReg.createCustomComponent.mock.calls[0];
    expect(callArgs[0]).toBe(el);
    expect(callArgs[1]).toHaveProperty('cssPath', ENV_URL + '/_components/bap-logo/bap-logo.css');
    expect(callArgs[1]).toHaveProperty('htmlPath', ENV_URL + '/_components/bap-logo/bap-logo.html');
    expect(typeof callArgs[1].preRender).toBe('function');
    expect(typeof callArgs[1].postRender).toBe('function');
    expect(callArgs[1].props).toEqual({ id: 'BaP-Logo' });

    // Validar preRender
    expect(callArgs[1].preRender('<template></template>', {})).toBe('<template></template>');

    // Validar postRender
    expect(callArgs[1].postRender({})).toBeUndefined();

    document.body.removeChild(el);
  });
});
