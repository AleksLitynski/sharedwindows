sw.resizePage = {};
sw.resizePage.isDragging = false;


sw.onload.push(function(){
	
	document.querySelector("#dragHandle").onmousedown = function(e){
			sw.resizePage.isDragging = true;

			document.querySelector("#preview").style.zIndex = "-5";
			for(var i = 0; i < document.querySelectorAll("body").length; i++){
				document.querySelectorAll("body")[i].classList.add("noHighlight");
			}
	}

	window.addEventListener("mouseup", function(e){
		sw.resizePage.updateFold(e.x);
		sw.resizePage.isDragging = false;
		document.querySelector("#preview").style.zIndex = "";

		for(var i = 0; i < document.querySelectorAll("body").length; i++){
			document.querySelectorAll("body")[i].classList.remove("noHighlight");
		}
	});

	window.onmousemove = function(e){
			
		sw.resizePage.updateFold(e.x);
	}

	window.addEventListener("resize", function(){
		sw.resizePage.updateFold( document.querySelector("#controlPanel").clientWidth );
	})

})


sw.resizePage.updateFold = function(x){
	if(x < 0) {x = 1;}
	if(x > window.innerWidth) {x = window.innerWidth - 4;}

	if(sw.resizePage.isDragging){
		document.querySelector("#controlPanel").style.width = x + "px";
		document.querySelector("#preview").style.left = (x + 3) + "px";
	}
}
