const values = {};

// Environment
values.ENV = {
  URL: {
    DEV: "http://127.0.0.1:8080",
    LOCAL: "http://172.20.10.2:8080",
    QA: "https://your-firebase-qa-env.web.app",
    PROD: "https://your-firebase-prod-env.web.app",
  },
};

// Storage
values.STORAGE = {
  KEYS: {
  },
  SOURCE: {
    LOCAL: "localStorage", // Browser
    SESSION: "sessionStorage", // Browser
    DB: "realtime", // Firebase
  },
};

// Notifications
values.NOTIFICATION = {
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
};

// Auth states
values.AUTH = {
  SIGNED_IN: "AUTH_SIGNED_IN",
  SIGNED_OUT: "AUTH_SIGNED_OUT",
  SIGNED_UP: "AUTH_SIGNED_UP",
  SIGNED_DOWN: "AUTH_SIGNED_DOWN",
  LOGIN_ATTEMPTS: 10,
};

// Firebase
values.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// i18n
values.I18N = {
  DEFAULT: "es",
  SUPPORTED: ["en", "es"],
};

//reCaptcha
values.RECAPTCHA = {
  ACTIONS: {
    
  },
  PROD: {
    ID: "",
    NAME: "",
  },
};

values.APP_NAME = "BaP Framework";
values.APP_VERSION = "v1.0.2";
values.FIREBASE_AVAILABLE = false;

export const CONSTANT = values;

//  Modify before deploy
export const ENV_URL = CONSTANT.ENV.URL["DEV"]; // DEV, LOCAL, QA, PROD