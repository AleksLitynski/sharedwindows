//exports a run function. Called to start the server.
exports.run = function(port) {
    //imports a few things...
    var path = require('path');
    var https = require('https');
    var http = require('http');
    var querystring = require('querystring');
    var fs = require('fs');
    var url = require('url');
    var config  = JSON.parse(fs.readFileSync((path.resolve(__dirname, '../config.json')))); //import the config file
    var sqlite3 = new require('sqlite3').verbose(); //don't remember what verbose means... Probably better error messages.
    var db      = new sqlite3.Database('../' + config.databaseFile);

    var jsdom   = require('jsdom');
    var jquery  = fs.readFileSync(path.resolve(__dirname, './jquery.js'), "utf-8"); //loads jquery. Pretty sure it isn't used (loaded from jquery.com)
    var url     = require('url');

    var options = {
      key: fs.readFileSync((path.resolve(__dirname, 'privatekey.pem'))),    //private keys also aren't used. too bad.
      cert: fs.readFileSync((path.resolve(__dirname, 'certificate.pem')))
    };

    var webServer = http.createServer(handleRequest).listen(port); //starts the server.


    function handleRequest(req, res)  { //function called every time someone contacts the server

        var uriPath = uriToArray(url.parse(req.url).pathname);  //the uri path as an array


        if( uriPath.length == 0 ) { //if there is no path, send the to the "global" list
            redirectToGlobal(res);
            return;
        }
        
        

        if(uriPath[0] == "lists" && uriPath.length > 1)  {
            if(uriPath.length == 2) {   //if they are loading a list (ie: lists/something)
                serveSinglePage(uriPath[1], res);   //serve them the itial html
                return;
            } else {
                uriPath.shift();    //remove the word "list" from the path. Its a css file or something. It'll be loaded below.
            }
        } else {
            if(uriPath[0] == "lists") redirectToGlobal(res, req);   //if they only ask for "lists" (with no list name), send them to "global"
        }

        var html = "file not found"; //prepare a body message
        try {
            
            var lastPathList = uriPath[uriPath.length-1].split(".");
            var type = lastPathList[lastPathList.length-1];
            
            var n = true;
            if(type == "js"){   //set tghe content types
                res.writeHead(200, {"Content-Type": "application/javascript"}); n = false;
            }
            if(type == "css"){
                res.writeHead(200, { "Content-Type": "text/css"}); n = false;
            }
            if(type == "jpg" || type == "gif" || type == "png" || type == "ico"){
                res.writeHead(200, {"Content-Type": "image/png"}); n = false;
            } 
            if(n){
                res.writeHead(200); //if a content type wasn't found, write a header anyways.
            }
            //res.setHeader('Access-Control-Allow-Origin','*');
            
            switch (uriPath[0]){    //a few special case url (for uploads, or the config file)
                case "config":
                    var clientConfig = {};
                    clientConfig.webSocketServer = getAddresses()[0] + ":" + port; //send back simple json with the machine address
                    res.write( JSON.stringify(clientConfig) );
                    res.end(); 
                break;
                case "upload":  //doesn't work. It WILL allow users to upload files
                    
                    postRequest(req, res, function(data) {
                        var name = querystring.parse(data).name;
                        console.log(name);
                        fs.writeFile("testytesty.jpg", data, {encoding:'binary' }, function(err) {}); 

                        res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                        res.write("doing it");
                        res.end();

                    });

                    
                break;
                case "file":    //Goes to the hostedFiles folder to return the file the user asked for
                    var file = fs.readFileSync( "../" + config.database + "hostedFiles/" + lastPathList.join(".") ); //http://129.21.142.18/file/testy.jpg
                    res.write(file);
                    res.end();  
                break;

                default: //if its the placeholder page, send them the placeholder.html
                    var html = fs.readFileSync("../" + config.webClientLoc + uriPath.join("/") );

                    if(uriPath[0].split(".")[0] == "placeholder"){
                        var newPage = url.parse(req.url, true).query.newPage;
                        jsdom.env({
                                html: html, 
                                scripts: ["http://code.jquery.com/jquery.js"], 
                                done: function (errors, window) {
                                    if(errors == null){
                                        var $ = window.$;
                                        $("#targetPage").html(newPage); //if they want the placeholder.html page, insert a link to the page it will lead to, so it can auto-open if needed.
                                        var html = /*"<!DOCTYPE HTML>" +*/ $("html").html().replace("<script class=\"jsdom\" src=\"http://code.jquery.com/jquery.js\"></script>",""); //remove the jquery dependancy dsdom injects
                                        res.write(html);
                                        res.end();
                                    }
                                }
                        });
                    }
                    else { //otherwise, send the exactly what they asked for.
                        res.write(html);
                        res.end();  
                    } 
                break;
            }

        }
        catch(err){ //if you can't find it, give a sexy 404!
            res.writeHead(404);
            var html = "file not found";
            res.write(html);
            res.end();  
        }
      
    };

    function redirectToGlobal(res, req){ //sends a 302 redirect to "lists/global" or "/global" if they already have the first part
        var redirectTo = "lists/global";
        if(req){
            var pathname = url.parse(req.url).pathname;
            if(pathname[pathname.length-1] == "/"){
                redirectTo = "global";
            }
        }
        
        res.writeHead(302, {
            "Location": redirectTo
        });
        res.end();
    }

    function serveSinglePage(toServe, res){ //Servers the intial HTML for a page or a warning that the "list doesn't exist" Once we have an API, we can create pages "wiki" style
        //lookup page
            
        db.serialize(function() {
            
            var query = "select id from lists where name = '" + toServe + "';"; //check if the page they want exists in the database
            db.all(query, function(err, row){
            
                if(row.length > 0) {
                    res.writeHead(200);
                    
                    var html = fs.readFileSync("../" + config.webClientLoc + "index.html").toString();

                    //replace the title with the name of the page
                    try {
                        jsdom.env(html, [url.parse("http://code.jquery.com/jquery.js").href], //Set the title of the page they asked for.
                            function (errors, window) {
                                window.$("title").html(toServe + " - Shared Windows");
                                var html = /*"<!DOCTYPE HTML>" +*/ window.$("html").html().replace("<script class=\"jsdom\" src=\"http://code.jquery.com/jquery.js\"></script>","");
                                res.write(html);
                                res.end();
                            }
                        );
                    }
                    catch(er){
                        res.write(html);    //send them SOMETHING.
                        res.end();
                    }


                    
                } else {
                
                    res.writeHead(200); //if its not in the database, tell them it doesn't exist!~
                    res.write("List doesn't exist yet.");
                    res.end();
                
                }
            });
        });
    }



    //-------------------------------//
    //========helper functions=======//
    //-------------------------------//

    /*
        Split a single uri into a list of terms. 
        Also removes "" terms
    */
    function uriToArray(uri) {  //converts a uri to an array? I'm not sure I use this. maybe once?
        var uriPath = uri.split("/");
        var i = 0; while ( i < uriPath.length ) {
            if(uriPath[i] == "") {
                uriPath.splice(i, 1);
            } else { i++; }
        }
        return uriPath;
    }
    
    
    return webServer;
}


function getAddresses(){    //askes the os nicely for the current ip address. Came straight off of stack overflow.
    var os = require('os')

    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == 'IPv4' && !address.internal) {
                addresses.push(address.address)
            }
        }
    }

    return addresses; 
}


function postRequest(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
        });

        request.on('end', function() {
            callback(queryData);
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}