/**
 * Created by Canon on 2016-01-05.
 */

var util = require("util");

//var FatSecret = require("./FatSecretApi.js")({
//    consumerKey: "4ad4c3d11ecf476895479c0b7495e355",
//    sharedSecret: "0a1a99adfd584c4bb10e1c8d78177405"
//});
var crypto = require('crypto');


var request = require('request');
//request.debug = true;
var url = 'http://platform.fatsecret.com/rest/server.api';
var oauth = {
	consumer_key: '4ad4c3d11ecf476895479c0b7495e355',
	consumer_secret: '0a1a99adfd584c4bb10e1c8d78177405',
	transport_method : 'query'
	//body_hash: true
};




var getFoodItemIdByBarCode = function(barCode, callback) {
	//FatSecret.setMethod('food.find_id_for_barcode');
	//FatSecret.setPara({barcode: barCode});
	//FatSecret.get(callback);


	var qs = {
		'method': 'food.find_id_for_barcode',
		barcode: barCode,
		'format': 'json'
	};


	request.get({url:url, oauth:oauth, qs:qs}, function (error, response, body) {


		if (!error && response.statusCode === 200) {

			var err = null;

			var result = JSON.parse(body);
			if(result instanceof Error || result.hasOwnProperty("error") || result.constructor === String) {
				console.log('error to call FatSecret API:' + body);
				err = new Error("Remote Database Internal Error");
			}
			callback(err, result);

		} else {
			if(error){
				console.error('error to call FatSecret API: ', error.message);
			}
			callback(error,{message:'error to call FatSecret API'});
		}
	});
};

var getFoodItemById = function(food_id, callback) {
	//FatSecret.setMethod('food.get');
	//FatSecret.setPara({food_id: food_id});
	//FatSecret.get(callback);
	var qs = {
		'method': 'food.get',
		food_id: food_id,
		'format': 'json'
	};


	request.get({url:url, oauth:oauth, qs:qs}, function (error, response, body) {


		if (!error && response.statusCode === 200) {
			//var results = [];
			var err = null;

			var result = JSON.parse(body);
			if(result instanceof Error || result.hasOwnProperty("error") || result.constructor === String) {
				console.log('error to call FatSecret API:' + body);
				err = new Error("Remote Database Internal Error");
			}
			callback(err, result);

		} else {
			if(error){
				console.error('error to call FatSecret API: ', error.message);
			}
			callback(error,{message:'error to call FatSecret API'});
		}
	});
};


exports.transform2foodItem_old = function(barCode, data) {
	var nameOfIem = data.food.food_name.replace(/(?:\r\n|\r|\n)/g, ' ');
	//var hash1 = crypto.createHash('sha256');
	//var hash2 = crypto.createHash('sha256');
	//var barcodeHash = hash1.update(barCode).digest('hex').slice(0,10);
	//var nameHash = hash2.update(nameOfIem).digest('hex').slice(0,10);
    //
	//barcodeHash = String(parseInt(barcodeHash, 16));
	//nameHash = String(parseInt(nameHash, 16));
    //
    //
    //
	//var barCodeAsId = Number(barcodeHash.slice(0,8) + nameHash.slice(0,5));
	var barCodeAsId = Number('7' + barCode);

	var food = data.food;
	var serving = food.servings.serving;
	var servingArray = [];
	if(!util.isArray(serving)) {
		servingArray.push(serving);
	} else {
		servingArray = serving;
	}
	var ID = function() {
		var id = 300;
		var nextId = function() {
			id = id + 1;
			return id;
		};
		return nextId;
	};
	var nextId = ID();

	var servingOptions = servingArray.map(function(serving) {
		var amount = Number(serving.metric_serving_amount);
		var unit = serving.metric_serving_unit;
		var name = '';
		if(isNaN(amount) || typeof(unit) === 'undefined') {
			name = serving.serving_description;
		} else {
			var amountWithUnit = String(amount) + ' ' + unit;
			if(amountWithUnit === serving.serving_description) {
				name = amountWithUnit;
			} else {
				name = String(amount) + unit + '(' + serving.serving_description + ')';
			}
		}
		var nid = nextId();
		var newServing = {
			_id: nid,
			ssid: nid,
			name: name,
			convFac: 1.0,
			calories: serving.calories ? Number(serving.calories) : 0,
			fat: serving.fat ? Number(serving.fat) : 0,
			saturatedFat: serving.saturated_fat ? Number(serving.saturated_fat) : 0,
			transFat: serving.trans_fat ? Number(serving.trans_fat) : 0,
			sodium: serving.sodium ? Number(serving.sodium) : 0,
			carbs: serving.carbohydrate ? Number(serving.carbohydrate) : 0,
			fibre: serving.fiber ? Number(serving.fiber) : 0,
			sugars: serving.sugar ? Number(serving.sugar) : 0,
			protein: serving.protein ? Number(serving.protein) : 0,
			iron: serving.iron ? Number(serving.iron) : 0
		};
		return newServing;
	});

	foodItem = {
		_id: barCodeAsId,
		id: barCodeAsId,
		upc: barCode,
		name: nameOfIem,
		servingSizeOptions: servingOptions,
	};
	return foodItem;
};


var transform2foodItem = function(barCode, data) {
	var nameOfIem = data.food.food_name.replace(/(?:\r\n|\r|\n)/g, ' ');


	var food = data.food;
	var serving = food.servings.serving;
	var servingArray = [];
	if(!util.isArray(serving)) {
		servingArray.push(serving);
	} else {
		servingArray = serving;
	}

	var servings = {
		ids: {},
		options: []
	}

	servingArray.forEach(function(serving) {
		var amount = Number(serving.metric_serving_amount);
		var unit = serving.metric_serving_unit;
		var name = '';
		if(isNaN(amount) || typeof(unit) === 'undefined') {
			name = serving.serving_description;
		} else {
			var amountWithUnit = String(amount) + ' ' + unit;
			if(amountWithUnit === serving.serving_description) {
				name = amountWithUnit;
			} else {
				//name = String(amount) + unit + '(' + serving.serving_description + ')';
				name = serving.serving_description + '(' + String(amount) + unit + ')';
			}
		}

		servings.options.push( {
			servingID: serving.serving_id,
			name: name,
			calories: (serving.calories !== undefined) ? Number(serving.calories) : undefined,
			fat: serving.fat !== undefined ? Number(serving.fat) : undefined,
			saturatedFat: serving.saturated_fat !== undefined ? Number(serving.saturated_fat) : undefined,
			transFat: serving.trans_fat !== undefined ? Number(serving.trans_fat) : undefined,
			sodium: serving.sodium !== undefined ? Number(serving.sodium) : undefined,
			carbs: serving.carbohydrate !== undefined ? Number(serving.carbohydrate) : undefined,
			fibre: serving.fiber !== undefined ? Number(serving.fiber) : undefined,
			sugars: serving.sugar !== undefined ? Number(serving.sugar) : undefined,
			protein: serving.protein !== undefined ? Number(serving.protein) : undefined,
			iron: serving.iron !== undefined ? Number(serving.iron) : undefined
		});

		servings.ids[serving.serving_id] = servings.options.length - 1;

	});


	var category = null;

	if(food.brand_name) {
		category = food.brand_name;
	} else {
		category = food.food_type;
	}



	var foodItem = {
		itemID: food.food_id,
		category: category,
		upc: barCode,
		name: nameOfIem,
		servings: servings
	};
	return foodItem;
};

exports.transform2foodItem = transform2foodItem;

exports.fooditem2response = function(foodItem) {
	var formatServings = function(servings) {
		var resultOptions = servings.options.map(function(serving) {
			var oneServingSizeOption = {};
			oneServingSizeOption.servingSize = serving.name;
			oneServingSizeOption.servingSizeID = serving.servingID;
			oneServingSizeOption.calories = serving.calories;
			oneServingSizeOption.fat = serving.fat;
			oneServingSizeOption.saturatedFat = serving.saturatedFat;
			oneServingSizeOption.transFat = serving.transFat;
			oneServingSizeOption.sodium = serving.sodium;
			oneServingSizeOption.carbs = serving.carbs;
			oneServingSizeOption.fibre = serving.fibre;
			oneServingSizeOption.sugars = serving.sugars;
			oneServingSizeOption.protein = serving.protein;
			oneServingSizeOption.iron = serving.iron;
			return oneServingSizeOption;

		});

		return resultOptions;
	};

	var oneItem = {
		name: foodItem.name,
		itemID: foodItem.itemID,
		category:foodItem.category,
		servingSizeOptions: {
			servingSizeOption: formatServings(foodItem.servings)
		}
	};


	return oneItem;
};
//
//exports.fooditem2response = function(fooditem) {
//	var oneItem = {};
//	oneItem.name = fooditem.name;
//	oneItem.itemID = fooditem.id;
//	oneItem.servingSizeOptions = {};
//	var resultOptions = fooditem.servingSizeOptions.map(function(serving) {
//		var oneServingSizeOption = {};
//		oneServingSizeOption.servingSize = serving.name;
//		oneServingSizeOption.servingSizeID = serving.ssid;
//		oneServingSizeOption.calories = serving.calories;
//		oneServingSizeOption.fat = serving.fat;
//		oneServingSizeOption.saturatedFat = serving.saturatedFat;
//		oneServingSizeOption.transFat = serving.transFat;
//		oneServingSizeOption.sodium = serving.sodium;
//		oneServingSizeOption.carbs = serving.carbs;
//		oneServingSizeOption.fibre = serving.fibre;
//		oneServingSizeOption.sugars = serving.sugars;
//		oneServingSizeOption.protein = serving.protein;
//		oneServingSizeOption.iron = serving.iron;
//		return oneServingSizeOption;
//
//	});
//
//	oneItem.servingSizeOptions.servingSizeOption = resultOptions;
//	var result = {};
//	result.UPCScaning_Status = 0;
//	result.labels = {};
//	result.labels.label = {};
//	result.labels.label = oneItem;
//	return result;
//};


exports.getFoodItemByBarCode = function(barCode, callback) {
	getFoodItemIdByBarCode(barCode, function(err, data) {
		if(err) {
			return callback(err, data);
		}
		//console.log('get item by bar code:'+JSON.stringify(data));
		var food_id = String(data.food_id.value);
		getFoodItemById(food_id, function(error, data) {

			if(error) {
				callback(error,data);
			}else {
				foodItem = transform2foodItem(barCode, data);
				callback(null, foodItem);
			}
		});



	});
};


exports.searchFood = function(key, pageNumber, maxResults, callback) {
	//FatSecret.setMethod('foods.search');
	//FatSecret.setPara({
	//	search_expression: key//,
	//	//page_number: pageNumber,
	//	//max_results: maxResults
	//});
	//
    //
	//FatSecret.get(function(err, data) {

		var qs = {
			'method': 'foods.search',
			'search_expression': key,
			'format': 'json',
			page_number: pageNumber,
			max_results: maxResults
		};


		request.get({url:url, oauth:oauth, qs:qs}, function (error, response, body) {
			//console.log('search result: '+body);

			if (!error && response.statusCode === 200) {
				//var results = [];

				var data = JSON.parse(body);

				if(data instanceof Error || data.hasOwnProperty("error") || data.constructor === String) {
					console.log('error to call FatSecret API:' + body);
					err = new Error("Remote Database Internal Error");
					callback(err, data);
				} else {


					var result = {totalResults: 0, foods: []};

					if (data && data.foods && data.foods.food) {
						var foods = data.foods.food;
						result.totalResults = data.foods.total_results;

						if (util.isArray(foods)) {
							console.log('total found: ' + foods.length);

							foods.forEach(function (item) {
								var category = null;

								if (item.brand_name) {
									category = item.brand_name;
								} else {
									category = item.food_type;
								}

								result.foods.push({
									itemID: item.food_id,
									name: item.food_name,
									category: category,
									description: item.food_description
								});
							});
						} else {
							if (foods.food_id && foods.food_name && foods.food_description) {
								var category = null;
								if (foods.brand_name) {
									category = foods.brand_name;
								} else {
									category = foods.food_type;
								}

								result.foods.push({
									itemID: foods.food_id,
									name: foods.food_name,
									category: category,
									description: foods.food_description
								});
							} else {
								console.log('unexpected searching result: ' + JSON.stringify(foods));
							}
						}


					}

					callback(null, result);
				}
			} else{
				if(error){
					console.error('error to call api.nutritionix: ', error.message);
				}
				callback(error,{message:'error to call api.nutritionix'});
			}

	});
};

exports.getFoodItemById = function(foodID, callback) {
	getFoodItemById(foodID, function(err, data) {
		if(!err) {

			var food = transform2foodItem(undefined, data);
			callback(null, food);
		} else {
			callback(err,data);
		}
	})
};

exports.autocomplete = function(foodName, callback) {
	//FatSecret.setMethod('foods.autocomplete');
    //
	//FatSecret.setPara({expression: foodName});
    //
	//FatSecret.get(callback);


	var qs = {
		'method': 'foods.autocomplete',
		expression: foodName,
		'format': 'json'
	};


	request.get({url:url, oauth:oauth, qs:qs}, function (error, response, body) {


		if (!error && response.statusCode === 200) {

			var err = null;

			var result = JSON.parse(body);
			if(result instanceof Error || result.hasOwnProperty("error") || result.constructor === String) {
				console.log('error to call FatSecret API:' + body);
				err = new Error("Remote Database Internal Error");
			}
			callback(err, result);

		} else {
			if(error){
				console.error('error to call FatSecret API: ', error.message);
			}
			callback(error,{message:'error to call FatSecret API'});
		}
	});
};



