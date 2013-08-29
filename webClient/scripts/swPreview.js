sw.preview = {};

sw.preview.current = "";

//loads a preview of a given address.
sw.preview.display = function( address ) {
    
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



