sw = {};
sw.socket;
sw.listName = "";
sw.onload = [];

window.onload = function() {
    
    sw.socket = io.connect('http://129.21.142.144:10303');     //connect to socket io.
    
    var page = document.URL.split("/");                         //get the name of the page.
    sw.listName = page[page.length-2];
    
    for(toLoad in sw.onload){                                   //call all onload functions.
        sw.onload[toLoad]();
    }
    
    
}



/*
//clean, simple, ajax wrapper
sw.ajax = function(target, onResponse, onFail){
    if(!onFail){
        onFail = function() {
                    console.log("request failed");
                    };
    }
    
    var xmlRequest = new XMLHttpRequest();
    xmlRequest.open("GET", target, true);
    xmlRequest.onreadystatechange = function ()
	{
		if(xmlRequest.readyState == 4 && xmlRequest.status == 200)
		{
			onResponse(xmlRequest.responseText);
		}
        else
        {
            if(xmlRequest.readyState == 4){
                onFail();
            }
        }
	}
    xmlRequest.send();//can contain a binary blog!!
}
*/

