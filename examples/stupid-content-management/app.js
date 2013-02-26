// Stupid Content Management
// An example of using the Stex static page generator
//
// See README.md

// List of valid values for the parameters that the router cares about.
//
// You don't need to specify values for *every* parameter in all routes, but 
// routes that do not have any matching parameters to supply will not be rebuilt
// in offline (build) mode.
//
var ALL_PARAM_VALUES = {
	page: [ 'index.html', 'help.html' ],
	otherVar: [1, 2, 3]
};

var express = require('express')
	, fs = require('fs')
  , http = require('http')
  , path = require('path')
	, stex = require('../..');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
	app.use(stex({ 
		app: app,
		debug: true, 
		mirror: true,
		shamelessPlug: true,
		src: path.join(__dirname, 'static'),
		urlParamValues: ALL_PARAM_VALUES
	}));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/* example common CMS function: return page content for url
 *
 * warning: file reading here is not async; do not do this in production
 * (obviously)
 *
 */
function getPageContentSync(url) {
	var safe, contentPath, content, err;
	
	safe = (url ? url : 'index')
		.replace(/.html$/i, '')
		.replace(/[^a-z]/i, '')
		+'.html';
	contentPath = path.join(__dirname, 'page-content', safe);
	try { 
		content = fs.readFileSync(contentPath);
	} catch (err) {
		content = contentPath + ' not found';
	}
	return content;
}

function servePage(req, res) {
	var url = req.url.substr(1); // trim leading /
	res.write(getPageContentSync(url));
	res.end('.'); // exercise the res.end() handlers
}

app.get('/', servePage);
app.get('/dynamic/:missingVal', servePage); // should NOT be crawled 
app.get('/:page', servePage);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
