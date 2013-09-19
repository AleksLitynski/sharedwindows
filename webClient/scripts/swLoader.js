require([
            'http://'+window.location.hostname+':10303/socket.io/socket.io.js',
            'scripts/swSetup.js',
            'scripts/swIndex.js',
            'scripts/swPreview.js',
            'scripts/helpers.js',
            'scripts/swPageTasks.js',
            
            'scripts/postManipulation/swReorder.js',
            'scripts/postManipulation/swDelete.js',
            'scripts/postManipulation/swPost.js',
            'scripts/postManipulation/swDragIn.js'
        ], 
        function(){sw.loaded()}
);

sw = {};
sw.socket;
sw.listName = "";
sw.onload = [];
sw.loaded = function() {
    for(toLoad in sw.onload){                                   //call all onload functions.
        sw.onload[toLoad]();
    }  
}
   
   















