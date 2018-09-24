/**
 * Created by robert on 03/03/16.
 */

'use strict';

var request = require('request');
var mongoose = require('mongoose'),
//ObjectId = require('mongoose').Types.ObjectId,

	Meal = mongoose.model('Meal'),
	FoodItem = mongoose.model('FoodItem'),
	FSFoodItem = mongoose.model('FSFoodItem'),
	NXFoodItem = mongoose.model('NXFoodItem'),
	UserFoodItem = mongoose.model('UserFoodItem');

var config = require('../../config/config');

var addOneRecordToDB = require('../utils/dbUtils.js').addOneRecordToDB;

function getServingSizeOption(servingSizeOptions, ssid) {


	var servingSizeInfo = {};

	if(!ssid || ssid <= 0) {
		console.error('invalid servingSizeID:' + ssid);

		if(servingSizeOptions.length >= 1) {
			return servingSizeOptions[0];
		} else {
			return servingSizeInfo;
		}


	}

	for (var i = 0; i < servingSizeOptions.length; ++i) {
		if(servingSizeOptions[i].ssid.toString() === ssid.toString()) {
			servingSizeInfo = servingSizeOptions[i];
			break;
		}
	}

	return servingSizeInfo;
}


function getServingsByType(itemID, servingID, loggedType, callback) {

	var food = {
		itemID:itemID,
		convFac:1
		//foodName:'',
		//servingName:'',
		//carbs:0,
		//protein:0,
		//fat:0,
		//calories:0,
		//fibre:0
	};

	//loggedType: Number, //<!--0:AutoEstimate, 1:Search, 2:UPC, 3:UserDefinedFoodItem,  4: online search from FatSecret, 5: online search from NutritioniX-->
	if(loggedType === 4) {
		NXFoodItem.findOne({itemID:itemID}, function(err, data){
			if (!err && data) {
				var index = data.servings.ids[servingID];
				if(!index) {
					console.log('invalid servingSizeID. use default');
					index = 0;
				}
				var servingSizeInfo = data.servings.options[index];

				food.foodName = data.name;
				food.servingName = servingSizeInfo.name;

				food.carbs = servingSizeInfo.carbs;
				food.protein = servingSizeInfo.protein;
				food.fat = servingSizeInfo.fat;
				food.calories = servingSizeInfo.calories;
				food.fibre = servingSizeInfo.fibre;

			} else {
				food = null;
			}

			callback(err, food);

		});
	} else if(loggedType === 5) {

		NXFoodItem.findOne({itemID:itemID}, function(err, data){
			if (!err && data) {
				var index = data.servings.ids[servingID];
				if(!index) {
					console.log('invalid servingSizeID. use default');
					index = 0;
				}
				var servingSizeInfo = data.servings.options[index];

				food.foodName = data.name;
				food.servingName = servingSizeInfo.name;

				food.carbs = servingSizeInfo.carbs;
				food.protein = servingSizeInfo.protein;
				food.fat = servingSizeInfo.fat;
				food.calories = servingSizeInfo.calories;
				food.fibre = servingSizeInfo.fibre;

			} else {
				food = null;
			}

			callback(err, food);

		});
	} else if(loggedType === 3) {
		UserFoodItem.findOne({id: itemID}, function (err, data) {

			if (!err && data) {
				food.foodName = data.name;

				var servingSizeInfo = getServingSizeOption(data.servingSizeOptions, servingID);
				food.servingName = servingSizeInfo.name;

				food.carbs = data.carbs * food.convFac;
				food.protein = data.protein  * food.convFac;
				food.fat = data.fat * food.convFac;
				food.calories = data.calories  * food.convFac;
				food.fibre = data.fibre  * food.convFac;
			} else {
				food = null;
			}

			callback(err, food);
		});
	} else {
		FoodItem.findOne({id: itemID}, function (err, data) {
			if (!err && data) {
				food.foodName = data.name;

				var servingSizeInfo = getServingSizeOption(data.servingSizeOptions, servingID);
				food.servingName = servingSizeInfo.name;

				if (data.id <= 801000) {
					food.convFac = servingSizeInfo.convFac;
					food.carbs = data.carbs * food.convFac;
					food.protein = data.protein  * food.convFac;
					food.fat = data.fat * food.convFac;
					food.calories = data.calories  * food.convFac;
					food.fibre = data.fibre  * food.convFac;
				} else {
					food.carbs = servingSizeInfo.carbs;
					food.protein = servingSizeInfo.protein;
					food.fat = servingSizeInfo.fat;
					food.calories = servingSizeInfo.calories;
					food.fibre = servingSizeInfo.fibre;
				}


			} else {
				food = null;
			}

			callback(err, food);

		});
	}

}

function genFoodItems(req, callback) {

	//console.log(JSON.stringify(req));

	var results = [];
	var foodRecords = [];

	if( Object.prototype.toString.call( req ) === '[object Array]') {
		foodRecords = req;
	} else {

		foodRecords = [req];
	}

	foodRecords.forEach(function(record, index) {
		var isLastFood  = ( index === foodRecords.length - 1);// && isLast;

		if(record.foodItem && record.foodItem.foodItemID){

			getServingsByType(record.foodItem.foodItemID,
				record.servingSizeID,
				Number(record.foodItemLogType),
				function(err, servingSizeInfo){

					if(err) {
						console.error('Failed to find food item:' + JSON.stringify(record));
						console.error(err.message);

						//callback(err, {message:'Failed to add food info.'});
					} else {
						if(servingSizeInfo) {

							console.log('food item found' + JSON.stringify(servingSizeInfo));

							var food = {};

							if (record.foodItemServingSize) {
								food.servingSize = record.foodItemServingSize;
							} else {
								console.error('the number of serving size is undefined' + JSON.stringify(record));
								food.servingSize = 1;
							}

							food.ssid = record.servingSizeID;
							food.itemID = servingSizeInfo.itemID;
							food.name = servingSizeInfo.foodName;
							food.servingSizeName = servingSizeInfo.servingName;

							food.logType = record.foodItemLogType;

							if (record.foodItemPhoto && record.foodItemPhoto.length) {
								food.photoName = record.foodItemPhoto;
							} else {
								food.photoName = undefined;
							}

							food.convFac = servingSizeInfo.convFac;
							food.carb = servingSizeInfo.carbs * food.servingSize;
							food.pro = servingSizeInfo.protein * food.servingSize;
							food.fat = servingSizeInfo.fat * food.servingSize;
							food.cals = servingSizeInfo.calories * food.servingSize;
							food.fibre = servingSizeInfo.fibre * food.servingSize;

							results.push(food);
						} else {
							console.error('Failed to find food item. ', JSON.stringify(record));
						}
					}

					if(isLastFood) {
						callback(null, results);
					}
				});

		} else {
			console.error('Failed to get food item: ' + JSON.stringify(record));
			if(isLastFood) {
				callback(null, results);
			}
		}

	});
}

var addOneMealRecord = function(userID, mealRecord, callback) {

	var mealTypeList = ['Snack', 'Breakfast', 'Lunch', 'Supper'];
	//var mealEnterTypeList = ['QuickEstimate', 'Search', 'UPC'];

	mealRecord.uuid = mealRecord.deviceMealID;
	mealRecord.mealType = mealTypeList[mealRecord.mealType];
	//mealRecord.mealEnterType = mealEnterTypeList[mealRecord.mealEnterType];
	mealRecord.food = [];

	if(mealRecord.food_Records && mealRecord.food_Records.food_Record) {
		genFoodItems(mealRecord.food_Records.food_Record, function(error, foodItems) {
			if(error) {
				callback(error);

			} else {
				mealRecord.food = foodItems;


				addOneRecordToDB(userID, mealRecord, 'Meal', function(err, record){
					// console.log(JSON.stringify(record));
					var temp = record.toObject();
					temp.mealID = record._id.toString();
					request.post(
					    'http://localhost:30005/tipsgenerator/meal/', {
								form: {
								 	user: userID,
									meal : temp
								}
							},
					    function (error, response, body) {
					        if (!error && response.statusCode === 200) {
											// console.log('Push notification for GCM sending success');
											return 'Instant tips for meal sending success';
					        }else{
										if(error){
											console.error('Instant tips for meal sending failed: ', error.message);
										}
										return 'Instant tips for meal sending failed';
									}
					    }
					);
					callback(err, record);
				});
			}
		});
	} else {
		addOneRecordToDB(userID, mealRecord, 'Meal', function(err, record){
			// console.log(JSON.stringify(mealRecord));
			var temp = record.toObject();
			temp.mealID = record._id.toString();
			request.post(
					'http://localhost:30005/tipsgenerator/meal/', {
						form: {
							user: userID,
							meal : temp
						}
					},
					function (error, response, body) {
							if (!error && response.statusCode === 200) {
									// console.log('Push notification for GCM sending success');
									return 'Instant tips for meal sending success';
							}else{
								if(error){
									console.error('Instant tips for meal sending failed: ', error.message);
								}
								return 'Instant tips for meal sending failed';
							}
					}
			);
			callback(err, record);
		});
	}
};

var addOrUpdateMealRecord = function(userID, records, res, callback) {

	if( Object.prototype.toString.call( records ) === '[object Array]') {
		records.forEach( function(data, index) {
			var isLast = index === records.length-1;
			//findorCreateMeal(userID, data, callback, isLast);
			addOneMealRecord(userID, data, function(error){
				if(isLast) {
					callback(error);
				}
			});
		});
	} else {
		//isLast = true;
		//findorCreateMeal(userID, records, callback, isLast);
		addOneMealRecord(userID, records, callback);
	}
};

exports.addRecords = addOrUpdateMealRecord;
