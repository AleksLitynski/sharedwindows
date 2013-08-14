<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

    //checks if a given page exists. returns page id or -1.
    function checkForPage($pageName){
        $array =  mysql_fetch_array(mysql_query("select id from pages where name = '" . $pageName . "';"));
        if (isset($array['id'])){
            return $array['id'];
        } else {
            return -1;
        }
    }
    //returns all pages since a given page as an array.
    function getPostsSince($from, $since){
        $array =  mysql_fetch_assoc( mysql_query(  "select *
                                                    from posts
                                                    where pageId = (select id from pages where name = '$from')
                                                    and id > '$since';" ) );
        return $array;
    }
    
    //add a new post
    function postPost($pageName, $url, $latitude, $longitude){
        /*try{
            $doc = new DOMDocument;
            $doc->loadHTML(file_get_contents($url));
            $title = $doc->getElementsByTagName('title');
        } catch(Exception $e) {
            $title = "utitled";
        }
        try {
            $xml = simplexml_import_dom($doc);
            $arr = $xml->xpath('//link[@rel="shortcut icon"]');
            $thumbnail = $arr[0]['href'];
        } catch(Exception $e) {
            $thumbnail = "noThumbnail";
        }*/
        echo $pageName . " " . $url . " " . $latitude . " " . $longitude . " " ;//. $title . " " . $thumbnail;
        /*
        mysql_query("
                insert into posts(createdBy, latitude, longitude, url, title, thumbnail, pageId) values (
                '".$_SERVER['HTTP_REFERER']."',
                ".latitude.", ".latitude.",
                '".url."',
                '".$title."',
                '".$thumbnail."',
                (select id from pages where name = '".$pageName."')
        ")*/
    } 
?>