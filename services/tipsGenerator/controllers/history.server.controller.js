'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	_ = require('lodash'),
	KHistory = mongoose.model('KnowledgeHistory');

/**
 * Create Knowledge History
 */
 exports.create = function(req, res) {

 	var khistory = new KHistory(req.body);
 	khistory.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(khistory);
 		}
 	});

 };

 /**
  * Update a knowledge history
  */
 exports.update = function(req, res) {
 	var  khistory = req.khistory;
 	khistory = _.extend(khistory, req.body);
 	khistory.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(khistory);
 		}
 	});
 };


 /**
 * Read knowledge history by ID
 */

 exports.read = function(req, res){
	var user = req.khuser;
	Knowledge.find({type:'tip'}).exec(function(err, temp_knowledges){
		var knowledges = temp_knowledges;
		var history_dict = {};
		var khistory = req.khistory;
		if(khistory.history.length !== knowledges.length){
			knowledges.forEach(function(temp_knowledge, index, array){
				var is_exist = false;
				khistory.history.forEach(function(temp_history, index, array){
					if(temp_history.knowledgeId === temp_knowledge._id){
						is_exist = true;
						history_dict[temp_history.knowledgeId] = temp_history.adopt_times;
					}
				});
				if(!is_exist){
					khistory.history.push({knowledgeId:temp_knowledge._id, adopt_times:0});
					khistory[temp_knowledge._id] = 0;
				}
			});
		}else{
			khistory.history.forEach(function(temp_history, index, array){
				history_dict[temp_history.knowledgeId] = temp_history.adopt_times;
			});
		}
		khistory.save(function(err) {
	 		if (err) {
	 			return res.status(400).send({
	 				message: errorHandler.getErrorMessage(err)
	 			});
	 		} else {
				console.log('Update history success');
				var u = user.toObject();
				u.historydict = history_dict;
				u.history = khistory;
				res.send(u);
	 		}
	 	});

	});
};

 /**
  * Delete a knowledge history
  */
 exports.delete = function(req, res) {
 	var khistory = req.khistory;

 	khistory.remove(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(khistory);
 		}
 	});
 };

 /**
  * List of knowledge histories
  * tested
  */
 exports.list = function(req, res) {
 	KHistory.find({}, function(err, khistory) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(khistory);
 		}
 	});
 };

 /**
  * knowledge history middleware
  */
 exports.khistoryByUserId = function(req, res, next, id) {

 	User.findById(id, {userID: 1,
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
	}).exec( function(err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(404).send({
				message: 'user not found'
			});
		}
		req.khuser = user;
		KHistory.findOne({user:user.userID}).exec(function(err, khistory){
			if (err) {
				return next(err);
			}
			if (!khistory) {
				khistory = new KHistory({user:user.userID,history:[]});
				khistory.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}else{
						req.khistory = khistory;
				 		next();
					}
				});
			}else{
				req.khistory = khistory;
				next();
			}
		});
 	});
 };

exports.generateTip = function(req, res) {
	var cp = require('child_process');
	var n = cp.fork('./app/controllers/test.server.js');
	n.on('message', function(m) {
		console.log('PARENT got message:', m);
	});
	n.send({ hello: 'world' });
	// var tips = generateTipForUsers(function(){
	// 	res.json({message:'generate tip'});
	// });
};
