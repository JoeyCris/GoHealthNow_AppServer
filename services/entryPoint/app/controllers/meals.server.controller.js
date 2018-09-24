'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Meal = mongoose.model('Meal'),
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
	var meal = new Meal(req.body);
	//topic.creator = req.user;

	//console.log(req.body);

	meal.save(function(err) {
		if (err) {
			//console.log(err);
			console.log('Error in Meal.create: ', err.message);
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
			res.json(meal);
		}
	});
};

/**
 * Show the current meal
 */
exports.read = function(req, res) {
	var meal = req.meal.toObject();
	var topics = Topic.find({reference:meal._id}).populate('user', 'email').populate('creator', 'email').exec(function(err, topics){
		if(err){
			console.log('Error in Meal.read: ', err.message);
			return res.status(400).send({
				message: 'No related topics'
			});
		}else{
			meal.topics = topics;
			//console.log(meal);
			res.json(meal);
		}
	});

};

/**
 * Update a meal
 */
exports.update = function(req, res) {
	//console.log("update");
	var meal = req.meal;
	//console.log(meal);
	meal = _.extend(meal, req.body);
	//console.log(meal+' '+req.body);
	meal.save(function(err) {
		if (err) {
			console.log('Error in Meal.update: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(meal);
		}
	});
};

/**
 * Delete a meal
 */
exports.delete = function(req, res) {
	var meal = req.meal;

	meal.remove(function(err) {
		if (err) {
			console.log('Error in Meal.delete: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(meal);
		}
	});
};

/**
 * List of meals
 */
exports.list = function(req, res) {
	Meal.find().sort('-update_time').populate('userID', 'userID email').exec(function(err, meals) {
		if (err) {
			console.log('Error in Meal.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(meals);
		}
	});
};

/**
 * List of meals by user
 */
exports.listByUser = function(req, res) {
	Meal.find({user:req.mealUser.userID}).sort('-update_time').populate('userID', 'userID email').exec(function(err, meals) {
		if (err) {
			console.log('Error in Meal.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(meals);
		}
	});
};

/**
 * List of meal types
 */
exports.listTypes = function(req, res) {
	res.json(Meal.schema.path('mealType').enumValues);
};

/**
 * List of meal by type
 */
exports.listByType = function(req, res) {
	var mealType = req.mealType;
	var user = req.user;
	Rms.getUserList(req.user, function(err, patients){
		if(err){
			console.log('Error in Meal.listByType: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		var userList = [];
		patients.forEach(function(ele,array,index){
			userList.push(ele.userID);
		});
		Meal.find({mealType : mealType, userID: {$in: userList}}).sort('-update_time').populate('userID', 'userID email').exec(function(err, meals) {
			if (err) {
				console.log('Error in Meal.listByType: ', err.message);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(meals);//{meals: meals});
			}
		});
	});
};

/**
 * User Topic middleware
 */
exports.userById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	User.findById(id,{userID: 1,
		height: 1,
		weight: 1,
		gender: 1,
		dob: 1,
		waistSize: 1,
		lastName: 1,
		firstName: 1,
		accessCode: 1,
		bmi: 1,
		points: 1,
		promoteMessage: 1,
		updatedTime: 1,
		registrationTime: 1
	}).exec(function(err, user) {
		if (err) {
			console.log('Error in Meal.userById: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			req.mealUser = user;
			//console.log(user);
			next();
		}
	});
};

/**
 * Meal Type middleware
 */
exports.typeById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	var types = Meal.schema.path('mealType').enumValues;
	req.mealType = types[id];
	//console.log(types[id]);
	next();
};

/**
 * Meal middleware
 */
exports.mealByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('Error in Meal.mealByID: MealId is invalid');
		return res.status(400).send({
			message: 'MealId is invalid'
		});
	}

	Meal.findById(id).exec(function(err, org_meal) {
		if (err) return next(err);
		if (!org_meal) {
			console.log('Error in Meal.mealByID: Meal not found');
			return res.status(404).send({
				message: 'Meal not found'
			});
		}
		var mealphoto = org_meal.mealPhoto;
		if(mealphoto){
			if(mealphoto.lastIndexOf('/') !== -1)
				mealphoto = mealphoto.substring(mealphoto.lastIndexOf('/')+1);
			org_meal.mealPhoto = '/images/'+org_meal.userID+'/'+mealphoto;
		}
		req.meal = org_meal;
		var ops = [
			{ path: 'food.itemID', select: 'name', model: 'FoodItem'  },
			{ path: 'userID', select: 'userID email', model: 'User' }
		];
		Meal.populate(org_meal, ops, function(err,meal){
			if (err) {
				//req.meal = org_meal;
				console.log('Error in Meal.mealByID: ', err.message);
				return next(err);
			}
			//console.log(meal);

			req.meal = meal;
			next();
		});

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



exports.calScoreForAllMeals = function(req, res, next) {
	var userID = req.param('userid');
	var getIdeaCals = function(user) {
		var bmr = 0.0;
		var age = new Date().getFullYear() -  user.dob;
		if (user.gender === 0) { //male
			bmr = 88.362 + 13.397 * (user.weight) + 4.799 * user.height - 5.677 * age;
		} else {
			bmr = 447.593 + 9.247 * user.weight + 3.098 * user.height - 4.330 * age;
		}
		var idealCals = 1.2 * bmr;
		return idealCals;
	};

	User.findOne({'userID': userID}, function(err, data) {
		if(err || !data) {
			if(err) {
				console.log(err);
			}
			res.send('Error when looking for user or no users found');
		} else {
			var ideaCals = getIdeaCals(data);
			calculator.init(function() {
				Meal.find({userID: new ObjectId(userID)}, function (err, docs) {
					if (err || !docs) {
						if(err){
							console.log(err);
						}
						res.send('Error when looking for meals or no meal found');
					} else {
						docs.forEach(function (doc) {
							if(doc.mealScore) {
								return;
							}
							var score = calculator.getScore(ideaCals, doc);
							doc.mealScore = score;
							doc.save(function (err) {
								if (err) {
									console.log('Error ' + doc._id + err);
									res.send('Error when saving scores');
								}
							});
						});
					}
					res.send('success');
				});
			});
		}
	});
};
