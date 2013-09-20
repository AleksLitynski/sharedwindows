sw.setup = {};

sw.onloadEarly.push(function(){
	
    var parser = document.createElement('a');
    parser.href = document.URL;
    if(parser.pathname.split("/").length >= 3){
        sw.listName = parser.pathname.split("/")[2];
    } else {
        sw.listName = "global";
    }
    
    sw.socket = io.connect('http://'+window.location.host);      //connect to socket io.
    sw.post.subbedLists.push(sw.listName);
    sw.socket.emit("subscribe", {list: sw.listName});

    document.querySelector("#postBox").ondrop = function(e){  sw.post.send( e.dataTransfer.getData('Text') ); }
    document.querySelector("#postBox").onkeydown= function(e){ if(e.keyCode == 13){sw.post.send( document.querySelector("#postBox").value );} };

    var color = stringToColour(sw.listName);
    document.querySelector("#page").style.backgroundColor = color;
    document.querySelector("#pageNameBox").style.backgroundColor = color;
    document.querySelector("#postLink").style.backgroundColor = color;
})


var stringToColour = function(str) {

    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

    return colour;
}