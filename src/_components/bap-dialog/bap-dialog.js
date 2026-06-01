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
  
  // Formatear imágenes de encabezado y detalle
  const leftImg = props.imageHeaderLeft ? `<img src="${props.imageHeaderLeft}" alt="Encabezado Izquierdo" />` : "";
  const rightImg = props.imageHeaderRight ? `<img src="${props.imageHeaderRight}" alt="Encabezado Derecho" />` : "";
  const detailImg = props.imageDetail ? `<img class="bap-dialog-detail-img" src="${props.imageDetail}" alt="Detalle" />` : "";
  
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
      const decodedUrl = atob(props.linkUrlBase64).trim();
      const decodedText = atob(props.linkTextBase64);
      
      // Validar esquema de URL para prevenir inyección de javascript: o esquemas no válidos
      const lowerUrl = decodedUrl.toLowerCase();
      const isSafeProtocol = lowerUrl.startsWith("https://") || 
                             lowerUrl.startsWith("http://") || 
                             lowerUrl.startsWith("mailto:") || 
                             (!lowerUrl.includes(":") && !lowerUrl.startsWith("//")); // Enlaces relativos o anclas

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
      id: this.getAttribute("id") || `bapDialog-${Math.floor(Math.random() * 1000000)}`,
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
