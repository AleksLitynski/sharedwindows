var io      = require('socket.io').listen(10303, { log: false })                //require socketio and start it listening
var fs      = require('fs');
var config  = JSON.parse(fs.readFileSync('../config.json'));
var sqlite3 = new require('sqlite3').verbose();
var db      = new sqlite3.Database('../' + config.databaseFile);


io.sockets.on('connection', function (socket) {                 //when somebody connects...
    socket.on('disconnect', function() {
        //db.close();
    });
    
    socket.on('page', function(data) {                          //Client tells you it's current list name
        emitItems(socket, data.list, 0);                        //Send it it's items
        emitIndex(socket, data.list);                           //send it it's index
        socket.set("page", data.list);
    });
    
    socket.on('items', function (data) {                        //when you are told about an item
                socket.get("page", function(err, val){          //store the new item
                    addItem(socket, val, data);
                });                              
            });
    socket.on('index', function (data) {                        //when you are told about an index
                socket.get("page", function(err, val){
                    storeIndex(socket, val, data.index);
                });
            });
    socket.on('moveIndex', function (data) {
                socket.get("page", function(err, val){
                    moveItem(socket, val, data.currentIndex, data.newIndex);
                }); 
            });
    
    
});

function emitItems(socket, list, start) {
    db.serialize(function() {
        var query = "select * from items where listId = (select id from lists where name = '"+list+"') and listIndex > "+start+";";
        db.all(query, function(err, row)
        {
            socket.emit('items', row);
        });
    });
}

function addItem(socket, list, item) {
    
    
    db.serialize(function() {
    
        var time = new Date().getTime();
        
        
        socket.get("page", function(err, val){
            var query = "insert into items(createdOn, createdBy, latitude, longitude, url, title, thumbnail, listId, listIndex) values (" +
                                time+","+
                                "'someone',"+
                                item.latitude+", "+item.longitude+","+
                                "'"+item.message+"',"+
                                "'the title',"+
                                "'none',"+
                                "(select id from lists where name = '"+val+"'),"+
                                "((SELECT MAX(listIndex) FROM items) + 1)"+
                                ");";
            db.run(query, function(){
                var query = "select";
                db.all(query, function(err, val){
                    console.log(val);
                    socket.broadcast.emit('items', {0 : {
                                                    url : item.message  //upgrade to include all fields
                                                }} );
                    socket.emit('items', {0 :   {
                                            url : item.message
                                        }} );
                });
            });
        });
    });
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
    
        var query = "select currentListId from lists where name = '"+list+"';";
        db.all(query, function(err, row){
            socket.emit('index', row );
            socket.broadcast.emit('index', row );
        });
    });
}

function moveItem(socket, page, currentIndex, newIndex) {
    console.log(page, currentIndex, newIndex);
    
    //1) set the new index
    //2) set the element at that index and all future elements to +1
    var query = "";
    
    
    var rising = currentIndex > newIndex;
    if(rising) {
        for(var i = currentIndex - 1; i >= newIndex; i--) {
            at(i) = at(i) + 1;
        }
        currentIndex = newIndex;
    }
    else { //falling
        for(var i = currentIndex + 1; i <= newIndex; i++) {
            at(i) = at(i) - 1;
        }
        currentIndex = newIndex;
    }
    
    
    
    socket.broadcast.emit('moveIndex', {0 : {
                            one : "two"
                        }} );
    socket.emit('moveIndex', {0 :   {
                            one : "two"
                        }} );
} 

//able to choose your own page

//display/check for xFrame error //display text //provide a placeholder until the page loads

/*

    socket.on('checkXFrame', function (data) {
                socket.broadcast.emit('formData', data);
            });
*/