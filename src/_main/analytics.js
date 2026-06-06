/**
 * EVENTOS DE ANALÍTICA
 *
 * Registra y gestiona los eventos de telemetría de la aplicación en Firebase Analytics.
 * Provee un diccionario unificado para evitar llamadas a métodos huérfanos.
 */
import { logAnalyticEvent } from "./firebaseInit.js";

// Eventos personalizados inyectados desde bap.config.json
let customEvents = {};
try {
  customEvents = JSON.parse('%%BAP_CUSTOM_EVENTS%%');
} catch (e) {
  // Ignorado durante el build
}

// Diccionario unificado exportado para consumo de la aplicación
export const analytic = {
  logEvent: (() => {
    let events = {};
    Object.entries(customEvents).forEach(([key, eventObj]) => {
      events[key] = () => logAnalyticEvent(eventObj);
    });
    return events;
  })()
};
