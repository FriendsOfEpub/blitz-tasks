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
    parserOptions: cheerioOpts
  }))
  .pipe(gulp.dest("output"))
})

gulp.task("sanitize", ["retag"], function() {
  return gulp.src("output/*.{xhtml,html}", {base: "./"})
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
})

gulp.task("classify", ["sanitize"], function() {
  return gulp.src("output/*.{xhtml,html}", {base: "./"})
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
})

gulp.task("identify", ["classify"], function() {
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
    parserOptions: cheerioOpts
  }))
  .pipe(gulp.dest("./"))
})

gulp.task("append", ["identify"], function() {
  return gulp.src("output/*.{xhtml,html}", {base: "./"})
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
})

gulp.task("default", ["init", "retag", "sanitize", "classify", "identify", "append"]);