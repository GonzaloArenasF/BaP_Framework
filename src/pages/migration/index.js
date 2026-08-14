import { setCustomComponents } from "../../_components/customComponentsRegistration.js";
import { sessionStartedControl } from "../../_main/router.js";
import { routes } from "../../_main/routerPaths.js";
import { applyI18n } from "../../_main/i18n.js";
import { analytic } from "../../_main/analytics.js";

// Validaciones de sesión y control
sessionStartedControl(routes.migration, false);

// Registro de Custom Components (header, footer, etc.)
setCustomComponents();

// Activa el motor de internacionalización sobre la página
applyI18n(() => {
  // Procesamiento de tokens en DOM
});

window.addEventListener("load", () => {
  if (analytic.logEvent && analytic.logEvent.enterMigrationPage) {
    analytic.logEvent.enterMigrationPage();
  }
});
