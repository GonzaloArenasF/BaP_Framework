import { setCustomComponents } from "./_components/customComponentsRegistration.js";
import { analytic } from "./_main/analytics.js";
import { CONSTANT, CDN_URL, ENV_URL } from "./_main/constants.js";
import { getI18nContent, applyI18n, replaceTokensInDOM } from "./_main/i18n.js";
import { sessionStartedControl } from "./_main/router.js";
import { routes } from "./_main/routerPaths.js";
import { bapNotify } from "./_main/util.js";

sessionStartedControl(routes.landing, false);

setCustomComponents();

applyI18n(() => {
  const landingI18n = getI18nContent("page", "landing");

  const headTokens = {
    "ENV_URL": ENV_URL,
    "CDN_URL": CDN_URL,
    "APP_VERSION": CONSTANT.APP_VERSION,
    "head.meta.description": landingI18n.head.meta.description,
    "head.meta.title": landingI18n.head.meta.title,
    "head.meta.keywords": landingI18n.head.meta.keywords,
    "head.title": landingI18n.head.title,
  };

  replaceTokensInDOM(document.head, headTokens);
});

window.addEventListener("load", () => {
  analytic.logEvent.enterLandingPage();
});
