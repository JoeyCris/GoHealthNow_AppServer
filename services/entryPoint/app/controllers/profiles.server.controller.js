/**
 * Created by nodejs on 20/04/15.
 */
'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Rms = require('../utils/rms.js'),

	genXmlOutput =  require('../utils/genxmloutput.js'),
	_ = require('lodash');

var profileFields = {
	userID: 1,
	height: 1,
	weight: 1,
	gender: 1,
	dob: 1,
	waistSize: 1,
	lastName: 1,
	firstName: 1,
	email:1,
	accessCode: 1,
	bmi: 1,
	measureUnit: 1,
	bGUnit: 1,
	updatedTime: 1,
	targetCalories:1,
	registrationTime: 1,
	conditions: 1,
	ethnicity: 1,
	language:1,
	appID:1,
	mealDistribution: 1
};

/**
 * List of Users
 */
exports.listAll = function(req, res) {

	User.find({}, profileFields).sort({lastLoginTime: 1}).exec(function(err, users) {
		//console.log(users);
		if (err) {
			console.log('Error in Profiles.listAll: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(users);
		}
	});
};

exports.listAccessCodes = function(req, res) {

	User.distinct('accessCode').exec(function(err, codes) {
		//console.log(users);
		if (err) {
			console.log('Error in Profiles.listAccessCodes: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(codes);
		}
	});
};

exports.listByAccessCode = function(req, res) {
	User.find({accessCode:req.accessCode}, profileFields).sort({lastLoginTime: 1}).exec(function(err, users) {
		//console.log(users);
		if (err) {
			console.log('Error in Profiles.listByAccessCode: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(users);
		}
	});
};

exports.listByAccessCodes = function(req, res) {

	var accessCodes = [];
	// console.log(req.body.accesscodes);

	(req.body.accesscodes).forEach(function(element,index,array){
		accessCodes.push(element.accesscode);
	});
	// console.log(accessCodes);
	User.find({accessCode:{$in:accessCodes}}, profileFields).sort({lastLoginTime: 1}).exec(function(err, users) {
		//  console.log(users);
		if (err) {
			console.log('Error in Profiles.listByAccessCodes: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(users);
		}
	});
};

exports.listProfileForEmail = function(req, res){
	var conditions = {email:/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, $nor: [{email:/test.com/i},{email:/glucoguide.com/i},{email:/gg.com/i},{email:/ios.com/i}]};
	User.find(conditions, profileFields).sort({lastLoginTime: 1}).exec(function(err, users) {
		//console.log(users);
		if (err) {
			console.log('Error in Profiles.listProfileForEmail: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(users);
		}
	});
};

exports.setActivityLevel = function(req, res){

	console.log(JSON.stringify(req.body));
	User.findOneAndUpdate({userID: mongoose.Types.ObjectId(req.body.userID)}, {
		$set:{
			activityLevel:req.body.activityLevel,
			targetCalories:req.body.targetCalories
		}
	},function(err, doc){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)});
		} else {
			res.json(doc);
		}

		console.log(doc);
	});


};

exports.getMetadata = function(req, res) {
	var userID = req.param('userID');

	var format = req.param('format') ? req.param('format') : 'xml';

	User.findOne({_id: mongoose.Types.ObjectId(userID)}, {
		_id:0,
		inputSelection:1,
		boundDevices:1
	},function(err, user){
		if(err){
			console.log(JSON.stringify(err));

			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)});
		} else {

			var json = {};

			if(user) {

				json.inputSelections = user.inputSelection;
				//boundDevices:user.boundDevices
			} else {
				console.log('cannot find user. id:' + userID);
			}


			if(format === 'xml') {
				var xml = genXmlOutput('Metadata',json);
				res.end(xml);
			} else {
				res.json({metadata:json});
			}



		}
	});
};

exports.setInputSelection = function(req, res) {
	//var xml = req.body.InputSelection;

	var xml = req.param('InputSelection');



	var parseString = require('xml2js').parseString;

	var toLowerCase = function (name){
		return name.charAt(0).toLowerCase() + name.slice(1);
	};


	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function (err, result) {
		if (err) {
			console.log('Failed to parse string to xml, invalid xml', err.message);
			// TODO: better return value for client
			return res.status(400).send('Invalid XML');
		}

		if (!result || !result.inputSelection) {
			console.log('Failed to get selection informationl, invalid xml');
			// TODO: better return value for client
			return res.status(400).send('Invalid XML');
		}
		else {
			var userID = result.inputSelection.userID;

			User.findOneAndUpdate({userID: new mongoose.Types.ObjectId(userID)}, {
				$set:{
					inputSelection:result.inputSelection.selections
				}
			},function(err, doc){
				if(err){
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)});
				} else {
					//res.json(doc);

					res.send(genXmlOutput('InputSelection',{result:'success'}, { 'pretty': false, 'indent': '', 'newline': '' }));

				}

				//console.log(doc);
			});
		}

	});
};



exports.getActivityLevel = function(req, res){

	//console.log(JSON.stringify(req.param('userID')));
	User.findOne({_id: mongoose.Types.ObjectId(req.param('userID'))}, {
	//User.findOne({userID: req.param('userID') }, {
		_id:0,

		activityLevel:1,
		targetCalories:1
	},function(err, user){
		if(err){
			console.log(JSON.stringify(err));

			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)});
		} else {



			//console.log(JSON.stringify(user));

			var xml = genXmlOutput('Profile',{
				activityLevel: user.activityLevel
				//targetCalories: user.targetCalories.toFixed(0)
			});
			res.end(xml);
		}

		console.log(user);
	});


};

exports.list = function(req, res) {

	//User.find({}, profileFields).sort({lastLoginTime: 1}).exec(function(err, users) {
	//	//console.log(users);
	//	if (err) {
	//		return res.status(400).send({
	//			message: errorHandler.getErrorMessage(err)
	//		});
	//	} else {
	//		res.json(users);
	//	}
	//});

	var user = req.user;
	if(typeof user === 'undefined' || !user) {
		console.log('Error in Profles.list: User Not Login, Cannot List User\'s Detail');
		return res.status(400).json({message: 'User Not Login'});
	}
	Rms.getUserListInDetail(user, function(err, users) {
		if (err) {
			console.log('Error in Profiles.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(users);
		}
	});
};

exports.listWithLimit = function(req, res) {

	//User.find({}, profileFields).sort({lastLoginTime: 1}).exec(function(err, users) {
	//	//console.log(users);
	//	if (err) {
	//		return res.status(400).send({
	//			message: errorHandler.getErrorMessage(err)
	//		});
	//	} else {
	//		res.json(users);
	//	}
	//});

	var user = req.user;
	if(typeof user === 'undefined' || !user) {
		console.log('Error in Profles.list: User Not Login, Cannot List User\'s Detail');
		return res.status(400).json({message: 'User Not Login'});
	}
	Rms.getLimitedUserList(user, 250, function(err, users) {
		if (err) {
			console.log('Error in Profiles.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(users);
		}
	});
};
/**
 * TODO judge for demo User
 */
// exports.isDemoUser = function(req, res) {
//
// 	User.find({}, profileFields).exec(function(err, users) {
// 		//console.log(users);
// 		if (err) {
// 			return res.status(400).send({
// 				message: errorHandler.getErrorMessage(err)
// 			});
// 		} else {
// 			res.json(users);
// 		}
// 	});
// };

/**
 * Show the current profile
 */
exports.read = function(req, res) {
	res.json(req.oneprofile);
};

/**
 * Profile middleware
 */
exports.profileByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('Error in Profiles.profileByID: ProfileId is invalid');
		return res.status(400).send({
			message: 'ProfileId is invalid'
		});
	}

	User.findById(id, profileFields).exec(function(err, profile) {
		if (err) return next(err);
		if (!profile) {
			console.log('Error in Profiles.profileByID: Profile not found');
			return res.status(404).send({
				message: 'Profile not found'
			});
		}
		req.oneprofile = profile;
		next();
	});
};

/**
 * Profile accessCode middleware
 */
exports.profileByAccessCode = function(req, res, next, code) {
	req.accessCode = code;
	next();
};

/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

};
