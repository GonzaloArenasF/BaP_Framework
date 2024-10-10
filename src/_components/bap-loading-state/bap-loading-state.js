/**
 * CUSTOM COMPONENT
 * Name: bap-loading-state
 *
 * Loading component to use previous to load content page
 */
import { ENV_URL } from "../../_main/constants.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

function preRender(html, props) {
  let htmlWithProps = html.replaceAll("{message}", props.message);
  htmlWithProps = htmlWithProps.replaceAll("{sub-message}", `<h3>${props.subMessage}</h3>`);

  return htmlWithProps;
}

function postRender(element, props) {}

export class BapLoadingState extends HTMLElement {
  constructor() {
    super();
    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-loading-state/bap-loading-state.css",
      htmlPath: ENV_URL + "/_components/bap-loading-state/bap-loading-state.html",
      preRender,
      postRender,
      props: {
        message: this.innerHTML,
        subMessage: typeof this.getAttribute("sub-message") == "string" ? this.getAttribute("sub-message") : "",
      },
    });
  }
}
