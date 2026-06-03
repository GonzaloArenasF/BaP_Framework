/**
 * EVENTOS DE ANALÍTICA
 *
 * Registra y gestiona los eventos de telemetría de la aplicación en Firebase Analytics.
 * Provee un diccionario unificado para evitar llamadas a métodos huérfanos.
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

// Eventos de páginas generales y navegación principal
const generalPageEvents = {
  enterLandingPage: () =>
    logAnalyticEvent({
      type: EVENT_TYPE.ENTER_PAGE,
      name: "enter_landing_page",
      func: "landing_page",
      userType: USER_TYPE.USER,
    }),
    
  pageNotFound: () =>
    logAnalyticEvent({
      type: EVENT_TYPE.ENTER_PAGE,
      name: "page_not_found",
      func: "404",
      userType: USER_TYPE.USER,
    }),
};

// Diccionario unificado exportado para consumo de la aplicación
export const analytic = {
  logEvent: {
    ...generalPageEvents,
  },
};
