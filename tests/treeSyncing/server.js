var io      = require('socket.io').listen(3303, { log: false })
var fs      = require('fs');


io.sockets.on('connection', function (socket) {
   
   // socket.emit("change", {page: fs.readFileSync("thetree.txt", "utf8")});
   
    socket.on('change', function(data) {
       
        //Impersistantconsole.log(JSON.stringify(data.page));
        console.log("data:");
        console.log(data);
        fs.writeFile("thetree.txt", data.page, function(err) {}); 
        
        socket.broadcast.emit('change', data);
    });
    
    
    
});
