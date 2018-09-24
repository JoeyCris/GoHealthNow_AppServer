'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var dietitians = require('../../app/controllers/dietitians.server.controller');

	// Dietitians Routes
	app.route('/dietitians')
		.get(users.requiresLogin, dietitians.hasAuthorization, dietitians.list);
		//.post(users.requiresLogin, dietitians.create);
	app.route('/logbook/savecharts')
		.post(users.requiresLogin, dietitians.saveCharts);

	app.route('/dietitians/:dietitianId')
		.get(users.requiresLogin, dietitians.hasAuthorization, dietitians.read);

	app.route('/logbook/userData/')
		.get(dietitians.logbookData);

	app.route('/sample/meal/')
		.get(dietitians.demoMealData);

	app.route('/statistics/bg/')
		.post(dietitians.bgSummary);

	//app.route('/logbook/print/')
	//	.get(dietitians.printLogbook);

	// Finish by binding the Dietitian middleware
	app.param('dietitianId', dietitians.dietitianByID);
};
