sw.drag = {};
sw.drag.currentY = 0;
sw.drag.dragTo = {};
sw.drag.dragTo.current = 0;  //weird hack. It always puts the item on top of the scroll area in as the "current" 
sw.drag.dragTo.previous = 0; //when done dragging, so I store the previous element as the "move to" target.
sw.drag.startedDrag = 0;
sw.drag.currentDragged;


sw.onload.push(function(){ 

    sw.drag.addDragSupport( document.querySelector("#page") );

})

sw.drag.addDragSupport = function(toSupport){

    toSupport.ondrag = draggyMoved;
    toSupport.onscroll = draggyMoved;
    function draggyMoved(event){
        if(event.y != sw.drag.currentY && sw.drag.currentDragged && event.srcElement.classList.contains("dragHandle")){
       
            placeholder.style.left = event.x + "px";
            placeholder.style.top = event.y + "px";

            placeholder.style.width = (sw.drag.currentDragged.offsetWidth) + "px";
            

            var children = sw.helpers.getNodeOfNode(event.srcElement).parentElement.children;
            for(var i = 0; i < children.length; i++) {

                var child = children[i];
                var top = sw.helpers.ObjectPosition(child) - document.querySelector("#page").scrollTop;
                var bottom = child.clientHeight + top;
                                
                if(event.y > top && event.y < bottom) {
                    
                    var rising = event.y < sw.drag.currentY;
                    if(rising){
                        child.parentNode.insertBefore( sw.drag.currentDragged, child);
                    } else {
                        child.parentNode.insertBefore( sw.drag.currentDragged, child.nextSibling);
                    }
                    
                    sw.drag.dragTo.previous =  sw.drag.dragTo.current;
                    sw.drag.dragTo.current = sw.helpers.childIndex(sw.drag.currentDragged);
                    break;
                }
            }
            sw.drag.currentY = event.y;
        }
    }
}



var placeholder = document.createElement("div");
placeholder.id = "placeholder";
document.body.appendChild(placeholder);
placeholder.classList.add("message");
placeholder.style.position = "absolute";
placeholder.style.display = "none";

sw.drag.start = function(node) {
    node = sw.helpers.getNodeOfNode(node);
    sw.drag.currentDragged = node;
    sw.drag.startedDrag = sw.helpers.childIndex(node);
    
    placeholder.style.display = "inline";
    placeholder.innerHTML = node.innerHTML;
    placeholder.ondrag = placeholder.ondragstart = placeholder.ondragend = placeholder.onclick = function(){};
    placeholder.classList.add("draggedMessage");
    
    node.classList.add("draggedMessage");
    node.style.opacity = 0;
    
    
    
}
sw.drag.end = function() {
    var e = window.event;
    console.log(e.srcElement);
    if(e.srcElement.classList.contains("dragHandle")){
        e.stopPropagation();
        e.preventDefault();
        var node = sw.helpers.getNodeOfNode(e.srcElement);


        placeholder.style.display = "none";
        placeholder.classList.remove("draggedMessage");
        var childLength = 0;
        if(node.parentNode){
            childLength = node.parentNode.children.length;
        }
        var to   = childLength - sw.drag.dragTo.previous + 1;
        var from = childLength - sw.drag.startedDrag + 1;
        
        sw.socket.emit('moveItem', { currentIndex: from, newIndex: to, page: sw.helpers.getListOfNode(node) });
    }
}