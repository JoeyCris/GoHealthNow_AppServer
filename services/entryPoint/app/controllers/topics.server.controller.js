'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	config = require('../../config/config'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Topic = mongoose.model('Topic'),
	Question = mongoose.model('Question'),
	_ = require('lodash'),
	sendEmail = require('../utils/sendEmail.js'),
	sendPush = require('../utils/sendPush.js');

var appName = config.app.title;
/**
 * Create a topic
 */
exports.create = function(req, res) {
	var topic = new Topic(req.body);
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
					var subject = 'You have a new advice from '+appName+'.';
					res.render('templates/topics-notification-email', {
						topic: topic
					}, function(err, innerContent) {
						sendEmail(req,res,user,subject,innerContent);
					});
				}
			});
			res.json(topic);
		}
	});
};


/**
 * Show the current topic
 */
exports.read = function(req, res) {
	res.json(req.topic);
};

/**
 * Update a topic
 */
exports.update = function(req, res) {
	var topic = req.topic;
	//console.log(topic);
	topic = _.extend(topic, req.body);
	//console.log(topic+' '+req.body);
	topic.save(function(err) {
		if (err) {
			console.log('Error in Topics.update: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topic);
		}
	});
};

/**
 * Delete a topic
 */
exports.delete = function(req, res) {
	var topic = req.topic;

	topic.remove(function(err) {
		if (err) {
			console.log('Error in Topics.delete: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topic);
		}
	});
};

/**
 * List of Topics
 */
exports.list = function(req, res) {
	// console.log(req);
	var query = Topic.find().sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email');
	if(req.query.currentPage && req.query.numPerPage){
		var currentPage = Number(req.query.currentPage);
		var numPerPage = Number(req.query.numPerPage);
		query = query.skip(currentPage-1).limit(numPerPage);
	}

	query.exec(function(err, topics) {
		if (err) {
			console.log('Error in Topics.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topics);
		}
	});
};

/** count how items altogether **/
exports.count = function(req, res) {
	Topic.count(function(err, count) {
		if(err) {
			console.log('In topics.server.ctrl:count: error to count:', err.message);
			res.status(400).send('Failed to count page number');
		} else {
			res.send({count: count});
		}
	});
};

/**
 * List of Topics by User;
 */
exports.listByUser = function(req, res) {
	// console.log(req);
	Topic.find({user:req.topicUser.userID}).sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, topics) {
		if (err) {
			console.log('Error in Topics.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topics);
		}
	});
};

/**
 * List of Topics by User;
 */
exports.listByTypeForOneUser = function(req, res) {
	// console.log(req);
	Topic.find({user:req.topicUser.userID, type : req.topicType/*, creator:req.user.userID*/}).sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, topics) {
		if (err) {
			console.log('Error in Topics.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topics);
		}
	});
};

/**
 * List of topic types
 */
exports.listTypes = function(req, res) {
	res.json(Topic.schema.path('type').enumValues);
};

/**
 * List of topics by type
 */
exports.listByType = function(req, res) {
	var currentPage = 1;
	var numPerPage = 100;
	if(req.query.currentPage){
		currentPage = Number(req.query.currentPage);
	}
	if(req.query.numPerPage){
		numPerPage = Number(req.query.numPerPage);
	}
	var topicType = req.topicType;
	// console.log(topicType);
	Topic.find({type : topicType, creator:req.user.userID}).populate('user', 'userID email').sort('-update_time').skip(numPerPage*(currentPage-1)).populate('creator', 'userID email').limit(numPerPage).exec(function(err, topics) {
		if (err) {
			console.log('Error in Topics.listByType: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topics);
		}
	});
};

exports.countByType = function(req, res) {
	var topicType = req.topicType;
	Topic.count({type: topicType, creator:req.user.userID}, function(err, count) {
		if(err) {
			console.log('Cannot count topic by type: ', topicType);
			res.status(400).send({message: err.message});
		} else {
			res.send({count: count});
		}
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
			console.log('Error in Topics.userById: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			req.topicUser = user;
			// console.log(user);
			next();
		}
	});
};

/**
 * Topic Type middleware
 */
exports.typeById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	var types = Topic.schema.path('type').enumValues;
	req.topicType = types[id];
	//console.log(types[id]);
	next();
};

/**
 * Topic middleware
 */
exports.topicByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Topic is invalid'
		});
	}

	Topic.findById(id).populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, org_topic) {
		if (err) return next(err);
		if (!org_topic) {
			console.log('Error in Topics.topicByID: ', err.message);
			return res.status(404).send({
				message: 'Topic not found'
			});
		}
		var ops = [
			{ path: 'reference', model: org_topic.referenceType},
      { path: 'comments.user', select: 'userID email', model: 'User'  },
			{ path: 'reference.userID', select: 'userID email', model: 'User' }
		];
		Topic.populate(org_topic, ops, function(err,topic){
			// console.log(topic);
			req.topic = topic;
			next();
		});
		// var topic = org_topic.toObject();
		// var comments = topic.comments;
		// for(var comment in comments){
		// 	var comment_userid = comment.user;
		// 	User.findById(comment_userid,'_id email').exec(function(err,user){
		// 		comment.user = user;
		// 	});
		// }
		// topic.comments = comments;
		// var reference = topic.reference;
		// User.findById(reference.userID,'_id email').exec(function(err,user){
		// 	reference.userID = user;
		// });
		// topic.reference = reference;
		// req.topic = topic;

	});
};

/**
 * Topic authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

	if (req.topic.creator.userID !== req.user.userID) {
		//console.log('Error in Topics.hasAuthorization');
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
