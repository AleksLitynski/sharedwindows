<?php
/*
READ FROM GLOBAL:
select currentPostId 
from pages 
where name = 'global';
*//*
WRITE TO GLOBAL:
update pages as page
set page.currentPostId = 5 
where page.name = 'global';
*/

	mysql_connect("127.0.0.1", "root", "Silky1day");
	mysql_query("use sharedWindows");
	mysql_query("update posts set  currentPostId = " . 5 . " where name = global"); 
	echo "result: " . mysql_query("select currentPostId from posts where name = global");
	/*
    $in = $_GET["setOrGet"];
    	
    if($in == "set")
    {
        $file = "global";
        if(isset($_GET["file"]))
        {
            $file = $_GET["file"];
        }
		
		
        if(ctype_alnum($file) != false)
        {
			$result = mysql_query("select currentPostId from posts where name = global");
			console.log($result);
            echo "File does not exist";
            return;
        }
        
        $val = 0;
        if(is_numeric ($_GET["val"]))
        {
            $val = $_GET["val"];
        }
        
        $fileJson = json_decode(file_get_contents($file . "/meta.json"));
        $fileJson->{'currentLine'} = $val;
        echo $fileJson->{'currentLine'};
        file_put_contents($file . "/meta.json", json_encode($fileJson));
        
        
        var_dump($fileJson);
        $currentVal = json_decode(file_get_contents($file . "/meta.json"))->{'currentLine'};
        echo $currentVal;
    }
    if($in == "get")
    {
        $file = "global";
        if(isset($_GET["file"]))
        {
            $file = $_GET["file"];
        }

        if(!file_exists($file) or ctype_alnum($file) == false)
        {
            echo "File does not exist";
            return;
        }
        
        
        $val = -1;
        if(is_numeric ($_GET["val"]))
        {
            $val = $_GET["val"];
        }
        
         for($i = 0; $i < 30; $i++)
        {
        
            $currentVal = json_decode(file_get_contents($file . "/meta.json"))->{'currentLine'};
            if($currentVal != $val)
            {
                echo $currentVal;
                return;
            }
            
            usleep(1000000 * 0.5);
        }
        
        echo $val;
        return;
        
    }*/
?>