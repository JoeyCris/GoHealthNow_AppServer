/**
 * Module dependencies.
 */
require('../models/condition');
var path = require('path');
var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose'),
	_ = require('lodash'),
	ConditionFunc = mongoose.model('ConditionFunction');
var ProfileCtrl = require('./profiles.server.controller');
var TopicCtrl = require('./topics.server.controller');
var Conditions = require('../conditions/condition');
var conditionPath = '../conditions';

/**
 * Create Condtion Function
 *
 */
 var createfunction = function(conditionfunction, callback) {
 	var conditionfunc = new ConditionFunc(conditionfunction);
 	conditionfunc.save(function(err) {
 		if (err) {
 			callback(err);
 		} else {
			console.log(conditionfunc);
			callback(null, conditionfunc);
 		}
 	});
 };

 /**
  * Update a Condtion Function
  */
 var updatefunction = function(conditionfunc, conditionfunction, callback) {

 	conditionfunc = _.extend(conditionfunc, conditionfunction);
 	conditionfunc.save(callback);
 };


 /**
 * Read Condtion Function by ID
 */

 var readfunction = function(conditionfunc, callback){
	ConditionFunc.findOne({functionName:conditionfunc.functionName}, callback);
};

 /**
  * Delete a Condtion Function
  */
 var deletefunction = function(conditionfunc, callback) {
 	conditionfunc.remove(callback);
 };

 /**
  * List of Condtion Functions
  */
 var listfunction = function(callback) {
 	ConditionFunc.find({}, function(err, conditionfuncs) {
 		if (err) {
 			return callback(err);
 		} else {
      var conditionfunctions = {}
      conditionfuncs.forEach(function(conditionfunction,idx, arr){
        //  console.log(conditionfunction);
        conditionfunctions[conditionfunction._id] = require(conditionfunction.functionURL)[conditionfunction.functionName]
      });
      // console.log(conditionfunctions)
 			return callback(null, conditionfunctions);
 		}
 	});
 };

 /**
  * List of Condtion Functions
  */
 var listfunctionByTypes = function(type, callback) {
	 if(type === 'all'){
		 return listfunction(callback);
	 }
	 var types = [];
	 if(_.isArray(type)){
		 types = type;
	 }else{
		 types = [type];
	 }
 	ConditionFunc.find({functionType: {'$in':types}}, function(err, conditionfuncs) {
 		if (err) {
 			return callback(err);
 		} else {
      var conditionfunctions = {}
      conditionfuncs.forEach(function(conditionfunction,idx, arr){
        //  console.log(conditionfunction);
        conditionfunctions[conditionfunction._id] = require(conditionfunction.functionURL)[conditionfunction.functionName]
      });
      // console.log(conditionfunctions)
 			return callback(null, conditionfunctions);
 		}
 	});
 };

 /**
  * List of Condtion Functions
  */
 var listfunctionIds = function(callback) {
 	ConditionFunc.find({}, function(err, conditionfuncs) {
 		if (err) {
 			return callback(err);
 		} else {
      var conditionfunctions = {}
      conditionfuncs.forEach(function(conditionfunction,idx, arr){
        //  console.log(conditionfunction);
        conditionfunctions[conditionfunction.functionName] = conditionfunction._id;
      });
      // console.log(conditionfunctions)
 			return callback(null, conditionfunctions);
 		}
 	});
 };

 /**
	* List of Condtion Functions
	*/
 var listfunctionNames = function(callback) {
	 ConditionFunc.find({}, function(err, conditionfuncs) {
		 if (err) {
			 return callback(err);
		 } else {
			var conditionfunctions = {}
			conditionfuncs.forEach(function(conditionfunction,idx, arr){
				//  console.log(conditionfunction);
				conditionfunctions[conditionfunction._id] = conditionfunction.functionName;
			});
			// console.log(conditionfunctions)
			 return callback(null, conditionfunctions);
		 }
	 });
 };

 exports.initialConditionFunctions = function(callback) {
  fs.readdir(path.join(__dirname,conditionPath), function(err, files) {
    if (err){
			callback(err);
		}
		async.each(files, function(f, done) {
        // console.log('Files: ' + path.join(__dirname,conditionPath,f));
        var conditionfunction = require(path.join(__dirname,conditionPath,f)).getEntity();
        // console.log(conditionfunction);
        readfunction(conditionfunction, function(err, cf){
          if(err){
            console.error(err);
						done(err);
          }else{
						// console.log(cf)
						if(cf){
	            updatefunction(cf, conditionfunction,done);
	          }else{
	            createfunction(conditionfunction,done);
	          }
					}
        });
	    },function(err,results){
					// console.log(results);
					callback(err, results);
			});
	  });
	};
 exports.read = readfunction;
 exports.create = createfunction;
 exports.update = updatefunction;
 exports.delete = deletefunction;
 exports.list = listfunction;
 exports.listID = listfunctionIds;
 exports.listName = listfunctionNames;
 exports.listByType = listfunctionByTypes;
