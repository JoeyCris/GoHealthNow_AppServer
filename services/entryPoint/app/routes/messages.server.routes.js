'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		messages = require('../controllers/messages.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/messages')
			.post(users.requiresLogin,messages.createMessage);

	app.param('messages',messages.topicByID);
};
