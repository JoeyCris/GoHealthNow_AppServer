/**
 *
 * Created by Canon on 2016-02-16.
 */
'use strict';

//Brand service used for communicating with the articles REST endpoints

angular.module('brand').factory('Brand', ['$resource',
	function($resource) {
		return $resource('/GlucoGuide/brandInfo/:brandId', {
			brandId: '@accessCode'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
