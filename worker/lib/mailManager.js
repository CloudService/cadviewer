
var sendmail = require('sendmail')();

/**
* Exports
*/

var createInstance = function(options){
	return new mailManager(options);
};
exports = module.exports = createInstance;


/**
* Constructor
* @param options {Object}
*		config, the config object.
*		logger, the logger object,
*/
var mailManager = function(options){
	options = options || {};
	var nconf = options.nconf;
	var logger = options.logger;
	
	/** Send the mail to the recipients
	* this {mailManager}
	* @param options {Object}
	*		from, {string} - sender.
	* 		to, {string} - recipients
	*		subject, {string}
	*		content, {string}
	* @param callback {function} function(err, reply)
	* @return this for chaining.
	*/
	this.sendMail = function(options, callback){
		sendmail(options, callback);
	};
};