'use strict';

angular.module('dietitians')
	.directive('myMeal', [
		function () {
			return {
				restrict: 'E',
				scope: {
					meal: '=meal',
					collapsed: '=collapsed',
					title: '@title'
				},
				templateUrl: '/modules/dietitians/directives/my-meal.client.template.html'
			};
		}
	]).directive('mealAndGlucose',[
		function() {
			return {
				restrict: 'E',
				scope: {
					before: '=before',
					meal: '=meal',
					after: '=after',
					title: '@title'
				},
				templateUrl: '/modules/dietitians/directives/meal-and-glucose.template.html'
			};
		}
	]).directive('mySleep',[
		function() {
			return {
				restrict: 'E',
				scope: {
					sleep: '=sleep',
					glucose: '=glucose'
				},
				templateUrl: '/modules/dietitians/directives/my-sleep.client.template.html'
			};
		}
	]).directive('myBloodGlucose',[
		function() {
			return {
				restrict: 'E',
				scope: {
					glucoses: '=glucoses',
					title: '@title'
				},
				templateUrl: '/modules/dietitians/directives/my-blood-glucose.client.template.html'
			};
		}
	]).directive('myWeight',[
		function() {
			return {
				restrict: 'E',
				scope: {
					weight: '=weight'
				},
				templateUrl: '/modules/dietitians/directives/my-weight.client.template.html'
			};
		}
	]).directive('printOthers',[
		function() {
			return {
				restrict: 'E',
				scope: {
					records: '=records'
				},
				templateUrl: '/modules/dietitians/directives/print-others.client.template.html'
			};
		}
	]).directive('mySummary',[
		function() {
			return {
				restrict: 'E',
				scope: {
					summary: '=summary'
				},
				templateUrl: '/modules/dietitians/directives/my-summary.client.template.html'
			};
		}
	]).directive('printGlucose',[
		function() {
			return {
				restrict: 'E',
				scope: {
					bg: '=bg'
				},
				templateUrl: '/modules/dietitians/directives/print-glucose.client.template.html'
			};
		}

	]).directive('printMeal',[
		function() {
			return {
				restrict: 'E',
				scope: {
					diet: '=diet'
				},
				templateUrl: '/modules/dietitians/directives/print-meal.client.template.html'
			};
		}
	]).directive('myOtherRecords',[
		function() {
			return {
				restrict: 'E',
				scope: {
					title: '@title',
					collapsed: '=',
					records: '=records'
				},
				/*link: function(scope, elements, attrs) {
				 try {
				 scope.records = JSON.parse(attrs.records);
				 } catch (e) {
				 scope.$watch(function() {
				 return scope.$parent.$eval(attrs.records);
				 }, function(newValue, oldValue) {
				 scope.records = newValue;
				 });
				 }
				 },*/
				templateUrl: '/modules/dietitians/directives/my-other-records.client.template.html'
			};
		}
	]);
