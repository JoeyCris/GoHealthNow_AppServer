'use strict';


/**
 * Created by robertwang on 2016-08-08.
 */

//Fitbit API for calls
var FitbitApiClient = require('fitbit-node'),
	mongoose = require('mongoose'),
	util = require('util'),
	Q = require('q'),
	config = require('../../config/config'),
	User = mongoose.model('User'),
	Exercise = mongoose.model('Exercise');


var	client = new FitbitApiClient(config.fitbit.clientID, config.fitbit.clientSecret);

var generateUUID = require('../utils/dbUtils.js').generateUUID;
var ObjectId = mongoose.Types.ObjectId;


//var ExerciseSchema = new Schema({
//	userID: {
//		type: Schema.Types.ObjectId,
//		required: 'userID cannot be blank'
//	},
//	uuid: String,
//	exerciseRecordType: Number, //0 from manual input, 1 from pedometer, 2 from fitbit
//	exerciseStartingTime: Date, //Starting time
//	stepCount: Number,
//	minutes: Number,
//	type: {
//		type: String,
//		enum: ['Light', 'Moderate', 'Vigorous']
//	},
//	interval: Number,
//	calories: Number,
//	note: String,
//	recordedTime: Date
//
//});
var findAndUpdateRecord = function(data, callback) {

	Exercise.findOne({
			userID: new ObjectId(data.userID),
			exerciseRecordType:2,
			recordedTime: data.recordedTime
		},
		function(err, exerciseRecord) {
			console.log('current date:' + JSON.stringify(data.recordedTime));

			if(err || !exerciseRecord) {

				data.exerciseRecordType = 2;
				data.type = 'Light';
				data.exerciseStartingTime = data.recordedTime;
				data.uuid = generateUUID();

				var record = new Exercise(data);

				console.log('added new exercise record for fitbit users.' + JSON.stringify(record));

				record.save();
			} else {
				//
				console.log('duplicate! replace record of ' + JSON.stringify(data.recordedTime));

				exerciseRecord.stepCount = data.stepCount;
				exerciseRecord.calories = data.calories;
				exerciseRecord.minutes = data.minutes;

				exerciseRecord.save();

			}
		});
};


var caculateMinutes = function(calories, type) {

	var typeInfo = { 'Light':1.5, 'Moderate':4.5, 'Vigorous':8.5 };

	var tmp = typeInfo[type] * 100 * 60;

	return Math.ceil((calories/tmp) / 0.1) / 10;
};

//records:{'date':{calories:1312, stepCount:12312}}
var insertDataToDB = function(userID, records) {

	for(var k in records) {
		if(records.hasOwnProperty(k)) {

			var data = records[k];
			data.userID = userID;
			data.recordedTime = new Date(k);

			if(!data.minutes) {
				data.minutes = caculateMinutes(data.calories, 'Light');
			}

			findAndUpdateRecord(data);
		}
	}

};

exports.addExerciseRecord = function(req, res) {

	var date = new Date(req.param('date'));
	var userID = req.param('userID');

	if (!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid');
		return res.status(400).send('Bad Request: Invalid userID');
	}
};

var retrieveData = function(user, period, callback) {


};


exports.unbindUser = function(req, res) {
	var userID = req.param('userID');


	User.findOne({
			_id: new ObjectId(userID)
		},
		function(err, user) {

			if (!err && user) {
				if (user.additionalProvidersData && user.additionalProvidersData.fitbit) {

					user.additionalProvidersData.fitbit = undefined;
					user.boundDevices = undefined;
					// Then tell mongoose that we've updated the additionalProvidersData field
					user.markModified('additionalProvidersData');
					user.markModified('boundDevices');

					user.save(function(err) {
						res.end('sucess');
					});


				} else {
					console.log('cannot find fitbit information in additionalProvidersData');
					res.end('sucess');
				}
			} else {
				console.log('cannot find user. ID:' + userID);
				res.end('sucess');
			}
		});
};

exports.retrieveData = function(req, res) {

	var period = Number(req.param('period'));
	var userID = req.param('userID');

	if (!mongoose.Types.ObjectId.isValid(userID)) {
		console.log('userID is not valid');
		return res.status(400).send('Bad Request: Invalid userID');
	}
};


exports.retrieveLastMonthData = function(user, callback) {

	var providerData = user.additionalProvidersData.fitbit;

	if(providerData) {
		var fitbitUID = providerData.id;
		var accessToken = providerData.accessToken;

		console.log('id: ' + JSON.stringify(fitbitUID));
		console.log('access token: ' + JSON.stringify(accessToken));

		var newRecords = {};

		var taskForCalories = client.get('/activities/calories/date/today/30d.json', accessToken, fitbitUID);
		var taskForSteps = client.get('/activities/steps/date/today/30d.json', accessToken, fitbitUID);

	    taskForCalories.then(function (results) {

			//console.log('calories: ' + JSON.stringify(results));
			if(util.isArray(results) && results.length >= 1) {
				var calories = results[0]['activities-calories'];

				calories.forEach(function(data) {
					if(newRecords[data.dateTime]) {
						newRecords[data.dateTime].calories = data.value;
					} else {
						newRecords[data.dateTime] = {calories:data.value};
					}
				});

			}
		});

		taskForSteps.then(function (results) {

			//console.log('steps: ' + JSON.stringify(results));
			if(util.isArray(results) && results.length >= 1) {
				var steps = results[0]['activities-steps'];

				steps.forEach(function(data) {
					if(newRecords[data.dateTime]) {
						newRecords[data.dateTime].stepCount = data.value;
					} else {
						newRecords[data.dateTime] = {stepCount:data.value};
					}
				});

			}
		});

		Q.all([taskForCalories,taskForSteps]).then(function () {
			console.log('newRecords: ' + JSON.stringify(newRecords));

			insertDataToDB(user.userID, newRecords);
		});

	}


};





exports.retrieveYesterdayData = function(user, callback) {

	var providerData = user.additionalProvidersData.fitbit;


	var date = JSON.stringify(new Date()).split('T')[0];

	var uri = '/activities/date/' + date + '.json';

	if(providerData) {
		var fitbitUID = providerData.id;
		var accessToken = providerData.accessToken;

		console.log('id: ' + JSON.stringify(fitbitUID));
		console.log('access token: ' + JSON.stringify(accessToken));


		client.get(uri, accessToken, fitbitUID).then(function (results) {
			//var results = JSON.parse(res);
			//console.log('activities: ' + JSON.stringify(results));

			if(util.isArray(results) && results.length >= 1) {
				var activities = results[0].activities;
				if (util.isArray(activities) && activities.length >= 1) {
					var data = activities[0];


					console.log('newRecords: ' + JSON.stringify(data));

					var minutes = null;
					if(data.duration) {
						minutes = data.duration/60000;
					} else {
						minutes = undefined;
					}

					var newRecord = {};
					newRecord[date] = {
						calories:data.calories,
						stepCount:data.steps,
						minutes:minutes
					};

					insertDataToDB(user.userID, newRecord);
				}
			} else {
				console.log('unexpected result: ' + JSON.stringify(results));
			}
		});

	}


};
