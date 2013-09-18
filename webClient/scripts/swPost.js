sw.post = {};
sw.post.items = {};
sw.post.subbedLists = [];
// console.log(sw.post.items[i].createdBy, sw.post.items[i].createdOn, sw.post.items[i].id, sw.post.items[i].latitude, sw.post.items[i].listId, sw.post.items[i].listIndex, sw.post.items[i].longitude, sw.post.items[i].thumbnail, sw.post.items[i].title, sw.post.items[i].url);


sw.onload.push(function(){
    sw.socket.on('items', function (data) {
        if(!sw.post.items[data.page]) {
            sw.post.items[data.page] = [];
        } 
        
        for(var i = 0; i < data.data.length; i++){
            var isURL = sw.helpers.isUrlAList(data.data[i].url);
            if(isURL != false){
                if( !sw.post.subbedLists.some(function(ele){return (ele == isURL)}) ){
                    sw.post.subbedLists.push(isURL);
                    sw.socket.emit("subscribe", {list: isURL});
                } 
            }
            sw.post.addItemTo(data.page, data.data[i]);
        }
        //find the node, pass in the items
        sw.post.display(data.page);
        
    });
    
    
    sw.socket.on("moveIndex", function(data){
        sw.post.moveItem(data.page, data.from, data.to);
        sw.post.display(data.page);
    });
    
    sw.socket.on("deleteItem", function(data){
        if(data.success) {
            sw.post.removeItem(data.toDelete, data.page);
        }
    });
    
});




sw.post.addItemTo = function(list, item){
    
    sw.post.items[list].push(item);
    sw.post.items[list].sort(function (a, b) {
        return a.listIndex - b.listIndex;
    });
    
    //check if the message is a list. Don't select it if its a list
    var isAList = false;
    var u = item.url.split("/");
    if(u.length >= 3){
    var uu = u[u.length-2];
    if(uu == "lists"){ isAList = true;}}
    
    if( document.querySelector("#jumpToCurrent").checked && !isAList) {
        sw.index.current[list] = sw.post.items[list].length;
        if(sw.index.current){
            sw.preview.display( sw.post.items[list][sw.index.current[list]-1].url, list );
        }
    }
}

sw.post.moveItem = function(page, from, to){
    if((from - 1) >= 0){
        var toMoveId = sw.post.items[page][from - 1].id;
        
        var rising = from > to;
        for(var i = 0; i < sw.post.items[page].length; i++){
            if(rising) {
                if(sw.post.items[page][i].listIndex < from && sw.post.items[page][i].listIndex >= to) {
                    sw.post.items[page][i].listIndex += 1;
                }
                
            } else {
                if(sw.post.items[page][i].listIndex > from && sw.post.items[page][i].listIndex <= to) {
                    sw.post.items[page][i].listIndex -= 1;
                }
            }
        }
        for(var i = 0; i < sw.post.items[page].length; i++) {
            if(sw.post.items[page][i].id == toMoveId) {
                sw.post.items[page][i].listIndex = to;
                break;
            }
        }
        
        sw.post.items[page].sort(function (a, b) {
            return a.listIndex - b.listIndex;
        });
        
        //do not select the moved element if it is a list
        if(sw.post.items[page][to-1] && sw.helpers.isUrlAList(sw.post.items[page][to-1].url) == false){
            sw.post.selectItemByIndex(to, page);
        }
    }
    
}

sw.post.getNodesOfList = function(listName){
    var page = document.querySelectorAll(".page-" + listName);
    if(listName == sw.listName) {
        page = [document.querySelector("#page")];
    }
    return page;
}
sw.post.getListOfNode = function(node){
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

sw.post.display = function(nodeName) {
    
    var nodes = sw.post.getNodesOfList(nodeName);
    var toDisplay = sw.post.items[nodeName];
   
    for(var node = 0; node < nodes.length; node++){
        displaySingleNode(nodes[node], toDisplay, nodeName);
    }
    
    function displaySingleNode(node, toDisplay, nodeName){
        if(nodeName != sw.listName){
            node.onclick = "";
            /*function(e){
                if(e.srcElement.classList.contains("listMessageOpen") || e.srcElement.classList.contains("listMessageClosed") ){
                    if(e.srcElement.classList.contains("listMessageOpen")){
                        e.srcElement.classList.remove("listMessageOpen");
                        e.srcElement.classList.add("listMessageClosed");
                    } else {
                        e.srcElement.classList.add("listMessageOpen");
                        e.srcElement.classList.remove("listMessageClosed");
                    }
                }
            };*/
            node.classList.add("listMessageOpen");
            node = node.querySelector(".nestedPages");
        }
        node.innerHTML = "";

        for(var i = toDisplay.length-1; i >= 0 ; i--){
            
            var selected = "";
            if(sw.index.current[nodeName] == toDisplay[i].listIndex) {
                selected = " selectedMessage";
            }
            
            var thumbnail = toDisplay[i].thumbnail;
            if( thumbnail == "about:blank"){
                thumbnail = "";
            }
            
            var root = document.createElement("div");
            root = node.appendChild(root);
            root.setAttribute("class", "message" + selected);
            root.setAttribute("draggable", true);
            root.setAttribute("ondragstart", "sw.drag.start(this); ");
            root.addEventListener("dragend", sw.drag.end );
            root.setAttribute("onclick", "sw.post.itemClicked(this)");
            
            root.innerHTML  +=  "<button class='closeBtn' onclick='sw.post.requestDeleteThis(this.parentNode)'></button>"
                            +  "<div style='float:left; width:15%;'>"
                            +      "<image src='"+thumbnail+"'></image>"
                            +  "</div>"
                            +  "<div style='float:left; width:75%;overflow:hidden'>"
                            +      "<div class='postTitle'>"+toDisplay[i].title+"</div>"
                            +      "<div class='postURL'>"+toDisplay[i].url+"</div>"
                            +  "</div>"
                            +  "<div class='nestedPages'>"
                            +  "</div>";
                            
            root.querySelector(".nestedPages").onclick = prev;
            root.querySelector(".nestedPages").ondragstart = prev;
            //root.querySelector(".nestedPages").ondragend = prev;
            function prev(e){
                e.stopPropagation();
            }
                            
            var isURL = sw.helpers.isUrlAList(toDisplay[i].url);
            if(isURL != false && isURL != sw.listName){
                root.classList.add("page-"+isURL);
                sw.drag.addDragSupport( root );
                if(sw.post.items[isURL]){
                    sw.post.display(isURL);
                }
            }
        }
    }
}


//submits a new post
sw.post.send = function() {
    sw.post.post(document.querySelector("#postBox").value, sw.listName);
    
    setTimeout(function(){document.querySelector("#postBox").value = "";},1);
};
sw.post.post = function(msg, list){
    navigator.geolocation.getCurrentPosition(function(pos){
        sw.socket.emit('items', {message: msg, latitude: pos.coords.latitude, longitude: pos.coords.longitude, page: list }); //post to?        
    });
}


//called when a message image is clicked
sw.post.itemClicked = function(node){

    var index = (function(node) {
        var n = 0;
        while (node = node.nextSibling){
            n++;
        }
        return n+1;
    })(node);
    sw.post.selectItemByIndex(index, sw.post.getListOfNode(node));
    
}

sw.post.selectItemByIndex = function(index, page) {
    sw.index.send( index, page );
    
    //preview etc the new node
    sw.index.current[page] = index;
    
    sw.post.display(page);
    if(sw.post.items[index] && sw.post.items[index].url){
        sw.preview.display( sw.post.items[index].url, page );
    }
}


sw.post.requestDeleteThis = function(node) {
    var index = (function(node) {
        var n = 0;
        while (node = node.nextSibling){
            n++;
        }
        return n+1;
    })(node);    
    sw.post.requestDelete(index, sw.post.getListOfNode(node));
    
    event.stopPropagation();    
    window.event.cancelBubble = true;
}

sw.post.requestDelete = function(deleteIndex, page) {
    sw.socket.emit("deleteItem", { index: deleteIndex, page: page } );
}

sw.post.removeItem = function(index, page) {
    for(var i = 0; i < sw.post.items[page].length; i++) {
        if(sw.post.items[page][i].listIndex == index) {
            sw.post.items[page].splice(i, 1);
            break;
        }
    }
    
    for(var i = 0; i < sw.post.items[page].length; i++) {
        if(sw.post.items[page][i].listIndex > index) {
            sw.post.items[page][i].listIndex--;
        }
    }
        
    sw.post.display( page );
}