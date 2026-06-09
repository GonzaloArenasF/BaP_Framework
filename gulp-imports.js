import { esES } from "./src/_main/i18n/es-ES.js";
import { CONSTANT } from "./src/_main/constants.js";
import { routes } from "./src/_main/routerPaths.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Lee y parsea el archivo .env local para inyección de credenciales en build-time.
 * Usa solo módulos nativos de Node.js, sin dependencias externas.
 * Si el archivo no existe, retorna un objeto vacío y emite una advertencia.
 */
function loadEnv() {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envFileName = process.env.ENV_FILE || ".env";
    const envContent = fs.readFileSync(path.join(__dirname, envFileName), "utf-8");
    const env = {};
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex !== -1) {
          const key = trimmed.substring(0, eqIndex).trim();
          const value = trimmed.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
          env[key] = value;
        }
      }
    });
    console.log(`✅ ${envFileName} cargado correctamente. Credenciales Firebase listas para inyección.`);
    return env;
  } catch (e) {
    const envFileName = process.env.ENV_FILE || ".env";
    console.warn(`⚠️  No se encontró el archivo ${envFileName}. Los tokens %%FIREBASE_*%% no serán reemplazados en el build.`);
    console.warn("   Crea el archivo correspondiente basado en .env.example antes de compilar.");
    return {};
  }
}

export const firebaseEnv = loadEnv();

function loadBapConfig() {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const configContent = fs.readFileSync(path.join(__dirname, "bap.config.json"), "utf-8");
    const config = JSON.parse(configContent);
    console.log(`✅ bap.config.json cargado correctamente.`);
    return config;
  } catch (e) {
    console.error(`❌ ERROR FATAL: No se pudo leer bap.config.json.`, e);
    process.exit(1);
  }
}

export const bapConfig = loadBapConfig();

// Resolución dinámica de entorno para el proceso de compilación (evita tokens de constants.js)
if (!firebaseEnv.CURRENT_ENV || !firebaseEnv.ENV_CDN || !firebaseEnv.ENV_PROD) {
  throw new Error(`❌ ERROR FATAL: Faltan variables críticas (CURRENT_ENV, ENV_CDN o ENV_PROD) en tu archivo ${process.env.ENV_FILE || ".env"}. Deteniendo compilación.`);
}

export const ENV_URL = firebaseEnv.CURRENT_ENV;
export const CDN_URL = firebaseEnv.ENV_CDN;
export const IS_PROD = ENV_URL === firebaseEnv.ENV_PROD;

const i18n = esES;

const i18nPagesToProcess = {
  pages: bapConfig.build?.i18nItemsToProcess?.pages || {},
  components: {},
};

if (bapConfig.build?.i18nItemsToProcess?.components) {
  for (const [key, value] of Object.entries(bapConfig.build.i18nItemsToProcess.components)) {
    i18nPagesToProcess.components[key] = `_components/${value}`;
  }
}

const flattenObject = (obj, prefix = "", res = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    const propName = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      flattenObject(value, propName, res);
    } else {
      res[propName] = value;
    }
  }
  return res;
};

const replaceDynamic = (content, i18nSlice, prefix = "") => {
  let replaced = content;
  const tokens = flattenObject(i18nSlice, prefix);
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === "string") {
      replaced = replaced.replaceAll(`{${key}}`, value);
    }
  }
  return replaced;
};

const applyI18n = {
  common: (content) => {
    let replaced = content
      .replace("{lang}", "es")
      .replaceAll("{ENV_URL}", ENV_URL)
      .replaceAll("{CDN_URL}", CDN_URL)
      .replaceAll("{head-app-name}", bapConfig.app.name)
      .replaceAll("{APP_NAME}", bapConfig.app.name)
      .replaceAll("{APP_VERSION}", bapConfig.app.version);

    // Dynamic replacement of all fully-qualified i18n keys
    const tokens = flattenObject(i18n, "");
    for (const [key, value] of Object.entries(tokens)) {
      if (typeof value === "string") {
        replaced = replaced.replaceAll(`{${key}}`, value);
      }
    }
    return replaced;
  },
  componentBapFooter: (content) => replaceDynamic(content, i18n.component.bapFooter, ""),
  componentBapHeader: (content) => replaceDynamic(content, i18n.component.bapHeader, ""),
  pageIndex: (content) => {
    let replaced = replaceDynamic(content, i18n.page.landing.head, "head");
    return replaceDynamic(replaced, i18n.page.landing.body, "landing.body");
  },
  page404: (content) => {
    let replaced = replaceDynamic(content, i18n.page.notFound.head, "head");
    return replaceDynamic(replaced, i18n.page.notFound.body, "body");
  },
};

export default { i18n, applyI18n, i18nPagesToProcess, ENV_URL, CONSTANT, firebaseEnv, IS_PROD, bapConfig };
