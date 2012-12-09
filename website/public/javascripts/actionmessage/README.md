This is the JS implementation for the Action Message protocol.
The handler must be registered ahead before it is available.

This module can be used under both the server and browser environments. 

Browser environment
<script src="actionMessage/index.js"></script>
<script>
  var messageSolver = actionMessage.getMessageSolver();
</script>


Server environment (Node.js)
var actionMessage = require('actionmessage'),
var messageSolver = actionMessage.getMessageSolver();