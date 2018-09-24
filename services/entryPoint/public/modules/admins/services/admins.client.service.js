'use strict';

//Admins service used to communicate Admins REST endpoints
angular.module('admins').factory('Admin', ['$resource',
	function($resource) {
		return $resource('admin/user/:userId', { userId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]).factory('OrgAdmin', ['$resource',
	function($resource) {
		//return $resource('/userstastics/periodAverageForUsersInGroup/', {
		return $resource('/userstastics/command/', {
		}, {
			update: {
				method: 'PUT'
			},
			//get :{
			//	isArray:true
			//}
		});
	}
]).factory('NoLoginAdmin',['$resource',
	function($resource) {
		//return $resource('/userstastics/periodAverageForUsersInGroup/', {
		return $resource('/userstastics/monthlyForGroup/', {
		}, {
			update: {
				method: 'PUT'
			},
			get :{
				isArray:true
			}
		});
	}
]);
