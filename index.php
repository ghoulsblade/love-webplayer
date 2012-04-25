<?php


function glob_recursive($pattern, $flags = 0){//http://www.php.net/manual/en/function.glob.php#106595
  $files = glob($pattern, $flags);
  foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir){
    $files = array_merge($files, glob_recursive($dir.'/'.basename($pattern), $flags));
  }
  return $files;
}

?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html>
  <head>
    <link rel="stylesheet" href="./style.css" type="text/css">
    <script type="text/javascript" src="./js/lua-parser.js"></script>
    <script type="text/javascript" src="./js/gamepad.js"></script>
    <script type="text/javascript" src="./js/jquery.js"></script>
    <script type="text/javascript" src="./js/jquery.hotkeys.js"></script>
    <script type="text/javascript" src="./js/utils.js"></script>
    <script type="text/javascript" src="./js/utils.webgl.js"></script>
    <script type="text/javascript" src="./js/love.render.js"></script>
    <script type="text/javascript" src="./js/main.js"></script>
    <script type="text/javascript" src="./js/love.audio.js"></script>
    <script type="text/javascript" src="./js/love.event.js"></script>
    <script type="text/javascript" src="./js/love.filesystem.js"></script>
    <script type="text/javascript" src="./js/love.font.js"></script>
    <script type="text/javascript" src="./js/love.graphics.js"></script>
    <script type="text/javascript" src="./js/love.image.js"></script>
    <script type="text/javascript" src="./js/love.joystick.js"></script>
    <script type="text/javascript" src="./js/love.keyboard.js"></script>
    <script type="text/javascript" src="./js/love.mouse.js"></script>
    <script type="text/javascript" src="./js/love.physics.js"></script>
    <script type="text/javascript" src="./js/love.sound.js"></script>
    <script type="text/javascript" src="./js/love.thread.js"></script>
    <script type="text/javascript" src="./js/love.timer.js"></script>
    <script type="text/javascript">gShaderCode_Fragment = LoadShaderCode("./js/fragment.shader");</script>
    <script type="text/javascript">gShaderCode_Vertex   = LoadShaderCode("./js/vertex.shader");</script>
    <title>Love Webplayer</title>
    <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
  </head>
<body>
<h1>Love Webplayer</h1>
<?php if($_GET['run'] and is_file($_GET['run']."/main.lua")){ ?>

<?php
chdir($_GET['run']);
$data = glob_recursive("*.{png,jpg,gif}",GLOB_BRACE);
$output = array();
foreach($data as $file){
  if(substr($file,0,2)=="./"){
    $file = substr($file,2);
  }
  $output[].= "'".$_GET['run']."/".$file."'";
}
?>
    <body onload="MainOnLoad([<?php echo implode(",",$output); ?>])">
    <canvas id="glcanvas" width="800" height="600">
Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.  
</canvas>
<div id="output" style="font-family: Courier New,Courier,monospace;"></div>

<?php } else { ?>
    <ul>
<?php
foreach(glob("*/main.lua") as $game){
  echo "      <li><a href=\"index.php?run=".dirname($game)."\">Run ".dirname($game)."</a></li>\n";
}
?>
    </ul>
<?php } ?>

  </body>
</html>
