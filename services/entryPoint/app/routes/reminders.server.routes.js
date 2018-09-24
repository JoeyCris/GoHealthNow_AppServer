'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		reminders = require('../controllers/reminders.server.controller');
var passport = require('passport');

module.exports = function(app) {
	app.route('/reminders/user/:userId')
			.get(users.requiresLogin, reminders.listByUser);

	app.param('userId',reminders.userById);


	app.route('/reminders')
			.get(users.requiresLogin,reminders.list)
			.post(users.requiresLogin,reminders.createReminder);
	app.route('/reminders/:reminderId')
			.get(reminders.read)
			.put(users.requiresLogin,reminders.hasAuthorization, reminders.update)
			.delete(users.requiresLogin,reminders.hasAuthorization, reminders.delete);

	app.param('reminderId',reminders.reminderByID);
};
