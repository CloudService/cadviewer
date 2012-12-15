
var openDialog = function(files, onCloseCallback){
	var dia = new component.ui.fileDialog.dialog()
	dia.init("|root", "entry"); 		
	dia.appendFiles("entry", files);
	dia.bind("dialogclose", onCloseCallback)
}