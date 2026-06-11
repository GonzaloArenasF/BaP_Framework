/**
 * COMPONENTE PERSONALIZADO
 * Nombre: bap-notification
 *
 * Clase para manejar notificaciones dinámicas del tipo alert o toast
 * con diferentes severidades (info, warning, error).
 */
import { ENV_URL, CONSTANT } from "../../_main/constants.js";
// sanitizeHTML usa DOMPurify (allowlist) para neutralizar cualquier contenido HTML malicioso
// que pudiera estar presente en el innerHTML del host antes de inyectarlo en el template.
import { sanitizeHTML } from "../../_main/i18n.js";

const componentPaths = {
  css: ENV_URL + "/_components/bap-notification/bap-notification.css",
  html: ENV_URL + "/_components/bap-notification/bap-notification.html",
};

/**
 * Configura los valores dinámicos dentro de la plantilla HTML de la notificación.
 * 
 * @param {string} type - Tipo de notificación: alert, toast.
 * @param {string} severity - Severidad: info, warning, error.
 * @param {string} message - Mensaje a desplegar.
 * @param {string} elementHTML - Código HTML de la plantilla.
 * @returns {string} Código HTML modificado con los valores aplicados.
 */
function setConfiguration(type, severity, message, elementHTML) {
  let elementWithValues = elementHTML;
  elementWithValues = elementWithValues.replaceAll("{bap-notification-message}", message || "Sin mensaje");
  elementWithValues = elementWithValues.replaceAll(
    "{bap-notification-severity}",
    severity ? `severity-${severity}` : "severity-error"
  );
  elementWithValues = elementWithValues.replaceAll("{bap-notification-type}", type ? `type-${type}` : "type-toast");

  return elementWithValues;
}

/**
 * Remueve la notificación del DOM automáticamente después del tiempo configurado
 * para notificaciones de severidad informativa (info).
 * 
 * @param {HTMLElement} bapNotification - Elemento de la notificación a remover.
 */
function autoRemoveInfoType(bapNotification) {
  setTimeout(() => {
    bapNotification.remove();
  }, CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO);
}

/**
 * Crea la estructura interna de la notificación en el Shadow DOM.
 * 
 * @param {HTMLElement} element - Instancia del componente bap-notification.
 */
function createBapNotification(element) {
  const shadow = element.attachShadow({ mode: "open" });

  // Archivo CSS (Se inyecta de forma incondicional para asegurar el aislamiento en el Shadow DOM)
  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", componentPaths.css);
  shadow.appendChild(link);

  // Archivo HTML
  // NEW-06: Fetch con AbortController (timeout 8s) y validación de response.ok.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  fetch(componentPaths.html, { signal: controller.signal })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`bap-notification: Error HTTP ${response.status} al cargar la plantilla`);
      }
      return response.text();
    })
    .then((html) => {
      const template = document.createElement("template");
      // NEW-01: Sanitizar el innerHTML del host con DOMPurify antes de inyectarlo en la plantilla.
      // Aunque bapNotify() asigna el mensaje con textContent (seguro), el componente puede ser
      // instanciado directamente con contenido HTML arbitrario en su interior.
      const safeMessage = sanitizeHTML(element.innerHTML);
      template.innerHTML = setConfiguration(
        element.attributes.type ? element.attributes.type.value : null,
        element.attributes.severity ? element.attributes.severity.value : null,
        safeMessage,
        html
      );
      shadow.appendChild(template.content.cloneNode(true));
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        console.error("bap-notification: Timeout (8s) al cargar la plantilla HTML");
      } else {
        console.error(err.message || err);
      }
    })
    .finally(() => {
      const notificationElement = shadow.getElementById("BapNotification");
      if (notificationElement) {
        element.attributes.show
          ? notificationElement.classList.add("show")
          : notificationElement.classList.remove("show");

        notificationElement.children[1].addEventListener("click", () => {
          notificationElement.classList.remove("show");
        });

        if (element.getAttribute("severity") == CONSTANT.NOTIFICATION.SEVERITY.INFO) {
          autoRemoveInfoType(notificationElement);
        }
      }
    });

}

export class BapNotification extends HTMLElement {
  /**
   * Inicializa la notificación creando su Shadow DOM.
   */
  constructor() {
    super();
    createBapNotification(this);
  }
}
