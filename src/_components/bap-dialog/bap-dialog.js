/**
 * COMPONENTE PERSONALIZADO
 * Nombre: bap-dialog
 *
 * Clase para manejar modales flotantes premium (diálogos) con soporte para
 * imágenes de encabezado, detalle, textos estructurados y enlaces decodificados en Base64.
 */
import { ENV_URL } from "../../_main/constants.js";
import { createCustomComponent } from "../customComponentsRegistration.js";
import { sanitizeHTML } from "../../_main/i18n.js";
import { generateUUID } from "../../_main/util.js";

/**
 * SEC-15: Decodifica una cadena Base64 a texto UTF-8 usando TextDecoder en lugar de las
 * funciones obsoletas escape()/unescape(). Mantiene el mismo resultado para UTF-8 válido.
 *
 * @param {string} b64 - Cadena en Base64.
 * @returns {string} Texto decodificado en UTF-8.
 */
function base64ToUtf8(b64) {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * SEC-02: Detecta caracteres que permitirían escapar del contexto de un atributo HTML
 * entrecomillado (comillas, ángulos, backtick, espacios/saltos de línea). Las URLs legítimas
 * codifican estos caracteres, por lo que rechazarlos no afecta el uso normal pero impide
 * la inyección de atributos (p.ej. `https://x" onerror="...`).
 *
 * @param {string} url - URL a inspeccionar.
 * @returns {boolean} true si contiene caracteres peligrosos para un atributo.
 */
function hasUnsafeUrlChars(url) {
  return /["'`<>\s]/.test(url);
}

/**
 * Pre-renderiza la plantilla del diálogo inyectando los títulos, imágenes y contenido dinámico.
 * 
 * @param {string} html - Plantilla HTML del componente.
 * @param {Object} props - Propiedades leídas de la instancia.
 * @returns {string} Plantilla HTML completada.
 */
/**
 * NEW-04: Valida que la URL de una imagen use únicamente esquemas seguros.
 * Previene HTML Attribute Injection en los atributos src de los <img> generados
 * si el atributo image-* recibiera una URL con esquema `javascript:` o `data:`.
 *
 * Se aceptan: https://, http://, rutas relativas, y anclas (#).
 * Se rechazan: javascript:, data:, vbscript:, y cualquier otro esquema desconocido.
 *
 * @param {string|null} url - URL a validar.
 * @returns {boolean} true si la URL es segura para usar en src.
 */
function isSafeImageUrl(url) {
  if (!url) return false;
  const trimmed = url.trim();
  // SEC-02: Rechazar caracteres que permitan romper el atributo src e inyectar atributos
  // (event handlers como onerror) aunque el esquema sea válido.
  if (hasUnsafeUrlChars(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  // Esquemas explícitamente seguros
  if (lower.startsWith("https://") || lower.startsWith("http://")) return true;
  // Rutas relativas (sin esquema) y anclas
  if (!lower.includes(":") && !lower.startsWith("//")) return true;
  // Cualquier otro esquema (javascript:, data:, vbscript:, blob:, etc.) → rechazado
  return false;
}

/**
 * Pre-renderiza la plantilla del diálogo inyectando los títulos, imágenes y contenido dinámico.
 * 
 * @param {string} html - Plantilla HTML del componente.
 * @param {Object} props - Propiedades leídas de la instancia.
 * @returns {string} Plantilla HTML completada.
 */
function preRender(html, props) {
  let result = html;
  
  // Reemplazar identificador único
  result = result.replaceAll("{dialog-id}", props.id);
  
  // NEW-04: Validar el esquema de las URLs de imagen antes de inyectarlas en src.
  // Bloquea javascript:, data:, vbscript: y cualquier esquema no estándar.
  const leftImg = isSafeImageUrl(props.imageHeaderLeft)
    ? `<img src="${props.imageHeaderLeft}" alt="Encabezado Izquierdo" />`
    : "";
  const rightImg = isSafeImageUrl(props.imageHeaderRight)
    ? `<img src="${props.imageHeaderRight}" alt="Encabezado Derecho" />`
    : "";
  const detailImg = isSafeImageUrl(props.imageDetail)
    ? `<img class="bap-dialog-detail-img" src="${props.imageDetail}" alt="Detalle" />`
    : "";

  if (props.imageHeaderLeft && !isSafeImageUrl(props.imageHeaderLeft)) {
    console.warn("bap-dialog: Bloqueada imagen de encabezado izquierdo con URL insegura:", props.imageHeaderLeft);
  }
  if (props.imageHeaderRight && !isSafeImageUrl(props.imageHeaderRight)) {
    console.warn("bap-dialog: Bloqueada imagen de encabezado derecho con URL insegura:", props.imageHeaderRight);
  }
  if (props.imageDetail && !isSafeImageUrl(props.imageDetail)) {
    console.warn("bap-dialog: Bloqueada imagen de detalle con URL insegura:", props.imageDetail);
  }
  
  // Formatear títulos sanitizados
  const titleTopText = props.titleTop ? sanitizeHTML(props.titleTop) : "";
  const titleMainText = props.titleMain ? sanitizeHTML(props.titleMain) : "";
  const titleSubText = props.titleSub ? sanitizeHTML(props.titleSub) : "";

  const titleTop = titleTopText ? `<h5 class="title-top">${titleTopText}</h5>` : "";
  const titleMain = titleMainText ? `<h2 class="title-main">${titleMainText}</h2>` : "";
  const titleSub = titleSubText ? `<h3 class="title-sub">${titleSubText}</h3>` : "";
  
  // Inyectar marcas
  result = result.replace("{image-header-left-markup}", leftImg);
  result = result.replace("{image-header-right-markup}", rightImg);
  result = result.replace("{image-detail-markup}", detailImg);
  result = result.replace("{title-top-markup}", titleTop);
  result = result.replace("{title-main-markup}", titleMain);
  result = result.replace("{title-sub-markup}", titleSub);
  
  // Inyectar el cuerpo sanitizado
  const sanitizedBody = props.bodyContent ? sanitizeHTML(props.bodyContent) : "";
  result = result.replace("{dialog-body-content}", sanitizedBody);
  
  // Decodificar enlaces Base64
  let linksMarkup = "";
  if (props.linkUrlBase64 && props.linkTextBase64) {
    try {
      let decodedUrl = "";
      let decodedText = "";

      // SEC-15: Decodificación Base64 → UTF-8 con TextDecoder (sin escape/unescape obsoletos).
      try {
        decodedUrl = base64ToUtf8(props.linkUrlBase64).trim();
      } catch (e) {
        decodedUrl = atob(props.linkUrlBase64).trim();
      }

      try {
        decodedText = base64ToUtf8(props.linkTextBase64);
      } catch (e) {
        decodedText = atob(props.linkTextBase64);
      }

      // Validar esquema de URL para prevenir inyección de javascript: o esquemas no válidos.
      // SEC-02: además se rechazan caracteres que romperían el atributo href (comillas, ángulos,
      // espacios) para impedir inyección de atributos aunque el esquema sea válido.
      const lowerUrl = decodedUrl.toLowerCase();
      const isSafeProtocol = !hasUnsafeUrlChars(decodedUrl) &&
                             (lowerUrl.startsWith("https://") ||
                              lowerUrl.startsWith("http://") ||
                              lowerUrl.startsWith("mailto:") ||
                              (!lowerUrl.includes(":") && !lowerUrl.startsWith("//"))); // Enlaces relativos o anclas

      if (isSafeProtocol) {
        const cleanText = sanitizeHTML(decodedText);
        linksMarkup += `<a href="${decodedUrl}" target="_blank" class="primary">${cleanText}</a>`;
      } else {
        console.warn("bap-dialog: Bloqueada URL Base64 con protocolo potencialmente peligroso:", decodedUrl);
      }
    } catch (error) {
      console.error("Error al decodificar enlace Base64 en bap-dialog:", error);
    }
  }
  
  result = result.replace("{dialog-links-markup}", linksMarkup);
  
  return result;
}


/**
 * Conecta los eventos de interactividad (cierre, scroll) tras inyectar el componente en el DOM.
 * 
 * @param {Object} props - Propiedades de configuración.
 */
function postRender(props) {
  const backdrop = document.getElementById(`${props.id}-backdrop`);
  const closeBtn = document.getElementById(`${props.id}-close`);
  
  if (backdrop && closeBtn) {
    // Desplegar modal animado
    setTimeout(() => {
      backdrop.classList.add("show");
      document.body.style.overflow = "hidden"; // Desactivar scroll
    }, 50);
    
    // Función para cerrar de forma segura
    const closeDialog = () => {
      backdrop.classList.remove("show");
      document.body.style.overflow = "auto"; // Restaurar scroll
      
      setTimeout(() => {
        backdrop.remove(); // Elimina el clon del modal del DOM
      }, 300);
    };
    
    closeBtn.addEventListener("click", closeDialog);
    
    // Cerrar al hacer clic fuera de la tarjeta
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeDialog();
      }
    });
  }
}

export class BapDialog extends HTMLElement {
  /**
   * Ciclo de vida conectado. Lee los atributos del elemento antes de ser removido
   * y delegados a la función global createCustomComponent.
   */
  connectedCallback() {
    const props = {
      id: this.getAttribute("id") || `bapDialog-${generateUUID()}`,
      boxId: this.getAttribute("box-id") || null,
      imageHeaderLeft: this.getAttribute("image-header-left") || null,
      imageHeaderRight: this.getAttribute("image-header-right") || null,
      imageDetail: this.getAttribute("image-detail") || null,
      titleTop: this.getAttribute("title-top") || null,
      titleMain: this.getAttribute("title-main") || null,
      titleSub: this.getAttribute("title-sub") || null,
      linkUrlBase64: this.getAttribute("link-url-base64") || null,
      linkTextBase64: this.getAttribute("link-text-base64") || null,
      bodyContent: this.innerHTML,
    };
    
    // Limpiar contenido original
    this.innerHTML = "";
    
    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-dialog/bap-dialog.css",
      htmlPath: ENV_URL + "/_components/bap-dialog/bap-dialog.html",
      preRender,
      postRender,
      props,
    });
  }
}
