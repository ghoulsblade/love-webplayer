
/// init lua api
function Love_Thread_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.thread.";

	G.str['love'].str['thread'] = t;
	
	t.str['getThread']			= function () { return NotImplemented(pre+'getThread'); }
	t.str['getThreads']			= function () { return NotImplemented(pre+'getThreads'); }
	t.str['newThread']			= function (path) { NotImplemented(pre+'newThread'); return [Love_MakeThreadHandle(new cThread(path))];  }
}

function Love_MakeThreadHandle (o) {
	var t = lua_newtable();
	var pre = "love.thread:";
	t._data = o;
	
	t.str['demand']		= function (t) { return NotImplemented(pre+'demand'	); } // Receive a message from a thread. Wait for the message to exist before returning.
	t.str['getName']	= function (t) { return NotImplemented(pre+'getName'); } // Get the name of a thread.
	t.str['kill']		= function (t) { return NotImplemented(pre+'kill'	); } // Forcefully terminate the thread.
	t.str['peek']		= function (t) { return NotImplemented(pre+'peek'	); } // Receive a message from a thread, but leave it in the message box.
	t.str['receive']	= function (t) { return NotImplemented(pre+'receive'); } // Receive a message from a thread.
	t.str['send']		= function (t) { return NotImplemented(pre+'send'	); } // Send a message.
	t.str['start']		= function (t) { return NotImplemented(pre+'start'	); } // Starts the thread.
	t.str['wait']		= function (t) { return NotImplemented(pre+'wait'	); } // Wait for a thread to finish.
	
	// 0.8.0 <Boolsheet> send/receive were renamed to set/get. The behaviour is still the same.
	t.str['get']		= function (t) { return NotImplemented(pre+'get'	); } // new 0.8.0 ?
	t.str['set']		= function (t) { return NotImplemented(pre+'set'	); } // new 0.8.0 ?
	t.str['getKeys']	= function (t) { return NotImplemented(pre+'getKeys'	); } // new 0.8.0 ?
	// getKeys : It returns a table with all the names of the message in the thread message box.
	
	t.str['type']		= function (t) { return ["Thread"]; }	// Gets the type of the object as a string.
	t.str['typeOf']		= function (t,x) { return [x == "Object" || x == "Thread"]; }	// Checks whether an object is of a certain type.
	
	return t;
}

function cThread(path) {
}
