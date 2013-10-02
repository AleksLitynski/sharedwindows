sw.resizePage = {};
sw.resizePage.isDragging = false;


sw.onload.push(function(){
	
	document.querySelector("#dragHandle").addEventListener("mousedown", down);
	window.addEventListener("mousemove", move);
	window.addEventListener("mouseup", up);

	document.querySelector("#dragHandle").addEventListener("touchstart", down);
	window.addEventListener("touchmove", move);
	window.addEventListener("touchend", up);


	function down(e){
			sw.resizePage.isDragging = true;
			document.querySelector("#dragHandle").classList.add("activeDrag");

			document.querySelector("#previewPane").style.zIndex = "-5";
			for(var i = 0; i < document.querySelectorAll("body").length; i++){
				document.querySelectorAll("body")[i].classList.add("noHighlight");
			}
	}
	function up(e){
			document.querySelector("#dragHandle").classList.remove("activeDrag");
		if(e.touches && e.touches.length >= 1){
			e.x = e.touches[0].clientX;
		}
		sw.resizePage.updateFold(e.x);
		sw.resizePage.isDragging = false;
		document.querySelector("#previewPane").style.zIndex = "";

		for(var i = 0; i < document.querySelectorAll("body").length; i++){
			document.querySelectorAll("body")[i].classList.remove("noHighlight");
		}
	}
	function move(e){

		if(e.touches && e.touches.length >= 1){
			if(sw.resizePage.isDragging){
				e.stopPropagation();
	    		e.preventDefault();
	    	}
			e.x = e.touches[0].clientX;
		}

		sw.resizePage.updateFold(e.x);
	}

	window.addEventListener("resize", resize);
	function resize(){
		sw.resizePage.updateFold( document.querySelector("#controlPanel").clientWidth );
	}
})


sw.resizePage.updateFold = function(x){
	if(x < 16.5){x = 16.5;}
	/*if(x < 0) {x = 1;}
	if(x > window.innerWidth) {
		x = window.innerWidth - 10; 
		if(x < screen.width) {
			x = window.innerWidth - 10;
		}
		document.querySelector("#controlPanel").style.width = x + "px";
		document.querySelector("#preview").style.left = (x + 3) + "px";}*/

	if(sw.resizePage.isDragging){
		document.querySelector("#controlPanel").style.width = x + "px";
		document.querySelector("#previewPane").style.left = (x + 3) + "px";
	}
}
