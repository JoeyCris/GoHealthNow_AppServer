var mongoose = require('mongoose');
var _ = require('lodash');
process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('../controllers/login.server.controller');
//logging
var assert = require('assert');

var KScoreCtrl = require('../controllers/knowledgescore.server.controller');
var TopicCtrl = require('../controllers/topics.server.controller');
var KnowledgeCtrl = require('../controllers/knowledge.server.controller');
var KConditionCtrl = require('../controllers/knowledgecondition.server.controller');
var CFunciton = require('../controllers/conditionfunction.server.controller');
var ProfileCtrl = require('../controllers/profiles.server.controller');
var count = 0;
var SKIP_POSS = 0.0;

var getKnowledge = function(login_cookie, knowledgeList, userinfo, callback) {
	var return_knowledges = [];
		KScoreCtrl.read(login_cookie, knowledgeList, userinfo.userID, function(err, user){
			// console.log(JSON.stringify(user));
			if(err) {
				console.log('KScoreCtrl.read error: '+ err.toString());
			}
			var type = 'all';
			// if(userinfo.inactiveContinuously >= 3){
			// 	type = 'inactive';
			// }
			// console.log(type);
			KConditionCtrl.checkConditionsByTypeAll(userinfo, type, function(err, kconditions){
				if(err){
					console.error(err);
				}else{
					var kscore = user.score;
					var max_score = -1;
					var max_knowledge = undefined;
					// console.log(kconditions);
					kconditions.forEach(function(temp_kcondition, index, array){
						// console.log(temp_kcondition);
						// console.log(user.scoredict[temp_kcondition]);
						if(user.scoredict[temp_kcondition] > max_score){
							max_score = user.scoredict[temp_kcondition];
							max_knowledge = temp_kcondition;
						}
					});
					console.log('Find max score complete');
					if(max_knowledge !== undefined){
						// console.log(kconditions);
						if(kconditions.length>1){
							kscore.score.forEach(function(temp_score, index, array){
								kconditions.forEach(function(temp_kc, i_kc, a_kc){
									// console.log(temp_score.knowledgeId.toString() === temp_kc.toString())
									if(temp_score.knowledgeId.toString() === temp_kc.toString()){
										// console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
										if(temp_score.knowledgeId.toString() === max_knowledge.toString()){
											temp_score.score = temp_score.score - max_score/2.0;
										}else{
											temp_score.score = temp_score.score + max_score/2.0/(kconditions.length-1);
										}
									}
								});
							});
						}else{
							kscore.score.forEach(function(temp_score, index, array){
								if(temp_score.knowledgeId.toString() === max_knowledge.toString()){
									// console.log(Object.prototype.toString.call(temp_score.knowledgeId.toString()),Object.prototype.toString.call(max_knowledge.toString()));
									temp_score.score = temp_score.score - max_score/2.0;
								}else{
									temp_score.score = temp_score.score + max_score/2.0/(kscore.score.length-1);
								}
							});
						}
						// console.log(kscore);
						kscore.save(function(err){
							if(err){
								console.log('Save history failed');
							}else{
								console.log('save history complete')
							}
						});
						return_knowledges.push(max_knowledge);
						console.log('Adjust scores complete');
						callback(null, return_knowledges);
					}else{
						console.log('find score failed');
						callback(new Error('find score failed'))
					}
				}
			});
		});
};

var saveTip = function(login_cookie, knowledgeList, user, creatorID, callback){
	// var userID = user.userID;
	// console.log(user);
	KConditionCtrl.initial_user_data(user, function(err, data){
		if(err){
			console.error(err);
			callback(err);
		}else{
			// console.log(user, data);
			var userinfo = _.assign(data, data.profile, data.mealNutrition);
			getKnowledge(login_cookie, knowledgeList, userinfo, function(err, knowledges){
				if(err) {
					console.log('getKnowledge err' + err.toString());
				}
				console.log(userinfo);
				TopicCtrl.createByKnowledgeTemplate(login_cookie, knowledges, userinfo, creatorID, function(err, response, data){
					if(err){
						callback(err,response,data);
					}else{
						callback(null,response,data);
					}
				});
			});
		}
	});
};

var saveTipSync = function(cookie, knowledgeList, creator, count, users){
	// if(count >= 2){
	// 	return;
	// }
	if(count >= users.length){
		return;
	}
	var user = users[count];
	console.log(user);
	var poss = Math.random();
	console.log(poss);
	if(poss<SKIP_POSS){
		console.log("skiped");
		count++;
		saveTipSync(cookie, knowledgeList, creator, count, users);
	}else{
		saveTip(cookie, knowledgeList, user, creator.userID, function(err,response,data){
		// saveTip(cookie, knowledgeList, "556faaad83f3308daf02f898", creator.userID, function(err,response,data){
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
	}
};


loginCtrl.login(function(cookie, creator){

	if(process.env.USEREMAIL){
		ProfileCtrl.findByEmail(process.env.USEREMAIL, function(err,data){
			var user = data.toObject();
			KnowledgeCtrl.listByType(cookie, 1,function(err, knowledgeList){
				if(err){
					return console.log('KnowledgeCtrl.listByType err'+ err.toString());
				}
				console.log('USERID: '+user.userID);
				if(process.env.DATE){
					user.target_date = new Date(process.env.DATE);
					console.log('DATE: '+user.target_date);
				}
				saveTip(cookie, knowledgeList, user, creator.userID, function(err,response,data){
					if(err){
						console.log(err +' '+ response +' '+ data);
						mongoose.connection.close();
					}else{
						console.log('finished');
						mongoose.connection.close();
					}
				});

				//mongoose.connection.close();
			});
		});
	}else{
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
	}
});
