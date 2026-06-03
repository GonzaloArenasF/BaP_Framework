/**
 * COMPONENTE PERSONALIZADO
 * Nombre: bap-notification
 *
 * Clase para manejar notificaciones dinámicas del tipo alert o toast
 * con diferentes severidades (info, warning, error).
 */
import { ENV_URL, CONSTANT } from "../../_main/constants.js";

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
  elementWithValues = elementWithValues.replaceAll("{bap-notification-message}", message ?? "Sin mensaje");
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
  fetch(componentPaths.html)
    .then((response) => response.text())
    .then((html) => {
      const template = document.createElement("template");
      template.innerHTML = setConfiguration(
        element.attributes.type ? element.attributes.type.value : null,
        element.attributes.severity ? element.attributes.severity.value : null,
        element.innerHTML,
        html
      );
      shadow.appendChild(template.content.cloneNode(true));
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
