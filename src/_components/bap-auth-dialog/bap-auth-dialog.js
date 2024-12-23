/**
 * CUSTOM COMPONENT
 * Name: bap-auth-dialog
 *
 * Authentication dialog
 */
import { analytic } from "../../_main/analytics.js";
import { userSignIn } from "../../_main/auth.js";
import { CONSTANT, ENV_URL } from "../../_main/constants.js";
import { getI18nContent } from "../../_main/i18n.js";
import { bapNotify } from "../../_main/util.js";
import { createCustomComponent } from "../customComponentsRegistration.js";

const i18n = getI18nContent("component", "bapAuthDialog");
const notificationI18n = getI18nContent("page", "cross");

function preRender(html) {
  return html
    .replace("{ENV_URL}", ENV_URL)
    .replace("{APP_VERSION}", CONSTANT.APP_VERSION)
    .replace("{APP_NAME}", CONSTANT.APP_NAME)
    .replace("{title}", i18n.title)
    .replace("{email}", i18n.email)
    .replace("{pass}", i18n.pass)
    .replace("{loginBtn}", i18n.loginBtn)
    .replace("{cancelBtn}", i18n.cancelBtn);
}

function doLogin() {
  try {
    const email = document.getElementById("loginEmail").value;
    if (!email || email == "") {
      throw notificationI18n.notification.noEmail;
    }

    const password = document.getElementById("loginPass").value;
    if (!password || password == "") {
      throw notificationI18n.notification.noPass;
    }

    userSignIn({
      type: CONSTANT.AUTH.TYPE,
      email,
      password,
      callbackOnSuccess: () => {
        bapNotify(
          CONSTANT.NOTIFICATION.TYPE.TOAST,
          CONSTANT.NOTIFICATION.SEVERITY.INFO,
          notificationI18n.notification.success
        );
        document.querySelector("main").classList.remove('ready');
        document.getElementById("bapAuthDialog").classList.toggle("show");
        document.body.style.overflow = "auto";
        analytic.logEvent.doLogin();
      },
    });
  } catch (error) {
    bapNotify(CONSTANT.NOTIFICATION.TYPE.ALERT, CONSTANT.NOTIFICATION.SEVERITY.ERROR, error);
  }
}

function cancelLogin() {
  document.getElementById("bapAuthDialog").classList.toggle("show");
  document.body.style.overflow = "auto";
  analytic.logEvent.cancelLogin();
}

function postRender() {
  document.getElementById("loginBtn")?.addEventListener("click", () => doLogin());
  document.getElementById("cancelBtn")?.addEventListener("click", () => cancelLogin());
}

export class BapAuthDialog extends HTMLElement {
  constructor() {
    super();
    createCustomComponent(this, {
      cssPath: ENV_URL + "/_components/bap-auth-dialog/bap-auth-dialog.css",
      htmlPath: ENV_URL + "/_components/bap-auth-dialog/bap-auth-dialog.html",
      preRender,
      postRender,
    });
  }
}
