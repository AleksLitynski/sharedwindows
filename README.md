Shared Windows
=============

Share a browsing experience.
----------------------------

#### What is it?

* Shared Windows is a list making tool with a few cool additions.
* Users can make lists and add textual items to lists. 
* Selecting an item will select that item for all users.
* If an item is a hyperlink, the content of the link is previewed.
* This means users can click through a series of images or web pages in unison.
* Posting one list into another makes for a "file directory"-esq experience.

#### How to use (pre-alpha):

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

`node server.js 8080`

---------------------------
#### Issues:

###### Database problems?
Create a fresh database. Go into `database/` and delete `db.sqlite`. Copy `dbClean.sqlite`, name it `db.sqlite`.

###### JSDOM issues on windows?
* JSDOM relies on contextify, which relies on node-gyp
* node-gyp notes: https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup