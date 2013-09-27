sw.page = {};
sw.page.lastWasValid = false;
sw.onload.push(function(){
    

    sw.socket.on("pageTask", function(data){
        if(data.type == "touch"){
            if(data.reply == "safe"){
                document.querySelector("#newPageName").classList.add("validName");
                document.querySelector("#newPageName").classList.remove("invalidName");
                sw.page.lastWasValid = true;
            } else {
                document.querySelector("#newPageName").classList.add("invalidName");
                document.querySelector("#newPageName").classList.remove("validName");
                sw.page.lastWasValid = false;
            }
        } 
    });


});

sw.page.create = function(pageName){
    if(sw.page.lastWasValid){
        var msg = "http://" + window.location.host + "/lists/" + document.querySelector("#newPageName").value;
        console.log(document.querySelector("#postToCurrent").checked);
        if(document.querySelector("#postToCurrent").checked){
            sw.post.post(msg, sw.listName, document.querySelector("#newPageName").value);
        }
        var name = document.querySelector("#newPageName").value;
        sw.socket.emit('pageTask', {
                                        pageName: name,
                                        type: "create",
                                        page: sw.listName
                                    } );

        document.querySelector("#newPageName").classList.remove("invalidName");
        document.querySelector("#newPageName").classList.remove("validName");
        document.querySelector("#listFeedback").value = msg;
        //document.querySelector("#newPageName").value = "";
    }
}

sw.page.touch = function(pageName){
    sw.socket.emit('pageTask', {
                                    pageName: document.querySelector("#newPageName").value,
                                    type: "touch",
                                    page: sw.listName
                                } );
}



sw.page.popOut = function(divToPop){
    var toPop = sw.helpers.getItemOfNode(divToPop).url;
    if(!(toPop.substr(0, 7) == "http://" || toPop.substr(0, 8) == "https://")){
        toPop = sw.helpers.getHPAddress(toPop);
    }
    
    console.log(toPop);
    var win=window.open(toPop, '_blank');
    win.focus();


}