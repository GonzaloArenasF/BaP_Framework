import { isMobile } from '../../_main/util.js';

/**
 * CUSTOM COMPONENT
 * Name: bap-svg-image
 *
 * SVG images
 */
const images = {
  chevronLeft: `<path d="M4.07895 7.46963L10.1522 1.39641C10.4451 1.1035 10.92 1.1035 11.2129 1.39641L11.9212 2.10475C12.2136 2.39716 12.2142 2.87106 11.9224 3.16416L7.10929 7.99997L11.9224 12.8358C12.2142 13.1288 12.2136 13.6028 11.9212 13.8952L11.2129 14.6035C10.9199 14.8964 10.4451 14.8964 10.1522 14.6035L4.07898 8.53028C3.78607 8.23741 3.78607 7.76253 4.07895 7.46963Z" fill="black"/>`,
};

const sizes = {
  x1: {
    px: 16,
    scale: 1,
  },
  x2: {
    px: 24,
    scale: 1.5,
  },
  x3: {
    px: 32,
    scale: 2,
  },
  x4: {
    px: 48,
    scale: 3,
  },
  x5: {
    px: 64,
    scale: 4,
  },
};

export class BapSvgImage extends HTMLElement {
  constructor() {
    super();

    try {
      const name = this.getAttribute("name");
      const mobileSize = this.getAttribute("mobile-size");
      const size = isMobile() && mobileSize ? mobileSize : this.getAttribute("size");

      if (!name || !size) {
        const missedParameter = !name ? "name" : "size";
        throw new Error(`${missedParameter} propertie is missed.`);
      }

      if (!Object.keys(images).includes(name)) {
        throw new Error("Requested image does not exist.");
      }

      this.outerHTML = `<figure height="${sizes[size].px}" width="${sizes[size].px}">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: scale(${sizes[size].scale})">
                            ${images[name]}
                          </svg>
                        </figure>`;
    } catch (error) {
      console.error("SVG image import:", error);
    }
  }
}
