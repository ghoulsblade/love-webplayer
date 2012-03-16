function MyTest () {
		//~ alert("spot01");
		var base = "";
		//~ var base = "/";
		//~ var base = "file:///cavern/code/love-webplayer/";
		//~ MyAjaxGet(base+"main.lua","testfield01");
		//~ MyAjaxGet(base+"bla.txt","testfield01");
		//~ MyAjaxGet(base+"bla.xml","testfield01");
		//~ document.getElementById("testfield01").innerHTML = "blubb!";
		//~ alert("spot02");
		
		doRun();
}

// see http://www.w3.org/TR/XMLHttpRequest			sQuery = "bla.php?x="+escape(x)
function MyAjaxGet (sQuery,sTargetID) { 
	MyAjaxGetAux (sQuery,function (result) {
		if (document.getElementById(sTargetID)) 
			document.getElementById(sTargetID).innerHTML = result;
		else alert("MyAjaxGet target element not found : "+sTargetID);
	});
}
function MyAjaxGetAux (sQuery,callback) {
	var client;
	if (window.XMLHttpRequest) 
			client = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
	else	client = new ActiveXObject("Microsoft.XMLHTTP");	// code for IE6, IE5
	client.onreadystatechange = function() {
		if (this.readyState == this.DONE) {
			//~ document.getElementById("output").innerHTML += "<br>"+"MyAjaxGet status="+String(this.status)+" statusText="+escape(String(this.statusText));
			if (this.status==200) {
				callback(this.responseText);
			}
		}
	}
	client.open("GET",sQuery);
	//~ client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
	client.send();
}

// print function which the Lua engine will call
var lines = [], printed = false;

function print(text) {
  lines.push(text);
  printed = true;
}

function execute(text) {
  lines = [];
  printed = false;

  raw_argv[8] = Pointer_make(intArrayFromString(text), 0, ALLOC_STATIC); // leak!
  argv = Pointer_make(raw_argv, null);
  __Z7runargsP9lua_StatePPci(GLOBAL_L, argv, argc)

  if (!printed) {
	print('<small><i>(no output)</i></small>');
  }

  var element = document.getElementById('output');
  if (!element) return; // perhaps during startup
  element.innerHTML = lines.join('<br>') + '<hr>' + element.innerHTML;
}

var editor;

function doRun() {
  args = ['-e', ''];
  run(args);
  
	MyAjaxGetAux("main.lua",function (result) {
		execute(result);
	});
  //~ execute("print \"1234\"");
  
  /*
  setTimeout(function() { 
	if (!bespin.useBespin) setTimeout(arguments.callee, 10);
	bespin.useBespin(document.getElementById('the_input'), { "stealFocus":true, "syntax": "lua" }).then(function(env) {
	  editor = env.editor;
	});
  }, 10);
  */
}

