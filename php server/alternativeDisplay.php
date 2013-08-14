<?php
    
    if(isset($_GET["text"]))
    {
        echo $_GET["text"];
    }
    
    if(isset($_GET["xFrame"]))
    {
        echo $_GET["xFrame"] . " has asked us not to display their contents.";
    }

?>