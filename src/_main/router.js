/**
 * MOTOR DE ENRUTAMIENTO (ROUTING ENGINE)
 *
 * Controla la navegación del sitio, validando la autenticación de usuarios,
 * autorización mediante lista blanca (whitelist) y la carga dinámica de componentes.
 */
import { userSession, userSignIn, userSignOut, isUserAuthorized } from "./auth.js";
import { CONSTANT } from "./constants.js";
import { getI18nContent } from "./i18n.js";
import { NAVIGATION_TYPES, routes } from "./routerPaths.js";
import { bapNotify } from "./util.js";

const routerI18n = getI18nContent('page', 'cross');

/**
 * Convierte un objeto de parámetros en un string de consulta (Query String).
 * 
 * @param {Object} params - Objeto clave-valor de parámetros.
 * @returns {string} String codificado tipo "clave1=valor1&clave2=valor2".
 */
const paramsToQueryParams = (params) => {
  let arrayQueryParams = [];
  for (const name of Object.keys(params)) {
    arrayQueryParams.push(`${name}=${params[name]}`);
  }
  return arrayQueryParams.join("&");
};

/**
 * Verifica si el acceso a una ruta particular está permitido.
 * Si Firebase está inactivo, se aplica el bypass local otorgando acceso.
 * Si Firebase está activo, se verifica sesión y autorización por lista blanca.
 * 
 * @param {Object} route - Objeto de configuración de la ruta.
 * @returns {Promise<boolean>} True si el acceso está permitido; de lo contrario, False.
 */
const isAccessAllowed = async (route) => {
  if (route.validate.signIn) {
    if (CONSTANT.FIREBASE_AVAILABLE) {
      if (!userSession || !userSession.currentUser) {
        return false;
      }
      // Validar whitelist asíncronamente
      const authorized = await isUserAuthorized(userSession.currentUser);
      if (!authorized) {
        return false;
      }
    } else {
      // Regla de Oro: Si Firebase no está configurado, omitir control (Bypass)
      console.warn("Bypass de seguridad de ruta activo para:", route.pathname);
      return true;
    }
  }

  return true;
};

/**
 * Realiza la navegación del historial del navegador según el tipo configurado.
 * 
 * @param {Object} route - Objeto de configuración de la ruta.
 * @param {Object} [params] - Parámetros query string.
 */
const navigateTo = (route, params) => {
  const url = `${route.pathname}${params ? "?" + paramsToQueryParams(params) : ""}`;

  switch (route.navigation) {
    case NAVIGATION_TYPES.REDIRECT:
      window.location.href = url;
      break;
    case NAVIGATION_TYPES.LOAD_COMPONENT:
      history.pushState(
        {
          state: "ok",
        },
        route.title,
        url
      );

      document.title = route.title;
      break;
  }
};

/**
 * Carga dinámicamente un componente dentro de la etiqueta <main> del DOM.
 * 
 * @param {Object} route - Objeto de configuración de la ruta.
 */
const loadContent = (route) => {
  let params = [];
  try {
    if (window.location.href.includes("?")) {
      const queryParams = window.location.href.split("?")[1].split("&");
      params = [...queryParams.map((param) => `${param.split("=")[0]}=${param.split("=")[1]}`)];
    }
  } catch (e) {
    console.warn("No se pudieron parsear parámetros de URL para carga de componentes:", e);
  }
  document.getElementsByTagName("main")[0].innerHTML = `<${route.component} ${params.join(" ")} />`;
};

/**
 * Realiza la transición de navegación controlada hacia una ruta.
 * 
 * @param {Object} route - Objeto de ruta del diccionario de rutas.
 * @param {Object} [params] - Parámetros query string.
 */
export async function goTo(route, params) {
  if (!route || !route.pathname) {
    // Redirección segura de error a 404
    window.location.href = `${window.location.origin}/404.html`;
    return;
  }

  if (await isAccessAllowed(route)) {
    navigateTo(route, params);
    if (route.navigation === NAVIGATION_TYPES.LOAD_COMPONENT) {
      loadContent(route);
    }
  } else {
    bapNotify(
      CONSTANT.NOTIFICATION.TYPE.TOAST,
      CONSTANT.NOTIFICATION.SEVERITY.INFO,
      routerI18n.notification.notAllowedEnteringPage
    );
  }
}

/**
 * Transforma los parámetros de la URL actual en un objeto JavaScript.
 * 
 * @returns {Object} Objeto con las claves y valores de la URL.
 */
export function getQueryParams() {
  let params = {};
  try {
    if (window.location.href.includes("?")) {
      const queryParams = window.location.href.split("?")[1].split("&");
      queryParams.forEach((param) => {
        let paramValue = param.split("=");
        params[paramValue[0]] = paramValue[1];
      });
    }
  } catch (error) {
    bapNotify(
      CONSTANT.NOTIFICATION.TYPE.TOAST,
      CONSTANT.NOTIFICATION.SEVERITY.ERROR,
      routerI18n.notification.errorGettingQueryParams
    );
    console.error("Error al obtener los parámetros de consulta:", error);
  }

  return params;
}

/**
 * Controla y vigila el acceso a páginas con inicio de sesión validado.
 * Si Firebase está inactivo, realiza un bypass permitiendo el flujo del usuario.
 * 
 * @param {Object} route - Objeto de configuración de la ruta.
 * @param {boolean} initSession - Si debe gatillar el inicio de sesión.
 * @param {Function} [redirectionCallbackOnNoSession] - Callback opcional en caso de fallar el acceso.
 */
export function sessionStartedControl(route, initSession, redirectionCallbackOnNoSession) {
  if (route.validate.signIn) {
    if (CONSTANT.FIREBASE_AVAILABLE) {
      userSession.onAuthStateChanged(async (user) => {
        if (!user) {
          const redirect = !redirectionCallbackOnNoSession
            ? () => goTo(routes.landing)
            : redirectionCallbackOnNoSession;
          
          if (!initSession) {
            redirect();
          } else {
            userSignIn({});
          }
        } else {
          // Evaluar lista blanca de forma asíncrona
          const authorized = await isUserAuthorized(user);
          if (!authorized) {
            console.warn("Usuario no autorizado por whitelist de producción. Cerrando sesión...");
            userSignOut({
              callbackOnSuccess: () => {
                const redirect = !redirectionCallbackOnNoSession
                  ? () => goTo(routes.landing)
                  : redirectionCallbackOnNoSession;
                redirect();
              }
            });
          }
        }
      });
    } else {
      // Regla de Oro: Si Firebase está inactivo, se aplica el bypass de seguridad.
      // Permitir continuar el flujo y dar acceso a la ruta privada de forma local.
      console.warn("Bypass de seguridad local activo en sessionStartedControl para la ruta:", route.pathname);
    }
  }
}
