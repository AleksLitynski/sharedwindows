/*
	This is the code used for dragging the width of the page. Works for mouse and touch
*/

sw.resizePage = {};
sw.resizePage.isDragging = false; //bool if its being dragged right now. Corolared with mousedown to know if it should move


sw.onload.push(function(){
	
	document.querySelector("#dragHandle").addEventListener("mousedown", down); //rigs up the callbacks
	window.addEventListener("mousemove", move);
	window.addEventListener("mouseup", up);

	document.querySelector("#dragHandle").addEventListener("touchstart", down);
	window.addEventListener("touchmove", move);
	window.addEventListener("touchend", up);


	function down(e){ //when the mouse or touch is down...
			sw.resizePage.isDragging = true;
			document.querySelector("#dragHandle").classList.add("activeDrag");

			document.querySelector("#previewPane").style.zIndex = "-5"; //force the iframe down, or when you drag over it, you lose contact with the bar. 
			for(var i = 0; i < document.querySelectorAll("body").length; i++){
				document.querySelectorAll("body")[i].classList.add("noHighlight");//toggle if it is highlighted
			}
	}
	function up(e){ //when the mouse or touch is up...
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
	function move(e){//when the drag is moved...

		if(e.touches && e.touches.length >= 1){
			if(sw.resizePage.isDragging){//get the first touch event
				e.stopPropagation();
	    		e.preventDefault();
	    	}
			e.x = e.touches[0].clientX;
		}

		sw.resizePage.updateFold(e.x);//update the fold
	}

	window.addEventListener("resize", resize);//redo the divide when the page resizes. Doesn't matter anymore. Was meant to keep shrinking the controlPanel when you dragged it smaller than its current size
	function resize(){
		sw.resizePage.updateFold( document.querySelector("#controlPanel").clientWidth );
	}
})


sw.resizePage.updateFold = function(x){ //moves the left and right sides of the fold. Can't off the left side, can go off the right side.
	if(x < 16.5){x = 16.5;}
	/*if(x < 0) {x = 1;}
	if(x > window.innerWidth) {
		x = window.innerWidth - 10; 
		if(x < screen.width) {
			x = window.innerWidth - 10;
		}
		document.querySelector("#controlPanel").style.width = x + "px";
		document.querySelector("#preview").style.left = (x + 3) + "px";}*/

	if(sw.resizePage.isDragging){ //only resize if its actually being dragged
		document.querySelector("#controlPanel").style.width = x + "px";
		document.querySelector("#previewPane").style.left = (x + 3) + "px";
	}
}
