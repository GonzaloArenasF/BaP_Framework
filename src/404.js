import { setCustomComponents } from "./_components/customComponentsRegistration.js";
import { analytic } from "./_main/analytics.js";
import { CDN_URL, ENV_URL } from "./_main/constants.js";
import { getI18nContent, applyI18n, replaceTokensInDOM } from "./_main/i18n.js";

setCustomComponents();

applyI18n(() => {
  const i18n = getI18nContent("page", "notFound");

  const tokens = {
    "ENV_URL": ENV_URL,
    "CDN_URL": CDN_URL,
    "head.meta.description": i18n.head.meta.description,
    "head.meta.title": i18n.head.meta.title,
    "head.meta.keywords": i18n.head.meta.keywords,
    "head.title": i18n.head.title,
    "body.message": i18n.body.message,
    "body.backHome": i18n.body.backHome,
  };

  replaceTokensInDOM(document.head, tokens);
  replaceTokensInDOM(document.body, tokens);
});

window.addEventListener("load", () => {
  analytic.logEvent.pageNotFound();
});
