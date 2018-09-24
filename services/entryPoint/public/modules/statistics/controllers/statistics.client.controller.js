'use strict';

// Statistics controller
angular.module('statistics').controller('StatisticsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Statistics', 'filterFilter',
	function($scope, $http, $stateParams, $location, Authentication, Statistics, filterFilter) {
		$scope.authentication = Authentication;
		$scope.allActivities = [];
		$scope.filtered = [];
		$scope.activities = [];
		$scope.numPerPage = 10;
		$scope.maxSize = 10;
		$scope.search = '';
		$scope.currentLargePage = 1;
		$scope.currentPage = 1;
		$scope.numPerLargePage = 100;
		$scope.pageInterval = $scope.numPerLargePage / $scope.numPerPage;


		$scope.activities = function() {
			$http.get('/statistics/activityStatisticsCount').success(function(count) {
				$scope.totalNumFixed = Number(count.count);
				$scope.totalNum = $scope.totalNumFixed;

				$http.get('/statistics/activityStatistics', {params: {numPerPage: $scope.numPerLargePage, currentPage: $scope.currentLargePage}}).success(function(response) {
					//console.log(response);
					$scope.allActivities = response;

					$scope.filtered = $scope.allActivities;
					$scope.activities = $scope.filtered.slice(0, $scope.numPerPage);
					$scope.search = '';

				}).error(function(response) {
					$scope.error = response.message;
				});
			});

		};

		$scope.usersStatistics = function() {
			$http.get('/statistics/userStatistics', $scope.credentials).success(function(response) {
				$scope.usersStatistics = response;
				$scope.parseStatistics($scope.usersStatistics);

			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.orgStatistics = function() {
			$http.get('/statistics/orgStatistics', $scope.credentials).success(function(response) {
				$scope.orgsStatistics = response;
				// $scope.parseStatistics($scope.usersStatistics);

			}).error(function(response) {
				$scope.error = response.message;
			});
		};
		$scope.orgStatistics();
		
		$scope.updateActivitiesList = function(cb) {
			console.log($scope.currentPage);
			if($scope.search === '') {
				$scope.currentPageBack = $scope.currentPage;
			}
			if($scope.currentLargePage !== Math.floor(($scope.currentPage-1) / $scope.pageInterval) + 1 && $scope.search === '') {
				//update the user list
				$scope.currentLargePage  = Math.floor(($scope.currentPage-1) / $scope.pageInterval) + 1;
				$http.get('/statistics/activityStatistics',{params: {numPerPage: $scope.numPerLargePage, currentPage: $scope.currentLargePage}}).success(function(res) {
					console.log(res.length);
					$scope.allActivities = res;
					$scope.filtered = $scope.allActivities;
					cb();
				});
			} else {
				cb();
			}
		};


		// $scope.filtered = [];
		// $scope.users = [];
		// $scope.numPerPage = 25;
		// $scope.maxSize = 5;

		$scope.$watch('search', function (newVal, oldVal) {
			// console.log('search changed to :' + newVal);
			// if (newVal) {
			// 	console.log(newVal.toString());
			// 	$scope.filtered = filterFilter($scope.allActivities, newVal);
			// }
			// $scope.filtered.sort(function(a, b) {
			// 	return new Date(b.activityTime) -  new Date(a.activityTime);
			// });
			// console.log($scope.filtered.length);
			// if ($scope.filtered.length)
			// 	$scope.currentPage = 1;
			// var begin = (($scope.currentPage - 1) * $scope.numPerPage);
			// var end = begin + $scope.numPerPage;
            //
			// $scope.activities = $scope.filtered.slice(begin, end);
			// $scope.totalNum = $scope.filtered.length;

			if (newVal === oldVal) return;
			console.log('search changed to :' + newVal);
			$scope.search = newVal;
			var begin = 0;
			var end = $scope.numPerPage;
			if (newVal) {
				$scope.filtered = filterFilter($scope.allActivities, newVal);
				$scope.filtered.sort(function(a, b) {
					return new Date(b.registrationTime) -  new Date(a.registrationTime);
				});
				if ($scope.filtered.length)
					$scope.currentPage = 1;
				begin = (($scope.currentPage - 1) * $scope.numPerPage);
				end = begin + $scope.numPerPage;
				$scope.activities = $scope.filtered.slice(begin, end);
				$scope.totalNum = $scope.filtered.length;
			} else {
				$scope.filtered = $scope.allActivities;
				$scope.currentPage = $scope.currentPageBack;
				begin = (($scope.currentPage - 1) * $scope.numPerPage);
				end = begin + $scope.numPerPage;
				$scope.activities = $scope.filtered.slice(begin, end);
				$scope.totalNum = $scope.totalNumFixed;
			}
		});


		$scope.$watch('currentPage + numPerPage', function() {
			// console.log('currentPage changed.');
			// var begin = (($scope.currentPage - 1) * $scope.numPerPage);
			// var end = begin + $scope.numPerPage;
            //
			// $scope.activities = $scope.filtered.slice(begin, end);
			// $scope.totalNum = $scope.filtered.length;

			$scope.updateActivitiesList(function() {
				var begin = ($scope.currentPage -1) % $scope.pageInterval * $scope.numPerPage;
				var end = begin + $scope.numPerPage;
				$scope.filtered = $scope.allActivities;
				$scope.activities = $scope.filtered.slice(begin, end);
				console.log('len: ',$scope.activities.length);
				if($scope.search === '') {
					$scope.totalNum = $scope.totalNumFixed;
				} else {
					$scope.totalNum = $scope.filtered.length;
				}
				console.log('totalNum:', $scope.totalNum);
			});
		});



		$scope.parseStatistics = function(stats) {
			$scope.newUserLabels = [];
			$scope.newUserData = [[]];

			$scope.activeUserLabels = [];
			$scope.activeUserData = [[]];

			stats.newUserStats.forEach(function(newUserStat) {
				$scope.newUserLabels.push(newUserStat._id.month +'/' + newUserStat._id.day + '/' + newUserStat._id.year);
				$scope.newUserData[0].push(newUserStat.count);
			});

			stats.activeUserStats.forEach(function(activeUserStat) {
				$scope.activeUserLabels.push(activeUserStat._id.month +'/' + activeUserStat._id.day + '/' + activeUserStat._id.year);
				$scope.activeUserData[0].push(activeUserStat.count);
			});
		};
	}
]);

angular.module('statistics').controller('StatisticsSearchController',[ '$scope', '$http', '$stateParams','Authentication', 'Admin', '$modal',
	function($scope, $http, $stateParams, Authentication, Admin, $modal) {
		$scope.authentication = Authentication;
		$scope.activities = [];
		$scope.numPerPage = 10;
		$scope.maxSize = 10;
		$scope.currentPage = 1;
		$scope.allActivities = [];

		$scope.searchActivities = function() {
			var t = '<div class="modal-header">'+
				'<h4>SEARCHING...</h4>' +
				'</div>';

			var modalInstance = $modal.open({
				animation: true,
				template:  t
			});
			modalInstance.result.then(function (result) {
				$scope.initialized = result.isInitialized;
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
			$http.get('/statistics/activityStatistics',{params: {search: $stateParams.search}}).success(function (res) {
				$scope.allActivities = res;
				$scope.searchContent = $stateParams.search;
				$scope.totalNum = $scope.allActivities.length;
				$scope.activities = $scope.allActivities.slice(0, $scope.numPerPage);

			});
			setTimeout(function () {
				modalInstance.close({isInitialized: true});
			}, 1000);
		};

		$scope.$watch('currentPage + numPerPage', function() {
			var begin = ($scope.currentPage-1)*$scope.numPerPage;
			var end = begin + $scope.numPerPage;
			$scope.activities = $scope.allActivities.slice(begin, end);
		});
	}
]);
