 
 /**********************************************************************/
// Exports
/**********************************************************************/
var createInstance = function(){
	return new TaskManager();
};

module.exports = createInstance;
 
/**********************************************************************/
// Implementation
/**********************************************************************/
/**
 * @constructor
 */
var TaskManager = function(){
	
	this.pendingTranslationTasks=[];
};