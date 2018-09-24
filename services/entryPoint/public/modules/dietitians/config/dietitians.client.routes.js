'use strict';

//Setting up route
angular.module('dietitians').config(['$stateProvider',
	function($stateProvider) {
		// Dietitians state routing
		$stateProvider.
		state('listPatients', {
			url: '/dietitian',
			templateUrl: 'modules/dietitians/views/list-patients.client.view.html'
		}).
		state('viewLogbook', {
				url: '/logbook/:userId',
				templateUrl: 'modules/dietitians/views/view-logbook.client.view.html'
		}).
		state('setWeightGoal', {
				url: '/dietitian/weight_goal/:userId',
				templateUrl: 'modules/dietitians/views/set-weight-goal.client.view.html'
			}).
		state('setActivityLevel', {
				url: '/dietitian/activity/:userId',
				templateUrl: 'modules/dietitians/views/set-activity-level.client.view.html'
			}).
		state('setMacros', {
				url: '/dietitian/macros/:userId',
				templateUrl: 'modules/dietitians/views/set-macros.client.view.html'
			}).
		state('viewGoals', {
			url: '/dietitian/goals/:userId',
			templateUrl: 'modules/dietitians/views/view-goals.client.view.html'
		});
	}
]);
