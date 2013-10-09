/*
    This is the big one! GET READY TO GOOOOOO!!!!!

*/

sw.post = {}; //an object to cluster relectent stuff
sw.post.items = {}; //an object holding all the items on the page
sw.post.subbedLists = []; //an array of all lists we are subscribed to. Always one in the current build.
// console.log(sw.post.items[i].createdBy, sw.post.items[i].createdOn, sw.post.items[i].id, sw.post.items[i].latitude, sw.post.items[i].listId, sw.post.items[i].listIndex, sw.post.items[i].longitude, sw.post.items[i].thumbnail, sw.post.items[i].title, sw.post.items[i].url);

sw.onload.push(function(){

    sw.socket.on('items', function (data) { //when you are told to add an item...
        if(data.page == sw.listName){ //if it is for the main page... (didn't always used to be there)

            if(sw.post.subbedLists.some(function(e, i, a){return e == data.page;})){ //if the subblists contains this page
                if(!sw.post.items[data.page]) {
                    sw.post.items[data.page] = []; //create the subbedList item if it doesn't exist. 
                } 
                
                for(var i = 0; i < data.data.length; i++){ //loop over every item in the packet. Add them each to the appropriate page.
                    var isURL = sw.helpers.isUrlAList(data.data[i].url); //go through the data. 
                    if(isURL != false){
                        if( !sw.post.subbedLists.some(function(ele){return (ele == isURL)}) ){
                            sw.post.subbedLists.push(isURL); //add the item to the list
                            //sw.socket.emit("subscribe", {list: isURL});
                        } 
                    }
                    sw.post.addItem(data.page, data.data[i]); //IMPORTANT: Add the item to the page. 
                }
                //find the node, pass in the items
                sw.post.display(data.page); //re display the page data.
            }
        }
    });


});


sw.post.addItem = function(list, item){ //add an item to the sw.post.items array. Sort the array afterwards.
    document.querySelector("#postBox").style.backgroundColor = "white"; //unset the background color that told people something was happening

    sw.post.items[list].push(item); //adds the item
    sw.post.items[list].sort(function (a, b) { //sorts
        return a.listIndex - b.listIndex;
    });
    
    //check if the message is a list. Don't select it if its a list. THIS IS IRRELEVENT, seeing as there is only ever one list
    var isAList = false;
    var u = item.url.split("/");
    if(u.length >= 3){
    var uu = u[u.length-2];
    if(uu == "lists"){ isAList = true;}}
    
    if( document.querySelector("#jumpToCurrent").checked) { // && !isAList
        sw.index.current[list] = sw.post.items[list].length;
        if(sw.index.current){
            sw.preview.display( sw.post.items[list][sw.index.current[list]-1].url, list );
        }
    } else {
        if(!sw.index.current[list]){
            sw.index.current[list] = 1;
        }
    }//irrelephant code over. sorry.
}

sw.post.display = function(nodeName) {  //rebuilds the whole list inside "#page" every time it is called. Way to expensive. In need of fixing up.

    //debugger;
    
    var nodes = sw.helpers.getNodesOfList(nodeName); //the node the items should be attached to
    var toDisplay = sw.post.items[nodeName]; //the items to be displayed. used to change.
   
    for(var node = 0; node < nodes.length; node++){
        displaySingleNode(nodes[node], toDisplay, nodeName); //displays a single node
    }
    
    function displaySingleNode(node, toDisplay, nodeName){ //This is the rest of the function
        if(nodeName != sw.listName){
            node.onclick = "";
            //put code to min/max div here
            node.classList.add("listMessageOpen");
            node = node.querySelector(".nestedPages");
        }

        var newBody = ""; //the text of the new body
        for(var i = toDisplay.length-1; i >= 0 ; i--){
            
            var selected = ""; //if its selected, make it look selected
            if(sw.index.current[nodeName] == toDisplay[i].listIndex) {
                selected = " selectedMessage";
            }
            var handleTouch = ""; //if its a touchscreen, always show the grippy handle
            if('ontouchstart' in document.documentElement){
                handleTouch = " touchHandle";
            }

            //use the placeholder if the thumbnail couldn't be loaded
            var thumbnail = toDisplay[i].thumbnail;
            if( thumbnail == "about:blank"){
                thumbnail = "/sFavicon.PNG";
            }
            //build the new body
            newBody+=   "<div class='message"+selected+"'onclick='sw.index.itemClicked(this)'>"
                    +       "<div class='dragHandle"+handleTouch+"' draggable='true'></div>"
                    +       "<div class='postInfo'>"
                    +           "<button class='closeBtn' onclick='sw.delete.requestDelete(this)'>X</button>"
                    +           "<div class='popOutBtn' onclick='sw.page.popOut(this)'></div>" 
                    +           "<div class='iconBox'>"
                    +               "<image class='previewIcon' src='"+thumbnail+"'></image>"
                    +           "</div>"
                    +           "<div class='postTextBox'>"
                    +               "<div class='postTitle'>"+toDisplay[i].title+"</div>"
                    +               "<div class='postURL'>"+toDisplay[i].url+"</div>"
                    +           "</div>"
                    +       "</div>"
                    +       "<div class='nestedPages' onclick='e.stopPropagation()' ondragstart='e.stopPropagation()'></div>"
                    +   "</div>";

            //were this commented in, child nodes would be subscribed to and loaded.
            /*var isURL = sw.helpers.isUrlAList(toDisplay[i].url);
            if(isURL != false && isURL != sw.listName){
                root.classList.add("page-"+isURL);
                sw.drag.addDragSupport( root );
                if(sw.post.items[isURL]){
                    sw.post.display(isURL);
                }
            }*/
        }
        //if there has been a change...
        if(node.innerHTML != newBody){
            node.innerHTML = newBody;//load the new body!

            var handles = document.querySelectorAll(".dragHandle"); //attach the drag and drop scripts to each draggable item. Wow, this is expensive.
            for(var i = 0; i < handles.length; i++){ var handle = handles[i];
                handle.addEventListener("dragstart", function(e){sw.drag.start(e.srcElement, e);})
                handle.addEventListener("dragend", function(e){sw.drag.end(e.srcElement);})
                handle.addEventListener("touchstart", function(e){console.log("live and let roll around?");sw.drag.touchstart(e.srcElement, e);})
                handle.addEventListener("contextmenu", function(e){e.preventDefault();e.stopPropagation();})
            }
            var pics = document.querySelectorAll(".iconBox"); //does nothing. Once tried to make it possable to drag via the picture aswell. Didn't work out for me. It may for you!~
            for(var i = 0; i < pics.length; i++){ var pic = pics[i];
                //pic.addEventListener("touchstart", function(e){console.log("live and let roll around?");sw.drag.touchstart(e.srcElement, e);})
            }
        }
    }
}

/*
    ~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~
    ~-+-~-+-~-+-~-+-~-+-~-+-~-A QUICK ASIDE ABOUT SEND VS POST+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~
    ~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~-+-~

    Send is what you should probably call. It dispatches to post. 
    Send won't post blank posts and will post to chidren if nessessary!

*/

//submits a new post
sw.post.send = function(toPost, title) { 
    
    if(toPost != " " && toPost != "\n" && toPost != ""){ //if the post is valid

        if(document.querySelector("#postToChildren").checked){ //if the user wants to post to children...
            for(var i = 0; i < sw.post.items[sw.listName].length; i++){//loop over all psots on the current list
                var item = sw.post.items[sw.listName][i];
                var list = sw.helpers.isUrlAList(item.url);
                if( list != false ){
                    if(title){
                        sw.post.post(toPost, list, title);//and post to the children...
                    } else {
                        sw.post.post(toPost, list);
                    }
                }
            }
        } else {
            if(title){
                sw.post.post(toPost, sw.listName, title); //otherwise post to the current list!
            } else {
                sw.post.post(toPost, sw.listName);
            }
        }

    }

    setTimeout(function(){document.querySelector("#postBox").value = "";},1);
};
sw.post.post = function(msg, list, title){//posts whatever its given

    document.querySelector("#postBox").style.backgroundColor = "lightgrey"; //show the user something is happening, grey out the post box
    if(document.querySelector("#postToChildren").checked){ //uncolor box after a little white if posting to children
        window.setInterval(function(){
            document.querySelector("#postBox").style.backgroundColor = "white";
        },500);//0.5 seconds, I think?
    }

    navigator.geolocation.getCurrentPosition(function(pos){//get the lat/lng location
        if(!title) {title = msg;}//if there is not title, use the message as a title
        sw.socket.emit('items', {title: title, message: msg, latitude: pos.coords.latitude, longitude: pos.coords.longitude, page: list }); //post to?        
    });
}


//toggles selectable? I'm not sure if this is used...
sw.post.select = function(toselect){

    toselect.classList.toggle(".selectable");
/*
    function selectElementContents(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    console.log(toselect);
    selectElementContents(toselect);*/



}