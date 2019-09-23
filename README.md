# Blitz Tasks

Automating markup changes with node, gulp and config files.

## Abstract

Blitz Tasks is a set of gulp scripts to automate (X)HTML markup changes and apply some useful optimizations (image optim + CSS/JS minification). Files and folders you put in `input` will go through pipelines then show up in `output`.

It is using JSON config files with a “search & replace” affordance. You search in documents using CSS selectors, then replace in a variety of ways e.g. changing the tag, removing the element, adding classes and ids, etc.

## Alternatives

We don’t know of any alternative right now but will warmly welcome any project duplicating features in the same or another language, and promote it ([we mean it](#why-nodejs)).

## Use Cases

The idea behind Blitz Tasks is to modify the markup of a large amount of files with a “common pattern” – hence the config files. Here are a few use cases which drove its design:

- you must modify dozens of older HTML files (e.g. backlist EPUB);
- you have to systematically clean and improve the markup that is output by an authoring tool;
- you want to upgrade lots of files to HTML5 (or EPUB3);
- you want to add `id` to all your headings, figures, notes, etc.;
- you want to remove or rename a lot of classes;
- you want to add elements e.g. stylesheet, metas, etc. to a large amount of files;
- you want to use the heading of the document for its title;
- you want to add a `lang` to hundreds of files;
- etc.

On top of that, Blitz Tasks also provides image optimization and CSS/JS minification as process options.

## Install

First make sure you have nodeJS and npm installed. If you don’t [install it](https://nodejs.org).

Then either clone this repository:

```
git clone https://github.com/FriendsOfEpub/blitz-tasks.git
```

Or “use this template” on github, which will create your own repository with the same files and folders.

Then install `gulp-cli` globally:

```
npm install -g gulp-cli
```

Finally `cd` into the project and:

```
npm install
```

This will install all required dependencies (gulp, gulp-cheerio, etc.).

## Usage

Put your files in `input` (you can safely add entire folders e.g. unzipped epub).

Make your config file then:

```
gulp
```

Your modified folders/files are now available in `output`.

### Examples

This will run tasks with the existing config file:

```
gulp
```

This will run tasks with a custom config file:

```
gulp -c "./another-config.json"
```

If you don’t need to use a script, don’t use it (remove it entirely) in your config.json. Blitz Tasks will know it doesn’t have to run it at all. See [another-config.json](another-config.json) as an example.

## Config

Blitz Tasks uses a JSON config file to modify your documents. 

It is recommended to define a useful `scope` and `version` for each config file. Those 2 properties are informational today, but may be used for scoping changes to precise folders, etc. in the future.

There are 5 optional properties bound to the scripts Blitz Tasks currently offers:

1. retag
2. sanitize 
3. classify
4. identify
5. append

Most of these scripts are conceptually “search & replace” for the Document Object Model (DOM), with CSS selectors as the syntax. However some may slightly differ so let’s see these scripts in detail.

Technical note: the value of those 5 properties is an array of objects whose keys differ depending on the script.

You can take a look at the [example config](config.json) for more examples.

### Retag

Retag lets you change the markup of all elements found in the DOM. It’s “search & replace” for HTML markup.

```
{
  "search": ".image",
  "replace": "figure"
}
```

Here we are searching for all elements whose class is `image`, and replace the current tag with `figure`.

### Sanitize

Sanitize lets you remove or unwrap elements, and remove attributes.

It’s “search & replace” again, but what’s important here is the value of `replace`.

#### Remove Elements

If you’re using value `"this"` then Blitz Tasks will know it has to remove the element entirely – removing its contents as well.

```
{
  "search": ".remove",
  "replace": "this"
}
```

#### Unwrap

If you’re using value `"unwrap"` then Blitz Tasks will know it has to unwrap the element – keeping its contents.

```
{
  "search": "h1 > b, h2 > b, span:not([class]):not([id])",
  "replace": "unwrap"
}
```

#### Remove Attributes

Any other value will be interpreted as an attribute e.g. `class`, `id`, `data-something`, etc.

``` 
{
  "search": ".title-1, .title-2, p.text, em.italic",
  "replace": "class"
}
```

Note that thanks to the CSS selector syntax, you can search for more complex attributes, for instance an `id` whose value starts with `x`.

```
{
  "search": "[id^='x']",
  "replace": "id"
}
```

### Classify

Classify lets you add a class or overwrite an existing one. This means it will first remove the class entirely then add classes defined in replace. 

```
{
  "search": "figure + h1",
  "replace": "no-margin-top"
}
```

In this example, we search for `h1` after `figure` and add a `no-margin-top` class. If there were existing classes, they will be overwritten.

### Identify

Identify lets you iterate over elements and add an identifier. Here `replace` is the prefix that will be used for ids.

```
{
  "search": "p", 
  "replace": "para"
}
```

In this example, each paragraph will get an `id` with prefix `para` e.g. first paragraph in the doc will be `para-1`, second will be `para-2` and so on. If there were existing ids, they will be overwritten.

### Append

Append lets you add elements in each document. It is not using the “search & replace” concept but “where & what.”

Indeed, `where` is the element at the end of which you want to add something (`what`).

```
{
  "where": "head",
  "what": "<link type='text/css' rel='stylesheet' href='../css/my-styles.css'/>"
}
```

In this example, we are adding a stylesheet at the end of `<head>`.

### Options

Finally, options allow you to define global changes and optimizations when processing.

With options you can: 

- automate replacing the document title with headings found in a document;
- set a default language for each document;
- optimize images;
- minify stylesheets;
- minify scripts.

#### Document Title

Property `docTitle` expects a CSS selector and allows you to define what the `<title>` of the document should be. 

```
"options": {
  "docTitle": "h1, h2"
}
```

Here, we instruct Blitz Tasks that it should check for an `h1`, and if it doesn’t find any, check `h2`. It will use the text content of the first result found.

If no result is found in a document, it will ignore the option.

#### Document Language

Property `docLang` expects a BCP-47 language tag and allows you to define a `lang` attribute for the root element (`html`).

```
"options": {
  "docLang": "fr"
}
```

If the document is XHTML, is will also add an `xml:lang` attribute.

#### Image Optimization

Property `imageOptim` expects a boolean.

```
"options": {
  "imageOptim": true
}
```

When set to `true`, all GIF, JPEG, PNG, and SVG images will be optimized.

#### Stylesheets Minification

Property `minifyCSS` expects a boolean.

```
"options": {
  "minifyCSS": true
}
```

When set to `true`, all stylesheets (`.css`) will be minified (a.k.a. removing comments, new lines, spaces, etc.).

#### Scripts Minification

Property `minifyJS` expects a boolean.

```
"options": {
  "minifyJS": true
}
```

When set to `true`, all scripts (`.js`) will be uglified (a.k.a. removing comments, new lines, spaces, etc.).

## Advanced Usage

Blitz Tasks makes each one of its scripts available if you don’t want to run the default. Note you must `gulp init` before running those scripts.

Obviously, you must still have a config file for these scripts to run.

If you intend to run multiple scripts, don’t forget to use the `--series` flag e.g. `gulp retag sanitize --series`.

### Examples

First, you must init a session: 

```
gulp init
```

`init` will copy everything from `input` into `output`. Indeed, Blitz Tasks doesn’t modify your input, just in case, and will only alter files it finds in the output folder. This means you should think in terms of “sessions.” Each time you add to input, you should consider it a new session – `default` script automatically creates a new session every time it is run.

This will only run the retag script with the existing config file:

```
gulp retag
```

This will run retag then sanitize. The `--series` flag must be used in order to run those scripts one after the other – otherwise scripts would be run asynchronously.

```
gulp retag sanitize --series
```

Finally, this will run identify and append with a custom config:

```
gulp identify append --series --config "./another-config.json"
```

### Available Scripts

- default
- init
- retag
- sanitize
- classify
- identify
- append
- handleOptions
- imageOptim (`--force` flag will bypass config.json)
- minifyCSS (`--force` flag will bypass config.json)
- minifyJS (`--force` flag will bypass config.json)

You can see a list of available scripts by running `gulp --tasks`.

## Future Addressed Questions (FAQ)

Here’s a couple of questions that might pop up at some point in time, and attempts at an honest answer.

### Why NodeJS

Because that is the environment maintainers are comfortable with, hence the easiest way to create such a project. That’s it. 

If we had to care about all the twitter fights on XML vs. JSON vs. YAML, or technology X vs. technology Y in general, a lot of tools wouldn’t even exist.

You are completely free to replicate this project and its goals into any other language/environment you prefer. 

Do not hesitate to let us know so that we can advertise it in this ReadMe, as it would definitely benefit a larger amount of users, especially the ones who are not comfortable with node and JSON.

### Why JSON for Config

Because JSON is like the simplest thing to use in node. It is literally `require("config.json")`, you don’t even need to parse it.

That said, Pull Requests adding support for XML (using [xml2json](https://www.npmjs.com/package/xml2json) for instance), YAML, or anything else, will be greatly appreciated.

If you have this need/requirement and can manage its addition to Blitz Tasks, do not hesitate if you have questions or need clarifications.

### Can I Have a Script For X

We welcome any idea, improvement, or fix that will benefit all users. 

A good rule of thumb is to request global utilities that can be used for other various use cases. On the opposite, requesting something to fix one of your own workflow issues will be problematic, and likely not considered if not a very common issue for users.

Please note this repository is also a GitHub template so we’ve even made it easier for people to adjust it to their workflow issues.

### How Reliable Is This

Of course a project relying on node/npm is only as reliable as its dependencies… and sh*t obviously happens.

That being said, those scripts helped maintainers go through very tight deadlines, ePub2 to EPUB3 upgrades, Word to EPUB3 conversions, etc. In the end, they saved hundreds, if not thousands, of work hours over the span of 2–3 years.