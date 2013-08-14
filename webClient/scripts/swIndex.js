sw.index = {};
sw.index.current = 0;

//poll for current page from the server.
sw.index.get = function(){
    sw.ajax("../changeCurrentPost.php?setOrGet=get&val=" + sw.current, function(res){

            if(sw.current != res && document.querySelector("#followTheLeader").checked){
                sw.loadPreviewOf(document.querySelector("#rollingLinks").children[res]);
                sw.current = res;
            }
            console.log("node should be: " + res);
            sw.gotoCurrent();
        });
}

//sends the current page to the server
sw.index.set = function(current){
    sw.index.current = 0;
    sw.ajax("../changeCurrentPost.php?setOrGet=set&val=" + current, function(res){ });
}






//http://edgetable.com/sharedWindows/changeCurrentPost.php?setOrGet=set&val=14
//http://edgetable.com/sharedWindows/changeCurrentPost.php?setOrGet=get

//http://edgetable.com/sharedWindows/changecurrentPost.php?setOrGet=set&val=7 <-set
//http://edgetable.com/sharedWindows/changecurrentPost.php?setOrGet=get&val=7 <-get