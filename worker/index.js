/**
 * Module dependencies.
 */
var log4js = require('log4js');
var request = require('request');
var fs = require('fs');
var rest = require('restler');
var nconf = require('nconf');
var Step = require("Step");

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


var build = nconf.get('build');
var server = nconf.get(build).server;

logger.info('build=' + build + " (development/production) [Run 'node index.js --build=development' for local server.]");


/**********************************************************************/
// Polling the tasks.
/**********************************************************************/

var isTaskExecuting = false;
var poll_interval = nconf.get("poll_interval");

// Use the timer to make sure this process doesn't exist
setTimeout(function(){getTaskFromServer();}, 100);

var getTaskFromServer = function(){
   if(isTaskExecuting){
	   setTimeout(getTaskFromServer, poll_interval * 3);
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
   
   setTimeout(getTaskFromServer, poll_interval);
};

/**********************************************************************/
// Execute one task
/**********************************************************************/

// Create task folder __dirname + '/tasks'

var taskFolder = __dirname + '/tasks';
if(!fs.existsSync(taskFolder))
	fs.mkdirSync(taskFolder);

var executeTask = function(t){

	isTaskExecuting = true;
	
	
	Step(
		function() {
			logger.debug("=======Task Begin==========");
			logger.debug("The task is: ");
			logger.debug(t);
			downloadFile(t, this);
		},
		function(err, t) {
			if (err) {
				logger.debug("Skip doTranslation");
				throw err;
			}
			doTranslation(t, this);
		},
		function(err, t) {
			if (err) {
				logger.debug("Skip uploadFile");
				throw err;
			}
			uploadFile(t, this);
		},
		function(err, t) {
			sendMailNotification(t, this);
		},
		function(err, t) {
			cleanupTempFiles(t, this);
			
			//this(err);
		},
		function (err) {			
			isTaskExecuting = false;
			
			logger.debug("=======Task Complete==========");
		}
	);
};

var downloadFile = function(t, cb){
	logger.debug("Downloading file: " + t.srcFileName);
	
	// ToDo download file from box
	var url = 'https://api.box.com/2.0/files/'+t.srcFileId +'/data';
	var headers = {Authorization: 'BoxAuth api_key='+t.apiKey +'&auth_token='+t.access_token};

	var localSrcFileName =  taskFolder + '/' + t.taskId.toString() + '_' + t.srcFileName;
	t.localSrcFileName =localSrcFileName;
	
	try{
		var writeStream = fs.createWriteStream(localSrcFileName);
		request.get({url:url, headers:headers}).pipe(writeStream);
		writeStream.on('close', function () {
			logger.debug("[Success]: File [" + t.srcFileName + "] is download as ["+localSrcFileName+"].");
			cb(null, t);
	  	});
	}
	catch(err){
		logger.debug("[Fail]: Failed to download [" + localSrcFileName + "].");
		cb(err, t);
	}

};

var doTranslation = function(t, cb){
	logger.debug("Translating file: " + t.srcFileName);
	
	var localDestFileName = taskFolder + '/' + t.destFileName;
	t.localDestFileName = localDestFileName;
	
	try{
		fs.renameSync(t.localSrcFileName, localDestFileName); // Todo - use the rename for prototype.
		logger.debug("[Success]: File [" + localDestFileName + "] is generated.");
		cb(null, t);
	}
	catch(err){
		logger.debug("[Fail]: Failed to generate [" + localDestFileName + "].");
		cb(err, t);
	}
};

var uploadFile = function(t, cb){

	logger.debug("Uploading file: " + t.srcFileName);
	// curl https://www.box.com/api/2.0/files/data -H "Authorization: BoxAuth api_key=ujdb2e8pe3geqmkgm2fg66pg552dwl2f&auth_token=jbpktqjbkz4qrmsc2ok5rmx8j2lbenmu" -F filename=@avatar_n.jpg -F folder_id=0
	
	var auth = 'BoxAuth api_key='+t.apiKey +'&auth_token='+t.access_token + '';
	var url = 'https://api.box.com/2.0/files/data';
	var headers = {Authorization: auth};
	
	var fileName = t.localDestFileName;
	var stats = fs.lstatSync(fileName);
	var fileSize = stats.size;
	logger.debug('File size: ' + fileSize);
	
	try{
	   rest.post(url, {
		 multipart: true,
		 headers: headers,
		 data: {
		   'file': rest.file(fileName, null, fileSize, null, null),
		   'folder_id': t.destFolderId
		 }
	   }).on('complete', function(data) {
		   logger.debug(data);
		   logger.debug("[Success] File [" + t.localDestFileName + "] is uploaded.");
		   cb(null ,t);
	   });
	}
	catch(err){
		logger.debug("[Fail]: Failed to upload [" + t.localDestFileName + "].");
		cb(err, t);
	}
};

var sendMailNotification = function(t, cb ){
	var mailAddr = t.email || "";
	
	logger.debug("Sending mail to [" + mailAddr + "].");
	
	if(!looksLikeMail(mailAddr)){
		logger.debug("[Fail] The mail address is invalid. Skip the mail notification.");
		cb(null, t);
	}
	
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
			logger.debug("[Success] Mail notification is sent to [" + mailAddr + "].");
		else{
			logger.debug("[Fail] Failed to send the mail to ["  + mailAddr + "].");
			logger.debug(err.stack);
		}
	});
	
	cb(null, t);
	
};

var cleanupTempFiles = function(t, cb){
	logger.debug("Cleaning up task files");
	
	try{
		fs.unlink(t.localSrcFileName);
		fs.unlink(t.localDestFileName);
		
		logger.debug(t.localSrcFileName + ' is deleted');
		logger.debug(t.localDestFileName + ' is deleted');
		logger.debug("[Success]: Cleanup is completed.");
		cb(null,t);
	}
	catch(err){
		logger.debug("[Fail]: Failed to clean up task files");
		cb(err, t);
	}
};

var looksLikeMail = function(str) {
    var lastAtPos = str.lastIndexOf('@');
    var lastDotPos = str.lastIndexOf('.');
    return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
}

