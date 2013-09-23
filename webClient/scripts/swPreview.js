sw.preview = {};

sw.preview.current = "";

//loads a preview of a given address.
sw.preview.display = function( address ) {

    if(sw.preview.current != address){

        var newSrc = "/placeholder.html";
        document.querySelector("#previewImage").src = newSrc;
        //
        sw.preview.current = newSrc;
        document.querySelector("#previewImage").onload = function(){

            if(sw.preview.current != address && address != "/placeholder.html"){
                if(address.substr(0, 7) == "http://" || address.substr(0, 8) == "https://"){
                        document.querySelector("#previewImage").src = address;
                        sw.preview.current = address;
                    
                } else {
                    address = "https://sharedwindows.hackpad.com/" + encodeURI(address);
                    document.querySelector("#previewImage").src = address;
                    sw.preview.current = address;
                } 
            }
        }
    }
    
}



