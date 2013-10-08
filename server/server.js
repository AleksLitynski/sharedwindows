//takes a port number as an argument or uses port 80.
var port = process.argv[2] || 80;
console.log(port);

//starts the web server.
var staticServer = require("./webServer").run(port);

//passes the web server to the node server so it can latch on.
var persistantServer = require("./nodeServer").run(staticServer);

