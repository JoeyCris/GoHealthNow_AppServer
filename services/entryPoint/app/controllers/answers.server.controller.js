'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	config = require('../../config/config'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Answer = mongoose.model('Topic'),
	Meal = mongoose.model('Meal'),
	Question = mongoose.model('Question'),
	_ = require('lodash'),
	sendEmail = require('../utils/sendEmail.js'),
	sendPush = require('../utils/sendPush.js');
var appName = config.app.title;
/**
 * Create an answer
 */
exports.createQuestionAnswer = function(req, res) {
	var answer = new Answer(req.body);
	answer.type='answer';
	answer.reference = req.question._id;
	answer.save(function(err) {
		if (err) {
			console.log(err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var returnMessage;
			User.findById(answer.user, function(err, user){
				Question.findById(answer.reference, function(err, question){
					//console.log(JSON.stringify(question));
					//increase question replytimes by 1
					if(!question.replyTimes){
						question.replyTimes=0;
					}
					question.replyTimes+=1;

					if(!question.questionContent) {
						question.questionContent = 'Audio Question';
					}

					question.save();
					var baseUrl = 'https://' + req.headers.host;
					var medias = question.medias;
					if(medias){
						medias.forEach(function(media){
							media.uri =  baseUrl + '/' + media.uri;
						});
					}
					medias = answer.medias;
					if(medias){
						medias.forEach(function(media){
							media.uri =  baseUrl + '/' + media.uri;
						});
					}

					//send push notification

					console.log('In answers.server.ctrl: createQuestionAnswer ', 'sendPush: ',sendPush(res, user, answer.description));
					//send email
					var subject = 'You have a new advice from '+appName+' for question you entered in \"Ask Experts\".';
					if(user.language === 1){
						subject = 'Vous avez un nouveau conseil de '+appName+' pour la question que vous avez saisie dans \"Ask Experts\".';
						res.render('templates/question-réponse-rappel-email', {
							question: question,
							answer: answer
						}, function(err, innerContent) {
								sendEmail(req,res,user,subject,innerContent);
						});
					}else{
						res.render('templates/question-reply-reminder-email', {
							question: question,
							answer: answer
						}, function(err, innerContent) {
								sendEmail(req,res,user,subject,innerContent);
						});
					}
					//send email to admins
					User.find({roles:'admin'}, function(err, users){

						users.forEach(function (element, index, array) {
							var user = element;
							console.log(user);
							//send email
							var subject = 'New Answer (' + user.accessCode + ')';
							console.log('In answers.server.ctrl: createQuestionAnswer ', 'question: ', question);
							res.render('templates/topics-add-reminder-email', {
								question: question,
								replyer: req.user,
								user: user,
								answer: answer
							}, function (err, innerContent) {
								//console.log(typeof innerContent);
								sendEmail(req, res, user, subject, innerContent);
							});
						});
					});
				});
			});
			res.json(answer);
		}
	});
};

exports.createMealAnswer = function(req, res) {
	var answer = new Answer(req.body);
	answer.type='answer';
	answer.reference = req.meal._id;
	answer.save(function(err) {
		if (err) {
			//console.log(err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var returnMessage;
			//console.log(topic);
			User.findById(answer.user, function(err, user){
				Meal.findById(answer.reference, function(err, meal){
					//increase meal replytimes by 1
					if(!meal.replyTimes){
						meal.replyTimes=0;
					}
					meal.replyTimes+=1;

					meal.save();
					// var baseUrl = 'https://' + req.headers.host;
					// var medias = question.medias;
					// if(medias){
					// 	medias.forEach(function(media){
					// 		media.uri =  baseUrl + '/' + media.uri;
					// 	});
					// }
					// //send push notification
					// console.log(sendPush(res, user, answer.description));
					// //send email
					// var subject = 'You have a new advice from GlucoGuide for question you entered in \"Ask Experts\".';
					// res.render('templates/question-reply-reminder-email', {
					// 	question: question
					// }, function(err, innerContent) {
					// 		sendEmail(req,res,user,subject,innerContent);
					// });
					// //send email to admins
					// User.find({roles:'admin'}, function(err, users){
					//
					// 	users.forEach(function(element,index,array){
					// 		var user = element;
					// 		console.log(user);
					// 		//send email
					// 		var subject = 'New Answer ('+ user.accessCode+')';
					// 		console.log(question);
					// 	  res.render('templates/topics-add-reminder-email', {
					// 			question: question,
					// 			replyer: req.user,
					// 			user: user,
					// 			answer: answer
					// 		}, function(err, innerContent) {
					// 			    console.log(typeof innerContent);
					// 					sendEmail(req,res,user,subject,innerContent);
					// 		});
					// 	});
					// });

				});
			});
			res.json(answer);
		}
	});
};


/**
 * Show the current answer
 */
exports.read = function(req, res) {
	res.json(req.answer);
};

/**
 * Update an answer
 */
exports.update = function(req, res) {
	var answer = req.answer;
	//console.log(topic);
	answer = _.extend(answer, req.body);
	//console.log(topic+' '+req.body);
	answer.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(answer);
		}
	});
};

/**
 * Delete an answer
 */
exports.delete = function(req, res) {
	var answer = req.answer;

	answer.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(answer);
		}
	});
};

/**
 * List of Answers
 */
exports.listAnswers = function(req, res) {
	Answer.find({type:'answers'}).sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, answers) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(answers);
		}
	});
};

/**
 * List of Answers
 */
exports.listQuestionAnswers = function(req, res) {
	Answer.find({type:'answers', reference: req.question._id}).sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, answers) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(answers);
		}
	});
};

/**
 * List of Answers
 */
exports.listMealAnswers = function(req, res) {
	Answer.find({type:'answers', reference: req.meal._id}).sort('-update_time').populate('user', 'userID email').populate('creator', 'userID email').exec(function(err, answers) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(answers);
		}
	});
};

/**
 * Answer middleware
 */
exports.answerByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Answer is invalid'
		});
	}

	Answer.findById(id).populate('user', 'userID email').populate('creator', 'userID email').populate('reference').exec(function(err, org_answer) {
		if (err) return next(err);
		if (!org_answer) {
			return res.status(404).send({
				message: 'Answer not found'
			});
		}
		var ops = [
			{path: 'comments.user', select: 'userID email', model: 'User'},
			{path: 'reference.userID', select: 'userID email', model: 'User'}
		];
		Answer.populate(org_answer, ops, function (err, answer) {
			req.answer = answer;
			next();
		});

	});
};

/**
 * Answer authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.answer.creator.userID !== req.user.userID) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
