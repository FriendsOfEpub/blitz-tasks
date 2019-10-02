# Convert EPUB Type To ARIA DPUB Roles

Before proceeding further, let us make it clear that using Blitz Tasks will be quite subpar if you need to handle every `epub:type` ever, and you’d be better off using another script dedicated to this task. 

That said, Blitz Tasks can come in handy when you have a couple of corrections and additions to make.

We will make use of the `sanitize` and `attributify` scripts here.

[Epub Type To ARIA Role Authoring Guide](https://idpf.github.io/epub-guides/epub-aria-authoring/#sec-mappings) will be our reference document for mapping. 

## Remove Faulty Roles

Let’s imagine you just ran EPUBCheck and got an awful lot of issues related to ARIA Roles. Indeed, ARIA roles are more restricted in where they can be used than EPUB’s structural semantics, and maybe a bunch of your files are using some ARIA roles on elements that are actually not allowed.

We will use the `sanitize` script in our config file to handle that. All examples are inspired by issues that were recorded in EPUBCheck’s issue tracker.

Let’s start by creating an `epub2aria.json` config file. We will first define a meaningful scope and version, and initialize `sanitize`.

```
{
  "scope": "epub2aria",
  "version": "1.0.0",
  "sanitize": []
}
```

`sanitize` is an array of objects in which you `search` and `replace`. The `search` is relying on CSS selectors, which means you can use any selector you would in a CSS stylesheet. We can definitely use this syntax to remove ARIA Roles on elements that are not allowed.

For instance, you can’t have `doc-epigraph` on `section`:

```
{
  "scope": "epub2aria",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "section[role='doc-epigraph']",
      "replace": "role"
    }
  ]
}
```

You can’t either have a `doc-footnote` for `section`. But instead of adding another “search & replace”, we’ll add it to the one we have just created, leveraling the CSS selector syntax:

```
{
  "scope": "epub2aria",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "section[role='doc-epigraph'], section[role='footnote']",
      "replace": "role"
    }
  ]
}
```

Finally, there’s the infamous `doc-cover`, which is very complex in the sense it is mapped to the `property="cover-image"` in the `.opf` file. So, in any case, it should be used on `img`… if you are sure this is the same one used in the `.opf` file.

```
{
  "scope": "epub2aria",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "section[role='doc-epigraph'], section[role='footnote'], :not(img)[role='doc-cover']",
      "replace": "role"
    }
  ]
}
```

Here we are using the `:not` pseudo-class selector. If `doc-cover` is not on `img` then remove it.

Now that we have removed the `role` attribute for those selectors, let’s correct them.

## Add Roles Based on EPUB Type

In this part, we’ll assume you have `epub:type` attributes you can rely upon.

Once again, Blitz Tasks won’t be the best tool to handle the whole EPUB vocabulary, but it you need to correct a few values or manage a predictable subset, then it can be a reasonable option.

First, let’s initialize `attributify`, which is an array like `sanitize`:

```
{
  …,
  "attributify": []
}
```

We will definitely need more than one object to deal with all the searches ([see also another-config.json](../another-config.json)).

Let’s then deal with the faulty roles we removed in the first part.

Epigraphs: 

```
{
  …,
  "attributify": [
    {
      "search": "section[epub\\:type='epigraph'] blockquote",
      "replace": "role='doc-epigraph'"
    }
  ]
}
```

What is going on there? 

We know `doc-epigraph` must be on a `blockquote`, so we are checking for `blockquote` in a section whose `epub:type` has the value of `epigraph`. Note we have to escape the colon for the CSS selector to find our `section`.

Let’s deal with footnotes now:

```
{
  "search": "section[epub\\:type='footnote'] > aside, section[epub\\:type='footnote'] > div, section[epub\\:type='footnote'] > p",
  "replace": "role='doc-footnote'"
}
```

Here, if we find an `epub:type="footnote"` on a `section`, we add the corresponding ARIA Role on its direct descendant, be it an `aside`, `div`, or `p`.

And now cover images, if you are sure they map to the `.opf`’s `property`.

```
{
  "search": ":not(img)[epub\\:type='cover'] img",
  "replace": "role='doc-cover'"
}
```

You could also target `body`, `section`, `div` or anything else if you know exactly on which element `epub:type="cover"` is used.

We’ll finally assume chapters did not have an ARIA role: 


```
{
  "search": "section[epub\\:type='chapter'], body[epub\\:type='chapter'] > section",
  "replace": "role='doc-chapter'"
}
```

Here we are adding the ARIA Role either to a `section` with the corresponding EPUB Type attribute, or a `section` that is a direct descendant of a `body` element with the same attribute.

Our `attributify` script’s config should now look like:

```
{
  …,
  "attributify": [
    {
      "search": "section[epub\\:type='epigraph'] blockquote",
      "replace": "role='doc-epigraph'"
    },
    {
      "search": "section[epub\\:type='footnote'] > aside, section[epub\\:type='footnote'] > div, section[epub\\:type='footnote'] > p",
      "replace": "role='doc-footnote'"
    },
    {
      "search": ":not(img)[epub\\:type='cover'] img",
      "replace": "role='doc-cover'"
    },
    {
      "search": "section[epub\\:type='chapter'], body[epub\\:type='chapter'] > section",
      "replace": "role='doc-chapter'"
    }
  ]
}
```

You can probably guess why Blitz Tasks would not be the best option if you had to handle every EPUB Type ever created – you’d need a lot of “search & replace” objects while a dedicated script would rely on a mapping to correct and convert.

## Recap

It’s worth mentioning you need a knowledge of the markup you modify to handle this conversion efficiently. But the config file you will end up may look like this: 

```
{
  "scope": "epub2aria",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "section[role='doc-epigraph'], section[role='footnote'], :not(img)[role='doc-cover']",
      "replace": "role"
    }
  ],
  "attributify": [
    {
      "search": "section[epub\\:type='epigraph'] blockquote",
      "replace": "role='doc-epigraph'"
    },
    {
      "search": "section[epub\\:type='footnote'] > aside, section[epub\\:type='footnote'] > div, section[epub\\:type='footnote'] > p",
      "replace": "role='doc-footnote'"
    },
    {
      "search": ":not(img)[epub\\:type='cover'] img",
      "replace": "role='doc-cover'"
    },
    {
      "search": "section[epub\\:type='chapter'], body[epub\\:type='chapter'] > section",
      "replace": "role='doc-chapter'"
    }
  ]
}
```

That may well be reasonable if you are scoping config files to publishers or collections, and there are visible markup patterns you can use to search and replace dozens or even hundreds of files.

Run:

```
gulp -c "./epub2aria.json"
```

and voilà. All the (X)HTML files in your input folder now have proper ARIA Roles.

That’s the idea of Blitz Tasks: a little JSON goes a long way, and helps you focus on other issues and improvements you can’t automate.