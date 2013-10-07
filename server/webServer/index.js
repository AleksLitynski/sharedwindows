exports.run = function(port) {
    console.log("loading pre reqs");
    var path = require('path');
    var https = require('https');
    var http = require('http');
    var fs = require('fs');
    var url = require('url');
    var config  = JSON.parse(fs.readFileSync((path.resolve(__dirname, '../config.json'))));
    var sqlite3 = new require('sqlite3').verbose();
    var db      = new sqlite3.Database('../' + config.databaseFile);

    var jsdom   = require('jsdom');
    var jquery  = fs.readFileSync(path.resolve(__dirname, './jquery.js'), "utf-8");
    var url     = require('url');

    var options = {
      key: fs.readFileSync((path.resolve(__dirname, 'privatekey.pem'))),
      cert: fs.readFileSync((path.resolve(__dirname, 'certificate.pem')))
    };

    console.log("starting server for real");
    var webServer = http.createServer(handleRequest).listen(port);
    console.log("server started");


    function handleRequest(req, res)  {

        var uriPath = uriToArray(url.parse(req.url).pathname);


        if( uriPath.length == 0 ) {
            redirectToGlobal(res);
            return;
        }
        
        

        if(uriPath[0] == "lists" && uriPath.length > 1)  {
            if(uriPath.length == 2) {
                serveSinglePage(uriPath[1], res);
                return;
            } else {
                uriPath.shift();
            }
        } else {
            if(uriPath[0] == "lists") redirectToGlobal(res, req);
        }

        var html = "file not found";
        try {
            
            var lastPathList = uriPath[uriPath.length-1].split(".");
            var type = lastPathList[lastPathList.length-1];
            
            var n = true;
            if(type == "js"){
                res.writeHead(200, {"Content-Type": "application/javascript"}); n = false;
            }
            if(type == "css"){
                res.writeHead(200, { "Content-Type": "text/css"}); n = false;
            }
            if(type == "jpg" || type == "gif" || type == "png" || type == "ico"){
                res.writeHead(200, {"Content-Type": "image/png"}); n = false;
            } 
            if(n){
                res.writeHead(200);
            }
            //res.setHeader('Access-Control-Allow-Origin','*');
            
            switch (uriPath[0]){
                case "config":
                    var clientConfig = {};
                    clientConfig.webSocketServer = getAddresses()[0] + ":" + port;
                    res.write( JSON.stringify(clientConfig) );
                    res.end(); 
                break;
                case "upload":
                    console.log(req);
                    res.write("/files/");
                    res.end(); 
                break;
                case "file":
                    var file = fs.readFileSync( "../" + config.database + "hostedFiles/" + lastPathList.join(".") ); //http://129.21.142.18/file/testy.jpg
                    res.write(file);
                    res.end();  
                break;

                default:
                    var html = fs.readFileSync("../" + config.webClientLoc + uriPath.join("/") );

                    if(uriPath[0].split(".")[0] == "placeholder"){
                        var newPage = url.parse(req.url, true).query.newPage;
                        jsdom.env({
                                html: html, 
                                scripts: ["http://code.jquery.com/jquery.js"], 
                                done: function (errors, window) {
                                    if(errors == null){
                                        var $ = window.$;
                                        $("#targetPage").html(newPage);
                                        var html = /*"<!DOCTYPE HTML>" +*/ $("html").html().replace("<script class=\"jsdom\" src=\"http://code.jquery.com/jquery.js\"></script>","");
                                        res.write(html);
                                        res.end();
                                    }
                                }
                        });
                    }
                    else {
                        res.write(html);
                        res.end();  
                    } 
                break;
            }

        }
        catch(err){
            res.writeHead(404);
            var html = "file not found";
            res.write(html);
            res.end();  
        }
      
    };

    function redirectToGlobal(res, req){
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

    function serveSinglePage(toServe, res){ //single name -> selected list OR create list page
        //lookup page
            
        db.serialize(function() {
            
            var query = "select id from lists where name = '" + toServe + "';";
            db.all(query, function(err, row){
            
                if(row.length > 0) {
                    res.writeHead(200);
                    
                    var html = fs.readFileSync("../" + config.webClientLoc + "index.html").toString();

                    //replace the title with the name of the page
                    try {
                        jsdom.env(html, [url.parse("http://code.jquery.com/jquery.js").href],
                            function (errors, window) {
                                window.$("title").html(toServe + " - Shared Windows");
                                var html = /*"<!DOCTYPE HTML>" +*/ window.$("html").html().replace("<script class=\"jsdom\" src=\"http://code.jquery.com/jquery.js\"></script>","");
                                res.write(html);
                                res.end();
                            }
                        );
                    }
                    catch(er){
                        res.write(html);
                        res.end();
                    }


                    
                } else {
                
                    res.writeHead(200);
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
    function uriToArray(uri) {
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


function getAddresses(){
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