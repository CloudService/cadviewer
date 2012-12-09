var express = require('express')
  , everyauth = require('everyauth')
  , conf = require('./conf')
  , request = require('request');

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

// This is called by the box.js to save the user
function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}


var usersByBoxId = {};


everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });


everyauth.box
  .apiKey(conf.box.apiKey)
  .findOrCreateUser( function (sess, authToken, boxUser) {
    return usersByBoxId[boxUser.user_id] ||
      (usersByBoxId[boxUser.user_id] = addUser('box', boxUser));
  })
  .redirectPath('/success');


var app = express();
app.use(express.static(__dirname + '/public'))
  .use(express.bodyParser())
  .use(express.cookieParser('htuayreve'))
  .use(express.session())
  .use(everyauth.middleware(app));

app.get('/debug', function (req, res) {
	var url = 'https://www.box.com/api/2.0/folders/0';
	var headers = {Authorization: "BoxAuth api_key=ujdb2e8pe3geqmkgm2fg66pg552dwl2f&auth_token=gymnnxkbxikj0jm6rz25cq4kwe8go808"};

	request.get({url:url, headers:headers}, function (e, r, body) {

	console.log(JSON.stringify(body));

	});
  res.send(__dirname);
});

app.get('/success', function (req, res) {
	//console.log(req.session.auth.box);
   var boxUser = JSON.stringify(req.session.auth.box);
  
  	var url = 'https://www.box.com/api/2.0/folders/0';
  	var apiKey = conf.box.apiKey;
  	var access_token = req.session.auth.box.authToken;//"gymnnxkbxikj0jm6rz25cq4kwe8go808";
	var headers = {Authorization: "BoxAuth api_key=" + apiKey + "&auth_token=" + access_token};

	request.get({url:url, headers:headers}, function (e, r, body) {
	
	/*
	The format of the return value is like.
"{
    "type": "folder",
    "id": "0",
    "sequence_id": null,
    "name": "AllFiles",
    "created_at": null,
    "modified_at": null,
    "description": null,
    "size": 0,
    "created_by": {
        "type": "user",
        "id": "185684932",
        "name": "transMr",
        "login": "3dcadtrans@gmail.com"
    },
    "modified_by": {
        "type": "user",
        "id": "185684932",
        "name": "transMr",
        "login": "3dcadtrans@gmail.com"
    },
    "owned_by": {
        "type": "user",
        "id": "185684932",
        "name": "transMr",
        "login": "3dcadtrans@gmail.com"
    },
    "shared_link": null,
    "parent": null,
    "item_status": "active",
    "item_collection": {
        "total_count": 2,
        "entries": [
            {
                "type": "folder",
                "id": "419345934",
                "sequence_id": "0",
                "name": "Web"
            },
            {
                "type": "folder",
                "id": "419345748",
                "sequence_id": "0",
                "name": "Robot"
            }
        ]
    }
}"
	*/
	
	var folderInfo = JSON.parse(body);
	var fileList = folderInfo.item_collection.entries;
	
	var subFiles = [];
	var length = fileList.length;
	for(var i = 0; i < length; ++i){
		var entry = fileList[i];
		var file = {};
		file.name=entry.name;
		file.isFolder = entry.type === "folder" ? true : false;
		subFiles.push(file);
	}

	//console.log(JSON.stringify(body));
	res.send(boxUser + "<br/><br/>" + JSON.stringify(headers) + "<br/><br/>"  + JSON.stringify(subFiles));

	});
	
});

app.listen(3000);

console.log('Go to http://local.host:3000');

module.exports = app;
