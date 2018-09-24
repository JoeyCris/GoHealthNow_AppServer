'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var statistics = require('../../app/controllers/statistics.server.controller');

	// Statistics Routes
	app.route('/statistics/activityStatistics')
		.get(users.requiresLogin, statistics.hasAuthorization, statistics.activityStatistics);
		//.post(users.requiresLogin, statistics.create);

	app.route('/statistics/activityStatisticsCount')
		.get(users.requiresLogin, statistics.hasAuthorization, statistics.activityStatisticsCount);


	app.route('/statistics/userStatistics')
		.get(users.requiresLogin,  statistics.hasAuthorization, statistics.userStatistics);
		//.put(users.requiresLogin, statistics.hasAuthorization, statistics.update)
		//.delete(users.requiresLogin, statistics.hasAuthorization, statistics.delete);
	app.route('/statistics/latestRecordDate/:userID')
		.get(statistics.getLatestRecordDate);
	app.route('/statistics/orgStatistics')
		.get(users.requiresLogin,  statistics.hasAuthorization, statistics.getOrgStatistics);
	// Finish by binding the Statistic middleware
	//app.param('userID', statistics.statisticByID);
};
