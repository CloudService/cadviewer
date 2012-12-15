/**
 * Module dependencies.
 */
var log4js = require('log4js');
var request = require('request');
var fs = require('fs');
var rest = require('restler');
var nconf = require('nconf');
var Step = require("Step");
var path = require("path");

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
var serverConf = nconf.get(build);
var server = serverConf.server;

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
   /**
   The returned job object.
   {
		"type": "job",
		"id": "2342",
		"model_id": "3452",
		"source_file_name": "robot.stl",
		"source_file_id": "4451234",
		"api_key": "243ba09e93248d0cc",
		"auth_token": "aeb2732bd098ce"
	}
   */
   
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
		function(err) {
			if (err) {
				logger.debug("Skip generateMesh");
				throw err;
			}
			generateMesh(t, this);
		},
		function(err) {
			if (err) {
				logger.debug("Skip generateTaskFile");
				throw err;
			}
			generateTaskFile(t, this);
		},
		function(err) {
			if (err) {
				logger.debug("Skip uploadMesh");
				throw err;
			}
			
			uploadMesh(t, this);
		},
		function(err) {
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
	logger.debug("Downloading file: " + t.source_file_name);
	
	// ToDo download file from box
	var url = 'https://api.box.com/2.0/files/'+t.source_file_id +'/data';
	var headers = {Authorization: 'BoxAuth api_key='+t.api_key +'&auth_token='+t.auth_token};

	t.x_data = t.x_data || {}; // add all the external data to this object.
	
	var localSrcFileName =  path.join(taskFolder, t.id.toString() + '_' + t.source_file_name);
	t.x_data.local_source_file_name =localSrcFileName;
	
	try{
		var writeStream = fs.createWriteStream(localSrcFileName);
		request.get({url:url, headers:headers}).pipe(writeStream);
		writeStream.on('close', function () {
			logger.debug("[Success]: File [" + t.source_file_name + "] is download as ["+localSrcFileName+"].");
			cb(null, t);
	  	});
	}
	catch(err){
		logger.debug("[Fail]: Failed to download [" + localSrcFileName + "].");
		cb(err, t);
	}

};

var generateTaskFile = function(t, cb){
	
	var task_file = path.join(taskFolder, t.id.toString() + '_task.json');
	t.x_data.task_file = task_file;
	
	logger.debug("Generating task file: " + task_file);
	
	/**
	* Save the json object to the file.
	{
		"local_source_file_name": "/Users/jeffreysun/sunzhongkui/code/cadviewer/worker/tasks/1_auxi-d.sat.dwg",
		"local_mesh_file_name": "/Users/jeffreysun/sunzhongkui/code/cadviewer/worker/tasks/1_auxi-d.sat.dwg.json",
		"task_file": "/Users/jeffreysun/sunzhongkui/code/cadviewer/worker/tasks/1_task.json"
	}
	*/
	
	fs.open(task_file,"w",0644,function(err,fd){
		if(err) {
			logger.debug("[Fail]: Failed to create task file: " + task_file);
			throw err;
		}
		
		fs.write(fd,JSON.stringify(t.x_data),0,'utf8',function(err){
			if(err){
				logger.debug("[Fail]: Failed to write task file: " + task_file);
				throw err;
			}
			
			fs.closeSync(fd);
			
			logger.debug("[Success]");
			cb(null, t);
		});
	});
};

var generateMesh = function(t, cb){
	logger.debug("Generating mesh for file: " + t.x_data.local_source_file_name);
	
	var localMeshFileName = path.join(taskFolder, t.id.toString() + '_' +t.source_file_name + '.json');
	t.x_data.local_mesh_file_name = localMeshFileName;
	
	try{
		fs.renameSync(t.x_data.local_source_file_name, localMeshFileName); // Todo - use the rename for prototype.
		logger.debug("[Success]: Mesh file [" + localMeshFileName + "] is generated.");
		cb(null, t);
	}
	catch(err){
		logger.debug("[Fail]: Failed to generate [" + localMeshFileName + "].");
		cb(err, t);
	}
};

var uploadMesh = function(t, cb){

	logger.debug("Uploading mesh: " + t.source_file_name);
	
	var url = serverConf.server + '/api/1.0/models/' + t.model_id;
	
	logger.debug(url);
	
	var fileName = t.x_data.local_mesh_file_name;
	fileName = t.x_data.task_file; // Todo - comment this line. the task file is only for test purpose.
	
	var stats = fs.lstatSync(fileName);
	var fileSize = stats.size;
	logger.debug('File size: ' + fileSize);
	
	//var requestObject = {mesh: {count:205}};
	
	fs.readFile(fileName, function (err, data) {
		if (err) {
			logger.debug("Fail to read the mesh file");
			cb(err);
		}
		
		var requestObject = {mesh: JSON.parse(data)};
		
		//logger.debug(JSON.stringify(requestObject));
		/**
		* The format of the request body is:
		{
			"mesh": "..."
		}
		*/
		try{
		   rest.put(url, {
			 data: JSON.stringify(requestObject),
			 headers: {"Content-type": "application/json"},
			}).on('complete', function(result, response) {
		   
			   if (response.statusCode >= 200 && response.statusCode <300) {
					logger.debug(result);
					logger.debug("[Success] Mesh [" + t.x_data.local_mesh_file_name + "] is uploaded.");
					cb(null ,t);
			   }
			   else{
					logger.debug("[Fail]");
					cb(new Error("fail"), t);
			   }
		   });
		}
		catch(err){
			logger.debug("[Fail]");
			cb(err, t);
		}
	});
};

var cleanupTempFiles = function(t, cb){
	logger.debug("Cleaning up task files");
	
	try{
		fs.unlink(t.x_data.local_source_file_name);
		fs.unlink(t.x_data.task_file);
		fs.unlink(t.x_data.local_mesh_file_name);
		
		logger.debug(t.x_data.local_source_file_name + ' is deleted');
		logger.debug(t.x_data.task_file + ' is deleted');
		logger.debug(t.x_data.local_mesh_file_name + ' is deleted');
		logger.debug("[Success]: Cleanup is completed.");
		cb(null,t);
	}
	catch(err){
		logger.debug("[Fail]: Failed to clean up task files");
		cb(err, t);
	}
};


