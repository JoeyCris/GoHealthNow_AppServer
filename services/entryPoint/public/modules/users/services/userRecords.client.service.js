'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('UserRecords', ['$resource',
	function($resource) {
		return $resource('/user/UserRecords/:userID', { userID: '@_id'
		}, {
			//get: {
			//	method: 'GET',
			//	isArray:true
			//},
			update: {
				method: 'PUT'
			}
		});
	}
]);
