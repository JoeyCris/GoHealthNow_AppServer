'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('records', {
			url: '/user/records/:userID',
			templateUrl: 'modules/users/views/records/list-records.client.view.html'
		}).
		state('logbook', {
				url: '/logbook',
				templateUrl: 'modules/users/views/records/logbook.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('signin_ghn', {
			url: '/signin_ghn',
			templateUrl: 'modules/users/views/authentication/signin.client_GHN.view.html'
		}).
		state('experts_signin', {
				url: '/signin/experts',
				templateUrl: 'modules/users/views/authentication/signin.expert.view.html'
		}).
		state('experts_signin_ghn', {
				url: '/signin/experts_ghn',
				templateUrl: 'modules/users/views/authentication/signin.expert_GHN.view.html'
		}).
		state('experts_signin_hd', {
				url: '/signin/experts_hd',
				templateUrl: 'modules/users/views/authentication/signin.client_Hd.view.html'
		}).
		state('fb_signin', {
				url: '/fb_signin',
				templateUrl: 'modules/users/views/authentication/signin.sample.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		}).
		state('email-verify-invalid', {
			url: '/verifyemail/invalid',
			templateUrl: 'modules/users/views/verifyemail/email-verify-invalid.client.view.html'
		}).
		state('email-verify-success', {
			url: '/verifyemail/success',
			templateUrl: 'modules/users/views/verifyemail/email-verify-success.client.view.html'
		}).
		state('email-verify', {
			url: '/verifyemail/send',
			templateUrl: 'modules/users/views/verifyemail/email-verify.client.view.html'
		});
	}
]);
