	
var component = component || {};
component.ui = component.ui || {};
component.ui.fileDialog = component.ui.fileDialog || {};

/** Constructor
*/
component.ui.fileDialog.dialog = function (){

	/** @type {HTMLDivElement} the outmost div of the dialog*/
	var _dialogElement = {};
	
	/** @type {HTMLDivElement} the folder navigator element*/
	var _folderNavigatorElement = null;
	
	/** @type {HTMLElement} the file list element*/
	var _fileListElement = null;
	
	/** @type {component.ui.fileDialog.fileObject} the root directory*/
	var _rootDirectory = null; 
	
	/** @type {bool} */
	var _isInitialized = false;
	
	/** @type {Array} The array of the selected {component.ui.fileDialog.fileObject} */
	var _selectedItems = [];
	
	/** @type {Object} the map for {component.ui.fileDialog.fileObject}*/
	var _fileMap={};
	
	/** @type {bool} */
	var _isOKClicked = false;
	
	/** Constructor
	*@this {component.ui.fileDialog}
	*@api public
	@rootName {string} the name of the root directory
	@rootId {string} the id of the root directory
	*@return this for chain.
	*/
	this.init = function(rootName, rootId){
		
		// Entry check.
		if(_isInitialized)
		{
			console.log("The dialog can't be initialized more than once.");
			return this;
		}
		_isInitialized = true;
		
		// Create root folder.
		_rootDirectory = new component.ui.fileDialog.fileObject();
		_rootDirectory.id = rootId;
		_rootDirectory.name = rootName ? rootName : "root";
		_rootDirectory.isFolder = true;
		_rootDirectory.isChildrenPopulated = false;
			
		this._addFile(_rootDirectory);
			
		// main dialog
		var dialogHtml = component.ui.fileDialog.template.filedialog();
		_dialogElement = $(dialogHtml);
		
		// navigator
		_folderNavigatorElement = $("#file-navigator", _dialogElement);
		
		// file header
		var fileHeaderHtml = component.ui.fileDialog.template.fileheader();
		var fileHeaderElement = $("#file-header", _dialogElement);
		fileHeaderElement.append($(fileHeaderHtml));
		
		// File list
		_fileListElement = $("#file-list", _dialogElement);
		
		// bind event
		_fileListElement.on("click", {dialog: this}, _clickHandler);
		
		// Add to document
		$("body").append(_dialogElement);
		
		// Set the dialog options
		_dialogElement.dialog(
		{ 
			buttons: 
    		{
        		"Ok": function() { _isOKClicked = true; $(this).dialog("close"); } 
        		, "Cancel" : function() { $(this).dialog("close"); } 
    		}
    		, title: "Select file"
			, width: 800
			, height: 600
			, draggable: true
			, modal: true
			, resizable: false 
			, autoOpen: false
		});	
		
		this.updateFileNavigator([{name: _rootDirectory.name, id: _rootDirectory.id}]);

		
		_dialogElement.dialog("open");
		
		return this;
	}
	
	/** Append files
	*@this {component.ui.fileDialog.dialog}
	*@api public
	*@parentId {string} The id of the parent.
	*@files {Array} of {component.ui.fileDialog.fileObject} the file list.
	*@return this for chain.
	*/
	this.appendFiles = function(parentId, files){
	
		var parent = this._getFile(parentId);
		if(!parent){
			console.log("Error: parent '" + parentId + "' doesn't exist.");
			return this;
		}
	
		//var fileList = $("#file-list", _dialogElement);
		
		var length = files.length;
		for(var i = 0; i < length; i++){
			var file = files[i];
			
			// JS object
			parent.appendChild(file);
			this._addFile(file);
			
			// DOM element
			var args = {
				"id": file["id"]
				, "thumbnail": file["isFolder"] ? "file-icon-folder" : "file-icon-cloud"
				, "name" : file["name"]
				, "size": file["size"]
				, "moddate": file["moddate"]
			}
			
			var fileHtml = component.ui.fileDialog.template.filerow(args);
			var fileElement = $(fileHtml);
			file.htmlElement = fileElement;
			
			// DOM
			_fileListElement.append(fileElement);
		}
	}
	
	/** Append files
	*@this {component.ui.fileDialog.dialog}
	*@api public
	*@path {Array} The array of object {"name":"", "id":""}.
	*@return this for chain.
	*/
	this.updateFileNavigator = function(path){
		
		if(_folderNavigatorElement){
			_folderNavigatorElement.html(''); // remove the current navigator.
			
			var args = {folderPath:path};
			var naviHTML = component.ui.fileDialog.template.navigator(args);
			_folderNavigatorElement.append($(naviHTML));
		}
		
		return this;
	}
	
	/** Add file
	*@this {component.ui.fileDialog.dialog}
	*@private
	*@file {component.ui.fileDialog.fileObject} 
	*@return this for chain.
	*/
	this._addFile = function(file){
		
		_fileMap[file.id] = file;
		return this;
	}
	
	/** get file
	*@this {component.ui.fileDialog.dialog}
	*@private
	*@id {string} The file id.
	*@return {component.ui.fileDialog.fileObject}
	*/
	this._getFile= function(id){
		return _fileMap[id];
	}
	
	/** Click handler
	*@this 
	*@private
	*@e {Event} The click event.
	*@return 
	*/
	_clickHandler = function (e){
		var dialog = e.data.dialog;
		var id = null;
		
		var eventElement = e.srcElement;
		while(eventElement){
			id = eventElement["id"];
			
			if(id && id != ""){
				dialog.setSingleSelection(id);
				break;
			}
				
			eventElement = eventElement.parentElement;
		}
		
		
		
		// x-browser prevent default action and cancel bubbling 
		if (typeof e.preventDefault === 'function') {
			e.preventDefault();
			e.stopPropagation(); 
		} else {
			e.returnValue = false;
			e.cancelBubble = true;
		}
	}
	
	
	/** select a file
	*@this {component.ui.fileDialog.dialog}
	*@public
	*@id {string} The file id.
	*@return this for chain.
	*/
	this.setSingleSelection = function(id){
		var file = this._getFile(id);
		if(!file){
			console.log("Error: invalid file id: " + id);
			return this;
		}
		
		var length = _selectedItems.length;
		for(var i = 0; i < length; ++i){
			var temp = _selectedItems[i];
			temp.htmlElement.removeClass("file-row-selected");
			temp.htmlElement.addClass("file-row");
		}
		_selectedItems = [];
		
		file.htmlElement.removeClass("file-row");
		file.htmlElement.addClass("file-row-selected");
		_selectedItems.push(file);
		
		return this;
	}
	
	/** get the selected files
	*@this {component.ui.fileDialog.dialog}
	*@public
	*@return {Array} of {{component.ui.fileDialog.dialog}}
	*/
	this.getSelections = function(){
		return _selectedItems;
	}
	
	/** Bind the event to dialog
	*@this {component.ui.fileDialog.dialog}
	*@public
	*@return this for chain.
	*/	
	this.bind = function(event,callback){
		_dialogElement.bind(event, {dialog: this}, callback);
	}
	
	/** Check if the ok button clicked.
	*@this {component.ui.fileDialog.dialog}
	*@public
	*@return {bool}.
	*/	
	this.isOkClicked = function(){
		return _isOKClicked;
	}
}

/** 
*@Constructor
*/
component.ui.fileDialog.fileObject = function(){
	/**@type {string} */
	this.id = "id";
	
	/**@type {string} */
	this.name = "folder";
	/**@type {component.ui.fileDialog.fileObject} */
	this.parent = null;
	
	/**@type {Array} */
	_children = [];
	
	/**@type {bool} */
	this.isChildrenPopulated = false;
	
	/**@type {bool} */
	this.isFolder = true;
	
	/**@type {string} */
	this.size = "-";
	
	/**@type {sting} */
	this.moddate = "unknown";
	
	/**@type {HTMLElement} */
	this.htmlElement = null;
	
	/** get children
	*@this {component.ui.fileDialog.fileObject}
	*@public
	*@return {Array} of {component.ui.fileDialog.fileObject}
	*/
	this.children = function(){
		return _children();
	}
	
	/** get the full name of the file
	*@this {component.ui.fileDialog.fileObject}
	*@public
	*@return {string} The format is "/root/directory/file"
	*/
	this.fullName = function(){
		var fullName = this.isFolder? "/" : "";
		var parent = this;
		while(parent){
			fullName = ("/" + parent.name +  fullName);
			parent=parent.parent;
		}
		
		return fullName;
	}
	
	/** append child
	*@this {component.ui.fileDialog.fileObject}
	*@public
	*@child {component.ui.fileDialog.fileObject}}
	*@return this for chain.
	*/
	this.appendChild = function (child){
		_children.push(child);
		if(child.parent != this){
			console.log("Warning: The parent is changed.");
			child.parent = this;
		}
		
		return this;
	}
}