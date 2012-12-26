/**
* This is the tempalte of the route module. Copy this file when add new api route module.
*/

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
	
	expressApp.post('/api/1.0/tasks', function(req, res, next){
		logger.info("==> /api/1.0/tasks");
		// req.body saves posted JSON object.
		var task = req.body;
		var taskString = JSON.stringify(task);
		
		logger.info("==> New Task:");
		logger.info(taskString);
		
		// Todo - only box is supported.
		task["taskId"]= nextTaskId++;
		task["storageProvider"] = "box";
		task["apiKey"] = server.box.apiKey;
		task["access_token"] = req.session.auth.box.authToken;
		
		taskManager.pendingTranslationTasks.push(task);
		
		res.send(200); // success

	});
	
	expressApp.get('/api/1.0/files/:id', function(req, res, next){

		apiErrorManager.responseNotImplemented(res);
		
	});
	
	expressApp.get('/api/1.0/tasks', function(req, res, next){

		var task = taskManager.pendingTranslationTasks.splice(0,1); // Pop the front one.
		
		res.send(task);
		
	});
	
	expressApp.post('/api/1.0/jobs/import', function(req, res, next){

		apiErrorManager.responseNotImplemented(res);
		
	});
	
	expressApp.get('/api/1.0/models/:id', function(req, res, next){

		apiErrorManager.responseNotImplemented(res);
		
	});
	
	expressApp.put('/api/1.0/models/:id', function(req, res, next){

		apiErrorManager.responseNotImplemented(res);
		
	});
	
	return this;
};

/**********************************************************************/
// Exports
/**********************************************************************/

module.exports = addRoute;