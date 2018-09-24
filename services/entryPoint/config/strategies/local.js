'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('mongoose').model('User');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
			User.findOne(
				{
					userName: username
				},
				{
					userID: 1,
					password: 1,
					salt: 1,
					userName: 1,
					email: 1,
					accessCode: 1,
					rightsMask: 1,
					roles: 1
				},
				function(err, user) {
					if (err) {
						return done(err);
					}
					if (!user) {
						return done(null, false, {
							message: 'Unknown user or invalid password'
						});
					}
					if (!user.authenticate(password)) {
						return done(null, false, {
							message: 'Unknown user or invalid password'
						});
					}

					return done(null, user);
			});
		}
	));
};
