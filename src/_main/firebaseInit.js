/**
 * Init System
 *
 * Firebase:
 * https://firebase.google.com/docs/web/setup#available-libraries
 * https://firebase.google.com/docs/web/learn-more?hl=es-419#libraries-cdn
 * https://firebase.google.com/docs/reference/js/auth.md?hl=es-419
 * https://firebase.google.com/docs/database/web/start?hl=es-419&authuser=0#web-modular-api
 * https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider?authuser=0&hl=es#web-modular-api
 * -> https://cloud.google.com/recaptcha-enterprise/docs/create-key-website?hl=es&authuser=0#create-recaptcha-key-console
 */
import { CONSTANT, ENV_URL } from "./constants.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app-check.js";

// Initialize Firebase
export const bapFirebaseApp = CONSTANT.FIREBASE_AVAILABLE ? initializeApp(CONSTANT.FIREBASE_CONFIG) : null;
export const bapAuth = CONSTANT.FIREBASE_AVAILABLE ? getAuth(bapFirebaseApp) : null;
export const bapAnalytics = CONSTANT.FIREBASE_AVAILABLE ? getAnalytics(bapFirebaseApp) : null;
export const bapDB = CONSTANT.FIREBASE_AVAILABLE ? getDatabase(bapFirebaseApp) : null;

/**
 * Analytics settings
 * https://firebase.google.com/docs/analytics?hl=es-419
 *
 * [Wrapper] Analytic.logEvent()
 * https://firebase.google.com/docs/analytics/events?platform=web&hl=es-419
 *
 * @param type: <string> Event type.
 * @param name: <string> Event name.
 * @param func: <string> Functionality name.
 * @param detail: <object> Another key info to know.
 */
export const logAnalyticEvent = CONSTANT.FIREBASE_AVAILABLE ? ({ type, name, func, userType, detail }) => {
  try {
    let errorMsg = "";
    !type ?? (errorMsg = "Event type name not included");
    !name ?? (errorMsg = "Event name not included");
    !func ?? (errorMsg = "Functionality name not included");
    !userType ?? (errorMsg = "User type not included");

    if (errorMsg != "") {
      throw new Error(errorMsg);
    }

    logEvent(bapAnalytics, name, {
      env: ENV_URL,
      func,
      type,
      user_type: userType,
      ...detail,
    });
  } catch (error) {
    console.error("Analytic logging event", error);
  }
} : () => {};

const appCheck = CONSTANT.FIREBASE_AVAILABLE ? initializeAppCheck(bapFirebaseApp, {
  provider: new ReCaptchaEnterpriseProvider(CONSTANT.RECAPTCHA.PROD.ID),
  isTokenAutoRefreshEnabled: true,
}) : null;
