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

var knowledgeTitle = (process.env.KNM);

var saveTip = function(login_cookie, knowledges, userID, creatorID, callback){
	//console.log(userID);
	// console.log(knowledges);
	TopicCtrl.create(login_cookie, knowledges, userID, creatorID, function(err, response, data){
		if(err){
			callback(err,response,data);
		}else{
			callback(null,response,data);
		}
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
		KnowledgeCtrl.listByType(cookie, 2,function(err, knowledgeList){
			if(err){
				return console.log('KnowledgeCtrl.listByType err'+ err.toString());
			}
			var targetKnowledges = [];
			knowledgeList.forEach(function(knowledge,index,array){
				if(knowledge.title === knowledgeTitle){
					targetKnowledges.push(knowledge._id);
				}
			});
			saveTipSync(cookie, targetKnowledges, creator, count, users);

			//mongoose.connection.close();
		});
	});
});
