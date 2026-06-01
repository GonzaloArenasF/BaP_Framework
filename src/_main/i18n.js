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
 * Aplana de forma recursiva un objeto
 */
export function flattenObject(obj, prefix = "", res = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const propName = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      flattenObject(value, propName, res);
    } else {
      res[propName] = value;
    }
  }
  return res;
}

/**
 * Sanitizador HTML ultraligero como defensa en profundidad
 */
export function sanitizeHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // Eliminar etiquetas peligrosas
  const forbiddenTags = ["script", "iframe", "object", "embed", "style"];
  forbiddenTags.forEach(tag => {
    doc.querySelectorAll(tag).forEach(el => el.remove());
  });

  // Eliminar atributos on* y javascript: de cualquier elemento
  const allElements = doc.querySelectorAll("*");
  for (const el of allElements) {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith("on") || attr.value.trim().toLowerCase().startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    }
  }
  return doc.body.innerHTML;
}

/**
 * Reemplaza tokens de forma segura recorriendo el DOM (head y body)
 */
export function replaceTokensInDOM(rootNode, tokenMap) {
  const replaceStr = (str) => {
    let newStr = str;
    for (const [key, value] of Object.entries(tokenMap)) {
      newStr = newStr.replaceAll(`{${key}}`, value);
    }
    return newStr;
  };

  const walk = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  const textNodesToReplace = [];
  let node;
  while ((node = walk.nextNode())) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Reemplaza tokens en los atributos del elemento
      for (const attr of [...node.attributes]) {
        if (attr.value.includes("{")) {
          attr.value = replaceStr(attr.value);
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue.includes("{")) {
        textNodesToReplace.push(node);
      }
    }
  }

  // Realiza los reemplazos en los nodos de texto recopilados
  for (const textNode of textNodesToReplace) {
    const parent = textNode.parentNode;
    if (!parent) continue;

    const originalText = textNode.nodeValue;
    const replacedText = replaceStr(originalText);

    if (replacedText !== originalText) {
      // Si contiene etiquetas HTML (ej: <strong>, <code>), parsea e inyecta de forma segura
      if (/<[a-z][\s\S]*>/i.test(replacedText)) {
        const temp = document.createElement("template");
        temp.innerHTML = sanitizeHTML(replacedText);
        parent.replaceChild(temp.content, textNode);
      } else {
        textNode.nodeValue = replacedText;
      }
    }
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

  document.querySelector("html").setAttribute("lang", CONSTANT.I18N.DEFAULT);

  // 1. Mapa global de tokens comunes
  const tokenMap = {
    "ENV_URL": ENV_URL,
    "head-app-name": CONSTANT.APP_NAME,
    "CDN_URL": CDN_URL,
    "APP_VERSION": CONSTANT.APP_VERSION,
    "APP_NAME": CONSTANT.APP_NAME,
    "app-name": CONSTANT.APP_NAME,
  };

  // 2. Aplanar dinámicamente el diccionario de páginas de i18n
  flattenObject(i18n.page, "", tokenMap);

  // 3. Reemplazar de forma segura en head y body
  replaceTokensInDOM(document.head, tokenMap);
  replaceTokensInDOM(document.body, tokenMap);

  callback();
}

