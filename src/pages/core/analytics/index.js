import { setCustomComponents } from "../../../_components/customComponentsRegistration.js";
import { applyI18n } from "../../../_main/i18n.js";

setCustomComponents();

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
});
