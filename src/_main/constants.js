/**
 * CONSTANTES GLOBALES DEL SISTEMA
 *
 * Contiene todas las configuraciones globales, claves de almacenamiento,
 * tipos de notificaciones y configuración de entornos.
 *
 * ⚠️  SEGURIDAD: Las credenciales de Firebase y reCAPTCHA NO están hardcodeadas aquí.
 *     Los tokens %%NOMBRE%% son reemplazados en tiempo de build por el pipeline de Gulp,
 *     leyendo los valores desde el archivo .env local (ignorado por Git).
 *     Ver: gulp-imports.js → loadEnv() y gulpfile.js → replaceEnvTokens()
 */
const rawAiConfig = (() => {
  try {
    return JSON.parse(decodeURIComponent("%%BAP_AI_CONFIG%%"));
  } catch (e) {
    return {};
  }
})();

export const CONSTANT = {
  APP_NAME: "%%BAP_APP_NAME%%",
  APP_VERSION: "%%BAP_APP_VERSION%%",
  FIREBASE_AVAILABLE: (() => {
    // VUL-04: Autodetectar entorno de red local para mayor seguridad.
    // Evitar errores de referencia en Node.js (Gulp build time).
    if (typeof window === "undefined") {
      return "%%FIREBASE_AVAILABLE%%";
    }
    const isLocal = ["localhost", "127.0.0.1", ""].includes(window.location.hostname) ||
      window.location.hostname.startsWith("192.168.") ||
      window.location.hostname.startsWith("10.") ||
      window.location.hostname.startsWith("172.");

    // Si estamos en un entorno público, pero NO hay credenciales de Firebase configuradas en el .env,
    // permitimos que el bypass local continúe (sitio 100% estático).
    // Si hay credenciales de Firebase configuradas, forzamos true por seguridad para evitar bypass accidental.
    const hasFirebaseCredentials = !!"%%FIREBASE_AP%%";
    return !isLocal && hasFirebaseCredentials ? true : "%%FIREBASE_AVAILABLE%%";
  })(), // Inyectado desde .env en el build de Gulp (true en producción, false en desarrollo)
  STORAGE: {
    KEYS: {
      DIALOG_DATA: "dd",
      DRIVE_FILE: "saved_drive_file",
    },
    SOURCE: {
      LOCAL: "localStorage", // Persistencia en el Navegador (Local)
      SESSION: "sessionStorage", // Persistencia en el Navegador (Sesión)
      DB: "realtime", // Persistencia en Base de Datos (Firebase Realtime Database)
    },
  },
  NOTIFICATION: {
    TYPE: {
      ALERT: "alert",
      TOAST: "toast",
    },
    SEVERITY: {
      INFO: "info",
      WARNING: "warning",
      ERROR: "error",
    },
    AUTO_REMOVE_AFTER: {
      INFO: parseInt("%%BAP_NOTIFICATION_TIMEOUT%%") || 4000,
    },
  },
  AUTH: {
    SIGNED_IN: "AUTH_SIGNED_IN",
    SIGNED_OUT: "AUTH_SIGNED_OUT",
    SIGNED_UP: "AUTH_SIGNED_UP",
    SIGNED_DOWN: "AUTH_SIGNED_DOWN",
    // SEC-09 (NEW-05): se eliminó LOGIN_ATTEMPTS. El inicio de sesión usa OAuth con Google
    // (signInWithPopup); el rate limiting lo gestiona Google/Firebase Auth a nivel de proyecto.
    // Un contador client-side era eludible y creaba una falsa expectativa de seguridad.
  },
  FBC: {
    AP: "%%FIREBASE_AP%%",   // Inyectado desde .env en el build de Gulp
    AD: "%%FIREBASE_AD%%",   // Inyectado desde .env en el build de Gulp
    DURL: "%%FIREBASE_DURL%%", // Inyectado desde .env en el build de Gulp
    PID: "%%FIREBASE_PID%%", // Inyectado desde .env en el build de Gulp
    SB: "%%FIREBASE_SB%%",   // Inyectado desde .env en el build de Gulp
    MSID: "%%FIREBASE_MSID%%", // Inyectado desde .env en el build de Gulp
    AID: "%%FIREBASE_AID%%", // Inyectado desde .env en el build de Gulp
    MID: "%%FIREBASE_MID%%"  // Inyectado desde .env en el build de Gulp
  },
  RECAPTCHA: {
    ID: "%%RECAPTCHA_ID%%",     // Inyectado desde .env en el build de Gulp
    NAME: "%%RECAPTCHA_NAME%%", // Inyectado desde .env en el build de Gulp
  },
  I18N: {
    DEFAULT: "es",
    SUPPORTED: ["es"],
  },
  SOCIAL_MEDIA: {
    EMAIL: {
      TITLE: "Correo electrónico",
      URL: "%%BAP_EMAIL%%",
    }
  },
  AI: {
    API_KEY: "%%AI_API_KEY%%",
    MODELS: rawAiConfig.models?.length
      ? rawAiConfig.models
      : (rawAiConfig.modelsBpmn?.length ? rawAiConfig.modelsBpmn : ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"]),
    MODELS_BPMN: rawAiConfig.modelsBpmn?.length ? rawAiConfig.modelsBpmn : ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"],
    MODELS_STORIES: rawAiConfig.modelsStories?.length ? rawAiConfig.modelsStories : ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"],
    TEMPERATURE: rawAiConfig.temperature ?? 0.1,
    MAJOR_CHANGE_THRESHOLD: rawAiConfig.majorChangeThreshold ?? 0.3,
    SYSTEM_INSTRUCTION: rawAiConfig.instructions?.default || rawAiConfig.systemInstruction || "",
    SYSTEM_INSTRUCTION_BPMN: rawAiConfig.instructions?.bpmn || "",
    SYSTEM_INSTRUCTION_STORIES_METADATA: rawAiConfig.instructions?.storiesMetadata || "",
    PROMPT_STORIES_METADATA: rawAiConfig.prompts?.storiesMetadata || "",
    SYSTEM_INSTRUCTION_STORIES_DETAILS: rawAiConfig.instructions?.storiesDetails || "",
    PROMPT_STORIES_DETAILS: rawAiConfig.prompts?.storiesDetails || "",
    SYSTEM_INSTRUCTION_STORIES_BATCH: rawAiConfig.instructions?.storiesBatch || "",
    PROMPT_STORIES_BATCH: rawAiConfig.prompts?.storiesBatch || "",
    SYSTEM_INSTRUCTION_STORIES_REFINE: rawAiConfig.instructions?.storiesRefine || "",
    PROMPT_STORIES_REFINE: rawAiConfig.prompts?.storiesRefine || "",
    INSTRUCTIONS: rawAiConfig.instructions || {},
    PROMPTS: rawAiConfig.prompts || {},
    CONFIG: rawAiConfig,
  },
};

// Modificar antes de desplegar en tu archivo .env
export const ENV_URL = typeof window !== "undefined" ? window.location.origin : "%%CURRENT_ENV%%";
export const IS_PROD = ENV_URL === "%%ENV_PROD%%";
export const CDN_URL = "%%ENV_CDN%%";
