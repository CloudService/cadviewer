/**
 * Module dependencies.
 */
var express = require('express')
  , everyauth = require('everyauth')
  , request = require('request');
var http = require('http');
var path = require('path');
var fs = require('fs');

/**********************************************************************/
// Initialize the server appliation
/**********************************************************************/
var serverApp =  require('./lib/serverApplication.js');

/**********************************************************************/
// Configuration
/**********************************************************************/
var config = serverApp.config;

var build = config.get('build');
var server = config.get(build);

var logger = serverApp.logger;

/**********************************************************************/
// Configure everyauth
/**********************************************************************/
everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

// This is called by the box.js to save the user
function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

var usersByBoxId = {};

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });
 
everyauth.box
  .apiKey(server.box.apiKey)
  .findOrCreateUser( function (sess, authToken, boxUser) {
    return usersByBoxId[boxUser.user_id] ||
      (usersByBoxId[boxUser.user_id] = addUser('box', boxUser));
  })
  .redirectPath('/');

/**********************************************************************/
// Configure express
/**********************************************************************/

var importFormats = config.get('formats')['import'];
var exportFormats = config.get('formats')['export'];

var expressApp = express();
expressApp.use(express.static(__dirname + '/public'))
  .use(express.bodyParser())
  .use(express.cookieParser('htuayreve'))
  .use(express.session())
  .use(everyauth.middleware(expressApp));

// Configurations
expressApp.set(config.get('port')); // Configure the listening port
expressApp.set('views', __dirname + '/views'); // The folder for the views, such as .html. The folder is <website>/views/
expressApp.set('view engine', 'ejs');

expressApp.engine('html', require('ejs').renderFile);

// routers
expressApp.get('/', function(req, res, next){
	
	var auth = req.session.auth;
	var boxAuth = auth ? auth.box : null;
	var showDefault = req.query.d ? true : false; // http://server.com/?d=1
	
	var locals = { "amessage": ""};				  
	
	if(showDefault || !boxAuth)
		renderDefaultPage(req, res, next, locals);
	else
   	 	renderWithFileDialog(req, res, next, locals);
   	 
   	function renderDefaultPage(req, res, next, locals){
				
	   res.render('index', {'locals': locals});
   	}
   	 
   	function renderWithFileDialog(req, res, next, locals){
 		var aobject = {
			handler: "translator"
			, action: "openFileDialog"
		};
					
		var amessage = JSON.stringify(aobject);
		logger.info(amessage);
		
		locals['amessage'] = amessage;
				
		res.render('index', {'locals': locals});
   	}  
});

expressApp.get('/error', function (req, res)
{
    res.send('Unexpected error is encountered when post your request.');
});

/**********************************************************************/
// Load the REST APIs
/**********************************************************************/
require("./lib/apiLoader.js")({'expressApp': expressApp, 'serverApp': serverApp});

/**********************************************************************/
// Start the web server
/**********************************************************************/
var listeningPort = config.get('port');
var secure = config.get("secure");
if(secure){
	var keyPath = path.join(__dirname, config.get('key'));
	var certPath = path.join(__dirname, config.get('cert'));
	var sslkey = fs.readFileSync(keyPath).toString();
	var sslcert = fs.readFileSync(certPath).toString();

	var options = {
	    key: sslkey,
	    cert: sslcert
	};

	var https = require('https');
	https.createServer(options, expressApp).listen(listeningPort);
}
else{
	var http = require('http');
	http.createServer(expressApp).listen(listeningPort);
}

logger.info('build=' + build + " (development/production) [Run 'node server.js --build=development' for local server.]");
logger.info('Server ('+ (secure ? 'https' : 'http') +') ['+config.get('build')+'] is listening on port ' + listeningPort);
