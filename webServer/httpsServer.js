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
  console.log(req.url);
  var uriPath = uriToArray(url.parse(req.url).pathname);
  if(uriPath.length > 0 && uriPath[0] == "favicon.ico") return;
  
  if( uriPath.length == 0 ) {
    redirectToGlobal(res);
  }
  if(uriPath.length == 1 || (uriPath[uriPath.length-1].split(".").length == 2)) { 
    serveSinglePage(res, uriPath);
    return;
  } 

  if(uriPath.length > 1)  {                     
    serveMultiPage(res, uriPath);
  }
};



function redirectToGlobal(res){
    res.writeHead(302, {
        'Location': '/global'
    });
    res.end();
}

function serveSinglePage(res, uriPath){ //single name -> selected list OR create list page
    //lookup page
    
    db.serialize(function() {
        
       // console.log(uriPath + " " + uriPath[0]);
            
        
        var query = "select id from lists where name = '" + uriPath[0] + "';";
        db.all(query, function(err, row){
        
            if(row.length > 0) {
                res.writeHead(200);
                
                var html = "page exists";
                if(uriPath.length == 1) {
                    html = fs.readFileSync("../" + config.webClientLoc + "index.html");
                } else {
                    uriPath.shift();
                    uriPath = uriPath.join("/");
                    html = fs.readFileSync("../" + config.webClientLoc + uriPath);
                }
                
                res.write(html);
                
                res.end();
                
            } else {
            
                res.writeHead(200);
                res.write("page doesn't exist");
                res.end();
            
            }
        });
    });
}

/*
    Takes a uriPath and redirects to the end of the chain.
*/
function serveMultiPage(res, uriPath) {
    res.writeHead(200);
    res.write("<!doctype html><html><head></head><body>");
    for(var i = 0; i < uriPath.length; i++){
        res.write(uriPath[i] + "</br>");
    }
    res.write("</body></html>");
    res.end();
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

