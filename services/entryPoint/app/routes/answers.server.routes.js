'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		questions = require('../controllers/questions.server.controller'),
		meals = require('../controllers/meals.server.controller'),
		knowledge = require('../controllers/knowledge.server.controller'),
		answers = require('../controllers/answers.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/answers')
			.get(users.requiresLogin,answers.listAnswers);

	app.route('/question/:questionId/answers')
			.get(users.requiresLogin,answers.listQuestionAnswers)
			.post(users.requiresLogin,answers.createQuestionAnswer);
	app.route('/question/:questionId/answers/:answerId')
			.get(users.requiresLogin,answers.read)
			.put(users.requiresLogin,answers.hasAuthorization, answers.update)
			.delete(users.requiresLogin,answers.hasAuthorization, answers.delete);

	app.route('/meal/:mealId/answers')
			.get(users.requiresLogin,answers.listMealAnswers)
			.post(users.requiresLogin,answers.createMealAnswer);
	app.route('/meal/:mealId/answers/:answerId')
			.get(users.requiresLogin,answers.read)
			.put(users.requiresLogin,answers.hasAuthorization, answers.update)
			.delete(users.requiresLogin,answers.hasAuthorization, answers.delete);

	app.param('questionId',questions.questionByID);
	app.param('mealId',meals.mealByID);
	app.param('answerId',answers.answerByID);
};
