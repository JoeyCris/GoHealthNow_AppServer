'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Reminder = mongoose.model('Topic'),
	_ = require('lodash'),
	sendEmail = require('../utils/sendEmail.js'),
	sendPush = require('../utils/sendPush.js');
var config = require('../../config/config');
/**
 * Create a reminder
 */

exports.createReminder = function(req, res) {

	console.log(JSON.stringify(req.body.userList));

	var users = [];
	if(req.body.userList && req.body.userList.length !== 0) {
		users = req.body.userList;
	} else if(req.body.user) {
		users = [req.body.user];
	} else {
		return res.status(400).send({
			message: 'user list cannot be empty'
		});
	}

	var len = users.length;

	users.forEach(function(userID, index) {
		var topic = new Reminder(req.body);
		topic.user = mongoose.Types.ObjectId(userID);


		topic.save(function(err) {
			if (err) {
				//console.log(err);
				console.log('Error in Topics.create: ', err.message);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				User.findById(topic.user, function(err, user){
					if(req.body.send_push){
						sendPush(res, user, topic.description);
					}
					if(req.body.send_email){
						//send email
						var subject = 'You have a new advice from ' + config.app.title;
						res.render('templates/topics-notification-email', {
							topic: topic
						}, function(err, innerContent) {
							sendEmail(req,res,user,subject,innerContent);
						});
					}
				});
				if(index === len - 1) {
					res.json(topic);
				}

			}
		});
	});

};
//exports.createReminder = function(req, res) {
//	// console.log(req.body);
//	var reminder = new Reminder(req.body);
//	// console.log(reminder);
//	reminder.save(function(err) {
//		if (err) {
//			//console.log(err);
//			return res.status(400).send({
//				message: errorHandler.getErrorMessage(err)
//			});
//		} else {
//			User.findById(reminder.user, function(err, user){
//				// console.log(req.send_push,req.send_email);
//				if(req.body.send_push){
//					console.log('send push notification');
//					sendPush(res, user, reminder.description);
//				}
//				if(req.body.send_email){
//					//send email
//					var baseUrl = 'https://' + req.headers.host;
//					var medias = reminder.medias;
//					if(medias){
//						medias.forEach(function(media){
//							media.uri =  baseUrl + '/' + media.uri;
//						});
//					}
//					console.log('send email');
//					var subject = 'You have a new advice from GlucoGuide.';
//					res.render('templates/topics-notification-email', {
//						topic: reminder
//					}, function(err, innerContent) {
//							sendEmail(req,res,user,subject,innerContent);
//					});
//				}
//				res.json(reminder);
//			});
//		}
//	});
//};

/**
 * Show the current reminder
 */
exports.read = function(req, res) {
	res.json(req.reminder);
};

/**
 * Update a reminder
 */
exports.update = function(req, res) {
	var reminder = req.reminder;
	//console.log(reminder);
	reminder = _.extend(reminder, req.body);
	//console.log(reminder+' '+req.body);
	reminder.save(function(err) {
		if (err) {
			console.log('Error in Reminder.update: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(reminder);
		}
	});
};

/**
 * Delete a reminder
 */
exports.delete = function(req, res) {
	var reminder = req.reminder;

	reminder.remove(function(err) {
		if (err) {
			console.log('Error in Reminder.delete: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(reminder);
		}
	});
};

/**
 * List of reminders
 */
exports.list = function(req, res) {
	// console.log(req);
	Reminder.find().sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, reminders) {
		if (err) {
			console.log('Error in Reminder.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(reminders);
		}
	});
};

/**
 * List of reminder by User;
 */
exports.listByUser = function(req, res) {
	// console.log(req);
	Reminder.find({user:req.reminderUser.userID}).sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, reminders) {
		if (err) {
			console.log('Error in Reminder.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(reminders);
		}
	});
};


/**
 * User reminder middleware
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
			console.log('Error in Reminder.userById: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			req.reminderUser = user;
			console.log(user);
			next();
		}
	});
};

/**
 * reminder middleware
 */
exports.reminderByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('Error in Reminder.reminderByID: ReminderId is invalid');
		return res.status(400).send({
			message: 'ReminderId is invalid'
		});
	}

	Reminder.findById(id).populate('user', 'userID email').populate('creator', 'userID email').populate('reference').exec(function(err, org_reminder) {
		if (err) return next(err);
		if (!org_reminder) {
			console.log('Error in Reminder.reminderByID: Reminder not found');
			return res.status(404).send({
				message: 'Reminder not found'
			});
		}
		var ops = [
      { path: 'comments.user', select: 'userID email', model: 'User'  },
			{ path: 'reference.userID', select: 'userID email', model: 'User' }
		];
		Reminder.populate(org_reminder, ops, function(err,reminder){
			//console.log(reminder);
			req.reminder = reminder;
			next();
		});
		// var reminder = org_reminder.toObject();
		// var comments = reminder.comments;
		// for(var comment in comments){
		// 	var comment_userid = comment.user;
		// 	User.findById(comment_userid,'_id email').exec(function(err,user){
		// 		comment.user = user;
		// 	});
		// }
		// reminder.comments = comments;
		// var reference = reminder.reference;
		// User.findById(reference.userID,'_id email').exec(function(err,user){
		// 	reference.userID = user;
		// });
		// reminder.reference = reference;
		// req.reminder = reminder;

	});
};

/**
 * Reminder authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

	if (req.reminder.creator.userID !== req.user.userID) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
