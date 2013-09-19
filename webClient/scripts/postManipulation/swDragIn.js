sw.dragIn = {};


sw.onload.push(function(){ 


})


document.querySelector("#page").ondragover = function(e){
    sw.dragIn.showHide(e, "hide");
    
    e.stopPropagation(); e.preventDefault();
};
document.querySelector("#page").ondragleave = function(e){
    sw.dragIn.showHide(e, "show");

    e.stopPropagation(); e.preventDefault();
};


sw.dragIn.showHide = function(e, showHide){

    if(var l = sw.helpers.getNodeOfNode( e.target )){
        var lists = sw.helpers.getNodesOfList( l );

        for(var list in lists){ list = lists[list];

            if(showHide == "show"){
                list.insertBefore(NEWGUY, l);
            } else {
                list.insertBefore(NEWGUY, l);
            }

        }
    }
}


document.querySelector("#page").ondrop = function(e){

    e.stopPropagation();
    e.preventDefault();
    if(!placeholder.classList.contains("draggedMessage")){
        var list = sw.helpers.getListOfNode(e.target);

        var dropOver = e.target;
        
        while(dropOver && dropOver.classList && !dropOver.classList.contains("message")){
            if(dropOver.parentNode == undefined) {
                return false;
            }
            dropOver = dropOver.parentNode;
        }
        
        var text = String(e.dataTransfer.getData('Text'));
        sw.post.post(text, list);
        

        //dropOver
        //sw.socket.emit('moveIndex', { currentIndex: from, newIndex: to, page: list });

    }
};