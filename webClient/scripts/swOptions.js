sw.onload.push(function(){

})


sw.option = {};



document.querySelector(".toggleOptionsBtn").onclick = function(){
	document.querySelector("#optionsBar").classList.toggle("openOptions");
	document.querySelector("#optionsBar").classList.toggle("closeOptions");

	if(document.querySelector("#optionsBar").classList.contains("openOptions")){
		closePostOptions();
	}


	sw.setPageHeight();
}


//document.querySelector("#postBox").onblur = closePostOptions;
function closePostOptions(){
	document.querySelector("#postOptionsBar").classList.remove("openOptions");
	document.querySelector("#postOptionsBar").classList.add("closeOptions");
}
document.querySelector("#cancelOptions").onclick = function(){
	console.log("sup")
	document.querySelector("#optionsBar").classList.toggle("openOptions");
	document.querySelector("#optionsBar").classList.toggle("closeOptions");
}



document.querySelector("#postBox").onfocus = makeNew;
document.querySelector("#newPageName").onfocus = makeNew;
function makeNew(){
	document.querySelector("#postOptionsBar").classList.remove("closeOptions");
	document.querySelector("#postOptionsBar").classList.add("openOptions");

	document.querySelector("#optionsBar").classList.remove("openOptions");
	document.querySelector("#optionsBar").classList.add("closeOptions");
}

document.querySelector("#cancelPost").onclick = function(){
	closePostOptions();
}



document.querySelector("#postAsList").onclick = function(){
	var asList = document.querySelector("#postAsList").checked;


	if(asList){

		document.querySelector("#newPageName").value = document.querySelector("#postBox").value;
		sw.page.touch();

		document.querySelector("#postBox").style.display = "none";
		document.querySelector("#newPageName").style.display = "";


		document.querySelector("#newPageName").focus();

	} else {

		document.querySelector("#postBox").value = document.querySelector("#newPageName").value;

		document.querySelector("#postBox").style.display = "";
		document.querySelector("#newPageName").style.display = "none";


		document.querySelector("#postBox").focus();

	}
}



document.querySelector("#postBox").addEventListener("keydown", clostPostOptionsBox);
document.querySelector("#newPageName").addEventListener("keydown", clostPostOptionsBox);
function clostPostOptionsBox(e){

	if(e.keyCode == "13") {
		if(e.srcElement.id == "newPageName"){
			if(sw.page.lastWasValid){
				closePostOptions();
				e.srcElement.blur();

			}
		} else {
			closePostOptions();
			e.srcElement.blur();
		}
	}
}