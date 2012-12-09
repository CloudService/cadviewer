/**
 * Module dependencies.
 */
var io = require('socket.io-client');
var log4js = require('log4js');
var request = require('request');
var fs = require('fs');
var rest = require('restler');
var nconf = require('nconf');



/**********************************************************************/
// Load configuration
/**********************************************************************/

nconf.argv().env().file({file: __dirname + '/lib/config.json'}); // argv overrides env, env overrides file.


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
// private modules
/**********************************************************************/

var mailManager = require("./lib/mailManager.js")({config: nconf, logger: logger});

/**********************************************************************/
// Configure socket.io
/**********************************************************************/

var build = nconf.get('build');
var server = nconf.get(build).server;

var useSocket = false;
logger.info('build=' + build + " (development/production) [Run 'build=development node server.js' for local server.]");


if(useSocket){
	
	logger.info("Trying to connect socket " + server);
	var options = {};
	
	socket = io.connect(server, options);
	
	socket.on('connect', function () {
			logger.info("Socket is connected to server: " + server); 
		});
		
	socket.on('connecting', function (transport_type) {
			logger.debug("connecting transport: " + transport_type); 
		});
		
	socket.on('connect_failed', function () {
			logger.debug("connect_failed event is fired."); 
		});
	
	socket.on('close', function () {
			logger.debug("close event is fired."); 
		});
		
	socket.on('disconnect', function (data) {
			logger.info("Socket is disconnected from server.");
		});
	
	socket.on('reconnect', function (transport_type) {
			logger.debug("reconnect event is fired with transport : " + transport_type); 
		});
		
	socket.on('reconnecting', function (transport_type) {
			logger.debug("reconnecting transport: " + transport_type); 
		});
		
	socket.on('reconnect_failed', function () {
			logger.debug("reconnect_failed event is fired."); 
		});
	
	// Listen for customer event.
	socket.on('dispatchTask', function (t) {
			logger.info("==> New task <==");
			logger.info(t);
			
			//var t = JSON.parse(data);
			
			executeTask(t);
			
		});
}
else {

	/**/
	
	var isTaskExecuting = false;
	
	// Use the timer to make sure this process doesn't exist
	setTimeout(function(){getTaskFromServer();}, 1000);
	
	var getTaskFromServer = function(){
		if(isTaskExecuting){
			setTimeout(getTaskFromServer, 4000);
			return;
		}
		
		// make the request to get the task from server
		
		
		var url = server + '/api/1.0/tasks';
		
		logger.debug("Get task from server: " + url);
		request.get({url:url}, function (err, res, body) {
			var tasks = [];
			try{
				tasks = JSON.parse(body);
			
			}catch(e){
				logger.debug("Invalid tasks body.");
				logger.debug(body);
				return;
			}
			
			var length = tasks.length;
			if(length> 0){
				
				logger.debug("New Tasks");
				logger.debug(JSON.stringify(body));
				
				if(length > 1){
					logger.error("More than one tasks are returned. Only the first one is executed.");
				}
				var t = tasks[0];
				executeTask(t);
			}	
			});
		
		setTimeout(getTaskFromServer, 4000);
	};

}

/**********************************************************************/
// Execute one task
/**********************************************************************/

// Create task folder __dirname + '/tasks'

var taskFolder = __dirname + '/tasks';
if(!fs.existsSync(taskFolder))
	fs.mkdirSync(taskFolder);

var executeTask = function(t){
	isTaskExecuting = true;
		downloadFile(t, function(){ 
			doTranslation(t, function(){
				uploadFile(t, function(){
					sendMailNotification(t, function (){
						cleanupTempFiles(t, function() {isTaskExecuting = false;});
					});
				});
			});
		});
};

var downloadFile = function(t, cb){

	// ToDo download file from box
	var url = 'https://api.box.com/2.0/files/'+t.srcFileId +'/data';
	var headers = {Authorization: 'BoxAuth api_key='+t.apiKey +'&auth_token='+t.access_token};

	var localSrcFileName =  taskFolder + '/' + t.taskId.toString() + '_' + t.srcFileName;
	t.localSrcFileName =localSrcFileName;
	request.get({url:url, headers:headers}).pipe(fs.createWriteStream(localSrcFileName));

	logger.debug("File [" + t.srcFileName + "] is download as ["+localSrcFileName+"].");
	cb();

};

var doTranslation = function(t, cb){

	var localDestFileName = taskFolder + '/' + t.destFileName;
	t.localDestFileName = localDestFileName;
	
	fs.renameSync(t.localSrcFileName, localDestFileName); // Todo - use the rename for prototype.
	logger.debug("File [" + localDestFileName + "] is translated.");
	cb();
};

var uploadFile = function(t, cb){

	// curl https://www.box.com/api/2.0/files/data -H "Authorization: BoxAuth api_key=ujdb2e8pe3geqmkgm2fg66pg552dwl2f&auth_token=jbpktqjbkz4qrmsc2ok5rmx8j2lbenmu" -F filename=@avatar_n.jpg -F folder_id=0
	
	var auth = 'BoxAuth api_key='+t.apiKey +'&auth_token='+t.access_token + '';
	var url = 'https://api.box.com/2.0/files/data';
	var headers = {Authorization: auth};
	
	var fileName = t.localDestFileName;
	var stats = fs.lstatSync(fileName);
	var fileSize = stats.size;
	logger.debug('File size: ' + fileSize);
	rest.post(url, {
	  multipart: true,
	  headers: headers,
	  data: {
		'file': rest.file(fileName, null, fileSize, null, null),
		'folder_id': t.destFolderId
	  }
	}).on('complete', function(data) {
		logger.debug(data);
		logger.debug("File [" + t.localDestFileName + "] is uploaded.");
		cb();
	});
};

var sendMailNotification = function(t,cb ){
	
	var mailAddr = t.email;
	if(!looksLikeMail(mailAddr)){
		logger.debug("The mail address is invalid. Skip the mail notification.");
		cb();
	}
	
	logger.debug("Sending mail to [" + mailAddr + "].");
	
	var subject = 'Your file translation is completed';
	var body = 'Your file "' + t.srcFileName + '" is translated to be "' + t.destFileName + '".';
	
	var options = {
		from: "do-not-reply@cloudservice.com",
		to: mailAddr,
		subject: subject,
		content: body
	};
	
	mailManager.sendMail(options, function(err, reply) {
		if(!err)
			logger.debug("Mail notification is sent to [" + mailAddr + "].");
		else{
			logger.debug("Failed to send the mail to ["  + mailAddr + "].");
			logger.debug(err.stack);
		}
	});
	
	cb();
	
};

var cleanupTempFiles = function(t, cb){
	logger.debug("Cleanup begins.");
	
	fs.unlink(t.localSrcFileName);
	fs.unlink(t.localDestFileName);
	
	logger.debug(t.localSrcFileName + ' is deleted');
	logger.debug(t.localDestFileName + ' is deleted');
	logger.debug("Cleanup is completed.");
	cb();
};

var looksLikeMail = function(str) {
    var lastAtPos = str.lastIndexOf('@');
    var lastDotPos = str.lastIndexOf('.');
    return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
}

