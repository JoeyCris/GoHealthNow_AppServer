'use strict';

//Topic Templates service used for communicating with the articles REST endpoints

angular.module('topicTemplates').factory('Templates', ['$resource',
	function($resource) {
		return $resource('templates/:templateId', {
			templateId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
angular.module('topicTemplates').factory('TemplateTypes', ['$resource',
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
