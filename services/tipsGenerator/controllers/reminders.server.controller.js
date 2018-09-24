/**
 * Module dependencies.
 */
 require('../models/reminder');
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Reminder = mongoose.model('Reminder');
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

 exports.noReminder = function(userID, callback){
	 Reminder.find({userID:userID}).exec(function(err, reminders){
		 if(err){
			 callback(err);
		 }else{
			 if(reminders.length === 0){
				 callback(null, true);
			 }else{
				 callback(null, false);
			 }
		 }
	 });
};

exports.reminderCount = function(userID, callback){
  Reminder.count({userID:userID}).exec(function(err, count){
    if(err){
      callback(err);
    }else{
      callback(null, count);
    }
  });
};


/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

};
