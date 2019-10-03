# Add a Lang To All Your Documents

Specifying a `lang` to your `<html>` is important. Indeed, it will trigger a compatible voice for text to speech for instance, as well as proper rules for hyphenation. And some text-related styles and transforms will also use this piece of information.

Hopefully, config options should make it easy to add a default `lang` to all your (X)HTML files.

Let’s create an `add-lang.json` config file:

```
{
  "scope": "add-lang",
  "version": "1.0.0",
  "options": {
    "docLang": "fr"
  }
}
```

Property `docLang` expects a BCP-47 language tag. 

If you run `gulp -c "./add-lang.json"`, then Blitz Tasks will add this `lang` attribute with a value of `fr` on the root element (`html`) of every file it processes. If the document is XHTML, it will also add an `xml:lang` attribute.

This is a fairly simple way to improve your documents, and make the user experience more robust.

It bears repeating Blitz Tasks is not a silver bullet and `docLang` should just be considered a default when batch-processing files. The documents it processes may indeed be in, or contain, another language. But it should at least help you handle the vast majority of cases and focus on what can’t be automated.