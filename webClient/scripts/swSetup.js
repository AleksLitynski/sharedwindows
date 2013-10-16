/*
    Does a lot of misc. setup actions: 
        - get the socketio server ip
        - post to recent
        - uncheck jump to current & follow leader if in recent
        - rig keypress and drop for posting new items
        - sets the background color to a hash of the page name
        - set the "#page" div to always fill to the bottom of the page. Doesn't get done on iphone, because Ithings will streach it all the way to the bottom of the world
        - rig a function that checks every 4 seconds if the connection has been lost.


*/

sw.setup = {};

sw.onloadEarly.push(function(){
	
    var parser = document.createElement('a'); //parse the list name out of the current url
    parser.href = document.URL;
    if(parser.pathname.split("/").length >= 3){
        sw.listName = parser.pathname.split("/")[2];
    } else {
        sw.listName = "global";
    }
    
    document.querySelector("#pageName").innerHTML = "<span style='z-index:1000;'><span style='font-weight:bold;'>"+sw.listName +"</span>:" + document.URL +"</span>";

    //set the name of the "page name" bar
    //document.querySelector("#pageName").value = window.location;

    var req = new XMLHttpRequest(); //get the config file synchroniously and use the IP address for the socketio connection
    req.open('GET', "http://" + document.location.host + "/config", false); req.send();
    var socketIP = JSON.parse(req.response).webSocketServer;
    
    sw.socket = io.connect('http://'+socketIP);      //connect to socket io.  //window.location.host
    //sw.socket = io.connect('http://edgetable.com:9823');      //connect to socket io.  //window.location.host
    sw.post.subbedLists.push(sw.listName);
    sw.helpers.getLocation(function(pos){ //get the current location and post the fact that you've loaded the page to "recent"
        var location = window.location.origin + "/lists/" + sw.listName;
        sw.socket.emit("subscribe", {list: sw.listName, latitude: pos.coords.latitude, longitude: pos.coords.longitude, post:location, to:"recent"});     
    });

    if(sw.listName == "recent"){ //if we're on recent, don't follow the leader
        document.querySelector("#followTheLeader").checked = false;
        document.querySelector("#jumpToCurrent").checked = false;
    }


    //allows darg and drop or typing into the post box
    document.querySelector("#postBox").ondrop = function(e){  sw.post.send( e.dataTransfer.getData('Text') ); }
    document.querySelector("#postBox").onkeydown= function(e){ if(e.keyCode == 13){sw.post.send( document.querySelector("#postBox").value );} };

    //set background color based on list name
    var color = stringToColour(sw.listName);
    //document.querySelector("#page").style.backgroundColor = "rgba(0,0,0,1)";
    //document.querySelector("#pageNameBox").style.backgroundColor = "rgba(0,0,0,1)";

    //keeps 
    function isiPhone(){
        return (
            //Detect iPhone
            (navigator.platform.indexOf("iPhone") != -1) ||
            //Detect iPod
            (navigator.platform.indexOf("iPod") != -1)   || 
            //detect ipad
            (navigator.platform.indexOf("iPad") != -1) 
        );
    }
    if(!isiPhone()){
        window.addEventListener("resize", sw.setPageHeight);
    }
    sw.setPageHeight();


    //set alert on disconnect
    sw.disconnected = false;
    function count(){
        setTimeout(function(e){
            if(!sw.socket.socket.connected){
                if(!sw.disconnected){
                    sw.disconnected = true;
                    alert("Connection to the server has been lost! \n have you lost connection to the internet, or is the server down?");
                }
            } else {
                sw.disconnected = false;
            }
            count();
        }, 5000);
        
    }count();

})

sw.setPageHeight = function(){
    document.querySelector("#page").style.height = window.innerHeight - document.querySelector("#pageNameBox").clientHeight /*- document.querySelector("#optionsBar").clientHeight*/ + "px";

};


//hash any string into a CSS valid color
var stringToColour = function(str) {
    if(str == "global") {return "rgb(12, 151, 202)";}
    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
    return colour;
}