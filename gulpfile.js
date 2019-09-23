const minimist = require("minimist");
const gulp = require("gulp");
const cheerio = require("gulp-cheerio");
const imagemin = require("gulp-imagemin");
const cleanCSS = require("gulp-clean-css");
const terser = require("gulp-minify");

const utils = {
  getProperty(string) {
    return string.split("=")[0]
  },
  getValue(string) {
    return string.split("=")[1].replace(/['"]+/g, "")
  }
};

const args = minimist(process.argv.slice(2), {
  string: ["config"],
  boolean: ["force"],
  alias: {c: "config", f: "force"},
  default: {config: "./config.json", force: false}
});

const config = require(args.config);

const cheerioOpts = {
  xmlMode: true,
  decodeEntities: false,
  lowerCaseTags: true,
  lowerCaseAttributeNames: true,
  recognizeSelfClosing: true
}

const configOpts = config.options;

function init() {
  console.log("The scope of this config file is: " + config.scope, config.version);
  return gulp.src("input/**")
  .pipe(gulp.dest("output"))
}

function retag() {
  if (config.retag) {
    return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
    .pipe(cheerio({
      run: function ($, file) {
        for (let x in config.retag) {
          $(config.retag[x].search).each((i, item) => {item.tagName = config.retag[x].replace});
        }
      },
      parserOptions: cheerioOpts
    }))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function sanitize() {
  if (config.sanitize) {
    return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
    .pipe(cheerio({
      run: function ($, file) {
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
      },
      parserOptions: cheerioOpts
    }))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function classify() {
  if (config.classify) {
    return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
    .pipe(cheerio({
      run: function ($, file) {
        for (let x in config.classify) {
          $(config.classify[x].search).each(function() {
            $(this).removeAttr("class").addClass(config.classify[x].replace);
          });
        }
      },
      parserOptions: cheerioOpts
    }))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function identify() {
  if (config.identify) {
    return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
    .pipe(cheerio({
      run: function ($, file) {
        for (let x in config.identify) {
          $(config.identify[x].search).each(function(i, item) {
            const id = config.identify[x].replace + "-" + (i + 1);
            $(this).attr("id", id);
          });
        }
      },
      parserOptions: cheerioOpts
    }))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function attributify() {
  if (config.attributify) {
    return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
    .pipe(cheerio({
      run: function ($, file) {
        for (let x in config.attributify) {
          $(config.attributify[x].search).each(function() {
            const attribute = utils.getProperty(config.attributify[x].replace);
            const value = utils.getValue(config.attributify[x].replace)
            $(this).attr(attribute, value);
          });
        }
      },
      parserOptions: cheerioOpts
    }))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function append() {
  if (config.append) {
    return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
    .pipe(cheerio({
      run: function ($, file) {
        for (let x in config.append) {
          $(config.append[x].where).each(function() {
            $(this).append(config.append[x].what);
          });
        }
      },
      parserOptions: cheerioOpts
    }))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function docOptions() {
  if (configOpts && (configOpts.docTitle || configOpts.docLang)) {
    return gulp.src("output/**/*.{xhtml,html}", {base: "./"})
    .pipe(cheerio({
      run: function ($, file) {
        if (configOpts.docTitle) {
          const title = $("title");
          const headings = $(configOpts.docTitle);
          if (headings.length > 0) {
            if (title.length > 0) {
              title.text(headings.eq(0).text());
            } else {
              $("head").append("\n\t<title>" + headings.eq(0).text() + "</title>\n")
            }
          }
        }
        if (configOpts.docLang) {
          $("html").attr("lang", configOpts.docLang);

          if (file.path.indexOf(".xhtml") !== -1) {
            $("html").attr("xml:lang", configOpts.docLang);
          }
        }
      },
      parserOptions: cheerioOpts
    }))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function imageOptim() {
  if ((configOpts && configOpts.imageOptim) || args.force) {
    return gulp.src("output/**/*.{gif,jpg,jpeg,png,svg}", {base: "./"})
    .pipe(imagemin())
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function minifyCSS() {
  if ((configOpts && configOpts.minifyCSS) || args.force) {
    return gulp.src("output/**/*.css", {base: "./"})
    .pipe(cleanCSS())
    .pipe(gulp.dest("./"))     
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function minifyJS() {
  if ((configOpts && configOpts.minifyJS) || args.force) {
    return gulp.src("output/**/*.js", {base: "./"})
    .pipe(terser({
      ext: {
        min: ".js"
      },
      noSource: true
    }))
    .pipe(gulp.dest("./"))     
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

const handleOptions = gulp.parallel(docOptions, imageOptim, minifyCSS, minifyJS);

exports.init = init;
exports.retag = retag;
exports.sanitize = sanitize;
exports.classify = classify;
exports.identify = identify;
exports.attributify = attributify;
exports.append = append;
exports.imageOptim = imageOptim;
exports.minifyCSS = minifyCSS;
exports.minifyJS = minifyJS;
exports.handleOptions = handleOptions;
exports.default = gulp.series(init, retag, sanitize, classify, identify, attributify, append, handleOptions);