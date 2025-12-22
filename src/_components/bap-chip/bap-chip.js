/**
 * CUSTOM COMPONENT
 * Name: bap-chip
 *
 * Chips
 */
import { ENV_URL } from "../../_main/constants.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

function preRender(html, props) {
  return html.replace("{label}", props.label);
}

function postRender(element) {}

export class BapChip extends HTMLElement {
  constructor() {
    super();

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
