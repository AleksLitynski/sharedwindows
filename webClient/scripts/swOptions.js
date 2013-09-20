sw.onload.push(function(){

	//document.querySelector("#showNewBtn").onmouseover = sw.option.open;
	document.querySelector("#showNewBtn").onclick = sw.option.open;
	document.querySelector("#closeOption").onclick = sw.option.close;
})


sw.option = {};
sw.option.isOpen = false;

sw.option.open = function(e){
	if(sw.option.isOpen){
		document.querySelector("#createNew").style.display = "";
	} else {
		document.querySelector("#createNew").style.display = "inline";
	}
	sw.option.isOpen = !sw.option.isOpen;
}
sw.option.close = function(e){
	document.querySelector("#createNew").style.display = "";
	sw.option.isOpen = false;
}