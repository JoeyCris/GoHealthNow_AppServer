var sendRequest = require('../util/sendRequest');
var loginCtrl = require('./login.server.controller');


var login_cookie;

loginCtrl.getCookie(function(cookie){
	login_cookie = cookie;
});

 /**
 * Read knowledge base by ID
 */

 exports.knowledgeById = function(login_cookie, knowledgeId, callback){
	 sendGetRequest('knowledge/'+knowledgeId, {headers: {cookie: login_cookie}},function(err, response, data){
		 //console.log(data);
		 var knowledge = JSON.parse(data);
		 if(err){
			 return;
		 }else{
			 callback(null, knowledge);
		 }
	 });
};

 /**
  * List of knowledge base
  * tested
  */
 exports.list = function(login_cookie, callback) {
	 var return_knowledges = [];
	 sendRequest.sendGetRequest('knowledge', {headers: {cookie: login_cookie}},function(err, response, data){
		 //console.log(data);
		 var knowledges = JSON.parse(data);
		 if(err){
			 callback(err);
		 }else{
			 knowledges.forEach(function(element,index,array){
				 return_knowledges.push(element._id);
			 });
			 callback(null, return_knowledges);
		 }
	 });
 };

/**
* List of knowledge types
* tested
*/
exports.listTypes = function(login_cookie, callback) {
	return_types = {};
	sendRequest.sendGetRequest('knowledge/type', {headers: {cookie: login_cookie}},function(err, response, data){
		//console.log(data);
		var types = JSON.parse(data);
		if(err){
			callback(err);
		}else{
			knowledges.forEach(function(element,index,array){
				return_types[element] = index;
				//return_knowledges.push(element._id);
			});
			callback(null, return_types);
		}
	});
};

/**
* List of knowledge by type
* tested
*/
exports.listByType = function(login_cookie, typeId, callback) {
	var return_knowledges = [];
	sendRequest.sendGetRequest('knowledge/type/'+typeId, {headers: {cookie: login_cookie}}, function(err, response, data){
		// console.log("Data***********************\n",data);
		var knowledges = JSON.parse(data);
		if(err){
			callback(err);
		}else{
			// knowledges.forEach(function(element,index,array){
			// 	return_knowledges.push(element._id);
			// });
			return_knowledges = knowledges;
			callback(null, return_knowledges);
		}
	});
};
