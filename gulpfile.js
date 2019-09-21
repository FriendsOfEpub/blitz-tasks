const minimist = require('minimist');
const gulp = require("gulp");
const cheerio = require("gulp-cheerio");

const args = minimist(process.argv.slice(2), {
  string: ["config"],
  alias: {c: "config"},
  default: {config: "./config.json"}
});

const config = require(args.config);

const cheerioOpts = {
  xmlMode: true,
  decodeEntities: false,
  lowerCaseTags: true,
  lowerCaseAttributeNames: true,
  recognizeSelfClosing: true
}

function init() {
  console.log("The scope of this config file is: " + config.scope, config.version);
  return gulp.src("input/**")
  .pipe(gulp.dest("output"))
}

function retag() {
  return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
  .pipe(cheerio({
    run: function ($, file) {
      if (config.retag) {
        for (let x in config.retag) {
          $(config.retag[x].search).each((i, item) => {item.tagName = config.retag[x].replace});
        }
      }
    },
    parserOptions: cheerioOpts
  }))
  .pipe(gulp.dest("./"))
}

function sanitize() {
  return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
  .pipe(cheerio({
    run: function ($, file) {

      if (config.sanitize) {
        for (let x in config.sanitize) {
          $(config.sanitize[x].search).each(function() {
            const xReplace = config.sanitize[x].replace;
            
            if (xReplace === "this") {
              $(this).remove();
            } else if (xReplace === "unwrap") {
              $(this).replaceWith($.html(this.children));
            } else {
              $(this).removeAttr(xReplace);
            }
          });
        } 
      }
      
    },
    parserOptions: cheerioOpts
  }))
  .pipe(gulp.dest("./"))
}

function classify() {
  return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
  .pipe(cheerio({
    run: function ($, file) {

      if (config.classify) {
        for (let x in config.classify) {
          $(config.classify[x].search).each(function() {
            $(this).removeAttr("class").addClass(config.classify[x].replace);
          });
        }
      }
    },
    parserOptions: cheerioOpts
  }))
  .pipe(gulp.dest("./"))
}

function identify() {
  return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
  .pipe(cheerio({
    run: function ($, file) {

      if (config.identify) {
        for (let x in config.identify) {
          $(config.identify[x].search).each(function(i, item) {
            var id = config.identify[x].prefix + "-" + (i + 1);
            $(this).attr("id", id);
          });
        }
      }
    },
    parserOptions: cheerioOpts
  }))
  .pipe(gulp.dest("./"))
}

function append() {
  return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
  .pipe(cheerio({
    run: function ($, file) {

      if (config.append) {
        for (let x in config.append) {
          $(config.append[x].where).each(function() {
            $(this).append(config.append[x].what);
          });
        }
      }
    },
    parserOptions: cheerioOpts
  }))
  .pipe(gulp.dest("./"))
}

function handleOptions() {
  return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
  .pipe(cheerio({
    run: function ($, file) {

      if (config.options) {
        if (config.options.docTitle) {
          const title = $("title");
          const headings = $(config.options.docTitle);
          if (headings.length > 0) {
            if (title.length > 0) {
              title.text(headings.eq(0).text());
            } else {
              $("head").append("\n\t<title>" + heading.text() + "</title>\n")
            }
          }
        }

        if (config.options.lang) {
          $("html").attr("lang", config.options.lang);

          if (file.path.indexOf(".xhtml") !== -1) {
            $("html").attr("xml:lang", config.options.lang);
          }
        }
      }
    },
    parserOptions: cheerioOpts
  }))
  .pipe(gulp.dest("./"))
}

exports.init = init;
exports.retag = retag;
exports.sanitize = sanitize;
exports.classify = classify;
exports.identify = identify;
exports.append = append;
exports.handleOptions = handleOptions;
exports.default = gulp.series(init, retag, sanitize, classify, identify, append, handleOptions);