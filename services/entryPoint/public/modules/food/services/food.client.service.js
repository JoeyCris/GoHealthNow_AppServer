'use strict';

//Admins service used to communicate Admins REST endpoints
angular.module('food').factory('Food', ['$resource',
	function($resource) {
		return $resource('/food/search/', {
		}, {
			update: {
				method: 'PUT'
			},
			query: {method: 'get', isArray: true, cancellable: true}
		});
	}
]);
