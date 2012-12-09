/**
 * Unit test for the action message implementation.
 *
 * This test can run under both server and browser environments.
 *
 * Browser (index.html)
 
<html>
<Title> Action Message Solver unit test </Title>
<body align=center>
 	Action Message Solver unit test
	<script src="../index.js" type="text/javascript"></script>
	<script src="unit.js" type="text/javascript"></script>
</body>
</html>

 *
 * Server (Node.js) 
 * Node actionMessageTest.js
 */
 
/**
 * Namespace
 *
 */	

var unitTest = unitTest || {};
  
/**
* Use type check to make this module can be used in both server and browser environment.
*/

unitTest.isServerEnvironment = (typeof require != 'undefined');
if(unitTest.isServerEnvironment){
	var actionMessage = require("../index.js"); // Server environment
}

var messageSolver = actionMessage.getMessageSolver(); // Browser environment


unitTest.messageSolverTest = {};


/**
 * Define the handler
 *
 */
unitTest.messageSolverTest.calculator = {};
unitTest.messageSolverTest.calculator.add = function(data)
{
	return data.x + data.y;
}

unitTest.messageSolverTest.runAll = function(){
	
	// Register
	messageSolver.register("calculator", unitTest.messageSolverTest.calculator);
	
	messageSolver = actionMessage.getMessageSolver(); // Call this function again to verify the singleton works.

	// Evaluate
	var aobject = {
 		handler: "calculator"
 		, action: "add"
 		, data: {x: 10, y: 5}
	};
	unitTest.messageSolverTest.evaluate(aobject);
	
	aobject = {
 		action: "add"
 		, data: {x: 10, y: 5}
	};
	unitTest.messageSolverTest.evaluate(aobject);
	
	aobject = {
 		handler: "calculator"
 		, data: {x: 10, y: 5}
	};
	unitTest.messageSolverTest.evaluate(aobject);
	
	aobject = {
 		handler: "calculator2"
 		, action: "add"
 		, data: {x: 10, y: 5}
	};
	unitTest.messageSolverTest.evaluate(aobject);
	
	
	aobject = {
 		handler: "calculator"
 		, action: "add2"
 		, data: {x: 10, y: 5}
	};
	unitTest.messageSolverTest.evaluate(aobject);
	
	aobject = {
 		handler: "calculator"
 		, action: "add"
 		, data: {x2: 10, y: 5}
	};
	unitTest.messageSolverTest.evaluate(aobject);
}

unitTest.messageSolverTest.evaluate = function(aobject){
	
	var astring = JSON.stringify(aobject);
	var rsuccess = messageSolver.evaluate(astring);
	console.log(rsuccess); // ToDo - verify the result.
}

unitTest.messageSolverTest.runAll();
