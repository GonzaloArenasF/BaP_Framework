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
  this.emit('end');
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
  const { ENV_URL, i18n, CONSTANT } = appImports;
  const pagesToProcess = [
    "index.html",
  ];

  return through.obj(function (file, enc, cb) {
    try {
      if (!file.isBuffer()) {
        throw new Error("File not readble");
      }

      if (pagesToProcess.includes(file.relative)) {
        console.log(`Replacing metas in ${file.relative} for ${ENV_URL}`);
        let htmlReplaced = file.contents
          .toString(enc)
          .replace("{lang}", "es")
          .replaceAll("{ENV_URL}", ENV_URL)
          .replaceAll("{head-app-name}", CONSTANT.APP_NAME)
          .replaceAll("{APP_VERSION}", CONSTANT.APP_VERSION);

        switch (file.relative) {
          case pagesToProcess[0]:
            htmlReplaced = htmlReplaced
              .replaceAll("{head-meta-description}", i18n.page.landing.head.meta.description)
              .replaceAll("{head-meta-title}", i18n.page.landing.head.meta.title)
              .replaceAll("{head-meta-keywords}", i18n.page.landing.head.meta.keywords)
              .replaceAll("{head-title}", i18n.page.landing.head.title);
            break;
        }

        file.contents = Buffer.from(htmlReplaced);
      }
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
  console.log(">>> Minifying CSS files...");
  return gulp
    .src("src/**/*.css")
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(sourcemaps.identityMap())
    .pipe(
      cleanCSS({ compatibility: "ie8", debug: true }, (details) => {
        // console.log(
        //   `${details.name}: ${details.stats.originalSize / 1000}KB -> ${details.stats.minifiedSize / 1000}KB`
        // );
      })
    )
    .on("error", handleError)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("public"))
    .on("end", () => console.log(">>> CSS minification complete."));
}

// Minify and Obfuscate JavaScript
function minifyJS() {
  console.log(">>> Minifying and obfuscating JavaScript files...");
  return gulp
    .src("src/**/*.js")
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(sourcemaps.identityMap())
    .pipe(obfuscate({
      compact: true,
      controlFlowFlattening: true, // Adds control flow flattening
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true, // Adds dead code injection
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true, // Adds anti-debugging features
      debugProtectionInterval: 1000, // Set to a valid number (e.g., 1000 ms)
      disableConsoleOutput: true, // Disables console output
      stringArray: true, // Encodes string literals
      stringArrayEncoding: ['base64'], // Encodes strings using base64
      stringArrayThreshold: 0.75,
    }))
    .on("error", handleError)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("public"))
    .on("end", () => console.log(">>> JavaScript minification and obfuscation complete."));
}

// Define default task that runs all tasks
const build = gulp.series(
  gulp.parallel(minifyCSS, minifyAndReplaceHTML, minifyJS),
  copyAssetsFolder
);

export default build;
