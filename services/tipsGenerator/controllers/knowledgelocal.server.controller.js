'use strict';

/**
 * Module dependencies.
 */
require('../models/knowledgebase');
var mongoose = require('mongoose'),
	Knowledge = mongoose.model('Knowledge'),
	_ = require('lodash');

/**
 * Create Knowledge base
 * tested
 */
 exports.create = function(new_knowledge, callback) {

 	var knowledge = new Knowledge(new_knowledge);
 	knowledge.save(function(err) {
 		if (err) {
			console.log('Error in Knowledge.create: ', err.message);
 			callback(err);
 		} else {
 			callback(null,knowledge);
 		}
 	});

 };

 /**
  * Update a knowledge base
  */
 exports.update = function(new_knowledge, callback) {
	//  console.log(new_knowledge.title);
	Knowledge.findOne({title:new_knowledge.title},function(err, knowledge){
		if(err){
			console.log('Error in Knowledge.update.findOne: ', err.message);
			callback(err);
		}
		// console.log(knowledge.title);
		if(knowledge){
			knowledge = _.extend(knowledge, new_knowledge);
			console.log("update", knowledge._id);
		}else{
			knowledge = new Knowledge(new_knowledge);
			console.log("create", knowledge._id);
		}
		knowledge.save(function(err) {
			if (err) {
				console.log(knowledge);
				console.log('Error in Knowledge.update.save: ', err.message);
				callback(err);
	 		} else {
	 			callback(null,knowledge);
	 		}
		});

	});

 };


 /**
 * Read knowledge base by title
 */

 exports.read = function(title, callback){
  Knowledge.findOne({title:title},function(err, knowledge){
		if (err) {
			console.log('Error in Knowledge.read: ', err.message);
			callback(err);
		} else {
			callback(null,knowledge);
		}
	});
};

/**
* Get knowledge base by ID
*/

exports.getById = function(id, callback){
	// console.log(id);
	// if(mongoose.Types.ObjectId.isValid(id)){
		var knowledgeId = id.toString();
		Knowledge.findById(id,function(err, knowledge){
		 if (err) {
			 console.log('Error in Knowledge.get: ', err.message);
			 callback(err);
		 } else {
			 callback(null,knowledge);
		 }
		});
	// }else{
	// 	console.log('Error in Knowledge.get: id is invalid');
	// }
};

 /**
  * Delete a knowledge base
  */
 exports.delete = function(title, callback) {
 	Knowledge.findOne({title:title},function(err, knowledge){
	 	knowledge.remove(function(err) {
	 		if (err) {
				console.log('Error in Knowledge.remove: ', err.message);
				callback(err);
	 		} else {
	 			callback(null,knowledge);
	 		}
	 	});
	});
 };

 /**
  * List of knowledge base
  * tested
  */
 exports.list = function(callback) {
 	Knowledge.find({}, function(err, knowledges) {
 		if (err) {
			console.log('Error in Knowledge.list: ', err.message);
			callback(err);
 		} else {
 			callback(null,knowledges);
 		}
 	});
 };
/**
* List of knowledge types
* tested
*/
exports.listTypes = function(callback) {
	callback(Knowledge.schema.path('type').enumValues);
};

/**
 * List of knowledge base
 * tested
 */
exports.listByType = function(type, callback) {
 Knowledge.find({type:type}, function(err, knowledges) {
	 if (err) {
		 console.log('Error in Knowledge.list: ', err.message);
		 callback(err);
	 } else {
		 callback(null,knowledges);
	 }
 });
};
