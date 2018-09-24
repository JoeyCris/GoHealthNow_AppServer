'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Knowledge = mongoose.model('Knowledge'),
	KnowledgeCondition = mongoose.model('KnowledgeCondition'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create Knowledge base
 * tested
 */
 exports.create = function(req, res) {

 	var knowledge = new Knowledge(req.body);
	var conditions = [];
 	knowledge.save(function(err) {
 		if (err) {
			console.log('Error in Knowledge.create: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
			req.body.conditions.forEach(function(ele){
				conditions.push(ele._id);
			});
			if(conditions.length>0){
				var knowledgeCondition = new KnowledgeCondition({'knowledgeId':knowledge._id, 'conditions': conditions});
				knowledgeCondition.save(function(err){
					if(err){
						console.log('Error in save KnowledgeCondition: ', err.message);
			 			return res.status(400).send({
			 				message: errorHandler.getErrorMessage(err)
			 			});
					}else{
						knowledge.conditions = conditions;
						res.json(knowledge);
					}
				});
			}else{
				res.json(knowledge);
			}
 		}
 	});

 };

 /**
  * Update a knowledge base
  */
 exports.update = function(req, res) {
 	var knowledge = req.knowledge;
 	knowledge = _.extend(knowledge, req.body);
 	knowledge.save(function(err) {
 		if (err) {
			console.log('Error in Knowledge.update: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
			var conditions = [];
			req.body.conditions.forEach(function(ele){
				conditions.push(ele._id);
			});
			KnowledgeCondition.findOne({'knowledgeId':knowledge._id}).exec(function(err, knowledgeCondition){
	 		 if(err){
	 			 console.log('Error in KnowledgeCondition findById: ', err.message);
	 			 return res.status(400).send({
	   				message: errorHandler.getErrorMessage(err)
	   			});
	 		 }else{
				 var return_knowledge = knowledge.toObject();
	 			 if(knowledgeCondition){
					 knowledgeCondition.conditions = conditions;
	 				 knowledgeCondition.save(function(err){
						 if(err){
							 console.log('Error in update KnowledgeCondition: ', err.message);
							 return res.status(400).send({
								 message: errorHandler.getErrorMessage(err)
							 });
						 }else{
							 return_knowledge.conditions = conditions;
							 res.json(return_knowledge);
						 }
					 });
	 			 }else{
					 if(conditions.length>0){
		 				var newKnowledgeCondition = new KnowledgeCondition({'knowledgeId':knowledge._id, 'conditions': conditions});
		 				newKnowledgeCondition.save(function(err){
		 					if(err){
		 						console.log('Error in save KnowledgeCondition: ', err.message);
		 			 			return res.status(400).send({
		 			 				message: errorHandler.getErrorMessage(err)
		 			 			});
		 					}else{
		 						return_knowledge.conditions = conditions;
		 						res.json(return_knowledge);
		 					}
		 				});
		 			}else{
		 				res.json(return_knowledge);
		 			}
				 }
	 			//  console.log(knowledge);
				 //  res.send(knowledge);
	 		 }
	 	 });
 		}
 	});
 };


 /**
 * Read knowledge base by ID
 */

 exports.read = function(req, res){
	 KnowledgeCondition.findOne({'knowledgeId':req.knowledge._id}).populate('conditions').exec(function(err, knowledgeCondition){
		 if(err){
			 console.log('Error in KnowledgeCondition findById: ', err.message);
			 return res.status(400).send({
  				message: errorHandler.getErrorMessage(err)
  			});
		 }else{
			 var knowledge = req.knowledge.toObject();
			 if(knowledgeCondition){
				 knowledge.conditions = knowledgeCondition.conditions;
			 }
			//  console.log(knowledge);
			 res.send(knowledge);
		 }
	 });

};

 /**
  * Delete a knowledge base
  */
 exports.delete = function(req, res) {
 	var knowledge = req.knowledge;

 	knowledge.remove(function(err) {
 		if (err) {
			console.log('Error in Knowledge.remove: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(knowledge);
 		}
 	});
 };

 /**
  * List of knowledge base
  * tested
  */
 exports.list = function(req, res) {
 	Knowledge.find({}, function(err, knowledge) {
 		if (err) {
			console.log('Error in Knowledge.list: ', err.message);
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(knowledge);
 		}
 	});
 };
/**
* List of knowledge types
* tested
*/
exports.listTypes = function(req, res) {
	res.json(Knowledge.schema.path('type').enumValues);
};

/**
* List of knowledge by type
* tested
*/
exports.listByType = function(req, res) {
	var knowledgeType = req.knowledgeType;
	Knowledge.find({type:knowledgeType}, function(err, knowledge) {
		if (err) {
			console.log('Error in Knowledge.listByType: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(knowledge);
		}
	});
};

/**
* knowledge Type middleware
*/
exports.typeById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	var types = Knowledge.schema.path('type').enumValues;
	req.knowledgeType = types[id];
	//console.log(types[id]);
	next();
};

/**
* knowledge middleware
*/
exports.knowledgeById = function(req, res, next, id) {
	console.log(id);
	Knowledge.findById(id).exec( function(err, knowledge) {
		if (err) {
			console.log('Error in Knowledge.knowledgeById: ', err.message);
			return next(err);
		}
		if (!knowledge) {
			console.log('Error in Knowledge.knowledgeById: knowledge not found');
			return res.status(404).send({
				message: 'knowledge not found'
			});
		}
		req.knowledge = knowledge;
		next();
	});
};

/**
 * knowledge authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// TODO authorization for knowledge
	// if (req.user.id !== someAuthorizedID) {
	// 	return res.status(403).send({
	// 		message: 'User is not authorized'
	// 	});
	// }
	next();
};
