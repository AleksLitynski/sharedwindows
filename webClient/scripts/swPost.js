sw.post = {};
sw.post.items = [];

sw.onload.push(function(){
    
    sw.socket.on('items', function (data) {
        for(var i = 0; i < data.length; i++){
            sw.post.addItem(data[i]);
        }
        sw.post.display();
    });
    
});

sw.post.addItem = function(item){
    
    sw.post.items.push(item);
    sw.post.items.sort(function (a, b) {
        return a.listIndex - b.listIndex;
    });
}

sw.post.moveItem = function(from, to){

}

//loads all posts since a given post. Just pass in 0 to get all posts to date.
sw.post.display = function(){
    
    document.querySelector("#page").innerHTML = "";
    
    var newPosts = "";
    for(var i = sw.post.items.length-1; i >= 0 ; i--){
        
        var selected = "";
        if(sw.index.current == sw.post.items[i].listIndex) { console.log("?????");
            selected = " selectedMessage";
        }
    
        newPosts+= "<div class='message"+selected+"' onclick='sw.post.itemClicked(this)'>" 
                
                +  "<div style='float:left; width:30%;'>"
                +      "<span class='messageElement itemCreatedBy'>"+ sw.post.items[i].createdBy + "</span></br>"
                +      "<span class='messageElement itemCreatedOn'> " + sw.post.items[i].createdOn + "</span></br>"
                +      "<span class='messageElement itemId'> id -> " + sw.post.items[i].id + "</span></br>"
                +  "</div>"
                +  "<div style='float:left; width:30%;'>"
                +      "<span class='messageElement itemlatitude'> " + sw.post.items[i].latitude + "</span></br>"
                +      "<span class='messageElement itemListId'> " + sw.post.items[i].listId + "</span></br>"
                +      "<span class='messageElement itemlistIndex'> I -> " + sw.post.items[i].listIndex + "</span></br>"
                 
                +  "</div>"
                +  "<div style='float:left; width:30%;'>"
                +      "<span class='messageElement itemLongitude'> " + sw.post.items[i].longitude + "</span></br>"
                +      "<span class='messageElement itemThumbnail'> " + sw.post.items[i].thumbnail + "</span></br>"
                +      "<span class='messageElement itemTitle'> " + sw.post.items[i].title + "</span></br>"
                +  "</div>"
                +  "<span class='messageElement itemUrl'> " + sw.post.items[i].url + "</span></br>"
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
    
    sw.index.send( index );
    
    //preview etc the new node
    sw.index.current = index;
    sw.post.display();
    sw.preview.display( sw.post.items[index].url );
}