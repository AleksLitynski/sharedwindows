var port = process.argv[2] || 80;
console.log(port);

var securePort = process.argv[3] || 443;
console.log(securePort);

var staticServer = require("./webServer").run(port, securePort);
var persistantServer = require("./nodeServer").run(staticServer);
