
$(document).ready(function(){
	$("#start-button").button();
	$("#start-button").click( function(e){
		// Check 
		var task = service.trans.translator.task;
		
		var fileFullName = task["srcFileName"];
		if(fileFullName === ""){
			alert("Please select the file you want to translate.");
			return;
			}
		
		task["email"] = $("#email").val();
		
		$.post("/api/1.0/tasks", task, function() {
			parent.location.href='/?d=1'; // update the task queue number
			alert("Your request is accepted.");
		})
		.error(function() { parent.location.href='/error';});
    
	});
	
	// update the destination format.
	var supportedFormats = parent.getDestFormats();
	var formatListElement = $("#format-list");
	formatListElement.children().remove(); // Remove all children.
	var formatLength = supportedFormats.length;
	for(var i = 0; i < formatLength; ++i){
		var format = supportedFormats[i];
		if(0 == i)
			var formatHTML = '<li> <div>  <input type="radio" name="format" value="'+format+'" checked>'+format+'</div></li>'; // Check the first one
		else
			var formatHTML = '<li> <div>  <input type="radio" name="format" value="'+format+'">'+format+'</div></li>';
		
		formatListElement.append($(formatHTML));
	}
	
	var messageSolver = actionMessage.getMessageSolver(); 
	messageSolver.register("translator", new service.trans.translator());
	
	// Check the action message from the parent.
	
	var astring = parent.getAction();
	if(astring && astring != "")
		messageSolver.evaluate(astring);
	
   $("#box").click(function(event){
	
     parent.location.href='/auth/box';
   });
   
	var showWipMessage = function(){
		alert("The box storage provider is supported. The support for your selection is working in progress. ^_^");
	}
    $("#dropbox").click(function(event){
     showWipMessage();
   });
   $("#baidu").click(function(event){
     showWipMessage();
   });
   $("#a360").click(function(event){
     showWipMessage();
   });
   $("#qq").click(function(event){
     showWipMessage();
   });
   
   $('input:radio[name=format]').change(function(){
  			var task = service.trans.translator.task;
			var fileFullName = task["srcFileName"];
			if(fileFullName != ""){
				// Update destination format
				service.trans.translator.updateDestFormat();
			}
	   }
   ); 
   
 });
 
var service = service || {};
service.trans = service.trans || {};

service.trans.translator = function (){

	this.openFileDialog = function(data){
	
	var files = [];
	
	var fileList = data.files;
	var length = fileList.length;
	for(var i = 0; i < length; i++){
		var fileInfo = fileList[i];
		var file = new component.ui.fileDialog.fileObject();
		
		file.id = fileInfo.id;
		file.name = fileInfo.name;
		file.isFolder = fileInfo.isFolder;
		file.size = fileInfo.size;
		file.moddate = fileInfo.moddate;
		
		files.push(file);
	}
	
		openDialog(files, _onOK);
	}
	
	_onOK = function (event){
		var dialog = event.data.dialog;
		if(!dialog.isOkClicked())
			return;
			
		var selections = dialog.getSelections();
		if(selections.length > 0){
			var selection = selections[0];
			
			if(selection.isFolder)
				return;
				
			// Save the task
			var task = service.trans.translator.task;
			task["srcFileId"] = selection["id"];
			task["srcFileName"] = selection["name"];
			
			var fileFullName = selection.fullName();
			task["srcFileFullName"] = fileFullName;
			task["destFolderId"] = selection["parent"]["id"];
			
			// Update DOM
			$("#srcFile").val(fileFullName);
			
			// Update destination format
			service.trans.translator.updateDestFormat();
		}
	}
}

service.trans.translator.task={
	"srcFileId" : ""
	, "srcFileName" : ""
	, "srcFileFullName" :""
	, "destFolderId": ""
	, "destFormat": ""
	, "destFileName" : ""
	, "email": ""};
service.trans.translator.updateDestFormat = function(){
	var task = service.trans.translator.task;
	
	var ext = $('input:radio[name=format]:checked').val();
	task["destFormat"] = ext;
	task["destFileName"] = task["srcFileName"] + "." + ext;
	
	var destFullName = task["srcFileFullName"] + "." + ext;
	$("#destFile").val(destFullName);		
}