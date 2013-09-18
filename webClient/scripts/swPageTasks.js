sw.page = {};
sw.onload.push(function(){
    

    sw.socket.on("pageTask", function(data){
        //console.log(data);
    });

});

sw.page.create = function(pageName){
    if(document.querySelector("#postToCurrent").checked){
        var msg = "http://" + window.location.host + "/lists/" + document.querySelector("#newPageName").value;
        sw.post.post(msg, sw.listName);
    }
    sw.socket.emit('pageTask', {
                                    pageName: document.querySelector("#newPageName").value,
                                    type: "create",
                                    page: sw.listName
                                } );
}

sw.page.touch = function(pageName){
    sw.socket.emit('pageTask', {
                                    pageName: document.querySelector("#newPageName").value,
                                    type: "touch",
                                    page: sw.listName
                                } );
}

