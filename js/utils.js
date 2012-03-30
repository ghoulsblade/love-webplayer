
// ***** ***** ***** ***** ***** misc

function MyGetTicks () { return new Date().getTime(); }

pi = 3.1415926535897932384626;
function randf () { return Math.random(); } // returns float in [0;1[
function randi (n) { return floor(n*Math.random()); } // returns integer smaller than n
function randrange (minv,maxv) { return minv + (maxv-minv)*Math.random(); } // returns float
function sin (a) { return Math.sin(a); }
function cos (a) { return Math.cos(a); }
function max (a,b) { return (a > b) ? a : b; }
function min (a,b) { return (a < b) ? a : b; }
function max (a,b) { return (a > b) ? a : b; }
function abs (a) { return (a < 0) ? -a : a; }
function absf (a) { return (a < 0.0) ? -a : a; }
function sgn (a) { return (a < 0) ? -1 : 1; }
function floor (a) { return Math.floor(a); }
function ceil (a) { return Math.ceil(a); }
function clamp (a,minv,maxv) { return (a < minv) ? minv : ((a > maxv) ? maxv : a); }
function clamplen (a,maxlen) { return clamp(a,-maxlen,maxlen); }


// ***** ***** ***** ***** ***** ajax

// see http://www.w3.org/TR/XMLHttpRequest			sQuery = "bla.php?x="+escape(x)
function UtilAjaxGet (sQuery,callback,bSynchronous) {
	var bAsync = true;
	if (bSynchronous) bAsync = false;
	var client;
	if (window.XMLHttpRequest) 
			client = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
	else	client = new ActiveXObject("Microsoft.XMLHTTP");	// code for IE6, IE5
	client.onreadystatechange = function() {
		if (this.readyState == this.DONE) {
			//~ document.getElementById("output").innerHTML += "<br>"+"MyAjaxGet status="+String(this.status)+" statusText="+escape(String(this.statusText));
			if (this.status==200) {
				callback(this.responseText);
			} else {
				callback(null,this.status);
			}
		}
	}
	client.open("GET",sQuery,bAsync);
	//~ client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
	client.send();
}

function UtilAjaxGetToElementByID (sQuery,sTargetID) { 
	UtilAjaxGet (sQuery,function (result) {
		if (document.getElementById(sTargetID)) 
			document.getElementById(sTargetID).innerHTML = result;
		else alert("MyAjaxGet target element not found : "+sTargetID);
	});
}
