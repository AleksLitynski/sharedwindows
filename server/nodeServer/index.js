exports.run = function(staticServer){
    console.log("loading pre reqs");
    var path    = require('path');
    console.log("socket latching onto server");
    var io      = require('socket.io').listen(staticServer, { log: true })  //10303              //require socketio and start it listening
    var fs      = require('fs');
    var jsdom   = require('jsdom');
    var jquery  = fs.readFileSync(path.resolve(__dirname, './jquery.js'), "utf-8");
    var url     = require('url');
    
    var config  = JSON.parse(fs.readFileSync((path.resolve(__dirname, '../config.json'))));
    var sqlite3 = new require('sqlite3').verbose();
    var db      = new sqlite3.Database('../' + config.databaseFile);

    console.log("node server loading done");
    io.sockets.on('connection', function (socket) {                 //when somebody connects...
        
        
        socket.on('subscribe', function(data) {                     //Client tells you the lists it wants to know about
            emitItems(socket, data.list, 0);                        //Send it it's items
            emitIndex(socket, data.list);                           //send it it's index
            socket.join(data.list);

            //post recent activity to the "recent" list
            //insert into lists (createdOn, createdBy, currentListId, name) values (1376507099,"129.21.142.144",0, "recent");
            var item = {latitude: data.latitude, longitude: data.longitude, message: data.post, title: data.post};
            addItem(socket, data.to, item);
            
        });
        socket.on('unsubscribe', function(data) {
            socket.leave(data.list);
        });
        
        socket.on('items', function (data) {                        //when you are told about an item
                addItem(socket, data.page, data);                              
        });
        socket.on('index', function (data) {                        //when you are told about an index
                storeIndex(socket, data.page, data.index);
        });
        socket.on('moveItem', function (data) {
            moveItem(socket, data.page, data.currentIndex, data.newIndex);
        });
        
        socket.on('deleteItem', function(data) {
            deleteItem(socket, data.page, data.index);
        });
        
        socket.on('pageTask', function(data) {
            pageTask(socket, data);
        });
        
    });

    function emitItems(socket, list, start) {
        db.serialize(function() {
            var query = "select * from items where listId = (select id from lists where name = '"+list+"') and listIndex > "+start+";";
            db.all(query, function(err, row)
            {
                socket.emit('items', {page:list, data:row});
            });
        });
    }

    var waitingToAdd = [];
    //item.message, 
    function addItem(socket, list, item) {
        //check if entry already exists. If it does, move it to the top. Else, add the new item.
        if(!waitingToAdd.some(function(e,i){return (e.list == list && e.item == item.message)})){
            //console.log(item);

            db.serialize(function() {
                var query = "select listIndex from items where url = '"+item.message+"' and listId = (select id from lists where name = '"+list+"')";
                db.all(query, function(err, data){
                    //remove entry from waiting to add
                    for(var i = 0; i < waitingToAdd.length; i++){
                        if(waitingToAdd[i].list == list && waitingToAdd[i].item == item.message){
                            waitingToAdd.splice(i, 1);
                            break;
                        }
                    }
                    if(data.length > 0){
                        //move the item
                        db.all("select id from items where listId = (select id from lists where name = '"+list+"')", function(err, dataTwo){
                            moveItem(socket, list, data[0].listIndex, dataTwo.length);//or 1?
                        });
                    } else {
                        //add the item
                        addNewItem(socket, list, item);
                    }
                
                });
            });
        }
        waitingToAdd.push({list:list, item:item.message});

        function addNewItem(socket, list, item){
            //detect and prevent user from posting list to itself. If "lists" in in the message and the next term matches var list, it will reject the whole shenangan.
            var itemAsUrl = item.message.split("/");
            if(itemAsUrl.length > 3){
            var iii = itemAsUrl.indexOf("lists");
            if(iii > -1){
            var ii = iii + 1;
            if(itemAsUrl.length >= ii){
            if(list == itemAsUrl[ii].split("\n")[0]){
            return false;
            }}}}
            function addItemFromParams(user, title, icon) {
            
                var time  = new Date().getTime();
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
                                        
                    db.run("BEGIN TRANSACTION;");
                    db.run(query);
                    db.all("select * from items where id = (select MAX(id) from items) and listId = (select id from lists where name = '"+list+"');", function(err, data){
                        
                        socket.broadcast.to(list).emit('items', {page:list, data:data});
                        socket.emit('items', {page:list, data:data});
                    });
                    db.run("COMMIT TRANSACTION;");
                });
            
            }
            
            try {
                jsdom.env(
                    url.parse(item.message.replace("\n", ""), true).href, [url.parse("http://code.jquery.com/jquery.js").href],
                    function (errors, window) {
                        var title = "" + item.message + "";
                        var icon = "about:blank";

                        if(window != undefined){ if(window.$ != undefined){ if(window.$("title").html() != undefined) {
                            console.log(item.title);
                            if(!item.title || item.title == item.message){
                                console.log(sql_escape(window.$("title").html()));
                                title = sql_escape(window.$("title").html());
                                console.log(title);
                            } else {
                                title = item.title;
                            }
                            icon  = url.parse(item.message).protocol + "//" + url.parse(item.message).host + "/favicon.ico";
                        } } }
                        
                        var user = "";
                        try{
                            user  = socket.handshake.address.address + ":" + socket.handshake.address.port;
                        } catch(e){
                            user = "";
                        }
                        addItemFromParams(user, title, icon);
                    }
                );
            }
            catch(er){
                var title = "" + item.message + "";
                if(item.title){
                    title = item.title;
                }
                var icon = "about:blank";
               
                var user  = socket.handshake.address.address + ":" + socket.handshake.address.port;
                addItemFromParams(user, title, icon);
            }
        }
        
    }

    function storeIndex(socket, list, index) {
        db.serialize(function() {
        
            var query = "update lists set currentListId = "+index+" where name = '"+list+"';";
            db.all(query, function(err, row){
                emitIndex(socket, list);
            });
        });
    }

    function emitIndex(socket, list) {
         db.serialize(function() {
        
            var query = "select currentListId, name from lists where name = '"+list+"';";
            db.all(query, function(err, row){ //Message goes out to everyone, not just people connected to the current page.
                //socket.emit('index', {page:list, data:row} );
                socket.emit('yourIndex', {page:list, data:row} );
                socket.broadcast.to(list).emit('index', {page:list, data:row} );
            });
        });
    }

    function moveItem(socket, page, currentIndex, newIndex) {
        //console.log(socket, page, currentIndex, newIndex);
        //1) set the new index
        //2) set the element at that index and all future elements to +1
        db.serialize(function() {
            db.run("BEGIN TRANSACTION;");
            db.run("drop table if exists oldId;");
            db.run("create temp table oldId (value integer primary key);");
            db.run("insert into oldId (value) values ( (select id from items where listIndex = "+currentIndex+"  and listId = (select id from lists where name = '"+page+"')) );");
            var rising = currentIndex > newIndex;
            if(rising) {
                db.run(" update items set listIndex = listIndex + 1 "
                  +  " where listIndex  <= " + currentIndex + " - 1 "
                  +  " and   listIndex  >= " + newIndex 
                  +  " and listId = (select id from lists where name = '"+page+"');");
            }
            else { 
                db.run(" update items set listIndex = listIndex - 1 "
                  +  " where listIndex  >= " + currentIndex + " + 1 "
                  +  " and   listIndex  <= " + newIndex 
                  +  " and listId = (select id from lists where name = '"+page+"');");
            }
            
            db.run(" update items set listIndex = " + newIndex          //<---- set current index to new index.
                       +  " where id = (select * from oldId)" 
                       +  " and listId = (select id from lists where name = '" + page + "');");
            db.run("COMMIT TRANSACTION;");
            
            var toSend = { from: currentIndex, to: newIndex, page:page};
            socket.broadcast.to(page).emit('moveItem', toSend );
            socket.emit('moveItem', toSend );
        });
    }




    function pageTask(socket, data) {
        if(data.type == "touch") {
            isNameSafe(data.pageName, function(isSafe){
                        socket.emit('pageTask', {type: data.type,
                                                 reply: isSafe });
                });    
        }
        if(data.type == "create") {
            isNameSafe(data.pageName, function(isSafe){
                if(isSafe == "safe"){
                    db.serialize(function() {
                        var time  = new Date().getTime();
                        var user  = socket.handshake.address.address + ":" + socket.handshake.address.port;
                        db.serialize(function(){
                            db.run("insert into lists (createdOn, createdBy, currentListId, name) values ("+time+", '"+user+"', 0, '"+data.pageName+"');", function(){
                                socket.emit('pageTask', {type:data.type,
                                                            created:true,
                                                            pageName:data.pageName} );
                            });
                        });
                    });
                    //create the page
                } else {
                    //don't create the page
                    socket.emit('pageTask', {type:data.type, created:false, pageName:data.pageName} );
                }
            });
        }
    }


    function isNameSafe(name, callback) {
        if(  /^[a-z0-9]+$/i.test( name ) ){
            db.serialize(function() {
                db.all("select * from lists where name = '" + name + "';", function(err, databaseReply){
                    var replyData = "safe";
                    if(databaseReply.length != 0){ 
                        replyData = "unsafe";
                    }
                    callback(replyData);
                });
            });
        }
        callback("unsafe");
    }


    
    function deleteItem(socket, list, toDelete) {
        if(isNaN(toDelete)) {
            socket.emit("deleteItem", {toDelete: toDelete, success: false});
        } else {
            
            db.serialize(function() {
            db.run("BEGIN TRANSACTION;");
            db.run("delete from items where listIndex = "+toDelete+" and listId = (select id from lists where name = '"+list+"');");
            db.run("update items set listIndex = listIndex - 1 where listIndex > "+toDelete+" and listId = (select id from lists where name = '"+list+"');");
            db.run("COMMIT TRANSACTION;");
            });
            
            socket.emit("deleteItem", {toDelete: toDelete, success: true, page:list});
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