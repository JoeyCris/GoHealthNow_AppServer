'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
		request = require('request');
var server_url = 'http://localhost:3000/';

var sendPostRequest = function(url, postData, callback){
	console.log(url);
	var dest_url = server_url+url;
	request.post(
			dest_url, postData,
			function (error, response, body) {
					if (!error && response.statusCode === 200) {
						// console.log(body);
						callback(error, response, body);
					}else{
						console.log('post request to '+url+' failed');
						callback(error, response, body);
					}
			}
	);
};

var sendGetRequest = function(url, getData, callback){
	//console.log(url);
	var dest_url = server_url+url;
	request.get(
			dest_url, getData,
			function (error, response, body) {
					if (!error && response.statusCode === 200) {
						// console.log(body);
						callback(error, response, body);
					}else{
						console.log('get request to '+url+' failed');
						callback(error, response, body);
					}
			}
	);
};

var sendPutRequest = function(url, putData, callback){
	console.log(url);
	var dest_url = server_url+url;
	request.put(
			dest_url, putData,
			function (error, response, body) {
					if (!error && response.statusCode === 200) {
						// console.log(body);
						callback(error, response, body);
					}else{
						console.log('put request to '+url+' failed');
						callback(error, response, body);
					}
			}
	);
};

var getKnowledge = function(login_cookie, status, user, callback) {
	var return_knowledges = [];
	if(status === 'new'){
		sendGetRequest('knowledge/type/0',{headers: {cookie: login_cookie}, form: {user: user.userID}},function(err, response, data){
			//console.log(data);
			var knowledges = JSON.parse(data);
			if(err){
				return;
			}else{
				knowledges.forEach(function(element,index,array){
					return_knowledges.push(element._id);
				});
			}
		});
	}else if(status === 'tip'){
		sendGetRequest('knowledgehistory/'+user.userID,{headers: {cookie: login_cookie}, form: {user: user.userID}},function(err, response, data){
			// console.log(data);
			var khistory = JSON.parse(data).history;
			var minvalue, minknowledge, minhistory;
			khistory.history.forEach(function(temp_history, index, array){
				if(minvalue !== undefined && temp_history.adopt_times < minvalue){
					minvalue = temp_history.adopt_times;
					minknowledge = temp_history.knowledgeId;
					minhistory = temp_history;
				}else if(minvalue === undefined){
					minvalue = temp_history.adopt_times;
					minknowledge = temp_history.knowledgeId;
					minhistory = temp_history;
				}
			});
			console.log('Scoring history complete');
			if(minknowledge !== undefined){
				minhistory.adopt_times+=1;
				sendPutRequest('knowledgehistory/'+user.userID,{headers: {cookie: login_cookie}, form: khistory},function(err, response, data){
					// console.log(data);
					var khistories = JSON.parse(data);
				});
				return_knowledges.push(minknowledge);
				callback(null, return_knowledges);
			}else{
				console.log('Save history failed');
			}
		});
	}

};

var saveTip = function(login_cookie, status, user, callback){
	getKnowledge(login_cookie, status, user,function(err, knowledges){
		// console.log(knowledges);
		knowledges.forEach(function(element,index,array){
			sendPostRequest('knowledge/'+element+'/tips',{headers: {cookie: login_cookie}, form: {user: user.userID,creator: user.userID}},function(err, response, data){
				// console.log(data);
			});
		});
	});
};

var generateTipForUsers = function(){

	sendPostRequest('auth/signin',{form:{username: 'stongagelc@gmail.com', password: 'lc19890412' }},function(err, response, data){
		var user = JSON.parse(data);
		var login_cookie = response.headers['set-cookie'][0];
		sendGetRequest('profiles/',{headers: {cookie: login_cookie}, form: {user: user.userID}},function(err, response, data){
			// console.log(data);
			var users = JSON.parse(data);
			users.forEach(function(element,index,array){
				var user = element;
				saveTip(login_cookie, 'tip', user,function(err){
					if(err){
						console.log(user.email+' '+err);
					}else{
						console.log(user.email);
					}
				});
			});
		});
	});
};

//generateTipForUsers();
