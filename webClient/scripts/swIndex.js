sw.index = {};
sw.index.current = {};

sw.onload.push(function(){
    sw.socket.on('index', function (data) {
        //console.log(data);
    
        //if we're following the leader, preview the new node
        if(data.data[0]){
            if(document.querySelector("#followTheLeader").checked) { 
                var index = data.data[0].currentListId;
                if(sw.index.current && sw.index.current[data.page] ){
                    sw.index.current[data.page] = index;
                    
                    sw.post.display(data.page);
                    if(sw.post.items[data.page][ index - 1 ] && sw.post.items[data.page][ index - 1 ].url){
                        sw.preview.display( sw.post.items[data.page][ index - 1 ].url, data.page );
                    }
                }
            }
        }
        
    });

    sw.socket.on("moveIndex", function(data){
        sw.index.moveItem(data.page, data.from, data.to);
        sw.post.display(data.page);
    });
});


//most be told what page to move index on
//sends the current item to the server
sw.index.send = function(current, page){
    //debugger;
    sw.socket.emit('index', {index: current, page: page} );
}



sw.index.moveItem = function(page, from, to){
    if((from - 1) >= 0){
        var toMoveId = sw.post.items[page][from - 1].id;
        
        var rising = from > to;
        for(var i = 0; i < sw.post.items[page].length; i++){
            if(rising) {
                if(sw.post.items[page][i].listIndex < from && sw.post.items[page][i].listIndex >= to) {
                    sw.post.items[page][i].listIndex += 1;
                }
                
            } else {
                if(sw.post.items[page][i].listIndex > from && sw.post.items[page][i].listIndex <= to) {
                    sw.post.items[page][i].listIndex -= 1;
                }
            }
        }
        for(var i = 0; i < sw.post.items[page].length; i++) {
            if(sw.post.items[page][i].id == toMoveId) {
                sw.post.items[page][i].listIndex = to;
                break;
            }
        }
        
        sw.post.items[page].sort(function (a, b) {
            return a.listIndex - b.listIndex;
        });
        
        //do not select the moved element if it is a list
        if(sw.post.items[page][to-1] && sw.helpers.isUrlAList(sw.post.items[page][to-1].url) == false){
            sw.index.selectItemByIndex(to, page);
        }
    }
}

//called when a message image is clicked
sw.index.itemClicked = function(node){

    var index = (function(node) {
        var n = 0;
        while (node = node.nextSibling){
            n++;
        }
        return n+1;
    })(node);
    sw.index.selectItemByIndex(index, sw.helpers.getListOfNode(node));
    
}

sw.index.selectItemByIndex = function(index, page) {
    sw.index.send( index, page );
    
    //preview etc the new node
    sw.index.current[page] = index;
    
    sw.post.display(page);
    if(sw.post.items[index] && sw.post.items[index].url){
        sw.preview.display( sw.post.items[index].url, page );
    }
}