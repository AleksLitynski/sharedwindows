Shared Windows
=============

Share a browsing experience.
----------------------------

#### What is it?

* A list making tool,
* That can show you websites in the list,
* And synchronize that preview with all your friends!

#### What can you do with it?

* Share the web browser with your friends
* Present a slideshow over the internet
* Control what is displayed on many computers from a single computer
* Post lists to lists for a "file directory"-esq experience.

#### How to use it:

Got to : [Shared Windows Tutorial](https://sharedwindows.hackpad.com/How%2520to%2520Use%2520Shared%2520Windows#How-to-Use-Shared-Windows)

#### How to access it (pre-alpha):

Got to : [Shared Windows](http://www.sharedwindows.com)

Careful! It's fragile!

#### How to host your own:

###### Install prerequisites:
*  npm install sqlite3
*  npm install socket.io
*  npm install jsdom

<!--[  ]  npm install hackpad
    [  ]  npm install request-->

 
 
1. Open "sharedwindows/server/" in your command prompt.
2. run "node server.js"
3. The default port is 80 (http). To change that, use: "node server.js [http port]". 

> for example: `node server.js 8080`

---------------------------
#### Issues:

###### Database problems?
Create a fresh database. Go into `database/` and delete `db.sqlite`. Copy `dbClean.sqlite`, name it `db.sqlite`.

###### JSDOM issues on Windows?
* JSDOM can be very finiky. If npm cannot install it, work backwords. 
* JSDOM relies on [contextify](https://github.com/brianmcd/contextify), which relies on [node-gyp](https://github.com/TooTallNate/node-gyp).
* Helpful hints for node-gyp: https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup
