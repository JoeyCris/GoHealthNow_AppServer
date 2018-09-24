/**
 * Created by robert on 28/07/16.
 */

'use strict'

var request = require('request');

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

//request.debug = true;



//curl -v  -X GET "https://api.nutritionix.com/v1_1/search/Apple?
// results=0%3A20&cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id
// &appId=[YOURID]&appKey=[YOURKEY]
exports.searchFood = function(key, pageNumber, maxResults, callback) {

	var rootURL = 'https://api.nutritionix.com/v1_1/search/' + key;

	var from = pageNumber*maxResults;
	var to = (pageNumber+1)*maxResults;

	var keys = getAPIKeys();
	request.get(
		{
			url:rootURL,
			qs: {
				results:  from + ':' + to,
				cal_min: 0,
				cal_max:50000,
				fields:'item_name,item_description,brand_name,item_id,brand_id',
				appId:keys.appId,
				appKey:keys.appKey
			}
		},
		function (error, response, body) {

			if (!error && response.statusCode === 200) {
				var results = [];

				var foods = JSON.parse(body);
				foods.hits.forEach(function(data) {
					results.push({
                        itemID: data.fields.item_id,
						name: data.fields.item_name,
						category:data.fields.brand_name,
						description: data.fields.item_description
					});
				});

				callback(null, {
					foods:results,
					totalResults:foods.total_hits}
				);
			}else{
				if(error){
					console.error('error to call api.nutritionix: ', error.message);
				}
				callback(error,{message:'error to call api.nutritionix'});
			}
		}
	);
};

//curl -v  -X GET "https://api.nutritionix.com/v1_1/item?id=c6404709fa6ab1db433b2231&appId=62f6c31d&appKey=ae0101e614c89065d0641774d7a9cc6b"
exports.getFoodItemById = function(itemID, callback) {
	console.log('nutritionix getFoodItemById' + itemID);
// https://api.nutritionix.com/v1_1/item?id=c6404709fa6ab1db433b2231&appId=[YOURID]&appKey=[YOURKEY]

	var rootURL = 'https://api.nutritionix.com/v1_1/item';
	var keys = getAPIKeys();

	request.get(
		{
			url:rootURL,
			qs: {
				id:itemID,
				appId:keys.appId,
				appKey:keys.appKey
			}
		},
		function (error, response, body) {

			var food = JSON.parse(body);

			console.log(body)
			console.log(error)
			console.log(response.statusCode)

			if (!error && response.statusCode === 200) {
				var results = toDBItem(food);

				callback(null, results);
			}else{
				if(error){
					console.error('error to call api.nutritionix: ', error.message);
				} else {
					error = new Error('item_not_found (api.nutritionix)');
				}

				callback(error,{message:'error to call api.nutritionix'});
			}
		}
	);
};

exports.getFoodItemIdByBarCode = function(barCode, callback) {
// https://api.nutritionix.com/v1_1/item?upc=49000036756&appId=[YOURID]&appKey=[YOURKEY]

	var rootURL = 'https://api.nutritionix.com/v1_1/item';
	var keys = getAPIKeys();

	request.get(
		{
			url:rootURL,
			qs: {
				upc:barCode,
				appId:keys.appId,
				appKey:keys.appKey
			}
		},
		function (error, response, body) {

			var food = JSON.parse(body);

			if (!error && response.statusCode === 200) {
				food.barCode = barCode;
				var results = toDBItem(food);

				callback(null, results);
			}else{
				if(error){
					console.error('error to call api.nutritionix: ', error.message);
				} else {
					error = new Error('item_not_found (api.nutritionix)');
				}

				callback(error,{message:'error to call api.nutritionix'});
			}
		}
	);
};

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

var toDBItem = function(data) {
	console.log(JSON.stringify(data));
	var nameOfIem = data.item_name.replace(/(?:\r\n|\r|\n)/g, ' ');

	var servings = {
		ids: {},
		options: []
	}

	var serving = data;
	var amount = Number(serving.nf_serving_size_qty);
	var unit = serving.nf_serving_size_unit;
	var name = String(amount) + ' ' + unit;
	//if(isNaN(amount) || typeof(unit) === 'undefined') {
	//	name = serving.serving_description;
	//} else {
	//	 name = String(amount) + ' ' + unit;
	//}

	var servingID = 123456;

	servings.options.push( {
		servingID: servingID,
		name: name,
		calories: (serving.nf_calories !== undefined) ? Number(serving.nf_calories) : undefined,
		fat: serving.nf_total_fat !== undefined ? Number(serving.nf_total_fat) : undefined,
		saturatedFat: serving.nf_saturated_fat !== undefined ? Number(serving.nf_saturated_fat) : undefined,
		transFat:  undefined,
		sodium: serving.nf_sodium !== undefined ? Number(serving.nf_sodium) : undefined,
		carbs: serving.nf_total_carbohydrate !== undefined ? Number(serving.nf_total_carbohydrate) : undefined,
		fibre: serving.nf_dietary_fiber !== undefined ? Number(serving.nf_dietary_fiber) : undefined,
		sugars: serving.nf_sugars !== undefined ? Number(serving.nf_sugars) : undefined,
		protein: serving.nf_protein !== undefined ? Number(serving.nf_protein) : undefined,
		iron: serving.nf_iron_dv !== undefined ? Number(serving.nf_iron_dv) : undefined
	});

	servings.ids[servingID] = servings.options.length - 1;



	var category = data.brand_name;



	var foodItem = {
		itemID: data.item_id,
		category: category,
		name: nameOfIem,
		servings: servings
	};

	if(data.barCode) {
		foodItem.upc = data.barCode;
	}

	return foodItem;
};

//API V1.1
// https://api.nutritionix.com/v1_1/item?upc=49000036756&appId=[YOURID]&appKey=[YOURKEY]
//
//{
//	"item_id": "51c3d78797c3e6d8d3b546cf",
//	"item_name": "Cola, Cherry",
//	"brand_id": "51db3801176fe9790a89ae0b",
//	"brand_name": "Coke",
//	"item_description": "Cherry",
//	"updated_at": "2013-07-09T00:00:46.000Z",
//	"nf_ingredient_statement": "Carbonated Water, High Fructose Corn Syrup and/or Sucrose, Caramel Color, Phosphoric Acid, Natural Flavors, Caffeine.",
//	"nf_calories": 100,
//	"nf_calories_from_fat": 0,
//	"nf_total_fat": 0,
//	"nf_saturated_fat": null,
//	"nf_cholesterol": null,
//	"nf_sodium": 25,
//	"nf_total_carbohydrate": 28,
//	"nf_dietary_fiber": null,
//	"nf_sugars": 28,
//	"nf_protein": 0,
//	"nf_vitamin_a_dv": 0,
//	"nf_vitamin_c_dv": 0,
//	"nf_calcium_dv": 0,
//	"nf_iron_dv": 0,
//	"nf_servings_per_container": 6,
//	"nf_serving_size_qty": 8,
//	"nf_serving_size_unit": "fl oz",
//}

var hexToDec = function(s) {
	var i, j, digits = [0], carry;
	for (i = 0; i < s.length; i += 1) {
		carry = parseInt(s.charAt(i), 16);
		for (j = 0; j < digits.length; j += 1) {
			digits[j] = digits[j] * 16 + carry;
			carry = digits[j] / 10 | 0;
			digits[j] %= 10;
		}
		while (carry > 0) {
			digits.push(carry % 10);
			carry = carry / 10 | 0;
		}
	}
	return digits.reverse().join('');
};


var objectIdTo64BitId = function(itemID){
	//var objectId = new ObjectId();
	// console.log(objectId);
	var strId = itemID; //objectId;
	// console.log(strId);
	var randomNumber = 1;
	if((typeof process.env.NODE_APP_INSTANCE !== 'undefined')){
		randomNumber += process.env.NODE_APP_INSTANCE;
	}
	var hexString = randomNumber.toString(16);
	if(hexString.length  === 1)
		hexString = '0'+hexString;
	var str = strId.substr(0,8) + hexString + strId.substr(18, 24);
	// var id = parseInt(str,16);
	var id = hexToDec(str);
	console.log('FoodIdString: '+str+', FoodId: '+id);
	// console.log(id);
	return id;
};

var transform2foodItem = function(barCode, data) {
	console.log(JSON.stringify(data));
	var nameOfIem = data.item_name.replace(/(?:\r\n|\r|\n)/g, ' ');

	var servings = {
		ids: {},
		options: []
	}

	var serving = data;
	var amount = Number(serving.nf_serving_size_qty);
	var unit = serving.nf_serving_size_unit;
	var name = String(amount) + ' ' + unit;
	//if(isNaN(amount) || typeof(unit) === 'undefined') {
	//	name = serving.serving_description;
	//} else {
	//	 name = String(amount) + ' ' + unit;
	//}

	var servingID = 123456;

	servings.options.push( {
		servingID: servingID,
		name: name,
		calories: (serving.nf_calories !== undefined) ? Number(serving.nf_calories) : undefined,
		fat: serving.nf_total_fat !== undefined ? Number(serving.nf_total_fat) : undefined,
		saturatedFat: serving.nf_saturated_fat !== undefined ? Number(serving.nf_saturated_fat) : undefined,
		transFat:  undefined,
		sodium: serving.nf_sodium !== undefined ? Number(serving.nf_sodium) : undefined,
		carbs: serving.nf_total_carbohydrate !== undefined ? Number(serving.nf_total_carbohydrate) : undefined,
		fibre: serving.nf_dietary_fiber !== undefined ? Number(serving.nf_dietary_fiber) : undefined,
		sugars: serving.nf_sugars !== undefined ? Number(serving.nf_sugars) : undefined,
		protein: serving.nf_protein !== undefined ? Number(serving.nf_protein) : undefined,
		iron: serving.nf_iron_dv !== undefined ? Number(serving.nf_iron_dv) : undefined
	});

	servings.ids[servingID] = servings.options.length - 1;



	var category = data.brand_name;



	var foodItem = {
		itemID: objectIdTo64BitId(data.item_id),
		category: category,
		upc: barCode,
		name: nameOfIem,
		servings: servings
	};
	return foodItem;
};

//b566072f //support@glucoguide.com
//778bf4a2c463caf3d0ee0c32d55d414c

var getAPIKeys = function() {
	var keys = [{
		appId:'62f6c31d', //rnd01.gg@gmail.com
		appKey:'ae0101e614c89065d0641774d7a9cc6b'
	},
		{
			appId:'b566072f', //support@glucoguide.com
			appKey:'778bf4a2c463caf3d0ee0c32d55d414c'

		},
		{
		appId:'564b876e', //support@gohealthnow.ca
		appKey:'766bc1222ac74f63f190ee3d0487d15e'

	}];

	var index = Math.floor(Math.random() * keys.length);

	//var index = Math.round(Math.random()*100) % keys.length;
	console.log('the index of API Key:' + index)
	return keys[index];
};

exports.getFoodItemIdByBarCode2 = function(barCode, callback) {
// https://api.nutritionix.com/v1_1/item?upc=49000036756&appId=[YOURID]&appKey=[YOURKEY]

	var rootURL = 'https://api.nutritionix.com/v1_1/item';
	var keys = getAPIKeys();

	request.get(
		{
			url:rootURL,
			qs: {
				upc:barCode,
				appId:keys.appId,
				appKey:keys.appKey
			}
		},
		function (error, response, body) {

			var food = JSON.parse(body);

			console.log(body)
			console.log(error)
			console.log(response.statusCode)

			if (!error && response.statusCode === 200) {
				var results = transform2foodItem(barCode,food);

				callback(null, results);
			}else{
				if(error){
					console.error('error to call api.nutritionix: ', error.message);
				} else {
					error = new Error('item_not_found (api.nutritionix)');
				}

				callback(error,{message:'error to call api.nutritionix'});
			}
		}
	);
};

exports.autocomplete = function(foodName, callback) {
	callback(null,{suggestions:{}});
};


