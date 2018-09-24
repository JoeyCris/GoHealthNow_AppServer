/**
 * Module dependencies.
 */
require('../models/point');
var mongoose = require('mongoose'),
	_ = require('lodash');
var async = require('async');
var Point = mongoose.model('Point');
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

exports.saveWeeklyUserPoint = function(userID, total_points, exercise_points, meal_points, target_date, callback){
  var tp = new Point({
    userID: userID,
    value: total_points,
    type: ['TotalPoint'],
    frequency: ['Weekly'],
    recordedTime: target_date
  });

  var ep = new Point({
    userID: userID,
    value: exercise_points,
    type: ['ExercisePoint'],
    frequency: ['Weekly'],
    recordedTime: target_date
  });

  var mp = new Point({
    userID: userID,
    value: meal_points,
    type: ['MealPoint'],
    frequency: ['Weekly'],
    recordedTime: target_date
  });

  async.parallel([
    function(callback){
      tp.save(function(err){
        if(err){
          console.log('save total points err' + err.toString());
          callback(err, tp);
        }else{
          callback(null,tp);
        }
      });
    },
    function(callback){
      ep.save(function(err){
        if(err){
          console.log('save exercise points err' + err.toString());
          callback(err, ep);
        }else{
          callback(null,ep);
        }
      });
    },
    function(callback){
      mp.save(function(err, user){
        if(err){
          console.log('save meal points err' + err.toString());
          callback(err, mp);
        }else{
          callback(null,mp);
        }
      });
    }],
  function(err, results){
    if(err){
      console.log('save points err' + err.toString());
      callback(err);
    }else{
      callback(null, results);
    }
  });
};

/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

};
