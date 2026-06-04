/**
 * Tests para bap-dialog.js — Componente Dialog Premium
 * Grupo: 🔵 Prioridad Media
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BapDialog } from '../../src/_components/bap-dialog/bap-dialog.js';

if (!customElements.get('bap-dialog')) {
  customElements.define('bap-dialog', BapDialog);
}

const mockHtml = `<div class="bap-dialog-backdrop" id="{dialog-id}-backdrop">
  <div class="bap-dialog-card" id="{dialog-id}-card">
    <button class="bap-dialog-close-btn" id="{dialog-id}-close" aria-label="Cerrar">&times;</button>
    <div class="bap-dialog-header">
      {image-header-left-markup}
      <div class="bap-dialog-titles">
        {title-top-markup}
        {title-main-markup}
        {title-sub-markup}
      </div>
      {image-header-right-markup}
    </div>
    {image-detail-markup}
    <div class="bap-dialog-body" id="{dialog-id}-body">
      {dialog-body-content}
    </div>
    <div class="bap-dialog-actions" id="{dialog-id}-actions">
      {dialog-links-markup}
    </div>
  </div>
</div>`;

describe('bap-dialog.js — Web Component', () => {
  let element;

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    
    // Mockear fetch para la plantilla HTML
    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(mockHtml)
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function createComponent(attributes = {}, innerHTML = '') {
    element = document.createElement('bap-dialog');
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    element.innerHTML = innerHTML;
    document.body.appendChild(element);

    // Esperar a que la promesa de fetch y createCustomComponent se resuelvan.
    // bap-dialog reemplaza el custom element con la plantilla (element.remove() se llama en createCustomComponent).
    // El id del componente está en los atributos o autogenerado.
    const expectedId = attributes.id || element.getAttribute('id');
    
    await vi.waitFor(() => {
      // Si no pasamos ID, bap-dialog lo autogenera y lo usa. 
      // Si esperamos que un backdrop exista:
      expect(document.querySelector('.bap-dialog-backdrop')).not.toBeNull();
    });
    
    return document.querySelector('.bap-dialog-backdrop');
  }

  // DLG-01 & DLG-15
  it('DLG-01 & DLG-15: lee atributos e inyecta ID en el markup', async () => {
    const backdrop = await createComponent({ id: 'test-dialog' });
    expect(backdrop.id).toBe('test-dialog-backdrop');
    expect(document.getElementById('test-dialog-close')).not.toBeNull();
  });

  // DLG-02
  it('DLG-02: inyecta imágenes de encabezado y detalle', async () => {
    const backdrop = await createComponent({
      'image-header-left': 'left.jpg',
      'image-header-right': 'right.jpg',
      'image-detail': 'detail.jpg'
    });
    expect(backdrop.innerHTML).toContain('src="left.jpg"');
    expect(backdrop.innerHTML).toContain('src="right.jpg"');
    expect(backdrop.innerHTML).toContain('src="detail.jpg"');
  });

  // DLG-03
  it('DLG-03: no inyecta etiquetas img si no hay atributos de imágenes', async () => {
    const backdrop = await createComponent();
    expect(backdrop.innerHTML).not.toContain('<img');
  });

  // DLG-04
  it('DLG-04: los títulos son sanitizados y mostrados', async () => {
    const backdrop = await createComponent({
      'title-top': '<script>alert(1)</script>Top',
      'title-main': 'Main',
      'title-sub': 'Sub'
    });
    // Se espera que sanitizeHTML quite el script (ya que la dependencia i18n real se importa)
    expect(backdrop.innerHTML).not.toContain('<script>');
    expect(backdrop.innerHTML).toContain('Top');
    expect(backdrop.innerHTML).toContain('<h2 class="title-main">Main</h2>');
    expect(backdrop.innerHTML).toContain('<h3 class="title-sub">Sub</h3>');
  });

  // DLG-05
  it('DLG-05: el body content es sanitizado', async () => {
    const backdrop = await createComponent({}, '<p>Body</p><script>bad()</script>');
    expect(backdrop.innerHTML).toContain('<p>Body</p>');
    expect(backdrop.innerHTML).not.toContain('<script>');
  });

  // DLG-06, DLG-07, DLG-09
  it('DLG-06, DLG-07, DLG-09: decodifica enlace Base64 seguro (https://) y texto', async () => {
    // https://example.com -> aHR0cHM6Ly9leGFtcGxlLmNvbQ==
    // Click Here -> Q2xpY2sgSGVyZQ==
    const backdrop = await createComponent({
      'link-url-base64': 'aHR0cHM6Ly9leGFtcGxlLmNvbQ==',
      'link-text-base64': 'Q2xpY2sgSGVyZQ=='
    });
    const link = backdrop.querySelector('a');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.textContent).toBe('Click Here');
  });

  // DLG-08
  it('DLG-08: bloquea URL con protocolo peligroso (javascript:)', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // javascript:alert(1) -> amF2YXNjcmlwdDphbGVydCgxKQ==
    const backdrop = await createComponent({
      'link-url-base64': 'amF2YXNjcmlwdDphbGVydCgxKQ==',
      'link-text-base64': 'Q2xpY2sgSGVyZQ=='
    });
    const link = backdrop.querySelector('a');
    expect(link).toBeNull(); // No debió inyectar el anchor
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('potencialmente peligroso'),
      'javascript:alert(1)'
    );
    consoleSpy.mockRestore();
  });

  // DLG-10
  it('DLG-10: permite URL con protocolo mailto:', async () => {
    // mailto:test@test.com -> bWFpbHRvOnRlc3RAdGVzdC5jb20=
    const backdrop = await createComponent({
      'link-url-base64': 'bWFpbHRvOnRlc3RAdGVzdC5jb20=',
      'link-text-base64': 'VGVzdA==' // Test
    });
    const link = backdrop.querySelector('a');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('mailto:test@test.com');
  });

  // DLG-11
  it('DLG-11: permite URL relativa sin esquema', async () => {
    // /path/to/page -> L3BhdGgvdG8vcGFnZQ==
    const backdrop = await createComponent({
      'link-url-base64': 'L3BhdGgvdG8vcGFnZQ==',
      'link-text-base64': 'VGVzdA=='
    });
    const link = backdrop.querySelector('a');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/path/to/page');
  });

  // DLG-12
  it('DLG-12: postRender muestra modal con animación (agrega clase show)', async () => {
    const backdrop = await createComponent();
    
    // Avanzar el timer para el timeout de 50ms en postRender
    vi.advanceTimersByTime(55);
    
    expect(backdrop.classList.contains('show')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  // DLG-13
  it('DLG-13: cierra modal al clickear el botón cerrar', async () => {
    const backdrop = await createComponent({ id: 'dialog13' });
    vi.advanceTimersByTime(55); // Mostrar
    
    const closeBtn = document.getElementById('dialog13-close');
    closeBtn.click();
    
    expect(backdrop.classList.contains('show')).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
    
    // Avanzar 300ms para remoción del DOM
    vi.advanceTimersByTime(350);
    expect(document.getElementById('dialog13-backdrop')).toBeNull();
  });

  // DLG-14
  it('DLG-14: cierra modal al clickear el backdrop directamente', async () => {
    const backdrop = await createComponent({ id: 'dialog14' });
    vi.advanceTimersByTime(55); // Mostrar
    
    // Click en la tarjeta no debe cerrar
    const card = document.getElementById('dialog14-card');
    card.click(); // no funciona pq el listener revisa si e.target === backdrop
    // Simular el evento directo al target correcto (backdrop)
    const event = new MouseEvent('click', { bubbles: true });
    // vi.fn override no nos sirve, tenemos que invocar dispatchEvent en el backdrop
    backdrop.dispatchEvent(event);
    
    expect(backdrop.classList.contains('show')).toBe(false);
  });
});
