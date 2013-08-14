sw = {};
sw.currentPreview = "";
sw.postTo = 0;

window.onload = function() {
    var postTo = document.URL.split("/"); //should embed in page!
    sw.postTo = postTo[postTo.length-2];
    sw.loadPosts(0);
    sw.current = 0;
    sw.gotoCurrent();
    
    console.error = console.log;
}

//called when a message image is clicked
sw.msgclicked = function(node){
    sw.loadPreviewOf(node);
    
}

//loads a preview of a given node (currently only loads via http).
sw.loadPreviewOf = function(node) {

    console.log(node);
    for(child in document.querySelector("#rollingLinks").children){child = document.querySelector("#rollingLinks").children[child];
        if(child.style)
        {
            child.style.backgroundColor = "#e1e1e1";
        }
    }
    node.style.backgroundColor = "#B4D8E7";


    if(node.innerHTML.substr(0, 7) == "http://" || node.innerHTML.substr(0, 8) == "https://"){
        var newSite = node.innerHTML;
        if(sw.currentPreview != newSite){
            
            document.querySelector("#previewImage").src = "../placeholder.php";
            
            sw.ajax("../detectXFrame.php?site=" + newSite, function(res){
                console.log(newSite + " " + res);
                if(res == "false"){
                    document.querySelector("#previewImage").src = "";
                    document.querySelector("#previewImage").src = newSite;
                }
                else{
                    document.querySelector("#previewImage").src = "../alternativeDisplay.php?xFrame=" + newSite;
                }
            });
        
        }
    }
    else{
        document.querySelector("#previewImage").src = "../alternativeDisplay.php?text=" + node.innerHTML;
    }
    
    function getIndex(node) {
        var n = 0;
        while (node = node.previousSibling){
            n++;
        }
        return n;
    }
    sw.sendCurrent(getIndex(node));
}

//poll for current page from the server.
sw.gotoCurrent = function(){
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
sw.sendCurrent = function(current){
    sw.ajax("../changeCurrentPost.php?setOrGet=set&val=" + current, function(res){ });
}

//http://edgetable.com/sharedWindows/changeCurrentPost.php?setOrGet=set&val=14
//http://edgetable.com/sharedWindows/changeCurrentPost.php?setOrGet=get

//http://edgetable.com/sharedWindows/changecurrentPost.php?setOrGet=set&val=7 <-set
//http://edgetable.com/sharedWindows/changecurrentPost.php?setOrGet=get&val=7 <-get
