/**
 * i18n Language
 *
 * Langs supported: en-US, es-ES
 */

import { CONSTANT, ENV_URL, CDN_URL, IS_PROD } from "./constants.js";
import { esES } from "./i18n/es-ES.js";

const lang = {
  es: esES,
};

// Se comenta hasta definir una mejor forma de realizar el cambio de idioma
// const browserLang = navigator.language.split("-")[0];
// const i18n = CONSTANT.I18N.SUPPORTED.includes(browserLang) ? lang[browserLang] : lang[CONSTANT.I18N.DEFAULT];
const i18n = lang[CONSTANT.I18N.DEFAULT];

const i18nGroups = ["component", "page"];

/**
 * Get content from i18n
 * @param group: <String> i18nGroups => component | page
 * @param item: Item inside any of groups.
 *
 * @returns jSon Object
 */
export function getI18nContent(group, item) {
  try {
    if (!i18nGroups.includes(group)) {
      throw new Error(`The group "${group}" does not exist.`);
    }

    return i18n[group][item];
  } catch (error) {
    console.error(error);
  }
}

/**
 * Apply i18n
 * @param callback: function
 */
export function applyI18n(callback) {
  if (IS_PROD) {
    return;
  } else {
    console.log("BaP Info: i18n applied on rendering.");
  }

  // Se comenta hasta definir una mejor forma de realizar el cambio de idioma
  // document.querySelector("html").setAttribute("lang", browserLang);

  document.querySelector("html").setAttribute("lang", CONSTANT.I18N.DEFAULT);

  document.head.innerHTML = document.head.innerHTML
    .replaceAll("{ENV_URL}", ENV_URL)
    .replaceAll("{head-app-name}", CONSTANT.APP_NAME)
    .replaceAll("{CDN_URL}", CDN_URL)
    .replaceAll("{APP_VERSION}", CONSTANT.APP_VERSION)
    .replaceAll("{APP_NAME}", CONSTANT.APP_NAME);

  document.body.innerHTML = document.body.innerHTML
    .replaceAll("{app-name}", CONSTANT.APP_NAME)
    .replaceAll("{CDN_URL}", CDN_URL)
    .replaceAll("{APP_VERSION}", CONSTANT.APP_VERSION)
    .replaceAll("{APP_NAME}", CONSTANT.APP_NAME);

  callback();
}
