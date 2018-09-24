var mongoose = require('mongoose');

process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('../controllers/login.server.controller');
//logging
var assert = require('assert');
var async = require('async');
require('../models/point');
var Point = mongoose.model('Point');
var SummaryCtrl = require('../controllers/summaries.server.controller');
var TopicCtrl = require('../controllers/topics.server.controller');
var KnowledgeCtrl = require('../controllers/knowledgelocal.server.controller');
var MealCtrl = require('../controllers/meals.server.controller');
var ExerciseCtrl = require('../controllers/exercises.server.controller');
var GoalCtrl = require('../controllers/goals.server.controller');
var ProfileCtrl = require('../controllers/profiles.server.controller');
var count = 0;

var savePointsForUser = function(login_cookie, user, callback) {
	var userID = user.userID;
	var startDate = new Date(user.registrationTime);
	console.log(user.email, startDate);
	var weekCount = 1;
	var currentSunday = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()-startDate.getDay()+1 + weekCount*7);
	async.whilst(
    function() { return currentSunday < new Date(); },
    function(callback) {
			// console.log(currentSunday);
			var today = currentSunday;
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
			    },
					currentSunday: function(callback){
						callback(null, currentSunday);
					}
			},
			// optional callback
			function(err, results) {
				// console.log(results);
			    // the results array will equal ['one','two'] even though
			    // the second function had a shorter timeout.
					var meal_points = Math.round(results.mealScore*0.1*results.mealCount)*10;
					// var exercise_points = Math.round(results.stepCount*1.0/results.stepCountGoal*200);
					var exercise_points = Math.round(results.pCal+Math.min(results.mCal,160.0))*5;
				    var usage_points = Math.round(results.Usage);
					var total_points = meal_points + exercise_points+ usage_points;


					var userinfo = {
						'userID': userID,
						'firstName': user.firstName,
						'weekly_meal_points': meal_points,
						'weekly_exercise_points': exercise_points,
						'weekly_usage_points':usage_points,
						'weekly_total_points': total_points
					};
					// console.log(total_points);
					if(total_points > 0){
						var tp = new Point({
							userID: userID,
							value: total_points,
							type: ['TotalPoint'],
							frequency: ['Weekly'],
							recordedTime: results.currentSunday
						});

						var ep = new Point({
							userID: userID,
							value: exercise_points,
							type: ['ExercisePoint'],
							frequency: ['Weekly'],
							recordedTime: results.currentSunday
						});

						var mp = new Point({
							userID: userID,
							value: meal_points,
							type: ['MealPoint'],
							frequency: ['Weekly'],
							recordedTime: results.currentSunday
						});

                        var up = new Point({
                            userID: userID,
                            value: usage_points,
                            type: ['UsagePoint'],
                            frequency: ['Weekly'],
                            recordedTime: results.currentSunday
                        });
						async.parallel([
							function(callback){
								tp.save(function(err){
									if(err){
										console.log('save total points err' + err.toString());
										callback(err, userinfo);
									}else{
										callback(null,userinfo);
									}
								});
							},
							function(callback){
								ep.save(function(err){
									if(err){
										console.log('save exercise points err' + err.toString());
										callback(err, userinfo);
									}else{
										callback(null,userinfo);
									}
								});
							},
							function(callback){
								mp.save(function(err, user){
									if(err){
										console.log('save meal points err' + err.toString());
										callback(err, userinfo);
									}else{
										callback(null,userinfo);
									}
								});
							}],
						function(err, results){
							if(err){
								console.log('save points err' + err.toString());
								callback(err);
							}else{
								callback(null, results);
							}
						});
					}else{
						callback(null);
					}
			});
			weekCount = weekCount + 1;
			currentSunday = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()-startDate.getDay()+1 + weekCount*7);
    }, callback);
};

var saveTip = function(login_cookie, user, callback){
	// console.log(userID);
	savePointsForUser(login_cookie, user, function(err, userinfo){
		if(err) {
			console.log('savePointsForUser err' + err.toString());
			callback(err, userinfo);
		}
		// console.log(knowledges);
		callback(null, userinfo);
	});
};

var saveTipSync = function(cookie, count, users){
	if(count >= users.length){
		return;
	}
	var user = users[count];
	saveTip(cookie, user, function(err, data){
		if(err){
			console.log(err +' '+ data);
			count++;
			saveTipSync(cookie, count, users);
		}else{
			count++;
			saveTipSync(cookie, count, users);
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
			saveTip(cookie, user, function(err,data){
				if(err){
					console.log(err +' '+ data);
				}else{
					console.log('finished');
					mongoose.connection.close();
				}
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
			saveTipSync(cookie, count, users);
			// mongoose.connection.close();

		});
	}
});
