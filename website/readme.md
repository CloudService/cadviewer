
* Service home page
http://sw.ap01.aws.af.cm/

* Folder structure
website
 |-+ public (static resources)
 |-+ views (view template)
 |-- server.js
 |-- package.json
 |-- readme.md
 
* Deployment architecture
Web server. (Unit 1)
 Provide the UI
 Get the user authorization (access_token) for the her/his storage.
 Collect the translation options.
 
 Output:
 {
 	"storage-provider" : "box"
 	, "access-token" : "13a2234bed909234eacbbe"
 	, "source-file" : "robot/wheel.step"
 	, "destination-format": "dwf"
 	, "email-notification" : "user@gmail.com" 
 }
 
Assistant service. (Unit 2)
 Download file from cloud storage to local storage.
 Start the translation task.
 Upload the output file from local storage to cloud storage.
 Send email notification.

Translation worker. (Unit 3) 
 Read the source file and generate the destination file. (The input and output files are both on the local storage.)
 
 
* Dependency modules
** everyauth
There are defects in the latest version, consume the version "git://github.com/bnoguchi/everyauth.git#express3" instead.

This version still exists issue (https://github.com/bnoguchi/everyauth/issues/347) for the box.net. Fix it locally after installation.


* Autherization
** Box
The entry and callback paths are defined as below.
  .entryPath('/auth/box')
  .callbackPath('/auth/box/callback')
The HTML code "<a href='/auth/box'> Login box </a>" can start the auth process. 
Configure the box application. Set the Redirect URL to be /auto/box/callback, like http://localhost:3000/auth/box/callback.

