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