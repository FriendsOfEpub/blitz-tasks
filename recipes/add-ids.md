# Add ids To Specific Elements

It may be useful to “identify” elements such as figures and headings, or even change the pattern of existing ids. And unfortunately, iterating over results is not something a lot of tools (e.g. regex, etc.) can do. This is where the `identify` script may come in handy.

Indeed, `identify` lets you iterate over elements in a document and add an unique identifier with the prefix of your choice.

Let’s start by creating an `add-id.json` config file. We will first define a meaningful scope and version, and initialize `identify`.

```
{
  "scope": "add-id",
  "version": "1.0.0",
  "identify": []
}
```

`identify` is an array of objects in which you `search` and `replace`. The `search` is relying on CSS selectors, which means you can use any selector you would in a CSS stylesheet. The `replace` is the prefix that will be used for ids.

Let’s imagine you want to ad an id to all your figures.

```
{
  "scope": "add-id",
  "version": "1.0.0",
  "identify": [
    {
      "search": "figure", 
      "replace": "fig"
    }
  ]
}
```

Here we are searching for the `figure` element, and add an `id` attribute with the `fig` prefix. This means your first figure will have `id="fig-1"`, second will have `id="fig-2"`, and so on and so forth.

Note the increment will be reset for every document, Blitz Tasks doesn’t try to handle this incrementation per folder or EPUB file.

If you wanted to handle `h2` then, you could do something like this:

```
{
  "scope": "add-id",
  "version": "1.0.0",
  "identify": [
    {
      "search": "figure", 
      "replace": "fig"
    },
    {
      "search": "h2", 
      "replace": "subheading"
    }
  ]
}
```

And all `h2` found would get an `id="subheading-[n]"`. 

You could even identify all spans in paragraphs:

```
{
  "scope": "add-id",
  "version": "1.0.0",
  "identify": [
    {
      "search": "figure", 
      "replace": "fig"
    },
    {
      "search": "h2", 
      "replace": "subheading"
    },
    {
      "search": "p > span",
      "replace": "fragment"
    }
  ]
}
```

And every `span` which is a direct descendant of `p` would get an `id` starting with the prefix `fragment-`. A potential use case for this would be identifying sentences in a document.

It’s worth mentioning `identify` will overwrite any existing `id` (it must be a single value), so you could even use this script to change the pattern of noterefs and footnotes for instance.

```
{
  "scope": "add-id",
  "version": "1.0.0",
  "identify": [
    {
      "search": "figure", 
      "replace": "fig"
    },
    {
      "search": "h2", 
      "replace": "subheading"
    },
    {
      "search": "p > span",
      "replace": "fragment"
    },
    {
      "search": "a.noteref",
      "replace": "noteref"
    },
    {
      "search": "p.footnote",
      "replace": "footnote"
    }
  ]
}
```

Finally run:

```
gulp -c "./add-id.json"
```

and voilà, all the elements found in your documents now have an `id`.