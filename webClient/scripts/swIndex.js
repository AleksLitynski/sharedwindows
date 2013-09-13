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
});

//most be told what page to move index on
//sends the current item to the server
sw.index.send = function(current, page){
    //debugger;
    sw.socket.emit('index', {index: current, page: page} );
}