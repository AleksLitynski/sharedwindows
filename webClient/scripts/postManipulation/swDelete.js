sw.delete = {};

sw.onload.push(function(){
    
    //when you are told to delete an item...
    sw.socket.on("deleteItem", function(data){
        if(data.success) { //if it was a successful delete...
            sw.delete.removeItem(data.toDelete, data.page); //remove the item
        }
    });
    
});

//called via event on the "x" button. Used to ask the server for a delete.
sw.delete.requestDelete = function(deleteIndex, page) {
    
    if( isNaN(deleteIndex) ){
        deleteIndex = sw.helpers.childIndex( sw.helpers.getNodeOfNode(deleteIndex) ); //use the helper functions to get an index of the selected item
        
        deleteIndex = sw.post.items[sw.listName].length - deleteIndex + 1;
    }
    page = sw.listName;
    sw.socket.emit("deleteItem", { index: deleteIndex, page: page } ); //and delete it from the page in question
}
//when the server tells you to delete, delete the item from the page. Page mattered when there was more than one list per website.
sw.delete.removeItem = function(index, page) {
    for(var i = 0; i < sw.post.items[page].length; i++) { //remove it...
        if(sw.post.items[page][i].listIndex == index) {
            sw.post.items[page].splice(i, 1);
            break;
        }
    }
    
    for(var i = 0; i < sw.post.items[page].length; i++) { //and incriment all the rest
        if(sw.post.items[page][i].listIndex > index) {
            sw.post.items[page][i].listIndex--;
        }
    }

    if(index ==  sw.index.current[page]){ //set the preview to blank if it was previewing the page we just removed
        sw.preview.display("about:blank");
    }
    sw.post.display( page ); //and display the new page
}