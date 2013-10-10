sw.helpers = {};

//gets the Y position of an object
sw.helpers.ObjectPosition = function(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
              curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return curtop;
}

//gets an objects numerical index relative to its parent.
sw.helpers.childIndex = function(node) {
    var i = 1;
    while ((node = node.previousSibling) != null) {
        if (node.nodeType === 1) i++;
    }
    return i;
}

//checks if parameter is a valid list url. Was used when previewing children to know what elements we should subscribe to
sw.helpers.isUrlAList = function(url){
    var segementPath = url.split("/");
    var newPageName = segementPath.pop().split("\n")[0];
    segementPath = segementPath.join("/");
    var localPath = window.location.toString().split("/");
    localPath.pop();
    localPath = localPath.join("/");
    if(localPath == segementPath){
        return newPageName;
    } else {
        return false;
    }
}

//gets the parent list node of a given list
sw.helpers.getNodesOfList = function(listName){
    var page = document.querySelectorAll(".page-" + listName);
    if(listName == sw.listName) {
        page = [document.querySelector("#page")];
    }
    return page;
}

//get the list name of a given node. 
sw.helpers.getListOfNode = function(node){
    function isSubPage(nodeI){
        if(nodeI.className && hasHitMessage >= 2 ){
            for(var i = 0; i < nodeI.className.split(" ").length; i++){
                var classy = nodeI.className.split(" ")[i];
                if(classy.split("-")[0] == "page" ){
                    return classy.split("-")[1];
                }
            }
        }
        return false;
    }
    function isPage(nodeI){
        if(nodeI.id){
            if(nodeI.id == "page"){
                return sw.listName;
            }
        }
        return false;
    }
    var hasHitMessage = 0;
    var toReturn = false;
    while(node != undefined){
        if(node.classList && node.classList.contains("message")) {
            hasHitMessage++;
        }
        if(toReturn = isSubPage(node)){
            return toReturn;
        }
        if(toReturn = isPage(node)){
            return toReturn;
        }
        node = node.parentNode;
    }
    return false;
    
}


//get the node of a given node
sw.helpers.getNodeOfNode = function(node){
    
    function isValid(n){
        return n.classList && n.classList.contains("message");
    }
    while(!isValid(node)){
        if(node.parentNode) {
            node = node.parentNode;
        } else {
            return false;
        }
    }
    return node;
    
}

//gets the item of a given element. IE: you have the favicon div and you want to know what item that's a part of
sw.helpers.getItemOfNode = function(div){
    var node = sw.helpers.getNodeOfNode(div);
    var listOfNode = sw.helpers.getListOfNode( node );
    var indexOfNode = sw.helpers.childIndex( node );
    return ( sw.post.items[listOfNode][ sw.post.items[listOfNode].length - indexOfNode]  );
}

//convert a string into a valid hackpad url
sw.helpers.getHPAddress = function(name){
    //123 char max for a hackpad name. Can't end in weird (%, etc) chars. Need to take sub-string before encoding. Encoding will blow up string size, so I play it safe and allow 25 char max.
    return ( "https://sharedwindows.hackpad.com/" + encodeURIComponent(name.substr(0, 25)) );
}


//group all access to location to here so it can be toggled on and off
sw.trueCoords = false;
sw.helpers.getLocation = function(callback){

    if(sw.trueCoords){ console.log("hey");
        navigator.geolocation.getCurrentPosition(function(pos){
            callback(pos);
        });
    } else {
        var toReturn = {};
        toReturn.coords = {};
        toReturn.coords.latitude = 0;
        toReturn.coords.longitude = 0;
        callback(toReturn);
    }
}