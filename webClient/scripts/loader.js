require([
            'http://129.21.142.144:10303/socket.io/socket.io.js',
            'scripts/swOptions.js',
            'scripts/swPost.js',
            'scripts/swIndex.js',
            'scripts/swPreview.js',
            'scripts/helpers.js',
            'scripts/swPageTasks.js',
            'scripts/swDragPosts.js',     
            /*"scripts/jqx/gettheme.js",        
            "scripts/jqx/jquery-1.10.1.min.js",        
            "scripts/jqx/jqxcore.js",        
            "scripts/jqx/jqxbuttons.js",        
            "scripts/jqx/jqxscrollbar.js",        
            "scripts/jqx/jqxpanel.js",        
            "scripts/jqx/jqxdragdrop.js",        
            "scripts/jqx/jqxtree.js",        
            "scripts/jqx/treeHelpers.js"*/
        ], 
        function(){sw.loaded()}
);
    
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
    
    
    sw.socket = io.connect('http://129.21.142.144:10303');      //connect to socket io.
    sw.socket.emit("page", {list: sw.listName});
    
    for(toLoad in sw.onload){                                   //call all onload functions.
        sw.onload[toLoad]();
    }  
}
   
   















