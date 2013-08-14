var io = require('socket.io').listen(10303)                     //require socketio and start it listening

io.sockets.on('connection', function (socket) {                 //when somebody connects...

    
    socket.on('page', function(data) {                          //Client tells you it's current list name
        socket.emit('items', loadItemsFrom(data.list, 0) );     //Send it it's items
        socket.emit('index', getIndex(data.page) );             //send it it's index
    }
    
    socket.on('items', function (data) {                        //when you are told about an item
                                                                //store the new item
                
                                                                //broadcast the new item
                socket.broadcast.emit('items', data);
            });
    socket.on('index', function (data) {                        //when you are told about an index
                                                                //store the index
                                                                //broadcast the index
                socket.broadcast.emit('index', data);
            });
    
    
});



function loadItemsFrom(list, start) {
    return { 0 : {
                            createdOn: "1376496660",
                            createdBy: "129.21.142.144",
                            latitude : "0",
                            longitde : "0",
                            url      : "hello!",
                            title    : "hello",
                            thumbnail: "afas;klkl;gdj;lkghsd;ghaoihw"                                    
                        },
                    1 : {
                            createdOn: "1376496660",
                            createdBy: "129.21.142.144",
                            latitude : "0",
                            longitde : "0",
                            url      : "hello!",
                            title    : "hello",
                            thumbnail: "afas;klkl;gdj;lkghsd;ghaoihw"                                    
                        }
                 };
}

function getIndex(list) {
    return {index: 0};
}


//set/get post
//set/get index


//display/check for xFrame error
//display text
//provide a placeholder until the page loads

/*

    socket.on('checkXFrame', function (data) {
                socket.broadcast.emit('formData', data);
            });
*/