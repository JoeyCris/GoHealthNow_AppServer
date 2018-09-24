'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Topic = mongoose.model('Topic'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a comment
 */
exports.create = function(req, res) {
	var topic = req.topic;
	var comment = {user:req.user.userID,content:req.body.content};
	console.log('In comments.server.ctrl: create: req.user: ',req.user);
	var len = topic.comments.push(comment);
	//console.log(topic);

	topic.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topic.comments[len-1]);
		}
	});
};


/**
 * Update a comment
 */
exports.update = function(req, res) {
	var topic = req.topic;
	var comment  = topic.comments.id(req.comment._id);

	//comment.content = req.comment.content;
	//console.log(topic+' '+req.body.content);
	comment.content = req.body.content;//= _.extend(comment.content, req.body.content);
	//console.log(topic+' '+req.body.content);
	topic.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(comment);
		}
	});
};

/**
 * Delete a comment
 */
exports.delete = function(req, res) {
	var topic = req.topic;
 	topic.comments.id(req.comment._id).remove();

	topic.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topic);
		}
	});
};

/**
 * Comment middleware
 */
exports.commentByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Comment is invalid'
		});
	}

	var topic = req.topic;
	var comment = topic.comments.id(id).populate('user','displayName');


	if (!comment) {
		return res.status(404).send({
			message: 'Comment not found'
		});
	}
	req.comment = comment;
	//console.log(req.comment.user.id+' '+req.user.id);
	next();
};

/**
 * Comment authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	User.findById(req.comment.user).exec(function(err , user){
		if(err){
			return res.status(400).send({
				message: 'user of comment is invalid'
			});
		}else{
			if (user.userID !== req.user.userID) {
				//console.log(user.id+' '+req.user.id);
				return res.status(403).send({
					message: 'User is not authorized'
				});
			}
			next();
		}
	});


};
