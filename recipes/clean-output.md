# Clean The Export From An Authoring Tool

Modifying markup that has been output from an authoring tool is probably the best playground for Blitz Tasks because it shows how powerful the `retag` and `sanitize` scripts can be with recognizable patterns.

**Note:** Of course you may be able to remediate some issues in the authoring tool itself, but the sample we are using here is for illustrative purposes. Besides, there exists situations in which the source document may not be available, or modifying hundreds of source documents would be a Herculean task.

Without further ado, let’s see a sample of the markup we have to improve:


```
<html>
<head>…</head>
<body>
<div id="_idContainer021" class="_idGenObjectStyleOverride-1">

  <div class="_idGenObjectLayout-1">
    <div id="_idContainer001">
      <img class="_idGenObjectAttribute-1" src="image/image-1" alt="" />
    </div>
  </div>
			
  <p class="chapter_title">Title of chapter</p>

  <p class="first"><span class="_idGenDropcap-1">T</span><span class="CharOverride-9">ext text text text text.</p>

  <p class="Normal"><span class="CharOverride-10">Text text text text text</span></p>

</div>
</body>
</html>
```

Obviously, this is not great, and you may spend a significant amount of time improving that in one or several EPUB files.

This is where Blitz Tasks will shine.

First, let’s create and initialize an `id2018.json` config file using these 2 scripts: 

```
{
  "scope": "id2018",
  "version": "1.0.0",
  "retag": [],
  "sanitize": []
}
```

And now, let’s retag and sanitize to improve this markup.

## Retag

There’s a couple of tags we can improve already. Indeed, you probably want to avoid divitis, and use semantic elements instead. In this small sample, we can use a section, a figure, and a heading.

First, the section:

```
{
  …
  "retag": [
    {
      "search": "body > div[class^='_idGenObjectStyleOverride']",
      "replace": "section"
    }
  ],
  …
}
```

Here we retag every `div` which is a direct descendant of `body`, and has a `class` starting with `_idGenObjectStyleOverride`, to `section`. Its `id` and `class` attributes will be kept, and we will deal with it during `sanitize`.

Then figure: 

```
{
  "search": "div[class^='_idGenObjectLayout'] > div",
  "replace": "figure"
}
```

Here we retag every `div` which is a direct descendant of `div` with a `class` starting with `_idGenObjectLayout`, to `figure`. Its `id` attribute will be kept, and we will deal with it during `sanitize`.

Finally heading: 

```
{
  "search": ".chapter_title",
  "replace": "h1"
}
```

Very simple class selector here. Every time we find `class="chapter-title"`, retag it to `h1`. We’ll take care of its `class` in `sanitize`.

You should end up with…

```
{
  …
  "retag": [
    {
      "search": "body > div[class^='_idGenObjectStyleOverride']",
      "replace": "section"
    },
    {
      "search": "div[class^='_idGenObjectLayout'] > div",
      "replace": "figure"
    },
    {
      "search": ".chapter_title",
      "replace": "h1"
    }
  ],
  …
}
```

So after the `retag` script is run by Blitz Tasks, this is the markup ready for `sanitize`: 

```
<html>
<head>…</head>
<body>
<section id="_idContainer021" class="_idGenObjectStyleOverride-1">

  <div class="_idGenObjectLayout-1">
    <figure id="_idContainer001">
      <img class="_idGenObjectAttribute-1" src="image/image-1" alt="" />
    </figure>
  </div>
			
  <h1 class="chapter_title">Title of chapter</h1>

  <p class="first"><span class="_idGenDropcap-1">T</span><span class="CharOverride-9">ext text text text text.</p>

  <p class="Normal"><span class="CharOverride-10">Text text text text text</span></p>

</section>
</body>
</html>
```

As you can see, there’s still some work to do.

## Sanitize

The `sanitize` script allows you to remove or unwrap elements, or remove their attributes.

We will remove all `_idContainer` identifiers, `_idGenObject` classes, unwrap our figure, unwrap `CharOverride` spans, etc.

First, let’s unwrap:

```
{
  …
  "sanitize": [
    {
      "search": "div[class^='_idGenObjectLayout'], span[class^='CharOverride'], span[class^='_idGenDropcap']",
      "replace": "unwrap"
    }
  ]
}
```

Here we are using the keyword `unwrap` in `replace` to tell Blitz Tasks to remove the element, but not its contents. We will consequently end up with: 

```
<html>
<head>…</head>
<body>
<section id="_idContainer021" class="_idGenObjectStyleOverride-1">

  <figure id="_idContainer001">
    <img class="_idGenObjectAttribute-1" src="image/image-1" alt="" />
  </figure>
			
  <h1 class="chapter_title">Title of chapter</h1>

  <p class="first">Text text text text text.</p>

  <p class="Normal">Text text text text text</p>

</section>
</body>
</html>
```

That’s already a lot better, but we need to remove some attributes now. First, `ids`:

```
{
  "search": "[id^='_idContainer']",
  "replace": "id"
}
```

For every element with an `id` starting with `_idContainer`, we remove the `id` and end up with: 

```
<html>
<head>…</head>
<body>
<section class="_idGenObjectStyleOverride-1">

  <figure>
    <img class="_idGenObjectAttribute-1" src="image/image-1" alt="" />
  </figure>
			
  <h1 class="chapter_title">Title of chapter</h1>

  <p class="first">Text text text text text.</p>

  <p class="Normal">Text text text text text</p>

</section>
</body>
</html>
```

We can finally remove classes. This works like `id`: 

```
{
  "search": "[class^='_idGenObject'], .chapter_title, .Normal",
  "replace": "class"
}
```

And here is our final result: 

```
<html>
<head>…</head>
<body>
<section>

  <figure>
    <img src="image/image-1" alt="" />
  </figure>
			
  <h1>Title of chapter</h1>

  <p class="first">Text text text text text.</p>

  <p>Text text text text text</p>

</section>
</body>
</html>
```

With two scripts and a few searches, we have cleaned our output.

## Recap

Our final config file should look like this: 

```
{
  "scope": "id2018",
  "version": "1.0.0",
  "retag": [
    {
      "search": "body > div[class^='_idGenObjectStyleOverride']",
      "replace": "section"
    },
    {
      "search": "div[class^='_idGenObjectLayout'] > div",
      "replace": "figure"
    },
    {
      "search": ".chapter_title",
      "replace": "h1"
    }
  ],
  "sanitize": [
    {
      "search": "div[class^='_idGenObjectLayout'], span[class^='CharOverride'], span[class^='_idGenDropcap']",
      "replace": "unwrap"
    },
    {
      "search": "[id^='_idContainer']",
      "replace": "id"
    },
    {
      "search": "[class^='_idGenObject'], .chapter_title, Normal",
      "replace": "class"
    }
  ]
}
```

Run:

```
gulp -c "./id2018.json"
```

and voilà, your output has been cleaned.

This means that the next time you’ll have to handle this typical output, it will take seconds to manage this task of improving markup. You could then use `classify`, `identify` and `attributify` scripts to add classes, ids and other attributes.

Of course, Blitz Tasks doesn’t pretend to be a silver bullet. If anything, it is limited by CSS selectors and some more complex modifications may become convoluted or even impossible – thanks to CheerioJS, the syntax is a little bit extended though, so you can use some pseudo-classes like `:has()` to only modify elements containing another one for instance.

That being said, nobody wants to spend hours on the same markup changes over and over again; Blitz Tasks should be able to automate a lot of those changes, and help you focus on what can’t be.