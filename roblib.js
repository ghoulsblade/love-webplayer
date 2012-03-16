
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
