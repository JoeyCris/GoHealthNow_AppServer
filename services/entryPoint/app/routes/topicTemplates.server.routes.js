'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		templates = require('../controllers/topicTemplates.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/templates/type')
			.get(users.requiresLogin,templates.listTypes);
	app.route('/templates/type/:typeId')
			.get(users.requiresLogin,templates.listByType);

	app.param('typeId',templates.typeById);

	app.route('/templates/user/:userId')
			.get(users.requiresLogin, templates.listByUser);

	app.param('userId',templates.userById);

	app.route('/templates')
			.get(users.requiresLogin,templates.list)
			.post(users.requiresLogin,templates.create);
	app.route('/templates/:templateId')
			.get(users.requiresLogin,templates.read)
			.put(users.requiresLogin,templates.hasAuthorization,templates.update)
			.delete(users.requiresLogin,templates.hasAuthorization,templates.delete);

  app.param('templateId',templates.templateById);

};
