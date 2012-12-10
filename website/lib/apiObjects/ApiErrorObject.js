
/**********************************************************************/
// Exports
/**********************************************************************/
/**
 * Expose `createApiErrorObject()`.
 */
exports = module.exports = createApiErrorObject;

/**********************************************************************/
// Implementation
/**********************************************************************/
/**
 * Create an erro object.
 * @return {ApiErrorObject} object
 * @api public
 */
function createApiErrorObject(type, status, message, help_url) {
  var error = new ApiErrorObject(type, status, message, help_url);
  return error;
}
 
/**
* Define the error object.
* @constructor
*/
var ApiErrorObject = function (type, status, message, help_url) {
	this.type = type;
	this.status = status;
	this.message = message;
	this.help_url = help_url;
};