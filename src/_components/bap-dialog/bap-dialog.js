/**
 * COMPONENTE PERSONALIZADO
 * Nombre: bap-dialog
 *
 * Clase para manejar modales flotantes premium (diálogos) con soporte para
 * imágenes de encabezado, detalle, textos estructurados y enlaces decodificados en Base64.
 */
import { ENV_URL } from "../../_main/constants.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

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
  
  // Formatear títulos
  const titleTop = props.titleTop ? `<h5 class="title-top">${props.titleTop}</h5>` : "";
  const titleMain = props.titleMain ? `<h2 class="title-main">${props.titleMain}</h2>` : "";
  const titleSub = props.titleSub ? `<h3 class="title-sub">${props.titleSub}</h3>` : "";
  
  // Inyectar marcas
  result = result.replace("{image-header-left-markup}", leftImg);
  result = result.replace("{image-header-right-markup}", rightImg);
  result = result.replace("{image-detail-markup}", detailImg);
  result = result.replace("{title-top-markup}", titleTop);
  result = result.replace("{title-main-markup}", titleMain);
  result = result.replace("{title-sub-markup}", titleSub);
  
  // Inyectar el cuerpo
  result = result.replace("{dialog-body-content}", props.bodyContent || "");
  
  // Decodificar enlaces Base64
  let linksMarkup = "";
  if (props.linkUrlBase64 && props.linkTextBase64) {
    try {
      const decodedUrl = atob(props.linkUrlBase64);
      const decodedText = atob(props.linkTextBase64);
      linksMarkup += `<a href="${decodedUrl}" target="_blank" class="primary">${decodedText}</a>`;
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
