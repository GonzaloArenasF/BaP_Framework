import { CONSTANT } from "./constants.js";

/**
 * Transform Timestamp to human reading date
 *
 * @param timestamp: <string> Unix timestamp. If is "today" it will return "Actualidad"
 * @param lang: optional | <string > | default: en
 * @param format: optional | <numeric> | default: 0
 *
 * @returns string
 */
export const timestampToHumanDate = (timestamp, lang, format) => {
  if (typeof timestamp == 'string' && timestamp == 'today') {
    return "Actualidad";
  }

  const date = new Date(parseInt(timestamp * 1000));

  const formats = [
    { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" },
    { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" },
    { month: "short", year: "numeric" },
  ];

  const langs = {
    en: "en-US",
    es: "es-ES"
  };

  const userConfig = {
    lang: lang ? langs[lang] : langs[0],
    format: format ? formats[format] : formats[0],
  };

  return date.toLocaleDateString(userConfig.lang, userConfig.format);
};

/**
 * Show an instance of bapNotify in the browser
 *
 * @param type: <string> CONSTANT.NOTIFICATION.TYPE
 * @param severity: <string> CONSTANT.NOTIFICATION.SEVERITY
 * @param msg: <string> Message to include in the notification.
 * @param errorObj <Object> Javascript Error.
 *
 * @returns void
 */
export const bapNotify = (type, severity, msg, errorObj) => {
  document.querySelectorAll("bap-notification").forEach((notification) => {
    notification.remove();
  });

  const bapNotification = document.createElement("bap-notification");
  bapNotification.setAttribute("type", type);
  bapNotification.setAttribute("severity", severity);
  bapNotification.textContent = msg;
  bapNotification.setAttribute("show", true);
  document.body.appendChild(bapNotification);

  severity == CONSTANT.NOTIFICATION.SEVERITY.ERROR ? console.error(msg, errorObj || "No more info") : null;
};

/**
 * Custon UUID generator
 *
 * @returns <string> UUID
 */
export function generateUUID() {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      );
    }
  }

  // Cryptographically insecure fallback (only used if Web Crypto API is completely unavailable)
  console.warn("Web Crypto API is not available. Generating a cryptographically insecure UUID.");
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * It takaes a string boolean and transform in to a real boolean
 *
 * @param string: true | false
 *
 * @returns boolean
 */
export function setStringIntoBoolean(string) {
  return string == "true" ? true : false;
}

/**
 * Validate if a CSS files is already in the code loaded to not set again.
 *
 * @param href: CSS reference
 *
 * @returns boolean
 */
export const isCSSIncluded = (href) => {
  const cssIncludes = Object.values(document.querySelectorAll("link")).map((link) => link.getAttribute("href"));
  return cssIncludes.filter((hrefAttribute) => hrefAttribute == href).length > 0;
};

/**
 * Detecta si el dispositivo del usuario es móvil.
 *
 * NEW-09: Se usa `matchMedia("(pointer: coarse)")` como señal primaria porque refleja
 * una capacidad física real del hardware (pantalla táctil sin puntero fino) y no puede
 * ser falsificada desde JavaScript en el mismo contexto de ejecución.
 *
 * El `userAgent` se mantiene como fallback para entornos sin API de media queries
 * (SSR, Node.js, contextos headless). En el navegador, `userAgent` es falsificable
 * por el usuario final o herramientas de desarrollo, por lo que NO debe usarse para
 * decisiones de seguridad — solo para adaptaciones visuales y de UX.
 *
 * ⚠️  LIMITACIÓN: Ninguna señal client-side es 100% infalible. No usar `isMobile()`
 *     para validaciones de seguridad o control de acceso; solo para adaptar la UI.
 *
 * @returns {boolean} true si el dispositivo se considera móvil.
 */
export function isMobile() {
  // Señal primaria: pointer media query (no falsificable via userAgent)
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(pointer: coarse)").matches;
  }
  // Fallback para entornos sin matchMedia (SSR, Node, headless)
  return /Mobi|Android/i.test(navigator.userAgent);
}
