'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
	notes = require('../controllers/dietnotes.server.controller'),
	dietitian = require('../controllers/dietitians.server.controller');

var passport = require('passport');

module.exports = function(app) {
	// Topic Routes for testing

	app.route('/notes/user/:userId')
			.get(users.requiresLogin, notes.listByUser);

	app.param('userId',notes.userById);

	app.route('/notes/count').get(notes.count);

	app.route('/notes')
			.get(users.requiresLogin,notes.list)
			.post(users.requiresLogin,notes.create);
	app.route('/notes/:noteId')
			.get(notes.read)
			.put(users.requiresLogin,dietitian.hasAuthorization, notes.update)
			.delete(users.requiresLogin,dietitian.hasAuthorization, notes.delete);

	app.param('noteId',notes.noteByID);
};
