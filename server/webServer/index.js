exports.run = function(port, securePort) {
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
    https.createServer(options, handleRequest).listen(securePort);
    http.createServer(handleRequest).listen(port);



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
            if(uriPath[0] == "lists") redirectToGlobal(res);
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
            
            
            var html = fs.readFileSync("../" + config.webClientLoc + uriPath.join("/") );
        }
        catch(err){
            res.writeHead(404);
        }
        res.write(html);
        res.end();  
      
      
    };

    function redirectToGlobal(res){
        res.writeHead(302, {
            "Location": "lists/global"
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
                                res.write(window.$("html").html());
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
}
