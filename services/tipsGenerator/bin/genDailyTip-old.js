var mongoose = require('mongoose');

process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('../controllers/login.server.controller');
//logging
var assert = require('assert');

var KHistoryCtrl = require('../controllers/knowledgehistory.server.controller');
var TopicCtrl = require('../controllers/topics.server.controller');
var KnowledgeCtrl = require('../controllers/knowledge.server.controller');
var ProfileCtrl = require('../controllers/profiles.server.controller');
var count = 0;

var getKnowledge = function(login_cookie, knowledgeList, userID, callback) {
	var return_knowledges = [];
		KHistoryCtrl.read(login_cookie, knowledgeList, userID, function(err, user){
			// console.log(JSON.stringify(user));
			if(err) {
				console.log('KHistoryCtrl.read error: '+ err.toString());
			}
			// console.log(data);
			var khistory = user.history;
			var minvalue = -1, minknowledge, minhistory;
			khistory.history.forEach(function(temp_history, index, array){

				if(temp_history.adopt_times < minvalue){
					minvalue = temp_history.adopt_times;
					minknowledge = temp_history.knowledgeId;
					minhistory = temp_history;
				}else if(minvalue === -1){
					minvalue = temp_history.adopt_times;
					minknowledge = temp_history.knowledgeId;
					minhistory = temp_history;
				}

			});
			console.log('Scoring history complete');
			if(minknowledge !== undefined){
				minhistory.adopt_times+=1;
				if(minvalue > 0){
					khistory.history.forEach(function(temp_history, index, array){
						temp_history.adopt_times = temp_history.adopt_times - minvalue;
					});
				}
				khistory.save(function(err){
					if(err){
						console.log('Save history failed');
					}
				});
				return_knowledges.push(minknowledge);
				callback(null, return_knowledges);
			}else{
				console.log('find history failed');
				callback(new Error('find history failed'))
			}
		});
};

var saveTip = function(login_cookie, knowledgeList, userID, creatorID, callback){
	//console.log(userID);
	getKnowledge(login_cookie, knowledgeList, userID, function(err, knowledges){
		if(err) {
			console.log('getKnowledge err' + err.toString());
		}
		// console.log(knowledges);
		TopicCtrl.create(login_cookie, knowledges, userID, creatorID, function(err, response, data){
			if(err){
				callback(err,response,data);
			}else{
				callback(null,response,data);
			}
		});
	});
};

var saveTipSync = function(cookie, knowledgeList, creator, count, users){
	if(count >= users.length){
		return;
	}
	var user = users[count];
	saveTip(cookie, knowledgeList, user.userID, creator.userID, function(err,response,data){
		// console.log("start");
		if(err){
			console.log(err +' '+ response +' '+ data);
			count++;
			saveTipSync(cookie, knowledgeList, creator, count, users);
		}else{
			count++;
			saveTipSync(cookie, knowledgeList, creator, count, users);
		}
		if(count % 150 === 0) {
			console.log((count/users.length)*100 + ' is complete');
		}

		if(count >= users.length) {
			console.log('100 % is complete');
			mongoose.connection.close();
		}
	});
};

loginCtrl.login(function(cookie, creator){
	ProfileCtrl.list(function(err, data){
		if(err){
			console.log(err);
			return;
		}
		// console.log(data);

		var users = data;
		KnowledgeCtrl.listByType(cookie, 1,function(err, knowledgeList){
			if(err){
				return console.log('KnowledgeCtrl.listByType err'+ err.toString());
			}
			saveTipSync(cookie, knowledgeList, creator, count, users);

			//mongoose.connection.close();
		});
	});
});
