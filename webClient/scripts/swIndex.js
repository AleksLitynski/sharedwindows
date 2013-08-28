sw.index = {};
sw.index.current = NaN;

sw.onload.push(function(){
    sw.socket.on('index', function (data) {
        //if we're following the leader, preview the new node
        if(document.querySelector("#followTheLeader").checked) { 
            var index = data[0].currentListId;      
            sw.index.current = index;
            sw.post.display();
            sw.preview.display( sw.post.items[ index - 1].url );
        }
        
    });
});

//sends the current page to the server
sw.index.send = function(current){
    sw.socket.emit('index', {index: current} );
}






//http://edgetable.com/sharedWindows/changeCurrentPost.php?setOrGet=set&val=14
//http://edgetable.com/sharedWindows/changeCurrentPost.php?setOrGet=get

//http://edgetable.com/sharedWindows/changecurrentPost.php?setOrGet=set&val=7 <-set
//http://edgetable.com/sharedWindows/changecurrentPost.php?setOrGet=get&val=7 <-get