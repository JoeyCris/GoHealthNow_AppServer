'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		topics = require('../controllers/topics.server.controller'),
		comments = require('../controllers/comments.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// Comment Routes
	app.route('/topics/:topicId/comments')
			.post(users.requiresLogin,comments.create);
	app.route('/topics/:topicId/comments/:commentId')
			.put(users.requiresLogin,comments.hasAuthorization, comments.update)
			.delete(users.requiresLogin,comments.hasAuthorization, comments.delete);

	app.param('topicId',topics.topicByID);
	app.param('commentId',comments.commentByID);
};
