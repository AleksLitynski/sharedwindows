<?php
    //$_GET["since"], $_GET["page"] <- expected inputs
    include "mysqlHelperFunctions.php";
    
    //useful mysql function
    mysql_connect("127.0.0.1", "root", "Silky1day");
	mysql_query("use sharedWindows");
    
    
    //get and sanatize page value.
    $page = "global";
    if(isset($_GET["page"]))
    {
        $page = mysql_real_escape_string($_GET["page"]);
    }
    if(checkForPage($page) == -1 or ctype_alnum($page) == false)
    {
        echo "File does not exist";
        return;
    }
    
    //get and sanatize since value
    $since = 0;
    if(is_numeric ($_GET["since"]))
    {
        $since = $_GET["since"];
    }
    
    
    
    //1) check if we are past the number they sent. => send to present and be done
    $posts = getPostsSince($page, $since);
   
    if($posts != false){
        echo json_encode($posts);
        return;
    }
    
    //2) loop. Every 0.1 second, check if we have any new lines. If we do, send the new lines and die (even if it doesn't go up to the max they said)
    for($i = 0; $i < 30; $i++)
    {
        $posts = getPostsSince($page, $since);
        if($posts != false){
        echo json_encode($posts);
        return;
    }
        usleep(1000000 * 0.5);
    }    
?>