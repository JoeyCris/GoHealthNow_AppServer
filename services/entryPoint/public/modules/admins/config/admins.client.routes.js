'use strict';

//Setting up route
angular.module('admins').config(['$stateProvider',
	function($stateProvider) {
		// Admins state routing
		$stateProvider.
		state('listAllUsers', {
			url: '/admin/listAllUsers',
			templateUrl: 'modules/admins/views/list-users.client.view.html'
		}).
		state('searchUsers', {
			url: '/admin/searchUsers/:search',
			templateUrl :'modules/admins/views/search-users.client.view.html'
		}).
		state('listOrgUsers', {
			url: '/admin/listOrgUsers',
			templateUrl: 'modules/admins/views/list-org-users.client.view.html'
		}).
		state('listOrgUsersMonthly',{
			url:'/u/stats/:accessCode',
			templateUrl: 'modules/admins/views/list-monthly-org-users.client.view.html'
		}).
		state('editUserProfile', {
			url: '/admin/editUserProfile/:userId',
			templateUrl: 'modules/admins/views/edit-user-profile.client.view.html'
		}).
		state('editUserPassword', {
			url: '/admin/editUserPassword/:userId',
			templateUrl: 'modules/admins/views/edit-user-password.client.view.html'
		});
		//state('listOrgUsersNew', {
		//	url: '/userstastics/mealScorePeriodAverageForUsersInGroup/groupaccesscode/:accessCode/startdate/:startDate/enddate/:endDate',
		//	templateUrl: 'modules/admins/views/list-org-users.client.view.html'
		//});

		//state('editCodes', {
		//	url: '/admin/editCodes',
		//	templateUrl: 'modules/admins/views/edit-codes.client.view.html'
		//}).
		//state('viewAdmin', {
		//	url: '/admins/:adminId',
		//	templateUrl: 'modules/admins/views/edit-user-profile.client.view.html'
		//}).
		//state('editAdmin', {
		//	url: '/admins/:adminId/edit',
		//	templateUrl: 'modules/admins/views/edit-codes.client.view.html'
		//});
	}
]);
