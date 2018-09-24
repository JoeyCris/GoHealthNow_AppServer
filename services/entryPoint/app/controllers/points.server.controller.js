'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Point = mongoose.model('Point'),
	Rms = require('../utils/rms.js'),
	_ = require('lodash'),
	sendEmail = require('../utils/sendEmail.js'),
	sendPush = require('../utils/sendPush.js');
var config = require('../../config/config');

/**
 * Create a point
 */
exports.create = function(req, res) {
	//console.log("create function point")
	var point = new Point(req.body);
	//topic.creator = req.user;


	point.save(function(err) {
		if (err) {
			console.log('Error in Point.create: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(point);
		}
	});
};

/**
 * Show the current point
 */
exports.read = function(req, res) {
	var point = req.point.toObject();
	res.json(point);

};

/**
 * Update a point
 */
exports.update = function(req, res) {
	//console.log("update");
	var point = req.point;
	//console.log(point);
	point = _.extend(point, req.body);
	//console.log(point+' '+req.body);
	point.save(function(err) {
		if (err) {
			console.log('Error in Point.update: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(point);
		}
	});
};

/**
 * Remove a point from dietitian view
 */
exports.remove = function(req, res) {
	var point = req.point;
	point.dietitianNotView = true;
	point.save(function(err) {
		if (err) {
			console.log('Error in Point.remove: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(point);
		}
	});
};

/**
 * Delete a point
 */
exports.delete = function(req, res) {
	var point = req.point;

	point.remove(function(err) {
		if (err) {
			console.log('Error in Point.delete: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(point);
		}
	});
};

/**
 * List of Points
 */
exports.list = function(req, res) {
	var user = req.user;
	Rms.getUserList(req.user, function(err, patients){
		if(err){
			console.log('Error in Point.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		var userList = [];
		patients.forEach(function(ele,array,index){
			userList.push(ele.userID);
		});
		Point.find({userID: {$in: userList}}).sort('-recordedTime').populate('userID', 'userID email').exec(function(err, points) {
			if (err) {
				console.log('Error in Point.list: ', err.message);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(points);
			}
		});
	});
};

/**
 * List of Points by user
 */
exports.listByUser = function(req, res) {
	console.log(req.pointUser.userID);
	Point.find({userID:req.pointUser.userID}).sort('-recordedTime').populate('userID', 'userID email').exec(function(err, points) {
		if (err) {
			console.log('Error in Point.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// console.log(points);
			res.json(points);
		}
	});
};

/**
 * List of point types
 */
exports.listTypes = function(req, res) {
	res.json(Point.schema.path('type').enumValues);
};

/**
 * List of point frequencies
 */
exports.listFrequencies = function(req, res) {
	res.json(Point.schema.path('frequency').enumValues);
};

/**
 * List of points by type
 */
exports.listByTypeAndFrequency = function(req, res) {
	var pointType = req.pointType;
	var pointFrequency = req.pointFrequency;
	var user = req.user;
	Rms.getUserList(req.user, function(err, patients){
		if(err){
			console.log('Error in Point.listByType: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		var userList = [];
		patients.forEach(function(ele,array,index){
			userList.push(ele.userID);
		});
		Point.find({type : pointType, frequency : pointFrequency, userID: {$in: userList}}).sort('-recordedTime').populate('userID', 'userID email accessCode').exec(function(err, points) {
			if (err) {
				console.log('Error in Point.listByType: ', err.message);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(points);
			}
		});
	});
};

/**
 * User Topic middleware
 */
exports.userById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
// console.log(id);
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
			console.log('Error in Point.userById: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			req.pointUser = user;
			// console.log(user);
			next();
		}
	});
};

/**
 * Point Type middleware
 */
exports.typeById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	var types = Point.schema.path('type').enumValues;
	req.pointType = types[id];
	//console.log(types[id]);
	next();
};

/**
 * Point Frequency middleware
 */
exports.frequencyById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	var frequencies = Point.schema.path('frequency').enumValues;
	req.pointFrequency = frequencies[id];
	//console.log(types[id]);
	next();
};

/**
 * Point middleware
 */
exports.pointByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('Error in Point.pointByID: PointId is invalid');
		return res.status(400).send({
			message: 'PointId is invalid'
		});
	}

	Point.findById(id).populate('userID', 'userID email').exec(function(err, point) {
		if (err) return next(err);
		if (!point) {
			console.log('Error in Point.pointByID: Point not found');
			return res.status(404).send({
				message: 'Point not found'
			});
		}
		req.point = point;
		next();
	});
};

/**
 * Point authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.point.userID.userID !== req.user.userID) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
