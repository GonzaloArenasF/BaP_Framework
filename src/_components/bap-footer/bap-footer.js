/**
 * CUSTOM COMPONENT
 * Name: bap-footer
 *
 * Footer pages
 */
import { CONSTANT, ENV_URL } from "../../_main/constants.js";
import { getI18nContent } from "../../_main/i18n.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

const bapFooterI18N = getI18nContent("component", "bapFooter");

function preRender(html) {
  return html
    .replaceAll("{ENV_URL}", ENV_URL)
    .replaceAll("{APP_VERSION}", CONSTANT.APP_VERSION)
}

function postRender(element) {
  
}

export class BapFooter extends HTMLElement {
  constructor() {
    super();
    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-footer/bap-footer.css",
      htmlPath: ENV_URL + "/_components/bap-footer/bap-footer.html",
      preRender,
      postRender,
    });
  }
}
