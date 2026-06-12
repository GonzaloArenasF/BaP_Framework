/**
 * CUSTOM COMPONENT
 * Name: bap-chip
 *
 * Chips
 */
import { ENV_URL } from "../../_main/constants.js";
import { createCustomComponent } from "../customComponentsRegistration.js";
import { sanitizeHTML } from "../../_main/i18n.js";

// SEC-03: El label proviene del innerHTML del host (no confiable) y se inyecta en la plantilla
// vía template.innerHTML. Se sanitiza con DOMPurify (allowlist) para neutralizar cualquier XSS,
// igual que en bap-notification y bap-dialog.
function preRender(html, props) {
  return html.replace("{label}", sanitizeHTML(props.label));
}

function postRender(element) {}

export class BapChip extends HTMLElement {
  connectedCallback() {
    const props = {
      id: this.hasAttribute("id") ? this.getAttribute("id") : null,
      label: this.innerHTML.trim(),
    };

    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-chip/bap-chip.css",
      htmlPath: ENV_URL + "/_components/bap-chip/bap-chip.html",
      preRender,
      postRender,
      props,
    });
  }
}
