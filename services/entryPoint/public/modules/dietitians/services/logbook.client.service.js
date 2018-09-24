/**
 * Created by nodejs on 25/11/15.
 */
'use strict';

//Dietitians service used to communicate Dietitians REST endpoints
angular.module('dietitians').factory('UserRecords', ['$resource',
	function($resource) {
		return $resource('dietitians/:dietitianId', { dietitianId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('dietitians').factory('LogBookCharts', ['$resource',
	function($resource) {
		return $resource('logbook/savecharts/', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
