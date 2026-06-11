/**
 * DOMPurify Mock — Solo para entorno de test (Vitest / Node.js)
 * Reemplaza: https://cdn.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.es.mjs
 *
 * En producción (navegador), se usa el CDN real para mantener el framework ligero.
 * En tests, Node.js no soporta imports con esquema https://, por lo que se usa
 * este mock que implementa sanitización real usando las APIs de DOM de jsdom
 * (disponible en el entorno de Vitest).
 *
 * El comportamiento imita la allowlist configurada en i18n.js:
 * - Elimina tags peligrosos: script, iframe, object, embed, style
 * - Elimina atributos on* (event handlers)
 * - Elimina valores javascript: en href
 * - Preserva HTML seguro (p, b, em, a, etc.)
 */

// Tags prohibidos — eliminar el elemento completo
const FORBIDDEN_TAGS = ['script', 'iframe', 'object', 'embed', 'style', 'base', 'link', 'meta', 'form'];

const DOMPurify = {
  /**
   * Sanitiza HTML usando las APIs de DOM de jsdom (disponible en Vitest).
   * @param {string} dirty - Cadena HTML a sanitizar.
   * @returns {string} HTML sanitizado.
   */
  sanitize: (dirty) => {
    if (typeof dirty !== 'string' || !dirty) return '';

    // Parsear con jsdom
    const doc = document.implementation.createHTMLDocument('');
    const body = doc.body;
    body.innerHTML = dirty;

    // 1. Eliminar tags prohibidos
    FORBIDDEN_TAGS.forEach((tag) => {
      body.querySelectorAll(tag).forEach((el) => el.remove());
    });

    // 2. Limpiar atributos peligrosos de todos los elementos
    body.querySelectorAll('*').forEach((el) => {
      // Eliminar atributos on* (event handlers)
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        // Eliminar javascript: en href, src y action
        if (['href', 'src', 'action', 'xlink:href'].includes(attr.name)) {
          const val = attr.value.trim().toLowerCase().replace(/\s/g, '');
          if (val.startsWith('javascript:') || val.startsWith('vbscript:') || val.startsWith('data:')) {
            el.removeAttribute(attr.name);
          }
        }
      });
    });

    return body.innerHTML;
  },
};

export default DOMPurify;
