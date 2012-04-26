<?php
//~ for ($j=0;$j<1000;++$j) {	
	//~ $num = rand() % 1000;
	//~ $arr1 = array();
	//~ $arr2 = array();
	//~ for ($i=0;$i<$num;++$i) { $k = rand()."abc$i"; $v = rand(); $arr1[$k] = $v; $arr2[$k] = $v; }
	//~ foreach ($arr1 as $k => $v) { if ((rand() % 5) < 1) { $arr1[$k."baazaaam"] = $v; $arr2[$k."baazaaam"] = $v; } else { $arr1[$k] = $v + 1; } } // FAIL! insert-during-iterate
	//~ foreach ($arr1 as $k => $v) { if ((rand() % 5) < 1) { unset($arr1[$k]); unset($arr2[$k]); } else { $arr1[$k] = $v + 1; } } // success
	//~ foreach ($arr2 as $k => $v) if ($arr1[$k] != $v+1) DIE("FAIL!");
//~ }
//~ DIE("SUCCESS!");

function glob_recursive($pattern, $flags = 0,$prefix_remove=false,$prefix_add=""){//http://www.php.net/manual/en/function.glob.php#106595
	$files = glob($pattern, $flags);
	$prefix_remove_len = $prefix_remove ? strlen($prefix_remove) : 0;
	foreach ($files as $k => $file) $files[$k] = $prefix_add.substr($file,$prefix_remove_len);
	foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir){
		$files = array_merge($files, glob_recursive($dir.'/'.basename($pattern), $flags,$prefix_remove,$prefix_add));
	}
	return $files;
}
$game = isset($_GET['game'])?$_GET['game']:false;
//~ $game = "iyfct";
if (!file_exists(($game?$game:".")."/main.lua")) DIE("ERROR:no main.lua, file listing blocked\n");
$arr = glob_recursive(($game?$game:".")."/*",0,($game?$game:".")."/","./");
foreach ($arr as $ele) echo "$ele\n";
?>