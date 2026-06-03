/**
 * CUSTOM COMPONENT
 * Name: bap-loading-state
 *
 * Loading component to use previous to load content page
 */
import { ENV_URL } from "../../_main/constants.js";

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
    fetch(ENV_URL + "/_components/bap-loading-state/bap-loading-state.html")
      .then((response) => response.text())
      .then((html) => {
        const template = document.createElement("template");
        let htmlWithProps = html.replaceAll("{message}", props.message);
        htmlWithProps = htmlWithProps.replaceAll("{sub-message}", props.subMessage ? `<h3>${props.subMessage}</h3>` : "");
        template.innerHTML = htmlWithProps;
        shadow.appendChild(template.content.cloneNode(true));
      });
  }
}
