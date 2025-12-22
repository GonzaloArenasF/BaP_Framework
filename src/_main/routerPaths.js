export const NAVIGATION_TYPES = {
  REDIRECT: "redirect",
  LOAD_COMPONENT: "loadComponent",
};

/**
 * Controled routes
 */
export const routes = {
  landing: {
    pathname: "/",
    component: null,
    navigation: NAVIGATION_TYPES.REDIRECT,
    validate: {
      signIn: false,
    },
  },
  error404: {
    pathname: "/404.html",
    component: null,
    navigation: NAVIGATION_TYPES.REDIRECT,
    validate: {
      signIn: false,
    },
  },
};
