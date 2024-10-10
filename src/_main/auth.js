/**
 * SESSION CONTROL
 *
 * https://firebase.google.com/docs/reference/js/auth.md?hl=es-419
 * https://firebase.google.com/docs/auth/web/redirect-best-practices?hl=es-419 / Deprecated
 */
import { bapAuth } from "./firebaseInit.js";
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { bapNotify } from "./util.js";
import { CONSTANT } from "./constants.js";
import { getI18nContent } from "./i18n.js";

const authI18n = getI18nContent('page', 'cross');

export const userSession = bapAuth;  

export function userSignIn({ callbackOnSuccess, callbackOnFail }) {
  signInWithPopup(bapAuth, new GoogleAuthProvider())
    .then(() => {
      callbackOnSuccess ? callbackOnSuccess() : null;
    })
    .catch((error) => {
      bapNotify(
        CONSTANT.NOTIFICATION.TYPE.TOAST,
        CONSTANT.NOTIFICATION.SEVERITY.ERROR,
        authI18n.notification.loginFail
      );
      console.error("Login failed", error);
      callbackOnFail ? callbackOnFail() : null;
    });
}

export function userSignOut({ callbackOnSuccess, callbackOnFail }) {
  signOut(bapAuth)
    .then(() => {
      callbackOnSuccess ?? callbackOnSuccess();
    })
    .catch((error) => {
      bapNotify(
        CONSTANT.NOTIFICATION.TYPE.TOAST,
        CONSTANT.NOTIFICATION.SEVERITY.ERROR,
        authI18n.notification.logoutFail
      );
      console.error("Error on logout", error);
      callbackOnFail ?? callbackOnFail();
    });
}
