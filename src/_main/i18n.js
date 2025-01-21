/**
 * i18n Language
 *
 * Langs supported: en-US, es-ES
 */

import { CONSTANT, ENV_URL } from "./constants.js";
import { enUS } from "./i18n/en-US.js";
import { esES } from "./i18n/es-ES.js";

const lang = {
  en: enUS,
  es: esES,
};

const browserLang = navigator.language.split("-")[0];

const i18n = CONSTANT.I18N.SUPPORTED.includes(browserLang) ? lang[browserLang] : lang[CONSTANT.I18N.DEFAULT];

const i18nGroups = ["component", "page"];

/**
 * Custom string replace to manage i18n.
 *
 * @param textToBeReplaced: <string> Text to be replaced.
 * @param textForReplacing: <string> Text to replace current one.
 * @param replaceInProd: <boolean> If is true the text will be replaced in PROD instead of Gulp process.
 */
function i18nReplace(textToBeReplaced, textForReplacing, replaceInProd) {
  try {
    if (textToBeReplaced == null) throw new Error("Text to be replaced is missing");
    if (textForReplacing == null) throw new Error("Text to replace is missing");

    if (!replaceInProd && CONSTANT.ENV.CURRENT == "PROD") {
      return this;
    }
    
    return this.replaceAll(textToBeReplaced, textForReplacing);
  } catch (error) {
    console.error("BaP - String replace", error);
  }
}

/**
 * Apply i18n
 *
 * @param callback: <function>
 */
export function applyI18n(callback) {
  String.prototype.i18nReplace = i18nReplace;

  if (CONSTANT.ENV.CURRENT != "PROD") {
    console.log("BaP Info: i18n is fully applied on rendering.");

    document.querySelector("html").setAttribute("lang", browserLang);

    document.head.innerHTML = document.head.innerHTML
      .i18nReplace("{ENV_URL}", ENV_URL)
      .i18nReplace("{head-app-name}", CONSTANT.APP_NAME)
      .i18nReplace("{APP_VERSION}", CONSTANT.APP_VERSION);

    document.body.innerHTML = document.body.innerHTML
      .i18nReplace("{ENV_URL}", ENV_URL)
      .i18nReplace("{app-name}", CONSTANT.APP_NAME)
      .i18nReplace("{APP_VERSION}", CONSTANT.APP_VERSION);
  }

  callback();
}
