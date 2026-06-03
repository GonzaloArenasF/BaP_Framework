import { setCustomComponents } from "./_components/customComponentsRegistration.js";
import { analytic } from "./_main/analytics.js";
import { CONSTANT, CDN_URL, ENV_URL } from "./_main/constants.js";
import { getI18nContent, applyI18n, replaceTokensInDOM } from "./_main/i18n.js";
import { sessionStartedControl } from "./_main/router.js";
import { routes } from "./_main/routerPaths.js";
import { bapNotify } from "./_main/util.js";

sessionStartedControl(routes.landing, false);

setCustomComponents();

applyI18n(() => {
  const landingI18n = getI18nContent("page", "landing");

  const headTokens = {
    "ENV_URL": ENV_URL,
    "CDN_URL": CDN_URL,
    "APP_VERSION": CONSTANT.APP_VERSION,
    "head.meta.description": landingI18n.head.meta.description,
    "head.meta.title": landingI18n.head.meta.title,
    "head.meta.keywords": landingI18n.head.meta.keywords,
    "head.title": landingI18n.head.title,
  };

  replaceTokensInDOM(document.head, headTokens);
});

/**
 * Muestra notificaciones personalizadas tipo Toast o Alert/Snackbar.
 * 
 * @param {number} type - Tipo de notificación: 1 para Toast, 2 para Alert.
 * @param {string} [customMessage] - Mensaje a desplegar.
 */
function showNotification(type, customMessage = "¡Notificación del BaP Framework!") {
  switch (type) {
    case 1:
      bapNotify(CONSTANT.NOTIFICATION.TYPE.TOAST, CONSTANT.NOTIFICATION.SEVERITY.INFO, customMessage);
      break;
    case 2:
      bapNotify(CONSTANT.NOTIFICATION.TYPE.ALERT, CONSTANT.NOTIFICATION.SEVERITY.ERROR, customMessage);
      break;
  }
}

/**
 * Gatilla e inyecta dinámicamente un Web Component modal <bap-dialog>
 */
function triggerDemoDialog() {
  const dialogId = `demoDialog-${Date.now()}`;
  const dialogEl = document.createElement("bap-dialog");

  dialogEl.setAttribute("id", dialogId);
  dialogEl.setAttribute("title-top", "DEMOSTRACIÓN EN VIVO");
  dialogEl.setAttribute("title-main", "¡Diálogo Premium Activado!");
  dialogEl.setAttribute("title-sub", "Web Component puro con Glassmorphism");
  dialogEl.setAttribute("image-header-left", "/assets/favicon.svg");

  // Enlaces de demostración codificados en Base64
  // URL: https://github.com/GonzaloArenasF/BaP_Framework (Base64)
  dialogEl.setAttribute("link-url-base64", "aHR0cHM6Ly9naXRodWIuY29tL0dvbnphbG9BcmVuYXNGL0JhUF9GcmFtZXdvcms=");
  // Text: "Explorar Código" (Base64)
  dialogEl.setAttribute("link-text-base64", "RXhwbG9yYXIgQ8OzZGlnbw==");

  // Inyectar el cuerpo del modal
  dialogEl.innerHTML = `
    <p>Este diálogo flotante es un Custom Element del W3C cargado dinámicamente sobre la marcha.</p>
    <div style="background: rgba(98, 174, 196, 0.1); border-left: 4px solid var(--accent-color); padding: 10px; border-radius: 4px; margin: 15px 0;">
      <strong>Características Clave:</strong>
      <ul style="margin: 5px 0 0 15px; padding: 0;">
        <li>Fondo con desenfoque <em>backdrop-filter</em>.</li>
        <li>Bloqueo de scroll inteligente en el body principal.</li>
        <li>Decodificación asíncrona segura de enlaces Base64.</li>
      </ul>
    </div>
    <p>Haz clic en el botón de cerrar arriba a la derecha, en el botón de abajo o simplemente fuera del modal para cerrarlo.</p>
  `;

  document.body.appendChild(dialogEl);

  // Registrar evento analítico
  analytic.logEvent.logEventCustomDialog ? analytic.logEvent.logEventCustomDialog() : null;
}

/**
 * Dispara un estado de carga en pantalla completa de forma temporal por 3 segundos.
 */
function triggerLoadingStateDemo() {
  const loadingEl = document.createElement("bap-loading-state");
  loadingEl.setAttribute("sub-message", "Simulando carga de componentes en segundo plano...");
  loadingEl.textContent = "Procesando información de telemetría...";

  document.body.appendChild(loadingEl);

  setTimeout(() => {
    loadingEl.remove();
    showNotification(1, "¡Simulación de carga completada con éxito!");
  }, 3000);
}

window.addEventListener("load", () => {
  analytic.logEvent.enterLandingPage();

  // Enlazar los disparadores interactivos de la UI
  document.getElementById("btn_toast_info")?.addEventListener("click", () => showNotification(1));
  document.getElementById("btn_alert_error")?.addEventListener("click", () => showNotification(2));
  document.getElementById("btn_trigger_dialog")?.addEventListener("click", triggerDemoDialog);
  document.getElementById("btn_trigger_loading")?.addEventListener("click", triggerLoadingStateDemo);
});
