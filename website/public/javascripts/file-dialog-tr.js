
var openDialog = function(files, onCloseCallback, onDoubleClick){
	var dia = new component.ui.fileDialog.dialog()
	dia.init("|root", "entry"); 		
	dia.appendFiles("entry", files);
	dia.bind("dialogclose", onCloseCallback);
	dia.bind("dblclick", onDoubleClick);
<<<<<<< HEAD
}
=======
}

var openDashboardDialog = function (onCloseCallback) {
    var dia = new component.ui.fileDialog.dashboarddialog()
    dia.init();
    dia.bind("dialogclose", onCloseCallback);
}

>>>>>>> origin/test
