var mongoose = require('mongoose');

process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('../controllers/login.server.controller');
//logging
var assert = require('assert');
var async = require('async');
var SummaryCtrl = require('../controllers/summaries.server.controller');
var TopicCtrl = require('../controllers/topics.server.controller');
var KnowledgeCtrl = require('../controllers/knowledgelocal.server.controller');
var MealCtrl = require('../controllers/meals.server.controller');
var ExerciseCtrl = require('../controllers/exercises.server.controller');
var GoalCtrl = require('../controllers/goals.server.controller');
var ProfileCtrl = require('../controllers/profiles.server.controller');
var PointCtrl = require('../controllers/points.server.controller');
var count = 0;

var getKnowledge = function(login_cookie, knowledgeList, user, callback) {
	var knowledges = [];
	var userID = user.userID;
		KnowledgeCtrl.read('WeeklySummary', function(err, temp_knowledge){
			// console.log(JSON.stringify(user));
			if(err) {
				console.log('KnowledgeCtrl.read error: '+ err.toString());
				callback(err);
			}
			var today = new Date();
			var time_window = 7;
			async.parallel({
			    mealScore : function(callback) {
			        MealCtrl.getWeeklyAverageMealScore(mongoose.Types.ObjectId(userID), today, time_window, callback);
			    },
			    mealCount: function(callback) {
			        MealCtrl.getWeeklyMealLogsCounts(mongoose.Types.ObjectId(userID), today, time_window, callback);
			    },
					stepCount : function(callback) {
			        ExerciseCtrl.getWeeklyAverageStepCount(mongoose.Types.ObjectId(userID), today, time_window, callback);
			    },
                    Usage : function(callback) {
                        ExerciseCtrl.getWeeklyUsage(mongoose.Types.ObjectId(userID), today, time_window, callback);
			    },
					pCal : function(callback) {
			        ExerciseCtrl.getWeeklyAveragePedometerCalory(mongoose.Types.ObjectId(userID), today, time_window, callback);
			    },
					mCal : function(callback) {
			        ExerciseCtrl.getWeeklyAverageManualInputCalory(mongoose.Types.ObjectId(userID), today, time_window, callback);
			    },
			    stepCountGoal: function(callback) {
			        GoalCtrl.getWeeklyStepCountGoal(mongoose.Types.ObjectId(userID), callback);
			    }
			},
			// optional callback
			function(err, results) {
				//console.log(results);
			    // the results array will equal ['one','two'] even though
			    // the second function had a shorter timeout.
					var meal_points = Math.round(results.mealScore*0.1*results.mealCount)*10;
					// var exercise_points = Math.round(results.stepCount*1.0/results.stepCountGoal*200);
					var exercise_points = Math.round(results.pCal+Math.min(results.mCal,160.0))*5;
				    var usage_points = Math.round(results.Usage);
					var total_points = meal_points + exercise_points + usage_points;
					var userinfo = user.toJSON();
					userinfo.userID= userID;
					userinfo.firstName= user.firstName;
					userinfo.weekly_meal_points= meal_points;
					userinfo.weekly_exercise_points= exercise_points;
                	userinfo.weekly_usage_points=usage_points;
					userinfo.weekly_total_points=total_points;
					//console.log("****************Usage****************\n",usage_points);
					// var userinfo = {
					// 	'userID': userID,
					// 	'firstName': user.firstName,
					// 	'weekly_meal_points': meal_points,
					// 	'weekly_exercise_points': exercise_points,
					// 	'weekly_total_points': total_points
					// };
					var input = temp_knowledge.toObject();
					//console.log("Template is :\n",input);
					input.user = userID.toString();
					input.points = total_points;
					input.type = 'weekly';
					input.create_time = new Date();
					input.content = input.content.replace('$meal_points$', meal_points);
					input.content = input.content.replace('$exercise_points$', exercise_points);
					input.content = input.content.replace('$usage_points$', usage_points);
					input.content = input.content.replace('$total_points$', total_points);
					 //console.log(input);

					if(total_points != 0){
						PointCtrl.saveWeeklyUserPoint(userID, total_points, exercise_points, meal_points, today, function(err, results){
							if(err){
								console.log('savePoint err' + err.toString());
							}
							SummaryCtrl.create(input, function(err){
								if(err){
									callback(err);
								}else{
									ProfileCtrl.updatePoints(userID, total_points, function(err){
										if(err){
											callback(err);
										}else{
											knowledges.push(temp_knowledge._id);
											callback(null, knowledges, userinfo);
										}
									});
								}
							});
						});
					}else{
						SummaryCtrl.create(input, function(err){
							if(err){
								callback(err);
							}else{
								ProfileCtrl.updatePoints(userID, total_points, function(err){
									if(err){
										callback(err);
									}else{
										knowledges.push(temp_knowledge._id);
										callback(null, knowledges, userinfo);
									}
								});
							}
						});
					}

			});

		});
};

var saveTip = function(login_cookie, knowledgeList, user, creatorID, callback){
	// console.log(userID);
	getKnowledge(login_cookie, knowledgeList, user, function(err, knowledges, userinfo){
		if(err) {
			console.log('getKnowledge err' + err.toString());
		}
		// console.log(knowledges);
		TopicCtrl.createByKnowledgeTemplate(login_cookie, knowledges, userinfo, creatorID, function(err, response, data){
			if(err){
				callback(err,response,data);
			}else{
				callback(null,response,data);
			}
		});
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
};



loginCtrl.login(function(cookie, creator){

	if(process.env.USEREMAIL){
		ProfileCtrl.findByEmail(process.env.USEREMAIL, function(err,data){
			var user = data;
			KnowledgeCtrl.listByType(2,function(err, knowledgeList){
				if(err){
					return console.log('KnowledgeCtrl.listByType err'+ err.toString());
				}
				// console.log(user.userID);
				saveTip(cookie, knowledgeList, user, creator.userID, function(err,response,data){
					if(err){
						console.log(err +' '+ response +' '+ data);

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
			KnowledgeCtrl.listByType(2,function(err, knowledgeList){
				if(err){
					return console.log('KnowledgeCtrl.listByType err'+ err.toString());
				}
				saveTipSync(cookie, knowledgeList, creator, count, users);

				//mongoose.connection.close();
			});
		});
	}
});
