/**
 * Module dependencies.
 */
var express = require('express')
  , everyauth = require('everyauth')
  , request = require('request');
var http = require('http');

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
	
	var workerNum = workerSockets.length;
	var taskNum = pendingTranslationTasks.length;
	var locals = { "amessage": ""
					  , "workerNum": workerNum
					  , "taskNum" : taskNum 
					  , "destFormats": JSON.stringify(exportFormats)};
					  
	
	if(showDefault || !boxAuth)
		renderDefaultPage(req, res, next, locals);
	else
   	 	renderWithFileDialog(req, res, next, locals);
   	 
   	function renderDefaultPage(req, res, next, locals){
				
	   res.render('index', {'locals': locals});
   	}
   	 
   	function renderWithFileDialog(req, res, next, locals){
   	
		// Get root folder
		var url = 'https://www.box.com/api/2.0/folders/0';
		var apiKey = server.box.apiKey;
		var access_token = req.session.auth.box.authToken;//"gymnnxkbxikj0jm6rz25cq4kwe8go808";
		var headers = {Authorization: "BoxAuth api_key=" + apiKey + "&auth_token=" + access_token};
	
		/*
		The format of the return value is like.
		"{
			"type": "folder",
			"id": "0",
			"sequence_id": null,
			"name": "AllFiles",
			"created_at": null,
			"modified_at": null,
			"description": null,
			"size": 0,
			"created_by": {
				"type": "user",
				"id": "185684932",
				"name": "transMr",
				"login": "3dcadtrans@gmail.com"
			},
			"modified_by": {
				"type": "user",
				"id": "185684932",
				"name": "transMr",
				"login": "3dcadtrans@gmail.com"
			},
			"owned_by": {
				"type": "user",
				"id": "185684932",
				"name": "transMr",
				"login": "3dcadtrans@gmail.com"
			},
			"shared_link": null,
			"parent": null,
			"item_status": "active",
			"item_collection": {
				"total_count": 2,
				"entries": [
					{
						"type": "folder",
						"id": "419345934",
						"sequence_id": "0",
						"name": "Web"
					},
					{
						"type": "folder",
						"id": "419345748",
						"sequence_id": "0",
						"name": "Robot"
					}
				]
			}
		}"
		*/
		request.get({url:url, headers:headers}, function (e, r, body) {	
			var boxFolderInfo = JSON.parse(body);
			var boxFileList = boxFolderInfo.item_collection.entries;
			
			var subFiles = [];
			var length = boxFileList.length;
			for(var i = 0; i < length; ++i){
				var entry = boxFileList[i];
				var isFolder = entry.type === "folder";
				var name = entry.name;
				if(!isFolder){
					// Check it the file is the supported format.
					var ext = name.split('.').pop();
					 var isSupported = (importFormats.indexOf(ext) != -1);
					 if(!isSupported)
					 	continue;
				}
				var file = {};
				file.name=name;
				file.isFolder = isFolder;
				file.id = entry.id;
				file.size = "-"; // Todo get the correct value;
				file.moddate = "2012-10-4 9:45"; // Todo get the correct value;
				subFiles.push(file);
			}
			
			var aobject = {
				handler: "translator"
				, action: "openFileDialog"
				, data: {files: subFiles}
				};
						
			var amessage = JSON.stringify(aobject);
			logger.info(amessage);
			
			locals['amessage'] = amessage;
					
		   	res.render('index', {'locals': locals});
		});  
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
logger.logger.info('Server ('+ (secure ? 'https' : 'http') +') ['+config.get('build')+'] is listening on port ' + listeningPort);
