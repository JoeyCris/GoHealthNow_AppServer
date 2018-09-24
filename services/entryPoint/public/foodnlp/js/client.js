 
var text=[

	'i just have some meat',
	'today i just ate some apple and salad',
	'coke and burger',
	'fish and chips',
	//"i didn't eat anything but some apples",
	//"i don't like pears but i can try some grapes and watermelons",
	"i think cake is good",
	"1 cup of juice 2 cups of beer"
];

var randomize=function(){
	var len=text.length;
	var a=Math.floor(Math.random()*len);
	a=text[a];
	document.getElementById('content').value=a;
	return;
};

var load=function(){
	randomize();
	
	return;
};

var cloud_click=function(obj){
	//alert('processing!');
	var text=document.getElementById('content').value;
	//alert(textarea);
	if(text.trim()==""){
		alert("don't leave the space blank!");
	}
	document.getElementById('results').innerHTML='';
	var len=display.childNodes.length;
	while(len>2) 
	{
    	display.removeChild(display.childNodes[--len]);
	}

	document.getElementById("localbutton").className+=" disabled";
	document.getElementById("cloudbutton").className+=" disabled";
	loadXMLDoc('/cloudprocess',text);
	//process the text
	//var ret=nlp(textarea);
	//update(ret);
	return;
};

var local_click=function(obj){
	//alert('processing!');
	var text=document.getElementById('content').value;
	//alert(textarea);
	if(text.trim()==""){
		alert("don't leave the space blank!");
		return;
	}
	document.getElementById('results').innerHTML='';
	var display=document.getElementById('display');
	var len=display.childNodes.length;
	while(len>2) 
	{
    	display.removeChild(display.childNodes[--len]);
	}
	//process the text
	document.getElementById("localbutton").className+=" disabled";
	//document.getElementById("cloudbutton").className+=" disabled";
	loadXMLDoc('http://localhost:8089/api/'+text);
	return; 
};

var update=function(ret){
	for(var i=0;i<ret.length;i++){
		var amount=ret[i][0];
		var unit=ret[i][1];
		var name=ret[i][2];
		var des=ret[i][3];
		var temptr=document.createElement('tr');

		var temptd=document.createElement('td');
		temptd.innerHTML=amount;
		temptr.appendChild(temptd);

		temptd=document.createElement('td');
		temptd.innerHTML=unit;
		temptr.appendChild(temptd);

		temptd=document.createElement('td');
		temptd.innerHTML=name;
		temptr.appendChild(temptd);
		temptd=document.createElement('td');
		temptd.innerHTML=des;
		temptr.appendChild(temptd);
		display.appendChild(temptr);
	}
}

var nlp =function(str){
	var len=str.length;
	var ret=[];
	if(len<=0)return;
	var vec=str.split(' ');
	len=vec.length;
	for(var i=0;i<len;i++){
		var temp=vec[i];
		if(search(temp)==true){
			ret.push(temp);
		}
	}
	return ret;

};

var search=function(str){
	return false;
};	


 
var xmlhttp=null;
function loadXMLDoc(url)
{
 
	// if (window.XMLHttpRequest)
	// {// code for IE7, Firefox, Opera, etc.
	//   xmlhttp=new XMLHttpRequest();
	// }
	// else if (window.ActiveXObject)
	// {// code for IE6, IE5
	//   xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	// }
	// if (xmlhttp!=null)
	// {
	//   xmlhttp.onreadystatechange=state_Change;
	//   xmlhttp.open("GET",url,true);
	//   xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
	//   xmlhttp.send(' ');
	// }
	// else
	// {
	//   alert("Your browser does not support XMLHTTP.");
	// }
	$.ajax({
		type:'get',
		async:false,
		url:url,
		jsonp:'jsonp',
		jsonpCallback: 'successCallback',
		dataType:'jsonp',
		success: function(res){
			console.log('asdsad');
			console.log(res);
			//var res=eval('('+res+')');
			document.getElementById('results').innerHTML=res.res[0];
	   		// if(res.food&&res.food.length>0)
	   		//console.log(res.res[1]);
	   		update(res.res[1]);
	   		document.getElementById("localbutton").classList.remove("disabled");
		},
		error: function(data){
			console.log(data);
			alert('No retrieval!');
			document.getElementById("localbutton").classList.remove("disabled");
		}
	});
}


function state_Change()
{
if (xmlhttp.readyState==4)
  {// 4 = "loaded"
  if (xmlhttp.status==200)
    {// 200 = "OK"
    //document.getElementById('A1').innerHTML=xmlhttp.status;
    //document.getElementById('A2').innerHTML=xmlhttp.statusText;
    	var res=eval('('+xmlhttp.responseText+')');
    	//console.log(res);
   		document.getElementById('results').innerHTML=res.res[0];
   		// if(res.food&&res.food.length>0)
   		//console.log(res.res[1]);
   		update(res.res[1]);
    }
  else
    {
    alert("Problem retrieving XML data:" + xmlhttp.statusText);
    }
    document.getElementById("localbutton").classList.remove("disabled");
   // document.getElementById("cloudbutton").classList.remove("disabled");
  }
  
}
 
