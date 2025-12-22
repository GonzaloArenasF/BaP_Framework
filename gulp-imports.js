import { esES } from "./src/_main/i18n/es-ES.js";
import { ENV_URL, CONSTANT, CDN_URL } from "./src/_main/constants.js";
import { routes } from "./src/_main/routerPaths.js";

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

export default { i18n, applyI18n, i18nPagesToProcess, ENV_URL, CONSTANT };
