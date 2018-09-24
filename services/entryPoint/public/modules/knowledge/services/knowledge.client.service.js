'use strict';

//Knowledge service used for communicating with the articles REST endpoints

angular.module('knowledge').factory('Knowledge', ['$resource',
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
angular.module('knowledge').factory('KnowledgeTypes', ['$resource',
	function($resource) {
		return $resource('knowledge/type/:typeId', {
			typeId: '@_type'
		}, {
			getKnowledgeByType:{
				method: 'get',
				isArray: true
			}
		});
	}
]);
angular.module('knowledge').factory('ConditionFunctions', ['$resource',
	function($resource) {
		return $resource('conditionfunction/:conditionfunctionId', {
			conditionfunctionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
