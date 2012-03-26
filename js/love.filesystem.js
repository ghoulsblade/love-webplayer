var gFilesystemPrefix = "unnamed-";

/// init lua api
function Love_Filesystem_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.filesystem.";

	G.str['love'].str['filesystem'] = t;
	
	t.str['enumerate']				= function () { return NotImplemented(pre+'enumerate'); }
	t.str['exists']					= function () { return NotImplemented(pre+'exists (no LocalStorage)'); }
	t.str['getAppdataDirectory']	= function () { return NotImplemented(pre+'getAppdataDirectory'); }
	t.str['getLastModified']		= function () { return NotImplemented(pre+'getLastModified'); }
	t.str['getSaveDirectory']		= function () { return NotImplemented(pre+'getSaveDirectory'); }
	t.str['getUserDirectory']		= function () { return NotImplemented(pre+'getUserDirectory'); }
	t.str['getWorkingDirectory']	= function () { return NotImplemented(pre+'getWorkingDirectory'); }
	t.str['init']					= function () { }
	t.str['isDirectory']			= function () { return NotImplemented(pre+'isDirectory (no LocalStorage)'); }
	t.str['isFile']					= function () { return NotImplemented(pre+'isFile (no LocalStorage)'); }
	t.str['lines']					= function () { return NotImplemented(pre+'lines'); }
	t.str['load']					= function (path) { return [function () { return RunLuaFromPath(path); }]; } // quick&dirty
	t.str['mkdir']					= function () { return NotImplemented(pre+'mkdir'); }
	t.str['newFile']				= function () { return NotImplemented(pre+'newFile'); }
	t.str['newFileData']			= function () { return NotImplemented(pre+'newFileData'); }
	t.str['read']					= function () { return NotImplemented(pre+'read (no LocalStorage)'); }
	t.str['remove']					= function () { return NotImplemented(pre+'remove (no LocalStorage)'); }
	t.str['setIdentity']			= function () { return NotImplemented(pre+'setIdentity (no LocalStorage)'); }
	t.str['setSource']				= function () { return NotImplemented(pre+'setSource'); }
	t.str['write']					= function (filename, data) { return NotImplemented(pre+"write (no LocalStorage)"); }

	if (localStorage)
	{
		function isDirectory(name)
		{
			return (name.substr(name.length-1) == "/"); // Directory name
		}
		function isFile(name)
		{
			return (localStorage[gFilesystemPrefix+name] != undefined);
		}
		function readFile(name)
		{
			var file = localStorage[gFilesystemPrefix+name];
			if (!file)
			{
				UtilAjaxGet(name, function (contents)
				{
					file = contents;
				}, true);
			}
			return file;
		}
		t.str['write']					= function (filename, data)
		{
			localStorage[gFilesystemPrefix+filename] = data;
		}
		t.str['read']                                   = function (filename)
		{
			return [readFile(filename)];
		}
		t.str['exists']                                 = function (name)
		{
			return [isFile(name) || isDirectory(name)];
		}
		t.str['setIdentity']                            = function (identity)
		{
			if (identity)
				gFilesystemPrefix = identity + "-";
		}
		t.str['isDirectory']                            = function (name)
		{
			return [isDirectory(name)];
		}
		t.str['isFile']                                 = function (name)
		{
			return [isFile(name)];
		}
		t.str['remove']                                 = function (name)
		{
			localStorage.removeItem(gFilesystemPrefix+name);
		}
		t.str['load']                                   = function (name)
		{
			var file = readFile(name);
			if (file)
			{
				try
				{
					return [lua_load(file, name)];
				}
				catch (e)
				{
					return [null, e.message];
				}
			}
		}
	}
}
