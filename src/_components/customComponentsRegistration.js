import { BapHeader } from "./bap-header/bap-header.js";
import { BapFooter } from "./bap-footer/bap-footer.js";
import { BapNotification } from "./bap-notification/bap-notification.js";
import { BapSpinner } from "./bap-spinner/bap-spinner.js";
import { BapLoadingState } from "./bap-loading-state/bap-loading-state.js";
import { BapSvgImage } from "./bap-svg-image/bap-svg-image.js";
import { isCSSIncluded } from "../_main/util.js";

/**
 * Constructor for custom components
 *
 * @param element: <HTMLElement> Instance
 * @param cssPath: <string> css file URL path.
 * @param htmlPath: <string> html file URL path. If props.htmlCode this will omitted.
 * @param htmlCode: <string> html code. If props.htmlPath this will omitted.
 * @param preRender: <callback> Function to be executed before add component to the DOM.
 * @param postRender: <callback> Function to be executed after add component to the DOM.
 * @param props: <object> Properties to be included in callbacks functions.
 * - props.id: optional | <string> Id to identify the main element to add. You must to include in your custom HTML code and make the replace by preRender.
 */
export function createCustomComponent(element, { cssPath, htmlPath, htmlCode, preRender, postRender, props }) {
  try {
    const elementID = `bapCustomId${Math.floor(Math.random() * (9999999999999 - 0 + 1)) + 0}`;

    if (!cssPath) {
      throw new Error("cssPath is not provided");
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
      fetch(htmlPath)
        .then((response) => response.text())
        .then((html) => {
          const template = document.createElement("template");
          template.innerHTML = preRender ? preRender(html, props) : html;
          element.parentNode.appendChild(template.content.cloneNode(true));
          element.remove();
        })
        .finally(() => {
          postRender ? postRender(element, props) : null;
        });
    } else {
      const template = document.createElement("template");
      template.innerHTML = preRender ? preRender(htmlCode, props) : htmlCode;
      element.appendChild(template.content.cloneNode(true));
      postRender ? postRender(element, props) : null;
    }
  } catch (error) {
    console.error("createCustomComponent()", error);
  }
}

/**
 * Add all custom components to the DOM
 */
export function setCustomComponents() {
  // BAP components
  !customElements.get("bap-header") ? customElements.define("bap-header", BapHeader) : null;
  !customElements.get("bap-footer") ? customElements.define("bap-footer", BapFooter) : null;
  !customElements.get("bap-notification") ? customElements.define("bap-notification", BapNotification) : null;
  !customElements.get("bap-spinner") ? customElements.define("bap-spinner", BapSpinner) : null;
  !customElements.get("bap-loading-state") ? customElements.define("bap-loading-state", BapLoadingState) : null;
  !customElements.get("bap-svg-image") ? customElements.define("bap-svg-image", BapSvgImage) : null;

  // Custom components
}
