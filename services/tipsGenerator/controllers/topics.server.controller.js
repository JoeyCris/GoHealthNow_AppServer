var sendRequest = require('../util/sendRequest');
var loginCtrl = require('./login.server.controller');
var KnowledgeCtrl = require('./knowledgelocal.server.controller');
var async = require('async');

var login_cookie;

loginCtrl.getCookie(function(cookie){
	login_cookie = cookie;
});

exports.create = function(login_cookie, knowledges, userID, creatorID, callback){
	if (knowledges) {
		knowledges.forEach(function(element,index,array){
			var knowledgeId = element;
			//logger.log('info',userID);
			sendRequest.sendPostRequest('knowledge/'+knowledgeId+'/tips',{headers: {cookie: login_cookie}, form: {user: userID,creator: creatorID}},function(err, response, data){
				if(err){
					callback(err, response, data);
				}else{
					//logger.log('info', response.body);
					callback(err, response, data);
				}
			});
		});
	} else {
		callback(new Error('knowledges is not a list'));
	}

};

var createByKnowledge = function(login_cookie, element, userinfo, creatorID, callback){
	if (element) {
		var userID = userinfo.userID
		KnowledgeCtrl.getById(element, function(err, knowledge){
			// var knowledge = element;
			if(err){
				callback(err);
			}
			// console.log(knowledge);
			// knowledge={content:knowledge.content};
			var topic_content = knowledge.content;
			if(userinfo.language === 1 && knowledge.contenu !== ''){
				topic_content = knowledge.contenu;
			}
			var formData = {
				user:userID,
				creator:creatorID,
				// replace_parts: knowledge.replace_parts,
				priority: knowledge.priority,
				send_email: knowledge.send_email,
				send_push: knowledge.send_push,
				// medias: knowledge.medias,
				description: topic_content,
				title: knowledge.title
			}
			//console.log("The final Tip is:\n",topic_content);
			sendRequest.sendPostRequest('knowledge/'+element+'/tips/templates',{headers: {cookie: login_cookie}, form: formData},function(err, response, data){
				if(err){
					callback(err, response, data);
				}else{
					// logger.log('info', response.body);
					callback(err, response, data);
				}
			});
		});
	} else {
		callback(new Error('knowledge is undefined'));
	}
};

exports.createByKnowledges = function(login_cookie, knowledges, userinfo, creatorID, callback){
	var slength = knowledges.length
	//console.log("Slength is here: ",knowledges[0]);
	if (slength > 0) {
		async.timesSeries(slength, function(n, next) {
		    createByKnowledge(login_cookie, knowledges[n], userinfo, creatorID, function(err, response, data) {
						console.log(n);
		        next(err, response, data);
		    });
		}, callback);
	} else {
		callback(new Error('knowledges is not a list'));
	}
};

exports.createByKnowledgeTemplate = function(login_cookie, knowledges, userinfo, creatorID, callback){
	if (knowledges) {
		// console.log(knowledges);
		var userID = userinfo.userID

		knowledges.forEach(function(element,index,array){
			//logger.log('info',userID);
			KnowledgeCtrl.getById(element, function(err, knowledge){
				// var knowledge = element;
				if(err){
					callback(err);
				}
				var finalcontent = knowledge.content;
				if(userinfo.language === 1){
					finalcontent = knowledge.contenu;
				}
				console.log(knowledge.replace_parts);
				knowledge.replace_parts.forEach(function(ele){
					replace_word = '$'+ele.keyword+'$';
					console.log(replace_word);
					finalcontent = finalcontent.replace(replace_word, userinfo[ele.reference]);
				});
				if(userinfo.language === 1){
					if(userinfo.firstName && userinfo.firstName.trim() != ''){
						finalcontent = 'Cher '+userinfo.firstName+': \n' + finalcontent;
					}else{
						finalcontent = 'Cher utilisateur: \n' + finalcontent;
					}
				}else{
					if(userinfo.firstName && userinfo.firstName.trim() != ''){
						finalcontent = 'Dear '+userinfo.firstName+': \n' + finalcontent;
					}else{
						finalcontent = 'Dear user: \n' + finalcontent;
					}
				}

				console.log(finalcontent);
				// knowledge={content:knowledge.content};
				var formData = {
					user:userID,
					creator:creatorID,
					// replace_parts: knowledge.replace_parts,
					priority: knowledge.priority,
					send_email: knowledge.send_email,
					send_push: knowledge.send_push,
					// medias: knowledge.medias,
					description: finalcontent,
					title: knowledge.title
				}
				// knowledge.user = userID;
				// knowledge.creator = creatorID;
				// knowledge.content = '';
				// console.log(formData);
				sendRequest.sendPostRequest('knowledge/'+element+'/tips/templates',{headers: {cookie: login_cookie}, form: formData},function(err, response, data){
					if(err){
						callback(err, response, data);
					}else{
						// logger.log('info', response.body);
						callback(err, response, data);
					}
				});
			});

		});
	} else {
		callback(new Error('knowledges is not a list'));
	}

};

exports.createByCombinedKnowledgeTemplate = function(login_cookie, knowledges, userinfo, creatorID, callback){
	if (knowledges && knowledges.length > 0) {
		// console.log(knowledges);
		var userID = userinfo.userID
		var finalcontent = '';
		var reference = userinfo.reference;
		console.log(knowledges);
		async.each(knowledges, function(element, done) {
		// knowledges.forEach(function(element,index,array){
			//logger.log('info',userID);
			KnowledgeCtrl.getById(element, function(err, knowledge){
				// var knowledge = element;
				if(err){
					callback(err);
				}
				if(userinfo.language === 1 && knowledge.content !== ''){
					finalcontent = finalcontent+ '\u2022 ' +knowledge.contenu + '\n' ;
				}else{
					finalcontent = finalcontent+ '\u2022 ' +knowledge.content + '\n' ;
				}
				// console.log(knowledge.replace_parts);
				knowledge.replace_parts.forEach(function(ele){
					replace_word = '$'+ele.keyword+'$';
					// console.log(replace_word);
					finalcontent = finalcontent.replace(replace_word, userinfo[ele.reference]);
				});
				done();
			});
		},function done(){
			if(userinfo.language === 1){
				if(userinfo.tiptype === 'meal'){
					var mealType = 'tout dernier record de repas';
					var createtime = new Date();
					if(userinfo.mealType){
						mealType = userinfo.mealType.toLowerCase();
						if(mealType === 'supper')
							mealType = 'dîner';
					}
					finalcontent = 'Nous avons les commentaires suivants pour votre '+mealType+'. \n' + finalcontent;
				}
				if(userinfo.firstName && userinfo.firstName.trim() != ''){
					finalcontent = 'Cher '+userinfo.firstName+', ' + finalcontent;
				}else{
					finalcontent = 'Cher utilisateur, ' + finalcontent;
				}
				console.log(finalcontent);
			}else{
				if(userinfo.tiptype === 'meal'){
					var mealType = 'very last meal record';
					var createtime = new Date();
					if(userinfo.mealType){
						mealType = userinfo.mealType.toLowerCase();
						if(mealType === 'supper')
							mealType = 'dinner';
					}
					finalcontent = 'we have the following feedback for your '+mealType+'. \n' + finalcontent;
				}
				if(userinfo.firstName && userinfo.firstName.trim() != ''){
					finalcontent = 'Dear '+userinfo.firstName+', ' + finalcontent;
				}else{
					finalcontent = 'Dear user, ' + finalcontent;
				}
				console.log(finalcontent);
			}

			// knowledge={content:knowledge.content};
			var formData = {
				user:userID,
				creator:creatorID,
				// replace_parts: knowledge.replace_parts,
				send_email: false,
				send_push: false,
				// medias: knowledge.medias,
				description: finalcontent,
				title: 'Combined Knowledge',
				reference: reference
			}
			// knowledge.user = userID;
			// knowledge.creator = creatorID;
			// knowledge.content = '';
			// console.log(formData);
			KnowledgeCtrl.listByType('report',function(err, knowledges){
				if(err){
					callback(err, response, data);
				}else{
					console.log(knowledges[0]._id);
					sendRequest.sendPostRequest('knowledge/'+knowledges[0]._id+'/tips/templates',{headers: {cookie: login_cookie}, form: formData},function(err, response, data){
						if(err){
							callback(err, response, data);
						}else{
							// logger.log('info', response.body);
							callback(err, response, data);
						}
					});
				}
			});

		});

	} else {
		callback(new Error('knowledges is not a list'));
	}

};
