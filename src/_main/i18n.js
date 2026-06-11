/**
 * i18n Language
 *
 * Langs supported: en-US, es-ES
 */

import { CONSTANT, ENV_URL, CDN_URL, IS_PROD } from "./constants.js";
import { esES } from "./i18n/es-ES.js";
// DOMPurify: librería de sanitización HTML con allowlist exhaustiva (cubre SVG, data: URIs, encoding evasions).
// Versión fijada explícitamente para evitar cambios disruptivos no controlados.
// CDN: https://cdn.jsdelivr.net está incluido en la directiva script-src del CSP (firebase.json).
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.es.mjs";

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
 * Sanitizador HTML seguro basado en DOMPurify (allowlist).
 *
 * Utiliza una estrategia de lista de permitidos (allowlist) en lugar de blocklist,
 * lo que garantiza protección frente a vectores desconocidos y técnicas de evasión:
 * - SVG animado con event handlers (onbegin, onload, etc.)
 * - data: URIs con contenido HTML o JS
 * - Meta refresh con javascript: scheme
 * - xlink:href con payloads XSS
 * - Encoding evasions (&#x6A;avascript:, \u006a, etc.)
 *
 * @param {string} html - HTML potencialmente no confiable a sanitizar.
 * @returns {string} HTML seguro con solo las etiquetas y atributos de la allowlist.
 */
export function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    // Solo permite etiquetas HTML semánticas y de formato de texto sin capacidad de ejecución
    ALLOWED_TAGS: [
      "b", "i", "u", "s", "strong", "em", "mark",
      "code", "pre", "kbd", "samp",
      "a", "br", "hr", "wbr",
      "p", "blockquote", "q",
      "ul", "ol", "li", "dl", "dt", "dd",
      "h2", "h3", "h4", "h5", "h6",
      "span", "div", "section", "article",
      "table", "thead", "tbody", "tr", "th", "td",
      "figure", "figcaption", "img"
    ],
    // Solo permite atributos inofensivos; se excluyen on*, href con esquemas peligrosos y srcdoc
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "title", "alt", "src", "width", "height"],
    // Bloquear data-* attributes que podrían ser usados para exfiltración
    ALLOW_DATA_ATTR: false,
    // Forzar retorno del cuerpo completo (no fragmento parcial)
    FORCE_BODY: true,
    // Agregar rel="noopener noreferrer" automáticamente a todos los <a target="_blank">
    ADD_ATTR: ["target"],
  });
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

