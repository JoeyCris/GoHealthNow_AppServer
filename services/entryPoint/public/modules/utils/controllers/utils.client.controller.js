/**
 * Created by Canon on 2016-03-06.
 */
'use strict';
angular.module('utils', ['ui.bootstrap'])
	.controller('DietSidebarCtrl', ['$scope', '$window','$rootScope', '$stateParams', 'Admin',
		function ($scope, $window, $rootScope, $stateParams, Admin) {
			if($window.innerWidth < 1400 ) {
				$scope.isCollapsed = false;
			}
			$scope.status = {
				isopen: true
			};
			$scope.isCollapsed = true;
			$scope.user = Admin.get({userId: $stateParams.userId}, function (res) {
				// console.log('res:', res);
				//$scope.status.isopen = true;
			});
			var w = angular.element($window);
			w.bind('resize', function() {
				if($window.innerWidth < 1400 && $scope.isCollapsed) {
					$scope.isCollapsed = false;
					$scope.status.isopen = false;
					$scope.$apply();
				}
			});

			$scope.initSideBar = function() {
				if($window.innerWidth < 1400 ) {
					$scope.status.isopen = false;
				} else {
					$scope.status.isopen = true;
				}

			};



			// $scope.toggled = function(open) {
			// 	$log.log('Dropdown is now: ', open);
			// };

			// $scope.toggleDropdown = function($event) {
			// 	$event.preventDefault();
			// 	$event.stopPropagation();
			// 	$scope.status.isopen = !$scope.status.isopen;
			// };


		}])
	.directive('dietSidebar', ['$window', function($window) {
		return {
			restrict: 'E',
			templateUrl: '/modules/utils/views/diet-sidebar.html'
		};
	}]);

