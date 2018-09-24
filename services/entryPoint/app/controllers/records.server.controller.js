/**
 * Created by robert on 21/03/16.
 */
'use strict';

/**
 * Module dependencies.
 */
var //_ = require('lodash'),
	errorHandler = require('./errors.server.controller.js'),
	async = require('async'),
	mongoose = require('mongoose'),
	ObjectId = require('mongoose').Types.ObjectId,
	activity = require('./statistics.server.controller'),
	User = mongoose.model('User'),
	Sleep = mongoose.model('Sleep'),
	Exercise = mongoose.model('Exercise'),
	Note = mongoose.model('Note'),
	Weight = mongoose.model('Weight'),
	A1C = mongoose.model('A1C'),
	MacrosGoal = mongoose.model('MacrosGoal'),
	Glucose = mongoose.model('Glucose'),
	Meal = mongoose.model('Meal'),
	FoodItem = mongoose.model('FoodItem'),
	Question = mongoose.model('Question'),
	Topic = mongoose.model('Topic'),
	InsulinType = mongoose.model('InsulinType'),
	Insulin = mongoose.model('Insulin'),
	MedicineType = mongoose.model('MedicineType'),
	Medicine = mongoose.model('Medicine'),
	ExerciseGoal = mongoose.model('ExerciseGoal'),
	Reminder = mongoose.model('Reminder'),

	config = require('../../config/config');

exports.getExerciseInDetail = function(req, res) {

	var date = new Date(req.param('date'));
	var userID = req.param('userID');

	if(!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid');
		return res.status(400).send('Bad Request: Invalid userID');
	}


	//setTimeout(function(){

    //
	//}, 5000);

	Exercise.find(
		{'userID': new ObjectId(userID),
			'recordedTime':{
				'$gte': new Date(date.getFullYear(), date.getMonth(), date.getDate()),
				'$lt': new Date(date.getFullYear(), date.getMonth(), date.getDate()+1)
			}
		}).sort('recordedTime').exec(function(err, data) {
			//if(err || !data) {
			if(err) {
				console.error(err);
				return res.status(400).end('No data available.');
			} else {

				res.jsonp(data);
			}
		});
};

exports.getA1CInDetail = function(req, res) {

	var userID = req.param('userID');
	console.log('user: ' + userID);

	if(!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid. userID:' + userID);
		return res.status(400).send('Bad Request: Invalid userID');
	}

	A1C.find(
		{'userID': new ObjectId(userID)
		}).sort({'recordedTime':-1}).limit(200).exec(function(err, data) {
			//if(err || !data) {
			if(err) {
				console.error(err);
				return res.status(400).end('No data available.');
			} else {

				res.jsonp(data);
			}
		});
};

exports.getWeightInDetail = function(req, res) {

	var userID = req.param('userID');
	console.log('user: ' + userID);

	if(!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid. userID:' + userID);
		return res.status(400).send('Bad Request: Invalid userID');
	}

	Weight.find(
		{'userID': new ObjectId(userID)
		}).sort({'recordedTime':-1}).limit(200).exec(function(err, data) {
			//if(err || !data) {
			if(err) {
				console.error(err);
				return res.status(400).end('No data available.');
			} else {

				res.jsonp(data);
			}
		});
};



exports.getDailyExercise = function(conditions, callback) {

	//conditions.$or = [ { exerciseRecordType:1,minutes:{$gt:5}  }, { exerciseRecordType: { $exists: false}},{ exerciseRecordType:0}  ];
	//Exercise.find(conditions, callback);

//var result = {
//	pedometer: {
//		light:{minutes:0, calories:0},moderate:{minutes:0, calories:0},vigorous:{minutes:0, calories:0},steps:0},
//	manual:{
//		light:{minutes:0, calories:0},moderate:{minutes:0, calories:0},vigorous:{minutes:0, calories:0},
//	}};

	var result = {
		userID:conditions.userID,
		date:conditions.recordedTime.$gte,
		totalCals:0,
		stepCount:0,
		pedometer: [],
		manual:[]
	};

	Exercise.aggregate([
			{ $match:conditions},
			{ $group: {
				_id:{loggedBy:{$cond: [{ $gte: [ '$exerciseRecordType',1]}, 'pedometer','manual' ]},type:'$type'},
				minutes:{$sum:'$minutes'},calories:{$sum:'$calories'},stepCount:{$sum:'$stepCount'}}
			}],
		function (err, data) {
			//console.log(JSON.stringify(data));

			if (!err && data) {

				data.forEach(function (row) {

					result[row._id.loggedBy].push({
						type:row._id.type,
						minutes:row.minutes,
						calories:row.calories
					});

					if(row._id.loggedBy === 'pedometer') {
						result.stepCount += row.stepCount;
					}



					result.totalCals += row.calories;

				});

				//console.log(JSON.stringify(result));

			}
			callback(err, result);
		}
	);

	//Exercises.aggregate(
	//	[
	//		{ $match: {
	//			userID:ObjectId("559d7efd1f1f2c42758f5db6"),
	//			recordedTime:{
	//				$gt:ISODate("2016-03-15T00:00:00Z"),
	//				$lt:ISODate("2016-03-16T00:00:00Z")}
	//		}},
	//		{ $group:{
	//			_id:"$type",
	//			total:{$sum:"$minutes"}
	//		}}
	//	])
};

exports.getMacrosGoal = function(req, res) {
	var userID = req.params.userID;
	if(!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid');
		return res.status(400).send('Bad Request: Invalid userID');
	}

	MacrosGoal.findOne(
		{'userID': userID},
		{},
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
				res.jsonp(data);
			}
		});
};


exports.setMacrosGoal = function(req, res){

	//console.log(JSON.stringify(req.body));

	MacrosGoal.findOneAndUpdate({userID: mongoose.Types.ObjectId(req.body.userID)}, {
		$set:{
			carbs:req.body.carbs,
			protein:req.body.protein,
			fat:req.body.fat,
			recordedTime:new Date()
		}
	},{ upsert:true}, function(err, doc){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)});
		} else {
			res.json(doc);
		}

		console.log(doc);
	});

};

exports.getReminders = function(req, res) {

	var userID = req.params.userID;
	if(!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid');
		return res.status(400).send('Bad Request: Invalid userID');
	}

	Reminder.find(
		{'userID': userID},
		{},
		{
			sort:{
				reminderType: 1
			}
		},
		function(err, data) {
			//if(err || !data) {
			if(err) {
				console.error(err);
				return res.status(400).end('No data available.');
			} else {
				res.jsonp(data);
			}
		});
};

exports.getLatestA1C = function(req, res) {

	var userID = req.params.userID;
	if(!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid');
		return res.status(400).send('Bad Request: Invalid userID');
	}

	A1C.findOne(
		{'userID': userID},
		{},
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
				res.jsonp(data);
			}
		});
};


exports.hasAuthorization = function(req, res, next) {
	var userID = req.param('userID');
	console.log('hasAuthorization. userID:' + userID);
	if (req.user.roles.indexOf('user') !== -1 && userID !== req.user.userID) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
