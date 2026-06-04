/**
 * Tests para Componentes Simples (bap-header, bap-footer, bap-chip, bap-spinner, bap-loading-state)
 * Grupo: 🔵 Prioridad Media
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BapHeader } from '../../src/_components/bap-header/bap-header.js';
import { BapFooter } from '../../src/_components/bap-footer/bap-footer.js';
import { BapChip } from '../../src/_components/bap-chip/bap-chip.js';
import { BapSpinner } from '../../src/_components/bap-spinner/bap-spinner.js';
import { BapLoadingState } from '../../src/_components/bap-loading-state/bap-loading-state.js';
import { CONSTANT } from '../../src/_main/constants.js';

if (!customElements.get('bap-header')) customElements.define('bap-header', BapHeader);
if (!customElements.get('bap-footer')) customElements.define('bap-footer', BapFooter);
if (!customElements.get('bap-chip')) customElements.define('bap-chip', BapChip);
if (!customElements.get('bap-spinner')) customElements.define('bap-spinner', BapSpinner);
if (!customElements.get('bap-loading-state')) customElements.define('bap-loading-state', BapLoadingState);
// bap-logo mock to prevent errors when header queries it
if (!customElements.get('bap-logo')) customElements.define('bap-logo', class extends HTMLElement {});

// HTML Mocks
const htmlMocks = {
  header: '<div class="bap-header">{color-mode} {lightMode} {darkMode} <span data-mode="light">Light</span> <span data-mode="dark">Dark</span> <span class="menu">Menu</span> <bap-logo></bap-logo></div>',
  footer: '<div class="bap-footer">{APP_VERSION} {tc} {socialMedia.email.url}</div>',
  chip: '<div class="bap-chip">{label}</div>',
  spinner: '<div class="bap-spinner"></div>',
  loadingState: '<div class="bap-loading-state">{message} {sub-message}</div>'
};

describe('Componentes Simples', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.className = '';
    vi.clearAllMocks();
    CONSTANT.IS_PROD = false;

    // Mock fetch
    global.fetch = vi.fn((url) => {
      let html = '';
      if (url.includes('bap-header')) html = htmlMocks.header;
      else if (url.includes('bap-footer')) html = htmlMocks.footer;
      else if (url.includes('bap-chip')) html = htmlMocks.chip;
      else if (url.includes('bap-spinner')) html = htmlMocks.spinner;
      else if (url.includes('bap-loading-state')) html = htmlMocks.loadingState;
      return Promise.resolve({ text: () => Promise.resolve(html) });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // BapHeader Tests
  describe('BapHeader', () => {
    // HDR-01
    it('HDR-01: preRender reemplaza tokens', async () => {
      element = document.createElement('bap-header');
      element.setAttribute('color-mode', 'dark');
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(document.querySelector('.bap-header')).not.toBeNull();
      });

      const header = document.querySelector('.bap-header');
      expect(header.innerHTML).toContain('dark');
      // Los defaults de fallback si no carga el i18n son Light/Dark
      expect(header.innerHTML).toMatch(/Light|Dark/);
    });

    // HDR-02
    it('HDR-02: postRender activa theme toggle', async () => {
      element = document.createElement('bap-header');
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(document.querySelector('.bap-header')).not.toBeNull();
      });

      const header = document.querySelector('.bap-header');
      const lightBtn = header.querySelector('[data-mode="light"]');
      const darkBtn = header.querySelector('[data-mode="dark"]');

      darkBtn.click();
      expect(document.body.classList.contains('dark-mode')).toBe(true);
      expect(header.classList.contains('dark-mode')).toBe(true);
      expect(darkBtn.classList.contains('active')).toBe(true);
      expect(lightBtn.classList.contains('active')).toBe(false);
    });

    // HDR-03
    it('HDR-03: persiste preferencia de color en localStorage', async () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      
      element = document.createElement('bap-header');
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(document.querySelector('.bap-header')).not.toBeNull();
      });

      // Esperar a que el postRender termine y aplique el modo inicial
      await vi.waitFor(() => {
        expect(setItemSpy).toHaveBeenCalled(); // Se llama una vez con el default (light o guardado)
      });
      setItemSpy.mockClear();

      const darkBtn = document.querySelector('.bap-header [data-mode="dark"]');
      darkBtn.click();

      // Verificar que se haya guardado
      expect(setItemSpy).toHaveBeenCalledWith('bap-color-mode', 'dark');
    });

    // HDR-04
    it('HDR-04: restaura preferencia de color desde localStorage', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('dark');
      
      element = document.createElement('bap-header');
      document.body.appendChild(element);

      // Debe inicializarse en dark
      await vi.waitFor(() => {
        expect(document.body.classList.contains('dark-mode')).toBe(true);
      });
    });
  });

  // BapFooter Tests
  describe('BapFooter', () => {
    // FTR-01
    it('FTR-01: preRender en no-producción reemplaza tokens', async () => {
      CONSTANT.IS_PROD = false;
      
      element = document.createElement('bap-footer');
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(document.querySelector('.bap-footer')).not.toBeNull();
      });

      const footer = document.querySelector('.bap-footer');
      // Debe haber reemplazado el tag {APP_VERSION}
      expect(footer.innerHTML).not.toContain('{APP_VERSION}');
    });

    // FTR-02
    it('FTR-02: preRender en producción no modifica el HTML', async () => {
      CONSTANT.IS_PROD = true;
      
      element = document.createElement('bap-footer');
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(document.querySelector('.bap-footer')).not.toBeNull();
      });

      const footer = document.querySelector('.bap-footer');
      // En prod, no reemplaza los tokens, así que debe mantenerse el HTML original
      expect(footer.innerHTML).toContain('{APP_VERSION}');
    });
  });

  // BapChip Tests
  describe('BapChip', () => {
    // CHP-01
    it('CHP-01: preRender reemplaza label', async () => {
      element = document.createElement('bap-chip');
      element.innerHTML = 'Mi etiqueta';
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(document.querySelector('.bap-chip')).not.toBeNull();
      });

      const chip = document.querySelector('.bap-chip');
      expect(chip.innerHTML).toContain('Mi etiqueta');
    });
  });

  // BapSpinner Tests
  describe('BapSpinner', () => {
    // SPN-01
    it('SPN-01: constructor inicializa el componente', async () => {
      element = document.createElement('bap-spinner');
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(document.querySelector('.bap-spinner')).not.toBeNull();
      });
    });
  });

  // BapLoadingState Tests
  describe('BapLoadingState', () => {
    // LDS-01
    it('LDS-01: renderiza con mensaje', async () => {
      element = document.createElement('bap-loading-state');
      element.innerHTML = 'Cargando datos...';
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(element.shadowRoot).not.toBeNull();
        expect(element.shadowRoot.innerHTML).toContain('Cargando datos...');
      });
    });

    // LDS-02
    it('LDS-02: renderiza con sub-message', async () => {
      element = document.createElement('bap-loading-state');
      element.setAttribute('sub-message', 'Por favor espere');
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(element.shadowRoot).not.toBeNull();
        expect(element.shadowRoot.innerHTML).toContain('<h3>Por favor espere</h3>');
      });
    });

    // LDS-03
    it('LDS-03: no renderiza h3 sin sub-message', async () => {
      element = document.createElement('bap-loading-state');
      document.body.appendChild(element);

      await vi.waitFor(() => {
        expect(element.shadowRoot).not.toBeNull();
        expect(element.shadowRoot.innerHTML).not.toContain('<h3>');
      });
    });
  });
});
