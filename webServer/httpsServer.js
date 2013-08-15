var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');

var options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
};
https.createServer(options, handleRequest).listen(443);
http.createServer(handleRequest).listen(80);



function handleRequest(req, res)  {
  res.writeHead(200);
  
  var uri = url.parse(req.url).pathname;
  
  //if we get the bar site, redirect to global
  if( uri == "/" ) {
    response.writeHead(302, {
        'Location': '/global'
    });
  }
  res.write("" + (uri == "/") );
  //if we get a single name, give them the page or offer to make the page
  
  //if they ask for a nested name, direct to global (will fix later)
  
  res.end("hello world\n");
};