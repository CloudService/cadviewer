// This file was automatically generated from file-dialog.soy.
// Please don't edit this file by hand.

if (typeof component == 'undefined') { var component = {}; }
if (typeof component.ui == 'undefined') { component.ui = {}; }
if (typeof component.ui.fileDialog == 'undefined') { component.ui.fileDialog = {}; }
if (typeof component.ui.fileDialog.template == 'undefined') { component.ui.fileDialog.template = {}; }


component.ui.fileDialog.template.iframedialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="iframecodedlg"><textarea id="iframecode" readonly="readonly"> </textarea><p id ="indication">You can copy the above iframe code into your own webpage.<p/></div>');
  return opt_sb ? '' : output.toString();
};


component.ui.fileDialog.template.dashboardialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="samples"><div id="in_samples"><div id="sample1"><a ><img id ="computermouse" src="images/sample_mouse.png" border="0" class = "sample" /></a><a ><img id ="enginecaserear" src="images/sample_engine.png" border="0" class = "sample" /></a><a ><img id ="moto" src="images/sample_moto.png" border="0" class = "sample" /></a><a ><img id ="shaver02" src="images/sample_shaver.png" border="0" class = "sample" /></a></div><div id="sample2"></div></div></div>');
  return opt_sb ? '' : output.toString();
};


component.ui.fileDialog.template.filedialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="file-dialog"><div id="file-source">File Source</div><div id="file-navigator">File navigator</div><div id="file-header" class="file-header"> </div><ul id = "file-list"></ul></div>');
  return opt_sb ? '' : output.toString();
};


component.ui.fileDialog.template.navigator = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t');
  var folderList10 = opt_data.folderPath;
  var folderListLen10 = folderList10.length;
  for (var folderIndex10 = 0; folderIndex10 < folderListLen10; folderIndex10++) {
    var folderData10 = folderList10[folderIndex10];
    output.append('<div id="', soy.$$escapeHtml(folderData10.id), '" class="file-navigator-item"> ', soy.$$escapeHtml(folderData10.name), '</div>', (! (folderIndex10 == folderListLen10 - 1)) ? '<span class="file-navigator-separator">></span></span>' : '');
  }
  return opt_sb ? '' : output.toString();
};


component.ui.fileDialog.template.source = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<fieldset id = "sourceField"><legend>File Source</legend><ul><li><ul id="', soy.$$escapeHtml(opt_data.id), '"><li> <div> <img id = "box" class="provider-icon" src="images/box.png"/></div></li><li> <div> <img id = "dropbox" class="provider-icon" src="images/dropbox.png"/></div></li><li> <div> <img id = "baidu" class="provider-icon" src="images/baidu.png"/></div></li><li> <div> <img id = "a360" class="provider-icon" src="images/a360.png"/></div></li><li> <div> <img id = "qq" class="provider-icon" src="images/qq.png"/></div></li></ul></li></ul></fieldset>');
  return opt_sb ? '' : output.toString();
};


component.ui.fileDialog.template.sourceFile = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<ul id="storage-provider-list", id="', soy.$$escapeHtml(opt_data.id), '"><li><div class="sourcefile-thumbnail-spaceholder" data-area-name="source-thumbnail"><img class="', soy.$$escapeHtml(opt_data.thumbnail), '"></img></div></li></ul>');
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
