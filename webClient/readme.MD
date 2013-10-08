Web Client:
===========

### When you load the page:
Navigating to `"/lists/..."` will load `index.html` with slight modifications. The title element will have been swapped out. Other scripted changes may also be made.

`Index.html` contains the framework of the program. It loads css files, require.js (a library for loading javascript) and swLoader. SwLoader uses require to load all other scripts.

After everything loads, all functions in sw.onloadEarly are called, then all functions in sw.onload.

swSetup acts on that early load. It extracts the current list name from the url. It loads the nodejs server address via `"/config"`. Then it does a little graphical setup that was a real pain in CSS. It also sets a loop that checks every (5s, 0.5s?) if the server connection has been lost.

### Other Scripts Overview:

* `helpers.js` A few helpful functions. Extract a list name or a node name from a dom element. If you have the image on a post, this has functions to see what post it is part of, what list it is part of, what the parent element is, etc. It has a few other helpful suprises as well. A function to convert a string to a hackpad address, for istance.
* `swIndex.js` When you change what item is selected (clicking an item), this script deals with it. It tells the server, changes the highlight, listens to see if the server approved, etc.
* `swOptions.js` Open and close button on the options script. Actually, we got rid of that. This script is trash.
* `pageTask.js` Checking is a page is valid, changing the color of that box, and requesting that a new page get made.
* `swPreview.js` Loads previews of pages. IE: the iframe controller.
* `swResizePage.js` The script for dragging the left div larger and smaller. A little abstract to handle both touch and mouse.
* `libraries`
    * `require.js`Used for script loading. index.html was getting cluttered.
* `postManipulation` These scripts are for adding/removing/ordering scripts
    * `swDelete.js` this script requests that the server delete content. If the server removes content, it mirrors it.
    * `swDragIn.js` Allows user to drag elements into the list anywhere to post them. A lot of commented out code here. Used to support dragging into multiple lists, and into indexes of lists.
    * `swReorder.js` used for dragging elements around. Drag or mouse drag. Phrased a little oddly because it used to support nested lists as well.
    * `swPost.js` Probably the largest file here. Deals with building a model of the posts and mirroring them into the dom. `sw.post.display` is the _BIG_ one. When an item is added, the while left column is redrawn from the data.

### Other Stuff:
`css/...` has both css files and images. Images are split between bkgs and images. Most aren't used.
####CSS:
* `items.css` Styling that pertains to the items in the left hand column. Thumbnail, onhover drag handle, background color, etc.
* `main.css` A bit of a kluge. Has stlye for the whole left and right columns (_conrolPanel_ and _preview_, respectivly)
* `newarea.css` The top of the controlPanel. Little round posting box. Doesn't include the drag handle.
* `options.css` The bottom of the controlPanel. Stying for the options.
* `reset.css` generic css reset. I google "css reset", this was the first result.

`favicon.ico` is the pages icon. `sFavicon.PNG` is the placeholder favicon when we can't find a better one.

`placeholder.html` is loaded before every other preview. It is then overwritten. If it isn't overwritten it auto-opens the link the server embedded in it when it was loaded.


