/**
 * Created by Canon on 2016-04-14.
 */
'use strict';

var mongoose = require('mongoose'),
	WeightGoal = mongoose.model('WeightGoal'),
	MacrosGoal = mongoose.model('MacrosGoal'),
	ExerciseGoal = mongoose.model('ExerciseGoal'),
	BloodGlucoseGoal = mongoose.model('BloodGlucoseGoal'),
	genXmlOutput =  require('../utils/genxmloutput.js'),
	UserProfileController = require('./users/users.profile.server.controller.js'),
	uuidGenerator = require('node-uuid'),
	async = require('async');


var genXmlOutputPlain = function(rootTag, jsonObj) {
	return genXmlOutput(rootTag, jsonObj, { 'pretty': false, 'indent': '', 'newline': '' });
};

var addOrUpdateOneWeightGoalRecord = function(userID, record, res, callback, isLast) {
	WeightGoal.findOne({userID:userID}).exec(function(err,data){
		var weightGoalRecord = data;
		if(err || !data){
			// console.log(err,data);
			// if (isLast) callback(err, {message:'save medicine record failed.'});
			console.log('Create new weight goal');
			weightGoalRecord = new WeightGoal();

		}
		var newDate = new Date(record.recordedTime);
		var oldDate = weightGoalRecord.recordedTime;
		if(!oldDate || newDate > oldDate){
			weightGoalRecord.userID = userID;
			weightGoalRecord.type = record.type;
			weightGoalRecord.target = record.target;
			weightGoalRecord.uuid = record.uuid;
			weightGoalRecord.recordedTime = newDate;

			var targetWeightGoal = weightGoalRecord.target*2.20462262/7 * 3500;
			if(weightGoalRecord.type === 0){
				targetWeightGoal = -targetWeightGoal;
			}
			UserProfileController.updateTargetCalories(userID,{weightGoal:targetWeightGoal});

			weightGoalRecord.save(function(err){
				if (isLast) callback(err, {message:'save goal record failed.'});
			});
		}else{
			if(isLast) {
				callback(null);
			}
		}
	});
};

var addOrUpdateOneExerciseGoalRecord = function(userID, record, res, callback, isLast) {
	var exerciseGoalRecord = new ExerciseGoal();
	var newDate = new Date(record.recordedTime);
	exerciseGoalRecord.userID = userID;
	exerciseGoalRecord.uuid = record.uuid;
	exerciseGoalRecord.type = record.type;
	exerciseGoalRecord.target = record.target;
	exerciseGoalRecord.recordedTime = newDate;
	exerciseGoalRecord.save(function (err) {
		if (isLast) callback(err, {message: 'save goal record failed.'});
	});

};


var addOrUpdateOneBloodGlucoseGoalRecord = function(userID, record, res, callback, isLast) {
	var BloodGlucoseGoalRecord = new BloodGlucoseGoal();
	var newDate = new Date(record.recordedTime);
	BloodGlucoseGoalRecord.userID = userID;
	BloodGlucoseGoalRecord.uuid = record.uuid;
	BloodGlucoseGoalRecord.type = record.type;
	BloodGlucoseGoalRecord.target = record.target;
	BloodGlucoseGoalRecord.recordedTime = newDate;
	BloodGlucoseGoalRecord.save(function (err) {
		if (isLast) callback(err, {message: 'save goal record failed.'});
	});

};

exports.addOrUpdateWeightGoalRecord = function(userID, records, res, callback) {
	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.forEach( function(data, index) {
			var isLast = index === records.length-1;
			addOrUpdateOneWeightGoalRecord(userID, data, res, callback, isLast);
		});
	} else {
		addOrUpdateOneWeightGoalRecord(userID, records, res, callback, true);
	}
};

exports.addOrUpdateExerciseGoalRecord = function(userID, records, res, callback) {
	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.forEach( function(record, index) {
			var isLast = index === records.length-1;
			addOrUpdateOneExerciseGoalRecord(userID, record, res, callback, isLast);
		});
	} else {
		addOrUpdateOneExerciseGoalRecord(userID, records, res, callback, true);
	}
};


exports.addOrUpdateBloodGlucoseGoalRecord = function(userID, records, res, callback) {
	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.forEach( function(record, index) {
			var isLast = index === records.length-1;
			addOrUpdateOneBloodGlucoseGoalRecord(userID, record, res, callback, isLast);
		});
	} else {
		addOrUpdateOneBloodGlucoseGoalRecord(userID, records, res, callback, true);
	}
};

var getLatestGoalMiddleWare = function(userID, callback) {
	var queryExerciseGoal  = function(type, callback) {
		var q = ExerciseGoal.findOne({userID: userID, type: type}, {__v:0, userID: 0}).sort('-recordedTime');
		return q.exec(callback);
	};

	var queryWeightGoal = function(callback) {
		var q = WeightGoal.findOne({userID: userID}, {__v: 0, userID: 0}).sort('-recordedTime');
		return q.exec(callback);
	};

	var queryBloodGlucoseGoal = function(type, callback) {
		var q = BloodGlucoseGoal.findOne({userID: userID, type: type}, {__v: 0, userID: 0});
		return q.exec(callback);
	};

	async.parallel([
		function(callback) {
			queryExerciseGoal(0, callback);
		},
		function(callback) {
			queryExerciseGoal(1, callback);
		},
		function(callback) {
			queryExerciseGoal(2, callback);
		},
		function(callback) {
			queryExerciseGoal(3, callback);
		},
		function(callback) {
			queryWeightGoal(callback);
		},
		function(callback) {
			queryBloodGlucoseGoal(0, callback);
		},
		function(callback) {
			queryBloodGlucoseGoal(1, callback);
		}
	], function(err, results) {
		if(err) {
			callback(err, null);
		} else {
			callback(null, results);
		}

	});

};

var getLatestGoal = function(req, res, next) {
	var userID = req.param('userID');
	var format = req.format || 'xml';
	userID = mongoose.Types.ObjectId(userID);
	var xml;

	var queryExerciseGoal  = function(userID, callback) {
		//{ "_id" : 3, "target" : 37503 }
		//{ "_id" : 2, "target" : 7504 }
		//{ "_id" : 1, "target" : 157 }
		//0: Light; 1: Moderate/Vigorous; 2: Daily step count; 3: Weekly step count
		var curTime = new Date();
		var records = [
			//{},
			{
				type:1,
				target:150,
				recordedTime: curTime
			},
			{
				type:2,
				target:7500,
				recordedTime: curTime
			},
			{
				type:3,
				target:37500,
				recordedTime: curTime
			}

		];
		ExerciseGoal.aggregate([
			//{ $match : { "userID" : ObjectId("559d7f081f1f2c42758f5f02")}},
			{ $match : { 'userID' : userID}},
			{ $sort: { type: 1, recordedTime: -1 } },
			{ $group: {
				_id: '$type',
				target: { $first: '$target'},
				recordedTime:{$first:'$recordedTime'},
				uuid:{$first:'$uuid'}
			}}
		],
		function (err, data) {
				if (err) {
					console.log('fail to find exercise goal:', err.message);
					callback(err);
				} else {
					for(var i = 0; i < data.length; i++){
						var cur = data[i];
						records[cur._id - 1].target = cur.target;
						records[cur._id - 1].recordedTime = cur.recordedTime;
						records[cur._id - 1].uuid = cur.uuid;
					}
					callback(null,records);
				}
		});

	};

	var queryWeightGoal = function(userID, callback) {
		var q = WeightGoal.findOne({userID: userID}, {__v: 0, userID: 0, _id: 0}).sort('-recordedTime');
		return q.exec(callback);
	};

	async.parallel([
		function(callback) {
			queryExerciseGoal(userID, callback);
		},
		function(callback) {
			queryWeightGoal(userID,callback);
		}
	], function(err, results) {
		//console.log('get last goals:'+JSON.stringify(results));
		var goals = {};
		if(err) {
			res.status(400).end({err: err.message});


		} else {
			goals.exerciseGoal = results[0];
			if(results[1]) {
				goals.weightGoal = results[1];
			}


			if(format === 'xml') {
				xml = genXmlOutputPlain('Goals', goals);
				res.end(xml);
			} else {
				res.json(goals);

			}

		}

	});

};

exports.getLatestGoal = getLatestGoal;
exports.getLatestGoal2 = function(req, res, next) {
	var userID = req.param('userID');
	var xml;
	var cb = function(err, data) {
		if(err) {
			xml = genXmlOutputPlain('Goals', {err: err.message});
			res.status(400).end(xml);
		} else {
			var goals = {};
			var noGoals = true;
			var exerciseGoals = [];
			for(var i = 0; i< 4; i++){
				var goal = data[i];
				if(goal !== null) {
					goal = JSON.parse(JSON.stringify(goal));
					if(!goal.recordedTime) {
						goal.recordedTime = new Date();
					}
					delete goal._id;
					exerciseGoals.push(goal);
					noGoals = false;
				}
			}
			goals.exerciseGoal = exerciseGoals;
			if(data[4] !== null) {
				noGoals = false;
				var weightGoal = JSON.parse(JSON.stringify(data[4]));
				delete weightGoal._id;
				if(!weightGoal.recordedTime) {
					weightGoal.recordedTime = new Date();
				}
				goals.weightGoal = weightGoal;
			}
			// console.log(data);
			var bloodGlucoseGoal = [];
			for(i = 5; i< 7; i++){
				var bgGoal = data[i];
				if(bgGoal !== null) {
					bgGoal = JSON.parse(JSON.stringify(bgGoal));
					if(!bgGoal.recordedTime) {
						bgGoal.recordedTime = new Date();
					}
					delete bgGoal._id;
					bloodGlucoseGoal.push(bgGoal);
					noGoals = false;
				}
			}
			goals.bloodGlucoseGoal = bloodGlucoseGoal;

			if(!noGoals){
				xml = genXmlOutputPlain('Goals', goals);
				res.end(xml);
			} else{
				// res.status(404).end(genXmlOutputPlain('Goals', {Err: 'No Goals Found'}));
				res.end('<Goals></Goals>');
			}

		}
	};
	getLatestGoalMiddleWare(userID, cb);
};


exports.getMacrosGoal = function(req, res) {
	var userID = req.param('userID');
	if(!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid');
		return res.status(400).send('Bad Request: Invalid userID');
	}

	MacrosGoal.findOne(
		{'userID': userID},
		{_id:0,
		carbs:1,
		protein:1,
		fat:1},
		{
			sort:{
				recordedTime: -1
			}
		},
		function(err, data) {
			//if(err || !data) {
			if(err) {
				console.error(err);
				return res.status(400).end('No data available.');
			} else {
				if(!data) {
					data = {carbs:0.5, protein:0.2, fat:0.3};
				}

				var xml = genXmlOutputPlain('macros', data);
				res.end(xml);
			}
		});
};

exports.getLatestGoalClient = function(req, res, next) {
	req.format = 'json';
	getLatestGoal(req,res,next);
};

exports.updateGoalClient = function(req, res, next) {
	var goalID = req.body._id;
	var typeOfGoal = req.body.goalType;
	var GoalSchema = [WeightGoal, ExerciseGoal, BloodGlucoseGoal][typeOfGoal];//type: 0: weight goal; type: 1: exercise goal
	GoalSchema.findOneAndUpdate(
		{
			_id: goalID,
		},
		{
			$set: {target: Number(req.body.target), type: Number(req.body.type)}
		},
		function(err, doc) {
			if(err) {
				console.log('In adapt.records.controller:updateLatestGoalClient', err.message);
				res.status(400).json({message: err.message});
			} else if(typeOfGoal === 0) {
				var userID = req.body.userID;
				var targetWeightGoal = req.body.target*2.20462262/7 * 3500;
				if(req.body.type === 0){
					targetWeightGoal = -targetWeightGoal;
				}
				UserProfileController.updateTargetCalories(userID,{weightGoal:targetWeightGoal});
				res.json(doc);
			} else {
				res.json(doc);
			}
		});
};



exports.createGoalClient = function(req, res) {
	var typeOfGoal = Number(req.body.goalType);
	var type = Number(req.body.type);
	var recordedTime = req.body.recordedTime;
	if(!recordedTime) {
		recordedTime = new Date();
	}

	var target = Number(req.body.target);
	var uuid = uuidGenerator.v4();
	var GoalSchema = [WeightGoal, ExerciseGoal, BloodGlucoseGoal][typeOfGoal];//type: 0: weight goal; type: 1: exercise goal
	var goal = {
		userID: req.body.userID,
		target: target,
		type: type,
		uuid: uuid,
		recordedTime: recordedTime
	};

	var newGoal = new GoalSchema(goal);
	newGoal.save(function(err) {
		if(err) {
			console.log('In adapt.records.controller:updateLatestGoalClient', err.message);
			res.status(400).json({message: err.message});
		} else if (typeOfGoal === 0) {
			var userID = req.body.userID;
			var targetWeightGoal = req.body.target*2.20462262/7 * 3500;
			if(req.body.type === 0){
				targetWeightGoal = -targetWeightGoal;
			}
			UserProfileController.updateTargetCalories(userID,{weightGoal:targetWeightGoal});
			res.json(newGoal);
		} else {
			res.json(newGoal);
		}
	});
};
