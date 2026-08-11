/**
 * Custom Element: <app-custom-element>
 * Descripción: Componente personalizado para la aplicación.
 */
class AppCustomElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="app-custom-element-container">
        <slot></slot>
      </div>
    `;
  }
}

if (!customElements.get('app-custom-element')) {
  customElements.define('app-custom-element', AppCustomElement);
}

export { AppCustomElement };
