import { userSession, userSignIn } from "./auth.js";
import { CONSTANT } from "./constants.js";
import { getI18nContent } from "./i18n.js";
import { bapNotify } from "./util.js";

const NAVIGATION_TYPES = {
  REDIRECT: "redirect",
  LOAD_COMPONENT: "loadComponent",
};

const routerI18n = getI18nContent('page', 'cross');

/**
 * Controled routes
 */
export const routes = [
  {
    pathname: "/",
    component: null,
    navigation: NAVIGATION_TYPES.REDIRECT,
    validate: {
      signIn: false,
    },
  },
  {
    pathname: "/404.html",
    component: null,
    navigation: NAVIGATION_TYPES.REDIRECT,
    validate: {
      signIn: false,
    },
  },
];

const isAValidRoute = (pathname) => {
  for (const route of routes) {
    if (route.pathname == pathname) {
      return true;
    }
  }

  return false;
};

const paramsToQueryParams = (params) => {
  let arrayQueryParams = [];
  for (const name of Object.keys(params)) {
    arrayQueryParams.push(`${name}=${params[name]}`);
  }
  return arrayQueryParams.join("&");
};

const isAccessAllowed = async (route) => {
  if (route.validate.signIn) {
    if (!userSession.currentUser) {
      // Notification
      return false;
    }
  }

  return true;
};

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

const loadContent = (route) => {
  const queryParams = window.location.href.split("?")[1].split("&");
  const params = [...queryParams.map((param) => `${param.split("=")[0]}=${param.split("=")[1]}`)];
  document.getElementsByTagName("main")[0].innerHTML = `<${route.component} ${params.join(" ")} />`;
};

/**
 * change path route for navigation control
 * @param {String} pathname. Eg. /arrendar
 * @param {Object} params. Eg. {id: 1, Other: "hola"}
 * @returns void
 */
export async function goTo(pathname, params) {
  if (!isAValidRoute(pathname)) {
    window.location.href(`${window.location.host}/404.html`);
    return;
  }

  const routeToNavigate = routes.find((route) => route.pathname == pathname);
  if (await isAccessAllowed(routeToNavigate)) {
    navigateTo(routeToNavigate, params);
    loadContent(routeToNavigate);
  } else {
    bapNotify(
      CONSTANT.NOTIFICATION.TYPE.TOAST,
      CONSTANT.NOTIFICATION.SEVERITY.INFO,
      routerI18n.notification.notAllowedEnteringPage
    );
  }
}

/**
 * Transform string queryparams into an object
 * @returns object
 */
export function getQueryParams() {
  let params = {};
  try {
    const queryParams = window.location.href.split("?")[1].split("&");
    queryParams.forEach((param) => {
      let paramValue = param.split("=");
      params[paramValue[0]] = paramValue[1];
    });
  } catch (error) {
    bapNotify(
      CONSTANT.NOTIFICATION.TYPE.TOAST,
      CONSTANT.NOTIFICATION.SEVERITY.ERROR,
      routerI18n.notification.errorGettingQueryParams
    );
    console.log("Error getting query params", error);
  }

  return params;
}

/**
 * In case of access to a session started validated page, this will redirect to landing one
 * @param {string} pathname
 */
export function sessionStartedControl(pathname, initSession, redirectionCallbackOnNoSession) {
  const routeToNavigate = routes.find((route) => route.pathname == pathname);
  if (routeToNavigate.validate.signIn) {
    userSession.onAuthStateChanged(() => {
      if (!userSession.currentUser) {
        const redirect = !redirectionCallbackOnNoSession
          ? () => goTo(routes[0].pathname)
          : redirectionCallbackOnNoSession;
        !initSession ? redirect() : userSignIn();
      }
    });
  }
}
