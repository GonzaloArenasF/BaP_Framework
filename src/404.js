import { setCustomComponents } from "./_components/customComponentsRegistration.js";
import { analytic } from "./_main/analytics.js";
import { getI18nContent, applyI18n } from "./_main/i18n.js";

setCustomComponents();

applyI18n(() => {
  const landingI18n = getI18nContent("page", "notFound");

  document.head.innerHTML = document.head.innerHTML
    .i18nReplace("{head-meta-description}", landingI18n.head.meta.description)
    .i18nReplace("{head-meta-title}", landingI18n.head.meta.title)
    .i18nReplace("{head-meta-keywords}", landingI18n.head.meta.keywords)
    .i18nReplace("{head-title}", landingI18n.head.title);

  document.body.innerHTML = document.body.innerHTML;
});

window.addEventListener("load", () => {
  analytic.logEvent.pageNotFound();
});
