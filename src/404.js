import { setCustomComponents } from "./_components/customComponentsRegistration.js";
import { analytic } from "./_main/analytics.js";
import { getI18nContent, applyI18n } from "./_main/i18n.js";

setCustomComponents();

applyI18n(() => {
  const landingI18n = getI18nContent("page", "notFound");

  document.head.innerHTML = document.head.innerHTML
    .replaceAll("{head-meta-description}", landingI18n.head.meta.description)
    .replaceAll("{head-meta-title}", landingI18n.head.meta.title)
    .replaceAll("{head-meta-keywords}", landingI18n.head.meta.keywords)
    .replaceAll("{head-title}", landingI18n.head.title);

  document.body.innerHTML = document.body.innerHTML;
});

window.addEventListener("load", () => {
  analytic.logEvent.pageNotFound();
});
