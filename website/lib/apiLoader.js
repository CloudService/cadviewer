/**
* This is the loader for the api plugins.
* Discovery mechanism: The files under ./apiPlugins/ are loaded.
* Interface protocal: Refer the template ./apiPlugins/template.js
*/

var fs = require('fs');
var path = require('path');

/**********************************************************************/
// Define and implement the REST api.
/**********************************************************************/
/**
* Traverse all the route modules under the ./apiPlugins/. Load and add them to the router of the Express application
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
	var logger = options.serverApp.logger;
	var apiErrorManager = options.serverApp.apiErrorManager;
	
	// Traverse all the route modules under the ./apiPlugins/. Load and add them to the router of the Express application.
	
	var routesPath = path.join(__dirname, 'apiPlugins');
	var routeModlues = fs.readdirSync(routesPath);
	
	routeModlues.forEach(function(element, index, array){
		var routeModulePath = path.join(routesPath, element);
		logger.debug('Adding route "' + routeModulePath +'"');
		try{
			var routeModule = require(routeModulePath);
					
			if(typeof routeModule === 'function'){
				routeModule(options);
			}
			else{
				logger.warn('Route Module "' + routeModulePath + '" does not export a function.');
			}
		}
		catch(err){
			logger.warn('Exception is caught when load route module "' + routeModulePath + '". ' + JSON.stringify(err));
		}
	});	
	
	// Response the error for all the not existing api requests
	expressApp.all('/api/*', function(req, res, next){
		apiErrorManager.responseNotFound(res); // When it goes here, that means the resource is not found.
	});
	
	return this;
}

/**********************************************************************/
// Exports
/**********************************************************************/

exports = module.exports = addRoute;