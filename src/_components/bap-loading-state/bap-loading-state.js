/**
 * CUSTOM COMPONENT
 * Name: bap-loading-state
 *
 * Loading component to use previous to load content page
 */
import { ENV_URL } from "../../_main/constants.js";
import { sanitizeHTML } from "../../_main/i18n.js";

export class BapLoadingState extends HTMLElement {
  connectedCallback() {
    const props = {
      message: this.innerHTML.trim() || "Cargando...",
      subMessage: this.getAttribute("sub-message") || "",
    };

    // Crear el Shadow DOM para encapsulación y aislamiento CSS
    const shadow = this.attachShadow({ mode: "open" });

    // Archivo CSS
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", ENV_URL + "/_components/bap-loading-state/bap-loading-state.css");
    shadow.appendChild(link);

    // Archivo HTML
    // NEW-06: Fetch con AbortController (timeout 8s) y validación de response.ok.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(ENV_URL + "/_components/bap-loading-state/bap-loading-state.html", { signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`bap-loading-state: Error HTTP ${response.status} al cargar la plantilla`);
        }
        return response.text();
      })
      .then((html) => {
        const template = document.createElement("template");
        // SEC-04: message (innerHTML del host) y sub-message (atributo) son datos no confiables
        // que se inyectan en template.innerHTML. Se sanitizan con DOMPurify (allowlist) para evitar XSS.
        let htmlWithProps = html.replaceAll("{message}", sanitizeHTML(props.message));
        htmlWithProps = htmlWithProps.replaceAll("{sub-message}", props.subMessage ? `<h3>${sanitizeHTML(props.subMessage)}</h3>` : "");
        template.innerHTML = htmlWithProps;
        shadow.appendChild(template.content.cloneNode(true));
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          console.error("bap-loading-state: Timeout (8s) al cargar la plantilla HTML");
        } else {
          console.error(err.message || err);
        }
      });

  }
}
