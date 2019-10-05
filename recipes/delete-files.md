# Delete Files In All EPUB Folders

Sometimes you need to remove some files from a batch of EPUBs, and this can be a very boring task since you have to delete files, but also their references in some other files (HTML documents, Package’s OPF, nav doc, etc.).

Blitz Tasks to the rescue again!

Let’s imagine we want the remove the cover and `blitz-kindle.css` files in [input/folder](../input/folder).

## Delete Links And Scripts In HTML Documents

We have to remove `blitz-kindle.css` links in all our XHTML documents first.

Let’s start by creating a `del-example.json` config file. We will first define a meaningful scope and version, and initialize `sanitize`.

```
{
  "scope": "del-example",
  "version": "1.0.0",
  "sanitize": []
}
```

Thanks to the CSS selector syntax, we can target a `link` element whose `href` ends with a filename.

```
{
  "scope": "del-example",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "link[href$='blitz-kindle.css']",
      "replace": "this"
    }
  ]
}
```

And we should end up with this “Search & Replace” object. By using value `this` in `replace`, we instruct Blitz Tasks do remove the `link` entirely.

## Delete Files

In order to delete files physically, we need to add options:

```
{
  "scope": "del-example",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "link[href$='blitz-kindle.css']",
      "replace": "this"
    }
  ],
  "options": {
    "deleteFiles": []
  }
}
```

Property `deleteFiles` expects an array, even if you want to only remove a single file. So let’s delete our stylesheet now that HTML documents don’t use it anymore:

```
{
  "scope": "del-example",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "link[href$='blitz-kindle.css']",
      "replace": "this"
    }
  ],
  "options": {
    "deleteFiles": ["blitz-kindle.css"]
  }
}
```

We also want to remove the cover, which means we have to remove an XHTML and an image file:

```
{
  "scope": "del-example",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "link[href$='blitz-kindle.css']",
      "replace": "this"
    }
  ],
  "options": {
    "deleteFiles": ["blitz-kindle.css", "cover.xhtml", "cover.png"]
  }
}
```

Blitz Tasks now knows that everytime it encounters `blitz-kindle.css`, `cover.xhtml`, and `cover.png`, it has to delete the file.

However, that won’t remove those from the EPUB’s OPF file, nor its navigation documents.

## Switch The EPUB Option

Enters the `epub` option:

```
{
  "scope": "del-example",
  "version": "1.0.0",
  "sanitize": [
    {
      "search": "link[href$='blitz-kindle.css']",
      "replace": "this"
    }
  ],
  "options": {
    "deleteFiles": ["blitz-kindle.css", "cover.xhtml", "cover.png"],
    "epub": true
  }
}
```

By setting `epub` to `true`, you are telling Blitz to handle all those EPUB idiosyncrasies. In other words, it will check for reference to those files in the OPF, nav document, and NCX, and remove them.

## Recap

Run:

```
gulp -c "./del-example.json"
```

and voilà, those files and their references in key EPUB files have been removed.

The best part of it is that Blitz Tasks delete those files early in the process, so that they are not processed at all! This may be very visible when optimizing images for instance.

In version 1, we have chosen to separate concerns, and require HTML documents to be handled with the `sanitize` script. 

Indeed, there might be edge cases (e.g. hyperlinks in contents), and we don’t have enough feedback to take those into account right now. Maybe you want to add a class so that you can handle them manually later, maybe you just want to unwrap, etc.

That being said, do not hesitate to open an issue if you think everything should be handled from `options`.