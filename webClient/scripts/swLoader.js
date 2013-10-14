require([
            'http://'+window.location.host+'/socket.io/socket.io.js',
            'scripts/swSetup.js',
            'scripts/swIndex.js',
            'scripts/swPreview.js',
            'scripts/helpers.js',
            'scripts/swPageTasks.js',
            'scripts/swOptions.js',
            'scripts/swResizePage.js',
            
            'scripts/postManipulation/swReorder.js',
            'scripts/postManipulation/swDelete.js',
            'scripts/postManipulation/swPost.js',
            'scripts/postManipulation/swDragIn.js',
            'scripts/libraries/dropzone.js'


        ], 
        function(){sw.loaded()}
);

sw = {}; //the object most of my code is in
sw.socket;
sw.listName = "";
sw.onload = []; //add functions to this list to have them loaded
sw.onloadEarly = []; //loaded before the other list
sw.loaded = function() {
    for(toLoad in sw.onloadEarly){                                   //call all onloadearly functions.
        sw.onloadEarly[toLoad]();
    }  
    for(toLoad in sw.onload){                                   //call all onload functions.
        sw.onload[toLoad]();
    }  
}
   
   



/*
function uploadImg(){
    console.log(document.querySelector("img"));
}



xmlhttp.open("POST","ajax_test.asp",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("fname=Henry&lname=Ford");

xmlhttp.onreadystatechange=function()
  {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
    document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
    }
  }
xmlhttp.open("GET","ajax_info.txt",true);

var fd = new FormData();
fd.append("image", document.querySelector("img"))

xmlhttp.send();
*/





