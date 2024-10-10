/**
 * CUSTOM COMPONENT
 * Name: bap-notification
 *
 * Notifications
 *
 * type: <String> alert, toast. (Default toast)
 * severity: <String> info, warning, error. (default error)
 */
import { ENV_URL, CONSTANT } from "../../_main/constants.js";
import { isCSSIncluded } from "../../_main/util.js";

const componentPaths = {
  css: ENV_URL + "/_components/bap-notification/bap-notification.css",
  html: ENV_URL + "/_components/bap-notification/bap-notification.html",
};

function setConfiguration(type, severity, message, elementHTML) {
  let elementWithValues = elementHTML;
  elementWithValues = elementWithValues.replaceAll("{bap-notification-message}", message ?? "No Message");
  elementWithValues = elementWithValues.replaceAll(
    "{bap-notification-severity}",
    severity ? `severity-${severity}` : "severity-error"
  );
  elementWithValues = elementWithValues.replaceAll("{bap-notification-type}", type ? `type-${type}` : "type-toast");

  return elementWithValues;
}

function autoRemoveInfoType(bapNotification) {
  setTimeout(() => {
    bapNotification.remove();
  }, CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO);
}

function createBapNotification(element) {
  const shadow = element.attachShadow({ mode: "open" });

  // CSS file
  if (!isCSSIncluded(componentPaths.css)) {
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", componentPaths.css);
    shadow.appendChild(link);
  }

  // HTML file
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
      element.attributes.show
        ? notificationElement.classList.add("show")
        : notificationElement.classList.remove("show");

      notificationElement.children[1].addEventListener("click", () => {
        notificationElement.classList.remove("show");
      });

      if (element.getAttribute("severity") == CONSTANT.NOTIFICATION.SEVERITY.INFO) {
        autoRemoveInfoType(notificationElement);
      }
    });
}

export class BapNotification extends HTMLElement {
  constructor() {
    super();
    createBapNotification(this);
  }
}
