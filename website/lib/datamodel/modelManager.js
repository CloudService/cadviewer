/**********************************************************************/
// Exports
/**********************************************************************/
var createInstance = function(){
	return new ModelManager();
};

module.exports = createInstance;
 
/**********************************************************************/
// Implementation
/**********************************************************************/
/**
 * @constructor
 */
var ModelManager = function(){
	
	this.models={};
};