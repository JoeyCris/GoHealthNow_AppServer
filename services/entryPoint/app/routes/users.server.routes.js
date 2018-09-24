'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../controllers/users.server.controller'),
		userRecords = require('../controllers/adapter.records.controller');

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').put(users.requiresLogin, users.hasAuthorization, users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);

	// Setting up the email verification api
	app.route('/auth/verifyemail').post(users.sendVerificationEmail);
	app.route('/auth/verifyemail/:token').get(users.validateEmailVerifyToken);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);
	app.route('/auth/innertoken/id/:userID').get(users.innerTokenByID);
	app.route('/auth/innertoken/name/:userName').get(users.innerTokenByName);
	app.route('/auth/demosignin').post(users.demosignin, users.signin);
	app.route('/auth/demosignin/expert').post(users.demoExpertSignin, users.signin);

	app.route('/auth/acl/list').get(users.getACL);

	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the fitbit oauth routes
	app.route('/auth/fitbit').get(passport.authenticate('fitbit', {
	   scope: ['activity','heartrate','location','profile']
	}));
	app.route('/auth/fitbit/callback').get(users.oauthCallback('fitbit'));



	// Setting the twitter oauth routes
	app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// Setting the linkedin oauth routes
	app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

	// Setting the github oauth routes
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(users.oauthCallback('github'));

	// routes to immigrate user
	app.route('/auth/immigrate').post(users.immigrate);
	// routes to get user records.

	app.route('/user/userRecords/userid/:uid/day/:day').get(userRecords.findRecordByDay);
	app.route('/user/userRecords/userid/:uid/month/:month').get(userRecords.findRecordByMonth);


	app.route('/user/userRecords/:userID').get(userRecords.find);


	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
