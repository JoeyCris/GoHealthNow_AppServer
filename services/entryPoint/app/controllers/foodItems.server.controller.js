///**
// * Created by nodejs on 20/04/15.
// */
//'use strict';
//
///**
// * Module dependencies.
// */
//
//var mongoose = require('mongoose'),
//errorHandler = require('./errors.server.controller'),
//FoodItem = mongoose.model('FoodItem'),
//Memcached = require('memcached'),
//Autocomplete = require('autocomplete'),
//_ = require('lodash');
//
///**
// * List of foodItems
// */
//exports.list = function(req, res) {
//	FoodItem.find().exec(function(err, foodItems) {
//		if (err) {
//			console.log('Error in foodItems.list: ', err.message);
//			return res.status(400).send({
//				message: errorHandler.getErrorMessage(err)
//			});
//		} else {
//			res.json(foodItems);
//		}
//	});
//};
//
///**
// * Show the current foodItem
// */
//exports.read = function(req, res) {
//	res.json(req.foodItem);
//};
//
///**
// * FoodItem middleware
// */
//exports.foodItemByID = function(req, res, next, id) {
//
//	if (!mongoose.Types.ObjectId.isValid(id)) {
//		console.log('Error in foodItems.foodItemByID: FoodItemId is invalid');
//		return res.status(400).send({
//			message: 'FoodItem is invalid'
//		});
//	}
//
//	FoodItem.findById(id).exec(function(err, foodItem) {
//		if (err) return next(err);
//		if (!foodItem) {
//			console.log('Error in foodItems.list: FoodItem not found');
//			return res.status(404).send({
//				message: 'FoodItem not found'
//			});
//		}
//		req.foodItem = foodItem;
//		next();
//	});
//};
//
//var memcached = new Memcached('localhost:11211');
//var sqlite3 = require('sqlite3').verbose();
/////Users/Tracy/Documents/robin/project/GlucoGuide-AppServer/tools/genFoodItem/sqlite-okapi-bm25/foodNames.db
//var db = new sqlite3.Database('../../tools/genFoodItem/sqlite-okapi-bm25/foodNames.db');
//
////var nutritionix = require('nutritionix')({
////	appId: '934dbac8',
////	appKey: 'c5164e81341ec30d1fcc079528102083'
////}, false);
//
//var searchFoodItemNew = function(foodName, callback) {
//	console.log('search from nutritionix');
//
//	//nutritionix.search.standard({
//	//	q:'salad',
//	//	// use these for paging
//	//	limit: 10,
//	//	offset: 0,
//	//	// controls the basic nutrient returned in search
//	//	search_nutrient: 'calories'
//	//}).then(successHandler, errorHandler)
//	//	.catch(uncaughtExceptionHandler);
//    //
//	//nutritionix.search({
//	//	phrase: 'mcdonalds',
//	//	results: '0:1'
//	//}, function (err, results){
//	//	console.log(err);
//	//	console.log(results);
//	//	callback(err, results);
//	//	// ...
//	//});
//}
//
//var searchFoodItemTmp = function(foodName, callback) {
//
//
//	var output_limit = 25;
//	// using MongoDB
//	// FoodItem.find(
//	// 	{
//	// 		$text: {$search: foodName}
//	// 	},
//	// 	{
//	// 		score: {$meta: 'textScore'}
//	// 	}).sort({
//	// 		score: { $meta: 'textScore'}
//	// 	}).limit(output_limit).exec(function (err, foodList) {
//	// 		if (err || !foodList) {
//	// 			console.log(err);
//	// 			return callback({message: 'food item not found'});
//	// 		}
//	// 		memcached.set(foodName, foodList, 1000, function (err, result) {
//	// 			console.log('store in memcached');
//	// 		});
//	// 		callback(null, foodList);
//    //
//	// });
//
//	// using SQLite3
//
//	// var args = process.argv.slice(2);
//	// console.log(args);
//
//	var foodList = [];
//
//	if(!foodName) {
//		callback(null, foodList);
//	} else {
//
//
//		var args = foodName.split(' ');
//		console.log(args);
//		var searchSQL = 'select name, ';
//		if (args.length > 1) {
//			searchSQL += "LIKE('%";  // jshint ignore:line
//			args.forEach(function (arg) {
//				searchSQL += arg + '%';
//			});
//			searchSQL += "', name)*2";   // jshint ignore:line
//		} else {
//			searchSQL += "LIKE('%" + foodName + "' ,name) ";  // jshint ignore:line
//		}
//
//
//		args.forEach(function (arg) {
//			searchSQL += " + LIKE('" + arg + "%', name)*2";  // jshint ignore:line
//			if (args.length > 1) {
//				searchSQL += " + LIKE('%" + arg + "%', name)*1";  // jshint ignore:line
//			}
//		});
//		searchSQL += ' - length(name)/' + (args.length * 2).toString();
//		searchSQL += ' as bonus from FoodItem';
//		searchSQL += ' where ';
//		args.forEach(function (data, index) {
//			if (index === 0) {
//				searchSQL += " (name LIKE '%" + data + "%')";  // jshint ignore:line
//			} else {
//				searchSQL += " and (name LIKE '%" + data + "%')";  // jshint ignore:line
//			}
//		});
//		searchSQL += ' order by bonus desc limit 25';
//
//		console.log(searchSQL);
//		db.all(searchSQL, function (err, rows) {
//			if (err) console.log(err);
//			console.log(rows);
//			foodList = rows;
//			memcached.set(foodName, foodList, 10, function (err, result) {
//				console.log('store in memcached');
//				// console.log(foodList);
//				callback(null, foodList);
//			});
//		});
//
//		// db.close();
//	}
//};
//
//// var fs = require('fs');
//
//var parsedJSON = require('../../scripts/foodname.json');
//var foodNames = [];
//parsedJSON.forEach(function (data) {
//	if (data) {
//		foodNames.push(data.name.toLowerCase());
//	}
//});
//
//var autocomplete = Autocomplete.connectAutocomplete();
//autocomplete.initialize(function(onReady) {
//	onReady(foodNames);
//});
//
//
//var searchFoodForItem = function(req, res, foodName) {
//	memcached.get(foodName, function (err, data) {
//		if (err) {
//			console.log(err);
//			searchFoodItem(foodName, function (err, foodList) {
//				if (err) {
//					return res.status(400).end(err);
//				}
//				res.jsonp(foodList);
//			});
//		} else {
//			if (!data) {
//				searchFoodItem(foodName, function (err, foodList) {
//					if (err) {
//						return res.status(400).end(err);
//					}
//					res.jsonp(foodList);
//				});
//			} else {
//				console.log('data from memcached');
//				// console.log(data);
//				return res.jsonp(data);
//			}
//		}
//	});
//};
//
//var typingAutoCompletion = function (req, res, foodName) {
//	var matches = autocomplete.search(foodName);
//	if (matches.length > 0) {
//		matches.sort(function (a, b) {
//			return a.length - b.length;
//		});
//		var foodList = [];
//		matches.slice(0, 15).forEach(function (data) {
//			foodList.push({name:data});
//		});
//		console.log('foodList from trie:');
//		// console.log(foodList);
//		res.jsonp(foodList);
//	} else {
//		searchFoodForItem(req, res, foodName);
//	}
//
//};
//
//
//var FatSecret = require('../utils/FatSecretService.js');
//
//exports.searchFood = function (req, res, next) {
//	var foodName = req.query.foodName;
//	var actionType = req.query.actionType;
//
//	console.log('Food Name:' + foodName);
//
//	FatSecret.searchFood(foodName, function(err, data) {
//		if(err) {
//			return res.status(400).end(JSON.stringify(err));
//		} else {
//			if(data && data.foods) {
//
//				console.log(JSON.stringify(data));
//				res.jsonp(data.foods.food);
//			}
//		}
//	});
//
//        //
//        //
//        //
//        //
//		//nutritionix.search.standard({
//		//	q:'salad',
//		//	// use these for paging
//		//	limit: 10,
//		//	offset: 0,
//		//	// controls the basic nutrient returned in search
//		//	search_nutrient: 'calories'
//		//}).then(function(foods){
//		//	res.jsonp(foods);
//        //
//		//},
//		//function(err){
//		//	return res.status(400).end(err);
//		//});
//
//
//
//
//
//	//searchFoodItemNew(foodName, function(err, foods){
//	//	if(err) {
//	//		return res.status(400).end(err);
//	//	} else {
//	//		res.jsonp(foods);
//	//	}
//    //
//	//});
//	// if (actionType === 'typing') {
//	// 	typingAutoCompletion(req, res, foodName);
//	// } else {
//		//searchFoodForItem(req, res, foodName);
//	// }
//};
///**
// * FoodItem authorization middleware
// */
//exports.hasAuthorization = function(req, res, next) {
//
//};
