'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),

	User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;
	console.log('web update profile');

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		if(user.email === 'johndoe3433@gmail.com') {
			console.log('cannot set rightsmask of John Doe. reset to default value');
			user.rightsMask = 770;
		}
		//if(req.body.rightsMask) {
		//	user.rightsMask = req.body.rightsMask;
		//}
		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Update user's targetCalories
 */
exports.updateTargetCalories = function(userID, profile) {
	// Init Variables
	var FEMALE_BMR_CONSTANT = 447.593;
	var FEMALE_BMR_WEIGHT_CONSTANT = 9.247;
	var FEMALE_BMR_HEIGHT_CONSTANT = 3.098;
	var FEMALE_BMR_AGE_CONSTANT = 4.330;
	var MALE_BMR_CONSTANT = 88.362;
	var MALE_BMR_WEIGHT_CONSTANT = 13.397;
	var MALE_BMR_HEIGHT_CONSTANT = 4.799;
	var MALE_BMR_AGE_CONSTANT = 5.677;
	var GenderTypeFemale = 1;

	User.findOne({userID:userID}).exec(function(err,user){
		if(err) {
			console.error('Failed to update target calories: ', err.message);
			return;
		}
		var message = null;
		if (user) {
			// Merge existing user
			if(typeof profile.weightGoal !== 'undefined'){
				user.targetWeightGoal = profile.weightGoal;
			}
			if(typeof profile.weight !== 'undefined'){
				user.weight = profile.weight;
			}
			if(typeof profile.height !== 'undefined'){
				user.height = profile.height;
			}
			if(typeof profile.gender !== 'undefined'){
				user.gender = profile.gender;
			}
			if(typeof profile.dob !== 'undefined'){
				user.dob = profile.dob;
			}

			if(typeof profile.activityLevel !== 'undefined'){
				user.activityLevel = profile.activityLevel;
			}

			if(! user.activityLevel) {
				user.activityLevel = 1.2;
			}

			var bmrConstant = user.gender === GenderTypeFemale ? FEMALE_BMR_CONSTANT : MALE_BMR_CONSTANT;
			var bmrWeightConstant = user.gender === GenderTypeFemale ? FEMALE_BMR_WEIGHT_CONSTANT : MALE_BMR_WEIGHT_CONSTANT;
			var bmrHeightConstant = user.gender === GenderTypeFemale ? FEMALE_BMR_HEIGHT_CONSTANT : MALE_BMR_HEIGHT_CONSTANT;
			var bmrAgeConstant = user.gender === GenderTypeFemale ? FEMALE_BMR_AGE_CONSTANT : MALE_BMR_AGE_CONSTANT;

			var weightParam = bmrWeightConstant * user.weight;
			var heightParam = bmrHeightConstant * user.height;
			var ageParam = bmrAgeConstant * (new Date().getFullYear() - user.dob);
			var targetCalories = (bmrConstant + weightParam + heightParam - ageParam)* user.activityLevel;
			user.targetCalories = targetCalories + user.targetWeightGoal;
			user.save(function(err) {
				if (err) {
					console.error('update targetCalories failed: ', err.message);

				} else {
					console.log('update targetCalories success');
				}
			});
		} else {
			console.log('Failed to update target calories: user not found');
		}
	});
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

exports.getACL = function(req, res) {
	//if (req.user.roles.indexOf('user') !== -1 ) {
	//	res.json({logbook: 7});
	//} else {
	//	res.json({logbook: 365});
	//}
	res.json({logbook: 365});
};


exports.hasAuthorization = function(req, res, next) {
	//if (req.user.roles.indexOf('admin') === -1 && req.body.userID !== req.user.userID)
	//{
	//	console.log('User ' + req.user.email +' is not authorized');
	//	return res.status(403).send('User is not authorized');
	//}
	//||(req.targetUser&& req.targetUser.userID !== req.user.userID)
	next();
};
