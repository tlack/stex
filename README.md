Stex: Static sites from Express apps
====================================

This module produces a static site from an existing Express app.

It operates in two different modes:

- `online`/`mirror` mode: produce a static page for each URL that is requested
	through the app; think of it as "live spidering" your site as users user it.

- `offline`/`build` mode: given a list of possible pages (basically, URL
	parameter values mapped against the routes defined), build out all possible
	static pages. As of v0.0.1 this mode is not complete.

Examples
--------

See `examples/stupid-content-management` for an example of a braindead content
management system which works seamlessly as a static site generator as well.

Limitations
-----------

- Not safe to use when the page output includes personal data. In the future
  perhaps we could turn off online mode when mirroring.

- Mostly useful for GET routes (this is configurable; see the `methods` option)

- Requires an annoying/agonizing list of URL parameters for offline build mode
	(i.e., all valid user IDs or blog post slugs that may wind up in URLs).
	Luckily these are usually trivially available in your database somewhere if
	you care to look. 


