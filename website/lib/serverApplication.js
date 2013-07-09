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
	
	
	/**********************************************************************/
	// Apply the settings read from appfog
	/**********************************************************************/
	if(process.env.VMC_APP_PORT){
		config.set('port', process.env.VMC_APP_PORT); 
		config.set('secure', false);
	}

	// MongoDB
	// When you provision and bind a service to your app, AppFog creates an environment variable called VCAP_SERVICES. 
	if(process.env.VCAP_SERVICES){
		var env = JSON.parse(process.env.VCAP_SERVICES);
		var mongo = env['mongodb-1.8'][0]['credentials'];
		
		serviceConf.mongodb = {
			"host":mongo.hostname,
			"port":mongo.port,
			"username":mongo.username,
			"password":mongo.password,
			"name":mongo.db // the db name
		};
	}
	/**********************************************************************/

	this.config = config;
		
	// Configure the logger
	log4js.configure({
	    appenders: [
	        { type: "console" }
		],
		replaceConsole: true
	});

	this.logger = log4js.getLogger();
	
	/**********************************************************************/
	// Configure the mongostream
	/**********************************************************************/
	var mongostream = require("mongostream")();	
	mongostream.addSupportedCollections(["user", "storage"]);
	
	var self = this;
	mongostream.open(serviceConf.mongodb, function(err){
		if(err){
			self.logger.error("DB: OPEN ERROR - " + err.message + " " + JSON.stringify(serviceConf.mongodb));
		}
		else{
			self.logger.info("DB: OPEN SUCCESSFULLY." + " " + JSON.stringify(serviceConf.mongodb))
		}
	});
	
	/**********************************************************************/
	this.apiErrorManager = require(path.join(__dirname, './apiErrorManager.js'))();
	this.taskManager = require(path.join(__dirname, './datamodel/taskManager.js'))();
	this.modelManager = require(path.join(__dirname, './datamodel/modelManager.js'))();
	
	this.samplePath = path.join(__dirname, '../mesh_samples');
	this.userModelPath =path.join(__dirname, '../user_models');
};


/**********************************************************************/
// Exports
/**********************************************************************/

module.exports = new ServerApplication();

