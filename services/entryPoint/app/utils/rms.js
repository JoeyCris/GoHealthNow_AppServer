'use strict'
var mongoose = require('mongoose'),
	errorHandler = require('../controllers/errors.server.controller'),
	User = mongoose.model('User');

var superUserMask = 999;

//return user id list for dietitian& admin
exports.getUserList = function(user, func) {
	if(user.roles && user.rightsMask && user.accessCode) {
		if(user.roles.indexOf('user') !== -1) {
			func(null, [user.userID]);
		} else {

			var filter = {'roles': 'user'};
			if((user.roles.indexOf('admin') === -1) && (user.rightsMask !== superUserMask)) {
				filter.accessCode = user.accessCode;
				filter.rightsMask = {'$ne': 700};
			}

			User.find(filter,
				{
					userID: 1,
					_id: 0
				}
			).sort({lastLoginTime: -1}).exec(function (err, patients) {
					func(err, patients);
				});
		}
	}
};
//
//exports.hasAuthorization = function(req, res, next) {
//	if (req.user.roles.indexOf('admin') !== -1 ||
//		(req.user.roles.indexOf('user') !== -1 && req.body.userID === req.user.userID)) {
//		next();
//	} else if (req.user.roles.indexOf('dietitian') !== -1 ){
//		if(req.user.rightsMask === superUserMask) {
//			next();
//		} else {
//
//		}
//	} else {
//		console.log('User ' + req.user.email +' is not authorized');
//		return res.status(403).send('User is not authorized');
//	}
//
//
//};
//
//
//exports.hasRights = function(operator, userID, func) {
//	if(user.roles && user.rightsMask && user.accessCode) {
//		if(user.roles.indexOf('user') !== -1) {
//			func(null, [user.userID]);
//		} else {
//
//			var filter = {'roles': 'user'};
//			if((user.roles.indexOf('admin') === -1) && (user.rightsMask !== superUserMask)) {
//				filter.accessCode = user.accessCode;
//				filter.rightsMask = {'$ne': 700};
//			}
//
//			User.find(filter,
//				{
//					userID: 1,
//					_id: 0
//				}
//			).sort({lastLoginTime: -1}).exec(function (err, patients) {
//					func(err, patients);
//				});
//		}
//	}
//};

//return user profile list for dietitian& admin
exports.getUserListInDetail = function(user, func) {

	if(user.roles && user.rightsMask && user.accessCode) {
		if(user.roles.indexOf('user') !== -1) {
			func(null, [user]);
		} else {

			var filter = {'roles': 'user'};
			if((user.roles.indexOf('admin') === -1) && (user.rightsMask !== superUserMask)) {
				filter.accessCode = user.accessCode;
				filter.rightsMask = {'$ne': 700};
			}

			User.find(filter,
				{
					password: 0,
					salt: 0,
					roles: 0,
					resetPasswordToken: 0,
					resetPasswordExpires: 0,
					emailVerificationToken: 0,
					sendEmail: 0,
					emailVerified: 0
				}
			).sort('-lastLoginTime').exec(function (err, patients) {
					func(err, patients);
				});
		}
	} else {
		console.log('invalid user data for getUserListInDetial' + user.toJSON());
		func(new Error('invalid user data for getUserListInDetial'));
	}

};

//return user profile list for dietitian& admin
exports.getUserListInDetail2 = function(user, func) {

	if(user.roles && user.rightsMask && user.accessCode) {
		if(user.roles.indexOf('user') !== -1) {
			func(null, [user]);
		} else {
			var accessCode = user.accessCode.split('/');
			//console.log()

			var filter = {'roles': 'user'};
			if((user.roles.indexOf('admin') === -1) && (user.rightsMask !== superUserMask)) {
				filter.accessCode = {'$in':accessCode};//user.accessCode;
				filter.rightsMask = {'$ne': 700};
			}

			User.find(filter,
				{
					password: 0,
					salt: 0,
					roles: 0,
					resetPasswordToken: 0,
					resetPasswordExpires: 0,
					emailVerificationToken: 0,
					sendEmail: 0,
					emailVerified: 0
				}
			).sort('-lastLoginTime').exec(function (err, patients) {
					func(err, patients);
				});
		}
	} else {
		console.log('invalid user data for getUserListInDetial' + user.toJSON());
		func(new Error('invalid user data for getUserListInDetial'));
	}

};

//return user profile list for dietitian& admin
exports.getLimitedUserList = function(user, limit, func) {

	if(limit > 500 || limit < 20) {
		limit = 200;
	}

	if(user.roles && user.rightsMask && user.accessCode) {
		if(user.roles.indexOf('user') !== -1) {
			func(null, [user]);
		} else {

			var filter = {'roles': 'user'};
			if((user.roles.indexOf('admin') === -1) && (user.rightsMask !== superUserMask)) {
				filter.accessCode = user.accessCode;
				filter.rightsMask = {'$ne': 700};
			}

			User.find(filter,
				{
					email: 1,
					userID: 1,
					height: 1,
					weight: 1,
					gender: 1,
					dob: 1,
					waistSize: 1,
					lastName: 1,
					firstName: 1,
					accessCode: 1,
					bmi: 1,
					points: 1,
					updatedTime: 1,
					lastLoginTime: 1,
					retrieveTime:1,
					registrationTime: 1
				}
			).sort('-retrieveTime').limit(limit).exec(function (err, patients) {
					func(err, patients);
				});
		}
	} else {
		console.log('invalid user data for getUserListInDetial' + user.toJSON());
		func(new Error('invalid user data for getUserListInDetial'));
	}

}


//
//module.exports.getScope == function(req, res, next) {
//	if (req.answer.creator.userID !== req.user.userID) {
//		return res.status(403).send({
//			message: 'User is not authorized'
//		});
//	}
//	next();
//};
//
///**
// * Answer authorization middleware
// */
//exports.hasAuthorization = function(req, res, next) {
//	if (req.answer.creator.userID !== req.user.userID) {
//		return res.status(403).send({
//			message: 'User is not authorized'
//		});
//	}
//	next();
//};
