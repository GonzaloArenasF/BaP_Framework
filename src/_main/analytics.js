/**
 * Analytics events
 *
 * Use Firebase Analytics.
 *
 * For standar integration, use the function logAnalyticEvent()
 *
 * Every event has to be integrated in its particular set of events like this:
 * const groupOfEvents = {
 *  eventName: () => logAnalyticEvent({
 *      type: EVENT_TYPE.ENTER_PAGE,
 *      name: "page_not_found",
 *      func: "404",
 *      userType: USER_TYPE.USER,
 *    }),
 * }
 *
 * Finally, add the group of events to the analytic object at the end of the file, like this:
 * export const analytic = {
 *  logEvent: {
 *      ...groupOfEvents,
 *    },
 * }
 *
 */
import { logAnalyticEvent } from "./firebaseInit.js";

export const USER_TYPE = {
  ADMIN: "Admin",
  USER: "User",
};

const EVENT_TYPE = {
  ENTER_PAGE: "enter_page",
  BUTTON_CLICK: "button_click",
  OPEN_DIALOG: "open_dialog",
  CLOSE_DIALOG: "close_dialog",
  LOGIN: "login",
  LOGOUT: "logout",
  ERROR: "error",
  PROCESS: "process",
};

const footerEvents = {};

const headerEvents = {};

const landingPageEvents = {
  enterLandingPage: () =>
    logAnalyticEvent({
      type: EVENT_TYPE.ENTER_PAGE,
      name: "enter_page",
      func: "landing_page",
      userType: USER_TYPE.USER,
    }),
};

const notFoundEvents = {
  pageNotFound: () =>
    logAnalyticEvent({
      type: EVENT_TYPE.ENTER_PAGE,
      name: "page_not_found",
      func: "404",
      userType: USER_TYPE.USER,
    }),
};

const loginEvents = {
  openLoginDialog: () =>
    logAnalyticEvent({
      type: EVENT_TYPE.OPEN_DIALOG,
      name: "open_dialog",
      func: "login",
      userType: USER_TYPE.USER,
    }),
  doLogin: () =>
    logAnalyticEvent({
      type: EVENT_TYPE.LOGIN,
      name: "login",
      func: "login",
      userType: USER_TYPE.USER,
    }),
  cancelLogin: () =>
    logAnalyticEvent({
      type: EVENT_TYPE.LOGIN,
      name: "cancel_login",
      func: "login",
      userType: USER_TYPE.USER,
    }),
  doLogout: () =>
    logAnalyticEvent({
      type: EVENT_TYPE.LOGOUT,
      name: "logout",
      func: "login",
      userType: USER_TYPE.ADMIN,
    }),
};

export const analytic = {
  logEvent: {
    ...footerEvents,
    ...headerEvents,
    ...landingPageEvents,
    ...notFoundEvents,
    ...loginEvents,
  },
};
