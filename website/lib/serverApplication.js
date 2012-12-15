/**
* The data model of the server application.
*/
var nconf = require('nconf');
var log4js = require('log4js');
var path = require('path');

/**
 * Constructor
 * It is the application of the server.
 */
var ServerApplication = function(){

	// Load config settings.
	var config = nconf.argv().env().file({file: path.join(__dirname, 'config.json')});
	var serviceConf = config.get(config.get('build'));
	
	this.config = config;	

	// Configure the logger
	log4js.configure({
	    appenders: [
	        { type: "console" }
		],
		replaceConsole: true
	});

	this.logger = log4js.getLogger();
	
	this.apiErrorManager = require('./ApiErrorManager.js')();
	this.taskManager = require('./datamodel/taskManager.js')();
	this.modelManager = require('./datamodel/modelManager.js')();
};


/**********************************************************************/
// Exports
/**********************************************************************/

module.exports = new ServerApplication();

