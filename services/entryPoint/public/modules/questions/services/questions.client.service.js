'use strict';

//Questions service used for communicating with the articles REST endpoints
angular.module('questions').factory('Topics', ['$resource',
	function($resource) {
		return $resource('topics/:topicId', {
			topicId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('questions').factory('Profiles', ['$resource',
	function($resource) {
		var profiles = $resource('profiles',{},{});
		return profiles;
	}
]);

angular.module('questions').factory('Questions', ['$resource',
	function($resource) {
		return $resource('questions/:questionId', {
			questionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('questions').factory('QuestionTypes', ['$resource',
	function($resource) {
		return $resource('questions/type/:typeId', {
			typeId: '@_type'
		}, {
			getQuestionByType:{
				method: 'get',
				isArray: true
			}
		});
	}
]);

angular.module('questions').factory('UserQuestions', ['$resource',
	function($resource) {
		return $resource('/questions/user/:userId', {
			userId: '@user'
		}, {
			getQuestionByUser:{
				method: 'get',
				isArray: true
			}
		});
	}
]);

angular.module('questions').factory('UserCatergorizedQuestions', ['$resource',
	function($resource) {
		return $resource('/questions/:answerType/user/:userId', {
			userId: '@user', answerType: '@answerType'
		}, {
			getQuestionByUser:{
				method: 'get',
				isArray: true
			}
		});
	}
]);

// /questions/user/:userId
