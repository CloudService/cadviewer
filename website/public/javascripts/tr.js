
$(document).ready(function(){
	
	// Execute the action message from server
	var messageSolver = actionMessage.getMessageSolver(); 
	
	translator = new service.trans.translator();
	
	messageSolver.register("translator", translator);
	
	// Check the action message from the parent.
	
	var astring = parent.getAction();
	//if(astring && astring != "")
		//messageSolver.evaluate(astring);
	
	// Click the import command 
	$("#fancybox-new").click(function(event){
	
		translator.openFileDialog();
   });   
  
  	// Click the box drive icon.
   $("#box").click(function(event){
	
     parent.location.href='/auth/box';
   });

 });
 
var service = service || {};
service.trans = service.trans || {};

service.trans.translator = function (){

	this.openFileDialog = function(data){
		
		$.get("/api/1.0/files/entry", function(data) {
			
			alert(JSON.stringify(data));
			
			// todo - request the root folder from server.
			var files = [];
			var fileList = data.children || [];
			var length = fileList.length;
			for(var i = 0; i < length; i++){
				var fileInfo = fileList[i];
				var file = new component.ui.fileDialog.fileObject();
				
				file.id = fileInfo.id;
				file.name = fileInfo.name;
				file.isFolder = fileInfo.is_folder;
				file.size = fileInfo.size;
				file.moddate = fileInfo.modified_at;
				
				files.push(file);
			}
			
			openDialog(files, _onOK);
		})
		.error(function() { 
			// do nothing.
		});
	};
	
	_onOK = function (event){
		var dialog = event.data.dialog;
		if(!dialog.isOkClicked())
			return;
			
		var selections = dialog.getSelections();
		if(selections.length > 0){
			var selection = selections[0];
			
			if(selection.isFolder)
				return;
				
			// Get the task info from selected file.
			var task = service.trans.translator.task;
			task["source_file_id"] = selection["id"];
			task["source_file_id"] = selection["name"];
			
			// Post it task to server
			$.post("/api/1.0/tasks", task, function(data) {
				
				alert("Your request is accepted.");
				alert(data);
			})
			.error(function() { 
				alert("Error.");
			});
		}
	};
};

service.trans.translator.task={};

