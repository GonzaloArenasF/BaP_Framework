import { isMobile } from "../../_main/util.js";
import { icons, iconSizes } from "./icons.js";

/**
 * CUSTOM COMPONENT
 * Name: bap-svg-image
 *
 * SVG images
 */

const images = {
  icon: icons,
};

const sizes = {
  icon: iconSizes,
};

/**
 * COMPONENTE PERSONALIZADO
 * Nombre: bap-svg-image
 *
 * Clase para renderizar imágenes SVG estandarizadas y responsivas
 * en base a su nombre, tamaño y tipo.
 */
export class BapSvgImage extends HTMLElement {
  /**
   * Método de ciclo de vida invocado cuando el elemento se añade al DOM.
   * Lee los atributos y realiza la inyección del marcado SVG de forma limpia en el innerHTML.
   */
  connectedCallback() {
    try {
      const name = this.getAttribute("name");
      const mobileSize = this.getAttribute("mobile-size");
      const size = isMobile() && mobileSize ? mobileSize : this.getAttribute("size");
      const type = this.hasAttribute("type") ? this.getAttribute("type") : "icon";

      if (!name || !size) {
        const parametroFaltante = !name ? "name" : "size";
        throw new Error(`La propiedad ${parametroFaltante} es requerida.`);
      }

      if (!Object.keys(images[type]).includes(name)) {
        throw new Error(`La imagen solicitada no existe: [${type}] ${name}`);
      }

      // Inyección limpia en el innerHTML en lugar de outerHTML
      this.innerHTML = `
        <figure style="width:${sizes[type][size].px}px; height:${sizes[type][size].px}px; display: flex; justify-content: center; align-items: center;">
          <svg 
            width="${sizes[type][size].px}" 
            height="${sizes[type][size].px}" 
            viewBox="${sizes[type][size].viewBox}" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            style="transform: scale(${sizes[type][size].scale});"
          >
            ${images[type][name]}
          </svg>
        </figure>
      `;
    } catch (error) {
      console.error("Error al importar la imagen SVG:", error);
    }
  }
}
