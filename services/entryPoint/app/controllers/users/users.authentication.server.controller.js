'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Signup
 */
exports.signup = function(req, res) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.userID = user._id;
	//user.userName = user.firstName + ' ' + user.lastName;
	user.userName = user.email;
	user.encryptPassword();

	// Then save the user
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	});
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
			console.log(err);
			res.status(400).send(info);
		} else {

			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					console.log(err);
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signin after passport authentication for demo user
 */
exports.demosignin = function(req, res, next) {
	// console.log(req);
	if(!req.body){
		req.body = {};
	}
	req.body.username = 'johndoe3433@gmail.com';
	req.body.password = 't123456';
	//console.log(req.body);
	next();
};
exports.demoExpertSignin = function(req, res, next) {
	// console.log(req);
	if(!req.body){
		req.body = {};
	}
	req.body.username = 'dec1234';
	req.body.password = 'dec123456';
	//console.log(req.body);
	next();
};


exports.innerTokenByID = function(req, res) {
	//console.log('name:' + req.params.userName);
	//console.log('client ip: ' + req.connection.remoteAddress);
	//console.log('local ip: ' + req.connection.localAddress);
	if(req.connection.remoteAddress !== req.connection.localAddress ) {
		res.status(400).send( {
			message: 'Failed to authorize'
		});
	} else {


		if(! mongoose.Types.ObjectId.isValid(req.params.userID)) {
			res.status(400).send( {
				message: 'invaild userID'
			});
		}

		var user = {id: req.params.userID, userID: req.params.userID};

		req.login(user, function (err) {
			if (err) {
				res.status(400).send(err);
			} else {
				res.json(user);
			}
		});


	}
};

exports.innerTokenByName = function(req, res) {
	//console.log('name:' + req.params.userName);
	//console.log('client ip: ' + req.connection.remoteAddress);
	//console.log('local ip: ' + req.connection.localAddress);
	if(req.connection.remoteAddress !== req.connection.localAddress ) {
		res.status(400).send( {
			message: 'Failed to authorize'
		});
	} else {


		// Init Variables
		User.findOne({
				userName: req.params.userName
			}, {
				_id:1,
				userID:1
				//password:0,
				//salt:0,
				//rightsMask:0
			},
			function(err, user) {
				if(err) {
					console.log('failed to find user for innerTokenByName. message:' + err.toJSON());

					res.status(400).send(err);
				}

				//console.log(user.toJSON());

				req.login(user, function (err) {
					if (err) {
						console.log('failed to login. message:' + err.toJSON());

						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});

			});
	}
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	if(!req.user) {
		req.logout();
		res.redirect('/');
		return;
	}
	console.log('sign out for user: ' + req.user);
	var roles = req.user.roles;
	req.logout();

	if(roles && (roles[0] === 'dietitian'|| roles[0] === 'orgAdmin')) {
		res.redirect('/#!/signin/experts');
	} else {
		res.redirect('/');
	}

	//res.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
	return function(req, res, next) {


		passport.authenticate(strategy, function(err, user, redirectURL) {
			if (err || !user) {
				console.log('error for oauth callback' + JSON.stringify(err));

				return res.redirect('/#!/fb_signin');
			}
			req.login(user, function(err) {
				if (err) {
					console.log('error for oauth callback login' + JSON.stringify(err));

					return res.redirect('/#!/fb_signin');
				}

				console.log('login by OAuth. user:' + JSON.stringify(user));

				//return res.redirect(redirectURL || '/');
				return res.redirect('/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
	if (!req.user) {
		// Define a search query fields
		console.log('create new user for oauth');

		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		providerUserProfile.displayName = providerUserProfile.displayName.trim();

		if(! providerUserProfile.email) {
			var tmpID = new Date();
			providerUserProfile.email =  providerUserProfile.displayName.toLowerCase().replace(' ', '.') + tmpID.getTime() + '@' + providerUserProfile.provider;
		}


		if(! providerUserProfile.userName) {
			providerUserProfile.userName = providerUserProfile.email;
		}

		if(! providerUserProfile.firstName) {
			providerUserProfile.firstName = providerUserProfile.displayName;
		}

		User.findOne(searchQuery, function(err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {


					console.log('create new user provider data:'+JSON.stringify(providerUserProfile));

					user = new User(providerUserProfile);

					user.userID = user._id;


					// And save the user
					user.save(function(err) {
						if(!err) {
							if(providerUserProfile.cbForNewUser) {
								providerUserProfile.cbForNewUser(user);
							}
						} else {
							console.error('failed to save oAuth user: ' + JSON.stringify(err));
						}
						return done(err, user);
					});

					//var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
                    //
					//User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
					//	providerUserProfile.
					//	user = new User({
					//		firstName: providerUserProfile.firstName ? providerUserProfile.firstName: providerUserProfile.displayName,
					//		lastName: providerUserProfile.lastName,
					//		userName: availableUsername,
					//		displayName: providerUserProfile.displayName,
					//		email: providerUserProfile.email,
					//		provider: providerUserProfile.provider,
					//		providerData: providerUserProfile.providerData
					//	});
                    //
					//	user.userID = user._id;
                    //
					//	// And save the user
					//	user.save(function(err) {
					//		return done(err, user);
					//	});
					//});
				} else {
					//user.email = providerUserProfile.email;
					//user.save();
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		console.log('added oauth to exist user:' + JSON.stringify(user));
		console.log('providerUserProfile:' + JSON.stringify(providerUserProfile));

		// Add the provider data to the additional provider data field
		if (!user.additionalProvidersData) user.additionalProvidersData = {};
		user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

		if (!user.boundDevices) user.boundDevices = {};
		if (providerUserProfile.boundDevices) {
			user.boundDevices[providerUserProfile.provider] = true;
		}

		// Then tell mongoose that we've updated the additionalProvidersData field
		user.markModified('additionalProvidersData');
		user.markModified('boundDevices');

		if (providerUserProfile.cbForNewUser) {
			providerUserProfile.cbForNewUser(user);
			user.retrieveTime = new Date();
		}

		// And save the user
		user.save(function (err) {
			return done(err, user, '/#!/settings/accounts');
		});


		//// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		//if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
		//	// Add the provider data to the additional provider data field
		//	if (!user.additionalProvidersData) user.additionalProvidersData = {};
		//	user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;
        //
		//	if(providerUserProfile.boundDevices) {
		//		user.boundDevices[providerUserProfile.provider] = true;
		//	}
        //
		//	// Then tell mongoose that we've updated the additionalProvidersData field
		//	user.markModified('additionalProvidersData');
		//	user.markModified('boundDevices');
        //
		//	if(providerUserProfile.cbForNewUser) {
		//		providerUserProfile.cbForNewUser(user);
		//	}
        //
		//	// And save the user
		//	user.save(function(err) {
		//		return done(err, user, '/#!/settings/accounts');
		//	});
		//} else {
		//	return done(new Error('User is already connected using this provider'), user);
		//}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	}
};

/**
 * data immigration for user
 */
exports.immigrate = function(req, res) {
	// For security measurement we remove the roles from the req.body object

	var message = null;
	User.findOne({userName:req.body.email},function(err, user){
		// console.log(user);
		if(user){
			// Init Variables
			// console.log('update');
			user = _.extend(user, req.body);
			// Add missing user fields
			user.provider = 'local';
			user.userID = user._id;
			//user.userName = user.firstName + ' ' + user.lastName;
			user.userName = user.email;
			user.encryptPassword();

			// Then save the user
			user.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					// Remove sensitive data before login
					user.password = undefined;
					user.salt = undefined;

					req.login(user, function(err) {
						if (err) {
							res.status(400).send(err);
						} else {
							res.json(user);
						}
					});
				}
			});
		}else{
			// Init Variables
			user = new User(req.body);

			// Add missing user fields
			user.provider = 'local';
			user.userID = user._id;
			//user.userName = user.firstName + ' ' + user.lastName;
			user.userName = user.email;
			user.encryptPassword();

			// Then save the user
			user.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					req.login(user, function(err) {
						if (err) {
							res.status(400).send(err);
						} else {
							res.json(user);
						}
					});
				}
			});
		}
	});

};
