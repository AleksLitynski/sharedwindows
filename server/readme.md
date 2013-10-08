Server structure:
=================

"Server.js" starts up two secondary servers. It takes a port as an argument.

### 1. web server.
Jquery is used to inject different titles into the same page. The certificates aren't used.
* `/lists/...` gets routed to webClient (or whatever you ser config.json to point to). 
* `/config`    gets a json with the internal ip address of the server. 
* `/` and `/lists/` both get re-routed to "/lists/global".
* `/upload` does nothing but will one day allow users to upload a file.
* `/files/...` will let users browse uploaded files.

### 2. node server. 
Once the client gets the page, this server keeps in touch. It latches onto the web server and shares a port. This is a socket.io server. It responds to:
> `"subscribe" : {latitude, longitude, list, post, to}` 
* `list`:  The current socket connection will hear about all new posts to this list. 
* `to`, `post`: Will post a message to "to" with the message of "post". Defaut website posts back to "recent"
* `latitude`, `longitude` : that lat/lng that will be posted somewhere
    
> `"unsubscribe" : {list}` 
* `list`: The list to stop recieving updates about.

> `"item" : {page, message, title, latitude, longitude}` 
* `page`: The page the new item is being posted to.
* `message`: The message to post. Often a URL
* `title`: The title of the page to post to. If not provided, the title of the page the "message" url points to will be used.
* `latitude`, `longitude` : that lat/lng that will be posted.

> `"index" : {page, index}` 
* `page`: The list whose index is changing.
* `index`: The new index of that list.

> `"moveItem" : {page, currentIndex, newIndex}` 
* `page`: The list whose item is being moved.
* `currentIndex`: The index of the item to move.
* `newIndex`: The index to move the item to.

> `"deleteItem" : {page, index}` 
* `page`: The list whose item is being deleted.
* `index`: The index of the item being deleted.

> `"pageTask" : {type, pageName}` 
* `type`: Can be either "touch" or "create". 
* `pageName`: The name of the page to check for or create.


##### Responses:

* "subscribe" -> `"items" : {page, data}` ->  `"index (or yourIndex)" : {page, data}`. It also may add an item. See response to "item"
* "item" -> `"items" : {page, data}`
* "index" ->  `"index (or yourIndex)" : {page, data}`
* "moveItem" ->  `"moveItem" : {page, from, to}`
* "deleteItem" ->  `"deleteItem" : {toDelete, soccess, page}`
* "pageTask" ->
    * `"touch": {type, reply}`. Reply is "safe" or "unsafe".
    * `"create": {type, created, pageName}`. created: true, false. pageName: name of page created.



### 3. config.json

* Not heavily used.
* Json formatted.
* Look inside. It has the location of a few resources.

## Structural Notes:

For those of you named Jon, here's a two second overview of web servers:
1. Client points web browser to our server.
2. Our "web server" code sends them back the code to run a shared windows client.
3. Their client reaches out to our "node server". They talk back and forth to keep all clients and the database in sync.
4. The database lives in a binary, sqlite file on the server. Talking to the "node server" is what allows the "web client" to populate itself initally.



