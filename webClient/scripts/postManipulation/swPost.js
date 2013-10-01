sw.post = {};
sw.post.items = {};
sw.post.subbedLists = [];
// console.log(sw.post.items[i].createdBy, sw.post.items[i].createdOn, sw.post.items[i].id, sw.post.items[i].latitude, sw.post.items[i].listId, sw.post.items[i].listIndex, sw.post.items[i].longitude, sw.post.items[i].thumbnail, sw.post.items[i].title, sw.post.items[i].url);

sw.onload.push(function(){

    sw.socket.on('items', function (data) {
        if(data.page == sw.listName){

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

    //debugger;
    
    var nodes = sw.helpers.getNodesOfList(nodeName);
    var toDisplay = sw.post.items[nodeName];
   
    for(var node = 0; node < nodes.length; node++){
        displaySingleNode(nodes[node], toDisplay, nodeName);
    }
    
    function displaySingleNode(node, toDisplay, nodeName){
        if(nodeName != sw.listName){
            node.onclick = "";
            //put code to min/max div here
            node.classList.add("listMessageOpen");
            node = node.querySelector(".nestedPages");
        }

        var newBody = "";
        for(var i = toDisplay.length-1; i >= 0 ; i--){
            
            var selected = "";
            if(sw.index.current[nodeName] == toDisplay[i].listIndex) {
                selected = " selectedMessage";
            }
            
            var thumbnail = toDisplay[i].thumbnail;
            if( thumbnail == "about:blank"){
                thumbnail = "/sFavicon.PNG";
            }
            
            newBody+=   "<div class='message"+selected+"'onclick='sw.index.itemClicked(this)'>"
                    +       "<div class='dragHandle' draggable='true' ondragstart='sw.drag.start(this);' ondragend='sw.drag.end(this)' ></div>"
                    +       "<div class='postInfo'>"
                    +           "<button class='closeBtn' onclick='sw.delete.requestDelete(this)'>X</button>"
                    +           "<div class='popOutBtn' onclick='sw.page.popOut(this)'></div>" 
                    +           "<div class='iconBox'>"
                    +               "<image class='previewIcon' src='"+thumbnail+"'></image>"
                    +           "</div>"
                    +           "<div class='postTextBox'>"
                    +               "<div class='postTitle' ondblclick='sw.post.select(this)'>"+toDisplay[i].title+"</div>"
                    +               "<div class='postURL' ondblclick='sw.post.select(this)'>"+toDisplay[i].url+"</div>"
                    +           "</div>"
                    +       "</div>"
                    +       "<div class='nestedPages' onclick='e.stopPropagation()' ondragstart='e.stopPropagation()'></div>"
                    +   "</div>";

            
            /*var isURL = sw.helpers.isUrlAList(toDisplay[i].url);
            if(isURL != false && isURL != sw.listName){
                root.classList.add("page-"+isURL);
                sw.drag.addDragSupport( root );
                if(sw.post.items[isURL]){
                    sw.post.display(isURL);
                }
            }*/
        }

        if(node.innerHTML != newBody){
            node.innerHTML = newBody;
        }
    }
}



//submits a new post
sw.post.send = function(toPost) {
    
    if(toPost != " " && toPost != "\n" && toPost != ""){

        if(document.querySelector("#postToChildren").checked){
            for(var i = 0; i < sw.post.items[sw.listName].length; i++){
                var item = sw.post.items[sw.listName][i];
                var list = sw.helpers.isUrlAList(item.url);
                if( list != false ){
                    sw.post.post(toPost, list);
                }
            }
        } else {
            sw.post.post(toPost, sw.listName);
        }

    }

    setTimeout(function(){document.querySelector("#postBox").value = "";},1);
};
sw.post.post = function(msg, list, title){
    navigator.geolocation.getCurrentPosition(function(pos){
        if(!title) {title = msg;}
        sw.socket.emit('items', {title: title, message: msg, latitude: pos.coords.latitude, longitude: pos.coords.longitude, page: list }); //post to?        
    });
}



sw.post.select = function(toselect){

    toselect.classList.toggle(".selectable");
/*
    function selectElementContents(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    console.log(toselect);
    selectElementContents(toselect);*/



}