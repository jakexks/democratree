<?php
    header("Content-Type: text/html");
    header('Access-Control-Allow-Origin: *');
    $lat = $_GET["lat"];
    $long = $_GET["long"];
    $im = imagecreatefrompng("http://orange.jakexks.com:8000/?lat=" . $lat. "&lon=" . $long . "&width=1&height=1");
    $rgb = imagecolorat($im, 0, 0);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    if ($r > 195 && $r < 214 && $g > 236 && $g < 256 && $b > 190 && $b < 210)
    {
        echo "true";
    }
    else
    {
        echo "false";
    }
