sharedwindows
=============

Share a browsing experience. Great for file sharing too!


How to use (pre-pre-pre-alpha):
1) Open "webClient/scripts/main.js" around line 11 (sw.socket = io.connect('http://129.21.142.144:10303');) change the IP address to your local machine.
2) Open cmd in webClient.  Run: "python -m SimpleHTTPServer"
3) Open cmd in nodeServer. Run: "node server.js"
4) Go to "localhost:8000" in a browser.