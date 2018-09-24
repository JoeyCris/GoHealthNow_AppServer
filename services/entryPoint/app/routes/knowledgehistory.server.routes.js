'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		khistory = require('../controllers/knowledgehistory.server.controller'),
		knowledge = require('../controllers/knowledge.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/knowledgehistory')
			.get(users.requiresLogin,khistory.list)
			.post(users.requiresLogin,khistory.create);
	app.route('/knowledgehistory/:userId')
			.get(users.requiresLogin,khistory.read)
			.put(users.requiresLogin,khistory.hasAuthorization,khistory.update)
			.delete(users.requiresLogin,khistory.hasAuthorization,khistory.delete);
	app.route('/generatetip')
			.get(khistory.generateTip);

  app.param('userId',khistory.khistoryByUserId);

};
