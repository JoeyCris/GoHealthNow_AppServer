'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	//Admin = mongoose.model('Admin'),
	User = mongoose.model('User'),
	_ = require('lodash');


/**
 * List of Users
 */
exports.list = function(req, res) {
	var condition = {};
	if(req.param('accessCode')) {
		console.log('list user for organization:' + req.param('accessCode'));
		condition.accessCode = req.param('accessCode');
		// condition.roles = req.param('role');
	}
	if (req.param('role')) {
		condition.roles = req.param('role');
	}/* else {
		condition.roles = 'user';
	}*/

	var search = req.query.search;
	//console.log(req.body);
	var query = User.find(condition, { password:0,
				    salt: 0,
		            provider: 0,
					providerData: 0,
					additionalProvidersData:0,
					updated: 0,
					resetPasswordToken: 0,
					resetPasswordExpires: 0
	              }).sort('-lastLoginTime');
	if(req.query.currentPage && req.query.numPerPage && !search) {
		var currentPage = Number(req.query.currentPage);
		var numPerPage = Number(req.query.numPerPage);
		query = query.skip(currentPage-1).limit(numPerPage);
	}
	query.exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if(!search) {
				return res.jsonp(users);
			}
			var filteredUsers = users.reduce(function(prev, next) {
				var str = JSON.stringify(next);
				if(str.indexOf(search) > -1) {
					prev.push(next);
				}
				return prev;
			},[]);
			return res.jsonp(filteredUsers);
		}
	});
};

exports.count = function(req, res) {
	var condition = {};
	if(req.param('accessCode')) {
		console.log('list user for organization:' + req.param('accessCode'));
		condition.accessCode = req.param('accessCode');
	}
	User.count(condition, function(err, count) {
		if(err) {
			console.log('Error in counting the total number of users under certain condition: ', err.message);
			res.status(400).send({message: 'Error in counting total number of users'});
		} else {
			res.send({count: count});
		}
	});
};

exports.getUser = function(req,res) {
	User.findOne({_id: req.params.userId},
		{ password:0,
		salt: 0,
		provider: 0,
		providerData: 0,
		//additionalProvidersData:0,
		updated: 0,
		resetPasswordToken: 0,
		resetPasswordExpires: 0
	}).exec(function(err, user) {
		if (err||!user) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var keys = {};
			//for(var k in user.additionalProvidersData) {
			//	if(user.additionalProvidersData.hasOwnProperty(k)) {
			//		keys.push(k);
			//	}
			//}
			if(user.additionalProvidersData && user.additionalProvidersData.fitbit) {
				keys.fitbit = true;
			}

			//user.bindingProviders = keys;
			user.additionalProvidersData = keys;

			//console.log('additional providers:' + JSON.stringify(user));
			res.jsonp(user);
		}
	});
};


exports.update = function(req, res) {
	var user = req.targetUser;
	//console.log('update user profile');

	//console.log(JSON.stringify(req.body));

	user = _.extend(user, req.body);
	// user.userName = user.email;
	//console.log(req.body);

	//console.log(JSON.stringify(user));
	if(req.body.accessCode) {
		user.accessCode = req.body.accessCode.toLowerCase();

	}


	if(req.body.password) {
		//console.log('password is :' + req.body.password);
		console.log('Change password of user: ' + user.email);
		user.password = req.body.password;
		user.encryptPassword();
	}
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			user.password = undefined;
			res.json(user);
		}
	});
};
/**
 * Admin middleware
 */
exports.userByID = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('id is not valid userID: ' + id);
		return res.status(400).send({
			message: 'User is invalid'
		});
	}

	User.findById(id).exec(function(err, user) {
		if (err) return next(err);
		if (!user) {
			return res.status(404).send({
				message: 'user not found'
			});
		}
		req.targetUser = user;
		next();
	});
};


exports.getUserList = function(req, res) {
	var page = 1;
	if(!req.params.page)
	{
		page = 1;
	}else{
		page = req.params.page;
	}
	var per_page =10;

	User.find({}, { password:0,
		salt: 0,
		provider: 0,
		providerData: 0,
		additionalProvidersData:0,
		updated: 0,
		resetPasswordToken: 0,
		resetPasswordExpires: 0
	}).sort('-created').skip((page-1)*per_page).limit(per_page).exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(users);
		}
	});
};
/**
 * Admin authorization middleware
 *
 */

// TODO: update authorization for different users;
/*
1. normal user can only get it's own records
2. dietitian can only get records for its own org
3. org admin can only list user for its own ogr.
4. system admin can do anything.
 */
exports.hasAdminAuth = function(req, res, next) {
	var userID = req.param('userId');
	if (req.user.roles.indexOf('admin') === -1 && userID !== req.user.userID) {
		//req.dietitian = req.user;
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.hasAuthorization = function(req, res, next) {
	var targetid = req.params.userId;
	console.log(targetid);
	console.log(req.user.userID);
	if (req.user.roles.indexOf('admin') === -1 &&
		req.user.roles.indexOf('dietitian') === -1 &&
		req.user.roles.indexOf('orgAdmin') === -1 && (
			!targetid  || targetid !== req.user.userID
		))
	{
		console.log('User ' + req.user.email +' is not authorized');
		return res.status(403).send('User is not authorized');
	}
	//||(req.targetUser&& req.targetUser.userID !== req.user.userID)
	next();
};
