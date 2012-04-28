// additional functionality for lua-parser

function _lua_string_translate_pattern (pattern,plain) {
	if (!plain) {
		pattern = pattern.replace(/%a/g,"\\w"); // lua:%a=(all letters) js:\w=(alphanumeric and _) -> incorrect, but [abcd...] wouldn't work inside set : [xy%a]
		pattern = pattern.replace(/%/g,"\\");
		pattern = pattern.replace(/%/g,"\\");
		pattern = pattern.replace(/-/g,"*"); // 0 or more, unlike * : shortest 
		// TODO: finish implementation, this is just a rough estimate
	} else {
		// TODO: escape regexp special chars
	}
	return pattern;
}

function _lua_gmatch_next(o) {
	// TODO: finish implementation, this is just a rough estimate
	// very basic version to find literal pattern hits without regexp, and simple regexp
	var results = o.s.match(o.pattern);
	if (!results) return []; // not found, end
	var pos = o.s.search(results[0]); // search pos of whole match
	if (pos == -1) throw new Error("string.match bug: found but position cannot be determined"); // shouldn't happen if browser implements search and match correctly
	o.s = o.s.substr(pos + results[0].length);
	if (results.length > 1) results = results.slice(1); // remove first result entry which is the whole match
	return results;
}

lua_libs["string"]["find"] = function (s,pattern,init,plain) {
	// TODO: finish implementation, this is just a rough estimate
	// very basic version to find literal pattern hits without regexp, and simple regexp
	pattern = _lua_string_translate_pattern(pattern,plain);
	var results = (init != undefined) ? s.match(pattern,init) : s.match(pattern);
	if (!results) return [];
	var pos_start = s.search(results[0]);
	var pos_end = pos_start + results[0].length - 1;
	var res = [pos_start+1,pos_end+1];
	for (var i=1;i<results.length;++i) res.push(results[i]);
	return res;
}

lua_libs["string"]["gmatch"] = function (s, pattern) {
	// TODO: finish implementation, this is just a rough estimate
	return [_lua_gmatch_next, {s:s,pattern:_lua_string_translate_pattern(pattern)}, null];
}

lua_libs["string"]["gsub"] = function (s, pattern, repl, n) {
	// TODO: finish implementation, this is just a rough estimate
	// very basic version to find literal pattern hits without regexp, and simple regexp
	// TODO: n ~= nil not yet implemented

	//~ MainPrint("string.gsub pattern0=",pattern);
	//~ MainPrint("string.gsub repl0=",repl);

	//~ Returns a copy of s in which all (or the first n, if given)
	pattern = _lua_string_translate_pattern(pattern);
	pattern = pattern.replace(/\//g,"\\/"); // escape / before eval
	pattern = eval("/"+pattern+"/g"); // construct "real" regexp object so . works and we replace all not just the 1st

	// References the submatched substrings inside parenthesized expressions 
	repl = repl.replace(/%1/g,"\\$1");
	repl = repl.replace(/%2/g,"\\$2");
	repl = repl.replace(/%3/g,"\\$3");
	repl = repl.replace(/%4/g,"\\$4");
	repl = repl.replace(/%5/g,"\\$5");
	repl = repl.replace(/%6/g,"\\$6");
	repl = repl.replace(/%7/g,"\\$7");
	repl = repl.replace(/%8/g,"\\$8");

	//~ MainPrint("string.gsub pattern1=",pattern);
	//~ MainPrint("string.gsub repl1=",repl);

	repl = repl.replace(/%%/g,"%");

	//~ MainPrint("string.gsub pattern2=",pattern);
	//~ MainPrint("string.gsub repl2=",repl);

	//~ MainPrint("string.gsub s=",s,"result=",s.replace(pattern,repl));
	//~ MainPrint("string.gsub test=",s.replace(".","%%."));
	//~ MainPrint("string.gsub test01=","aaa.".replace("a","b"));
	//~ MainPrint("string.gsub test02=","aaa.".replace(".","b"));
	//~ MainPrint("string.gsub test03=","aaa.".replace("\.","b"));
	//~ MainPrint("string.gsub test04=","aaa.".replace("\\.","b"));
	//~ MainPrint("string.gsub test05=","aaa.".replace(/./g,"b"));
	//~ MainPrint("string.gsub test06=","aaa.".replace(eval("/./g"),"b"));

	return [s.replace(pattern,repl)];
}

lua_libs["string"]["match"] = function (s,pattern,init) {
	// TODO: finish implementation, this is just a rough estimate
	// very basic version to find literal pattern hits without regexp, and simple regexp
	pattern = _lua_string_translate_pattern(pattern);
	var results = (init != undefined) ? s.match(pattern,init) : s.match(pattern);
	if (!results) return [];
	if (results.length > 1) results = results.slice(1); // remove first result entry which is the whole match
	return results;
}
