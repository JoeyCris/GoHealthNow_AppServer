'use strict';

//Setting up route
angular.module('statistics').config(['$stateProvider',
	function($stateProvider) {
		// Statistics state routing
		$stateProvider.
		//state('listStatistics', {
		//	url: '/statistics',
		//	templateUrl: 'modules/statistics/views/list-statistics.client.view.html'
		//}).
		state('userstatistics', {
			url: '/statistics/userstatistics',
			templateUrl: 'modules/statistics/views/users-statistic.client.view.html'
		}).
		state('useractivities', {
				url: '/statistics/activities',
				templateUrl: 'modules/statistics/views/activities-statistic.client.view.html'
		}).
		state('searchactivities', {
			url: '/statistics/activities/:search',
			templateUrl: 'modules/statistics/views/activities-statistic-search.client.view.html'
		});
		//}).
		//state('editStatistic', {
		//	url: '/statistics/:statisticId/edit',
		//	templateUrl: 'modules/statistics/views/edit-statistic.client.view.html'
		//});
	}
]);
