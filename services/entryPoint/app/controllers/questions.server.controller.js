'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Question = mongoose.model('Question'),
	Topic = mongoose.model('Topic'),
	Rms = require('../utils/rms.js'),
	_ = require('lodash'),
	sendEmail = require('../utils/sendEmail.js'),
	sendPush = require('../utils/sendPush.js');
var config = require('../../config/config');

/**
 * Create a question
 */
exports.create = function(req, res) {
	//console.log("create function question")
	var question = new Question(req.body);
	//topic.creator = req.user;

	//console.log(req.body);

	question.save(function(err) {
		if (err) {
			//console.log(err);
			console.log('Error in Question.create: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//console.log("else");
			var returnMessage;
			User.find({roles:{$in:['dietitian','admin']}}, function(err, users){

				users.forEach(function(element,index,array){
					var user = element;
					var baseUrl = config.serverURL;
					// console.log(user);
					//send email
					var subject = 'New Question ('+ req.user.accessCode+')';
					var medias = question.medias;
					if(medias){
						medias.forEach(function(media){
							media.uri =  baseUrl + '/' + media.uri;
						});
					}
					// console.log(question);
				  res.render('templates/ask-question-reminder-email', {
						question: question,
						user: req.user,
						url: baseUrl + '/#!/questions'
					}, function(err, innerContent) {
						    // console.log(typeof innerContent);
								sendEmail(req,res,user,subject,innerContent);
					});
				});
			});
			res.json(question);
		}
	});
};

/**
 * Show the current question
 */
exports.read = function(req, res) {
	var question = req.question.toObject();
	var topics = Topic.find({reference:question._id}).populate('user', 'email').populate('creator', 'email').exec(function(err, topics){
		if(err){
			console.log('Error in Question.read: ', err.message);
			return res.status(400).send({
				message: 'No related topics'
			});
		}else{
			question.topics = topics;
			//console.log(question);
			res.json(question);
		}
	});

};

/**
 * Update a question
 */
exports.update = function(req, res) {
	//console.log("update");
	var question = req.question;
	//console.log(question);
	question = _.extend(question, req.body);
	//console.log(question+' '+req.body);
	question.save(function(err) {
		if (err) {
			console.log('Error in Question.update: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * Remove a question from dietitian view
 */
exports.remove = function(req, res) {
	var question = req.question;
	question.dietitianNotView = true;
	question.save(function(err) {
		if (err) {
			console.log('Error in Question.remove: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * Delete a question
 */
exports.delete = function(req, res) {
	var question = req.question;

	question.remove(function(err) {
		if (err) {
			console.log('Error in Question.delete: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * List of Questions
 */
exports.list = function(req, res) {
	var user = req.user;
	Rms.getUserList(req.user, function(err, patients){
		if(err){
			console.log('Error in Question.list: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		var userList = [];
		patients.forEach(function(ele,array,index){
			userList.push(ele.userID);
		});

		Question.find({
			userID: {$in: userList},  $or:[{dietitianNotView:{$exists: false}},{dietitianNotView:false}]
		}).sort('-recordedTime').populate('userID', 'userID email accessCode').exec(function(err, questions) {
			if (err) {
				//console.log("you questions ma ?");
				console.log('Error in Question.list: ', err.message);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				res.json(questions);
			}
		});
	});
};

/**
 * List of Questions by user
 */
exports.listByUser = function(req, res) {
	console.log(req.questionUser.userID);
	Question.find({userID:req.questionUser.userID, $or:[{dietitianNotView:{$exists: false}},{dietitianNotView:false}]}).sort('-recordedTime').populate('userID', 'userID email').exec(function(err, questions) {
		if (err) {
			console.log('Error in Question.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// console.log(questions);
			res.json(questions);
		}
	});
};

/**
 * List of Questions by user
 */
exports.listAnsweredByUser = function(req, res) {
	console.log(req.questionUser.userID);
	Question.find({userID:req.questionUser.userID, replyTimes:{$gt:0}, $or:[{dietitianNotView:{$exists: false}},{dietitianNotView:false}]}).sort('-recordedTime').populate('userID', 'userID email').exec(function(err, questions) {
		if (err) {
			console.log('Error in Question.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// console.log(questions);
			res.json(questions);
		}
	});
};

/**
 * List of Questions by user
 */
exports.listUnansweredByUser = function(req, res) {
	console.log(req.questionUser.userID);
	Question.find({userID:req.questionUser.userID, replyTimes:0, $or:[{dietitianNotView:{$exists: false}},{dietitianNotView:false}]}).sort('-recordedTime').populate('userID', 'userID email').exec(function(err, questions) {
		if (err) {
			console.log('Error in Question.listByUser: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// console.log(questions);
			res.json(questions);
		}
	});
};

/**
 * List of question types
 */
exports.listTypes = function(req, res) {
	res.json(Question.schema.path('questionType').enumValues);
};

/**
 * List of questions by type
 */
exports.listByType = function(req, res) {
	var questionType = req.questionType;
	var user = req.user;
	Rms.getUserList(req.user, function(err, patients){
		if(err){
			console.log('Error in Question.listByType: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		var userList = [];
		patients.forEach(function(ele,array,index){
			userList.push(ele.userID);
		});
		Question.find({questionType : questionType, userID: {$in: userList}, $or:[{dietitianNotView:{$exists: false}},{dietitianNotView:false}]}).sort('-recordedTime').populate('userID', 'userID email accessCode').exec(function(err, questions) {
			if (err) {
				console.log('Error in Question.listByType: ', err.message);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(questions);
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
			console.log('Error in Question.userById: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			req.questionUser = user;
			// console.log(user);
			next();
		}
	});
};

/**
 * Question Type middleware
 */
exports.typeById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	var types = Question.schema.path('questionType').enumValues;
	req.questionType = types[id];
	//console.log(types[id]);
	next();
};

/**
 * Question middleware
 */
exports.questionByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('Error in Question.questionByID: QuestionId is invalid');
		return res.status(400).send({
			message: 'QuestionId is invalid'
		});
	}

	Question.findById(id).populate('userID', 'userID email').exec(function(err, question) {
		if (err) return next(err);
		if (!question) {
			console.log('Error in Question.questionByID: Question not found');
			return res.status(404).send({
				message: 'Question not found'
			});
		}
		if(question.medias && question.medias.length > 0){
			question.medias.forEach(function(element, index, array){
				var questionphoto = element.uri;
				// console.log(questionphoto);
				if(questionphoto && questionphoto.lastIndexOf('/') !== -1)
					questionphoto = questionphoto.substring(questionphoto.lastIndexOf('/')+1);
				question.medias[index].uri = '/images/'+question.userID.userID+'/'+questionphoto;
			});
		}

		req.question = question;
		next();
	});
};

/**
 * Question authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.question.userID.userID !== req.user.userID) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
