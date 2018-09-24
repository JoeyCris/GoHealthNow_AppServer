'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		questions = require('../controllers/questions.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/questions/type')
			.get(questions.listTypes);
	app.route('/questions/type/:typeId')
			.get(users.requiresLogin,questions.listByType);

	app.param('typeId',questions.typeById);

	app.route('/questions/answered/user/:userId')
			.get(users.requiresLogin, questions.listAnsweredByUser);
	app.route('/questions/unanswered/user/:userId')
			.get(users.requiresLogin, questions.listUnansweredByUser);
	app.route('/questions/user/:userId')
			.get(users.requiresLogin, questions.listByUser);

	app.param('userId',questions.userById);

	app.route('/questions')
			.get(users.requiresLogin,questions.list)
			.post(users.requiresLogin,questions.create);
	app.route('/questions/:questionId')
			.get(questions.read)
			.put(users.requiresLogin,questions.hasAuthorization, questions.update)
			.delete(users.requiresLogin, questions.remove);

	app.param('questionId',questions.questionByID);
};
