
var openDialog = function(files, onCloseCallback){
	var dia = new component.ui.fileDialog.dialog()
	dia.init("box", "0"); 		
	dia.appendFiles("0", files);
	dia.bind("dialogclose", onCloseCallback)
}