<?php
    $ms = new mysqli("127.0.0.1", "root", "Silky1day", "sharedWindows");
    
    $result = $mysqli->query("SELECT * FROM posts");
?>