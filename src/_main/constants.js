export const CONSTANT = {
  APP_NAME: "BaP Framework",
  APP_VERSION: "v1.2.0",
  FIREBASE_AVAILABLE: false,
  STORAGE: {
    KEYS: {
      DIALOG_DATA: "dd",
    },
    SOURCE: {
      LOCAL: "localStorage", // Browser
      SESSION: "sessionStorage", // Browser
      DB: "realtime", // Firebase
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
      TITLE: "Email",
      URL: "gonzaloarenasf+bap.page@gmail.com",
    },
    LINKEDIN: {
      TITLE: "LinkedIn",
      URL: "https://cl.linkedin.com/in/",
    },
  },
};

// Environment
const E = {
  PROD: "https://bap-framework.cl",
  DEV1: "http://192.168.1.107:8080",
  DEV2: "http://172.20.10.3:8080",
  LOCAL: "http://localhost",
  CDN: "https://cdn-bap-framework.web.app",
};

//  Modify before deploy
export const ENV_URL = E.DEV1;
export const IS_PROD = ENV_URL == E.PROD;
export const CDN_URL = E.CDN;
