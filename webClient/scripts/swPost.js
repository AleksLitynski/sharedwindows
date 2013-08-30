sw.post = {};
sw.post.items = [];

sw.onload.push(function(){
    
    sw.socket.on('items', function (data) {
        for(var i = 0; i < data.length; i++){
            sw.post.addItem(data[i]);
        }
        sw.post.display();
    });
    
    
    sw.socket.on("moveIndex", function(data){
        sw.post.moveItem(data.from, data.to);
        sw.post.display();
    });
    
    
});




sw.post.addItem = function(item){
    
    sw.post.items.push(item);
    sw.post.items.sort(function (a, b) {
        return a.listIndex - b.listIndex;
    });
    
    if( document.querySelector("#jumpToCurrent").checked ) {
        sw.index.current = sw.post.items.length;
        sw.preview.display( sw.post.items[sw.index.current-1].url );
    }
}

sw.post.moveItem = function(from, to){

    var toMoveId = sw.post.items[from - 1].id;
        
    var rising = from > to;
    for(var i = 0; i < sw.post.items.length; i++){
        if(rising) {
            if(sw.post.items[i].listIndex < from && sw.post.items[i].listIndex >= to) {
                sw.post.items[i].listIndex += 1;
            }
            
        } else {
            if(sw.post.items[i].listIndex > from && sw.post.items[i].listIndex <= to) {
                sw.post.items[i].listIndex -= 1;
            }
        }
    }
    for(var i = 0; i < sw.post.items.length; i++) {
        if(sw.post.items[i].id == toMoveId) {
            sw.post.items[i].listIndex = to;
            break;
        }
    } 
    
    sw.post.items.sort(function (a, b) {
        return a.listIndex - b.listIndex;
    });
    sw.post.selectItemByIndex(to);
}

//loads all posts since a given post. Just pass in 0 to get all posts to date.
sw.post.display = function(){
    
    document.querySelector("#page").innerHTML = "";
    
    var newPosts = "";
    for(var i = sw.post.items.length-1; i >= 0 ; i--){
        
        var selected = "";
        if(sw.index.current == sw.post.items[i].listIndex) {
            selected = " selectedMessage";
        }
        
        /*/=================
            console.log(sw.post.items[i].createdBy,
                        sw.post.items[i].createdOn,
                        sw.post.items[i].id,
                        sw.post.items[i].latitude,
                        sw.post.items[i].listId,
                        sw.post.items[i].listIndex,
                        sw.post.items[i].longitude,
                        sw.post.items[i].thumbnail,
                        sw.post.items[i].title,
                        sw.post.items[i].url);
        //=================*/
        
    
        newPosts+= "<div class='message"+selected+"' draggable='true' ondragstart='sw.drag.start(this)' ondragend='sw.drag.end(this)' onclick='sw.post.itemClicked(this)'>" 
                
                    +  "<div style='float:left; width:30%;'>"
                    +      "<image src='"+sw.post.items[i].thumbnail+"'></image>"
                    +  "</div>"
                    
                    +  "<div style='float:left; width:70%;'>"
                    +      "<div>"+sw.post.items[i].title+"</div>"
                    +      "<div>"+sw.post.items[i].url+"</div>"
                    +  "</div>"
                +  "</div>";
    }
    document.querySelector("#page").innerHTML = newPosts;
    
   
};



//submits a new post
sw.post.send = function() {
    
    navigator.geolocation.getCurrentPosition(function(pos){
        var msg = document.querySelector("#postBox").value;
        document.querySelector("#postBox").value = "";
        sw.socket.emit('items', {message: msg, latitude: pos.coords.latitude, longitude: pos.coords.longitude }); //post to?        
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
    sw.post.selectItemByIndex(index);
}

sw.post.selectItemByIndex = function(index) {

    sw.index.send( index );
    
    //preview etc the new node
    sw.index.current = index;
    sw.post.display();
    sw.preview.display( sw.post.items[index].url );
}