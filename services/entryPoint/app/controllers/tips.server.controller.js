'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	config = require('../../config/config'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Topic = mongoose.model('Topic'),
	Knowledge = mongoose.model('Knowledge'),
	Question = mongoose.model('Question'),
	_ = require('lodash'),
	sendEmail = require('../utils/sendEmail.js'),
	sendPush = require('../utils/sendPush.js');

var	knowledgeCtrl = require('./knowledge.server.controller.js');
var appName = config.app.title;

/**
 * Create a tip
 */
exports.createTip = function(req, res) {
	var topic = new Topic(req.body);
	topic.type='tip';
	console.log(topic);
	topic.save(function(err) {
		if (err) {
			console.log('In tips.server.controller: createTip, ', 'Failed to save tip: ',err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(topic);
		}
	});
};

/**
 * Create a tip
 */
exports.createTipByTemplate = function(req, res) {
	var topic = new Topic(req.body);
	var knowledge = req.knowledge;
	topic.description = req.body.description;
	topic.signature = appName;
	topic.medias = knowledge.medias;
	topic.link = knowledge.link;
	// topic.reference = req.body.reference;
	// topic.reference = req.body.reference;
	if(knowledge.type === 'report'){
		topic.type='report';
	}else{
		topic.type='tip';
	}
	// console.log(knowledge);
	// console.log(topic);
	topic.save(function(err) {
		if (err) {
			console.log('In tips.server.controller: createTipByTemplate, ', 'Failed to save tip: ',err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var returnMessage;
			//console.log(topic);
			User.findById(topic.user, function(err, user){
					if(knowledge.send_push){
						//send push notification
						console.log('In tips.server.controller: createTipByTemplate, ', 'SendPush: ',sendPush(res, user, topic.description));
					}
					if(knowledge.send_email){
						//send email
						var baseUrl = 'https://' + req.headers.host;
						var medias = topic.medias;
						if(medias){
							medias.forEach(function(media){
								media.uri =  baseUrl + '/' + media.uri;
							});
						}
						var subject = 'You have a new message from '+appName+'.';
						if(user.language === 1){
							subject = 'Vous avez un nouveau conseil de '+appName+'.';
							res.render('templates/les-sujets-notification-email', {
								topic: topic
							}, function(err, innerContent) {
									sendEmail(req,res,user,subject,innerContent);
							});
						}else{
							res.render('templates/topics-notification-email', {
								topic: topic
							}, function(err, innerContent) {
									sendEmail(req,res,user,subject,innerContent);
							});
						}
					}
			});

			res.json(topic);
		}
	});
};

/**
 * Create tips for new user
 */
exports.createSignUpTips = function(userID) {

	if(! mongoose.Types.ObjectId.isValid(userID)) {
		console.log('In tips.server.controller: createSignUpTips, ', 'Invalid userID');
		return;
	}
	User.findById(userID, function(err, user){
		var language = 'en';
		if(user.language === 1){
			language='fr';
		}
		var appID = 'GG';
		if(user.appID === 1){
			appID='GH';
		}
		Knowledge.find({type:'new',$or:[{$and:[{title:{$regex:language+'$',$options:'i'}},{title:{$regex:'^'+appID,$options:'i'}}]},{title:{$regex:'Tip$',$options:'i'}}]}).sort('-create_time').exec(function(err, knowledges) {
			if (err) {
				console.log('In tips.server.controller: createSignUpTips, ', 'Failed to find knowledge',errorHandler.getErrorMessage(err));
			} else {
				var initialCount = 0;
				knowledges.forEach(function (knowledge) {
					var topic = new Topic();

					topic.user = userID;
					topic.creator = '559d7eee1f1f2c42758f5bc4';
					topic.signature = appName;
					topic.description = knowledge.content;
					if(user.language === 1 && knowledge.contenu !== ''){
						topic.description = knowledge.contenu;
					}
					topic.medias = knowledge.medias;
					topic.link = knowledge.link;
					if(initialCount>=6){
						var targetDate = new Date();
						// console.log(targetDate);
						targetDate.setDate(targetDate.getDate()+Math.floor((initialCount+1)/2)-1);
						targetDate.setHours(1);
						targetDate.setMinutes(0);
						targetDate.setSeconds(0);
						// console.log(targetDate);
						topic.create_time = targetDate;
						topic.update_time = topic.create_time;
						topic.type = 'tip';
						// topic.type = 'instruction';
					// }else if(initialCount === 3){
					// 	var targetDate2 = new Date();
					// 	// console.log(targetDate);
					// 	// targetDate.setHours(targetDate.getDate()+Math.floor((initialCount+1)/2)-1);
					// 	targetDate2.setHours(targetDate2.getHours()+2);
					// 	// targetDate.setMinutes(0);
					// 	// targetDate.setSeconds(0);
					// 	// console.log(targetDate);
					// 	topic.create_time = targetDate2;
					// 	topic.update_time = topic.create_time;
					// 	topic.type = 'tip';
					}else{
						topic.type = 'tip';
					}
					topic.save(function (err) {
						if (err) {
							console.error('In tips.server.controller: createSignUpTips, ', errorHandler.getErrorMessage(err));
						}
					});
					initialCount+=1;
				});
			}
		});
	});
};

/**
 * Create a tip by knowledge
 */
exports.createKnowledgeTip = function(req, res) {
	var topic = new Topic(req.body);
	var knowledge = req.knowledge;
	User.findById(topic.user, function(err, user){
		topic.description = knowledge.content;
		if(user.language === 1 && knowledge.contenu !== ''){
			topic.description = knowledge.contenu;
		}
		topic.signature = appName;
		topic.medias = knowledge.medias;
		topic.link = knowledge.link;
		topic.type='tip';
		topic.save(function(err) {
			if (err) {
				//console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var returnMessage;
				//console.log(topic);

				if(knowledge.send_push){
					//send push notification
					console.log('In tips.server.controller: createSignUpTips, ', 'SendPush: ',sendPush(res, user, topic.description));
				}
				if(knowledge.send_email){
					//send email
					var baseUrl = 'https://' + req.headers.host;
					var medias = topic.medias;
					if(medias){
						medias.forEach(function(media){
							media.uri =  baseUrl + '/' + media.uri;
						});
					}
					var subject = 'You have a new advice from '+appName+'.';
					if(user.language === 1){
						subject = 'Vous avez un nouveau conseil de '+appName+'.';
						res.render('templates/les-sujets-notification-email', {
							topic: topic
						}, function(err, innerContent) {
								sendEmail(req,res,user,subject,innerContent);
						});
					}else{
						res.render('templates/topics-notification-email', {
							topic: topic
						}, function(err, innerContent) {
								sendEmail(req,res,user,subject,innerContent);
						});
					}

				}

				res.json(topic);
			}
		});
	});
};


/**
 * Tip middleware
 */
exports.topicByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Topic is invalid'
		});
	}

	Topic.findById(id).populate('user', 'userID email').exec(function(err, topic) {
		if (err) return next(err);
		if (!topic) {
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
