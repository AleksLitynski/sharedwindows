//exports a run function. Called to start the server.
exports.run = function(port) {
    //imports a few things...
    var path = require('path');
    var https = require('https');
    var http = require('http');
    var multiparty = require('multiparty');
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
                    
                    var form = new multiparty.Form();

                    form.parse(req, function(err, fields, files) { //download the file

                        var fileName = files.file.originalFilename; //store file name and data here
                        var data = "";
                        var done = 0;
                        function updateDone(){ //we do two async actions. Load the data from a temp file and get a unique name by scanning the directory.
                            done++;
                            if(done >= 2){ //incriment this by one for each async action
                                writeAndSend();
                            }
                        }

                        fs.readFile(files.file.path, function(err, readData){ //get the file from temp holding
                        
                            data = readData;
                            //check if file exists
                            updateDone();
                            
                        })

                        //we want to number all files. IE: oneTwo.png -> oneTwo-0.png. If there is already a oneTwo-0.png, we call it oneTwo-1.png, etc
                        fs.readdir("../" + config.database + "hostedFiles/", function(err, files){ //come up with a unique file name for the object
                            var _SplitName = fileName.split("/"); //get the last part of the file path, in case someone is trying to write onto our system in a ../../.. sort of way
                            fileName = _SplitName[_SplitName.length-1]; 


                            var file = fileName.split(".")[0]; //get the file's name we are trying to write
                            var type  = fileName.split(".")[1]; //get its type
                            var count = -1; //assume it will be #0
                            for(currentFile in files){ currentFileName = files[currentFile]; //go over each file in the directory

                                currentFileName = currentFileName.split("-"); 
                                var currentNumberAndType = currentFileName.pop();
                                var currentNumber = parseFloat(currentNumberAndType.split(".")[0]); //string manip to get number
                                var currentType = currentNumberAndType.split(".")[1]; //get type
                                currentFileName = currentFileName.join("-"); //get name

                                if(file == currentFileName && type == currentType){ //if name and type match
                                    if(currentNumber > count) { //store the highest number
                                        count = currentNumber;
                                    }
                                }
                            }

                            count = count + 1; //one higher than the highest number
                            //console.log(file + "-" + count + "." + type);
                            fileName = file + "-" + count + "." + type; //note the file name

                            updateDone(); //if both async actions are done, write to disk and report
                        });

                        function writeAndSend(){ //we have good names and data file. Write them and send the location to the server

                            var path = "../" + config.database + "hostedFiles/" + fileName;
                            fs.writeFile(path, data, function(){}) //save the file

                            res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                            res.write("/file/" + fileName); //tell the client the filename
                            res.end();
                        }
                        
                    });

                    
                break;
                case "file":    //Goes to the hostedFiles folder to return the file the user asked for
                    if( uriPath.indexOf("qrCodes") > -1 && uriPath.indexOf("..") <= -1){
                        uriPath.splice(0,1).join("/");
                        var file = fs.readFileSync( "../" + config.database + "hostedFiles/" + uriPath.join("/") ); //http://129.21.142.18/file/testy.jpg
                        res.write(file);
                        res.end();  
                        return;
                    }
                    var file = fs.readFileSync( "../" + config.database + "hostedFiles/" + lastPathList.join(".") ); //http://129.21.142.18/file/testy.jpg
                    res.write(file);
                    res.end();  
                break;

                default: //they don't want a special directory, 
                    var html = fs.readFileSync("../" + config.webClientLoc + uriPath.join("/") );
                    switch(uriPath[0].split(".")[0]){
                        case "placeholder":
                            var newPage = url.parse(req.url, true).query.newPage;
                            jsdom.env({
                                    html: html, 
                                    scripts: ["http://code.jquery.com/jquery.js"], 
                                    done: function (errors, window) {
                                        if(errors == null){
                                            var $ = window.$;
                                            console.log(newPage);
                                            $("#targetPage").html(newPage); //if they want the placeholder.html page, insert a link to the page it will lead to, so it can auto-open if needed.
                                            var html = /*"<!DOCTYPE HTML>" +*/ $("html").html().replace("<script class=\"jsdom\" src=\"http://code.jquery.com/jquery.js\"></script>",""); //remove the jquery dependancy dsdom injects
                                            res.write(html);
                                            res.end();
                                        }
                                    }
                            });
                        break;
                        case "imageWrapper":
                            var query   = url.parse(req.url, true).query;
                            jsdom.env({
                                    html: html, 
                                    scripts: ["http://code.jquery.com/jquery.js"], 
                                    done: function (errors, window) {
                                        if(errors == null){
                                            window.$("#image").attr("src", query.image); 
                                            window.$("#imageLink").attr("href", query.image); 
                                            window.$("#imageLink").html(query.image); 
                                            window.$("#hackpadScript").attr("src", query.pad + ".js"); 
                                            var html = window.$("html").html().replace("<script class=\"jsdom\" src=\"http://code.jquery.com/jquery.js\"></script>",""); //remove the jquery dependancy dsdom injects
                                            res.write(html);
                                            res.end();
                                        }
                                    }
                            });

                        break;

                        default: //otherwise, send the exactly what they asked for.
                            res.write(html);
                            res.end(); 
                        break;
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
