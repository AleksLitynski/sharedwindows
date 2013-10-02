sw.drag = {};
sw.drag.currentY = 0;
sw.drag.dragTo = {};
sw.drag.dragTo.current = 0;  //weird hack. It always puts the item on top of the scroll area in as the "current" 
sw.drag.dragTo.previous = 0; //when done dragging, so I store the previous element as the "move to" target.
sw.drag.startedDrag = 0;
sw.drag.currentDragged;

sw.onload.push(function(){ 

    sw.drag.addDragSupport( document.querySelector("#page") );

    document.addEventListener("touchend", sw.drag.touchend);
    document.addEventListener("touchcancel", sw.drag.touchend);

})

sw.drag.addDragSupport = function(toSupport){

    toSupport.ondrag = sw.drag.draggyMoved;
    toSupport.ontouchmove = sw.drag.draggyMoved;
    toSupport.onscroll = function(e){
        event.stopPropagation();
        event.preventDefault();
        sw.drag.draggyMoved(e);
    }

}
sw.drag.draggyMoved = function(event){


    if(event.touches && event.touches.length >= 1){
        
        event.x = event.touches[0].clientX;
        event.y = event.touches[0].clientY;
    }

    if(event.y != sw.drag.currentY && sw.drag.currentDragged && event.srcElement.classList.contains("dragHandle")){
   
        if(event.touches && event.touches.length >= 1){ 
            event.stopPropagation();
            event.preventDefault();
        }

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



var placeholder = document.createElement("div");
placeholder.id = "placeholder";
document.body.appendChild(placeholder);
placeholder.classList.add("message");
placeholder.style.position = "absolute";
placeholder.style.display = "none";

sw.drag.start = function(node, e) {

    node = sw.helpers.getNodeOfNode(node);


    sw.drag.currentDragged = node;
    sw.drag.startedDrag = sw.helpers.childIndex(node);
    
    placeholder.style.display = "inline";
    placeholder.innerHTML = node.innerHTML;
    placeholder.ondrag = placeholder.ondragstart = placeholder.ondragend = placeholder.onclick = placeholder.ontouchstart = placeholder.ontouchend = placeholder.ontouchmove = function(){};
    placeholder.classList.add("draggedMessage");

    
    node.classList.add("draggedMessage");
    node.style.opacity = 0;

    if(e.x && e.y){
        var newE = {};
        newE.srcElement = node;
        newE.x = e.x; newE.y = e.y;
        sw.drag.draggyMoved(newE);
    }

    
    
}
sw.drag.end = function() {
    var e = window.event;
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

sw.drag.touchdragstarted = false;
sw.drag.touchstart = function(node, e){
    
    if(e.touches && e.touches.length >= 1){
        
        e.stopPropagation();
        e.preventDefault();
        e.x = e.touches[0].clientX;
        e.y = e.touches[0].clientY;
    }
    console.log("drag start");
    sw.drag.touchdragstarted = true;
    sw.drag.start(node, e);
}

sw.drag.touchend = function(e){
    if(sw.drag.touchdragstarted){
        console.log("drag end");
        sw.drag.end();  
        sw.drag.touchdragstarted = false;
        
    }
}