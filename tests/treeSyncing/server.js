var io      = require('socket.io').listen(10303, { log: false })
var fs      = require('fs');


io.sockets.on('connection', function (socket) {
   
   // socket.emit("change", {page: fs.readFileSync("thetree.txt", "utf8")});
   
    socket.on('change', function(data) {
       
        //console.log(JSON.stringify(data.page));
        
        fs.writeFile("thetree.txt", data.page, function(err) {}); 
        
        socket.broadcast.emit('change', data);
    });
    
    
    
});
