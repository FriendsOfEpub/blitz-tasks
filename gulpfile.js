const minimist = require("minimist");
const gulp = require("gulp");
const cheerio = require("gulp-cheerio");
const imagemin = require("gulp-imagemin");
const cleanCSS = require("gulp-clean-css");
const terser = require("gulp-minify");
const pretty = require("gulp-beautify");
const del = require("del");

const utils = {
  getProperty(string) {
    return string.split("=")[0]
  },
  getValue(string) {
    return string.split("=")[1].replace(/['"]+/g, "")
  }
};

const args = minimist(process.argv.slice(2), {
  string: ["config", "input", "output"],
  boolean: ["force"],
  alias: {c: "config", F: "force", i: "input", o: "output"},
  default: {config: "./config.json", force: false, input: "input", output: "output"}
});

const filePaths = {
  input: args.input,
  output: args.output,
  get html() {
    return this.output + "/**/*.{xhtml,html}"
  },
  get css() {
    return this.output + "/**/*.css"
  },
  get js() {
    return this.output + "/**/*.js"
  },
  get images() {
    return this.output + "/**/*.{gif,jpg,jpeg,png,svg}"
  },
  get opf() {
    return this.output + "/**/*.opf"
  }
}

const config = require(args.config);

const configOpts = config.options;

const cheerioOpts = {
  xmlMode: true,
  decodeEntities: false,
  lowerCaseTags: true,
  lowerCaseAttributeNames: true,
  recognizeSelfClosing: true
}

const prettyOpts = {
  "indent_size": 2,
  "max_preserve_newlines": 1
}

function init() {
  console.log("The scope of this config file is: " + config.scope, config.version);
  return gulp.src(filePaths.input + "/**")
  .pipe(gulp.dest(filePaths.output))
}

function deleteFiles() {
  if ((configOpts && configOpts.deleteFiles)) {
    let filesToDelete = [];
    for (let f in configOpts.deleteFiles) {
      const fileToDelete = filePaths.output + "/**/" + configOpts.deleteFiles[f];
      filesToDelete.push(fileToDelete);
    }
    return del(filesToDelete);
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function retag() {
  if (config.retag) {
    return gulp.src(filePaths.html, {base: "./"})
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
    return gulp.src(filePaths.html, {base: "./"})
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
    return gulp.src(filePaths.html, {base: "./"})
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
    return gulp.src(filePaths.html, {base: "./"})
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
    return gulp.src(filePaths.html, {base: "./"})
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
    return gulp.src(filePaths.html, {base: "./"})
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

function handleOPF() {
  if (configOpts && configOpts.deleteFiles && configOpts.epub) {
    return gulp.src(filePaths.opf, {base: "./"})
    .pipe(cheerio({
      run: function ($, file) {
        for (let f in configOpts.deleteFiles) {
          const fileToDelete = configOpts.deleteFiles[f];

          $("manifest > item[href$='" + fileToDelete + "']").each(function() {
            $("spine").find("itemref[idref='" + $(this).attr("id") + "']").remove();
            $(this).remove();
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
    return gulp.src(filePaths.html, {base: "./"})
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
    return gulp.src(filePaths.images, {base: "./"})
    .pipe(imagemin())
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function minifyCSS() {
  if ((configOpts && configOpts.minifyCSS) || args.force) {
    return gulp.src(filePaths.css, {base: "./"})
    .pipe(cleanCSS())
    .pipe(gulp.dest("./"))     
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function minifyJS() {
  if ((configOpts && configOpts.minifyJS) || args.force) {
    return gulp.src(filePaths.js, {base: "./"})
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

function prettyHTML() {
  if ((configOpts && configOpts.prettyHTML) || args.force) {
    return gulp.src(filePaths.html, {base: "./"})
    .pipe(pretty.html(prettyOpts))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function prettyCSS() {
  if ((configOpts && (configOpts.prettyCSS && !configOpts.minifyCSS)) || args.force) {
    return gulp.src(filePaths.css, {base: "./"})
    .pipe(pretty.css(prettyOpts))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

function prettyJS() {
  if ((configOpts && (configOpts.prettyJS && !configOpts.minifyJS)) || args.force) {
    return gulp.src(filePaths.js, {base: "./"})
    .pipe(pretty.js(prettyOpts))
    .pipe(gulp.dest("./"))
  } else {
    return Promise.resolve("Config doesn’t use this task, it was ignored.");
  }
}

const handleHTML = gulp.series(docOptions, prettyHTML);
const handleCSS = gulp.series(prettyCSS, minifyCSS);
const handleJS = gulp.series(prettyJS, minifyJS);

const handleOptions = gulp.parallel(handleHTML, imageOptim, handleCSS, handleJS);

exports.init = init;
exports.deleteFiles = deleteFiles;
exports.retag = retag;
exports.sanitize = sanitize;
exports.classify = classify;
exports.identify = identify;
exports.attributify = attributify;
exports.append = append;
exports.handleOPF = handleOPF;
exports.imageOptim = imageOptim;
exports.minifyCSS = minifyCSS;
exports.minifyJS = minifyJS;
exports.prettyHTML = prettyHTML;
exports.prettyCSS = prettyCSS;
exports.prettyJS = prettyJS;
exports.handleOptions = handleOptions;
exports.default = gulp.series(init, deleteFiles, retag, sanitize, classify, identify, attributify, append, handleOPF, handleOptions);