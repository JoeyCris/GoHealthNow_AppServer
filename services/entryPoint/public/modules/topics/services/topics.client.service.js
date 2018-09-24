'use strict';

//Topics service used for communicating with the articles REST endpoints
angular.module('topics').factory('Topics', ['$resource',
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

angular.module('topics').factory('TopicTypes', ['$resource',
	function($resource) {
		return $resource('topics/type/:typeId', {
			typeId: '@_type'
		}, {
			getTopicByType:{
				method: 'get',
				isArray: true
			}
		});
	}
]);

angular.module('topics').factory('TopicTypesByUser', ['$resource',
	function($resource) {
		return $resource('topics/type/:typeId/user/:userId', {
			typeId: '@_type', userId: '@user'
		}, {
			getTopicByTypeForOneUser:{
				method: 'get',
				isArray: true
			}
		});
	}
]);

angular.module('topics').factory('Profiles', ['$resource',
	function($resource) {
		var profiles = $resource('profiles/:userId',{},{});
		return profiles;
	}
]);

angular.module('topics').factory('Comments', ['$resource',
	function($resource) {
		return $resource('topics/:topicId/comments/:commentId', {
			topicId: '@topic',
			commentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('topics').factory('Questions', ['$resource',
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

angular.module('topics').factory('Meals', ['$resource',
	function($resource) {
		return $resource('meals/:mealId', {
			mealId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('topics').factory('Knowledge', ['$resource',
	function($resource) {
		return $resource('knowledge/:knowledgeId', {
			knowledgeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('topics').factory('TopicTemplates', ['$resource',
	function($resource) {
		return $resource('templates/:templateId', {
			templateId: '@_id'
		});
	}
]);

angular.module('topics').factory('TemplateTypes', ['$resource',
	function($resource) {
		return $resource('templates/type/:typeId', {
			typeId: '@_type'
		}, {
			getTemplateByType:{
				method: 'get',
				isArray: true
			}
		});
	}
]);

angular.module('topics').factory('QuestionAnswers', ['$resource',
	function($resource) {
		return $resource('question/:questionId/answers/:answerId', {
			answerId: '@_id',
			questionId: '@reference'
		}, {
			method:'PUT'
		});
	}
]);

angular.module('topics').factory('MealAnswers', ['$resource',
	function($resource) {
		return $resource('meal/:mealId/answers/:answerId', {
			answerId: '@_id',
			mealId: '@reference'
		}, {
			method:'PUT'
		});
	}
]);

angular.module('topics').factory('Reminders', ['$resource',
	function($resource) {
		return $resource('reminders/:reminderId', {
			reminderId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);


//notes service used for communicating with the articles REST endpoints
angular.module('topics').factory('Notes', ['$resource',
	function($resource) {
		return $resource('notes/:noteId', {
			noteId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('topics').factory('NotesByUser', ['$resource',
	function($resource) {
		return $resource('notes/user/:userId', {
			userId: '@user'
		}, {
			getNotesForOneUser:{
				method: 'get',
				isArray: true
			}
		});
	}
]);

