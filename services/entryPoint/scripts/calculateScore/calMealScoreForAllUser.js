/**
 * Created by Canon on 2016-02-11.
 */
'use strict';

var mongoose = require('mongoose');
var restler = require('restler');
mongoose.connect('mongodb://localhost/rawdata');

require('../../app/models/user.server.model.js');
var Users = mongoose.model('User');


//var url = "https://test.glucoguide.com/getscoresforallmeals";
var url = "https://localhost/getscoresforallmeals";

Users.find(function(err, users) {
	if(err) {
		console.log('db error' + err);
		return;
	}
	if(!users) {
		console.log('No users found');
		return;
	}
	users.forEach(function(user) {
		var userId = String(user._id);
		if(!userId) {
			console.log('error no userid');
			return;
		}
		restler.get(url+'?userid='+userId).on('success', function(result) {
			console.log(result + ' Update meal score for user: ' + userId);
		});
	});


});
