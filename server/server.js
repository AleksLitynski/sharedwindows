var port = process.argv[2] || 80;
console.log(port);

console.log("starting web server");
var staticServer = require("./webServer").run(port);

console.log("starting node server");
var persistantServer = require("./nodeServer").run(staticServer);


console.log("both up and running. Now looping forever");