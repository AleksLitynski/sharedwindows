sw.dragIn = {};

//doesn't do anything on load.
//A lot of this is left over from when there were multiple trees. 
sw.onload.push(function(){ 


})

//prevent default actions when you drag over the page div. Used for more when it was a tree
document.querySelector("#page").ondragover = function(e){
    //sw.dragIn.showHide(e, "hide");
    
    e.stopPropagation(); e.preventDefault();
};
document.querySelector("#page").ondragleave = function(e){
    //sw.dragIn.showHide(e, "show");

    e.stopPropagation(); e.preventDefault();
};


document.querySelector("#page").ondrop = function(e){
    e.stopPropagation();
    e.preventDefault();



    if(!placeholder.classList.contains("draggedMessage")){ //when you drop an item into the page, post the item to the page. 
        var list = sw.helpers.getListOfNode(e.target);

        var dropOver = e.target;
        
        while(dropOver && dropOver.classList && !dropOver.classList.contains("message")){
            if(dropOver.parentNode == undefined) {
                return false;
            }
            dropOver = dropOver.parentNode;
        }
        
        var text = String(e.dataTransfer.getData('Text'));
        if(text != ""){
            sw.post.post(text, list);
        }
        

    }

};