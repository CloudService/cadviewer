/**
This is api module.

@module apis
*/

var everyauth = require('everyauth');
var request = require('request');
var uuid = require('node-uuid');
var fs = require("fs");
var fse = require("fs-extra");
var path = require('path');
var log4js = require('log4js');

log4js.configure({
    appenders: [
        { type: "console" }
    ],
    replaceConsole: true
});

var logger = log4js.getLogger();


log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('cheese.log'), 'cheese');

var logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');


logger.error('Cheese is too ripe!');
/**
* Add the routes to the Express application.
* @param {Object} options 
*  	@param {Object} options.expressApp Express application
*  	@param {Object} options.serverApp server application object.
* @return this for chaining
* @class apis 
*/
var addRoute = function(options){
	if(!options || !options.expressApp || !options.serverApp)
		return this;
		
	var expressApp = options.expressApp;
	var serverApp = options.serverApp;
	var config = serverApp.config;
	var apiErrorManager = serverApp.apiErrorManager;
	var logger = serverApp.logger;	
	var taskManager = serverApp.taskManager;
	var modelManager = serverApp.modelManager;
		
	/*
	* Add the route implementation here
	*/

	var build = config.get('build');
	var server = config.get(build);
	var importFormats = config.get('formats')['import'];
	
	/**
	* Post a image snapshot to the server.	
	* @method POST /api/1.0/snapshot
	* @param {Object} req
	* @param {Object} res
	* @param {Object} next
	*/
	
	expressApp.post("/api/1.0/snapshot", function(req, res, next){		
		//var imgData = JSON.stringify(req.body);	

		var imgData = req.body.image;
		var img_id = uuid.v1();

		var dirname = path.join(__dirname, "..\\..\\public\\snapshot");
		logger.debug("Creating snapshot folder: " + dirname);
		
		// Create the folder recursively.
		fse.mkdirs(dirname, function(err){
			if (err) {
				logger.debug("fail to create snapshot folder.");
				logger.error('fail to create snapshot folder.');				
				apiErrorManager.responseInternalError(res);
			}
			else {
				logger.debug("Saving snapshot file...");

				var base64Data = imgData.substring(22); 
				base64Data = base64Data.replace(/\s/g, "+"); 
				
				var filename = path.join(dirname, "\\"+img_id +".png");
				var dataBuffer = new Buffer(base64Data, 'base64');
				logger.debug(filename);
				
				// Save the image fle
				fs.writeFile(filename, dataBuffer, function(err) {
					if(err){
						logger.debug("fail to save snapshot");
						logger.error('fail to save snapshot');
						apiErrorManager.responseInternalError(res);
					}else{
						logger.debug("snapshot saved successfully");
						
						// Generate the response object.
						var model = {
							"type": "snapshot",
							"id": img_id,
							};
						
						res.send(200, model); // success
					}				
				});	
			}
		});	
	});
	
	expressApp.post('/api/1.0/tasks', function(req, res, next){
		logger.debug("==> /api/1.0/tasks");
		// req.body saves posted JSON object.
		var fileInfo = req.body;
		
		logger.debug("==> New Task:");
		logger.debug(JSON.stringify(fileInfo));
		
		var task_id = uuid.v1();
		
		var model_id = task_id; // Use the task id as the model id directly.
		
		// Generate the job object.
		var task = {
			"type": "task",
			"id": task_id,
			"model_id": model_id,
			"source_file_id": fileInfo["source_file_id"],
			"source_file_name": fileInfo["source_file_name"],
			"api_key": server.box.apiKey,
			"auth_token": req.session.auth.box.authToken
		};
		
		logger.debug(task);
		
		taskManager.pendingTranslationTasks.push(task);
		
		// Generate the model object
		var model ={
			"type": "model",
			"id": model_id,
			"status": "pending"
		};

		modelManager.models[model_id] = model;

		// Generate the response object
		var taskObject = {
			"type": "task",
			"id": task_id,
			"model_id": model_id
		};
		
		res.send(200, taskObject); // success

	});
	
	/**
	* Get the file object with the specific file id.
	* The id 'entry' is the alias for the root folder.
	*
	* http response body
	
		{
			"type": "file",
			"id": "233453223",
			"name": "robot",
			"is_folder": true,
			"size": "-",
			"modified_at": "2012-07-27T09:22:05Z",
			"children": [
				{
					"type": "file",
					"id": "234235523",
					"name": "wheel.ipt",
					"is_folder": false,
					"size": "45K",
					"modified_at": "2012-07-27T09:22:05Z"
				},
				{
					"type": "file",
					"id": "245345",
					"name": "shaft.iam",
					"is_folder": false,
					"size": "10M",
					"modified_at": "2012-07-27T09:22:05Z"
				}
			]
		}
		
	* @method GET /api/1.0/files/:id
	* @param {Object} req
	* @param {Object} res
	* @param {Object} next
	*/
	expressApp.get('/api/1.0/files/:id', function(req, res, next){
		logger.debug("==> /api/1.0/files/:id");
		
		var id = req.params.id;
		logger.debug(id);
		
		if(id === 'entry'){
			var fileObject = {
				"type": "file",
				"id": 'entry',
				"name": 'entry',
				"is_folder": true,
				"size": '-',
				"modified_at": "2012-07-27T09:22:05Z",
				"children": []
			};
			
			// Add the box entry
			if(isBoxLogin(req.session)){
				var boxFileObject = {
					"type": "file",
					"id": '0',
					"name": 'box',
					"is_folder": true,
					"size": '-',
					"modified_at": "2012-07-27T09:22:05Z"
				};
				
				fileObject.children.push(boxFileObject);
			}
			
			res.send(200, fileObject);
			return;
		}
		
		if(!isBoxLogin(req.session)){
			apiErrorManager.responseUnauthorized(res);
			return;
		}
		
		var apiKey = server.box.apiKey;
		var access_token = req.session.auth.box.authToken;//"gymnnxkbxikj0jm6rz25cq4kwe8go808";
	
		getFilesFromBox(apiKey, access_token, id, importFormats, function(err, fileObject){
			if(err)
				apiErrorManager.responseInternalError(res);
			else
				res.send(200, fileObject);
		});  
	});
	
	/**
	* Client get a pending task from the server. The returned task will be deleted.
	*
	* http response body
	
		[
			{
				"type": "job",
				"id": "2342",
				"model_id": "3452",
				"source_file_name": "robot.stl",
				"source_file_id": "4451234",
				"api_key": "243ba09e93248d0cc",
				"auth_token": "aeb2732bd098ce"
			}
		]
	
	* @method GET /api/1.0/tasks
	* @param {Object} req
	* @param {Object} res
	* @param {Object} next
	*/
	expressApp.get('/api/1.0/tasks', function(req, res, next){
		
		var task = taskManager.pendingTranslationTasks.splice(0,1); // Pop the front one.
		
		res.send(task);
		
	});
	
	/** 
	* Client gets the model from the server. The model will be deleted.
	* The value of the 'status' can be 'pending', 'good', 'bad'.
	* 'pending' - The object is new created. The worker hasn't update the mesh.
	* 'good' - the mesh is updated and it is valid.
	* 'bad' - the worker tries to generate the mesh, but the it fails. 
	*
	* http response body
	
		{
			"type": "model",
			"id": "358034830",
			"status": "good",
			"mesh": {}
		}

	* @method GET /api/1.0/models/:id
	* @param {Object} req
	* @param {Object} res
	* @param {Object} next
	*/
	expressApp.get('/api/1.0/models/:id', function(req, res, next){
		logger.debug("==> get /api/1.0/models/:id");
		
		var id = req.params.id;
		logger.debug(id);
		
		var models = modelManager.models;
		
		if(!models || !models[id] || !models[id].status){
			apiErrorManager.responseNotFound(res);
		}
		else{
			if(models[id].status === 'pending')
				apiErrorManager.responseNotFound(res);
			else{
				var modelObject = models[id];
				res.send(200, modelObject);
				
				delete models[id];
			}
		}	
	});
	
	/**
	* The client uploads the mesh for a model.
	
	* http request body.
	
	   {
		   "mesh":{...},
		   "status":"good"
	   }
	
	* http response body. (A mini model object)
	
		{
			"type": "model",
			"id": "358034830"
		}

	* The model object is updated.
	
		{
			"type": "model",
			"id": "358034830",
			"mesh": {}
		}
	* @method PUT /api/1.0/models/:id
	* @param {Object} req
	* @param {Object} res
	* @param {Object} next
	*/
	expressApp.put('/api/1.0/models/:id', function(req, res, next){
		logger.debug("==> put /api/1.0/models/:id");
		
		// Check if the passed JSON data is valid.
		var modelInfo = req.body;
		if(!modelInfo || !modelInfo.status){
			apiErrorManager.responseBadRequest(res);
			return;
		}
		
		var models = modelManager.models;
		var id = req.params.id;
		logger.debug(id);
		
		//logger.debug(models);
		if(!models || !models[id]){
			apiErrorManager.responseNotFound(res);
			return;
		}
		
		// Update the model object. Add the mesh.
		models[id].status = modelInfo.status;
		models[id].mesh = modelInfo.mesh;
		
		// Response the mini object.
		var miniModelObject = {
				"type": "model",
				"id":id,
				"status":modelInfo.status
			};
			
		res.send(200, miniModelObject);
	});
	
	return this;
};


/*
 Helper function. Todo - move it to /lib/clouddrive/box.js
*/

/*
 * Get the file/folder information.
 * @param {string} api_key - The api key of the box.
 * @param {string} auth_token - The auth token.
 * @param {function} cb, The callback function which gets two arguments (err, fileObject)
*/

// Todo importFormats should NOT be passed in this function. We should check the extension outside this function.
var getFilesFromBox = function(api_key, auth_token, id, importFormats, cb){
		
		// Get folder
		var url = 'https://www.box.com/api/2.0/folders/' + id;
		var headers = {Authorization: "BoxAuth api_key=" + api_key + "&auth_token=" + auth_token};
	
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
		request.get({url:url, headers:headers}, function (err, res, body) {	
		
			if(err){
				console.log("Failed to get folders from box:" + err);
				cb(e);
				return;
			}
			
			if(res.statusCode < 200 || res.statusCode >= 300){
				console.log("Failed to get folders from box:" + body);
				cb(new Error(body));
				return;
			}
			
			var boxFolderInfo = JSON.parse(body);
			var boxFileList = boxFolderInfo.item_collection.entries;
			
			var fileObject = {
				"type": "file",
				"id": id,
				"name": boxFolderInfo.name,
				"is_folder": boxFolderInfo.type === "folder",
				"size": boxFolderInfo.size,
				"modified_at": "2012-07-27T09:22:05Z",
				"children": []
			}
			
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
				file.type="file";
				file.id = entry.id;
				file.name=name;
				file.is_folder = isFolder;
				file.size = "-"; // Todo get the correct value;
				file.modified_at = "2012-10-4 9:45"; // Todo get the correct value;
				subFiles.push(file);
			}
			
			fileObject.children = subFiles;
			
			cb(null, fileObject);
		});  
};

/*
 * Check if the session includes the box login information
 * @param {object} session - The session.
 * @return - true if the session includes the box information.
*/

var isBoxLogin = function(session){
	if(!session){
		return false;
	}
	
	if(!session.auth){
		return false;
	}
	
	if(!session){
		return false;
	}
	
	if(!session.auth.box){
		return false;
	}
	
	if(!session.auth.box.authToken){
		return false;
	}
	
	return true;	
};


/*
* Exports
*/

module.exports = addRoute;