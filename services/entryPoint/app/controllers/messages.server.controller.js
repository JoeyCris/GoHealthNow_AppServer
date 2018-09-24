'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Topic = mongoose.model('Topic'),
	Question = mongoose.model('Question'),
	_ = require('lodash'),
	sendEmail = require('../utils/sendEmail.js'),
	sendPush = require('../utils/sendPush.js');

/**
 * Create an message
 */
exports.createMessage = function(req, res) {
	var topic = new Topic(req.body);
	topic.type='message';
	topic.save(function(err) {
		if (err) {
			//console.log(err);
			console.log('Error in Message.createMessage: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var returnMessage;
			//console.log(topic);
			User.findById(topic.user, function(err, user){
				//send push notification
				if(err){
					console.log('Error in Message.createMessage: ', err.message);
				}
				sendPush(res, user, topic.description);
			});
			res.json(topic);
		}
	});
};

/**
 * Topic middleware
 */
exports.topicByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('Error in Message.topicByID: TopicId is invalid');
		return res.status(400).send({
			message: 'TopicId is invalid'
		});
	}

	Topic.findById(id).populate('user', 'userID email').populate('creator', 'userID email').populate('reference').exec(function(err, topic) {
		if (err) return next(err);
		if (!topic) {
			console.log('Error in Message.createMessage: Topic not found');
			return res.status(404).send({
				message: 'Topic not found'
			});
		}
		req.topic = topic;
		next();
	});
};

/**
 * Topic authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.topic.creator.userID !== req.user.userID) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
