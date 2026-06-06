export const NAVIGATION_TYPES = {
  REDIRECT: "redirect",
  LOAD_COMPONENT: "loadComponent",
};

let appRoutes = {};
try {
  appRoutes = JSON.parse('%%BAP_APP_ROUTES%%');
} catch (e) {
  // Ignorado durante el build
}

/**
 * Controled routes
 */
export const routes = {
  ...appRoutes,
};
