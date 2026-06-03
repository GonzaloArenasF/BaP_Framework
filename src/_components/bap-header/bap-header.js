/**
 * CUSTOM COMPONENT
 * Name: bap-header
 *
 * Header pages
 */
import { ENV_URL } from "../../_main/constants.js";
import { getI18nContent } from "../../_main/i18n.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

const bapHeaderI18N = getI18nContent("component", "bapHeader");

function preRender(html, props) {
  return html
    .replaceAll("{color-mode}", props.colorMode)
    .replaceAll("{lightMode}", bapHeaderI18N.lightMode || "Light")
    .replaceAll("{darkMode}", bapHeaderI18N.darkMode || "Dark");
}

function postRender(props) {
  const bapHeaderElement = document.querySelector(".bap-header");
  if (bapHeaderElement) {
    // ── Menú (solo spans sin data-mode para no interferir con el toggle) ──
    bapHeaderElement.querySelectorAll("span:not([data-mode])").forEach((span) => {
      span.addEventListener("click", () => {
        bapHeaderElement.classList.toggle("open-menu");
        document.querySelector(".gaf-main-menu")?.classList.toggle("open-menu");
        document.querySelector("main > header")?.classList.toggle("open-menu");
        document.body.style.overflow = document.body.style.overflow == "hidden" ? "auto" : "hidden";
      });
    });

    // ── Theme Toggle ──────────────────────────────────────────────────────
    /**
     * Aplica el modo de color indicado a la página completa.
     * @param {string} mode - "light" o "dark"
     */
    function applyColorMode(mode) {
      // 1. Actualizar la clase del body (activa las variables CSS de colors.css)
      document.body.classList.remove("light-mode", "dark-mode");
      document.body.classList.add(`${mode}-mode`);

      // 2. Actualizar la clase del header (para estilos internos del componente)
      bapHeaderElement.classList.remove("light-mode", "dark-mode");
      bapHeaderElement.classList.add(`${mode}-mode`);

      // 3. Propagar el modo al bap-logo para que use su variante de color correcta
      bapHeaderElement.querySelector("bap-logo")?.setAttribute("color-mode", mode);

      // 4. Marcar visualmente la opción activa
      bapHeaderElement.querySelectorAll("[data-mode]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
      });

      // 5. Persistir la preferencia del usuario
      localStorage.setItem("bap-color-mode", mode);
    }

    // Restaurar la preferencia guardada al iniciar (o "light" por defecto)
    const savedMode = localStorage.getItem("bap-color-mode") || "light";
    applyColorMode(savedMode);

    // Escuchar clics en los botones Light / Dark
    bapHeaderElement.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => applyColorMode(btn.dataset.mode));
    });
  }
}

export class BapHeader extends HTMLElement {
  constructor() {
    super();

    const props = {
      hideActions: typeof this.getAttribute("hide-actions") == "string",
      showAdminActions: typeof this.getAttribute("show-admin-actions") == "string",
      isAdminUser: typeof this.getAttribute("is-admin-user") == "string",
      colorMode: this.hasAttribute("color-mode") ? this.getAttribute("color-mode") : "light",
    };

    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-header/bap-header.css",
      htmlPath: ENV_URL + "/_components/bap-header/bap-header.html",
      preRender,
      postRender,
      props,
    });
  }
}
