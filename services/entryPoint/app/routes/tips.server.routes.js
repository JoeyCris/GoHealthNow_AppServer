'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		knowledge = require('../controllers/knowledge.server.controller'),
		tips = require('../controllers/tips.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes

	app.route('/knowledge/:knowledgeId/tips')
			.post(users.requiresLogin,tips.createKnowledgeTip);
	app.route('/tips')
			.post(users.requiresLogin,tips.createTip);
	app.route('/knowledge/:knowledgeId/tips/templates')
			.post(users.requiresLogin,tips.createTipByTemplate);


	app.param('tipId',tips.topicByID);
	app.param('knowledgeId',knowledge.knowledgeById);
};
