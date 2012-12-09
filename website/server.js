
/**
 * Module dependencies.
 */
var express = require('express')
  , everyauth = require('everyauth')
  , request = require('request')
  , sio = require('socket.io');
var log4js = require('log4js');
var http = require('http');

/**********************************************************************/
// global variables
/**********************************************************************/
var pendingTranslationTasks=[];
var workerSockets = [];
var nextTaskId=0;

/**********************************************************************/
// Configure logger
/**********************************************************************/

log4js.configure({
    appenders: [
        { type: "console" }
    ],
    replaceConsole: true
});

var logger = log4js.getLogger();

/**********************************************************************/
// Configure everyauth
/**********************************************************************/
everyauth.debug = true;
var build = process.env.BUILD || "production"; 
var conf = require('./lib/conf')[build];

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
  .apiKey(conf.box.apiKey)
  .findOrCreateUser( function (sess, authToken, boxUser) {
    return usersByBoxId[boxUser.user_id] ||
      (usersByBoxId[boxUser.user_id] = addUser('box', boxUser));
  })
  .redirectPath('/');

/**********************************************************************/
// Configure express
/**********************************************************************/

var importFormats = require('./lib/conf')['formats']['import'];
var exportFormats = require('./lib/conf')['formats']['export'];

var app = express();
app.use(express.static(__dirname + '/public'))
  .use(express.bodyParser())
  .use(express.cookieParser('htuayreve'))
  .use(express.session())
  .use(everyauth.middleware(app));

// Configurations
app.set('port', process.env.PORT || 3000); // Configure the listening port
app.set('views', __dirname + '/views'); // The folder for the views, such as .html. The folder is <website>/views/
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);

// routers
app.get('/', function(req, res, next){
	
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
		var apiKey = conf.box.apiKey;
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

app.get('/error', function (req, res)
{
    res.send('Unexpected error is encountered when post your request.');
});

/**********************************************************************/
// Define the REST api.
/**********************************************************************/

app.post('/api/1.0/tasks', function(req, res, next){
	// req.body saves posted JSON object.
	var task = req.body;
	var taskString = JSON.stringify(task);
	
	logger.info("==> New Task:");
	logger.info(taskString);
	
	// Todo - only box is supported.
	task["taskId"]= nextTaskId++;
	task["storageProvider"] = "box";
	task["apiKey"] = conf.box.apiKey;
	task["access_token"] = req.session.auth.box.authToken;
	
	pendingTranslationTasks.push(task);
	
	res.send(200); // success
	
	/*
	// This function results in the server error hosted by appfog. Disable it.
	
	Response header
		HTTP/1.1 500 Internal Server Error
		Accept-Ranges: bytes
		Age: 0
		Content-Type: text/plain
		Date: Thu, 04 Oct 2012 10:43:23 GMT
		Server: nginx
		Via: 1.1 varnish
		X-Powered-By: Express
		X-Varnish: 1494411374
		Content-Length: 1360
		Connection: keep-alive
	*/
	
	dispatchTasks(); 
});

// Rest API to get the tasks
app.get('/api/1.0/tasks', function(req, res, next){

	var task = pendingTranslationTasks.splice(0,1); // Pop the front one.
	
	res.send(task);
	
});

function dispatchTasks(){

	if(workerSockets.length == 0)
		return;
		
	var length = pendingTranslationTasks.length;
	if(length == 0)
		return;
		
	 var socket = workerSockets[0]; // ToDo only support one worker so far. Add more when necessary
	 
	 for(var i = 0; i < length; ++i){
	 	var task = pendingTranslationTasks[i];
		 socket.emit('dispatchTask', task);
	 }
	 
	 pendingTranslationTasks = [];
}
  
/**********************************************************************/
// Configure http server.
/**********************************************************************/
var listeningPort = app.get('port');
var httpApp = http.createServer(app).listen(listeningPort);

/**********************************************************************/
// socket.io.  Listens on the same port as http
/**********************************************************************/
var io = sio.listen(httpApp);
io.set('log level', 1); // reduce logging
io.set("transports", ['websocket']); 
io.set("polling duration", 10); 
io.set("match origin protocol", true);

io.sockets.on('connection', function (socket) {
		workerSockets.push(socket);
		logger.info("New client is connected.");
  		
  		socket.on('disconnect', function () {
  			logger.info("Client is disconnected.");
    		
    		var length = workerSockets.length;
    		for(var i = 0; i < length; i++){
    			if(workerSockets[i] == socket){
    				workerSockets.splice(i, 1);
    				break;
    			}
    		}
  		});
  		
	});
	
//**********************************************************************/
// Done! log the system information
/**********************************************************************/
logger.info('BUILD=' + build + " (development/production) [Run 'BUILD=development node server.js' for local server.]");
logger.info('Web site is listening on port ' + listeningPort);
logger.info('Socket is listening on port ' + listeningPort);