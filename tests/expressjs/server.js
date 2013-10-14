var express = require('express');
var fs = require('fs');
var app = express();

app.use(express.bodyParser());

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.post('/target', function(req, res){
	
	fs.readFile(req.files.file.path, function(err, data){
		fs.writeFile("target/hey.png", data, function(){})
		
		res.send("nice try");
	})

});

app.get('/dropzone.js', function(req, res){
	res.sendfile('dropzone.js');

});


app.listen(80);