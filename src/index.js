import { setCustomComponents } from "./_components/customComponentsRegistration.js";
import { analytic } from "./_main/analytics.js";
import { CONSTANT, CDN_URL, ENV_URL } from "./_main/constants.js";
import { getI18nContent, applyI18n } from "./_main/i18n.js";
import { sessionStartedControl } from "./_main/router.js";
import { routes } from "./_main/routerPaths.js";
import { bapNotify } from "./_main/util.js";

sessionStartedControl(routes.landing, false);

setCustomComponents();

applyI18n(() => {
  const landingI18n = getI18nContent("page", "landing");

  document.head.innerHTML = document.head.innerHTML
    .replaceAll("{ENV_URL}", ENV_URL)
    .replaceAll("{CDN_URL}", CDN_URL)
    .replaceAll("{APP_VERSION}", CONSTANT.APP_VERSION)
    .replaceAll("{head.meta.description}", landingI18n.head.meta.description)
    .replaceAll("{head.meta.title}", landingI18n.head.meta.title)
    .replaceAll("{head.meta.keywords}", landingI18n.head.meta.keywords)
    .replaceAll("{head.title}", landingI18n.head.title);

  document.body.innerHTML = document.body.innerHTML;
});

function showNotification(type) {
  switch (type) {
    case 1:
      bapNotify(CONSTANT.NOTIFICATION.TYPE.TOAST, CONSTANT.NOTIFICATION.SEVERITY.INFO, "Message");
      break;
    case 2:
      bapNotify(CONSTANT.NOTIFICATION.TYPE.ALERT, CONSTANT.NOTIFICATION.SEVERITY.ERROR, "Message");
      break;
  }
}

window.addEventListener("load", () => {
  analytic.logEvent.enterLandingPage();

  document.getElementById("btn_toast_info").addEventListener("click", () => showNotification(1));
  document.getElementById("btn_alert_error").addEventListener("click", () => showNotification(2));
});
