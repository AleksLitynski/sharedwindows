//exports a "run function. Takes a ref to a server it can latch onto"
exports.run = function(staticServer){
    var path    = require('path');
    var io      = require('socket.io').listen(staticServer, { log: false })  //start the server attached to the "static Server". Set log to true if you want logs.
    var fs      = require('fs');//file system
    var jsdom   = require('jsdom');
    var jquery  = fs.readFileSync(path.resolve(__dirname, './jquery.js'), "utf-8"); //not used. Didn't work. Had to load from jquery.com
    var url     = require('url');
    
    var config  = JSON.parse(fs.readFileSync((path.resolve(__dirname, '../config.json')))); //config file
    var sqlite3 = new require('sqlite3').verbose(); //sqlite lite errors will be verbose or something
    var db      = new sqlite3.Database('../' + config.databaseFile);

    io.sockets.on('connection', function (socket) {                 //when somebody connects...
        
        
        socket.on('subscribe', function(data) {                     //Client tells you the lists it wants to know about
            emitItems(socket, data.list, 0);                        //Send it it's items
            emitIndex(socket, data.list);                           //send it it's index
            socket.join(data.list);

            //post recent activity to the "recent" list. Or, whatever list they tell you to post "to"
            //insert into lists (createdOn, createdBy, currentListId, name) values (1376507099,"129.21.142.144",0, "recent"); <- thinking out loud
            var item = {latitude: data.latitude, longitude: data.longitude, message: data.post, title: data.post};
            addItem(socket, data.to, item);
            
        });
        socket.on('unsubscribe', function(data) { //stop getting updates on a list. The sub/unsub are only relevent when using "tree view". You have multiple lists on one page.
            socket.leave(data.list);
        });
        
        socket.on('items', function (data) {                        //when you are told about a new item, add the item.
                addItem(socket, data.page, data);                              
        });
        socket.on('index', function (data) {                        //when you are told an index has changed, store the changed index.
                storeIndex(socket, data.page, data.index);
        });
        socket.on('moveItem', function (data) {                     //when an item is moved... 
            moveItem(socket, data.page, data.currentIndex, data.newIndex);
        });
        
        //WHEN STUDYING THE CODE, look at delete first. Its simple, but covers everything the rest do. Add is paticularly ugly. Just look over delete to get the idea.
        socket.on('deleteItem', function(data) {                    //etc
            deleteItem(socket, data.page, data.index);
        });
        
        socket.on('pageTask', function(data) {                      //covers both checking if a page exists and making new pages. See "pageTask"
            pageTask(socket, data);
        });
        
    });

    //gets the list and sends it out. If I were rewriting this, I wouldn't just send the whole row. I would parse out what I actually need.
    function emitItems(socket, list, start) {
        db.serialize(function() {
            var query = "select * from items where listId = (select id from lists where name = '"+list+"') and listIndex > "+start+";";
            db.all(query, function(err, row)
            {
                socket.emit('items', {page:list, data:row});
            });
        });
    }

    //This is a long function. here's what it does:
    /*
        1. escape the message/title.
        2. If the item isn't already queued to be added, queue it and begin adding it.
        3. Check if the item is in the DB.
        3a. If it is, move it to the top.
        3b. If not, add it.
        4. Adding it:

    */
    //all items "waiting to be added". A holding cell for network traffic while waiting on the DB.
    var waitingToAdd = []; //global. 
    function addItem(socket, list, item) {
       
        //escape the message. This is what breaks certain urls. Also, keeps server from crashing on sqlite
        item.message = sql_escape(item.message);
        item.title = sql_escape(item.title) || undefined;
 
       

        //check if entry already exists. If it does, move it to the top. Else, add the new item.
        if(!waitingToAdd.some(function(e,i){return (e.list == list && e.item == item.message)})){ //if waitingToAdd doesn't contain this item
            
            db.serialize(function() {
                var query = "select listIndex from items where url = '"+item.message+"' and listId = (select id from lists where name = '"+list+"')";
                db.all(query, function(err, data){ //check if the message is already in the database
                    
                    for(var i = 0; i < waitingToAdd.length; i++){   //remove entry from waiting to add
                        if(waitingToAdd[i].list == list && waitingToAdd[i].item == item.message){
                            waitingToAdd.splice(i, 1);
                            break;
                        }
                    }
                    if(data.length > 0){ //if the item is already in the database, just move it to the front
                        //move the item
                        db.all("select id from items where listId = (select id from lists where name = '"+list+"')", function(err, dataTwo){
                            moveItem(socket, list, data[0].listIndex, dataTwo.length);
                        });
                    } else { //add the item, as it isn't in the list yet
                        addNewItem(socket, list, item);
                    }
                
                });
            });
        }
        waitingToAdd.push({list:list, item:item.message}); //add this item to waiting to add

        //from here on, its another function. The "true" add function.
        function addNewItem(socket, list, item) {

            //detect and prevent user from posting list to itself. If "lists" in in the message and the next term matches var list, it will reject the whole shenangan.
            var prequery = item.message.split("?")[0]; //only take things before the query (sometimes, the current list could be a parameter of the post, but not the target)
            var itemAsUrl = prequery.split("/");
            if(itemAsUrl.length > 3){
                var iii = itemAsUrl.indexOf("lists");
                if(iii > -1){
                    var ii = iii + 1;
                    if(itemAsUrl.length >= ii){
                        if(list == itemAsUrl[ii].split("\n")[0]){
                            console.log(item.message);
                            return false;
                        }
                    }
                }
            }

            //this will be called from below. It adds an item once we are certain of certain parameters (ie: must look up a title still)
            function addItemFromParams(user, title, icon) { //relies on closure to collect the item values like longitude, etc.
            
                var time  = new Date().getTime(); //get the time.
                

                db.serialize(function() {
                    var query = "insert into items(createdOn, createdBy, latitude, longitude, url, title, thumbnail, listId, listIndex) values (" +
                                        time+","+
                                        "'"+user+"',"+
                                        item.latitude+", "+item.longitude+","+
                                        "'"+item.message+"',"+
                                        "'"+ title +"',"+
                                        "'"+icon +"',"+
                                        "(select id from lists where name = '"+list+"'),"+
                                        "("+
                                            "(SELECT CASE "+
                                               " WHEN ( (SELECT MAX(listIndex) FROM items WHERE listId = (select id from lists where name = '"+list+"') ) IS NULL )"+
                                               " THEN 1 "+
                                              "  ELSE (SELECT MAX(listIndex) FROM items WHERE listId = (select id from lists where name = '"+list+"') ) + 1"+
                                           " END)"+
                                       " )"+
                                        ");";
                                        
                    db.run("BEGIN TRANSACTION;"); // the query is transactional. I want to post the item and get its location without being interupted, otherise, things will go out of wack.
                    db.run(query);
                    db.all("select * from items where id = (select MAX(id) from items) and listId = (select id from lists where name = '"+list+"');", function(err, data){
                        
                        socket.broadcast.to(list).emit('items', {page:list, data:data}); //once I get the new item, send it out to everybody.
                        socket.emit('items', {page:list, data:data});
                    });
                    db.run("COMMIT TRANSACTION;");
                });
            
            }
            
            try { //jsdom is finiky, and may fail.
                jsdom.env(
                    url.parse(item.message.replace("\n", ""), true).href, [url.parse("http://code.jquery.com/jquery.js").href], //get the url and inject jquery.
                    function (errors, window) {
                        var title = "" + item.title + ""; //set the title to the message
                        var icon = "about:blank";           //set the icon to blank

                        if(window != undefined){ if(window.$ != undefined){ if(window.$("title").html() != undefined) { //if here is an html body and jquery loaded correctly
                            if(!item.title || item.title == item.message){ //if there is not title, or the title is just the message...
                                title = sql_escape(window.$("title").html());
                            } else {
                                title = item.title; //if there is a title, keep the title
                            }
                            icon  = url.parse(item.message).protocol + "//" + url.parse(item.message).host + "/favicon.ico"; //the favicon link
                        } } }
                        
                        var user = "";
                        try{
                            user  = socket.handshake.address.address + ":" + socket.handshake.address.port; //the socket and port the user connected from
                        } catch(e){
                            user = ""; //otherwise, leave the user blank
                        }
                        addItemFromParams(user, title, icon); //add the item with the harvested data
                    }
                );
            }
            catch(er){ 
                var title = "" + item.message + ""; //error? Just use defaults
                if(item.title){
                    title = item.title;
                }
                var icon = "about:blank";
               
                var user  = socket.handshake.address.address + ":" + socket.handshake.address.port; //why don't I catch it here, but I do above?
                addItemFromParams(user, title, icon); //and add the item
            }
        }
        
    }

    //Set the index of a given list
    function storeIndex(socket, list, index) {
        db.serialize(function() {
        
            var query = "update lists set currentListId = "+index+" where name = '"+list+"';";
            db.all(query, function(err, row){
                emitIndex(socket, list); //send the index out to the world
            });
        });
    }
    //sends out an index
    function emitIndex(socket, list) {
         db.serialize(function() {
        
            var query = "select currentListId, name from lists where name = '"+list+"';"; //get the index for the list
            db.all(query, function(err, row){
                //socket.emit('index', {page:list, data:row} );
                socket.emit('yourIndex', {page:list, data:row} ); //send a "yourIndex" message to the person who initally posted it. This is so they can know to jump to it, even if they have "follow the leader" turned off.
                socket.broadcast.to(list).emit('index', {page:list, data:row} ); //only tell people connected to the list
            });
        });
    }

    //move an item. Complicated algorithm (not really. Sort of)
    function moveItem(socket, page, currentIndex, newIndex) {
        db.serialize(function() {
            db.run("BEGIN TRANSACTION;");
            // store the intial index in "oldId"
            db.run("drop table if exists oldId;");
            db.run("create temp table oldId (value integer primary key);");
            db.run("insert into oldId (value) values ( (select id from items where listIndex = "+currentIndex+"  and listId = (select id from lists where name = '"+page+"')) );");
            //check if its moving up in the list
            var rising = currentIndex > newIndex;
            if(rising) { //if rising, move all items between here and there by 1. Fun fact, it is hard to grahpically move an item more than ~10 elements. Makes this easier, I guess?
                db.run(" update items set listIndex = listIndex + 1 "
                  +  " where listIndex  <= " + currentIndex + " - 1 "
                  +  " and   listIndex  >= " + newIndex 
                  +  " and listId = (select id from lists where name = '"+page+"');");
            }
            else { //same thing, but move them down
                db.run(" update items set listIndex = listIndex - 1 "
                  +  " where listIndex  >= " + currentIndex + " + 1 "
                  +  " and   listIndex  <= " + newIndex 
                  +  " and listId = (select id from lists where name = '"+page+"');");
            }
            //move the item to its new loaciton. Find the item based on that 'old index' you stored. 
            //Why store old index? Once you shift all those elements, two items will be in the "currentIndex" location. There are two "indexs", the location index and the item index. Only the location index changes, so we can use item index as a permenent reference.
            db.run(" update items set listIndex = " + newIndex          //<---- set current index to new index.
                       +  " where id = (select * from oldId)" 
                       +  " and listId = (select id from lists where name = '" + page + "');");
            db.run("COMMIT TRANSACTION;");
            
            //send off where the item was moved to.
            var toSend = { from: currentIndex, to: newIndex, page:page};
            socket.broadcast.to(page).emit('moveItem', toSend );
            socket.emit('moveItem', toSend );
        });
    }



    //this bundles two opperations into a single socket action.
    function pageTask(socket, data) {
        if(data.type == "touch") {  //touch means "touch the name", check if it is going to be a valid name, but don't do anything with it.
            isNameSafe(data.pageName, function(isSafe){ 
                        socket.emit('pageTask', {type: data.type,
                                                 reply: isSafe });
                });    
        }
        if(data.type == "create") { //the user wants to create a list.
            isNameSafe(data.pageName, function(isSafe){ //check if its safe. If it is:
                if(isSafe == "safe"){ 
                    db.serialize(function() {
                        var time  = new Date().getTime();
                        var user  = socket.handshake.address.address + ":" + socket.handshake.address.port;
                        db.serialize(function(){ //add a new item to the pages page.
                            db.run("insert into lists (createdOn, createdBy, currentListId, name) values ("+time+", '"+user+"', 0, '"+data.pageName+"');", function(){
                                socket.emit('pageTask', {type:data.type, //tell the user it was created. Only tell the user who asked for it.
                                                            created:true,
                                                            pageName:data.pageName} );
                                //add the starter two posts (about and qr code)

                                var hackpadAddress = "https://sharedwindows.hackpad.com/about-" + data.pageName ;
                                var qrAddress = "http://chart.apis.google.com/chart?cht=qr&chs=300x300&chl=" + data.domainName.split("lists/")[0] + "lists/" + encodeURIComponent(data.pageName) ;
                                allOverTown = qrAddress;
                                serverAddItem(hackpadAddress, "About");
                                serverAddItem(qrAddress, "QR Code");
                                function serverAddItem(_msg, _title){
                                    var item = {latitude: 0, longitude: 0, message: _msg, title: _title};
                                    addItem(socket, data.pageName, item);
                                }
                            });
                        });
                    });
                } else {
                    //don't create the page
                    socket.emit('pageTask', {type:data.type, created:false, pageName:data.pageName} ); //tell the user it couldn't be created. They should have checked via touch.
                }
            });
        }
    }

    //the callback is pass a string "safe" or "unsafe". Is the transaction safe?
    function isNameSafe(name, callback) {
        if(  /^[a-z0-9]+$/i.test( name ) ){ //make sure it has valid characters
            db.serialize(function() {
                db.all("select * from lists where name = '" + name + "';", function(err, databaseReply){ //make sure it doesn't already exist
                    var replyData = "safe";
                    if(databaseReply.length != 0){ 
                        replyData = "unsafe";
                    }
                    callback(replyData);
                });
            });
        }
        callback("unsafe");//this probably should be in a catch or something. I think we're always reporting "unsafe" before safe is reported. Not sure.
    }


    //remove an item from a list
    function deleteItem(socket, list, toDelete) { 
        if(isNaN(toDelete)) {
            socket.emit("deleteItem", {toDelete: toDelete, success: false}); //if they don't send you a number, tell em' it didn't work
        } else {
            
            db.serialize(function() {
            db.run("BEGIN TRANSACTION;"); //start the transaction.
            db.run("delete from items where listIndex = "+toDelete+" and listId = (select id from lists where name = '"+list+"');"); //delete the item
            db.run("update items set listIndex = listIndex - 1 where listIndex > "+toDelete+" and listId = (select id from lists where name = '"+list+"');"); //fix everyone after its index. Man, this is why linked lists were created.
            db.run("COMMIT TRANSACTION;");
            });
            
            socket.emit("deleteItem", {toDelete: toDelete, success: true, page:list}); //tell everyone who cares what happened.
            socket.broadcast.to(list).emit("deleteItem", {toDelete: toDelete, success: true, page:list});
        }
    }   

    //an incomplete fix, at best. Used when posting to verify post names.
    //I never really got into verifying content like I should have.
    //http://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly
    function sql_escape (str) {
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"": return "";
                case "'": return "";
                case "\\": return "\\"+char;
                case "%":
                    return "\\"+char; // prepends a backslash to backslash, percent,
                                      // and double/single quotes
            }
        });
    }
}