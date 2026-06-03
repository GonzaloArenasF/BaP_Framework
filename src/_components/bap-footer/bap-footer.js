/**
 * CUSTOM COMPONENT
 * Name: bap-footer
 *
 * Footer pages
 */
import { CONSTANT, ENV_URL, IS_PROD } from "../../_main/constants.js";
import { getI18nContent } from "../../_main/i18n.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

const bapFooterI18N = getI18nContent("component", "bapFooter");
const crossI18n = getI18nContent("page", "cross");

function preRender(html) {
  return !IS_PROD
    ? html
        .replace("{APP_VERSION}", CONSTANT.APP_VERSION)
        .replace("{tc}", bapFooterI18N.tc)
        .replaceAll("{socialMedia.email.url}", CONSTANT.SOCIAL_MEDIA.EMAIL.URL)
        .replace("{brandDesc}", bapFooterI18N.brandDesc)
        .replace("{versionLabel}", bapFooterI18N.versionLabel)
        .replace("{resourcesLabel}", bapFooterI18N.resourcesLabel)
        .replace("{btnExplore}", bapFooterI18N.btnExplore)
        .replace("{contactLabel}", bapFooterI18N.contactLabel)
    : html;
}

function postRender(element) {}

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
