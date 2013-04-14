var gFilesystemPrefix = "unnamed-";
var gFilesystemEnumerateList;
var gFilesystemEnumerateIsDirectory = {};
var gFilesystemEnumerateIsFile = {};


function LoveFSNormalizePath (path) {
	if (path.length >= 2 && path.substring(0,2) == "./") path = path.substring(2);
	if (path.length >= 1 && path.substring(0,1) == "/") path = path.substring(1);
	if (path.length >= 1 && path.substring(path.length-1) == "/") path = path.substring(0,path.length-1);
	return path;
}

/// call LoveFileList('filelist.txt') in index.html body onload to enable love.filesystem.enumerate
/// newline separated file paths, e.g. linux commandline "find . > filelist.txt"
function LoveFileList (url) {
	MainPrint("LoveFileList",url);
	MyProfileStart("LoveFileList:download:"+url);
	UtilAjaxGet(url, function (contents) {
		if (contents) {
			gFilesystemEnumerateList = {};
			MyProfileStart("LoveFileList:split:"+url);
			var paths = contents.split("\n");
			MyProfileStart("LoveFileList:analyze:"+url);
			for (var i in paths) {
				var path = LoveFSNormalizePath(paths[i]);
				if (path == "" || path == "." || path == "..") continue;
				var parts = path.split("/");
				var basename = parts.pop();
				var parentpath = parts.join("/");
				var pathlist = gFilesystemEnumerateList[parentpath];
				if (!pathlist) { pathlist = []; gFilesystemEnumerateList[parentpath] = pathlist; }
				pathlist.push(basename);
				gFilesystemEnumerateIsFile[path] = true;
				gFilesystemEnumerateIsDirectory[parentpath] = true;
				gFilesystemEnumerateIsFile[parentpath] = false;
			}
			MyProfileEnd();
		}
	}, true);
}

// Returns a table with the names of files and subdirectories in the directory in an undefined order. 
// example: "dira" contains 1 file (a.txt) and 2 subdirs (diraa,dirab) :   love.filesystem.enumerate("dira") (="dira/") = {"a.txt","diraa","dirab"}
function LoveFilesystemEnumerate (path) {
	if (!gFilesystemEnumerateList) return NotImplemented(pre+'enumerate (try index.html body onload : LoveFileList("filelist.txt") from "find . > filelist.txt")');
	var res = {};
	if (path.substring(path.length - 1) == "/") path = path.substring(0,path.length - 1); // remove trailing /
	path = LoveFSNormalizePath(path);
	// TODO : evaluate ./ and ../ , js-regex ? 
	var pathlist = gFilesystemEnumerateList[path];
	if (pathlist) for (var i in pathlist) res.uints[parseInt(i)+1] = pathlist[i]; 
	return [res];
}

function LoveFS_isDir (path) {
	var res = gFilesystemEnumerateIsDirectory[LoveFSNormalizePath(path)] || LoveFS_localStore_isDir(path) || 
		(!gFilesystemEnumerateList && path.substr(path.length-1) == "/"); // Directory name
	return res == true;
}

// just testing regexp vs the string is not enough, ajax test
function LoveFS_localStore_isDir (path) {
	if (!localStorage) return false;
	if (path.substr(path.length-1) != "/") return false;
	for (spath in localStorage) {
		if (spath.substr(0,path.length) == path) return true; // only true if one file inside matches the path
	}
	return false;
}

function LoveFS_isFile (path) {
	var res = gFilesystemEnumerateIsFile[LoveFSNormalizePath(path)] || (localStorage && localStorage[gFilesystemPrefix+path] != undefined);
	return res == true;
}

function LoveFS_readFile (path) {
	var file;
	if (localStorage) { file = localStorage[gFilesystemPrefix+path]; if (file) return file; }
	UtilAjaxGet(path, function (contents) { file = contents; }, true);
	return file;
}

function LoveFS_exists (path) {
	if (LoveFS_isFile(path) || LoveFS_isDir(path)) return true;
	if (!gFilesystemEnumerateList) { // if we have no filelist.txt available, try to ajax-get the file to see if it exists
		var res = false;
		UtilAjaxGet(path, function (contents) { if (contents) res = true; }, true);
		return res;
	}
	return false;
}

/// init lua api
function Love_Filesystem_CreateTable () {
	var t = {};
	var pre = "love.filesystem.";

	t['enumerate']				= function (path) { return LoveFilesystemEnumerate(path); }
	
	t['exists']					= function (path) { return [LoveFS_exists(path)]; }
	t['isDirectory']			= function (path) { return [LoveFS_isDir(path)]; }
	t['isFile']					= function (path) { return [LoveFS_isFile(path)]; }
	
	t['getLastModified']		= function () { return NotImplemented(pre+'getLastModified'); }
	t['getAppdataDirectory']	= function () { NotImplemented(pre+'getAppdataDirectory'); return [""]; }
	t['getSaveDirectory']		= function () { NotImplemented(pre+'getSaveDirectory'); return [""]; }
	t['getUserDirectory']		= function () { NotImplemented(pre+'getUserDirectory'); return [""]; }
	t['getWorkingDirectory']	= function () { NotImplemented(pre+'getWorkingDirectory'); return [""]; }
	t['init']					= function () { }
	t['lines']					= function () { return NotImplemented(pre+'lines'); }
	t['load']					= function (path) { return [function () { return RunLuaFromPath(path); }]; } // quick&dirty
	t['mkdir']					= function () { return NotImplemented(pre+'mkdir'); }
	t['newFile']				= function () { return NotImplemented(pre+'newFile'); }
	t['newFileData']			= function () { return NotImplemented(pre+'newFileData'); }
	t['read']					= function (path) { return [LoveFS_readFile(path)]; }
	t['remove']					= function () { return NotImplemented(pre+'remove (no LocalStorage)'); }
	t['setIdentity']			= function () { return NotImplemented(pre+'setIdentity (no LocalStorage)'); }
	t['setSource']				= function () { return NotImplemented(pre+'setSource'); }
	t['write']					= function (filename, data) { return NotImplemented(pre+"write (no LocalStorage)"); }
	
	
	if (localStorage)
	{
		t['write']					= function (path, data)
		{
			localStorage[gFilesystemPrefix+path] = data;
            return LuaNil;
		}
		t['setIdentity']                            = function (identity)
		{
			if (identity)
				gFilesystemPrefix = identity + "-";
            return LuaNil;
		}
		t['remove']                                 = function (path)
		{
			localStorage.removeItem(gFilesystemPrefix+path);
            return LuaNil;
		}
		t['load']                                   = function (path)
		{
			var file = localStorage[gFilesystemPrefix+path];
			if (file)
			{
				try
				{
					return [lua_load(file, path)]; // TODO: probably not much used, but should use the same utils like RunLuaFromPath, e.g. error reporting,profiling etc
				}
				catch (e)
				{
					return [null, e.message];
				}
			}
			return [function () { return RunLuaFromPath(path); }]; // quick&dirty
		}
	}

    Lua.inject(t, null, 'love.filesystem');
}
