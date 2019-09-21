# markupatron

Automating markup changes with node, gulp and config files

## Install

First make sure you have nodeJS and npm installed. 

We recommend installing the dev dependencies locally so that this repo can be used as a template.

```
npm install -g gulp gulp-cheerio
```

Then 

```
npm install
```

## Usage

Make a custom/modify the existing config file then:

```
gulp <task> --config "path/to/config.json"
```

### Examples

This will run all tasks with the existing config file:

```
gulp
```

This will run all tasks with a custom config file:

```
gulp -c "./input/another-config.json"
```

This will only run the retag task with the existing config file:

```
gulp retag
```

This will only run the retag task with a custom config file:

```
gulp retag --config "./input/another-config.json"
```

## Config

Markupatron makes use of JSON config file to change your documents. 

It is recommended to define a useful `scope` and `version` for each config file. Those 2 properties are informational today, but may be used for scoping changes to precise folders, etc. in the future.

There are 5 extra (optional) properties, which are bound to tasks Markupatron currently supports:

1. retag
2. sanitize 
3. classify
4. identify
5. append

Most of these tasks are conceptually “search & replace” for the Document Object Model (DOM), with CSS selectors as the syntax. However some may slightly differ so let’s see those tasks in detail.

Technical note: the value of those 5 properties is an array of objects whose keys differ depending on the task.

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

It’s search & replace again, but what’s important here is the value of `replace`.

#### Remove Elements

If you’re using value `"this"` then Markupatron will know is has to remove the element entirely – removing its contents as well.

```
{
  "search": ".remove",
  "replace": "this"
}
```

#### Unwrap

If you’re using value `"unwrap"` then Markupatron will know is has to unwrap the element – keeping its contents.

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

Classify lets you add a class or overwrite an existing one. This means it will first remove the class entirely then add the classes in replace. 

```
{
  "search": "figure + h1",
  "replace": "no-margin-top"
}
```

In this example, we search for `h1` after `figure` and add a `no-margin-top` class. If there were classes in the input, they will be removed.

### Identify

Identify lets you iterate over elements and add an identifier. Here there is nothing to `replace` so we are using a `prefix`.

```
{
  "search": "p", 
  "prefix": "para"
}
```

In this example, each paragraph will get an id with prefix `para` e.g. first paragraph in the doc will be `para-1`, second will be `para-2` and so on.

### Append

Append lets you add elements in each document. It is not using the “search & replace” concept but “where & what.”

Indeed, `where` is the element inside which you want to add `what` at the end (append).

```
{
  "where": "head",
  "what": "<link type='text/css' rel='stylesheet' href='../css/my-styles.css'/>"
}
```

In this example, we are adding a stylesheet at the end of `<head>`.