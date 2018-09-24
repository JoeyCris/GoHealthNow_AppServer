'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		meals = require('../controllers/meals.server.controller');

var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/meals/type')
			.get(meals.listTypes);
	app.route('/meals/type/:typeId')
			.get(users.requiresLogin,meals.listByType);

	app.param('typeId',meals.typeById);

	app.route('/meals/user/:userId')
			.get(users.requiresLogin, meals.listByUser);

	app.param('userId',meals.userById);

	app.route('/meals')
			.get(users.requiresLogin,meals.list)
			.post(users.requiresLogin,meals.create);
	app.route('/meals/:mealId')
			.get(meals.read)
			.put(users.requiresLogin,meals.hasAuthorization, meals.update)
			.delete(users.requiresLogin,meals.hasAuthorization, meals.delete);

	app.param('mealId',meals.mealByID);

	app.route('/getscoresforallmeals').get(meals.calScoreForAllMeals);
};
