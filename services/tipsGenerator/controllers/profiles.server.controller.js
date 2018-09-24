require('../models/user.server.model');
var mongoose = require('mongoose'),
 _ = require('lodash'),
 User = mongoose.model('User');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('./login.server.controller');


var login_cookie;
// var login = function(){
	loginCtrl.getCookie(function(cookie){
		login_cookie = cookie;
		// console.log('login: '+login_cookie);
	});
// }


 /**
 * Read knowledge base by ID
 */

 exports.list = function(callback){
	 sendRequest.sendGetRequest('profiles/all', {headers: {cookie: login_cookie}},function(err, response, data){

		 var profiles = JSON.parse(data);
		 //console.log(profiles.length);
		 if(err){
			 return callback(err);
		 }else{
			 callback(null, profiles);
		 }
	 });
};

exports.list = function(callback){
  User.find({},callback);
};

exports.profileByID = function(profileId, callback){
	// console.log('profileByID: '+login_cookie);
	sendRequest.sendGetRequest('profiles/'+profileId, {headers: {cookie: login_cookie}},function(err, response, data){
		//console.log(data);
		if(err){
			return callback(err);
		}else{
			var profile = JSON.parse(data);
			callback(null, profile);
		}
	});
};

exports.findByEmail = function(email,callback){
	User.findOne({'email':email}, callback);
};

exports.findByID = function(userID,callback){
  // console.log(123);
	User.findOne({'_id':userID}, function(err, user){
    // console.log(err,user);
    callback(err,user);
  });
};

exports.updatePoints = function(userID, points ,callback){
	User.update({'_id':userID}, {'$inc':{'points':points}},callback);
}

// exports.login = login;

/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

};
