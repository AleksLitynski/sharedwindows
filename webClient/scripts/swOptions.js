sw.options = {};
sw.options.lastClick = "";

/*sw.options.followTheLeader = false;
sw.options.*/

sw.options.showViewOptions = function(){
    sw.options.enableView();
    
    sw.options.disableNew();
    sw.options.disableOption();
    
    if(sw.options.lastClick == "view"){
        sw.options.disableView();
        sw.options.lastClick = "";
    }
    else {
        sw.options.lastClick = "view";
    }
    
}
sw.options.showCreateNew = function(){
    sw.options.enableNew();
    
    sw.options.disableOption();
    sw.options.disableView();
    
    if(sw.options.lastClick == "new"){
        sw.options.disableNew();
        sw.options.lastClick = "";
    }
    else {
        sw.options.lastClick = "new";
    }
    
}
sw.options.showMoreOptions = function(node){
    sw.options.enableOption();
    
    sw.options.disableNew();
    sw.options.disableView();
    
    if(sw.options.lastClick == "options"){
        sw.options.disableOption();
        sw.options.lastClick = "";
    }
    else {
        sw.options.lastClick = "options";
    }
    
}
                
                
sw.options.enableNew = function(){document.querySelector("#createNew").style.display = "block"; document.querySelector("#showNewBtn").style.backgroundColor = "#B4D8E7";}
sw.options.disableNew = function(){document.querySelector("#createNew").style.display = "none"; document.querySelector("#showNewBtn").style.backgroundColor = "white";}

sw.options.enableOption = function(){document.querySelector("#moreOptions").style.display = "block"; document.querySelector("#showMoreBtn").style.backgroundColor = "#B4D8E7";}
sw.options.disableOption = function(){document.querySelector("#moreOptions").style.display = "none"; document.querySelector("#showMoreBtn").style.backgroundColor = "white";}

sw.options.enableView = function(){document.querySelector("#viewOptions").style.display = "block"; document.querySelector("#showViewBtn").style.backgroundColor = "#B4D8E7";}
sw.options.disableView = function(){document.querySelector("#viewOptions").style.display = "none"; document.querySelector("#showViewBtn").style.backgroundColor = "white";}