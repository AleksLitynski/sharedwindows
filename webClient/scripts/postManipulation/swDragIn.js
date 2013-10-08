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

/*//from the good old days of sometime! used for dragging into a certain location
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
*/

document.querySelector("#page").ondrop = function(e){
    e.stopPropagation();
    e.preventDefault();
   /*var data = e.dataTransfer.files[0];
    if(data.type.split("/")[0] == "image"){

        var reader = new FileReader();

        reader.addEventListener("loadend", function(e, file){
            console.log(e, file);


            var img = document.createElement("img"); 
            img.file = file;   
            img.src = this.result;
            document.querySelector("#preview").appendChild(img);
        })
       
        console.log(data);
        reader.readAsDataURL(data);



    } else {*/



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
            sw.post.post(text, list);
            

        }
    //}
};