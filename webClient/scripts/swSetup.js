sw.setup = {};

sw.onload.push(function(){
	
    var parser = document.createElement('a');
    parser.href = document.URL;
    if(parser.pathname.split("/").length >= 3){
        sw.listName = parser.pathname.split("/")[2];
    } else {
        sw.listName = "global";
    }
    
    sw.socket = io.connect('http://'+window.location.hostname+':10303');      //connect to socket io.
    sw.post.subbedLists.push(sw.listName);
    sw.socket.emit("subscribe", {list: sw.listName});

    document.querySelector("#postBox").ondrop = function(e){  sw.post.send( e.dataTransfer.getData('Text') ); }
    document.querySelector("#postBox").onkeydown= function(e){ if(e.keyCode == 13){sw.post.send( document.querySelector("#postBox").value );} };
})