/**
 * Created by Canon on 2016-03-31.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Dietnote = mongoose.model('Dietnote'),
	_ = require('lodash');

/**
 * Create a note
 */
exports.create = function(req, res) {
	var note = new Dietnote(req.body);
	note.save(function(err) {
		if (err) {
			//console.log(err);
			console.log('Error in Topics.create: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// User.findById(note.user, function(err, user){
			// 	if(req.body.send_push){
			// 		sendPush(res, user, topic.description);
			// 	}
			// 	if(req.body.send_email){
			// 		//send email
			// 		var subject = 'You have a new advice from GlucoGuide.';
			// 		res.render('templates/topics-notification-email', {
			// 			topic: topic
			// 		}, function(err, innerContent) {
			// 			sendEmail(req,res,user,subject,innerContent);
			// 		});
			// 	}
			// });
			res.json(note);
		}
	});
};

/**
 * Show the current note
 */
exports.read = function(req, res) {
	res.json(req.note);
};

/**
 * Update a note
 */
exports.update = function(req, res) {
	var note = req.note;
	console.log(note);
	note = _.extend(note, req.body);
	console.log(note+' '+req.body);
	note.save(function(err) {
		if (err) {
			console.log('Error in Topics.update: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(note);
		}
	});
};

/**
 * Delete a note
 */
exports.delete = function(req, res) {
	var note = req.note;

	note.remove(function(err) {
		if (err) {
			console.log('Error in Topics.delete: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(note);
		}
	});
};

/**
 * List of Topics
 */
exports.list = function(req, res) {
	// console.log(req);
	var query = Dietnote.find().sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email');
	if(req.query.currentPage && req.query.numPerPage){
		var currentPage = Number(req.query.currentPage);
		var numPerPage = Number(req.query.numPerPage);
		query = query.skip(currentPage-1).limit(numPerPage);
	}

	query.exec(function(err, notes) {
		if (err) {
			console.log('Error in Notes.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(notes);
		}
	});
};

/** count how items altogether **/
exports.count = function(req, res) {
	Dietnote.count(function(err, count) {
		if(err) {
			console.log('In notes.server.ctrl:count: error to count:', err.message);
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
	Dietnote.find({user:req.topicUser.userID}).sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, notes) {
		if (err) {
			console.log('Error in Note.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(notes);
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
			req.noteUser = user;
			// console.log(user);
			next();
		}
	});
};


/**
 * Topic middleware
 */
exports.noteByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Topic is invalid'
		});
	}
	console.log(id);

	Dietnote.findById(id).populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, org_topic) {
		if (err) return next(err);
		if (!org_topic) {
			console.log('Error in Notes.topicByID: ', err.message);
			return res.status(404).send({
				message: 'Note not found'
			});
		}
		req.note = org_topic;
		next();
		// var ops = [
		// 	{ path: 'reference', model: org_topic.referenceType},
		// 	{ path: 'comments.user', select: 'userID email', model: 'User'  },
		// 	{ path: 'reference.userID', select: 'userID email', model: 'User' }
		// ];
		// Topic.populate(org_topic, ops, function(err,topic){
		// 	req.topic = topic;
		// 	next();
		// });

	});
};

/**
 * Topic authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

	// if (req.note.creator.userID !== req.user.userID) {
	// 	//console.log('Error in Topics.hasAuthorization');
	// 	return res.status(403).send({
	// 		message: 'User is not authorized'
	// 	});
	// }
	next();
};
