//loads all posts since a given post. Just pass in 0 to get all posts to date.
sw.loadPosts = function(since){
    sw.ajax("../getPosts.php?postedTo=" + sw.postTo + "&since=" + since, function(text){
            var posts = text.split("\n");
            var htmlPosts = document.querySelector("#rollingLinks").innerHTML;
            for(post in posts){post = posts[post];
                var msg = post.split(" ").slice(3, post.length-1).join(" ");
                if(msg != undefined && msg != ""){
                    htmlPosts = "<div class='message text' onclick='sw.msgclicked(this)'>"+ msg +"</div>" + htmlPosts;
                }
            }
            document.querySelector("#rollingLinks").innerHTML = htmlPosts;
            sw.loadPosts(document.querySelector("#rollingLinks").children.length);
            
            if(posts.length != 1 && document.querySelector("#jumpToCurrent").checked){
                sw.loadPreviewOf(document.querySelector("#rollingLinks").children[0]);
            }
        });
}

//submits a new post
sw.post = function() {
    navigator.geolocation.getCurrentPosition(function(pos){
        var msg = document.querySelector("#postBox").value;
        sw.ajax("../post.php?postTo=" + sw.postTo + "&message=" + msg + "&lat=" + pos.coords.latitude + "&lng" + pos.coords.longitude, function(res){
            document.querySelector("#postBox").value = "";
            
            console.log("successfully posted: " + res);
        });
    });
}

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