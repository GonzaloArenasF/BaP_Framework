import { isMobile } from "../../_main/util.js";
import { icons, iconSizes } from "./icons.js";
// sanitizeHTML usa DOMPurify (allowlist) para neutralizar cualquier contenido SVG malicioso
// antes de inyectarlo en el innerHTML. Aunque icons.js es estático y controlado por el desarrollador,
// esta capa de defensa protege ante extensiones futuras del mapa de iconos desde fuentes externas.
import { sanitizeHTML } from "../../_main/i18n.js";

/**
 * CUSTOM COMPONENT
 * Name: bap-svg-image
 *
 * SVG images
 *
 * ⚠️  SEGURIDAD: El mapa de iconos `icons.js` debe contener ÚNICAMENTE contenido SVG estático
 *     controlado por el desarrollador del framework (paths, grupos, clipPaths, etc.).
 *     NO debe cargarse contenido SVG desde fuentes externas, Firebase RTDB, o input de usuario
 *     sin sanitización previa, ya que SVG puede contener event handlers y scripts ejecutables.
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

      // NEW-02: Sanitizar el contenido SVG con DOMPurify antes de inyectarlo.
      // Defensa en profundidad: protege ante extensiones futuras del mapa de iconos
      // que pudieran incluir contenido SVG de fuentes no controladas.
      const safeSvgContent = sanitizeHTML(images[type][name]);

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
            ${safeSvgContent}
          </svg>
        </figure>
      `;
    } catch (error) {
      console.error("Error al importar la imagen SVG:", error);
    }
  }
}
