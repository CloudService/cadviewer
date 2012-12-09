/**
 * This is the JS implementation for the Action Message protocol.
 * The handler must be registered ahead before it is available.
 *
 * This module can be used under both the server and browser environments. 
 * 
 * Browser environment
 * <script src="actionMessage/index.js"></script>
 * <script>
 *   var messageSolver = actionMessage.getMessageSolver();
 * </script>
 *
 * Server environment (Node.js)
 * var actionMessage = require('actionmessage'),
 * var messageSolver = actionMessage.getMessageSolver();
 *
 */
 
/**
* Use the closure to make this module can be used in both server and browser environment.
* The purpose is to make the 'exports' object available and add the global object to 'window' under browser environment.
* Under server environment, the 'exports' is defined by Node.
* Under the browser environment, the 'exports' object points to window['actionMessage'].
*/

(function(exports){


/**
* Constructor 
*/
var actionMessage = function (){

    /** @type {object} */
	var handlers = {};
	
	/**
	 * Register an object as the handler
	 *
	 * @this {commonModules.actionMessage}
	 * @param {String} handlerName
	 * @param {Object} handlerObject
	 * @return {bool}
	 * @api public
	 */
	this.register = function(handlerName, handlerObject){
		if(!handlers.hasOwnProperty(handlerName))	{
			if(handlerObject){
				handlers[handlerName] = handlerObject; // register
				return true;
			}
		}
		
		return false;
	}
	
	/**
	 * Evaluate the action message.
	 *
	 * @this {commonModules.actionMessage}
	 * @param {String} messageJSON
	 * @return {object}
	 * @api public
	 */
	this.evaluate = function(messageJSON){
	
		var actionResult = { 
			status: "error"
			, result: null
			};
			
		var bSuccess = true;
		try{
			var messageObject = JSON.parse(messageJSON);
			var handlerName = messageObject.handler; // string
			var actionName = messageObject.action; // string
			var data = messageObject.data; // Object
			
			if(!handlerName){
				actionResult.error = "The handler name is not specified";
				return JSON.stringify(actionResult);
			}
				
			if(!actionName){
				actionResult.error = "The action name is not specified";
				return JSON.stringify(actionResult);
			}
	
			var handlerObject = handlers[handlerName];
			
			if(!handlerObject){
				actionResult.error = "The handler '" + handlerName + "' is not registered";
				return JSON.stringify(actionResult);
			}
				
			var fn = handlerObject[actionName];
			if(!fn){
				actionResult.error = "The action '" + actionName + "' does not exist";
				return JSON.stringify(actionResult);
			}
			
			var result = fn.call(handlerObject, data);
			
			actionResult.status="success"; // The execution is successful when get here.
			actionResult.result = result;
		}
		catch(e)
		{
			actionResult.error = "Exception is thrown when execute the action. Exception message: " + e.toString();
		}
		
		return JSON.stringify(actionResult);
	}
}

/**
 * Return the singleton of the actionMessage
 *
 * @this {window}
 * @return {actionMessage}
 * @api public
 */
exports.getMessageSolver = function()
{
	var singleton = null;
	exports.getMessageSolver  = function(){
		if(!singleton)
			singleton = new actionMessage();
			
		exports.getMessageSolver = function(){
			return singleton;
		}
		
		return exports.getMessageSolver ();
	}
	
	return exports.getMessageSolver ();
}

})(typeof exports === 'undefined'? this['actionMessage']={}: exports);




