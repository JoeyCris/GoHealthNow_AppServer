'use strict';

/**
 * Module dependencies.
 */
require('../models/summary');
var mongoose = require('mongoose'),
	Summary = mongoose.model('Summary'),
	_ = require('lodash');

/**
 * Create Summary
 * tested
 */
 exports.create = function(new_summary, callback) {
	delete new_summary._id;
 	var summary = new Summary(new_summary);
	// console.log(summary);
	// console.log(new_summary);

 	summary.save(function(err) {
 		if (err) {
			console.log('Error in Summary.create: ', err.message);
 			callback(err);
 		} else {
 			callback(null,summary);
 		}
 	});

 };

 /**
  * Update a summary base
  */
 exports.update = function(new_summary, callback) {
	 console.log(new_summary.title);
	Summary.findOne({title:new_summary.title},function(err, summary){
		if(err){
			console.log('Error in Summary.update: ', err.message);
			callback(err);
		}
		if(summary){
			summary = _.extend(summary, new_summary);
		}else{
			summary = new Summary(new_summary);
		}
		summary.save(function(err) {
			if (err) {
				console.log('Error in Summary.update: ', err.message);
				callback(err);
	 		} else {
	 			callback(null,summary);
	 		}
		});

	});

 };


 /**
 * Read summary base by title
 */

 exports.read = function(title, callback){
  Summary.findOne({title:title},function(err, summary){
		if (err) {
			console.log('Error in Summary.read: ', err.message);
			callback(err);
		} else {
			callback(null,summary);
		}
	});
};

/**
* Get summary base by ID
*/

exports.getById = function(id, callback){
	// console.log(id);
	// if(mongoose.Types.ObjectId.isValid(id)){
		var summaryId = id.toString();
		Summary.findById(id,function(err, summary){
		 if (err) {
			 console.log('Error in Summary.get: ', err.message);
			 callback(err);
		 } else {
			 callback(null,summary);
		 }
		});
	// }else{
	// 	console.log('Error in Summary.get: id is invalid');
	// }
};

 /**
  * Delete a summary base
  */
 exports.delete = function(title, callback) {
 	Summary.findOne({title:title},function(err, summary){
	 	summary.remove(function(err) {
	 		if (err) {
				console.log('Error in Summary.remove: ', err.message);
				callback(err);
	 		} else {
	 			callback(null,summary);
	 		}
	 	});
	});
 };

 /**
  * List of summary base
  * tested
  */
 exports.list = function(callback) {
 	Summary.find({}, function(err, summarys) {
 		if (err) {
			console.log('Error in Summary.list: ', err.message);
			callback(err);
 		} else {
 			callback(null,summarys);
 		}
 	});
 };
/**
* List of summary types
* tested
*/
exports.listTypes = function(callback) {
	callback(Summary.schema.path('type').enumValues);
};

/**
 * List of summary base
 * tested
 */
exports.listByType = function(type, callback) {
 Summary.find({type:type}, function(err, summarys) {
	 if (err) {
		 console.log('Error in Summary.list: ', err.message);
		 callback(err);
	 } else {
		 callback(null,summarys);
	 }
 });
};
