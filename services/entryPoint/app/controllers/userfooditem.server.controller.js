'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Food = mongoose.model('UserFoodItem'),
	Topic = mongoose.model('Topic'),
	Rms = require('../utils/rms.js'),
	_ = require('lodash'),
	sendEmail = require('../utils/sendEmail.js'),
	calculator = require('../../scripts/calculateScore/calculateMealScore'),
	ObjectId = mongoose.Types.ObjectId,
	sendPush = require('../utils/sendPush.js');

/**
 * Create a meal
 */
exports.create = function(req, res) {
	//console.log("create function meal")
	var food = new Food(req.body);
	//topic.creator = req.user;

	//console.log(req.body);

	food.save(function(err) {
		if (err) {
			//console.log(err);
			console.log('Error in UserFoodItem.create: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//console.log("else");
			// var returnMessage;
			// User.find({roles:{$in:['dietitian','admin']}}, function(err, users){
			//
			// 	users.forEach(function(element,index,array){
			// 		var user = element;
			// 		var baseUrl = 'https://' + req.headers.host;
			// 		console.log(user);
			// 		//send email
			// 		var subject = 'New Meal ('+ req.user.accessCode+')';
			// 		var medias = meal.medias;
			// 		if(medias){
			// 			medias.forEach(function(media){
			// 				media.uri =  baseUrl + '/' + media.uri;
			// 			});
			// 		}
			// 		console.log(meal);
			// 	  res.render('templates/upload-meal-reminder-email', {
			// 			meal: meal,
			// 			user: req.user,
			// 			url: baseUrl + '/#!/meals'
			// 		}, function(err, innerContent) {
			// 			    console.log(typeof innerContent);
			// 					sendEmail(req,res,user,subject,innerContent);
			// 		});
			// 	});
			// });
			res.json(food);
		}
	});
};

/**
 * Show the current meal
 */
exports.read = function(req, res) {
	var food = req.food.toObject();
	var topics = Topic.find({reference:food._id}).populate('user', 'email').populate('creator', 'email').exec(function(err, topics){
		if(err){
			console.log('Error in Meal.read: ', err.message);
			return res.status(400).send({
				message: 'No related topics'
			});
		}else{
			food.topics = topics;
			//console.log(meal);
			res.json(food);
		}
	});

};

/**
 * Update a meal
 */
exports.update = function(req, res) {
	//console.log("update");
	var food = req.food;
	//console.log(meal);
	food = _.extend(food, req.body);
	//console.log(meal+' '+req.body);
	food.save(function(err) {
		if (err) {
			console.log('Error in UserFoodItem.update: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(food);
		}
	});
};

/**
 * Delete a meal
 */
exports.delete = function(req, res) {
	var food = req.food;

	food.remove(function(err) {
		if (err) {
			console.log('Error in UserFoodItem.delete: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(food);
		}
	});
};

/**
 * List of meals
 */
exports.list = function(req, res) {
	Food.find().sort('-update_time').populate('userID', 'userID email').exec(function(err, foods) {
		if (err) {
			console.log('Error in UserFoodItem.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(foods);
		}
	});
};

/**
 * List of meals by user
 */
exports.listByUser = function(req, res) {
	Food.find({user:req.foodUser.userID}).sort('-update_time').populate('userID', 'userID email').exec(function(err, foods) {
		if (err) {
			console.log('Error in UserFoodItem.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(foods);
		}
	});
};

/**
 * Meal authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.meal.userID.userID !== req.user.userID) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
