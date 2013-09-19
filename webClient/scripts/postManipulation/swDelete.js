sw.delete = {};

sw.onload.push(function(){
    
        
    sw.socket.on("deleteItem", function(data){
        if(data.success) {
            sw.post.removeItem(data.toDelete, data.page);
        }
    });
    
});


sw.delete.requestDelete = function(deleteIndex, page) {
    if(isNaN(deleteIndex) ){
        var node = sw.helpers.childIndex(deleteIndex);
        page = sw.helper.getListOfNode(node);
    }
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
        
    sw.post.display( page );
}