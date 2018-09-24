/**
 * Module dependencies.
 */
 require('../models/goal');
var mongoose = require('mongoose'),
	_ = require('lodash'),
	ExerciseGoal = mongoose.model('ExerciseGoal'),
  MacrosGoal = mongoose.model('MacrosGoal');
var ProfileCtrl = require('./profiles.server.controller');
var TopicCtrl = require('./topics.server.controller');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('./login.server.controller');


var login_cookie;

loginCtrl.getCookie(function(cookie){
	login_cookie = cookie;
});

 /**
 * Read knowledge base by ID
 */

 exports.getWeeklyStepCountGoal = function(userID, callback){

	 ExerciseGoal.find({'userID':userID,'type':3}).sort({'recordedTime':-1}).limit(1).exec(function(err, stepCountGoals){
		 if(err){
			 callback(err);
		 }else{
			 if(!stepCountGoals || stepCountGoals.length == 0){
				 callback(null, 5000);
			 }else{
         callback(null, stepCountGoals[0].target);
       }
		 }
	 });
};

exports.getDailyStepCountGoal = function(userID, callback){

  ExerciseGoal.find({'userID':userID,'type':2}).sort({'recordedTime':-1}).limit(1).exec(function(err, stepCountGoals){
    if(err){
      callback(err);
    }else{
      // console.log("!@#!@#!@#!@#"+stepCountGoals.length+"qweqweqwe")
      if(!stepCountGoals || stepCountGoals.length == 0){
        callback(null, 7500);
      }else{
        callback(null, stepCountGoals[0].target);
      }
    }
  });
};

exports.getMacrosGoal = function(userID, callback){

  MacrosGoal.findOne({'userID':userID}).exec(function(err, macrosGoal){
    if(err){
      callback(err);
    }else{
      var returnValue = macrosGoal;
      if(!macrosGoal){
        returnValue = {
          carbs: 0.5,
        	protein: 0.2,
        	fat:0.3
        }
      }
      callback(null, returnValue);
    }
  });
};

/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

};
