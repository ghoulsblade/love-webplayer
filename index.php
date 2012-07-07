<?php
// 2012-04-26 optional index.php that can be in game folder or in parent folder with multiple games in subfolders. automatically generates preload-image list
//~ error_reporting(-1);
// CONFIG
define("IMAGE_TYPES","png,jpg,gif");

// STOP CONFING'IN
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
  <?php $prefix = is_file("js/main.js") ? "" : "../" ?>
  <?php if(is_file("main.lua")){ ?>
    <link rel="stylesheet" href="<?php echo $prefix; ?>style.css" type="text/css">
    <script type="text/javascript" src="<?php echo $prefix; ?>js/lua-parser.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/lua-parser-utils.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/gamepad.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/jquery.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/jquery.hotkeys.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/utils.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/utils.webgl.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.render.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/main.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.audio.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.event.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.filesystem.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.font.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.graphics.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.image.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.joystick.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.keyboard.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.mouse.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/Box2dWeb-2.1.a.3.min.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.physics.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.sound.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.thread.js"></script>
    <script type="text/javascript" src="<?php echo $prefix; ?>js/love.timer.js"></script>
    <script type="text/javascript">gShaderCode_Fragment = LoadShaderCode("<?php echo $prefix; ?>js/fragment.shader");</script>
    <script type="text/javascript">gShaderCode_Vertex   = LoadShaderCode("<?php echo $prefix; ?>js/vertex.shader");</script>
    <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
    <?php } ?>
    <title>Love Webplayer</title>
  </head>
<?php 
if(is_file("main.lua")){
  chdir($_GET['run']);
  $data = glob_recursive("*.{".IMAGE_TYPES."}",GLOB_BRACE);
  $output = array();
  foreach($data as $file){
    if(substr($file,0,2)=="./"){
      $file = substr($file,2);
    }
    $output[].= "'".$file."'";
  }
?>
  <body onload="LoveFileList('<?php echo isset($game)?"../filelist.php?game=$game":"filelist.php"; ?>'); MainOnLoad([<?php echo implode(",",$output); ?>])">
    <h1>Love Webplayer</h1>
      <canvas id="glcanvas" width="800" height="600">
        Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.  
      </canvas>
      <div id="output" style="font-family: Courier New,Courier,monospace;"></div>
<?php } else { ?>
  <body>
    <h1>Love Webplayer</h1>
    <ul>
<?php
foreach(glob("*/main.lua") as $game){
  $path = dirname($game)."/index.php";
  if(!is_file($path)){
    if(is_writable($path)){
      file_put_contents($path,"<?php ".'$game = "'.addslashes($game).'";'."\n"."require(\"../index.php\");\n");
    } else {
      echo "<i>Unable to write to</i> <code>$path</code> <br/>";
    }
  }
  if(is_file($path)){
    echo "      <li><a href=\"$name\">Run ".dirname($game)."</a></li>\n";
  }
}
?>
    </ul>
<?php } ?>
  </body>
</html>
