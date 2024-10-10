import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import cleanCSS from "gulp-clean-css";
import obfuscate from "gulp-javascript-obfuscator";
import sourcemaps from "gulp-sourcemaps";
import gulpCopy from "gulp-copy";
import through from "through2";
import appImports from "./gulp-imports.js";

// Assets folder
function copyAssetsFolder() {
  console.log(">>> Copiying ASSETS...");
  return gulp
    .src("src/assets/**") // Matches all JavaScript files in src and subfolders
    .pipe(gulpCopy("public", { prefix: 1 }))
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
    .pipe(obfuscate())
    .on("error", (err) => console.error("Obfuscate error:", err.toString()))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("public"))
    .on("end", () => console.log(">>> JavaScript minification and obfuscation complete."));
}

// Define default task that runs all tasks
const build = gulp.series(minifyCSS, minifyAndReplaceHTML, minifyJS, copyAssetsFolder);

export default build;
