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

        // Pages
        case i18nPagesToProcess.pages.index:
          console.log(`Replacing custom i18n in ${file.relative} for ${ENV_URL}`);
          htmlReplaced = applyI18n.pageIndex(htmlReplaced);
          break;
        case i18nPagesToProcess.pages.notFound:
          console.log(`Replacing custom i18n in ${file.relative} for ${ENV_URL}`);
          htmlReplaced = applyI18n.page404(htmlReplaced);
          break;
        case i18nPagesToProcess.pages.resume.index:
          console.log(`Replacing custom i18n in ${file.relative} for ${ENV_URL}`);
          htmlReplaced = applyI18n.pageResume(htmlReplaced);
          break;
        case i18nPagesToProcess.pages.contact.index:
          console.log(`Replacing custom i18n in ${file.relative} for ${ENV_URL}`);
          htmlReplaced = applyI18n.pageContact(htmlReplaced);
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
  console.log(">>> Minifying CSS files...");
  return gulp
    .src("src/**/*.css")
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(sourcemaps.identityMap())
    .pipe(
      cleanCSS({ compatibility: "ie8", debug: true }, (details) => {
        // console.log(
        //   `${details.name}: ${details.stats.originalSize / 1000}KB -> ${details.stats.minifiedSize / 1000}KB`s
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
    .pipe(
      obfuscate({
        compact: true,
      })
    )
    .on("error", handleError)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("public"))
    .on("end", () => console.log(">>> JavaScript minification and obfuscation complete."));
}

// Define default task that runs all tasks
const build = gulp.series(minifyCSS, minifyAndReplaceHTML, minifyJS, copyAssetsFolder);

export default build;
