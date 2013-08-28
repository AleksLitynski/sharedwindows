yepnope({
        load: [   
                    'http://129.21.142.144:10303/socket.io/socket.io.js',
                    'scripts/swOptions.js',
                    'scripts/swPost.js',
                    'scripts/swIndex.js',
                    'scripts/swPreview.js',
                           
                    "css/main.css",
                    "css/reset.css",
                    "css/options.css",
              
                    "css/jqx/jqx.base.css",        
                    "scripts/jqx/gettheme.js",        
                    "scripts/jqx/jquery-1.10.1.min.js",        
                    "scripts/jqx/jqxcore.js",        
                    "scripts/jqx/jqxbuttons.js",        
                    "scripts/jqx/jqxscrollbar.js",        
                    "scripts/jqx/jqxpanel.js",        
                    "scripts/jqx/jqxdragdrop.js",        
                    "scripts/jqx/jqxtree.js",        
                    "scripts/jqx/treeHelpers.js"    
              ],
        complete: function() {sw.loaded();}
    });
    
sw = {};
sw.socket;
sw.listName = "";
sw.onload = [];
sw.loaded = function() {
    //var page = document.URL.split("/");   page[page.length-2];//get the name of the page.
    sw.listName = "global";
    
    sw.socket = io.connect('http://129.21.142.144:10303');      //connect to socket io.
    sw.socket.emit("page", {list: sw.listName});
    
    for(toLoad in sw.onload){                                   //call all onload functions.
        sw.onload[toLoad]();
    }
        
        
        
    sw.socket.on("moveIndex", function(data){
        console.log(data);
    });
        
}
   
   
   
   
function clickedIt() {
    
    
    sw.socket.emit('moveIndex', {
                                    currentIndex: document.querySelector("#from").value,
                                    newIndex: document.querySelector("#to").value
                                });
}














