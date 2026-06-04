import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import cleanCSS from "gulp-clean-css";
import obfuscate from "gulp-javascript-obfuscator";
import sourcemaps from "gulp-sourcemaps";
import gulpCopy from "gulp-copy";
import through from "through2";
import appImports from "./gulp-imports.js";

// Error handling function
function handleError(err) {
  console.error(err.toString());
  this.emit("end");
}

// A simple no-op stream for conditional piping
const noop = () => through.obj((file, enc, cb) => cb(null, file));

/**
 * Reemplaza los tokens %%NOMBRE%% en los archivos JS con los valores
 * leídos desde el archivo .env local. Se ejecuta antes de la ofuscación
 * para que las credenciales nunca queden expuestas en el código fuente.
 */
function replaceEnvTokens() {
  const { firebaseEnv } = appImports;
  // Mapeo: token en constants.js → clave en .env (nombres estándar de Firebase)
  const tokens = {
    "\"%%FIREBASE_AVAILABLE%%\"": firebaseEnv.FIREBASE_AVAILABLE || "false",
    "%%FIREBASE_AP%%": firebaseEnv.apiKey || "",
    "%%FIREBASE_AD%%": firebaseEnv.authDomain || "",
    "%%FIREBASE_DURL%%": firebaseEnv.databaseURL || "",
    "%%FIREBASE_PID%%": firebaseEnv.projectId || "",
    "%%FIREBASE_SB%%": firebaseEnv.storageBucket || "",
    "%%FIREBASE_MSID%%": firebaseEnv.messagingSenderId || "",
    "%%FIREBASE_AID%%": firebaseEnv.appId || "",
    "%%FIREBASE_MID%%": firebaseEnv.measurementId || "",
    "%%RECAPTCHA_ID%%": firebaseEnv.RECAPTCHA_ID || "",
    "%%RECAPTCHA_NAME%%": firebaseEnv.RECAPTCHA_NAME || "",
    "%%ENV_PROD%%": firebaseEnv.ENV_PROD || "",
    "%%ENV_CDN%%": firebaseEnv.ENV_CDN || "",
    "%%CURRENT_ENV%%": firebaseEnv.CURRENT_ENV || "",
  };

  return through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      let content = file.contents.toString(enc);

      // VUL-04: Validar en tiempo de build si se compila para producción con Firebase inactivo
      if (file.path.endsWith("constants.js")) {
        const isBuildingProd = (firebaseEnv.CURRENT_ENV === firebaseEnv.ENV_PROD);
        const firebaseEnabled = (firebaseEnv.FIREBASE_AVAILABLE === "true");
        const hasFirebaseConfig = !!(firebaseEnv.apiKey); // Solo validar si tiene credenciales en el .env

        if (isBuildingProd && hasFirebaseConfig && !firebaseEnabled) {
          const errMsg = "\n\x1b[31m🔥 ERROR DE COMPILACIÓN (VUL-04):\x1b[0m\n" +
            "   Se está compilando para el entorno de PRODUCCIÓN (CURRENT_ENV === ENV_PROD) en tu archivo .env con Firebase configurado,\n" +
            "   pero la variable FIREBASE_AVAILABLE está desactivada o configurada como 'false' en tu .env local.\n" +
            "   Esto dejaría expuesta la aplicación desplegada con un bypass de seguridad crítico.\n" +
            "   \n" +
            "   👉 Solución: Cambia FIREBASE_AVAILABLE=true en tu archivo .env antes de optimizar para producción,\n" +
            "                o remueve la apiKey de tu .env si deseas un sitio 100% estático sin Firebase.\n";
          console.error(errMsg);
          return cb(new Error(errMsg));
        }
      }

      Object.entries(tokens).forEach(([token, value]) => {
        content = content.replaceAll(token, value);
      });
      file.contents = Buffer.from(content);
    }
    cb(null, file);
  });
}

// Assets folder
function copyAssetsFolder() {
  console.log(">>> Copiying ASSETS...");
  return gulp
    .src("src/assets/**") // Matches all JavaScript files in src and subfolders
    .pipe(gulpCopy("public", { prefix: 1 }))
    .on("error", handleError)
    .on("end", () => console.log(">>> ASSETS copy complete..."));
}

// Replace HTML metatags with i18n
function replacingHeadMetatags() {
  const { applyI18n, i18nPagesToProcess, ENV_URL } = appImports;

  return through.obj(function (file, enc, cb) {
    try {
      if (!file.isBuffer()) {
        throw new Error("File not readble");
      }

      console.log(`Replacing common i18n in ${file.relative} for ${ENV_URL}`);
      let htmlReplaced = applyI18n.common(file.contents.toString(enc));

      switch (file.relative) {
        // Components
        case i18nPagesToProcess.components.bapFooter:
          console.log(`Replacing custom i18n in ${file.relative} for ${ENV_URL}`);
          htmlReplaced = applyI18n.componentBapFooter(htmlReplaced);
          break;
        case i18nPagesToProcess.components.bapHeader:
          console.log(`Replacing custom i18n in ${file.relative} for ${ENV_URL}`);
          htmlReplaced = applyI18n.componentBapHeader(htmlReplaced);
          break;

        // Pages
        case i18nPagesToProcess.pages.index:
          console.log(`Replacing custom i18n in ${file.relative} for ${ENV_URL}`);
          htmlReplaced = applyI18n.pageIndex(htmlReplaced);
          break;
        case i18nPagesToProcess.pages.notFound:
          console.log(`Replacing custom i18n in ${file.relative} for ${ENV_URL}`);
          htmlReplaced = applyI18n.page404(htmlReplaced);
          break;
      }

      file.contents = Buffer.from(htmlReplaced);
    } catch (error) {
      cb(error);
    }
    cb(null, file);
  });
}

// Minify HTML
function minifyAndReplaceHTML() {
  console.log(">>> Minifying HTML files...");
  return gulp
    .src("src/**/*.html")
    .pipe(replacingHeadMetatags())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .on("error", handleError)
    .pipe(gulp.dest("public"))
    .on("end", () => console.log(">>> HTML minification complete."));
}

// Minify CSS
function minifyCSS() {
  const { IS_PROD } = appImports;
  console.log(">>> Minifying CSS files...");
  return gulp
    .src("src/**/*.css")
    .pipe(!IS_PROD ? sourcemaps.init({ largeFile: true }) : noop())
    .pipe(!IS_PROD ? sourcemaps.identityMap() : noop())
    .pipe(
      cleanCSS({ compatibility: "ie8", debug: true }, (details) => {
        // console.log(
        //   `${details.name}: ${details.stats.originalSize / 1000}KB -> ${details.stats.minifiedSize / 1000}KB`s
        // );
      })
    )
    .on("error", handleError)
    .pipe(!IS_PROD ? sourcemaps.write() : noop())
    .pipe(gulp.dest("public"))
    .on("end", () => console.log(">>> CSS minification complete."));
}

// Minify and Obfuscate JavaScript
function minifyJS() {
  const { IS_PROD } = appImports;
  console.log(">>> Minifying and obfuscating JavaScript files...");
  return gulp
    .src("src/**/*.js")
    .pipe(!IS_PROD ? sourcemaps.init({ largeFile: true }) : noop())
    .pipe(!IS_PROD ? sourcemaps.identityMap() : noop())
    .pipe(replaceEnvTokens())  // ← Inyecta credenciales desde .env antes de ofuscar
    .pipe(
      obfuscate({
        compact: true,
      })
    )
    .on("error", handleError)
    .pipe(!IS_PROD ? sourcemaps.write() : noop())
    .pipe(gulp.dest("public"))
    .on("end", () => console.log(">>> JavaScript minification and obfuscation complete."));
}

// Define default task that runs all tasks
const build = gulp.series(minifyCSS, minifyAndReplaceHTML, minifyJS, copyAssetsFolder);

export const _test_replaceEnvTokens = replaceEnvTokens;
export default build;
