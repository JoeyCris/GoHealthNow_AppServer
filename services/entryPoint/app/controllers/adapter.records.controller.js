/**
 * Created by nodejs on 21/04/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
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
	Glucose = mongoose.model('Glucose'),
	BloodPressure = mongoose.model('BloodPressure'),
	Meal = mongoose.model('Meal'),
	FoodItem = mongoose.model('FoodItem'),
	Question = mongoose.model('Question'),
	Topic = mongoose.model('Topic'),
	InsulinType = mongoose.model('InsulinType'),
	Insulin = mongoose.model('Insulin'),
	MedicineType = mongoose.model('MedicineType'),
	Medicine = mongoose.model('Medicine'),
	WeightGoal = mongoose.model('WeightGoal'),
	ExerciseGoal = mongoose.model('ExerciseGoal'),
	Reminder = mongoose.model('Reminder'),
	request = require('request'),


	QuestionController = require('./questions.server.controller.js'),
	UserProfileController = require('./users/users.profile.server.controller.js'),
	sendEmail = require('../utils/sendEmail.js'),
	genXmlOutput =  require('../utils/genxmloutput.js'),
	config = require('../../config/config'),
	uuidGenerator = require('node-uuid');

var genXmlOutputPlain = function(rootTag, jsonObj) {
	return genXmlOutput(rootTag, jsonObj, { 'pretty': false, 'indent': '', 'newline': '' });
};


var addOrUpdateWeightGoalRecord = require('./adapter.records.goals.controller').addOrUpdateWeightGoalRecord;
var addOrUpdateExerciseGoalRecord = require('./adapter.records.goals.controller').addOrUpdateExerciseGoalRecord;
var addOrUpdateBloodGlucoseGoalRecord = require('./adapter.records.goals.controller').addOrUpdateBloodGlucoseGoalRecord;

//var addReminderRecords = require('./adapter.records.reminder.controller.js').addRecords;
var addMealRecords = require('./adapter.records.meal.controller.js').addRecords;

//var genObjectId = require('../utils/dbUtils.js').genObjectId;
var addOneRecordToDB = require('../utils/dbUtils.js').addOneRecordToDB;

var getDailyExercise = require('./records.server.controller').getDailyExercise;


function addOrUpdateIndividualRecord(userID, records, type, callback) {
	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.forEach( function(data, index) {
			var isLast  = ( index === records.length - 1);// && isLast;
			addOneRecordToDB(userID, data, type, function(err){
				if(isLast) {
					callback(err);
				}
			});
		});
	} else {
		addOneRecordToDB(userID, records, type, callback);
	}
}


function deleteIndividualRecord(userID, records, callback) {

	var allRecords = [];
	if( Object.prototype.toString.call( records ) === '[object Array]') {
		allRecords = records;

	} else {
		allRecords = [records];
	}

	callback(null);

	//allRecords.forEach( function(data, index) {
	//	var type = data.type;
	//	var modeNames = ['Meal','Exercise','BloodPressure','Glucose','Medicine','A1C','Sleep'];
    //
	//	var uuid = data.uuid;
	//	mongoose.model(modelNames[type]).findOneAndRemove(
	//		{userID:userID,
	//			uuid:uuid
	//		}
	//	});
	//});
}


function addOrUpdateExerciseRecord(userID, records, callback) {

	User.findById(userID,function(err,user) {
		if (err) {
			console.log('Failed to find user by id', err.message);
		} else {
			var exerciseRecords = [];
			if( Object.prototype.toString.call( records ) === '[object Array]') {
				exerciseRecords = records;
			} else {
				exerciseRecords = [records];
			}

			exerciseRecords.forEach( function(data, index) {
				var isLast  = ( index === exerciseRecords.length - 1);

				if(data.exerciseRecordType !== '1' || !user.boundDevices) { //
					//console.log('added exercise record.' + JSON.stringify(data));
					addOneRecordToDB(user.userID, data, 'Exercise', function(err,result) {
						if(isLast) {
							callback(err, result);
						}
					});
				} else {

					console.log('This user have boundDevices devices. ignore the data from build-in pedometer');
					if(isLast) {
						callback(null);
					}
				}
			});

		}
	});
}

function updateUserWeightProfile(userID, weightValue) {
	User.findOneAndUpdate({userID: userID}, {weight: weightValue}, function(err){
		if (err) {
			console.error('Can not update weight profile for user of id ' + userID.toString(), err.message);
		}
	});
}

function addOrUpdateWeightRecord(userID, records, callback) {

	var latestWeightValue = null;

	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.sort(function(a, b) {
			return new Date(a.recordedTime) -  new Date(b.recordedTime);
		});

		latestWeightValue = records[records.length - 1].weightValue;

	} else {
		latestWeightValue = records.weightValue;
	}

	addOrUpdateIndividualRecord(userID, records, 'Weight', function(){

		//console.log('Lastest weight is ' + record.weightValue.toString());
		UserProfileController.updateTargetCalories(userID,{weight:latestWeightValue});
		updateUserWeightProfile(userID, latestWeightValue);

		callback(null);
	});
}



var addOrUpdateQuestion = function(userID, data, req, res){

	var type = 'Question';

	data.questionContent = data.noteContent;
	// questionType: Number, //0:'Diet', 1: 'Exercise', 2: 'BloodGlucose', 3: 'Weight', 4: 'Others'
	data.questionType = data.noteType;
	data.medias = [];
	if(data.notePhoto){
		var media = {uri:data.notePhoto, mimeType:'image/jpg'};
		data.medias.push(media);
	}

	if(data.noteAudio){
		data.noteAudio = '/files/' + userID + '/' + data.noteAudio;

		if(!data.questionContent) {
			data.questionContent = 'Audio Question';
		}
	}

	//console.log(data.noteAudio);

	addOneRecordToDB(userID, data,type, function(dbError,record){

		User.findById(userID,function(err,reqUser){
			if(err){
				console.log('Failed to find user by id',err.message);
			}else{

				//add instant trigger.
				if( !reqUser.accessCode )
				{
					//console.log("********************User Info**************************\n",reqUser.userID);
					request.post(
						'http://localhost:30005/tipsgenerator/accesscode/nonacscode', {
							form: {
								user: reqUser.userID,
							}
						}, function (error, response, body) {
							if (!error && response.statusCode === 200) {
								// console.log('Push notification for GCM sending success');
								return 'Instant tips for cac sending success';
							}else{
								if(error){
									console.error('Instant tips for cac sending failed: ', error.message);
								}
								return 'Instant tips for cac sending failed';
							}
						});
				}

				User.find({$or:[{roles:'admin'},{$and:[{rightsMask:999},{roles:'dietitian'}]},{$and:[{accessCode:reqUser.accessCode},{roles:'dietitian'}]}]}, function(err, users){
					users.forEach(function(element,index,array){
						var user = element;
						var baseUrl = config.serverURL;
						//console.log("********************User Info**************************\n",user);
						//send email
						var subject = 'New Question ('+ reqUser.accessCode+')';
						var medias = data.medias;
						if(medias){
							medias.forEach(function(media){
								media.uri =  baseUrl + media.uri;
							});
						}
						//if(data.noteAudio){
						//	medias.forEach(function(media){
						//		media.uri =  baseUrl + media.uri;
						//	});
						//}
						//console.log(record);

						res.render('templates/ask-question-reminder-email', {
							question: record,
							user: reqUser,
							url: baseUrl + '/#!/questions'
						}, function(err, innerContent) {
							//console.log(typeof innerContent);
							sendEmail(req,res,user,subject,innerContent);

						});
					});


				});

			}

			//callback(null);
		});
	});


};

var addOrUpdateQuestionRecord = function(userID, records, req, res, callback) {

	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.forEach( function(data) {
			addOrUpdateQuestion(userID, data, req, res);
		});
		//callback(null, 'OK');
	} else {
		addOrUpdateQuestion(userID, records, req, res);
		//callback(null, 'OK');
	}
	callback(null);
};

var addOrUpdateOneInsulinRecord = function(userID, record, res, callback, isLast) {

		InsulinType.findOne({insulinID: record.insulinID}).exec(function (err, data){
			if(err || !data) {
				if (isLast) callback(new Error('Invalid insulinID: ' + record.insulinID));
			} else {
				record.insulinID = data;
				addOneRecordToDB(userID, record, 'Insulin', function(err){
					if (isLast) callback(err, {message:'save insulin record failed.'});
				});
			}
		});

};


var addOrUpdateInsulinRecord = function(userID, records, res, callback) {

	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.forEach( function(data, index) {
			var isLast = index === records.length-1;
			addOrUpdateOneInsulinRecord(userID, data, res, callback, isLast);
		});
	} else {
		addOrUpdateOneInsulinRecord(userID, records, res, callback, true);
	}
};

var addOrUpdateOneMedicineRecord = function(userID, record, res, callback, isLast) {

		if(record.medicineID){
			MedicineType.findOne({medicineID: record.medicineID}).exec(function (err, data){
				if(err || !data) {
					if (isLast) callback(new Error('Invalid medicineID: ' + record.insulinID));
				} else {

					record.medicineID = data;
					record.medicineName = data.name;
					// console.log(medicineRecord,data._id);
					addOneRecordToDB(userID, record, 'Medicine', function(err){
						// console.log('failed', err, medicineRecord);
						if (isLast) callback(err, {message:'save medicine record failed.'});
					});
				}
			});
		}else{
			record.medicinID = undefined;
			addOneRecordToDB(userID, record, 'Medicine', function(err){
				if (isLast) callback(err, {message:'save medicine record failed.'});
			});
		}


};


var addOrUpdateMedicineRecord = function(userID, records, res, callback) {

	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.forEach( function(data, index) {
			var isLast = index === records.length-1;
			addOrUpdateOneMedicineRecord(userID, data, res, callback, isLast);
		});
	} else {
		addOrUpdateOneMedicineRecord(userID, records, res, callback, true);
	}
};


var toLowerCase = function (name){
	return name.charAt(0).toLowerCase() + name.slice(1);
};


exports.deleteRecord = function(req, res) {

	var xml = req.body.userRecord;
	var parseString = require('xml2js').parseString;



	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function (err, result) {
		if (err) {
			console.log('Failed to parse string to xml, invalid xml',err.message);
			// TODO: better return value for client
			return res.status(400).send('Invalid XML');
		}

		//result.user_Record.userID
		if(!result || !result.user_Record || !ObjectId.isValid(result.user_Record.userID)) {
			console.log('Failed to parse string to xml, invalid xml');
			// TODO: better return value for client
			return res.status(400).send('Invalid XML');
		} else if(result.user_Record) {
			//if(result.user_Record.records) {
			//	deleteIndividualRecord(userID,result.user_Record.records,function(error) {
			//		return res.end('success');
			//	});
			//}

			return res.end('success');
		}
	});
};

/**
 * Add user's detailed records
 */
exports.addRecord = function(req, res) {

	var xml = req.body.userRecord;
	var parseString = require('xml2js').parseString;



	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function (err, result) {
		if (err) {
			console.log('Failed to parse string to xml, invalid xml',err.message);
			// TODO: better return value for client
			return res.status(400).send('Invalid XML');
		}

		//result.user_Record.userID
		if(!result || !result.user_Record || !ObjectId.isValid(result.user_Record.userID)) {
			console.log('Failed to parse string to xml, invalid xml');
			// TODO: better return value for client
			return res.status(400).send('Invalid XML');
		}

		else if(result.user_Record) {
			async.parallel(
				[
					function(callback) { //blood pressure record
						if(result.user_Record.bloodPressureRecords) {
							addOrUpdateIndividualRecord(result.user_Record.userID,
								result.user_Record.bloodPressureRecords.bloodPressureRecord,
								'BloodPressure', callback);
						} else {
							callback(null);
						}
					},

					function(callback) { //Sleep record
						if(result.user_Record.sleep_Records) {
							addOrUpdateIndividualRecord(result.user_Record.userID,
								result.user_Record.sleep_Records.sleep_Record,
								'Sleep', callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // Exercise record
						if(result.user_Record.exercise_Records) {
							addOrUpdateExerciseRecord(result.user_Record.userID,
								result.user_Record.exercise_Records.exercise_Record,
								 callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // Question record
						if(result.user_Record.note_Records) {
							addOrUpdateQuestionRecord(result.user_Record.userID,
								result.user_Record.note_Records.note_Record, req, res,
								callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // Weight record
						if(result.user_Record.weight_Records) {
							addOrUpdateWeightRecord(result.user_Record.userID,
								result.user_Record.weight_Records.weight_Record, callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // A1C record
						if(result.user_Record.a1C_Records) {
							addOrUpdateIndividualRecord(result.user_Record.userID,
								result.user_Record.a1C_Records.a1C_Record,
								'A1C', callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // Glucoses record
						if(result.user_Record.glucoses_Records) {
							addOrUpdateIndividualRecord(result.user_Record.userID,
								result.user_Record.glucoses_Records.glucose_Record,
								'Glucose', callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // Meal record
						if(result.user_Record.meal_Records) {
							addMealRecords(result.user_Record.userID,
								result.user_Record.meal_Records.meal_Record, res,
								callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // Insulin record
						if(result.user_Record.insulin_Records) {
							addOrUpdateInsulinRecord(result.user_Record.userID,
								result.user_Record.insulin_Records.insulin_Record, res,
								callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // medicine record
						if(result.user_Record.medicine_Records) {
							addOrUpdateMedicineRecord(result.user_Record.userID,
								result.user_Record.medicine_Records.medicine_Record, res,
								callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // goal record
						if(result.user_Record.goal_Records && result.user_Record.goal_Records.weightGoal) {
							// console.log(JSON.stringify(result));
							addOrUpdateWeightGoalRecord(result.user_Record.userID,
								result.user_Record.goal_Records.weightGoal, res,
								callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // goal record
						if(result.user_Record.goal_Records && result.user_Record.goal_Records.exerciseGoal) {
							// console.log(JSON.stringify(result));
							addOrUpdateExerciseGoalRecord(result.user_Record.userID,
								result.user_Record.goal_Records.exerciseGoal, res,
								callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // goal record blood glucose level
						if(result.user_Record.goal_Records && result.user_Record.goal_Records.bloodGlucoseGoal) {
							// console.log(JSON.stringify(result));
							addOrUpdateBloodGlucoseGoalRecord(result.user_Record.userID,
								result.user_Record.goal_Records.bloodGlucoseGoal, res,
								callback);
						} else {
							callback(null);
						}
					},

					function(callback) { // reminder record
						if(result.user_Record.reminder_Records) {
							// console.log(JSON.stringify(result));

							addOrUpdateIndividualRecord(result.user_Record.userID,
								result.user_Record.reminder_Records.reminder,
								'Reminder', callback);
						} else {
							callback(null);
						}
					}
				],

				function(err, results) {
					if(err) {
						console.log('duplicated',err.message);
						return res.status(400).send('duplicated');
					} else {
						activity.saveUserActivity(result.user_Record.userID, 'upload record', req);
						return res.end('success');
					}
				});
		}
	});
};







function getFoodDetails(food, resultList, isLast, callback) {
	FoodItem.find( {'id':food.itemID}).lean().exec(function(err, foodItem){
		if(err) {
			console.log('Failed to find food by id',err.message);
		} else {
			if(foodItem) {
				foodItem = foodItem[0];

				for(var i = 0; i < foodItem.servingSizeOptions.length; ++i) {
					if (foodItem.servingSizeOptions[i].ssid === food.ServingSizeID) {
						foodItem.ServingSizeName = foodItem.servingSizeOptions.name;
						foodItem.ServingSize = food.servingSize;
					}
				}

				resultList.push(foodItem);
			}
		}
		if(isLast) {
			callback(null);
		}
	});
}

//
//var calculateFoodNutrition = function(mealRecords) {
//
//	if(!mealRecords) return mealRecords;
//
//	for(var i = 0; i < mealRecords.length; i++) {
//		for (var j = 0; j < mealRecords[i].food.length; j++) {
//			mealRecords[i].food[j].itemID.
//		}
//	}
//};

//var getUserRecordsForApp = function(conditions, projection, action) {
//	var userID = conditions.userID;
//	var userRecords = {userID:userID};
//
//	async.parallel(
//		[
//			function(callback) {
//				Exercise.find(conditions, projection, function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						userRecords.exercise_Records = {exercise_Record:data};
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				Meal.find(conditions, projection, function(err, data) {//find(conditions, projection).populate('food.itemID').exec( function(err, data) {//
//					if(err) {
//						callback(err);
//					} else if(data) {
//						userRecords.meal_Records = {meal_Record:[]};
//						data.forEach(function(row,idx,array) {
//							var meal = {};
//							var mealTypes = Meal.schema.path('mealType').enumValues;
//							var mealEnterTypes = Meal.schema.path('mealEnterType').enumValues;
//							meal.carb = row.carb;
//							meal.fibre = row.fibre;
//							meal.pro = row.pro;
//							meal.fat = row.fat;
//							meal.cals = row.cals;
//							if(row.mealPhoto){
//								meal.mealPhoto = '/images/'+userID+'/'+row.mealPhoto;
//							}
//							meal.deviceMealID = row.deviceMealID;
//							meal.mealType = mealTypes.indexOf(row.mealType);
//							meal.mealEnterType = mealEnterTypes.indexOf(row.mealEnterType);
//							meal.mealName = row.mealName;
//							meal.mealScore = row.mealScore;
//							meal.recordedTime = row.recordedTime;
//							meal.uploadingVersion = row.uploadingVersion;
//
//							if(row.food) {
//								meal.food_Records = {food_Record:[]};
//								row.food.forEach(function(fooditem) {
//									var food = {};
//									food.foodItemServingSize = fooditem.servingSize;
//									// food.ssid = fooditem.ssid;
//									food.foodItemLogType = fooditem.logType;
//									if(fooditem.photoName){
//										food.foodItemPhoto = '/images/'+userID+'/'+fooditem.photoName;
//									}
//									food.carb = fooditem.carb;
//									food.fibre = fooditem.fibre;
//									food.pro = fooditem.pro;
//									food.fat = fooditem.fat;
//									food.cals = fooditem.cals;
//									food.servingSizeName = fooditem.servingSizeName;
//									food.foodItem = {foodItemID:fooditem.itemID};
//									food.servingSizeID = fooditem.ssid;
//
//									meal.food_Records.food_Record.push(food);
//
//								});
//							}
//							userRecords.meal_Records.meal_Record.push(meal);
//						});
//
//						// userRecords.meal_Records = {meal_Record:data};
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				Sleep.find(conditions, projection, function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						userRecords.sleep_Records = {sleep_Record:[]};
//						data.forEach(function(ele,idx,array){
//							var sleep = {};
//							if(ele.sick){
//								sleep.sick = 1;
//							}else{
//								sleep.sick = 0;
//							}
//							if(ele.stressed){
//								sleep.stressed = 1;
//							}else{
//								sleep.stressed = 0;
//							}
//							sleep.minutes = ele.minutes;
//							sleep.uuid = ele.uuid;
//							sleep.recordedTime = ele.recordedTime;
//							userRecords.sleep_Records.sleep_Record.push(sleep);
//						});
//
//						// userRecords.sleep_Records = {sleep_Record:data};
//						callback(null);
//					}
//				});
//			},
//
//			//function(callback) {
//			//	Note.find(conditions, projection, function(err, data) {
//			//		if(err) {
//			//			callback(err);
//			//		} else if(data) {
//			//			userRecords.noteRecords = data;
//			//			callback(null);
//			//		}
//			//	});
//			//},
//
//			function(callback) {
//				Weight.find(conditions, projection, function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						userRecords.weight_Records = {weight_Record:data};
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				A1C.find(conditions, projection, function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						userRecords.A1C_Records = {A1C_Record:data};
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				Glucose.find(conditions, projection).sort('-recordedTime').exec(function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						userRecords.glucoses_Records = {glucose_Record:data};
//						callback(null);
//					}
//				});
//			},
//
//			//function(callback) {
//			//	Question.find(conditions, projection).sort('-update_time').populate('userID', 'userID email').exec(function(err, data) {
//			//		if(err) {
//			//			callback(err);
//			//		} else if(data) {
//			//			userRecords.QuestionRecords = data;
//			//			callback(null);
//			//		}
//			//	});
//			//},
//			//
//			//function(callback) {
//			//	var tipConditions = {};
//			//	tipConditions.user = conditions.userID;
//			//	tipConditions.type = {$in :['tip','reminder']};
//			//	//console.log(JSON.stringify(conditions)+' '+JSON.stringify(topicConditions));
//			//	Topic.find(tipConditions).populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, data) {
//			//		if(err) {
//			//			//console.log(JSON.stringify(err));
//			//			callback(err);
//			//		} else if(data) {
//			//			//console.log(JSON.stringify(data));
//			//			userRecords.tipRecords = data;
//			//			callback(null);
//			//		}
//			//	});
//			//},
//
//			function(callback) {
//				Insulin.find(conditions, projection).populate('insulinID').exec( function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						if(!userRecords.medicine_Records){
//							userRecords.medicine_Records = {medicine_Record:[]};
//						}
//						data.forEach(function(ele,idx,array){
//
//							var medicine = {};
//							if(ele.insulinID){
//								// console.log(Object.keys(ele.insulinID.schema.paths));
//								// console.log((ele.insulinID));
//								// console.log(ele.insulinID.insulinID);
//								medicine.medicineName = ele.insulinID.name;
//								medicine.medicineID = ele.insulinID.insulinID;
//							}else{
//								medicine.medicineName = ele.insulinName;
//							}
//							medicine.recordedTime = ele.recordedTime;
//							medicine.dose = ele.dose;
//							medicine.unit = ele.unit;
//							medicine.uuid = ele.uuid;
//							// console.log(ele);
//							userRecords.medicine_Records.medicine_Record.push(medicine);
//						});
//						// userRecords.insulin_Records = {insulin_Record:data};
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				Medicine.find(conditions, projection).populate({path:'medicineID',select:'medicineID name -_id'}).exec( function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						if(!userRecords.medicine_Records){
//							userRecords.medicine_Records = {medicine_Record:[]};
//						}
//						data.forEach(function(ele,idx,array){
//							var medicine = {};
//							if(ele.medicineID){
//								// console.log(Object.keys(ele.medicineID.schema.paths));
//								// console.log((ele.medicineID));
//								// console.log(ele.medicineID.medicineID);
//								medicine.medicineName = ele.medicineID.name;
//								medicine.medicineID = ele.medicineID.medicineID;
//							}else{
//								medicine.medicineName = ele.medicineName;
//							}
//							// console.log(ele);
//							medicine.recordedTime = ele.recordedTime;
//							medicine.dose = ele.dose;
//							medicine.unit = ele.unit;
//							medicine.uuid = ele.uuid;
//							userRecords.medicine_Records.medicine_Record.push(medicine);
//						});
//						// userRecords.medicine_Records = {medicine_Record:data};
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				Goal.find(conditions, projection).exec( function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						userRecords.goal_Records = {weightGoal:data};
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				MedicineReminder.find(conditions, projection).exec( function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						if(!userRecords.reminder_Records){
//							userRecords.reminder_Records = {medication:[],bloodGlucose:[],exercise:[],meal:[]};
//						}
//						userRecords.reminder_Records.medication = data;
//
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				BloodGlucoseReminder.find(conditions, projection).exec( function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						if(!userRecords.reminder_Records){
//							userRecords.reminder_Records = {medication:[],bloodGlucose:[],exercise:[],meal:[]};
//						}
//						userRecords.reminder_Records.bloodGlucose = data;
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				ExerciseReminder.find(conditions, projection).exec( function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						if(!userRecords.reminder_Records){
//							userRecords.reminder_Records = {medication:[],bloodGlucose:[],exercise:[],meal:[]};
//						}
//						userRecords.reminder_Records.exercise = data;
//						callback(null);
//					}
//				});
//			},
//
//			function(callback) {
//				MealReminder.find(conditions, projection).exec( function(err, data) {
//					if(err) {
//						callback(err);
//					} else if(data) {
//						if(!userRecords.reminder_Records){
//							userRecords.reminder_Records = {medication:[],bloodGlucose:[],exercise:[],meal:[]};
//						}
//						userRecords.reminder_Records.meal = data;
//						callback(null);
//					}
//				});
//			},
//		],
//
//		function(err, results) {
//			if(err) {
//				action('Failed to get user records.', userRecords);
//			} else {
//				//console.log(userRecords);
//				action(null, userRecords);
//			}
//		}
//	);
//};
//
//exports.getUserRecordsForApp = getUserRecordsForApp;
//
//var getRecords = function(req, res) {
//
//	var userRecords = {};
//	var xml = req.body.userRecord;
//	//var xml2js = require('xml2js');
//	var parseString = require('xml2js').parseString;
//	// var builder =  new xml2js.Builder();
//	// var js2xmlparser = require('js2xmlparser');
//	var genXmlOutput =  require('../utils/genxmloutput.js');
//
//	var toLowerCase = function (name){
//		return name.charAt(0).toLowerCase() + name.slice(1);
//	};
//
//	parseString(xml, {
//		tagNameProcessors: [toLowerCase],
//		explicitArray: false,
//		trim: true
//	}, function (err, result) {
//		//console.log(result);
//		var userID = result.user_Record.userID;
//		var date = new Date();
//		date.setDate(date.getDate()-30000);
//
//		getUserRecordsForApp({
//			'userID': userID,
//			'recordedTime':{
//				'$gte': date
//			}
//		},{
//			'_id':0,
//			'userID':0,
//			'__v':0,
//		}, function(err, userRecords) {
//			if(err) {
//				return res.status(400).send(err);
//			} else {
//				// console.log(userRecords.reminder_Records);
//				// res.jsonp((userRecords.a1cRecords));
//				res.send(genXmlOutput('user_Record',userRecords));
//				// res.jsonp(builder.buildObject(userRecords.reminderRecords));
//			}
//		});
//	});
//
//
//
//
//
//};
//
//exports.getRecords = getRecords;

var getUserRecords = function(conditions, action) {
	var userRecords = {};

	async.parallel(
		[
			function(callback) {
				getDailyExercise(conditions, function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.exerciseRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				Meal.find(conditions, function(err, data) {//find(conditions).populate('food.itemID').exec( function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {

						//data.forEach(function(row) {
						//	if(row.food) {
						//		row.food.forEach(function(fooditem) {
						//
						//			if(!fooditem.convFac) {
						//				var name = '';
						//				name = fooditem.servingSizeName;
						//				if(fooditem && fooditem.itemID) {
						//					if(fooditem.itemID.servingSizeOptions) {
						//						fooditem.itemID.servingSizeOptions.forEach(function(option) {
						//							var foodName = '';
						//							foodName = option.name;
						//							//console.log(' serving name: "' + name +'"');
						//							//console.log('food: "' + foodName+'"');
						//							if(JSON.stringify(foodName) === JSON.stringify(name)) {
						//								fooditem.convFac = option.convFac;
						//								//console.log(' convFac: ' + JSON.stringify(fooditem.convFac));
						//							}
						//						});
						//					}
						//
						//				}
						//			}
						//
						//			if(fooditem.itemID && fooditem.itemID.servingSizeOptions) {
						//				fooditem.itemID.servingSizeOptions = undefined;
						//			}
						//
						//
						//
						//		});
						//	}
						//
						//});

						userRecords.mealRecords = data;
						console.log(JSON.stringify(data));
						callback(null);
					}
				});
			},

			function(callback) {
				Sleep.find(conditions, function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.sleepRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				BloodPressure.find(conditions, function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.bloodPressureRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				Weight.find(conditions, function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.weightRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				A1C.find(conditions, function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.a1cRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				Glucose.find(conditions).sort('-recordedTime').exec(function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.glucoseRecords = data;
						callback(null);
					}
				});
			},

			// function(callback) {
			// 	Question.find(conditions).sort('-update_time').populate('userID', 'userID email').exec(function(err, data) {
			// 		if(err) {
			// 			callback(err);
			// 		} else if(data) {
			// 			userRecords.questionRecords = data;
			// 			callback(null);
			// 		}
			// 	});
			// },

			function(callback) {
				var tipConditions = {};
				// console.log(conditions);
				Question.find(conditions).exec(function(err,questions){
					if(err) {
						//console.log(JSON.stringify(err));
						callback(err);
					}else if(!questions || questions.length === 0){
						callback(null);
					}else{
						// console.log(questions);
						var questionIds = questions.map(function(q){return q._id;});
						tipConditions.user = conditions.userID;
						tipConditions.type = {$in :['answer']};
						// tipConditions.create_time = conditions.recordedTime;
						tipConditions.reference = {'$in':questionIds};
						// console.log(JSON.stringify(conditions)+' '+JSON.stringify(tipConditions));
						Topic.find(tipConditions).populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, data) {
							if(err) {
								//console.log(JSON.stringify(err));
								callback(err);
							} else if(data) {
								var result = [];
								questions.forEach(function(question){
									var q=question.toObject();
									q.answers = [];
									data.forEach(function(d){
										// console.log(q._id.toString() === d.reference.toString());
										if(q._id.toString() === d.reference.toString()){
											q.answers.push(d) ;
										}
									});
									result.push(q);
								});
								// console.log(JSON.stringify(data));
								userRecords.questionRecords = result;
								userRecords.answerRecords = data;
								callback(null);
							}
						});
					}
				});

			},

			function(callback) {
				var tipConditions = {};
				// console.log(conditions);
				Meal.find(conditions,{_id:1}).exec(function(err,meals){
					if(err) {
						//console.log(JSON.stringify(err));
						callback(err);
					}else if(!meals || meals.length === 0){
						callback(null);
					}else{
						// console.log(meals);
						var mealIds = meals.map(function(m){return m._id;});
						tipConditions.user = conditions.userID;
						tipConditions.type = {$in :['report']};
						// tipConditions.create_time = conditions.recordedTime;
						tipConditions.reference = {'$in':mealIds};
						// console.log(JSON.stringify(conditions)+' '+JSON.stringify(tipConditions));
						Topic.find(tipConditions).populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, data) {
							if(err) {
								//console.log(JSON.stringify(err));
								callback(err);
							} else if(data) {
								// console.log(JSON.stringify(data));
								userRecords.mealTipRecords = data;
								callback(null);
							}
						});
					}
				});

			},


			function(callback) {
				var tipConditions = {};
				// console.log(conditions);
				tipConditions.user = conditions.userID;
				tipConditions.type = {$in :['tip','reminder']};
				tipConditions.create_time = conditions.recordedTime;
				// tipConditions.reference = {'$exist':false};
				// console.log(JSON.stringify(conditions)+' '+JSON.stringify(tipConditions));
				Topic.find(tipConditions).populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, data) {
					if(err) {
						//console.log(JSON.stringify(err));
						callback(err);
					} else if(data) {
						// console.log(JSON.stringify(data));
						userRecords.tipRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				var tipConditions = {};
				// console.log(conditions);
				tipConditions.user = conditions.userID;
				tipConditions.type = {$in :['report']};
				tipConditions.create_time = conditions.recordedTime;
				tipConditions.reference = {'$exists':false};
				// console.log(JSON.stringify(conditions)+' '+JSON.stringify(tipConditions));
				Topic.find(tipConditions).populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, data) {
					if(err) {
						//console.log(JSON.stringify(err));
						callback(err);
					} else if(data) {
						// console.log(JSON.stringify(data));
						userRecords.reportRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				Insulin.find(conditions).populate('insulinID').exec( function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.insulinRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				Medicine.find(conditions).populate('medicineID').exec( function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.medicineRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				WeightGoal.find(conditions).exec( function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.goalRecords = data;
						callback(null);
					}
				});
			},

			function(callback) {
				Reminder.find(conditions).exec( function(err, data) {
					if(err) {
						callback(err);
					} else if(data) {
						userRecords.reminderRecords = {reminder:data};
						callback(null);
					}
				});
			},

		],

		function(err, results) {
			if(err) {
				action('Failed to get user records.', userRecords);
			} else {
				//console.log(userRecords);
				action(null, userRecords);
			}
		}
	);
};

exports.getUserRecords = getUserRecords;


// Interface for web display.
exports.find = function(req, res) {

	var userID = req.params.userID;
	var date = new Date();
	date.setDate(date.getDate() - 30);

	getUserRecords({
		'userID': userID,
		'recordedTime':{
			'$gte': date
		}
	}, function(err, userRecords) {
		if(err) {
			return res.status(400).send(err);
		} else {

			res.jsonp(userRecords);
		}
	});
};

exports.findRecordByDay = function(req, res) {
	var userID = req.param('uid');
	var date = new Date(req.param('day'));
	//  console.log(userID);
	//  console.log(date);
	var yesterday = new Date(req.param('day'));
	var tomorrow = new Date(req.param('day'));
	yesterday.setDate(date.getDate()-1);
	tomorrow.setDate(date.getDate()+1);
	var condition = {
		$and: [
			{userID: userID},
			{'recordedTime': {'$gt': yesterday}},
			{'recordedTime': {'$lt': tomorrow}}
		]};
	getUserRecords(condition, function(err, userRecords) {
		if(err) {
			return res.status(400).send(err.message);
		} else {
			res.jsonp(userRecords);
		}
	});
};



exports.findRecordByMonth = function(req, res) {
	var userID = req.param('uid');
	var date = new Date(req.param('month'));
	//  console.log(userID);
	//  console.log(date);
	var firstDay = new Date(req.param('month'));
	var lastDay = new Date(req.param('month'));
	firstDay.setDate(1);
	lastDay.setMonth(date.getMonth()+1);
	lastDay.setDate(1);
	//  console.log('FirstDay', firstDay);
	//  console.log('lastDay', lastDay);
	var condition = {
		$and: [
			{userID: userID},
			{'recordedTime': {'$gte': firstDay}},
			{'recordedTime': {'$lt': lastDay}}
		]};
	getUserRecords(condition, function(err, userRecords) {
		if(err) {
			return res.status(400).send(err.message);
		} else {
			res.jsonp(userRecords);
		}
	});
};
//
//
//exports.getLatestA1C = function(req, res) {
//
//	var userID = req.params.userID;
//	if(!mongoose.Types.ObjectId.isValid(userID)) {
//		console.log('userID is not valid');
//		return res.status(400).send('Bad Request: Invalid userID');
//	}
//
//	A1C.findOne(
//		{'userID': userID},
//		{},
//		{
//			sort:{
//				recordedTime: -1
//			}
//		},
//		function(err, data) {
//			//if(err || !data) {
//			if(err) {
//				console.error(err);
//				return res.status(400).end('No data available.');
//			} else {
//				res.jsonp(data);
//			}
//		});
//};
//
//
//exports.hasAuthorization = function(req, res, next) {
//	var userID = req.param('userID');
//	 console.log(userID);
//	if (req.user.roles.indexOf('user') !== -1 && userID !== req.user.userID) {
//		return res.status(403).send('User is not authorized');
//	}
//	next();
//};
