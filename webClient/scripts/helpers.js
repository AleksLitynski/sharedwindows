sw.helpers = {};


sw.helpers.ObjectPosition = function(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
              curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return curtop;
}

sw.helpers.childIndex = function(node) {
    var i = 1;
    while ((node = node.previousSibling) != null) {
        if (node.nodeType === 1) i++;
    }
    return i;
}

sw.helpers.isUrlAList = function(url){
    var segementPath = url.split("/");
    var newPageName = segementPath.pop().split("\n")[0];
    segementPath = segementPath.join("/");
    var localPath = window.location.toString().split("/");
    localPath.pop();
    localPath = localPath.join("/");
    if(localPath == segementPath){
        return newPageName;
    } else {
        return false;
    }
}


