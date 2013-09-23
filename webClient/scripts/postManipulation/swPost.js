sw.post = {};
sw.post.items = {};
sw.post.subbedLists = [];
// console.log(sw.post.items[i].createdBy, sw.post.items[i].createdOn, sw.post.items[i].id, sw.post.items[i].latitude, sw.post.items[i].listId, sw.post.items[i].listIndex, sw.post.items[i].longitude, sw.post.items[i].thumbnail, sw.post.items[i].title, sw.post.items[i].url);

sw.onload.push(function(){

    sw.socket.on('items', function (data) {

        if(sw.post.subbedLists.some(function(e, i, a){return e == data.page;})){
            if(!sw.post.items[data.page]) {
                sw.post.items[data.page] = [];
            } 
            
            for(var i = 0; i < data.data.length; i++){
                var isURL = sw.helpers.isUrlAList(data.data[i].url);
                if(isURL != false){
                    if( !sw.post.subbedLists.some(function(ele){return (ele == isURL)}) ){
                        sw.post.subbedLists.push(isURL);
                        //sw.socket.emit("subscribe", {list: isURL});
                    } 
                }
                sw.post.addItem(data.page, data.data[i]);
            }
            //find the node, pass in the items
            sw.post.display(data.page);
        }
    });


});


sw.post.addItem = function(list, item){

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
    
    if( document.querySelector("#jumpToCurrent").checked) { // && !isAList
        sw.index.current[list] = sw.post.items[list].length;
        if(sw.index.current){
            sw.preview.display( sw.post.items[list][sw.index.current[list]-1].url, list );
        }
    } else {
        if(!sw.index.current[list]){
            sw.index.current[list] = 1;
        }
    }
}

sw.post.display = function(nodeName) {
    
    var nodes = sw.helpers.getNodesOfList(nodeName);
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
                thumbnail = "/sFavicon.PNG";
            }
            
            var root = document.createElement("div");
            root = node.appendChild(root);
            root.setAttribute("class", "message" + selected);
            root.setAttribute("draggable", true);
            root.setAttribute("ondragstart", "sw.drag.start(this); ");
            root.addEventListener("dragend", sw.drag.end );
            root.setAttribute("onclick", "sw.index.itemClicked(this)");
            
            root.innerHTML  +=  "<div class='postInfo'><button class='closeBtn' onclick='sw.delete.requestDelete(this)'>X</button>" //
                            +       "<div class='iconBox'>"
                            +           "<image class='previewIcon' src='"+thumbnail+"'></image>"
                            +       "</div>"
                            +       "<div class='postTextBox'>"
                            +           "<div class='postTitle'>"+toDisplay[i].title+"</div>"
                            +           "<div class='postURL'>"+toDisplay[i].url+"</div>"
                            +       "</div>"
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
sw.post.send = function(toPost) {

    sw.post.post(toPost, sw.listName);

    setTimeout(function(){document.querySelector("#postBox").value = "";},1);
};
sw.post.post = function(msg, list, title){
    navigator.geolocation.getCurrentPosition(function(pos){
        if(!title) {title = msg;}
        sw.socket.emit('items', {title: title, message: msg, latitude: pos.coords.latitude, longitude: pos.coords.longitude, page: list }); //post to?        
    });
}



