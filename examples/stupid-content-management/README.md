An example Stex in action: a super stupid content management system
that returns content from page-content/ for a given URL.

Run it interactively from the shell:
```
	node app.js
```
and note that it behaves as a standard Node+Express app.

Now, to rebuild the static version of the site (stored in static/
in this example), run:

```
	node app.js build
```

and you'll see Stex begin to crawl the urls (based on pageList,
defined in app.js) and spit out the static equivalents.


