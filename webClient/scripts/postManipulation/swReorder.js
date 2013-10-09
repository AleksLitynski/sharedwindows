/*
    This is all about dragging the posts up and down!
*/

sw.drag = {};
sw.drag.currentY = 0; //the current Y of the nouse. 
sw.drag.dragTo = {}; 
sw.drag.dragTo.current = 0;  //weird hack. It always puts the item on top of the scroll area in as the "current" 
sw.drag.dragTo.previous = 0; //when done dragging, so I store the previous element as the "move to" target.
sw.drag.startedDrag = 0;
sw.drag.currentDragged;

sw.onload.push(function(){ //add a few listeners

    sw.drag.addDragSupport( document.querySelector("#page") ); //it was possable to add drag support to other divs (child elements)

    document.addEventListener("touchend", sw.drag.touchend); 
    document.addEventListener("touchcancel", sw.drag.touchend); //this SHOULD be called whenever the drag is lost that isn't finger up. Pop up, phone shut down, finger off the edge, etc.

})

sw.drag.addDragSupport = function(toSupport){ //add a few listeners to whatever is passed to it to let you drag its children

    toSupport.ondrag = sw.drag.draggyMoved;
    toSupport.ontouchmove = sw.drag.draggyMoved;
    toSupport.onscroll = function(e){ //dont do default scroll. Like I know why?
        event.stopPropagation();
        event.preventDefault();
        sw.drag.draggyMoved(e);
    }

}
sw.drag.draggyMoved = function(event){ //the function that is called when an element may be being dragged


    if(event.touches && event.touches.length >= 1){ //use the first touch as the "correct" touch
        
        event.x = event.touches[0].clientX;
        event.y = event.touches[0].clientY;
    }

    if(event.y != sw.drag.currentY && sw.drag.currentDragged && event.srcElement.classList.contains("dragHandle")){// if it has moved and if its really being dragged (as opposed to the mouse just moving)
   
        if(event.touches && event.touches.length >= 1){ //stop event bubbing if its a touch event, otherwise you drag the page around when you want to drag the element around
            event.stopPropagation();
            event.preventDefault();
        }

        placeholder.style.left = event.x + "px"; //move the place holder to the mouse position
        placeholder.style.top = event.y + "px";

        placeholder.style.width = (sw.drag.currentDragged.offsetWidth) + "px"; //set the placeholder's width to the width of the main element
        

        var children = sw.helpers.getNodeOfNode(event.srcElement).parentElement.children;
        for(var i = 0; i < children.length; i++) {

            var child = children[i];
            var top = sw.helpers.ObjectPosition(child) - document.querySelector("#page").scrollTop; //get the child it is moving over
            var bottom = child.clientHeight + top;
                            
            if(event.y > top && event.y < bottom) {
                
                var rising = event.y < sw.drag.currentY; //if its going up make a space before the child, otherwise make a space after the child.
                if(rising){
                    child.parentNode.insertBefore( sw.drag.currentDragged, child);
                } else {
                    child.parentNode.insertBefore( sw.drag.currentDragged, child.nextSibling);
                }
                
                sw.drag.dragTo.previous =  sw.drag.dragTo.current; //remember where its being dragged to
                sw.drag.dragTo.current = sw.helpers.childIndex(sw.drag.currentDragged); //remember where it now is
                break;
            }
        }
        sw.drag.currentY = event.y; //store mouse position
    }
}


/*
    The way the dragging works: 
    - The item you are "really" moving turns invisable. It jumps up and down as you drag.
    - A decoy "placeholder" is created that looks JUST LIKE IT. That is move under the mouse to give the feeling of "dragging".
    - This is because removing elements from the list reloads that element and breaks the drag. IE: you drop the element every time you move a pixel. This doesn't have to be true, but it is the way this program works.
*/
//create the placeholder. I guess I have it root. Cool
var placeholder = document.createElement("div");
placeholder.id = "placeholder";
document.body.appendChild(placeholder); // its a child of the body
placeholder.classList.add("message");
placeholder.style.position = "absolute";
placeholder.style.display = "none"; //starts off unrendered

sw.drag.start = function(node, e) {//when you start dragging, be it touch or mouse

    node = sw.helpers.getNodeOfNode(node);


    sw.drag.currentDragged = node; //remember who you are dragging
    sw.drag.startedDrag = sw.helpers.childIndex(node); //remember where it comes from
    
    placeholder.style.display = "inline"; //show the placeholder
    placeholder.innerHTML = node.innerHTML;
    placeholder.ondrag = placeholder.ondragstart = placeholder.ondragend = placeholder.onclick = placeholder.ontouchstart = placeholder.ontouchend = placeholder.ontouchmove = function(){};
    placeholder.classList.add("draggedMessage"); //make it look like its being dragged

    
    node.classList.add("draggedMessage");//I think this is for signaling, not style.
    node.style.opacity = 0; //hide it

    if(e.x && e.y){ //if we know where the drag started...
        var newE = {};
        newE.srcElement = node;
        newE.x = e.x; newE.y = e.y;
        sw.drag.draggyMoved(newE); //drag one so we can force the placeholder into the right place.
    }

    
    
}
sw.drag.end = function() {//when the drag is over
    var e = window.event;
    if(e.srcElement.classList.contains("dragHandle")){//if we were dragging an element around and not dragging a new element into the thing (that's handled elsewhere)
        e.stopPropagation();
        e.preventDefault();
        var node = sw.helpers.getNodeOfNode(e.srcElement);

        placeholder.style.display = "none";//hide placeholder
        placeholder.classList.remove("draggedMessage");
        var childLength = 0;
        if(node.parentNode){
            childLength = node.parentNode.children.length;
        }
        var to   = childLength - sw.drag.dragTo.previous + 1;
        var from = childLength - sw.drag.startedDrag + 1;
        
        sw.socket.emit('moveItem', { currentIndex: from, newIndex: to, page: sw.helpers.getListOfNode(node) }); //send the message with the directions for where to move it, move it
    }
}

sw.drag.touchdragstarted = false; //drack if the item is being "touch dragged??". Probably like mouse down/up, but for touch, I would guess. 
sw.drag.touchstart = function(node, e){
    
    if(e.touches && e.touches.length >= 1){
        
        e.stopPropagation();
        e.preventDefault();
        e.x = e.touches[0].clientX;//take the first touches location...
        e.y = e.touches[0].clientY;
    }
    console.log("drag start");
    sw.drag.touchdragstarted = true;//and start a drag. 
    sw.drag.start(node, e);
}

sw.drag.touchend = function(e){
    if(sw.drag.touchdragstarted){
        console.log("drag end");
        sw.drag.end();  
        sw.drag.touchdragstarted = false;//remember that we're not dragging anymore
        
    }
}