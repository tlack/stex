Stex: Static sites from Express apps
====================================

*Note:* This is very alpha. Mirror mode works but build mode is still lacking
some big parts. Proceed with caution.

Stex is a static site generator tht works with *existing* Express apps, by
looking at the routes you have defined and building static versions of each
page.

It operates in two different modes:

- `online`/`mirror` mode: produce a static page for each URL that is requested
	through the app; think of it as "live spidering" your site as users user it.

- `offline`/`build` mode: given a list of possible pages (basically, URL
	parameter values mapped against the routes defined), build out all possible
	static pages. As of v0.0.1 this mode is not complete.

Why another static site generator?
----------------------------------

There are a million great static site generators for Node.js out there.
Unfortunately, they all seem to share one glaring fault: they're all
frameworks, meaning you have to build your site *around* the product rather
than just *including* the library and using it.

I wanted a simple solution that you could drop in to an existing Express app in
a couple of hours and easily configure.

Examples
--------

See `examples/stupid-content-management` for an example of a braindead content
management system which works seamlessly as a static site generator as well.

Limitations
-----------

- Not safe to use when the page output includes personal data. In the future
	perhaps we could turn off online mode when certain cookies are set, etc.

- Mostly useful for GET routes (this is configurable; see the `methods` option)

- Requires an annoying/agonizing list of URL parameters for offline build mode
	(i.e., all valid user IDs or blog post slugs that may wind up in URLs).
	Luckily these are usually trivially available in your database somewhere if
	you care to look. 


