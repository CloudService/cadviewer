/**
Implement the APIs for the sample object.

@module samples
*/

var path = require("path");
var fs = require('fs');

/**********************************************************************/
// Define and implement the REST api.
/**********************************************************************/
/**
* Add the routes to the Express application.
* @param {Object} 
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
		
	/**********************************************************************/
	// Add the route implementation here
	/**********************************************************************/
	
	/**
	* Get the sample object. The id is mapped as the file name under folder /mesh_samples/.
	* i.e. if the id is shaver02, the file shaver02.json will be loaded.
	
	* Http response body
	
		{
			"type": "sample",
			"id": "shaver02",
			"mesh": {}
		}
	
	* @method GET /api/1.0/samples/:id
	* @param {Object} req
	* @param {Object} res
	* @param {Object} next
	*/
	expressApp.get('/api/1.0/samples/:id', function(req, res, next){
		logger.debug("==> /api/1.0/samples/:id");
		
		var id = req.params.id;
		logger.debug(id);
		
		var samplePath = serverApp.samplePath;
		
		fs.exists(samplePath, function (exists) {		
			if(exists){
				var meshFile = path.join(samplePath, id + '.json');
				logger.debug("Loading mesh file: " + meshFile);
				
				fs.exists(meshFile, function (exists) {		
					if(exists){
						// Response to the client
						
						fs.readFile(meshFile, function (err, data) {
							if (err) {
								logger.debug("[Fail] Can't read the mesh file");
								apiErrorManager.responseInternalError(res);
								return;
							}
							
							try{
							
								var sampleObject = {
									"type": "sample",
									"id": id,
									"mesh": JSON.parse(data)
								};
								
								res.send(200, sampleObject);
							}
							catch(err){
								logger.debug("[Fail] Failed to parse the file.");
								apiErrorManager.responseInternalError(res);
								return;
							}
						});
						
					}
					else{
						logger.debug("[Fail] file not exists.");
						apiErrorManager.responseNotFound(res);
						return;
					}
					
				});		
			}
			else{
				logger.debug("Sample path doesn't exist." + samplePath);
				apiErrorManager.responseInternalError(res);
				return;
			}
		});	
	});
	
	return this;
};

/**********************************************************************/
// Exports
/**********************************************************************/

module.exports = addRoute;