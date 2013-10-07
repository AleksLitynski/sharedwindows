sharedwindows
=============

###### Share a browsing experience. Great for file sharing too!


How to use (pre-pre-alpha):

###### Install prerequisites
*  npm install sqlite3
*  npm install socket.io
*  npm install jsdom

[ ]  npm install hackpad
[ ]  npm install request

To clean the database, 
copy database/dbClean.sqlite over db.sqlite (it should be named db.sqlite)
 
 
1. Open "sharedwindows/server/" in your command prompt.
2. run "node server.js"
3. The default port is 80 (http). To change that, use: "node server.js [http port]". 

> node server.js 8080



###### JSDOM issues on windows?

* JSDOM relies on contextify, which relies on node-gyp
* node-gyp notes: https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup