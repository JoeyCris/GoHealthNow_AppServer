/**
 *
 * Created by Canon on 2016-01-31.
 */
'use strict';
var userStatistics = require('../controllers/users.statistics.controller.js');
var users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {
	//app.route('/userstastics/mealScoreDailyAverageForUser/userid/:userId/startdate/:startDate/enddate/:endDate')
	//	.get(userStatistics.mealScoreDailyAverageForUser);

	app.route('/userstastics/mealScoreDailyAverageForGroup')
		.get(users.requiresLogin, userStatistics.mealScoreDailyAverageForGroup, userStatistics.readMealScoreDailyAverageForGroup);

	app.route('/userstastics/mealScoreDailyAverageForUsersInGroup')
		.get(users.requiresLogin, userStatistics.mealScoreDailyAverageForUsersInGroup);

	app.route('/userstastics/mealScorePeriodAverageForUsersInGroup')
		.get(users.requiresLogin, userStatistics.mealScorePeriodAverageForUsersInGroup, userStatistics.readPeriodMealScoreAverage);

	app.route('/userstastics/pointDailyAverageForGroup')
		.get(users.requiresLogin, userStatistics.pointDailyAverageForGroup, userStatistics.readPointDailyAverageForGroup);

	app.route('/userstastics/pointPeriodAverageForUsersInGroup')
		.get(users.requiresLogin, userStatistics.pointPeriodAverageForUsersInGroup, userStatistics.readPeriodPointAverage);

	app.route('/userstastics/weightDailyAverageForGroup')
		.get(users.requiresLogin, userStatistics.weightPeriodAverageForUsersInGroup, userStatistics.readWeightDailyAverageForGroup);

	app.route('/userstastics/weightPeriodAverageForUsersInGroup')
		.get(users.requiresLogin, userStatistics.weightPeriodAverageForUsersInGroup, userStatistics.readPeriodWeightAverage);


	//app.route('/userstastics/caloriesDailyAverageForUser/userid/:userId/startdate/:startDate/enddate/:endDate')
	//	.get(userStatistics.exerciseCaloriesDailyAverageForUser);

	app.route('/userstastics/caloriesDailyAverageForGroup')
		.get(users.requiresLogin, userStatistics.exerciseCaloriesDailyAverageForGroup, userStatistics.readExerciseCaloriesDailyAverageForGroup);

	app.route('/userstastics/caloriesDailyAverageForUsersInGroup')
		.get(users.requiresLogin, userStatistics.exerciseCaloriesDailyAverageForUsersInGroup);

	app.route('/userstastics/caloriesPeriodAverageForUsersInGroup')
		.get(users.requiresLogin, userStatistics.exerciseCaloriesPeriodAverageForUsersInGroup, userStatistics.readPeriodExerciseCaloriesAverage);

	//app.route('/userstastics/ActivityPeriodAverageForUsersInGroup')
	//	.get(users.requiresLogin, userStatistics.ActivityPeriodAverageForUsersInGroup, userStatistics.readPeriodActivityCaloriesAverage);


	app.route('/userstastics/dailyAverageForGroup')
		.get(users.requiresLogin,
			userStatistics.mealScoreDailyAverageForGroup,
			userStatistics.exerciseCaloriesDailyAverageForGroup,
			userStatistics.pointDailyAverageForGroup,
			userStatistics.weightPeriodAverageForUsersInGroup,
			userStatistics.dailyAverage);

	app.route('/userstastics/periodAverageForUsersInGroup')
		.get(users.requiresLogin, userStatistics.mealScorePeriodAverageForUsersInGroup,
			userStatistics.exerciseCaloriesPeriodAverageForUsersInGroup,
			userStatistics.exerciseStepCountsPeriodAverageForUsersInGroup,
			//userStatistics.exerciseMinutesPeriodAverageForUsersInGroup,
			userStatistics.ActivityPeriodAverageForUsersInGroup,
			userStatistics.pointPeriodAverageForUsersInGroup,
			//userStatistics.pointPeriodTotalForUsersInGroup,
			userStatistics.weightPeriodAverageForUsersInGroup,
			userStatistics.readStatistics);

	app.route('/userstastics/monthlyForGroup')
		.get(userStatistics.preprocessing, userStatistics.mealScorePeriodAverageForUsersInGroup,
		userStatistics.exerciseCaloriesPeriodAverageForUsersInGroup,
		userStatistics.exerciseStepCountsPeriodAverageForUsersInGroup,
		userStatistics.ActivityPeriodAverageForUsersInGroup,
		userStatistics.pointPeriodAverageForUsersInGroup,
		userStatistics.readPublicStatistics);

	app.route('/userstastics/periodDistributionForUsersInGroup')
		.get(users.requiresLogin, userStatistics.mealScorePeriodAverageForUsersInGroup, userStatistics.exerciseCaloriesPeriodAverageForUsersInGroup,
				userStatistics.pointPeriodAverageForUsersInGroup, userStatistics.weightPeriodAverageForUsersInGroup, userStatistics.readDistribution);

	app.route('/userstastics/getTopUsers')
		.get(users.requiresLogin, userStatistics.mealScorePeriodAverageForUsersInGroup, userStatistics.exerciseCaloriesPeriodAverageForUsersInGroup,
			userStatistics.pointPeriodAverageForUsersInGroup, userStatistics.weightPeriodAverageForUsersInGroup, userStatistics.getTop);

	app.route('/userstastics/command')
		.get(users.requiresLogin, userStatistics.hasAuthorization, userStatistics.command);
};
