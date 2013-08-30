var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var config  = JSON.parse(fs.readFileSync('../config.json'));
var sqlite3 = new require('sqlite3').verbose();
var db      = new sqlite3.Database('../' + config.databaseFile);

var options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
};
https.createServer(options, handleRequest).listen(443);
http.createServer(handleRequest).listen(80);



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
        res.writeHead(200);
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
                
                var html = fs.readFileSync("../" + config.webClientLoc + "index.html");
                res.write(html);
                
                res.end();
                
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

