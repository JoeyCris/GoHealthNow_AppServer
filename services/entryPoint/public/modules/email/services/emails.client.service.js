'use strict';

//Email service used for communicating with the articles REST endpoints

angular.module('email').factory('Email', ['$resource',
	function($resource) {
		return $resource('email/:emailId', {
			emailId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
angular.module('email').factory('EmailStatuses', ['$resource',
	function($resource) {
		return $resource('email/status/:statusId', {
			statusId: '@status'
		}, {
			getEmailByStatus:{
				method: 'get',
				isArray: true
			}
		});
	}
]);
angular.module('email').factory('Receivers', ['$resource',

	function($resource) {
		return $resource('profiles/emails', {

		}, {

		});
	}
]);

angular.module('email').factory('AccessCodes', ['$resource',
	function($resource) {
		return $resource('profiles/accesscodes/:accesscode', {
			accesscode: '@accesscode'
		}, {
			getProfileByAccessCodes:{
				method: 'post',
				isArray: true
			}
		});
	}

]);
