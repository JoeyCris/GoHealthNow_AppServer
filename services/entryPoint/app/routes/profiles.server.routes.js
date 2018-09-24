'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/profiles.server.controller');
var requiresLogin = require('../controllers/users.server.controller').requiresLogin;
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/profiles')
			.get(requiresLogin, users.list);
	//.get(requiresLogin, users.listWithLimit);

	app.route('/profiles/all')
			.get(users.listAll);
			//.post(users.requiresLogin,topics.create);


	app.route('/profiles/accesscodes')
			.get(users.listAccessCodes)
			.post(users.listByAccessCodes);
	app.route('/profiles/accesscodes/:accesscode')
			.get(users.listByAccessCode);
  app.param('accesscode',users.profileByAccessCode);

	app.route('/profiles/emails')
			.get(users.listProfileForEmail);

	app.route('/profile/activityLevel/:userID')
		.put(users.setActivityLevel);

	app.route('/profiles/:userId')
			.get(users.read);
			//.put(users.requiresLogin,topics.hasAuthorization, topics.update)
			//.delete(users.requiresLogin,topics.hasAuthorization, topics.delete);

	app.param('userId',users.profileByID);
};
