var Hackpad = require('hackpad');


var client = new Hackpad("ulgzBP9407S", "dYQ34wN7u2hhXvoEUz54Vd4E9l0dKDvX", {site:"alttextneeded"});

client.create("new post to alt text needed", function(err, result) {
  if(err) { console.log("Oh crap!"); }
  if(result){console.log("hackpad.com/"+result.padId)};
  // do something...
});

/*
var request = require('request');
var oauth =
    { callback: ''
    , consumer_key: "c3e97f2169e9715"
    , consumer_secret: "6623d81b9741b9f8256ad0fa9ff95932bc62f9fc"
    }

request({
            method: "POST", 
            url: "https://api.imgur.com/oauth2/token", 
            oauth:oauth
        },
        function (e, r, body) { 
            console.log(e,r,b); 
        } );*/