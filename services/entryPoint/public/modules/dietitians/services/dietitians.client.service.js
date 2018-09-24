'use strict';

//Dietitians service used to communicate Dietitians REST endpoints
angular.module('dietitians').factory('Dietitians', ['$resource',
	function($resource) {
		return $resource('dietitians/:dietitianId', { dietitianId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);


angular.module('dietitians').factory('UserGoals', ['$resource',
	function($resource) {
		return $resource('GlucoGuide/goals/:userID', { userID: '@userID'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('dietitians').factory('ActivityLevel', ['$resource',
	function($resource) {
		return $resource('profile/activityLevel/:userID', { userID: '@userID'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('dietitians').factory('MacrosGoal', ['$resource',
	function($resource) {
		return $resource('/userRecords/macrosGoal/:userID', { userID: '@userID'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

