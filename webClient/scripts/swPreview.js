sw.preview = {};

sw.preview.current = "";

//loads a preview of a given address.
sw.preview.display = function( address ) {
    
    for(child in document.querySelector("#page").children){child = document.querySelector("#page").children[child];
        if(child.style) {
            child.style.backgroundColor = "#e1e1e1";
        }
    }
    if(address.substr(0, 7) == "http://" || address.substr(0, 8) == "https://"){
        if(sw.preview.current != address){ 
            document.querySelector("#previewImage").src = address;
            sw.preview.current = address;
        }
    } else {
        document.querySelector("#previewImage").src = "about:blank";
        sw.preview.current = "about:blank";
    }
    
}



