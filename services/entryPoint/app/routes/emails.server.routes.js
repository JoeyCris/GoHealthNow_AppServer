'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		email = require('../controllers/emails.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/email/status')
			.get(users.requiresLogin,email.listStatuses);
	app.route('/email/status/:statusId')
			.get(users.requiresLogin,email.listByStatus);

	app.param('statusId',email.statusById);

	app.route('/email')
			.get(users.requiresLogin,email.list)
			.post(users.requiresLogin,email.create);
	app.route('/email/:emailId')
			.get(users.requiresLogin,email.read)
			.put(users.requiresLogin,email.hasAuthorization,email.update)
			.delete(users.requiresLogin,email.hasAuthorization,email.delete);

	app.route('/email/unsubscribe/:userId')
			.get(email.unsubscribe);

	app.param('userId', email.userById);
  app.param('emailId',email.emailById);

};
