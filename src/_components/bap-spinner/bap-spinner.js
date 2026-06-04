/**
 * CUSTOM COMPONENT
 * Name: bap-spinner
 *
 * Spinner
 */
import { ENV_URL } from "../../_main/constants.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

export class BapSpinner extends HTMLElement {
  connectedCallback() {
    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-spinner/bap-spinner.css",
      htmlPath: ENV_URL + "/_components/bap-spinner/bap-spinner.html",
    });
  }
}
