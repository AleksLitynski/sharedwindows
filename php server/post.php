<?php

    //$_GET["page"], $_GET["lat"], $_GET["lng"], $_GET["msg"]  <- expected inputs
    include "mysqlHelperFunctions.php";




//santize global
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

//santize message
$msg = "";
if(isset($_GET["message"])) {
    $msg = $_GET["message"];
    if($msg == "") {
        echo "No Message Set";
        return;
    }
} else {
    echo "No Message Set";
    return;
}
//santize lat
$lat = 0;
if(is_numeric ($_GET["lat"])){
    $lat = $_GET["lat"];
}
//santize lng
$lng = 0;
if(is_numeric ($_GET["lng"])){
    $lat = $_GET["lng"];
}
//post
postPost($page, $msg, $lat, $lng);
?>