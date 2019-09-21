const minimist = require('minimist');
const gulp = require("gulp");
const cheerio = require("gulp-cheerio");

const args = minimist(process.argv.slice(2), {
  string: ["config"],
  alias: {c: "config"},
  default: {config: "./config.json"}
});

const config = require(args.config);

gulp.task("init", function() {
  console.log("The scope of this config file is: " + config.scope, config.version);
})

gulp.task("retag", function() {
  return gulp.src("input/*.{xhtml,html}")
  .pipe(cheerio({
    run: function ($, file) {
      if (config.retag) {
        for (let x in config.retag) {
          $(config.retag[x].search).each((i, item) => {item.tagName = config.retag[x].replace});
        }
      }
    },
    parserOptions: {
      xmlMode: true,
      decodeEntities: false,
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
      recognizeSelfClosing: true
    }
  }))
  .pipe(gulp.dest("output"))
})

gulp.task("sanitize", ["retag"], function() {
  return gulp.src("output/*.{xhtml,html}", {base: "./"})
  .pipe(cheerio({
    run: function ($, file) {

      if (config.sanitize) {
        for (let x in config.sanitize) {
          if (config.sanitize[x].unwrap) {
            $(config.sanitize[x].unwrap).each(function() {
              $(this).replaceWith($.html(this.children));
            })
          } else if (config.sanitize[x].removeClass) {
            $(config.sanitize[x].removeClass).each(function() {
              $(this).removeAttr("class");
            });
          }
        }
      }
      
    },
    parserOptions: {
      xmlMode: true,
      decodeEntities: false,
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
      recognizeSelfClosing: true
    }
  }))
  .pipe(gulp.dest("./"))
})

gulp.task("identify", ["sanitize"], function() {
  return gulp.src("output/*.{xhtml,html}", {base: "./"})
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
    parserOptions: {
      xmlMode: true,
      decodeEntities: false,
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
      recognizeSelfClosing: true
    }
  }))
  .pipe(gulp.dest("./"))
})

gulp.task("default", ["init", "retag", "sanitize", "identify"]);