'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
	topics = require('../controllers/topics.server.controller');

var passport = require('passport');

module.exports = function(app) {
	// Topic Routes for testing
	app.route('/topics/type')
			.get(topics.listTypes);
	app.route('/topics/type/:typeId')
			.get(users.requiresLogin, topics.listByType);
	app.route('/topics/type/:typeId/count').get(users.requiresLogin, topics.countByType);

	app.route('/topics/type/:typeId/user/:userId')
			.get(users.requiresLogin, topics.listByTypeForOneUser);

	app.param('typeId',topics.typeById);

	app.route('/topics/user/:userId')
			.get(users.requiresLogin, topics.listByUser);

	app.param('userId',topics.userById);

	app.route('/topics/count').get(topics.count);

	app.route('/topics')
			.get(users.requiresLogin,topics.list)
			.post(users.requiresLogin,topics.create);
	app.route('/topics/:topicId')
			.get(topics.read)
			.put(users.requiresLogin,topics.hasAuthorization, topics.update)
			.delete(users.requiresLogin,topics.hasAuthorization, topics.delete);

	app.param('topicId',topics.topicByID);
};
