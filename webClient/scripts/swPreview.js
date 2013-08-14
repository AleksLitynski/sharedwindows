sw.preview = {};

sw.preview.current = "";

//called when a message image is clicked
sw.preview.itemClicked = function(node){
    sw.preview.display(node);
}

//loads a preview of a given node (currently only loads via http).
sw.preview.display = function(node) {

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



