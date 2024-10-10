/**
 * CUSTOM COMPONENT
 * Name: bap-header
 *
 * Header pages
 */
import { ENV_URL } from "../../_main/constants.js";
import { getI18nContent } from "../../_main/i18n.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

const bapHeaderI18N = getI18nContent("component", "bapHeader");

function preRender(html, props) {
  return html
    .replaceAll("{ENV_URL}", ENV_URL)
}

function postRender(header, props) {
  
}

export class BapHeader extends HTMLElement {
  constructor() {
    super();

    const props = {
      hideActions: typeof this.getAttribute("hide-actions") == "string",
      showAdminActions: typeof this.getAttribute("show-admin-actions") == "string",
      isAdminUser: typeof this.getAttribute("is-admin-user") == "string",
    };

    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-header/bap-header.css",
      htmlPath: ENV_URL + "/_components/bap-header/bap-header.html",
      preRender,
      postRender,
      props,
    });
  }
}
