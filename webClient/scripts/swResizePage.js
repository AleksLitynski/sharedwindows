sw.resizePage = {};
sw.resizePage.isDragging = false;


sw.onload.push(function(){
	
	document.querySelector("#dragHandle").onmousedown = function(e){
			sw.resizePage.isDragging = true;

			document.querySelector("#preview").style.zIndex = "-5";
			document.querySelector("#previewImage").style.zIndex = "-5";
	}

	window.addEventListener("mouseup", function(e){
		sw.resizePage.updateFold(e.x);
		sw.resizePage.isDragging = false;
		document.querySelector("#preview").style.zIndex = "";
		document.querySelector("#previewImage").style.zIndex = "";
	});

	window.onmousemove = function(e){
			
		sw.resizePage.updateFold(e.x);
	}


})


sw.resizePage.updateFold = function(x){
	if(sw.resizePage.isDragging){
		document.querySelector("#controlPanel").style.width = x + "px";
		document.querySelector("#preview").style.left = (x + 10) + "px";
	}
}
