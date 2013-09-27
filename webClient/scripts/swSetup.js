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

    sw.socket = io.connect('http://'+window.location.host);      //connect to socket io.
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


    /*
    for(var i = 0; i < document.styleSheets.length; i++){
        console.log(document.styleSheets[i].title);
    }*/

    //sets the height of the page element
    function setPageWidth(e){
        document.querySelector("#page").style.height = (window.innerHeight - document.querySelector("#pageNameBox").clientHeight - document.querySelector("#optionsBar").clientHeight) + "px"; //pageNameBox, optionsBar, postLink
    }
    setPageWidth();
    window.onresize = setPageWidth;


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

    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
    return colour;
}