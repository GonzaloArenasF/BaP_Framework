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
  return html.replaceAll("{color-mode}", props.colorMode);
}

function postRender(props) {
  const bapHeaderElement = document.querySelector(".bap-header");
  if (bapHeaderElement) {
    bapHeaderElement.querySelectorAll("span").forEach((span) => {
      span.addEventListener("click", () => {
        bapHeaderElement.classList.toggle("open-menu");
        document.querySelector(".gaf-main-menu").classList.toggle("open-menu");
        document.querySelector("main > header").classList.toggle("open-menu");
        document.body.style.overflow = document.body.style.overflow == "hidden" ? "auto" : "hidden";
      });
    });

    // Google translator attachment
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//translate.google.com/translate_a/element.js";
    document.body.appendChild(script);
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

export function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "es",
      includedLanguages: "es,en",
      layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      autoDisplay: false,
      gaTrack: true,
    },
    "google_translate_element"
  );
}
