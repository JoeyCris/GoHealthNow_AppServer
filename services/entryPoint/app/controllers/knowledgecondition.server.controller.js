'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	KnowledgeCondition = mongoose.model('KnowledgeCondition'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create KnowledgeCondition base
 * tested
 */
 exports.create = function(req, res) {

 	var knowledgeCondition = new KnowledgeCondition(req.body);
 	knowledgeCondition.save(function(err) {
 		if (err) {
			console.log('Error in KnowledgeCondition.create: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(knowledgeCondition);
 		}
 	});

 };

 /**
  * Update a knowledgeCondition base
  */
 exports.update = function(req, res) {
 	var  knowledgeCondition = req.knowledgeCondition;
 	knowledgeCondition = _.extend(knowledgeCondition, req.body);
 	knowledgeCondition.save(function(err) {
 		if (err) {
			console.log('Error in KnowledgeCondition.update: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(knowledgeCondition);
 		}
 	});
 };


 /**
 * Read knowledgeCondition base by ID
 */

 exports.read = function(req, res){
  res.send(req.knowledgeCondition);
};

 /**
  * Delete a knowledgeCondition base
  */
 exports.delete = function(req, res) {
 	var knowledgeCondition = req.knowledgeCondition;

 	knowledgeCondition.remove(function(err) {
 		if (err) {
			console.log('Error in KnowledgeCondition.remove: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(knowledgeCondition);
 		}
 	});
 };

 /**
  * List of knowledgeCondition base
  * tested
  */
 exports.list = function(req, res) {
 	KnowledgeCondition.find({}, function(err, knowledgeCondition) {
 		if (err) {
			console.log('Error in KnowledgeCondition.list: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(knowledgeCondition);
 		}
 	});
 };


/**
* knowledgeCondition middleware
*/
exports.knowledgeConditionById = function(req, res, next, id) {

	KnowledgeCondition.findById(id).exec( function(err, knowledgeCondition) {
		if (err) {
			console.log('Error in KnowledgeCondition.knowledgeConditionById: ', err.message);
			return next(err);
		}
		if (!knowledgeCondition) {
			console.log('Error in KnowledgeCondition.knowledgeConditionById: knowledgeCondition not found');
			return res.status(404).send({
				message: 'knowledgeCondition not found'
			});
		}
	req.knowledgeCondition = knowledgeCondition;
		next();
	});
};

/**
 * knowledgeCondition authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// TODO authorization for knowledgeCondition
	// if (req.user.id !== someAuthorizedID) {
	// 	return res.status(403).send({
	// 		message: 'User is not authorized'
	// 	});
	// }
	next();
};
