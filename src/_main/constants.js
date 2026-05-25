/**
 * CONSTANTES GLOBALES DEL SISTEMA
 * 
 * Contiene todas las configuraciones globales, claves de almacenamiento,
 * tipos de notificaciones, credenciales de Firebase y configuración de entornos.
 */
export const CONSTANT = {
  APP_NAME: "BaP Framework",
  APP_VERSION: "v2.0.1",
  FIREBASE_AVAILABLE: false, // Regla de Oro: Controla si Firebase está disponible o no.
  STORAGE: {
    KEYS: {
      DIALOG_DATA: "dd",
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
      INFO: 4000,
    },
  },
  AUTH: {
    SIGNED_IN: "AUTH_SIGNED_IN",
    SIGNED_OUT: "AUTH_SIGNED_OUT",
    SIGNED_UP: "AUTH_SIGNED_UP",
    SIGNED_DOWN: "AUTH_SIGNED_DOWN",
    LOGIN_ATTEMPTS: 10,
  },
  FBC: {
    AP: "",
    AD: "",
    DURL: "",
    PID: "",
    SB: "",
    MSID: "",
    AID: "",
  },
  RECAPTCHA: {
    ID: "",
    NAME: "",
  },
  I18N: {
    DEFAULT: "es",
    SUPPORTED: ["es"],
  },
  SOCIAL_MEDIA: {
    EMAIL: {
      TITLE: "Correo electrónico",
      URL: "gonzaloarenasf+bap-framework@gmail.com",
    }
  },
};

// Entornos de despliegue
const E = {
  PROD: "https://bap-framework.cl",
  DEV1: "http://192.168.1.107:8080",
  DEV2: "http://172.20.10.3:8080",
  LOCAL: "http://localhost:8080",
  CDN: "https://cdn-bap-framework.web.app",
};

// Modificar antes de desplegar
export const ENV_URL = E.LOCAL;
export const IS_PROD = ENV_URL === E.PROD;
export const CDN_URL = E.CDN;
