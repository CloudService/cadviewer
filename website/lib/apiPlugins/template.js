/**
 This is the tempalte of the route module. Copy this file when add new api route module.

@module template
*/

/*
 Define and implement the REST api.
*/

/**
* Add the routes to the Express application.
* @param {Object} options 
*  	@param {Object} options.expressApp Express application
*  	@param {Object} options.serverApp server application object.
* @return this for chaining
* @class template 
*/
var addRoute = function(options){
	if(!options || !options.expressApp || !options.serverApp)
		return this;
		
	var expressApp = options.expressApp;
	var serverApp = options.serverApp;
	var config = serverApp.config;
	var apiErrorManager = serverApp.apiErrorManager;
	var logger = serverApp.logger;	
		
	/**
	* This is a sample method to demonstrate how to add an API.
	* @method GET /api/1.0/users/:id
	* @param {Object} req
	* @param {Object} res
	* @param {Object} next
	*/
	expressApp.get('/api/1.0/users/:id', function(req, res, next){
		logger.debug("==> /api/1.0/users/:id");
		apiErrorManager.responseForbidden(res);
	});
	
	return this;
};

/*
* Exports
*/

module.exports = addRoute;