var port = process.argv[2] || 80;
console.log(port);

var staticServer = require("./webServer").run(port);

var persistantServer = require("./nodeServer").run(staticServer);

