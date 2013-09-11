//console.log("hey");
sw.onload.push(function(){
    //console.log("hey");
    //swap for actual load?
    var source = [{label:"Item 1",expanded:true,items:[{label:"Item 1.1"},{label:"Item 1.2",selected:true}]},{label:"Item 2"},{label:"Item 3"},{label:"Item 4",items:[{label:"Item 4.1"},{label:"Item 4.2"}]},{label:"Item 5"},{label:"Item 6"},{label:"Item 7"}];
    //sw.insertTree(source);

});

sw.extractTree = function(){
        
    //helper function to check if an element has a given class
    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
    
    function serializeSelfAndChildren(nodes) {
        var toReturn = [];
        
        for( var i = 0; i < nodes.length; i++) { var element = nodes[i];
        
            var newElem = {};
            
            if(element.getAttribute && element.getAttribute("role") == "treeitem") {  //add the current node

                for(var j = 0; j < element.childNodes.length; j++ ) { var subElem = element.childNodes[j];

                    if(hasClass(subElem, "jqx-tree-item-selected")) { //transfer the selected item
                        newElem.selected = true; 
                    }
                    
                    if(hasClass(subElem, "jqx-tree-item-arrow-expand")) {
                        newElem.expanded = true;
                    }
                
                
                    if(subElem.className != null && hasClass(subElem,  "jqx-tree-item") ) { //check if it is a "text node". Must loop through all child nodes to find this
                        
                        newElem.label = subElem.innerHTML;
                    }
                    
                    if(subElem.className != null && subElem.className == "jqx-tree-dropdown") {   //add all children nodes
                        
                        if( newElem.items == null) { newElem.items = []; }
                        var res = serializeSelfAndChildren(subElem.childNodes);
                        for( var responseNum in res ) {
                            newElem.items.push( res[responseNum] );
                        }
                        
                        
                        
                    }
               }
            }
            
            toReturn.push( newElem );
        }
        
        return toReturn;
                        
    };
    
    return serializeSelfAndChildren( document.querySelector(".jqx-tree-dropdown-root").childNodes );
}

sw.insertTree = function(json){
    document.querySelector("#treeLocation").innerHTML = "<div id='tree'></div>";
    $('#tree').jqxTree({    source : json,
                            allowDrag: true, 
                            allowDrop: true, 
                            height: '300px', 
                            width: '220px', 
                            theme: getDemoTheme()
                       });
    sw.startTreeListeners();
}

sw.startTreeListeners = function(){
    function sendWithDelay(delay) {                 //allow callbacks with a slight delay (for animation)
        setTimeout(function(){sendState();}, delay);
        
        setMouseup(".jqx-tree-item-arrow-collapse");    //on mouse up on twizzles
        setMouseup(".jqx-tree-item-arrow-expand"); 
    }
    $("#tree").on('dragEnd', function (event) { //On drag
        sendWithDelay(10);
    });
    $("#tree").mouseup( function(){sendWithDelay(0)} ); //on mouse up
    
    function setMouseup(query, phrase, value){
        var elem = document.querySelectorAll(query);
        for(var val in elem){subElem = elem[val];
            
            var childLength = 1;
            if(subElem.parentNode != undefined) {
                childLength = subElem.parentNode.querySelector(".jqx-tree-dropdown").childNodes.length;
            }
            var sum = 150 + childLength * 100;
            subElem["onmouseup"] = function(){sendWithDelay(sum)};
        }
    }
    setMouseup(".jqx-tree-item-arrow-collapse");    //on mouse up on twizzles
    setMouseup(".jqx-tree-item-arrow-expand");

};













