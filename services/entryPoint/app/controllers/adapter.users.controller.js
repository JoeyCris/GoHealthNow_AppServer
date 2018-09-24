/**
 * Created by nodejs on 20/04/15.
 */
'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash'),
	errorHandler = require('./errors.server.controller.js'),
	genXmlOutput =  require('../utils/genxmloutput.js'),
	emailVerification = require('./users/users.emailverify.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	UserProfileController = require('./users/users.profile.server.controller.js'),
	request = require('request'),
	activity = require('./statistics.server.controller');
var	tip = require('./tips.server.controller.js');
	// Glucose = mongoose.model('Glucose'),
 //    async = require('async');


//add Initial Tips sendPostRequest middleware
var server_url = 'http://localhost:30001';

var sendPostRequest = function(url, postData, callback){
	// console.log(url);
	var dest_url = server_url+url;
	request.post(
			dest_url, postData,
			function (error, response, body) {
					if (!error && response.statusCode === 200) {
						// console.log(body);
						callback(error, response, body);
					}else{
						console.log('post request to '+url+' failed');
						callback(error, response, body);
					}
			}
	);
};
//Add Initial Tips
var addInitialTips = function(userID, callback){
	//var url = '/tipsgenerator/new';

	//sendPostRequest(url, {form:{user:userID}}, function(error, response, body){
	//	callback(error, response, body);
	//});
};

/**
 * Update user details
 */

function updateBMI(user) {
	if(user.height && user.weight) {
		user.bmi = (user.weight)/(user.height*user.height/10000);
		user.bmi = user.bmi.toFixed(1);
	}
}

// function updateLoginTime(user) {
// 	var conditions = {}
// }

exports.update = function(req, res) {
	// Init Variables
//	var user = req.user;
	var xml = req.body.Profile;
	var parseString = require('xml2js').parseString;

	var toLowerCase = function (name){
		if(name === 'DOB' || name === 'BMI') {
			return name.toLowerCase();
		} else {
			return name.charAt(0).toLowerCase() + name.slice(1);
		}
	};

	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function (err, result) {

		if(err || !result || !result.profile) {
			console.log('update user profile error.');
			return res.status(400).send({
				message: 'Failed to update user profile.'
			});
		}
		// console.log(result);
		if(result.profile.organizationCode) {
			result.profile.accessCode = result.profile.organizationCode.toLowerCase();
		}
		if(result.profile.accessCode) {
			result.profile.accessCode = result.profile.accessCode.toLowerCase();
		}

		delete result.profile._id;

		//if(!result.profile.bmi) {
		//	//if there is no bmi info in the request,
		//	//then bmi should be updated
		//	updateBMI(result.profile);
		//}
		result.profile.lastLoginTime = Date.now();
		result.profile.updatedTime = Date.now();

		User.findById(result.profile.userID, function(err, origin_user) {
			if(err) {
				console.log('update user profile error.');
				return res.status(400).send({
						message: 'Failed to update user profile.'
					});
			}
			else {
				// console.log(origin_user);
				User.findByIdAndUpdate(result.profile.userID, result.profile, null, function(err, user) {
					if(err) {
						console.log('update user profile error.');
						return res.status(400).send({
								message: 'Failed to update user profile.'
							});
					}
					else {
						activity.saveUserActivity(user.userID, 'update profile', req);
						// TODO: find the return value for client.
						// console.log(result.profile,result.profile.accessCode, origin_user.accessCode);
						if(result.profile.accessCode && origin_user.accessCode !== 'gg-dpp' && result.profile.accessCode === 'gg-dpp'){
							request.post(
									'http://localhost:30005/tipsgenerator/accesscode/ggdpp', {
										form: {
											user: user.userID,
											accesscode : 'gg-dpp'
										}
									},
									function (error, response, body) {
											if (!error && response.statusCode === 200) {
													// console.log('Push notification for GCM sending success');
													return 'Instant tips for cac sending success';
											}else{
												if(error){
													console.error('Instant tips for cac sending failed: ', error.message);
												}
												return 'Instant tips for cac sending failed';
											}
									}
							);
						}
						console.log('update user profile success.');
						UserProfileController.updateTargetCalories(result.profile.userID, result.profile);
						res.end('Initial Registration Success');

					}
				});
			}
		});
	});

};

function cleanupRegistrationID(user) {
	if(user.registrationID) {

		User.find({
				registrationID: user.registrationID,
				userID: {$ne: user.userID}
			},
			function (err, userList) {
				userList.forEach(function (logOutedUser) {
					console.log('user ' + logOutedUser.email + ' registrationID updated.');
					logOutedUser.registrationID = undefined;
					logOutedUser.save();
				});
			});
	}
}

function appSignup(req, res, loginInfo) {
	//console.log(loginInfo);

	if(!loginInfo || !loginInfo.email || !loginInfo.password || !loginInfo.deviceType ) {
		console.log('sign up Info is not valid.');
		return res.end('Email and password do not match');
	}

	delete loginInfo.roles;
	var user = new User(loginInfo);
	//if(!user.bmi) {
	//	//if there is no bmi info in the request,
	//	//then bmi should be updated
	//	updateBMI(user);
	//}

	// Add missing user fields
	user.provider = 'local';
	user.userName = user.email;
	user.userID = user._id;
	user.encryptPassword();


	// Then save the user
	user.save(function(err) {
		if (err) {
			console.log(err);
			return res.status(400).end('Account already exists');
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;
			user._id = undefined;
			user.__v = undefined;

			var returnedProfile ={
				'userID': user.userID
			};
			var xml = genXmlOutput('Profile',returnedProfile);

			res.end(xml);

			if(loginInfo.registrationID) {
				cleanupRegistrationID(user);
			}
			UserProfileController.updateTargetCalories(user.userID, user);
			//// add initial tips
			tip.createSignUpTips(user.userID);
			activity.saveUserActivity(user.userID, 'sign up', req);
			//emailVerification.sendVerificationEmail(req, res);
		}
	});
}


function appSignin(req, res, loginInfo) {

	if(!loginInfo || !loginInfo.email || !loginInfo.password || !loginInfo.deviceType ) {
		console.log('loginInfo is not valid.');
		return res.end('Email and password do not match');
	}

	User.findOne({ userName: loginInfo.email },
		{
			userID: 1,
			password: 1,
			salt: 1,
			height: 1,
			weight: 1,
			gender: 1,
			dob: 1,
			waistSize: 1,
			lastName: 1,
			firstName: 1,
			accessCode: 1,
			bmi: 1,
			measureUnit: 1,
			bGUnit: 1,
			updatedTime: 1,
			targetCalories:1,
			registrationTime: 1,
			conditions: 1,
			ethnicity: 1,
			mealDistribution: 1,
			appID:1,
			language:1,
			sponsorUID:1
		},
		function (err, user) {
			if (err) {
				return res.status(400).end('Email and password do not match');
			}

			if (!user) {
				return res.status(400).end('Email and password do not match');
			}

			if (!user.authenticate(loginInfo.password)) {
				return res.end('Email and password do not match');
			}

			user.lastLoginTime = Date.now();
			user.registrationID = loginInfo.registrationID;
			user.deviceType = loginInfo.deviceType;
			user.language = loginInfo.language;

			if(loginInfo.appID) {
				user.appID = loginInfo.appID;
			}


			user.save(function(err) {
				if(err) {
					console.log('Save user profile failed.');
					res.status(400).send('Email and password do not match');
				} else {
					user.password = undefined;
					user.salt = undefined;
					user._id = undefined;
					user.__v = undefined;
					user.provider = undefined;
					user.lastLoginTime = undefined;

					var xml = genXmlOutput('Profile',user);
					res.end(xml);
					cleanupRegistrationID(user);
					activity.saveUserActivity(user.userID, 'sign in',req);
					console.log('User: ' + loginInfo.email + ' logged in.');

				}
			});
	});
}

/**
 * App Signup/Signin
 */
exports.authenticate = function(req, res) {
	// For security measurement we remove the roles from the req.body object
	var xml = req.body.LoginInfo;
	var parseString = require('xml2js').parseString;

	var toLowerCase = function (name){
		return name.charAt(0).toLowerCase() + name.slice(1);
	};

	if (!xml) {
		return res.status(400).send('Invalid login information');
	}
	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function (err, result) {
		if(err || !result.loginInfo || !result.loginInfo.loginType) {
			// TODO: find better return value for client.
			return res.end('Email and password do not match');
		}
		if(result.loginInfo.loginType === '0') {
			appSignup(req, res, result.loginInfo);
			req.body.userName = result.loginInfo.email;
		} else if (result.loginInfo.loginType === '1') { // App user log in.
			appSignin(req, res, result.loginInfo);
		}
	});
};
