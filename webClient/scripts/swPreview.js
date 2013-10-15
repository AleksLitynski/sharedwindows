/*
    This sucker loads the iframe preview. 
    Its a bit more than meets the eye:

    Gets an address. 
    -Check if its currently on the given address (even if its a string -> hackpad) and that its not currently on placeholder waiting for that address to load.
    -If none of those, it loads the placeholder for the page it really wants to load. This is so that if the page won't load, we have a message explaining why (I can't detect if the page didn't load)
    -when the page has loaded (I can tell if its from my own source) 
    --load the new source
    --if the new source is a url and not nytimes, really load it.
    --otherwise, load the hackpad page
*/

sw.preview = {};

sw.preview.current = "";

//loads a preview of a given address.
sw.preview.display = function( address ) {

    if(sw.preview.current != address && address != "/placeholder.html" && sw.preview.current != sw.helpers.getHPAddress(address)){ //One of the most convoluted lines of code in the program. Makes sure we want to load the preview right now!
        var newSrc = "/placeholder.html?newPage=" + address; //tell the placeholder what its a placeholder for
        document.querySelector("#preview").src = newSrc; 
        /*document.querySelector("#preview").onload = function(){
            console.log("loaded ");
        }*/
        //
        sw.preview.current = newSrc;
        document.querySelector("#preview").onload = function(){ 

            if(sw.preview.current != address && address != "/placeholder.html"){ //if its not a placeholder nad not already loaded...
                if( (address.substr(0, 7) == "http://" || address.substr(0, 8) == "https://") ){//and its a real address...
                        if(address.indexOf("nytimes.com") == -1){//AND its not nytimes...
                            //"http://3.hidemyass.com/includes/process.php?action=update&u=" + address
                            document.querySelector("#preview").src = address;
                            sw.preview.current = address;//Load-er up!
                        }
                    
                } else {

                    address = sw.helpers.getHPAddress(address);//otherwise load hackpad
                    document.querySelector("#preview").src = address;
                    sw.preview.current = address;
                } 
            }
        }
    }
    
}



