import { googleTranslateElementInit } from "./_components/bap-header/bap-header.js";
import { setCustomComponents } from "./_components/customComponentsRegistration.js";
import { analytic } from "./_main/analytics.js";
import { CDN_URL, ENV_URL } from "./_main/constants.js";
import { getI18nContent, applyI18n } from "./_main/i18n.js";

setCustomComponents();

applyI18n(() => {
  const i18n = getI18nContent("page", "notFound");

  document.head.innerHTML = document.head.innerHTML
    .replaceAll("{ENV_URL}", ENV_URL)
    .replaceAll("{CDN_URL}", CDN_URL)
    .replaceAll("{head.meta.description}", i18n.head.meta.description)
    .replaceAll("{head.meta.title}", i18n.head.meta.title)
    .replaceAll("{head.meta.keywords}", i18n.head.meta.keywords)
    .replaceAll("{head.title}", i18n.head.title);

  document.body.innerHTML = document.body.innerHTML
    .replaceAll("{CDN_URL}", CDN_URL)
    .replace("{body.message}", i18n.body.message)
    .replace("{body.backHome}", i18n.body.backHome);
});

window.addEventListener("load", () => {
  analytic.logEvent.pageNotFound();
  googleTranslateElementInit();
});
