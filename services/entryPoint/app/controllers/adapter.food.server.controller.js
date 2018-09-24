/**
 * Created by robert on 28/07/16.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('./errors.server.controller.js'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	Advice = mongoose.model('Advice'),
	User = mongoose.model('User'),
	FSFoodItem = mongoose.model('FSFoodItem'),
	NXFoodItem = mongoose.model('NXFoodItem'),
	genXmlOutput = require('../utils/genxmloutput.js');


//var FatSecret = require('../utils/FatSecretService.js');

//var API = require('../utils/NutritioniXService.js');
//var API = require('../utils/FatSecretService.js');
var API = {
	provider:require('../utils/FatSecretService.js'),
	id:4
};

//var API = {
//	provider:require('../utils/NutritioniXService.js'),
//	id:5
//};



var genXmlOutput =  require('../utils/genxmloutput.js');

var format2response = function(servings) {
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

//<Item>
//<ProviderID>4</ProviderID>
//
//<ItemID>513fceb475b8dbbc21000f92</ItemID>
//
//<Name>Apple - 1 medium (3" dia)</Name>
//
//<ServingSizeOptions>
//
//<ServingSizeOption>
//
//<ServingSize>1 medium (3" dia) (182 g)</ServingSize>
//
//<ServingSizeID>300</ServingSizeID>
//
//<Calories>190</Calories>
//
//<Fat>7</Fat>
//
//<SaturatedFat>3.5</SaturatedFat>
//
//<TransFat>0</TransFat>
//
//<Sodium>760</Sodium>
//
//<Carbs>28</Carbs>
//
//<Fibre>1</Fibre>
//
//<Sugars>1</Sugars>
//
//<Protein>4</Protein>
//
//<Iron>6</Iron>
//
//</ServingSizeOption>
//
//</ServingSizeOptions>
//
//</Item>
var fooditem2response = function(foodItem, isJson) {
	var oneItem = API.provider.fooditem2response(foodItem);
	oneItem.providerID = API.id;

	console.log('isJson:' + isJson);

	if(isJson) {
		return oneItem;
	} else {
		var result = genXmlOutput('Item', oneItem);
		return result;
	}

};


exports.search = function (req, res, next) {
	var foodName = req.param('key').trim();
	if(!foodName) {
		return res.status(400).end({message:'invalid parameters'});
	}

	var pageNumber = Number(req.param('pageNumber'));
	if(!pageNumber || pageNumber < 0) {
		pageNumber = 0;
	}

	var maxResults = Number(req.param('maxResults'));
	if(!maxResults || maxResults > 50 || maxResults < 0) {
		maxResults = 50;
	}

	var isJson = (req.param('format') === 'json');

	console.log('searching ' + foodName +' page number:' + pageNumber + ' max results:  ' + maxResults + ' is JSON: ' + isJson);

	API.provider.searchFood(foodName, pageNumber, maxResults, function (err, data) {

		if (err) {
			return res.status(404).end(JSON.stringify(err));
		} else {
			//console.log(JSON.stringify(data));
			var result = {
				providerID:API.id,
				totalResults:data.totalResults,
				currentPageResults:data.foods.length,
				food:data.foods
			};

			if(isJson) {
				res.jsonp(result);
			} else {
				var xml = genXmlOutput('Foods', result);

				res.send(xml);
			}

		}
	});
};



exports.getItemInDetail = function (req, res, next) {
	var providerID = req.param('providerID');

	var itemID = req.param('itemID');

	if(!providerID || !itemID) {
		return res.status(400).end({message:'invalid parameters'});
	}

	var isJson = (req.param('format') === 'json');

	NXFoodItem.findOne({'itemID':itemID}, function(err, item) {
		if(err || !item) {

			API.provider.getFoodItemById(itemID, function (err, data) {
				if (err) {
					return res.status(400).end(JSON.stringify(err));
				} else {
					var foodItem = new NXFoodItem(data);
					console.log('added new item for online: ' + JSON.stringify(foodItem));

					foodItem.save(function(err){

						if(err) {
							console.log('error to add new item for online search:' + JSON.stringify(err));
						}

						res.send(fooditem2response(foodItem, isJson));
					});

				}
			});
		} else {
			res.send(fooditem2response(item, isJson));
		}
	});

};
//
//exports.getItemInDetail2 = function (req, res, next) {
//	var providerID = API.id;//req.param('providerID')
//
//	var itemID = Number(req.param('itemID'));
//
//	if(!providerID || !itemID) {
//		return res.status(400).end({message:'invalid parameters'});
//	}
//
//	var isJson = (req.param('format') === 'json');
//
//	FSFoodItem.findOne({'itemID':itemID}, function(err, item) {
//		if(err || !item) {
//
//			API.provider.getFoodItemById(itemID, function (err, data) {
//				if (err) {
//					return res.status(400).end(JSON.stringify(err));
//				} else {
//					var foodItem = new FSFoodItem(data);
//					console.log('added new item for online: ' + JSON.stringify(foodItem));
//
//					foodItem.save(function(err){
//
//						if(err) {
//							console.log('error to add new item for online search:' + JSON.stringify(err));
//						}
//
//						res.send(fooditem2response(foodItem, isJson));
//					});
//
//				}
//			});
//		} else {
//			res.send(fooditem2response(item, isJson));
//		}
//	});
//
//};

//var test = function(foodName, callback) {
//
//	var crypto = require('crypto');
//
//
//	var fatSecretRestUrl = "http://platform.fatsecret.com/rest/server.api";
//	var sharedSecret = '0a1a99adfd584c4bb10e1c8d78177405';
//
//	console.log('auto complete:' + foodName);
//
//	var date = new Date();
//	var para  = {
//		expression:foodName,
//		format: 'json',
//		method: 'foods.autocomplete',
//		oauth_consumer_key: '4ad4c3d11ecf476895479c0b7495e355',
//		oauth_nonce: Math.random().toString(36).replace(/[^a-z]/, '').substr(2),
//		oauth_signature_method: 'HMAC-SHA1',
//		oauth_timestamp: Math.floor(date.getTime() / 1000),
//		oauth_version: "1.0"
//	};
//
//	var paramsStr = '';//'expression=Swiss%27C';
//
//	var rfc3986 = function (str) {
//		return str.replace(/[!'()*]/g, function (c) {
//			return '%' + c.charCodeAt(0).toString(16).toUpperCase()
//		})
//	}
//
//	for (var i in para) {
//		paramsStr += "&" + i + "=" + rfc3986(encodeURIComponent(para[i]));
//	}
//	paramsStr = paramsStr.slice(1);
//
//	var encodedParamsStr = encodeURIComponent(paramsStr);
//
//	console.log('paraStr:' + paramsStr);
//	console.log('encoded:' + encodedParamsStr);
//
//	var sigBaseStr = "GET" + "&"
//		+ encodeURIComponent(fatSecretRestUrl)
//		+ "&"
//		+ encodeURIComponent(paramsStr);
//	console.log("sig base str = " + sigBaseStr);
//	var sharedSecret = sharedSecret + "&";
//	// HMAC SHA1 has
//	var hashedBaseStr  = crypto.createHmac('sha1', sharedSecret).update(sigBaseStr).digest('base64');
//	console.log("oauth_sig = " + hashedBaseStr);
//
//	// Add oauth_signature to the request object
//	//para.expression='Swiss\'C';
//	para.oauth_signature = hashedBaseStr;
//
//	var request = require('request');
//
//	request.debug = true;
//
//	request.get(
//		{
//			url:fatSecretRestUrl,
//			qs: para
//		},
//		function (error, response, body) {
//			if (!error && response.statusCode === 200) {
//
//				callback(null, JSON.parse(body));
//			}else{
//				if(error){
//					console.error('error to call api.nutritionix: ' + JSON.stringify(error));
//				}
//				callback(error,{message:'error to call api.nutritionix'});
//			}
//
//		});
//
//
//}


var testFSAPI = function(foodName, callback) {
	var request = require('request');
	request.debug = true;
	var url = 'http://platform.fatsecret.com/rest/server.api';
	var oauth = {
		consumer_key: '4ad4c3d11ecf476895479c0b7495e355',
		consumer_secret: '0a1a99adfd584c4bb10e1c8d78177405',
		transport_method : 'query',
		//body_hash: true
	};

	var qs = {
		'method': 'foods.search',
		'search_expression': 'egg',
		'format': 'json'
	};


	request.get({url:url, oauth:oauth, qs:qs}, function (e, r, body) {
		console.log(body);
	});

	//request.get(
	//	{
	//		url:rootURL,
	//		qs: {
	//			results:  from + ':' + to,
	//			cal_min: 0,
	//			cal_max:50000,
	//			fields:'item_name,item_description,brand_name,item_id,brand_id',
	//			appId:keys.appId,
	//			appKey:keys.appKey
	//		}
	//	},
	//	function (error, response, body) {
    //
	//		if (!error && response.statusCode === 200) {
	//			var results = [];
    //
	//			var foods = JSON.parse(body);
	//			foods.hits.forEach(function(data) {
	//				results.push({
	//					itemID: data.fields.item_id,
	//					name: data.fields.item_name,
	//					category:data.fields.brand_name,
	//					description: data.fields.item_description
	//				});
	//			});
    //
	//			callback(null, {
	//					foods:results,
	//					totalResults:foods.total_hits}
	//			);
	//		}else{
	//			if(error){
	//				console.error('error to call api.nutritionix: ', error.message);
	//			}
	//			callback(error,{message:'error to call api.nutritionix'});
	//		}
	//	}
	//);
};


exports.autocomplete = function (req, res, next) {
	var foodName = req.param('key').trim();

	if(!foodName) {
		return res.status(400).end({message:'invalid parameters'});
	}


	API.provider.autocomplete(foodName, function (err, data) {
		if (err) {
			return res.status(404).end(JSON.stringify(err));
		} else {
			console.log('auto complete for ' + foodName + JSON.stringify(data));
			var result = genXmlOutput('Suggestions', data.suggestions);

			res.send(result);
			//res.jsonp(result);

		}
	});



};
