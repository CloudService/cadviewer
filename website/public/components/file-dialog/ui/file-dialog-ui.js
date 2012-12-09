// This file was automatically generated from file-dialog.soy.
// Please don't edit this file by hand.

if (typeof component == 'undefined') { var component = {}; }
if (typeof component.ui == 'undefined') { component.ui = {}; }
if (typeof component.ui.fileDialog == 'undefined') { component.ui.fileDialog = {}; }
if (typeof component.ui.fileDialog.template == 'undefined') { component.ui.fileDialog.template = {}; }


component.ui.fileDialog.template.filedialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="file-dialog"><div id="file-navigator">File navigator</div><div id="file-header" class="file-header"> </div><ul id = "file-list"></ul></div>');
  return opt_sb ? '' : output.toString();
};


component.ui.fileDialog.template.navigator = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t');
  var folderList6 = opt_data.folderPath;
  var folderListLen6 = folderList6.length;
  for (var folderIndex6 = 0; folderIndex6 < folderListLen6; folderIndex6++) {
    var folderData6 = folderList6[folderIndex6];
    output.append('<div id="', soy.$$escapeHtml(folderData6.id), '" class="file-navigator-item"> ', soy.$$escapeHtml(folderData6.name), '</div>', (! (folderIndex6 == folderListLen6 - 1)) ? '<div class="file-navigator-separator"> | </div>' : '');
  }
  return opt_sb ? '' : output.toString();
};


component.ui.fileDialog.template.fileheader = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t\t<div class="file-header-name-column" ><div data-area-name="name"> Name</div></div><div class="file-header-size-column"  data-area-name="size"> Size</div><div class="file-header-modification-date-column" data-area-name="midification-date"> Modification Date </div>');
  return opt_sb ? '' : output.toString();
};


component.ui.fileDialog.template.filerow = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li class="file-row" id="', soy.$$escapeHtml(opt_data.id), '"><div class="file-name-column" ><div class=" file-icon-thumbnail-spaceholder" data-area-name="thumbnail"><div class=" ', soy.$$escapeHtml(opt_data.thumbnail), '"></div></div><div class="file-name" data-area-name="name"> ', soy.$$escapeHtml(opt_data.name), '</div></div><div class="file-size-column"  data-area-name="size"> ', soy.$$escapeHtml(opt_data.size), ' </div><div class="file-modificaion-date-column" data-area-name="midification-date">', soy.$$escapeHtml(opt_data.moddate), ' </div></li>');
  return opt_sb ? '' : output.toString();
};
