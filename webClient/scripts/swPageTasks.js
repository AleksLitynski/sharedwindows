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
    if(!IsURL(toPop)){
        toPop = sw.helpers.getHPAddress(toPop);
    }
    function IsURL(url) {

    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
            + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
            + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
            + "|" // 允许IP和DOMAIN（域名）
            + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
            + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
            + "[a-z]{2,6})" // first level domain- .com or .museum
            + "(:[0-9]{1,4})?" // 端口- :80
            + "((/?)|" // a slash isn't required if there is no file name
            + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
         var re=new RegExp(strRegex);
         return re.test(url);
     }
    console.log(toPop);
    var win=window.open(toPop, '_blank');
    win.focus();


}