sw.setup = {};

sw.onloadEarly.push(function(){
	
    var parser = document.createElement('a');
    parser.href = document.URL;
    if(parser.pathname.split("/").length >= 3){
        sw.listName = parser.pathname.split("/")[2];
    } else {
        sw.listName = "global";
    }
    
    //set the name of the "page name" bar
    //document.querySelector("#pageName").value = window.location;

    var req = new XMLHttpRequest();
    req.open('GET', "http://" + document.location.host + "/config", false); req.send();
    var socketIP = JSON.parse(req.response).webSocketServer;
    
    sw.socket = io.connect('http://'+socketIP);      //connect to socket io.  //window.location.host
    //sw.socket = io.connect('http://edgetable.com:9823');      //connect to socket io.  //window.location.host
    sw.post.subbedLists.push(sw.listName);
    navigator.geolocation.getCurrentPosition(function(pos){
        var location = window.location.origin + "/lists/" + sw.listName;
        sw.socket.emit("subscribe", {list: sw.listName, latitude: pos.coords.latitude, longitude: pos.coords.longitude, post:location, to:"recent"});     
    });

    if(sw.listName == "recent"){
        document.querySelector("#followTheLeader").checked = false;
        document.querySelector("#jumpToCurrent").checked = false;
    }


    //allows darg and drop or typing into the post box
    document.querySelector("#postBox").ondrop = function(e){  sw.post.send( e.dataTransfer.getData('Text') ); }
    document.querySelector("#postBox").onkeydown= function(e){ if(e.keyCode == 13){sw.post.send( document.querySelector("#postBox").value );} };

    //set background color based on list name
    var color = stringToColour(sw.listName);
    document.querySelector("#page").style.backgroundColor = color;
    document.querySelector("#pageNameBox").style.backgroundColor = color;
    //document.querySelector("#postLink").style.backgroundColor = color;
    /*console.log(color, color.substring(1,3));
    document.querySelector("#pageName").style.backgroundColor = color;//"lightgrey";*/

    function setPageHeight(){
        document.querySelector("#page").style.height = window.innerHeight - document.querySelector("#pageNameBox").clientHeight - document.querySelector("#optionsBar").clientHeight + "px";
    };
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
        window.addEventListener("resize", setPageHeight);
    }
    setPageHeight();


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


var stringToColour = function(str) {
    if(str == "global") {return "rgb(12, 151, 202)";}
    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
    return colour;
}