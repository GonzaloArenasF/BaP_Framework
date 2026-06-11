import { BapHeader } from "./bap-header/bap-header.js";
import { BapFooter } from "./bap-footer/bap-footer.js";
import { BapNotification } from "./bap-notification/bap-notification.js";
import { BapSpinner } from "./bap-spinner/bap-spinner.js";
import { BapLoadingState } from "./bap-loading-state/bap-loading-state.js";
import { BapSvgImage } from "./bap-svg-image/bap-svg-image.js";
import { BapChip } from "./bap-chip/bap-chip.js";
import { BapLogo } from "./bap-logo/bap-logo.js";
import { BapDialog } from "./bap-dialog/bap-dialog.js";
import { isCSSIncluded } from "../_main/util.js";

/**
 * Constructor para componentes personalizados
 *
 * @param {HTMLElement} element - Instancia del elemento.
 * @param {Object} configuracion - Configuración de inicialización del componente.
 * @param {string} configuracion.cssPath - Ruta URL del archivo CSS.
 * @param {string} [configuracion.htmlPath] - Ruta URL del archivo HTML. Se omite si se provee htmlCode.
 * @param {string} [configuracion.htmlCode] - Código HTML directo. Se omite si se provee htmlPath.
 * @param {Function} [configuracion.preRender] - Función a ejecutar antes de añadir el componente al DOM.
 * @param {Function} [configuracion.postRender] - Función a ejecutar después de añadir el componente al DOM.
 * @param {Object} [configuracion.props] - Propiedades personalizadas a pasar a los callbacks.
 * @param {string} [configuracion.props.id] - Identificador opcional para el elemento principal.
 */
export function createCustomComponent(element, { cssPath, htmlPath, htmlCode, preRender, postRender, props }) {
  try {
    const elementID = `bapCustomId${Math.floor(Math.random() * (9999999999999 - 0 + 1)) + 0}`;

    if (!cssPath) {
      throw new Error("cssPath is not provided");
    }

    if (!htmlPath && !htmlCode) {
      throw new Error("html is not provided");
    }

    if (!props) {
      props = {
        id: elementID,
      };
    }

    if (!props.id) {
      props.id = elementID;
    }

    // CSS file
    if (!isCSSIncluded(cssPath)) {
      const link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", cssPath);
      document.head.appendChild(link);
    }

    // HTML
    if (htmlPath) {
      // NEW-06: Fetch con AbortController (timeout 8s) y validación de response.ok.
      // Sin esto, un servidor caído o respuesta HTTP 4xx/5xx se procesaría como HTML válido,
      // inyectando la página de error del servidor en el componente.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      fetch(htmlPath, { signal: controller.signal })
        .then((response) => {
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error(`createCustomComponent(): Error HTTP ${response.status} al cargar ${htmlPath}`);
          }
          return response.text();
        })
        .then((html) => {
          const template = document.createElement("template");
          template.innerHTML = preRender ? preRender(html, props) : html;
          element.parentNode ? element.parentNode.appendChild(template.content.cloneNode(true)) : null;
          element.remove();
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          if (err.name === "AbortError") {
            console.error(`createCustomComponent(): Timeout (8s) al cargar ${htmlPath}`);
          } else {
            console.error(err.message || err);
          }
        })
        .finally(() => {
          postRender ? postRender(props) : null;
        });
    } else {
      element.innerHTML = preRender ? preRender(htmlCode, props) : htmlCode;
      postRender ? postRender(element, props) : null;
    }
  } catch (error) {
    console.error("createCustomComponent()", error);
  }
}

/**
 * Agrega todos los componentes personalizados al DOM
 */
export function setCustomComponents() {
  // Componentes de BaP
  !customElements.get("bap-header") ? customElements.define("bap-header", BapHeader) : null;
  !customElements.get("bap-footer") ? customElements.define("bap-footer", BapFooter) : null;
  !customElements.get("bap-notification") ? customElements.define("bap-notification", BapNotification) : null;
  !customElements.get("bap-spinner") ? customElements.define("bap-spinner", BapSpinner) : null;
  !customElements.get("bap-loading-state") ? customElements.define("bap-loading-state", BapLoadingState) : null;
  !customElements.get("bap-svg-image") ? customElements.define("bap-svg-image", BapSvgImage) : null;
  !customElements.get("bap-chip") ? customElements.define("bap-chip", BapChip) : null;
  !customElements.get("bap-logo") ? customElements.define("bap-logo", BapLogo) : null;
  !customElements.get("bap-dialog") ? customElements.define("bap-dialog", BapDialog) : null;

  // Componentes adicionales personalizados
}
