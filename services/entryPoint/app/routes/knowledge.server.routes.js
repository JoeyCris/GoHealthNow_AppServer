'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		knowledge = require('../controllers/knowledge.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/knowledge/type')
			.get(users.requiresLogin,knowledge.listTypes);
	app.route('/knowledge/type/:typeId')
			.get(users.requiresLogin,knowledge.listByType);

	app.param('typeId',knowledge.typeById);

	app.route('/knowledge')
			.get(users.requiresLogin,knowledge.list)
			.post(users.requiresLogin,knowledge.create);
	app.route('/knowledge/:knowledgeId')
			.get(users.requiresLogin,knowledge.read)
			.put(users.requiresLogin,knowledge.hasAuthorization,knowledge.update)
			.delete(users.requiresLogin,knowledge.hasAuthorization,knowledge.delete);

  app.param('knowledgeId',knowledge.knowledgeById);

};
