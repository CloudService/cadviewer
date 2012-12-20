
$(document).ready(function(){
	
	// Execute the action message from server
	var messageSolver = actionMessage.getMessageSolver(); 
	
	translator = new service.trans.translator();
	
	messageSolver.register("translator", translator);
	
	// Check the action message from the parent.
	
	var astring = parent.getAction();
	if(astring && astring != "")
		messageSolver.evaluate(astring);
	
	// Click the import command 
	$("#fancybox-new").click(function(event){	
		var dlg = document.getElementById('file-dialog');
		if (dlg) {
			var parent = dlg.parentNode.parentNode;
			parent.removeChild(dlg.parentNode);
		}
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

	this.openFileDialog = function(){
		
		// todo - we should use the entry folder instead of the box root folder when initiate the dialog.
		var entryfoldedurl = "/api/1.0/files/entry";
		//var entryfoldedurl = "/api/1.0/files/0";
		$.get(entryfoldedurl, function(data) {
			
			// alert(JSON.stringify(data));
			
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
			
			openDialog(files, _onOK, _onDoubleClick);
		})
		.error(function() { 
			// Show the dialog with no folders.
			openDialog([], _onOK, _onDoubleClick);
		});
	};
	
	_onDoubleClick = function (e){
		var dlg = e.data.dialog;

		var t = dlg.getTimer();
		clearTimeout(t);
		
		var eventElement = e.srcElement;
			while (eventElement) {
				id = eventElement["id"];

				if (id && id != "") {
					var file = dlg._getFile(id);
					dlg.setSingleSelection(id);

					if (!file.isFolder) {
		                var selections = dlg.getSelections();
		                if(selections.length > 0){
			                var selection = selections[0];
                         }
						$("#file-dialog").dialog("close");

                        var dlg = document.getElementById('file-dialog');
        		        var parent = dlg.parentNode.parentNode;
        		        parent.removeChild(dlg.parentNode);		
					
						var task = service.trans.translator.task;
						task["source_file_id"] = selection["id"];
						task["source_file_name"] = selection["name"];
						
						// Post it task to server
						$.post("/api/1.0/tasks", task, function(taskObject) {
				
							var model_id = taskObject.model_id;
							
							pollingModelObject(model_id);
							
							var myProgressBar = null;
							myProgressBar = new ProgressBar("progressbar",{
								borderRadius: 5,
								width: 180,
								height: 22,
								maxValue: 100,
								labelText: 'Loading mesh data...',
								extraClassName: {
									horizontalText: 'my_progress_bar_text_horizontal',
								},
								orientation: ProgressBar.Orientation.Horizontal,
								direction: ProgressBar.Direction.LeftToRight,
								animationStyle: ProgressBar.AnimationStyle.StaticFull,
								animationSmoothness: ProgressBar.AnimationSmoothness.Smooth4,
								animationSpeed: 0.5,
								backgroundUrl: 'images/ajax-loader.gif',
								imageUrl: 'images/ajax-loader.gif',
							});				
						})
						.error(function() { 
							alert("Error.");
						});
								
						}
						break;
				}	 
				eventElement = eventElement.parentElement;
			}
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
			task["source_file_name"] = selection["name"];
			
			// Post it task to server
			$.post("/api/1.0/tasks", task, function(taskObject) {
				
				//alert("Your request is accepted.");
				// alert(JSON.stringify(taskObject));
				
				var model_id = taskObject.model_id;
				
				pollingModelObject(model_id);
				
				var myProgressBar = null;
				myProgressBar = new ProgressBar("progressbar",{
					borderRadius: 5,
					width: 180,
					height: 22,
					maxValue: 100,
					labelText: 'Loading mesh data...',
					extraClassName: {
						horizontalText: 'my_progress_bar_text_horizontal',
					},
					orientation: ProgressBar.Orientation.Horizontal,
					direction: ProgressBar.Direction.LeftToRight,
					animationStyle: ProgressBar.AnimationStyle.StaticFull,
					animationSmoothness: ProgressBar.AnimationSmoothness.Smooth4,
					animationSpeed: 0.5,
					backgroundUrl: 'images/ajax-loader.gif',
					imageUrl: 'images/ajax-loader.gif',
				});				
			})
			.error(function() { 
				alert("Error.");
			});
		}
	};
};

service.trans.translator.task={};


var pollingModelObject = function (model_id){
	
	var url = "/api/1.0/models/" + model_id;
	$.get(url, function(modelObject) {
		
		//alert("Model is returned.");
		//alert(JSON.stringify(modelObject));
		
		if(modelObject.status != "good"){
			alert("Failed to generate the mesh, a sample mesh is shown.");
			var progressBar = document.getElementById('progressbar');
			if (progressbar) {
				for (var i = progressBar.childNodes.length - 1; i >= 0; i--)
					progressBar.removeChild(progressBar.childNodes[i]);
			}
			
          	var mesh = '[{"colors":[{"b":0.05098039215686274,"g":0.8666666666666667,"r":0.8666666666666667},{"b":0.0,"g":0.0,"r":0.6980392156862745},{"b":0.2784313725490196,"g":0.3607843137254902,"r":0.2235294117647059},{"b":0.7490196078431373,"g":0.5019607843137255,"r":1.0},{"b":0.7882352941176470,"g":0.0,"r":0.8784313725490196},{"b":0.9725490196078431,"g":0.1450980392156863,"r":0.09411764705882353}],"faces":[{"vertexIndices":[1,35,0]},{"vertexIndices":[0,35,36]},{"normalIndex":1,"vertexIndices":[0,36,23]},{"normalIndex":1,"vertexIndices":[23,36,37]},{"normalIndex":2,"vertexIndices":[23,37,22]},{"normalIndex":2,"vertexIndices":[22,37,38]},{"normalIndex":3,"vertexIndices":[22,38,21]},{"normalIndex":3,"vertexIndices":[21,38,39]},{"normalIndex":4,"vertexIndices":[21,39,20]},{"normalIndex":4,"vertexIndices":[20,39,40]},{"normalIndex":5,"vertexIndices":[20,40,19]},{"normalIndex":5,"vertexIndices":[19,40,41]},{"normalIndex":6,"vertexIndices":[19,41,18]},{"normalIndex":6,"vertexIndices":[18,41,42]},{"normalIndex":7,"vertexIndices":[18,42,17]},{"normalIndex":7,"vertexIndices":[17,42,43]},{"normalIndex":8,"vertexIndices":[17,43,16]},{"normalIndex":8,"vertexIndices":[16,43,44]},{"normalIndex":9,"vertexIndices":[16,44,15]},{"normalIndex":9,"vertexIndices":[15,44,45]},{"normalIndex":10,"vertexIndices":[15,45,14]},{"normalIndex":10,"vertexIndices":[14,45,46]},{"normalIndex":11,"vertexIndices":[14,46,13]},{"normalIndex":11,"vertexIndices":[13,46,47]},{"normalIndex":12,"vertexIndices":[13,47,12]},{"normalIndex":12,"vertexIndices":[12,47,24]},{"normalIndex":13,"vertexIndices":[12,24,11]},{"normalIndex":13,"vertexIndices":[11,24,25]},{"normalIndex":14,"vertexIndices":[11,25,10]},{"normalIndex":14,"vertexIndices":[10,25,26]},{"normalIndex":15,"vertexIndices":[10,26,9]},{"normalIndex":15,"vertexIndices":[9,26,27]},{"normalIndex":16,"vertexIndices":[9,27,8]},{"normalIndex":16,"vertexIndices":[8,27,28]},{"normalIndex":17,"vertexIndices":[8,28,7]},{"normalIndex":17,"vertexIndices":[7,28,29]},{"normalIndex":18,"vertexIndices":[7,29,6]},{"normalIndex":18,"vertexIndices":[6,29,30]},{"normalIndex":19,"vertexIndices":[6,30,5]},{"normalIndex":19,"vertexIndices":[5,30,31]},{"normalIndex":20,"vertexIndices":[5,31,4]},{"normalIndex":20,"vertexIndices":[4,31,32]},{"normalIndex":21,"vertexIndices":[4,32,3]},{"normalIndex":21,"vertexIndices":[3,32,33]},{"normalIndex":22,"vertexIndices":[3,33,2]},{"normalIndex":22,"vertexIndices":[2,33,34]},{"normalIndex":23,"vertexIndices":[2,34,1]},{"normalIndex":23,"vertexIndices":[1,34,35]},{"colorIndex":1,"normalIndex":24,"vertexIndices":[48,49,65]},{"colorIndex":1,"normalIndex":24,"vertexIndices":[65,49,64]},{"colorIndex":1,"normalIndex":25,"vertexIndices":[64,49,50]},{"colorIndex":1,"normalIndex":25,"vertexIndices":[64,50,63]},{"colorIndex":1,"normalIndex":26,"vertexIndices":[63,50,51]},{"colorIndex":1,"normalIndex":26,"vertexIndices":[63,51,62]},{"colorIndex":1,"normalIndex":27,"vertexIndices":[62,51,52]},{"colorIndex":1,"normalIndex":27,"vertexIndices":[62,52,61]},{"colorIndex":1,"normalIndex":28,"vertexIndices":[61,52,53]},{"colorIndex":1,"normalIndex":28,"vertexIndices":[61,53,60]},{"colorIndex":1,"normalIndex":29,"vertexIndices":[60,53,54]},{"colorIndex":1,"normalIndex":29,"vertexIndices":[60,54,59]},{"colorIndex":1,"normalIndex":30,"vertexIndices":[59,54,55]},{"colorIndex":1,"normalIndex":30,"vertexIndices":[59,55,58]},{"colorIndex":1,"normalIndex":31,"vertexIndices":[58,55,56]},{"colorIndex":1,"normalIndex":31,"vertexIndices":[58,56,57]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[55,26,56]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[56,26,25]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[56,25,24]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[55,54,26]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[26,54,27]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[27,54,53]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[27,53,52]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[52,51,27]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[27,51,50]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[27,50,49]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[49,48,27]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[27,48,28]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[28,48,29]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[29,48,30]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[30,48,31]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[31,48,66]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[31,66,32]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[32,66,33]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[33,66,34]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[34,66,35]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[35,66,36]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[36,66,67]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[36,67,37]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[37,67,38]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[38,67,39]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[39,67,40]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[40,67,41]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[41,67,42]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[42,67,68]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[42,68,43]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[43,68,44]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[44,68,45]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[45,68,46]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[46,68,47]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[47,68,56]},{"colorIndex":2,"normalIndex":32,"vertexIndices":[47,56,24]},{"colorIndex":3,"normalIndex":33,"vertexIndices":[65,69,48]},{"colorIndex":3,"normalIndex":33,"vertexIndices":[48,69,66]},{"colorIndex":4,"normalIndex":34,"vertexIndices":[56,68,57]},{"colorIndex":4,"normalIndex":34,"vertexIndices":[57,68,70]},{"colorIndex":5,"normalIndex":35,"vertexIndices":[71,70,67]},{"colorIndex":5,"normalIndex":35,"vertexIndices":[67,70,68]},{"normalIndex":36,"vertexIndices":[69,71,66]},{"normalIndex":36,"vertexIndices":[66,71,67]},{"normalIndex":37,"vertexIndices":[64,9,65]},{"normalIndex":37,"vertexIndices":[65,9,8]},{"normalIndex":37,"vertexIndices":[65,8,7]},{"normalIndex":37,"vertexIndices":[64,63,9]},{"normalIndex":37,"vertexIndices":[9,63,62]},{"normalIndex":37,"vertexIndices":[9,62,61]},{"normalIndex":37,"vertexIndices":[61,60,9]},{"normalIndex":37,"vertexIndices":[9,60,59]},{"normalIndex":37,"vertexIndices":[9,59,10]},{"normalIndex":37,"vertexIndices":[10,59,58]},{"normalIndex":37,"vertexIndices":[10,58,57]},{"normalIndex":37,"vertexIndices":[70,13,57]},{"normalIndex":37,"vertexIndices":[57,13,12]},{"normalIndex":37,"vertexIndices":[57,12,11]},{"normalIndex":37,"vertexIndices":[71,18,70]},{"normalIndex":37,"vertexIndices":[70,18,17]},{"normalIndex":37,"vertexIndices":[70,17,16]},{"normalIndex":37,"vertexIndices":[69,0,71]},{"normalIndex":37,"vertexIndices":[71,0,23]},{"normalIndex":37,"vertexIndices":[71,23,22]},{"normalIndex":37,"vertexIndices":[65,5,69]},{"normalIndex":37,"vertexIndices":[69,5,4]},{"normalIndex":37,"vertexIndices":[69,4,3]},{"normalIndex":37,"vertexIndices":[22,21,71]},{"normalIndex":37,"vertexIndices":[71,21,20]},{"normalIndex":37,"vertexIndices":[71,20,19]},{"normalIndex":37,"vertexIndices":[19,18,71]},{"normalIndex":37,"vertexIndices":[16,15,70]},{"normalIndex":37,"vertexIndices":[70,15,14]},{"normalIndex":37,"vertexIndices":[70,14,13]},{"normalIndex":37,"vertexIndices":[11,10,57]},{"normalIndex":37,"vertexIndices":[7,6,65]},{"normalIndex":37,"vertexIndices":[65,6,5]},{"normalIndex":37,"vertexIndices":[3,2,69]},{"normalIndex":37,"vertexIndices":[69,2,1]},{"normalIndex":37,"vertexIndices":[69,1,0]}],"id":"151","name":true,"normals":[{"x":4.651602853198186e-017,"y":0.9914448613738143,"z":-0.1305261922200219},{"x":9.707180332856109e-016,"y":0.9914448613738142,"z":0.1305261922200223},{"x":-0.0,"y":0.9238795325112869,"z":0.3826834323650897},{"x":-1.290949228758494e-017,"y":0.7933533402912348,"z":0.6087614290087210},{"x":-0.0,"y":0.6087614290087215,"z":0.7933533402912344},{"x":-1.061013389044516e-017,"y":0.3826834323650895,"z":0.9238795325112870},{"x":-0.0,"y":0.1305261922200513,"z":0.9914448613738105},{"x":0.0,"y":-0.1305261922200513,"z":0.9914448613738105},{"x":-1.615295006258198e-017,"y":-0.3826834323650905,"z":0.9238795325112864},{"x":2.870306574649082e-017,"y":-0.6087614290087199,"z":0.7933533402912356},{"x":0.0,"y":-0.7933533402912359,"z":0.6087614290087194},{"x":8.353615839897833e-017,"y":-0.9238795325112866,"z":0.3826834323650903},{"x":-9.128389538226876e-018,"y":-0.9914448613738104,"z":0.1305261922200529},{"x":-3.466850118877167e-017,"y":-0.9914448613738102,"z":-0.1305261922200530},{"x":5.352616790605398e-017,"y":-0.9238795325112877,"z":-0.3826834323650871},{"x":-4.065119764363564e-017,"y":-0.7933533402912355,"z":-0.6087614290087202},{"x":-8.514783684903231e-017,"y":-0.6087614290087202,"z":-0.7933533402912355},{"x":-1.567745160875372e-017,"y":-0.3826834323650903,"z":-0.9238795325112866},{"x":-9.128389538226800e-018,"y":-0.1305261922200518,"z":-0.9914448613738104},{"x":0.0,"y":0.1305261922200521,"z":-0.9914448613738104},{"x":5.352616790605430e-017,"y":0.3826834323650893,"z":-0.9238795325112870},{"x":2.966442613693118e-017,"y":0.6087614290087207,"z":-0.7933533402912353},{"x":5.548341071210120e-017,"y":0.7933533402912355,"z":-0.6087614290087202},{"x":6.461180025032790e-017,"y":0.9238795325112857,"z":-0.3826834323650922},{"x":0.0,"y":0.09801714032956299,"z":0.9951847266721966},{"x":2.030114849661645e-017,"y":0.2902846772544619,"z":0.9569403357322091},{"x":-0.0,"y":0.4713967368259977,"z":0.8819212643483549},{"x":3.882067886001845e-017,"y":0.6343932841636456,"z":0.7730104533627371},{"x":1.351518115904317e-017,"y":0.7730104533627370,"z":0.6343932841636454},{"x":3.083871790822276e-017,"y":0.8819212643483547,"z":0.4713967368259982},{"x":-0.0,"y":0.9569403357322089,"z":0.2902846772544617},{"x":-0.0,"y":0.9951847266721969,"z":0.09801714032956103},{"x":1.0,"y":0.0,"z":0.0},{"x":-0.0,"y":0.0,"z":1.0},{"x":0.0,"y":1.0,"z":0.0},{"x":0.0,"y":0.0,"z":-1.0},{"x":0.0,"y":-1.0,"z":0.0},{"x":-1.0,"y":-0.0,"z":0.0}],"vertices":[{"x":0.0,"y":-13.53154771973194,"z":6.464359785734098},{"x":0.0,"y":-13.42336221819976,"z":7.286110253934605},{"x":0.0,"y":-13.10617837674756,"z":8.051859785734099},{"x":0.0,"y":-12.60161174999926,"z":8.709423816001387},{"x":0.0,"y":-11.94404771973197,"z":9.213990442749692},{"x":0.0,"y":-11.17829818793247,"z":9.531174284201891},{"x":0.0,"y":-10.35654771973197,"z":9.639359785734099},{"x":0.0,"y":-9.534797251531463,"z":9.531174284201891},{"x":0.0,"y":-8.769047719731965,"z":9.213990442749690},{"x":0.0,"y":-8.111483689464677,"z":8.709423816001387},{"x":0.0,"y":-7.606917062716374,"z":8.051859785734099},{"x":0.0,"y":-7.289733221264177,"z":7.286110253934601},{"x":0.0,"y":-7.181547719731968,"z":6.464359785734098},{"x":0.0,"y":-7.289733221264177,"z":5.642609317533594},{"x":0.0,"y":-7.606917062716376,"z":4.876859785734098},{"x":0.0,"y":-8.111483689464679,"z":4.219295755466810},{"x":0.0,"y":-8.769047719731969,"z":3.714729128718505},{"x":0.0,"y":-9.534797251531463,"z":3.397545287266306},{"x":0.0,"y":-10.35654771973197,"z":3.289359785734098},{"x":0.0,"y":-11.17829818793247,"z":3.397545287266306},{"x":0.0,"y":-11.94404771973197,"z":3.714729128718506},{"x":0.0,"y":-12.60161174999926,"z":4.219295755466810},{"x":0.0,"y":-13.10617837674756,"z":4.876859785734099},{"x":0.0,"y":-13.42336221819976,"z":5.642609317533594},{"x":25.40,"y":-7.181547719731968,"z":6.464359785734098},{"x":25.40,"y":-7.289733221264177,"z":7.286110253934605},{"x":25.40,"y":-7.606917062716376,"z":8.05185978573410},{"x":25.40,"y":-8.111483689464681,"z":8.709423816001387},{"x":25.40,"y":-8.769047719731971,"z":9.213990442749692},{"x":25.40,"y":-9.534797251531465,"z":9.531174284201891},{"x":25.40,"y":-10.35654771973197,"z":9.639359785734099},{"x":25.40,"y":-11.17829818793247,"z":9.531174284201891},{"x":25.40,"y":-11.94404771973197,"z":9.213990442749690},{"x":25.40,"y":-12.60161174999926,"z":8.709423816001387},{"x":25.40,"y":-13.10617837674756,"z":8.051859785734099},{"x":25.40,"y":-13.42336221819976,"z":7.28611025393460},{"x":25.40,"y":-13.53154771973197,"z":6.464359785734098},{"x":25.40,"y":-13.42336221819976,"z":5.642609317533594},{"x":25.40,"y":-13.10617837674756,"z":4.876859785734097},{"x":25.40,"y":-12.60161174999926,"z":4.219295755466810},{"x":25.40,"y":-11.94404771973197,"z":3.714729128718505},{"x":25.40,"y":-11.17829818793247,"z":3.397545287266306},{"x":25.40,"y":-10.35654771973197,"z":3.289359785734098},{"x":25.40,"y":-9.534797251531463,"z":3.397545287266307},{"x":25.40,"y":-8.769047719731967,"z":3.714729128718506},{"x":25.40,"y":-8.111483689464679,"z":4.219295755466810},{"x":25.40,"y":-7.606917062716374,"z":4.876859785734099},{"x":25.40,"y":-7.289733221264177,"z":5.642609317533596},{"x":25.40,"y":-3.598681095118106,"z":21.05734407608096},{"x":25.40,"y":-1.740445777914486,"z":20.87432387192173},{"x":25.40,"y":0.04637859815937395,"z":20.33229662325097},{"x":25.40,"y":1.693125374393604,"z":19.45209213326270},{"x":25.40,"y":3.136510995683759,"z":18.26753616688282},{"x":25.40,"y":4.321066962063637,"z":16.82415054559267},{"x":25.40,"y":5.201271452051901,"z":15.17740376935844},{"x":25.40,"y":5.743298700722663,"z":13.39057939328458},{"x":25.40,"y":5.926318904881894,"z":11.53234407608096},{"x":0.0,"y":5.926318904881894,"z":11.53234407608096},{"x":0.0,"y":5.743298700722663,"z":13.39057939328458},{"x":0.0,"y":5.201271452051901,"z":15.17740376935844},{"x":0.0,"y":4.321066962063638,"z":16.82415054559267},{"x":0.0,"y":3.136510995683759,"z":18.26753616688282},{"x":0.0,"y":1.693125374393605,"z":19.45209213326270},{"x":0.0,"y":0.04637859815937395,"z":20.33229662325097},{"x":0.0,"y":-1.740445777914484,"z":20.87432387192173},{"x":0.0,"y":-3.598681095118106,"z":21.05734407608096},{"x":25.40,"y":-27.10975669254480,"z":21.05734407608096},{"x":25.40,"y":-27.10975669254480,"z":-7.943788483791028},{"x":25.40,"y":5.926318904881894,"z":-7.943788483791028},{"x":0.0,"y":-27.10975669254480,"z":21.05734407608096},{"x":0.0,"y":5.926318904881894,"z":-7.943788483791028},{"x":0.0,"y":-27.10975669254480,"z":-7.943788483791028}]}]';
          	renderCanvas(JSON.parse(mesh));
		}
		else{
			// Todo - hide working in progress dialog.
			var progressBar = document.getElementById('progressbar');
			if (progressbar) {
				for (var i = progressBar.childNodes.length - 1; i >= 0; i--)
					progressBar.removeChild(progressBar.childNodes[i]);
			}
			
			// Todo - render the mesh with webGL.
			var mesh = modelObject.mesh;
			renderCanvas(mesh);
		}
	})
	.error(function() { 
		//alert("No model.");
		
		setTimeout(function(){pollingModelObject(model_id);}, 2000);
	});
}

// Todo - encapsulate this logic into a class.
function renderCanvas(mesh)
{
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var container, camera, controls, scene, renderer;
	var fieldOfView = 60; // The value is degree.
	
	// Todo - we only need to do the initialization once.
	refreshContainer();
    initCamera();
    initControls();
    initScene(mesh);
    intiWebGLRenderer();
    window.addEventListener( 'resize', onWindowResize, false );
	animate();

	function refreshContainer() {
		container = document.getElementById('canvas3d');
		if (container !== null) {
			container.innerHTML = "";
		}
		else {
			container = document.createElement('div');
			container.setAttribute('id', 'canvas3d');
			document.body.appendChild( container );
		}
	}
	
	function initCamera() {
		camera = new THREE.PerspectiveCamera( fieldOfView, window.innerWidth / window.innerHeight, 1, 2000 );
        //camera.position.y = 200;
	}
	
	function initControls() {
		controls = new THREE.OrbitControls( camera );
        controls.addEventListener( 'change', render );
	}
	
	function intiWebGLRenderer() {
		renderer = new THREE.WebGLRenderer({
			antialias: true 
		});
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );
	}
	
    function initScene(mesh)
    {
		scene = new THREE.Scene();
        var light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 1, 0 );
        scene.add( light );
		
        var bodies = mesh;
        
        var currentMesh = null;
        for(var i = 0; i < bodies.length; ++i)
        {
            var geom = new THREE.Geometry;
            var body = bodies[i];
            geom.id = body.id;
            geom.name = body.name;
            for(var j = 0; j < body.vertices.length; ++j)
            {
                geom.vertices.push(new THREE.Vector3(body.vertices[j].x, body.vertices[j].y, body.vertices[j].z));
            };
            
            if (body.colors)
            {
                for (var i = 0; i < body.colors.length; i++) {
                    var tri_color = new THREE.Color;
                    tri_color.setRGB(body.colors[i].r, body.colors[i].g, body.colors[i].b);
                    geom.colors.push(tri_color);
                };
            };
            
            for(var k = 0; k < body.faces.length; ++k)
            {
                var tri = body.faces[k];
                geom.faces.push(new THREE.Face3(tri.vertexIndices[0],tri.vertexIndices[1],tri.vertexIndices[2]))
            }
            
			var material = new THREE.MeshBasicMaterial({
				color: 0xff00ff,
				wireframe: true,
				opacity: 0.5,
				side: THREE.DoubleSide 
			});
			
			// Todo - support more meshes here.
			currentMesh = new THREE.Mesh(geom, material)
            scene.add(currentMesh);
        }
        
        // Update the camera
        
    	var geometry = currentMesh.geometry;
	   	geometry.computeBoundingBox();
	   	geometry.computeBoundingSphere();
	   
	   	var bbx = geometry.boundingBox;
	   	var radius = geometry.boundingSphere.radius;
	   
	   	var center = new THREE.Vector3((bbx.max.x + bbx.min.x) / 2,
	   	 	(bbx.max.y + bbx.min.y) / 2,
	   	 	(bbx.max.z + bbx.min.z) / 2);
	   	
	   	//camera.lookAt( center );
	   	camera.position.x = center.x;
	   	camera.position.y = center.y; 
	   	camera.position.z = center.z + radius * 2;
    }
    
    function onWindowResize() {        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();        
        renderer.setSize( window.innerWidth, window.innerHeight );       
    }
    
    function animate() {       
        requestAnimationFrame( animate );
        controls.update();
        render();        
    }
    
    function render() {
        renderer.render( scene, camera );
    }
}


var $j=function(id){return document.getElementById(id);};
var getMouseP=function (e){
	e = e || window.event;
	var m=(e.pageX || e.pageY)?{ x:e.pageX, y:e.pageY } : { x:e.clientX + document.body.scrollLeft - document.body.clientLeft, y:e.clientY + document.body.scrollTop  - document.body.clientTop };
	return m;
};
		
move=function(o,t){
		o=$j(o);
		t=$j(t);
		o.onmousedown=function(ev){
			var mxy=getMouseP(ev);
			var by={x:mxy.x-(t.offsetLeft),y:mxy.y-(t.offsetTop)};
			o.style.cursor="move";
			document.onmousemove=function(ev){
				var mxy=getMouseP(ev);
				t.style.left=mxy.x-by.x+"px";
				t.style.top=mxy.y-by.y+"px";
			};
			document.onmouseup=function(){
				window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
				this.onmousemove=null;
			}
		}
	}
move("PanelFilecommand","PanelFilecommand");


