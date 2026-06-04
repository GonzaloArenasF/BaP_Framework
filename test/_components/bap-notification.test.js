/**
 * Tests para bap-notification.js — Componente de Notificación
 * Grupo: 🔵 Prioridad Media
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BapNotification } from '../../src/_components/bap-notification/bap-notification.js';

// Registrar el custom element para poder instanciarlo
if (!customElements.get('bap-notification')) {
  customElements.define('bap-notification', BapNotification);
}

const mockHtml = `<div id="BapNotification" class="bap-notification hide {bap-notification-type} {bap-notification-severity}">
  <span>{bap-notification-message}</span>
  <b>&times;</b>
</div>`;

describe('bap-notification.js — Web Component', () => {
  let element;

  beforeEach(() => {
    vi.useFakeTimers();
    // Limpiar DOM
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
    element = document.createElement('bap-notification');
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    element.innerHTML = innerHTML;
    document.body.appendChild(element);

    // Esperar a que los promises de fetch y then/finally se resuelvan
    await vi.waitFor(() => {
      expect(element.shadowRoot.getElementById('BapNotification')).not.toBeNull();
    });
    
    return element.shadowRoot.getElementById('BapNotification');
  }

  // NOT-01
  it('NOT-01: crea el Shadow DOM', async () => {
    await createComponent();
    expect(element.shadowRoot).not.toBeNull();
    expect(element.shadowRoot.mode).toBe('open');
  });

  // NOT-02
  it('NOT-02: setConfiguration con type=toast asigna clase correcta', async () => {
    const wrapper = await createComponent({ type: 'toast' });
    expect(wrapper.classList.contains('type-toast')).toBe(true);
  });

  // NOT-03
  it('NOT-03: setConfiguration con severity=error asigna clase correcta', async () => {
    const wrapper = await createComponent({ severity: 'error' });
    expect(wrapper.classList.contains('severity-error')).toBe(true);
  });

  // NOT-04
  it('NOT-04: setConfiguration sin message muestra "Sin mensaje"', async () => {
    const wrapper = await createComponent({}, '');
    expect(wrapper.innerHTML).toContain('Sin mensaje');
  });

  // NOT-05
  it('NOT-05: setConfiguration sin type ni severity asume defaults (type-toast, severity-error)', async () => {
    const wrapper = await createComponent();
    expect(wrapper.classList.contains('type-toast')).toBe(true);
    expect(wrapper.classList.contains('severity-error')).toBe(true);
  });

  // NOT-06
  it('NOT-06: Auto-remove para severity=info programa remoción', async () => {
    const wrapper = await createComponent({ severity: 'info', show: 'true' });
    expect(wrapper.classList.contains('show')).toBe(true);

    // Avanzar el tiempo simulado > 4000ms
    vi.advanceTimersByTime(4500);

    // El setTimeout hace bapNotification.remove() (el ShadowRoot wrapper, no el elemento padre custom)
    // Actually, in the source code it does: `bapNotification.remove();` where `bapNotification` is the inner div.
    expect(element.shadowRoot.getElementById('BapNotification')).toBeNull();
  });

  // NOT-07
  it('NOT-07: Show attribute activa clase show', async () => {
    const wrapper = await createComponent({ show: 'true' });
    expect(wrapper.classList.contains('show')).toBe(true);
  });

  // NOT-08
  it('NOT-08: Botón cerrar remueve clase show', async () => {
    const wrapper = await createComponent({ show: 'true' });
    expect(wrapper.classList.contains('show')).toBe(true);

    const closeBtn = wrapper.children[1];
    closeBtn.click();

    expect(wrapper.classList.contains('show')).toBe(false);
  });
});
