'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	ConditionFunction = mongoose.model('ConditionFunction'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create ConditionFunction base
 * tested
 */
 exports.create = function(req, res) {

 	var conditionFunction = new ConditionFunction(req.body);
 	conditionFunction.save(function(err) {
 		if (err) {
			console.log('Error in ConditionFunction.create: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(conditionFunction);
 		}
 	});

 };

 /**
  * Update a conditionFunction base
  */
 exports.update = function(req, res) {
 	var  conditionFunction = req.conditionFunction;
 	conditionFunction = _.extend(conditionFunction, req.body);
 	conditionFunction.save(function(err) {
 		if (err) {
			console.log('Error in ConditionFunction.update: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(conditionFunction);
 		}
 	});
 };


 /**
 * Read conditionFunction base by ID
 */

 exports.read = function(req, res){
  res.send(req.conditionFunction);
};

 /**
  * Delete a conditionFunction base
  */
 exports.delete = function(req, res) {
 	var conditionFunction = req.conditionFunction;

 	conditionFunction.remove(function(err) {
 		if (err) {
			console.log('Error in ConditionFunction.remove: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(conditionFunction);
 		}
 	});
 };

 /**
  * List of conditionFunction base
  * tested
  */
 exports.list = function(req, res) {
 	ConditionFunction.find({}, function(err, conditionFunction) {
 		if (err) {
			console.log('Error in ConditionFunction.list: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(conditionFunction);
 		}
 	});
 };
/**
* List of conditionFunction types
* tested
*/
exports.listTypes = function(req, res) {
	res.json(ConditionFunction.schema.path('functionType').enumValues);
};

/**
* List of conditionFunction by type
* tested
*/
exports.listByType = function(req, res) {
	var conditionFunctionType = req.conditionFunctionType;
	ConditionFunction.find({functionType:conditionFunctionType}, function(err, conditionFunction) {
		if (err) {
			console.log('Error in ConditionFunction.listByType: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(conditionFunction);
		}
	});
};

/**
* conditionFunction Type middleware
*/
exports.typeById = function(req, res, next, id) {
//console.log(ConditionFunction.schema.path('type').enumValues);
	var types = ConditionFunction.schema.path('functionType').enumValues;
	req.conditionFunctionType = types[id];
	//console.log(types[id]);
	next();
};

/**
* conditionFunction middleware
*/
exports.conditionFunctionById = function(req, res, next, id) {

	ConditionFunction.findById(id).exec( function(err, conditionFunction) {
		if (err) {
			console.log('Error in ConditionFunction.conditionFunctionById: ', err.message);
			return next(err);
		}
		if (!conditionFunction) {
			console.log('Error in ConditionFunction.conditionFunctionById: conditionFunction not found');
			return res.status(404).send({
				message: 'conditionFunction not found'
			});
		}
	req.conditionFunction = conditionFunction;
		next();
	});
};

/**
 * conditionFunction authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// TODO authorization for conditionFunction
	// if (req.user.id !== someAuthorizedID) {
	// 	return res.status(403).send({
	// 		message: 'User is not authorized'
	// 	});
	// }
	next();
};
