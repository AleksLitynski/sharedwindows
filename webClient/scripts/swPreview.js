sw.preview = {};

sw.preview.current = "";

//loads a preview of a given address.
sw.preview.display = function( address ) {


    var newSrc = "/placeholder.html";
    //document.querySelector("#pageName").value = newSrc;
    document.querySelector("#previewImage").src = newSrc;
    sw.preview.current = newSrc;
    document.querySelector("#previewImage").onload = function(){

        if(address.substr(0, 7) == "http://" || address.substr(0, 8) == "https://"){
            if(sw.preview.current != address){ 
                /*if(address.substring(0, "http://127.0.0.1/lists/".length) != "http://127.0.0.1/lists/"){
                    document.querySelector("#pageName").value = address;
                } else {
                    document.querySelector("#pageName").value = address.slice("http://127.0.0.1/lists/".length, address.length);
                }*/
            
                document.querySelector("#previewImage").src = address;
                sw.preview.current = address;
            }
        } else {
            address = "https://sharedwindows.hackpad.com/" + encodeURI(address);
            document.querySelector("#previewImage").src = address;
            sw.preview.current = address;
        } 
    }
    
}



