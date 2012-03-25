
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
	t.str['isDirectory']			= function () { return NotImplemented(pre+'isDirectory'); }
	t.str['isFile']					= function () { return NotImplemented(pre+'isFile'); }
	t.str['lines']					= function () { return NotImplemented(pre+'lines'); }
	t.str['load']					= function (path) { return [function () { return RunLuaFromPath(path); }]; } // quick&dirty
	t.str['mkdir']					= function () { return NotImplemented(pre+'mkdir'); }
	t.str['newFile']				= function () { return NotImplemented(pre+'newFile'); }
	t.str['newFileData']			= function () { return NotImplemented(pre+'newFileData'); }
	t.str['read']					= function () { return NotImplemented(pre+'read (no LocalStorage)'); }
	t.str['remove']					= function () { return NotImplemented(pre+'remove'); }
	t.str['setIdentity']			= function () { return NotImplemented(pre+'setIdentity'); }
	t.str['setSource']				= function () { return NotImplemented(pre+'setSource'); }
	t.str['write']					= function (filename, data) { return NotImplemented(pre+"write (no LocalStorage)"); }

	if (localStorage)
	{
		t.str['write']					= function (filename, data)
		{
			localStorage[filename] = data;
		}
		t.str['read']                                   = function (filename)
		{
			return [localStorage[filename]];
		}
		t.str['exists']                                 = function (filename)
		{
			return [localStorage[filename] != undefined];
		}
	}
}
