sw.drag = {};
sw.drag.currentY = 0;
sw.drag.dragTo = {};
sw.drag.dragTo.current = 0;  //weird hack. It always puts the item on top of the scroll area in as the "current" 
sw.drag.dragTo.previous = 0; //when done dragging, so I store the previous element as the "move to" target.
sw.drag.startedDrag = 0;
sw.drag.currentDragged;
sw.drag.passCount = 0;

/*
http://jsfiddle.net/Mk4YH/light/
http://jqueryui.com/sortable/
*/
sw.onload.push(function(){ 


//display a blank space wherever the user is hovering the dragged div.
    document.querySelector("#page").ondrag = draggyMoved;
    document.querySelector("#page").onscroll = draggyMoved;
    function draggyMoved(event){
        
        
        if(event.y != sw.drag.currentY){
                
            placeholder.style.left = event.x + "px";
            placeholder.style.top = event.y + "px";
            
            function getStyle(el, styleProp)    {
                var x = document.getElementById(el);
                if (x.currentStyle)
                    var y = x.currentStyle[styleProp];
                else if (window.getComputedStyle)
                    var y = document.defaultView.getComputedStyle(x,null).getPropertyValue(styleProp);
                return y;
            }
            console.log(   );
            placeholder.style.width = (sw.drag.currentDragged.offsetWidth) + "px";
                        
            for(var i = 0; i < document.querySelector("#page").children.length; i++) {
            
            
                var child = document.querySelector("#page").children[i];
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

})



var placeholder = document.createElement("div");
placeholder.id = "placeholder";
document.body.appendChild(placeholder);
placeholder.classList.add("message");
placeholder.style.position = "absolute";
placeholder.style.display = "none";

sw.drag.start = function(node) {
    sw.drag.currentDragged = node;//sw.helpers.childIndex(node);
    sw.drag.startedDrag = sw.helpers.childIndex(node);
    
    placeholder.style.display = "inline";
    placeholder.innerHTML = node.innerHTML;
    placeholder.ondrag = function(){};
    placeholder.ondragstart = function(){};
    placeholder.ondragend = function(){};
    placeholder.onclick = function(){};
    placeholder.classList.add("draggedMessage");
    
    node.classList.add("draggedMessage");
    node.style.opacity = 0;
    
    
    
}
sw.drag.end = function(node) {
    //debugger;
    
    //animate from dragstop to position, then place!!
    placeholder.style.display = "none";
    placeholder.classList.remove("draggedMessage");
    
    
    var childLength = document.querySelector("#page").children.length;
    var to   = childLength - sw.drag.dragTo.previous + 1;
    var from = childLength - sw.drag.startedDrag + 1;
    
    
    
    sw.socket.emit('moveIndex', {
                                    currentIndex: from,
                                    newIndex: to
                                });
}
