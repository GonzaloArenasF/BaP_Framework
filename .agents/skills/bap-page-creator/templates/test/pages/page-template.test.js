import { describe, it, expect, beforeEach } from 'vitest';

describe('Página: Template', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <bap-header></bap-header>
      <main class="bap-main-container">
        <h1 class="bap-title">Título de Prueba</h1>
      </main>
      <bap-footer></bap-footer>
    `;
  });

  it('debe renderizar la estructura HTML básica sin errores', () => {
    const main = document.querySelector('.bap-main-container');
    expect(main).not.toBeNull();
  });

  it('debe contener el elemento de título principal', () => {
    const h1 = document.querySelector('h1.bap-title');
    expect(h1).not.toBeNull();
    expect(h1.textContent).toBe('Título de Prueba');
  });
});
