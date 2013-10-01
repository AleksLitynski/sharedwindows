sw.preview = {};

sw.preview.current = "";

//loads a preview of a given address.
sw.preview.display = function( address ) {

    if(sw.preview.current != address && address != "/placeholder.html" && sw.preview.current != sw.helpers.getHPAddress(address)){
        var newSrc = "/placeholder.html?newPage=" + address;
        document.querySelector("#previewImage").src = newSrc;
        /*document.querySelector("#previewImage").onload = function(){
            console.log("loaded ");
        }*/
        //
        sw.preview.current = newSrc;
        document.querySelector("#previewImage").onload = function(){

            if(sw.preview.current != address && address != "/placeholder.html"){
                if( (address.substr(0, 7) == "http://" || address.substr(0, 8) == "https://") ){
                        if(address.indexOf("nytimes.com") == -1){
                            document.querySelector("#previewImage").src = address;
                            sw.preview.current = address;
                        }
                    
                } else {

                    address = sw.helpers.getHPAddress(address);
                    document.querySelector("#previewImage").src = address;
                    sw.preview.current = address;
                } 
            }
        }
    }
    
}



