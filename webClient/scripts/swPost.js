sw.post = {};
sw.post.items = {};
// console.log(sw.post.items[i].createdBy, sw.post.items[i].createdOn, sw.post.items[i].id, sw.post.items[i].latitude, sw.post.items[i].listId, sw.post.items[i].listIndex, sw.post.items[i].longitude, sw.post.items[i].thumbnail, sw.post.items[i].title, sw.post.items[i].url);


sw.onload.push(function(){
    
    sw.socket.on('items', function (data) {
        if(!sw.post.items[data.page]) {
            sw.post.items[data.page] = [];
        } 
        
        for(var i = 0; i < data.data.length; i++){
                
            var segementPath = data.data[i].url.split("/");
            var newPageName = segementPath.pop().split("\n")[0];
            segementPath = segementPath.join("/");
            var localPath = window.location.toString().split("/");
            localPath.pop();
            localPath = localPath.join("/");
            if(localPath == segementPath){
                if(!sw.post.items[newPageName]){
                    sw.socket.emit("subscribe", {list: newPageName});
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
    
    if( document.querySelector("#jumpToCurrent").checked ) {
        sw.index.current[list] = sw.post.items[list].length;
        if(sw.index.current){
            sw.preview.display( sw.post.items[list][sw.index.current[list]-1].url, list );
        }
    }
}

sw.post.moveItem = function(page, from, to){
    
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
    sw.post.selectItemByIndex(to, page);
}

sw.post.getNodeOfList = function(listName){
    var page = document.querySelector("#page-" + listName);
    if(listName == sw.listName) {
        page = document.querySelector("#page");
    }
    return page;
}
sw.post.getListOfNode = function(node){
    if(node.parentNode.id == "page") {
        return sw.listName;
    } else {
        return node.parentNode.parentNode.id.split("-")[1];
    }
}

sw.post.display = function(nodeName) {
    
    var node = sw.post.getNodeOfList(nodeName);
    var toDisplay = sw.post.items[nodeName];
    
    if(nodeName != sw.listName){
        node.onclick = "";
        node.style.height = "auto";
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
        root.setAttribute("ondragend", "sw.drag.end(this)");
        root.setAttribute("onclick", "sw.post.itemClicked(this)");
        
        root.innerHTML  +=  "<button class='closeBtn' onclick='sw.post.requestDeleteThis(this.parentNode)'></button>"
                        +  "<div style='float:left; width:15%;'>"
                        +      "<image src='"+thumbnail+"'></image>"
                        +  "</div>"
                        +  "<div style='float:left; width:50%;'>"
                        +      "<div class='postTitle'>"+toDisplay[i].title+"</div>"
                        +      "<div class='postURL'>"+toDisplay[i].url+"</div>"
                        +  "</div>"
                        +  "<div class='nestedPages'>"
                        +  "</div>";
                        
        var segementPath = toDisplay[i].url.split("/");
        var potentialPageName = segementPath.pop().split("\n")[0];
        segementPath = segementPath.join("/");
        var localPath = window.location.toString().split("/");
        localPath.pop();
        localPath = localPath.join("/");
        if(localPath == segementPath && potentialPageName != sw.listName){
            root.setAttribute("id", "page-"+potentialPageName);
            if(sw.post.items[potentialPageName]){
                sw.post.display(potentialPageName);
            }
        }
        
    }
}


//submits a new post
sw.post.send = function() {
    
    navigator.geolocation.getCurrentPosition(function(pos){
        var msg = document.querySelector("#postBox").value;
        document.querySelector("#postBox").value = "";
        sw.socket.emit('items', {message: msg, latitude: pos.coords.latitude, longitude: pos.coords.longitude, page: sw.listName }); //post to?        
    });
};


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
    console.log(node);
    var index = (function(node) {
        var n = 0;
        while (node = node.nextSibling){
            n++;
        }
        return n+1;
    })(node);
    console.log(node.parentNode);
    if(node.parentNode.id == "page"){
        sw.post.requestDelete(index, sw.listName);
    } else {
        sw.post.requestDelete(index, node.parentNode.parentNode.id.split("-")[1].split("\n")[0]);
    }
    
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