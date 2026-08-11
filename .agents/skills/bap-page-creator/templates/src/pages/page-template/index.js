import { bapAnalytics } from '../../_main/analytics.js';

document.addEventListener('DOMContentLoaded', () => {
  // Registrar evento de telemetría de entrada a la página
  if (bapAnalytics && typeof bapAnalytics.logEvent === 'function') {
    bapAnalytics.logEvent('enter_page_template');
  }
});
