/**
 * COMPONENTE PERSONALIZADO
 * Nombre: bap-logo
 *
 * Componente genérico y portable para desplegar la identidad visual del sitio.
 * Reemplaza las referencias rígidas a gaf-logo.
 */
import { CONSTANT, ENV_URL } from "../../_main/constants.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

/**
 * Pre-renderiza la plantilla HTML inyectando la imagen o el SVG correspondiente.
 * 
 * @param {string} html - Plantilla HTML del componente.
 * @param {Object} props - Propiedades leídas de los atributos del componente.
 * @returns {string} Plantilla HTML con el logo inyectado dinámicamente.
 */
function preRender(html, props) {
  return html
}

function postRender(props) { }

export class BapLogo extends HTMLElement {
  /**
   * Ciclo de vida conectado de W3C Custom Elements.
   * Lee atributos dinámicos y delega en createCustomComponent.
   */
  connectedCallback() {

    const props = {
      id: "BaP-Logo",
    };

    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-logo/bap-logo.css",
      htmlPath: ENV_URL + "/_components/bap-logo/bap-logo.html",
      preRender,
      postRender,
      props,
    });
  }
}
