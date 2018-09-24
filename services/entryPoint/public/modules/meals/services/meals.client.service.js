'use strict';

//Meals service used for communicating with the articles REST endpoints
angular.module('meals').factory('Topics', ['$resource',
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

angular.module('meals').factory('FoodItems', ['$resource',
	function($resource) {
		return $resource('foodItems',{},{});
	}
]);

angular.module('meals').factory('Meals', ['$resource',
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

angular.module('meals').factory('MealTypes', ['$resource',
	function($resource) {
		return $resource('meals/type/:typeId', {
			typeId: '@_type'
		}, {
			getMealByType:{
				method: 'get',
				isArray: true
			}
		});
	}
]);
