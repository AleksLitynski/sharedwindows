sw.dragIn = {};

//doesn't do anything on load.
//A lot of this is left over from when there were multiple trees. 
sw.onload.push(function(){ 


})

//prevent default actions when you drag over the page div. Used for more when it was a tree
document.querySelector("#page").ondragover = function(e){
    //sw.dragIn.showHide(e, "hide");
    
    e.stopPropagation(); e.preventDefault();
};
document.querySelector("#page").ondragleave = function(e){
    //sw.dragIn.showHide(e, "show");

    e.stopPropagation(); e.preventDefault();
};


document.querySelector("#page").ondrop = function(e){


    e.stopPropagation();
    e.preventDefault();



    if(!placeholder.classList.contains("draggedMessage")){ //when you drop an item into the page, post the item to the page. 
        var list = sw.helpers.getListOfNode(e.target);

        var dropOver = e.target;
        
        while(dropOver && dropOver.classList && !dropOver.classList.contains("message")){
            if(dropOver.parentNode == undefined) {
                return false;
            }
            dropOver = dropOver.parentNode;
        }
        
        var text = String(e.dataTransfer.getData('Text'));
        if(text != ""){
            sw.post.post(text, list);
        }

        //read in the image if it was drag + dropped
        sw.dragIn.getImageData(e.dataTransfer.files[0]);
        

    }

};


document.querySelector("#uploadFile").onchange = function(e){
    //document.querySelector(".cabinet").innerHTML = ' <input id="uploadFile" type="file"></input>';
    //console.log("?");
    sw.dragIn.getImageData(e.srcElement.files[0]);

}


sw.dragIn.getImageData = function(src){

    sw.dragIn.uploadImage(src);

    /*var reader = new FileReader();
    reader.onload = function(event) {
        var imageBinary = event.target.result;
        sw.dragIn.uploadImage(imageBinary, src.name, src);
    };
    reader.readAsBinaryString(src); //readAsDataURL readAsBinaryString readAsArrayBuffer*/
   
    //var img = document.createElement("img");
    //img.src = imageUri;
    //document.body.appendChild(img);
}


sw.dragIn.uploadImage = function(src){//fileData, name, 
    
    var target = window.location.protocol + "//" + window.location.host + "/upload";
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            var imageUrl = window.location.protocol + "//" + window.location.host + xmlhttp.responseText;
            var _text    = xmlhttp.responseText.split("/");
            var padUrl   = sw.helpers.getHPAddress(_text[_text.length-1]);
            var netUrl   = window.location.protocol + "//" + window.location.host + "/imageWrapper.html?pad=" + padUrl + "&image=" + imageUrl;
            console.log(netUrl);
            
            sw.post.send(netUrl, _text[_text.length-1]);
        }
    }
    xmlhttp.open("POST", target, true);


    if(src != undefined){
        var formData = new FormData();
        formData.append("file", src);
        xmlhttp.send(formData);
    }

}
