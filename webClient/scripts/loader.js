console.log();

require(['jquery/jquery-1.8.2.min.js'], function(){ //jquery must load first? This loader REALLY isn't very good anymore.
    require([
                'http://'+window.location.hostname+':10303/socket.io/socket.io.js',
                'scripts/swOptions.js',
                'scripts/swPost.js',
                'scripts/swIndex.js',
                'scripts/swPreview.js',
                'scripts/helpers.js',
                'scripts/swPageTasks.js',
                'scripts/swDragPosts.js',
                'scripts/swTreeView.js'
                    
            ], 
            function(){sw.loaded()}
    );
});

sw = {};
sw.socket;
sw.listName = "";
sw.onload = [];
sw.loaded = function() {


    var parser = document.createElement('a');
    parser.href = document.URL;
    if(parser.pathname.split("/").length >= 3){
        sw.listName = parser.pathname.split("/")[2];
    } else {
        sw.listName = "global";
    }
    
    
    sw.socket = io.connect('http://'+window.location.hostname+':10303');      //connect to socket io.
    sw.post.subbedLists.push(sw.listName);
    sw.socket.emit("subscribe", {list: sw.listName});
    
    for(toLoad in sw.onload){                                   //call all onload functions.
        sw.onload[toLoad]();
    }  
    
    //engages the drag-and-drop
    //$('.treeDragDrop').treeDragDrop(); 
}
   
   















