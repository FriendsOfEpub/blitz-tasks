# Use The First Heading of The Document for The Head’s Title

It’s not uncommon for HTML files to get a generic `<title>`. Hopefully, config options should make it easy to improve it.

Let’s create a `doc-title.json` config file:

```
{
  "scope": "doc-title",
  "version": "1.0.0",
  "options": {
    "docTitle": "h1, h2, h3"
  }
}
```

Property `docTitle` expects a CSS selector.

If you run `gulp -c "./doc-title.json"`, then Blitz Tasks will use the first result it finds. 

Here it will search for `h1`, then for `h2`, and finally fall back to `h3`. As soon as it finds a match, it will use its text for `<title>` in the document’s `<head>`. If it doesn’t find anything, it will keep it untouched.

Options are handled at the very end of the process, which means `docTitle` can take advantage of all [your modifications](clean-output.md). In other words, you could even use ids, classes and other attributes to make it even more efficient.