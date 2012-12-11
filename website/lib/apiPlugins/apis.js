/**
* This is the tempalte of the route module. Copy this file when add new api route module.
*/

var everyauth = require('everyauth');
var request = require('request');
var uuid = require('node-uuid');

/**********************************************************************/
// Define and implement the REST api.
/**********************************************************************/
/**
* Add the routes to the Express application.
* @options {Object}
*	expressApp {Object} Express application
*	serverApp {Object} server application object.
* @ api public
* @ return this for chaining
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
		
	/**********************************************************************/
	// Add the route implementation here
	/**********************************************************************/

	var nextTaskId=0;
	var build = config.get('build');
	var server = config.get(build);
	var importFormats = config.get('formats')['import'];
	
	/**
	* Post a task to the server.
	* Http request body
	{
		"file_id": "128420334"
	}
	*/
	expressApp.post('/api/1.0/tasks', function(req, res, next){
		logger.debug("==> /api/1.0/tasks");
		// req.body saves posted JSON object.
		var fileInfo = req.body;
		
		logger.debug("==> New Task:");
		logger.debug(JSON.stringify(task));
		
		var task = {};
		// Todo - only box is supported.
		task["id"]= nextTaskId++;
		task["storageProvider"] = "box";
		task["apiKey"] = server.box.apiKey;
		task["access_token"] = req.session.auth.box.authToken;
		task["file_id"]=file_id;
		
		taskManager.pendingTranslationTasks.push(task);
		
		var model_id = task["id"].toString();
		
		var taskObject = {
			"type": "task",
			"id": task["id"].toString(),
			"action": "import",
			"file_id": fileInfo["file_id"],
			"model_id": model_id
		};
		
		logger.debug(taskObject);
		
		// Add one empty object
		if(!req.session.models)
			req.session.models = {};
		req.session.models[model_id] = null;

		res.send(200, taskObject); // success

	});
	
	/**
	* Get the file object with the specific file id.
	*/
	expressApp.get('/api/1.0/files/:id', function(req, res, next){
		logger.debug("==> /api/1.0/files/:id");
		
		if(!req.session){
			apiErrorManager.responseUnauthorized(res);
		}
		
		if(!req.session.auth){
			apiErrorManager.responseUnauthorized(res);
		}
		
		if(!req.session){
			apiErrorManager.responseUnauthorized(res);
		}
		
		if(!req.session.auth.box){
			apiErrorManager.responseUnauthorized(res);
		}
		
		if(!req.session.auth.box.authToken){
			apiErrorManager.responseUnauthorized(res);
		}
		
		var id = req.params.id;
		// Get root folder
		var url = 'https://www.box.com/api/2.0/folders/' + id;
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
			
			res.send(200, fileObject);
		});  
	});
	
	/**
	* Client get a pending task from the server. The returned task will be deleted.
	*/
	expressApp.get('/api/1.0/tasks', function(req, res, next){
		
		var task = taskManager.pendingTranslationTasks.splice(0,1); // Pop the front one.
		
		res.send(task);
		
	});
	
	/** 
	* Client gets the model from the server. The model will be deleted.
	*/
	expressApp.get('/api/1.0/models/:id', function(req, res, next){
		logger.debug("==> get /api/1.0/models/:id");
		
		var id = req.params.id;
		
		var models = req.session.models;
		
		if(!models || !models[id]){
			apiErrorManager.responseNotFound(res);
		}
		else{
			var modelObject = models[id];
			res.send(200, modelObject);
			
			delete models[id];
		}	
	});
	
	/**
	* The client uploads the mesh for a model.
	
	http request body.
	{
     	"mesh":{...}
	}

	*/
	expressApp.put('/api/1.0/models/:id', function(req, res, next){
		logger.debug("==> put /api/1.0/models/:id");
		
		// Check if the passed JSON data is valid.
		var modelInfo = req.body;
		if(!modelInfo || !modelInfo.mesh){
			apiErrorManager.responseBadRequest(res);
		}
		
		var models = req.session.models;
		var id = req.params.id;
		// Check if the id exists.
		if(!models || !models[id]){
			apiErrorManager.responseNotFound(res);
		}
		
		// Cache the model object.
		var modelObject = {
				"type": "model",
				"id":id,
				"mesh": modelInfo.mesh
			};
		models[id] = modelObject;
		
		// Response the mini object.
		var miniModelObject = {
				"type": "model",
				"id":id
			};
			
		res.send(200, miniModelObject);
	});
	
	return this;
};

/**********************************************************************/
// Exports
/**********************************************************************/

module.exports = addRoute;