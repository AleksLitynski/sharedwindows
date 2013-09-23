sw.delete = {};

sw.onload.push(function(){
    
        
    sw.socket.on("deleteItem", function(data){
        if(data.success) {
            sw.delete.removeItem(data.toDelete, data.page);
        }
    });
    
});


sw.delete.requestDelete = function(deleteIndex, page) {
    
    if( isNaN(deleteIndex) ){
        deleteIndex = sw.helpers.childIndex( sw.helpers.getNodeOfNode(deleteIndex) );
        
        deleteIndex = sw.post.items[sw.listName].length - deleteIndex + 1;
    }
    page = sw.listName;
    sw.socket.emit("deleteItem", { index: deleteIndex, page: page } );
}

sw.delete.removeItem = function(index, page) {
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

    if(index ==  sw.index.current[page]){
        sw.preview.display("about:blank");
    }
    sw.post.display( page );
}