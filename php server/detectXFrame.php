<?php

    $site = $_GET["site"];
    $site = str_replace("https", "http", $site);  
    $siteHeaders = get_headers($site);
    
    function startsWith($haystack, $needle)
    {
        return !strncmp($haystack, $needle, strlen($needle));
    }
    if( startsWith($site, "http://www.nytimes.com/") or
        startsWith($site, "http://mapsengine"))
    {
        echo "true";
        return;
    }
    
    foreach($siteHeaders as $key => $value)
    {
    
        $val = explode(":", $value);
        if($val[0] == "X-Frame-Options" and $val[1] == " SAMEORIGIN")
        {
            echo "true";
            return;
        }
    }
    
    echo "false";
    
?>