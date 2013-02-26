var cartesianProduct = require('./cartesian.js'),
		fs = require('fs'),
		path = require('path'),
		util = require('util'),
		_ = require('underscore');

var RouteMasher = {

	// Find all routes with a given request method that
	// either require no arguments, or only require arguments
	// that we have values for
	//
	// This code stinks but should be its own npm I think
	//
	find: function(routes, methods, params) {
		var withMethod = [];
		
		// get all GET routes
		_.each(methods, function(method) {
			withMethod = _.flatten([withMethod, routes[method]]);
		});

		// find the ones that use no args, or all the args we supply
		var matchingParams = _.filter(withMethod, function(route) {
			var allFound;

			if (route.keys.length === 0)
				return route;

			var allFound = _.every(route.keys, function(param) {
				if (param.name in params) 
					return true;
				else 
					return false;
			});

			if (allFound) return route;
			else return false;
		});

		return matchingParams;
	}
}

function initStex(options) {

	// OPTIONS {{{
	if (typeof(options) === 'string') {
		options = { src: options };
	}
	if (!options.src) throw new Error('stex requires "src" directory');

	// stdout output options
	options.debug = options.debug || false;
	options.warn = options.warn || true;
	
	// operating mode controls
	// should we check process.argv on startup and see if the 'stex-build'
	// options has been provided and thus call build()?
	options.useCommandLine = options.useCommandLine || true;
	options.mirror = options.mirror || false;

	// TODO major hack here; we need to wait until all the urlParamValues
	// have been populated, which may have come from a database, which may
	// take some time. Delay the onset of static file rebuilding until after
	// this amount of time (milliseconds):
	options.buildDelay = options.buildDelay || 1000;
	options.methods = ['get'];

	// urls ending in / get the following suffix (amazon s3 requires index.html)
	options.index = options.index || 'index.html';

	// add STAX footer comment to static-ified HTML files?
	options.shamelessPlug = options.shamelessPlug || false;
	// }}}

	debug('operating', 
		{'offline': options.useCommandLine, 
		 'mirror': options.mirror});

	// BUILDING {{{
	
	// Rebuild the static site cache. Call this when your data changes
	// or from your cron task or whenever convenient. 
	//
	// This can run automatically; see `useCommandLine` option
	function build() {
		var mirrorableRoutes;

		// These two options can be set after the Stax middleware is instantiated,
		// therefore we must check them at runtime instead of startup as we do the
		// other options.
		if (typeof options.app === 'undefined') {
			warn('app object not provided, can\'t build()');
			return false;
		}
		if (typeof options.urlParamValues !== 'object') {
			warn('no urlParamValues provided, nothing to build');
			return false;
		}

		mirrorableRoutes = RouteMasher.find(
			options.app.routes, 
			options.methods, 
			options.urlParamValues);

		_.each(mirrorableRoutes, invokeCombinations);
	}

	function checkArgsAndBuild() {
		if (process.argv[process.argv.length-1] === 'stex-build')
			setTimeout(build.bind(this), options.buildDelay);
	}

	function invokeCombinations(route) {
		console.log('invokeCombinations', route);
		var combos = cartesianProduct(options.urlParamValues);
		console.log(combos);
	}

	function findAndInvokeRoutes() {
		_.each(routes, invokeCombinations);
	}
	// }}}

	// MIRRORING {{{
	function middleware(req, res, next) {
		var oldWrite = res.write.bind(res),
				oldEnd = res.end.bind(res),
				allContent = '';

		debug('middleware', req.url);

		res.write = function(chunk, otherStuff_) {
			debug('write', chunk);
			allContent += chunk;
			oldWrite(chunk, otherStuff_);
			// don't restore res.write afterward; we need to keep buffering
		}

		res.end = function(chunk, otherStuff_) {
			debug('end', chunk);
			allContent += chunk;
			oldEnd(chunk, otherStuff_);
			writeStaticFile(req.url, allContent);
			// restore original res.end, we're done with it
			res.end = oldEnd;
		}

		// continue down the chain of middleware
		next();
	}

	function resolveUrl(url) {
		debug('resolveUrl', url);
		url = url == '/' ? options.index : url.substr(1);
		return path.join(options.src, url);
	}

	function writeStaticFile(url, content) {
		var fn = resolveUrl(url);

		debug('writeStaticFile', url+' -> '+fn);

		if (options.shamelessPlug 
				&& url.match(/(\/|\.html)$/i)) {
			content += "<!-- cached by STEX! original url = " + url + " -->";
		}

		// writable output directory problems are very likely here, but we aren't
		// catching them. why? we would end up just re-raising with a friendly
		// error message, and there's no value-add in that. less code = better
		// code.
		fs.writeFile(fn, content, 'utf8');
	}

	// MISC {{{	
	function debug(label, val) {
		if (options.debug)
			console.info('\033[90m[Stex]\033[0m %s: \033[36m%s\033[0m', 
				label, util.inspect(val));
	}

	function warn(text) {
		console.warn('\033[90m[Stex]\033[0m %s', text);
	}
	// }}}

	checkArgsAndBuild();

	if (options.mirror)
		return middleware;
	else
		return false;
}

module.exports = initStex;

