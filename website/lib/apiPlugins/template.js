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
		
	/**********************************************************************/
	// Add the route implementation here
	/**********************************************************************/
	expressApp.get('/api/1.0/users/:id', function(req, res, next){
		logger.debug("==> /api/1.0/users/:id");
		apiErrorManager.responseForbidden(res);
	});
	
	return this;
};

/**********************************************************************/
// Exports
/**********************************************************************/

module.exports = addRoute;