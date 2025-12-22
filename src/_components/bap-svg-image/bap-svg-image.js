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
 * Attributes:
 * name: SVG name in images object.
 * size: value in sizes object.
 */
export class BapSvgImage extends HTMLElement {
  constructor() {
    super();

    try {
      const name = this.getAttribute("name");
      const mobileSize = this.getAttribute("mobile-size");
      const size = isMobile() && mobileSize ? mobileSize : this.getAttribute("size");
      const type = this.hasAttribute("type") ? this.getAttribute("type") : "icon";

      if (!name || !size) {
        const missedParameter = !name ? "name" : "size";
        throw new Error(`${missedParameter} propertie is missed.`);
      }

      if (!Object.keys(images[type]).includes(name)) {
        throw new Error(`Requested image does not exist: [${type}] ${name}`);
      }

      this.outerHTML = `<figure style="width:${sizes[type][size].px}px; height:${sizes[type][size].px}px; display: flex; justify-content: center; align-items: center;">
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
                        </figure>`;
    } catch (error) {
      console.error("SVG image import:", error);
    }
  }
}
