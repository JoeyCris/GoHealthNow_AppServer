/**
 * Created by robertwang on 16-03-21.
 */
'use strict';

angular.module('dietitians')
	.directive('myExercise',[
	function() {
		return {
			restrict: 'E',
			scope: {
				exercises: '=exercises'
			},
			templateUrl: '/modules/dietitians/directives/my-exercise.client.template.html',
			controller: 'ExerciseController'
		};
	}
]).directive('exerciseInDetail',[
		function() {
			return {
				restrict: 'E',
				scope: {
					records: '='
				},
				templateUrl: '/modules/dietitians/directives/my-exercise.detail.client.template.html'
			};
		}
	]);
