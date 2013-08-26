sw.index = {};
sw.index.current = NaN;

sw.onload.push(function(){
    sw.socket.on('index', function (data) {
        sw.index.display( data[0].currentListId );
    });
});

//poll for current page from the server.
sw.index.display = function(newIndex){

    if(document.querySelector("#followTheLeader").checked) {
        sw.preview.display( newIndex );
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