sw.index = {};
sw.index.current = 0;

sw.onload.push(function(){
    sw.socket.on('index', function (data) {
        sw.index.display(data[0].currentListId);
    });
    
});

//poll for current page from the server.
sw.index.display = function(newIndex){
    if(sw.index.current != newIndex && document.querySelector("#followTheLeader").checked) {
        sw.index.current = newIndex;
        sw.preview.display( document.querySelector("#page").children[sw.index.current] );
    }
}

//sends the current page to the server
sw.index.send = function(current){
    sw.socket.emit('index', {index: current} );
}






//http://edgetable.com/sharedWindows/changeCurrentPost.php?setOrGet=set&val=14
//http://edgetable.com/sharedWindows/changeCurrentPost.php?setOrGet=get

//http://edgetable.com/sharedWindows/changecurrentPost.php?setOrGet=set&val=7 <-set
//http://edgetable.com/sharedWindows/changecurrentPost.php?setOrGet=get&val=7 <-get