/**
 * CONTROL DE SESIÓN Y AUTENTICACIÓN
 *
 * Administra el estado de la sesión de los usuarios, maneja el inicio y cierre
 * de sesión con Firebase Auth y realiza el control de acceso de doble factor lógico
 * mediante lista blanca (whitelist) consultada en Realtime Database.
 */
import { bapAuth, bapDB } from "./firebaseInit.js";
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { bapNotify } from "./util.js";
import { CONSTANT } from "./constants.js";
import { getI18nContent } from "./i18n.js";

const authI18n = getI18nContent('page', 'cross');

export const userSession = bapAuth;

/**
 * Sanitiza la dirección de correo electrónico completa del usuario para consultas en Firebase RTDB.
 * Reemplaza todos los puntos (".") por comas (",") para evitar caracteres prohibidos.
 * 
 * @param {string} email - Ejemplo: "usuario.nombre@gmail.com"
 * @returns {string} - Correo sanitizado. Ejemplo: "usuario,nombre@gmail,com"
 */
export function sanitizeUserKey(email) {
  if (!email) return "";
  return email.toLowerCase().replace(/\./g, ",");
}

/**
 * Consulta de forma asíncrona en Realtime Database (nodo /allowed_users/)
 * si el usuario autenticado tiene permisos de acceso.
 * Si Firebase no está configurado, esta función retorna true de manera automática
 * para habilitar el bypass seguro local.
 * 
 * @param {Object} user - Objeto de usuario retornado por Firebase Auth.
 * @returns {Promise<boolean>} Resuelve a true si está autorizado o en modo bypass local; false de lo contrario.
 */
export async function isUserAuthorized(user) {
  // 1. Regla de Oro: Si Firebase no está habilitado, omitir control y dejar seguir el flujo (Bypass)
  if (!CONSTANT.FIREBASE_AVAILABLE) {
    return true;
  }
  
  if (!user || !user.email) return false;
  
  const emailSanitized = sanitizeUserKey(user.email);
  const dbRef = ref(bapDB, `/allowed_users/${emailSanitized}`);
  
  return new Promise((resolve) => {
    onValue(
      dbRef,
      (snapshot) => {
        // Retorna true únicamente si el valor coincide exactamente con true en el RTDB
        resolve(snapshot.val() === true);
      },
      (error) => {
        console.error("Error al consultar la Whitelist de usuarios:", error);
        resolve(false);
      },
      { onlyOnce: true }
    );
  });
}

/**
 * Inicia la sesión del usuario mediante un proveedor de autenticación (Google).
 * Si Firebase está inactivo, realiza un bypass simulando un inicio de sesión exitoso.
 * 
 * @param {Object} callbacks - Objeto que contiene funciones callback de éxito y error.
 * @param {Function} [callbacks.callbackOnSuccess] - Se ejecuta tras un inicio de sesión y validación exitosa.
 * @param {Function} [callbacks.callbackOnFail] - Se ejecuta tras un fallo en la firma o denegación de whitelist.
 */
export function userSignIn({ callbackOnSuccess, callbackOnFail }) {
  if (!CONSTANT.FIREBASE_AVAILABLE) {
    console.warn("Inicio de sesión seguro: Firebase no disponible. Aplicando bypass local.");
    if (callbackOnSuccess) callbackOnSuccess();
    return;
  }

  signInWithPopup(bapAuth, new GoogleAuthProvider())
    .then(async (result) => {
      // Doble factor lógico: Verificar lista blanca
      const authorized = await isUserAuthorized(result.user);
      if (authorized) {
        if (callbackOnSuccess) callbackOnSuccess();
      } else {
        bapNotify(
          CONSTANT.NOTIFICATION.TYPE.TOAST,
          CONSTANT.NOTIFICATION.SEVERITY.ERROR,
          authI18n.notification.notAllowedEnteringPage || "Acceso denegado: No se encuentra en la lista blanca de usuarios autorizados."
        );
        console.warn("Intento de acceso denegado por Whitelist para:", result.user.email);
        signOut(bapAuth);
        if (callbackOnFail) callbackOnFail();
      }
    })
    .catch((error) => {
      bapNotify(
        CONSTANT.NOTIFICATION.TYPE.TOAST,
        CONSTANT.NOTIFICATION.SEVERITY.ERROR,
        authI18n.notification.loginFail
      );
      console.error("Error al intentar iniciar sesión:", error);
      if (callbackOnFail) callbackOnFail();
    });
}

/**
 * Cierra la sesión activa del usuario.
 * 
 * @param {Object} callbacks - Objeto de callbacks de éxito y error.
 * @param {Function} [callbacks.callbackOnSuccess] - Se ejecuta tras un cierre de sesión exitoso.
 * @param {Function} [callbacks.callbackOnFail] - Se ejecuta si ocurre un error en el cierre de sesión.
 */
export function userSignOut({ callbackOnSuccess, callbackOnFail }) {
  if (!CONSTANT.FIREBASE_AVAILABLE) {
    console.warn("Cierre de sesión seguro: Firebase no disponible. Realizando bypass local.");
    if (callbackOnSuccess) callbackOnSuccess();
    return;
  }

  signOut(bapAuth)
    .then(() => {
      if (callbackOnSuccess) callbackOnSuccess();
    })
    .catch((error) => {
      bapNotify(
        CONSTANT.NOTIFICATION.TYPE.TOAST,
        CONSTANT.NOTIFICATION.SEVERITY.ERROR,
        authI18n.notification.logoutFail
      );
      console.error("Error al intentar cerrar sesión:", error);
      if (callbackOnFail) callbackOnFail();
    });
}
