import { esES } from "./src/_main/i18n/es-ES.js";
import { ENV_URL, CONSTANT, CDN_URL, IS_PROD } from "./src/_main/constants.js";
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
    const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
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
    console.log("✅ .env cargado correctamente. Credenciales Firebase listas para inyección.");
    return env;
  } catch (e) {
    console.warn("⚠️  No se encontró el archivo .env. Los tokens %%FIREBASE_*%% no serán reemplazados en el build.");
    console.warn("   Crea el archivo .env basado en .env.example antes de hacer deploy.");
    return {};
  }
}

export const firebaseEnv = loadEnv();

const i18n = esES;

const i18nPagesToProcess = {
  pages: {
    index: "index.html",
    notFound: "404.html",
    resume: {
      index: "pages/resume/index.html"
    },
    contact: {
      index: "pages/contact/index.html",
    },
  },
  components: {
    bapFooter: "_components/bap-footer/bap-footer.html",
  },
};

const applyI18n = {
  common: (content) => {
    return content
      .replace("{lang}", "es")
      .replaceAll("{ENV_URL}", ENV_URL)
      .replaceAll("{CDN_URL}", CDN_URL)
      .replaceAll("{head-app-name}", CONSTANT.APP_NAME)
      .replaceAll("{APP_NAME}", CONSTANT.APP_NAME)
      .replaceAll("{APP_VERSION}", CONSTANT.APP_VERSION);
  },
  componentBapFooter: (content) => {
    return content.replaceAll("{tc}", i18n.component.bapFooter.tc);
  },
  pageIndex: (content) => {
    return content
      .replaceAll("{head.meta.description}", i18n.page.landing.head.meta.description)
      .replaceAll("{head.meta.title}", i18n.page.landing.head.meta.title)
      .replaceAll("{head.meta.keywords}", i18n.page.landing.head.meta.keywords)
      .replaceAll("{head.title}", i18n.page.landing.head.title);
  },
  page404: (content) => {
    return content
      .replaceAll("{head.meta.description}", i18n.page.notFound.head.meta.description)
      .replaceAll("{head.meta.title}", i18n.page.notFound.head.meta.title)
      .replaceAll("{head.meta.keywords}", i18n.page.notFound.head.meta.keywords)
      .replaceAll("{head.title}", i18n.page.notFound.head.title)
      .replace("{body.message}", i18n.page.notFound.body.message)
      .replace("{body.backHome}", i18n.page.notFound.body.backHome);
  },
  pageResume: (content) => {
    return content
      .replaceAll("{head.meta.description}", i18n.page.resume.head.meta.description)
      .replaceAll("{head.meta.title}", i18n.page.resume.head.meta.title)
      .replaceAll("{head.meta.keywords}", i18n.page.resume.head.meta.keywords)
      .replaceAll("{head.title}", i18n.page.resume.head.title)
      .replace("{title}", i18n.page.resume.body.title)
      .replace("{description}", i18n.page.resume.body.description);
  },
  pageContact: (content) => {
    return content
      .replaceAll("{head.meta.description}", i18n.page.contact.head.meta.description)
      .replaceAll("{head.meta.title}", i18n.page.contact.head.meta.title)
      .replaceAll("{head.meta.keywords}", i18n.page.contact.head.meta.keywords)
      .replaceAll("{head.title}", i18n.page.contact.head.title)
      .replace("{intro}", i18n.page.contact.body.intro);
  },
};

export default { i18n, applyI18n, i18nPagesToProcess, ENV_URL, CONSTANT, firebaseEnv, IS_PROD };
