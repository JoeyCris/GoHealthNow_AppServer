'use strict';

//Setting up route
angular.module('food').config(['$stateProvider',
	function($stateProvider) {
		// Admins state routing
		$stateProvider.
		state('search', {
			url: '/food/search',
			templateUrl: 'modules/food/views/food.search.client.view.html'
		});
	}
]);
