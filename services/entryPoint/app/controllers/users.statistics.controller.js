/**
 *
 * Created by Canon on 2016-01-28.
 */
/**
 * controllers here are used to calculate some
 * statistics for a group of users who belong to certain organization
 */
'use strict';

var mongoose = require('mongoose');
var meals = mongoose.model('Meal');
var users = mongoose.model('User');
var exercises = mongoose.model('Exercise');
var weights = mongoose.model('Weight');
var points = mongoose.model('Point');
var async = require('async');
var ObjectId = mongoose.Types.ObjectId;
var calActivityScore = require('../utils/activityUtil').calActivityScore;
var UserActivities = mongoose.model('UserActivities');
var Point = mongoose.model('Point');
var util = require('util');

//var reduceRecordByDate = function(data) {
//	var recordByDate = data.reduce(function(prev, next) {
//		var date = new Date(next.recordedTime);
//		var dateStr = date.toISOString().slice(0,10);
//		if(prev[dateStr] === undefined) {
//			prev[dateStr] = [];
//		}
//		prev[dateStr].push(next);
//		return prev;
//	}, {});
//	return recordByDate;
//};
//
//
//var calSumEachDay = function(recordByDate, keys) {
//	var days = Object.keys(recordByDate);
//	var recordSumByDate = {};
//	days.forEach(function(day) {
//		var data = recordByDate[day];
//		var dailySum = {};
//		keys.forEach(function(key) {
//			var sum = data.reduce(function(prev, next) {
//				return prev + next[key];
//			});
//		});
//	});
//};
//
//var calAvgEachDay = function(recordByDate, keys) {
//
//};
//
//var a1cDailyAverage = function(data){
//	var a1cByDate = reduceRecordByDate(data.a1cRecords);
//
//	var keys = Object.keys(a1cByDate);
//	var a1cAverageByDate = {};
//	keys.forEach(function(key) {
//		var data = a1cByDate[key];
//		var length = data.length;
//		var sum = data.reduce(function(prev, next) {
//			return prev + next.a1CValue;
//		}, 0);
//		var average = sum / length;
//		a1cAverageByDate[key] = average;
//	});
//	return a1cAverageByDate;
//};
//
//var mealScoreDailyAverage = function(data) {
//	var mealScoreByDate = reduceRecordByDate(data.mealRecords);
//
//	var keys = Object.keys(mealScoreByDate);
//	var mealScoreAverageByDate = {};
//	keys.forEach(function(key) {
//		var data = mealScoreByDate[key];
//		var length = data.length;
//		var sum = data.reduce(function(prev, next) {
//			return prev + next.mealScore;
//		}, 0);
//		var average = sum / length;
//		mealScoreAverageByDate[key] = average;
//	});
//	return mealScoreAverageByDate;
//};
//
//var exerciseDailyTotal = function(data) {
//	var exerciseByDate = reduceRecordByDate(data.exerciseRecords);
//
//	var keys = Object.keys(exerciseByDate);
//
//
//};


/**
 * to calculate everyday average of meal score for a **single** user in a certain period
 * sample json output
 * [
 *     {date: date, avgMealScore: score}
 * ]
 * @param req
 * @param res
 * @returns {*}
 */
exports.mealScoreDailyAverageForUser = function(req, res) {
	var userId = req.body.userId;
	if(!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).send('Invalud User ID');
	}
	var startDate = new Date(req.body.startDate);
	var endDate = new Date(req.body.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	meals.aggregate([
		{
			$match: {userID: new ObjectId(userId), recordedTime: {$gte: startDate, $lt: endDate}, mealScore: {$exists:true} }
		},
		{
			$project: {recordedTimeLocal: { $subtract : [ '$recordedTime', tz_offset] } ,
						mealScore: '$mealScore'
			}
		},
		{
			$group: {
				_id: {$dateToString: {format: '%Y-%m-%d', date: '$recordedTimeLocal'}},
				mealScoreAvg: {$avg: '$mealScore'},
				mealScoreMax: {$max: '$mealScore'},
				mealScoreMin: {$min: '$mealScore'}
			}
		},
		{
			$sort: {
				_id: 1
			}
		}
	], function(err, data) {
		if(err || !data) {
			if(err) {
				console.log('Failed to mealScoreDailyAverageForUser: ', err.message);
			}
			res.status(404).send('No data found');
		} else {
			res.json(data);
		}

	});
};


/**
 * to calculate everyday average of meal score for **every** user from a group in a certain period
 * sample json output
 * [
 *     {
 *         userID: userID, userName:userName,
 *         dailyRecord:[
 *             {
 *                 date: date,
 *                 avgMealScore: score
 *             },
 *             {...}
 *         ]
 *     }
 * ]
 * @param req
 * @param res
 * @returns {*}
 */
exports.mealScoreDailyAverageForUsersInGroup = function(req, res) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;


	meals.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}, mealScore: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'mealScore': '$mealScore',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'mealScore': '$mealScore',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset] },
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedTimeLocal' }},
				userID: '$userID',
				userName: '$userName'
			},
			mealScoreAvg: {$avg: '$mealScore'}
		}
		},
		{$group: {
			_id: {
				'userID' : '$_id.userID',
				'userName' : '$_id.userName'
			},
			dailyRecords: {
				$push: {date: '$_id.date', mealScoreAvg: '$mealScoreAvg'}
			}
		}
		}
	], function(err, data) {
		if(err) {
			console.log('Failed to mealScoreDailyAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			res.send(data);
		}
	});

};


/**
 * to calculate every day average meal score of all users from a group
 * NOTE this is average among all users
 * sample json output
 * [
 *     {date: date, avgScore: score},
 *     {...}
 * ]
 * @param req
 * @param res
 */
exports.mealScoreDailyAverageForGroup = function(req,res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);

	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;

	meals.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}, mealScore: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'accessCode'
		}},
		{$project: {
			'userID': '$userID',
			'mealScore': '$mealScore',
			'recordedTime': '$recordedTime',
			'userInfo': {$arrayElemAt: ['$accessCode', 0]},
		}},
		{$project: {
			'userID': '$userID',
			'mealScore': '$mealScore',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset] },
			'accessCode': '$userInfo.accessCode'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedTimeLocal' }},
				userID: '$userID'
			},
			mealScoreAvg: {$avg: '$mealScore'}
			}
		},
		{$group: {
			_id: '$_id.date',
			mealScoreAvg: {$avg: '$mealScoreAvg'},
			mealScoreMax: {$max: '$mealScoreAvg'},
			mealScoreMin: {$min: '$mealScoreAvg'}
			}
		},
		{$sort: {_id: 1 }}
	], function(err, data) {
		if(err) {
			console.log('Failed to mealScoreDailyAverageForGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			var info = {};
			data.forEach(function(d) {
				info[d._id] = d;
			});
			req.mealScoreDailyAverage = info;
			//res.send(data);
			next();
		}
	});
};

exports.readMealScoreDailyAverageForGroup = function(req, res) {
	res.send(req.mealScoreDailyAverage);
};
/**
 * to calculate the average meal score during a period of time for **every** user from a group
 * sample json output
 * [
 *     { _id: {userID: userID, userName: userName}, avgMealScore: score},
 *     {...}
 * ]
 * @param req
 * @param res
 */
exports.mealScorePeriodAverageForUsersInGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;


	meals.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}, mealScore: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'mealScore': '$mealScore',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'mealScore': '$mealScore',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset] },
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				//date: { $dateToString: { format: "%Y-%m-%d", date: "$recordedTimeLocal" }},
				userID: '$userID',
				userName: '$userName'
			},
			mealScoreAvg: {$avg: '$mealScore'},
			recordCount: {$sum: 1}
		}
		}
	], function(err, data) {
		if(err) {
			console.log('Failed to mealScorePeriodAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			//res.send(data);
			req.mealScoreAverage = data;
			next();
		}
	});
};

exports.readPeriodMealScoreAverage = function(req, res) {
	res.send(req.mealScoreAverage);
};

/**
 * to calculate every day average point of all users from a group
 * NOTE this is average among all users
 * sample json output
 * [
 *     {_id: {date: date, type: type, frequency: frequency}, pointAvg: avgPoint, pointMax: maxPoint, pointMin: minPoint},
 *     {...}
 * ]
 * @param req
 * @param res
 */
exports.pointDailyAverageForGroup = function(req,res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);

	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;

	points.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate} }}, //, mealScore: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'accessCode'
		}},
		{$project: {
			'userID': '$userID',
			'value': '$value',
			'type': '$type',
			'frequency': '$frequency',
			'recordedTime': '$recordedTime',
			'userInfo': {$arrayElemAt: ['$accessCode', 0]},
		}},
		{$project: {
			'userID': '$userID',
			'value': '$value',
			'type': '$type',
			'frequency': '$frequency',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset] },
			'accessCode': '$userInfo.accessCode'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedTimeLocal' }},
				userID: '$userID',
				type: '$type',
				frequency: '$frequency',
			},
			points: {$avg: '$value'}
			}
		},
		{$group: {
			_id: {
				date:'$_id.date',
				type: '$type',
				frequency: '$frequency',
			},
			pointAvg: {$avg: '$points'},
			pointMax: {$max: '$points'},
			pointMin: {$min: '$points'}
			}
		},
		{$sort: {_id: 1 }}
	], function(err, data) {
		if(err) {
			console.log('Failed to pointDailyAverageForGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			var info = {};
			data.forEach(function(d) {
				info[d._id] = d;
			});
			req.pointDailyAverage = info;
			//res.send(data);
			next();
		}
	});
};

exports.readPointDailyAverageForGroup = function(req, res) {
	res.send(req.pointDailyAverage);
};
/**
 * to calculate the total points during a period of time for **every** user from a group
 * sample json output
 * [
 *     { _id: {userID: userID, userName: userName, type: type, frequency: frequency}, value: value},
 *     {...}
 * ]
 * @param req
 * @param res
 */
exports.pointPeriodAverageForUsersInGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	// console.log('in pointPeriodAverageForUsersInGroup method');
	console.log(accessCode,startDate,endDate);


	points.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'value': '$value',
			'type': '$type',
			'frequency': '$frequency',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'value': '$value',
			'type': '$type',
			'frequency': '$frequency',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset] },
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				//date: { $dateToString: { format: "%Y-%m-%d", date: "$recordedTimeLocal" }},
				userID: '$userID',
				userName: '$userName',
				type: '$type',
				frequency: '$frequency'
			},
			value: {$avg: '$value'},
			recordCount: {$sum: 1}
		}
		}
	], function(err, data) {
		if(err) {
			console.log('Failed to PointPeriodAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			//res.send(data);
			// var points = {};
			// data.forEach(function(p){
			// 	var userInfo = {userID: data._id.userID, userName: data._id.userName};
			// 	if(!points[userInfo])
			// 		points[userInfo] = {};
			// 	points[userInfo][data._id.frequency+data._id.type] = data.value;
			// });
			// req.points= points;
			// console.log(points);
			 //console.log('********************!!!!!!!!!!!!data is:',data);
			req.points = data;
			next();
		}
	});
};

exports.readPeriodPointAverage = function(req, res) {
	res.send(req.points);
};


//Codes for TotalPoints.

exports.pointPeriodTotalForUsersInGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	// console.log('in pointPeriodAverageForUsersInGroup method');
	//console.log(accessCode,startDate,endDate);
	Point.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'value': '$value',
			'type': '$type',
			'frequency': '$frequency',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'value': '$value',
			'type': '$type',
			'frequency': '$frequency',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset] },
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				userID: '$userID',
				userName: '$userName',
				type:'$type',
				'frequency': '$frequency',
				date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedTimeLocal' }}
			},
			value: {$avg: '$value'}
			//recordCount: {$sum :1 }
		}
		},
		{$group: {
			_id:{
				userID: '$_id.userID',
				userName: '$_id.userName',
				type: '$type',
				frequency: '$frequency'
			},
			value:{$sum:'$value'},
			recordCount: {$sum :1 }
		}
		}

	], function(err, data) {
		if(err) {
			console.log('Failed to PointPeriodAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			//res.send(data);
			// var points = {};
			// data.forEach(function(p){
			// 	var userInfo = {userID: data._id.userID, userName: data._id.userName};
			// 	if(!points[userInfo])
			// 		points[userInfo] = {};
			// 	points[userInfo][data._id.frequency+data._id.type] = data.value;
			// });
			// req.points= points;
			// console.log(points);
			console.log('%%%%%%%%%%%%%%%%%%%%%%%%Data%%%%%%%%%%%%%%%%%%%%%%: ',data);
			req.points = data;
			next();
		}
	});
};

exports.readPeriodPointTotal = function(req, res) {
	res.send(req.points);
};




exports.readWeightDailyAverageForGroup = function(req, res) {
	res.send(req.avgWeight);
};
/**
 * to calculate the total points during a period of time for **every** user from a group
 * sample json output
 * [
 *     { _id: {userID: userID, userName: userName, type: type, frequency: frequency}, value: value},
 *     {...}
 * ]
 * @param req
 * @param res
 */
exports.weightPeriodAverageForUsersInGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	// accessCode = '00000000';
	// startDate = new Date(2016,1,1);
	var now = new Date();
	// endDate = now;
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	// console.log('in pointPeriodAverageForUsersInGroup method');
	console.log(accessCode,startDate,endDate);


	weights.aggregate([
		{$match: {recordedTime: {$lte: endDate}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'value': '$weightValue',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'value': '$value',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset] },
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},
		{$sort: {'recordedTimeLocal': 1}},
		{$group: {
			_id: {
				//date: { $dateToString: { format: "%Y-%m-%d", date: "$recordedTimeLocal" }},
				userID: '$userID',
				userName: '$userName',
			},
			value: {$last: '$value'},
			recordCount: {$sum: 1}
		}
		}
	], function(err, data) {
		if(err) {
			console.log('Failed to PointPeriodAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			console.log('data is: '+JSON.stringify(data));
			var result = [];
			async.each(data, function(d,callback){
				weights.find({userID:d._id.userID,recordedTime: {$lte:startDate}}).sort({recordedTime:-1}).limit(1).exec(function(err, fweight){
					if(err){
						console.log('error');
						callback(err);
					}else{
						var weightdiff = 0;
						if(fweight.length !== 0){
							weightdiff = d.value-fweight[0].weightValue;
						}
						result.push({_id:d._id , value: weightdiff});
						callback(null, {userID:d._id.userID, value: weightdiff});
					}
				});
			}, function(err){
				if(err){
					console.log(err);
				}else{
					console.log(result);
					var s = 0;
					var c = 0;
					result.forEach(function(r){
						if(s !== 0){
							s = s + r.value;
							c = c + 1;
						}
					});
					req.avgWeight = {weight:s*1.0/c};
					req.weights = result;
					next();
				}
			});

		}
	});
};

exports.readPeriodWeightAverage = function(req, res) {
	res.send(req.weights);
};

exports.exerciseCaloriesDailyAverageForUser = function(req, res) {
	var userId = req.query.userId;
	if(!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).send('Invalud User ID');
	}
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;


	exercises.aggregate([
		{
			$match: {userID: new ObjectId(userId), recordedTime: {$gte: startDate, $lt: endDate}, calories: {$exists:true} }
		},
		{
			$project: {recordedTimeLocal: {$subtract: ['$recordedTime', tz_offset]}}
		},
		{
			$group: {
				_id: {$dateToString: {format: '%Y-%m-%d', date: '$recordedTimeLocal'}},
				caloriesAvg: {$avg: '$calories'},
				caloriesMax: {$max: '$calories'},
				caloriesMin: {$min: '$calories'}
			}
		},
		{
			$sort: {
				_id: 1
			}
		}
	], function(err, data) {
		if(err || !data) {
			if(err) {
				console.log('Failed to exerciseCaloriesDailyAverageForUser: ', err.message);
			}
			res.status(404).send('No data found');
		} else {
			res.json(data);
		}

	});
};

exports.exerciseCaloriesDailyAverageForUsersInGroup = function(req, res) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;


	exercises.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}, calories: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'calories': '$calories',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'calories': '$calories',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset]},
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedTimeLocal' }},
				userID: '$userID',
				userName: '$userName'
			},
			caloriesAvg: {$avg: '$calories'}
		}
		},
		{$group: {
			_id: {
				'userID' : '$_id.userID',
				'userName' : '$_id.userName'
			},
			dailyRecords: {
				$push: {date: '$_id.date', caloriesAvg: '$caloriesAvg'}
			}
		}
		}
	], function(err, data) {
		if(err) {
			console.log('Failed to exerciseCaloriesDailyAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			res.send(data);
		}
	});

};

exports.exerciseCaloriesDailyAverageForGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;


	exercises.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}, calories: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'accessCode'
		}},
		{$project: {
			'userID': '$userID',
			'calories': '$calories',
			'recordedTime': '$recordedTime',
			'userInfo': {$arrayElemAt: ['$accessCode', 0]},
		}},
		{$project: {
			'userID': '$userID',
			'calories': '$calories',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset]},
			'accessCode': '$userInfo.accessCode'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedTimeLocal' }},
				userID: '$userID'
			},
			caloriesAvg: {$avg: '$calories'}
		}
		},
		{$group: {
			_id: '$_id.date',
			caloriesAvg: {$avg: '$caloriesAvg'},
			caloriesMax: {$max: '$caloriesAvg'},
			caloriesMin: {$min: '$caloriesAvg'}
		}
		},
		{$sort: {_id: 1 }}
	], function(err, data) {
		if(err) {
			console.log('Failed to exerciseCaloriesDailyAverageForGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			var info = {};
			data.forEach(function(d) {
				info[d._id] = d;
			});
			req.caloriesDailyAverage = info;
			next();
			//res.send(data);
		}
	});

};

exports.readExerciseCaloriesDailyAverageForGroup = function(req, res) {
	res.send(req.caloriesDailyAverage);
};


exports.exerciseCaloriesPeriodAverageForUsersInGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;

	exercises.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}, calories: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'calories': '$calories',
			//'stepCount': '$stepCount',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'calories': '$calories',
			//'stepCount': '$stepCount',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset]},
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},

		{$group: {
			_id: {
				userID: '$userID',
				userName: '$userName',
				date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedTimeLocal' }}
			},
			Dailycalories: {$sum: '$calories'},
			//stepCountAvg: {$avg: '$stepCount'},
			//recordCount: {$sum :1 }
		}
		},
		{$group: {
			_id:{
				userID: '$_id.userID',
				userName: '$_id.userName'
			},
			caloriesAvg:{$avg:'$Dailycalories'},
			recordCount: {$sum :1 }
		}
		}
	], function(err, data) {
		if(err) {
			console.log('Failed to exerciseCaloriesPeriodAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			//console.log('***********************Data************************\n',data);
			//res.send(data);
			//console.log('caculate avg calories:' + JSON.stringify(data));
			req.caloriesAverage = data;
			next();
		}
	});
};

exports.exerciseStepCountsPeriodAverageForUsersInGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	//console.log('tz_offset: ',tz_offset);
	//console.log('Start Date: ',startDate);
	//console.log('End Date: ',endDate);
	exercises.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}, stepCount: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'stepCount': '$stepCount',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'stepCount': '$stepCount',
			'recordedTimeLocal':'$recordedTime', //{$subtract: ['$recordedTime', tz_offset]},
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},


		/*
		//original gourp sentence.
		{$group: {
			_id: {
				//date: { $dateToString: { format: "%Y-%m-%d", date: "$recordedTimeLocal" }},
				userID: '$userID',
				userName: '$userName'
			},
			stepCountAvg: {$avg: '$stepCount'},
			recordCount: {$sum :1 }
		}
		}
		 */
		{$group: {
			_id: {
				userID: '$userID',
				userName: '$userName',
				date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedTimeLocal' }}
			},
			DailystepCount: {$sum: '$stepCount'}
			//recordCount: {$sum :1 }
			}
		},
		{$group: {
			_id:{
				userID: '$_id.userID',
				userName: '$_id.userName'
			},
		 	stepCountAvg:{$avg:'$DailystepCount'},
			recordCount: {$sum :1 }
			}
		}
	], function(err, data) {
		if(err) {
			console.log('Failed to exerciseStepCountPeriodAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			//console.log("***********************StepCount Data************************\n",data);
			//res.send(data);
			//console.log('caculate avg step count:' + JSON.stringify(data));
			req.stepCountAverage =data;
			//console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",req.stepCountAverage);
			next();
		}
	});
};

exports.readPeriodExerciseCaloriesAverage = function(req, res) {
	res.send(req.caloriesAverage);
};

//Test Codes for get Activity Recors.

exports.ActivityPeriodAverageForUsersInGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	UserActivities.aggregate([
		{$match: {activityTime: {$gte: startDate, $lt: endDate}}},
		{$lookup: {
			from: 'users',
			localField: 'user',
			foreignField: '_id',
			as: 'accessCode'
		}},
		{$project: {
			'userID': '$user',
			'Type': '$activityName',
			'recordedTime': '$activityTime',
			'userInfo': {$arrayElemAt: ['$accessCode', 0]}
		}},
		{$project: {
			'userID': '$userID',
			'userName': '$userInfo.userName',
			'Type': '$Type',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset] },
			'accessCode': '$userInfo.accessCode'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				userID: '$userID',
				userName: '$userName'
			},
			Activity: {$sum :1 }
		}
		}

	], function(err, data) {
		if(err || !data) {
			if(err) {
				console.log('Failed to ActivityPeriodAverageForUsersInGroup: ', err.message);
			}
			res.status(404).send('No data found');
		} else {

			//console.log("*******************Request Data*******************\n",data);
			//console.log("**********************************************************");
			req.activityAverage =data;
			next();
		}

	});

};

exports.readPeriodActivityAverage = function(req, res) {
	res.send(req.activityAverage);
};

exports.preprocessing = function(req, res, next) {
	if(req.query.year && req.query.month) {
		var m=('00' + req.query.month).slice(-2);
		req.query.startDate = util.format('%s-%s-01', req.query.year, m);
		req.query.endDate = util.format('%s-%s-30', req.query.year, m);
	}
	next();

};




exports.exerciseMinutesPeriodAverageForUsersInGroup = function(req, res, next) {
	var accessCode = req.query.accessCode;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;

	exercises.aggregate([
		{$match: {recordedTime: {$gte: startDate, $lt: endDate}, minutes: {$exists:true}}},
		{$lookup: {
			from: 'users',
			localField: 'userID',
			foreignField: '_id',
			as: 'userInfo'
		}},
		{$project: {
			'userID': '$userID',
			'minutes': '$minutes',
			'recordedTime': '$recordedTime',
			'userInfo': {
				$arrayElemAt: ['$userInfo', 0],
			}
		}},
		{$project: {
			'userID': '$userID',
			'minutes': '$minutes',
			'recordedTimeLocal': {$subtract: ['$recordedTime', tz_offset]},
			'accessCode': '$userInfo.accessCode',
			'userName': '$userInfo.userName'
		}},
		{$match: {accessCode: accessCode}},
		{$group: {
			_id: {
				//date: { $dateToString: { format: "%Y-%m-%d", date: "$recordedTimeLocal" }},
				userID: '$userID',
				userName: '$userName'
			},
			minutesAvg: {$avg: '$minutes'},
			recordCount: {$sum :1 }
		}
		}
	], function(err, data) {
		if(err) {
			console.log('Failed to exerciseMinutesPeriodAverageForUsersInGroup: ', err.message);
			res.status(400).send('No Result Found');
		} else {
			//res.send(data);
			req.minutesAverage = data;
			next();
		}
	});
};

exports.readPeriodExerciseMinutesAverage = function(req, res) {
	res.send(req.minutesAverage);
};




exports.dailyAverage = function(req, res) {
	var mealScoreDailyAverage = req.mealScoreDailyAverage;
	var caloriesDailyAverage = req.caloriesDailyAverage;
	var dailyAverage = [];
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	while(startDate <= endDate) {
		var dateStr = startDate.toISOString().slice(0, 10);
		var meal = mealScoreDailyAverage[dateStr];
		var calories = caloriesDailyAverage[dateStr];
		var obj = {};
		if(meal) {
			obj.mealScoreAvg =  meal.mealScoreAvg;
		}
		if(calories) {
			obj.caloriesAvg = calories.caloriesAvg;
		}
		if(typeof obj.mealScoreAvg !== 'undefined' || typeof obj.caloriesAvg !== 'undefined') {
			obj.date = dateStr;
			dailyAverage.push(obj);
		}

		startDate.setDate(startDate.getDate() + 1);
	}
	res.send(dailyAverage);

};


exports.readPublicStatistics = function(req, res, next) {
	var mealScoreAverage = req.mealScoreAverage;
	var caloriesAverage = req.caloriesAverage;

	//console.log("**********************");
	var minutesAverage = req.minutesAverage;
	var activityAverage=req.activityAverage;
	var stepCountAverage = req.stepCountAverage;
	var pointsSum = req.points;
	var weightChange = req.weights;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var diff = endDate.getTime() - startDate.getTime();
	var dayDiff = Math.floor(diff/1000/60/60/24);

	//Code that added.
	var accessCode = req.query.accessCode;
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	//console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^This is Dates: ",startDate,endDate);


	var statistics = mealScoreAverage.reduce(function(prev, next) {
		var key = next._id.userID;
		var value = next.mealScoreAvg;
		//var activity = next.recordCount;
		var userName = next._id.userName;
		var record = {};
		record.mealScoreAvg = value;
		record.userName = userName;
		//record.activity = Number(activity);
		prev[key] = record;
		return prev;
	}, {});
	//console.log("Point Sum is: ",pointsSum);
	//console.log("**********************");
	pointsSum.forEach(function(doc){
		//console.log("Data for each Time: ",doc);
		//console.log("----------------------------------");
		var key = doc._id.userID;
		var type = doc._id.type;
		var frequency = doc._id.frequency;
		var value = doc.value;
		//var activity = doc.recordCount;
		if(!statistics[key]) {
			var record = {};
			var userName = doc._id.userName;
			record.userName = userName;
			record[frequency+type] = value;
			statistics[key] = record;
		} else {
			statistics[key][frequency+type] = value;
		}
	});

	caloriesAverage.forEach(function(doc) {
		var key = doc._id.userID;
		var value = doc.caloriesAvg;
		var activity = doc.recordCount;
		if(!statistics[key]) {
			var record = {};
			var userName = doc._id.userName;
			record.userName = userName;
			record.caloriesAvg = value;
			//record.activity = calActivityScore(activity, dayDiff);
			statistics[key] = record;
		} else {
			statistics[key].caloriesAvg = value;
			//statistics[key].activity = calActivityScore(statistics[key].activity + activity, dayDiff);
		}
	});

	stepCountAverage.forEach(function(doc) {
		var key = doc._id.userID;
		var value = doc.stepCountAvg;
		if(!statistics[key]) {
			var record = {};
			var userName = doc._id.userName;
			record.userName = userName;
			record.stepCountAvg = value;
			statistics[key] = record;
		} else {
			statistics[key].stepCountAvg = value;
		}
	});

	var results = [];

	//var now = new Date();
	now.setMonth(now.getMonth()+1);
	now.setDate(1);
	now.setHours(0,0,0,0);
	var seconds = Math.round(now.getTime() / 1000);

	var genRandomID = function(randseed, userID) {
		var randomID = parseInt(userID.substring(0, 8), 16);

		//randomID = randomID - 1417410000 ;// Mon Dec 01 2014 00:00:00 GMT-0500 (EST)
		//var RID = randomID.toString(16)+weekDay.toString(16);

		var RID = randseed-randomID;

		var res = RID.toString(10).split('').reverse().join('');
		return res; //RID.toString(16);
	};

	for(var key in statistics){
		var value = statistics[key];
		value.userName = undefined;
		value.randomID = genRandomID(seconds, key);
		results.push(value);
		/* use key/value for intended purpose */
	}

	res.send(results);
	//res.json(results);
	//console.log("----------------Statistics Data---------------------\n",statistics);

};

exports.readStatistics = function(req, res, next) {
	var mealScoreAverage = req.mealScoreAverage;
	var caloriesAverage = req.caloriesAverage;

	//console.log("**********************");
	var minutesAverage = req.minutesAverage;
	var activityAverage=req.activityAverage;
	var stepCountAverage = req.stepCountAverage;
	var pointsSum = req.points;
	var weightChange = req.weights;
	var startDate = new Date(req.query.startDate);
	var endDate = new Date(req.query.endDate);
	var diff = endDate.getTime() - startDate.getTime();
	var dayDiff = Math.floor(diff/1000/60/60/24);

	//Code that added.
	var accessCode = req.query.accessCode;
	var now = new Date();
	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	//console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^This is Dates: ",startDate,endDate);


	var statistics = mealScoreAverage.reduce(function(prev, next) {
		var key = next._id.userID;
		var value = next.mealScoreAvg;
		//var activity = next.recordCount;
		var userName = next._id.userName;
		var record = {};
		record.mealScoreAvg = value;
		record.userName = userName;
		//record.activity = Number(activity);
		prev[key] = record;
		return prev;
	}, {});
	//console.log("Point Sum is: ",pointsSum);
	//console.log("**********************");
	pointsSum.forEach(function(doc){
		//console.log("Data for each Time: ",doc);
		//console.log("----------------------------------");
		var key = doc._id.userID;
		var type = doc._id.type;
		var frequency = doc._id.frequency;
		var value = doc.value;
		//var activity = doc.recordCount;
		if(!statistics[key]) {
			var record = {};
			var userName = doc._id.userName;
			record.userName = userName;
			record[frequency+type] = value;
			statistics[key] = record;
		} else {
			statistics[key][frequency+type] = value;
		}
	});

	weightChange.forEach(function(doc){
		var key = doc._id.userID;
		var value = doc.value;
		if(!statistics[key]) {
			var record = {};
			var userName = doc._id.userName;
			record.userName = userName;
			record.weightChange = value;
			statistics[key] = record;
		} else {
			statistics[key].weightChange = value;
		}
	});

	caloriesAverage.forEach(function(doc) {
		var key = doc._id.userID;
		var value = doc.caloriesAvg;
		var activity = doc.recordCount;
		if(!statistics[key]) {
			var record = {};
			var userName = doc._id.userName;
			record.userName = userName;
			record.caloriesAvg = value;
			//record.activity = calActivityScore(activity, dayDiff);
			statistics[key] = record;
		} else {
			statistics[key].caloriesAvg = value;
			//statistics[key].activity = calActivityScore(statistics[key].activity + activity, dayDiff);
		}
	});

	stepCountAverage.forEach(function(doc) {
		var key = doc._id.userID;
		var value = doc.stepCountAvg;
		if(!statistics[key]) {
			var record = {};
			var userName = doc._id.userName;
			record.userName = userName;
			record.stepCountAvg = value;
			statistics[key] = record;
		} else {
			statistics[key].stepCountAvg = value;
		}
	});

	activityAverage.forEach(function(doc) {
		//console.log("&&&&&&&&&&&&&&&&&&&&&",doc);
		var key = doc._id.userID;
		var value = doc.Activity;

		if(!statistics[key]) {
			var record = {};
			var userName = doc._id.userName;
			record.userName = userName;
			record.activity = value;
			statistics[key] = record;
		} else {
			statistics[key].activity = value;
		}
	});

	//minutesAverage.forEach(function(doc) {
	//	var key = doc._id.userID;
	//	var value = doc.minutesAvg;
	//	var activity = doc.recordCount;
	//	if(!statistics[key]) {
	//		var record = {};
	//		var userName = doc._id.userName;
	//		record.userName = userName;
	//		record.minutesAvg = value;
	//		record.activity = calActivityScore(activity, dayDiff);
	//		statistics[key] = record;
	//	} else {
	//		statistics[key].minutesAvg = value;
	//		statistics[key].activity = calActivityScore(statistics[key].activity + activity, dayDiff);
	//	}
	//});

	res.send(statistics);
	//console.log("----------------Statistics Data---------------------\n",statistics);

};

exports.getTop = function(req, res, next) {
	var limit = req.query.top?Number(req.query.top):10;
	var mealScoreAverage = req.mealScoreAverage;
	var caloriesAverage = req.caloriesAverage;

	mealScoreAverage.sort(function(a, b) {
		return b.mealScoreAvg - a.mealScoreAvg;
	});
	caloriesAverage.sort(function(a, b) {
		return b.caloriesAvg - a.caloriesAvg;
	});
	var result = {
		mealScoreTop: mealScoreAverage.slice(0,limit),
		caloriesTop: caloriesAverage.slice(0,limit)
	};

	res.send(result);
};

exports.readDistribution = function(req, res) {
	var mealScoreAverage = req.mealScoreAverage;
	var caloriesAverage = req.caloriesAverage;
	var mealScoreAverageRound = mealScoreAverage.map(function(doc) {
		var roundScore = 10 * Math.floor(doc.mealScoreAvg/10);
		if(roundScore === 100) {
			roundScore = 90;
		}
		return roundScore;
	});

	var mealScoreDist = {'0': 0, '10': 0, '20': 0, '30':0, '40':0, '50':0, '60':0, '70':0, '80':0, '90':0};
	mealScoreAverageRound.forEach(function(score) {

		mealScoreDist[String(score)] += 1;
	});
	var max = Number(0.0);
	caloriesAverage = caloriesAverage.map(function(doc) {
		if(doc.caloriesAvg > max) {
			max = doc.caloriesAvg;
		}
		return doc.caloriesAvg;
	});



	var rangeMax = 50 * (Math.floor(max/ 50) + 1);
	var step = rangeMax / 10;
	var caloriesDist = {};
	var lowerBound = 0;

	while(lowerBound < rangeMax) {
		caloriesDist[String(lowerBound)] = 0;
		lowerBound += step;
	}
	caloriesAverage.forEach(function(cal){
		var calMappedLowerBound = step * Math.floor(cal/step);
		caloriesDist[String(calMappedLowerBound)] += 1;
	});

	var dist = {};
	dist.mealScoreDist = mealScoreDist;
	dist.caloriesDist = caloriesDist;

	res.send(dist);

};

exports.hasAuthorization = function(req, res, next) {
	var reqAccessCode = req.query.accessCode;
	var orgAdminAccessCode = req.user.accessCode;
	if((req.user.roles.indexOf('orgAdmin') === -1) ||
		(reqAccessCode !== orgAdminAccessCode && orgAdminAccessCode.indexOf(reqAccessCode) === -1)) {
		res.status(403).send('User is not authorized');
	} else {
		next();
	}
};


exports.command = function(req, res, next) {
	var cmd = req.query.cmd;
	var accessCode = req.query.accessCode;
	var startDate = req.query.startDate;
	var endDate = req.query.endDate;
	var prefix = '/userstastics/';
	var suffix = '?accessCode='+accessCode+'&startDate='+startDate+'&endDate='+endDate;
	switch(cmd)
	{
		case 'mealScoreDailyAverageForGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'mealScoreDailyAverageForUsersInGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'mealScorePeriodAverageForUsersInGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'pointPeriodAverageForUsersInGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'weightPeriodAverageForUsersInGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'caloriesDailyAverageForGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'caloriesDailyAverageForUsersInGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'caloriesPeriodAverageForUsersInGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'periodAverageForUsersInGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		case 'dailyAverageForGroup':
			res.redirect(prefix+cmd+suffix);
			break;
		default:
			res.status(400).send('error');
	}
};
