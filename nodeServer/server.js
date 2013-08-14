var io = require('socket.io').listen(10303)                     //require socketio and start it listening

io.sockets.on('connection', function (socket) {                 //when somebody connects...

    //send them all current posts
    socket.emit('items', { 0 : {
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
                         });
    //send them the current index
    socket.emit('index', { index : 0});
    
    socket.on('items', function (data) {
                //store the new item
                //broadcast the new item
                socket.broadcast.emit('items', data);
            });
    socket.on('index', function (data) {
                //store the index
                //broadcast the index
                socket.broadcast.emit('index', data);
            });
    
    
});



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