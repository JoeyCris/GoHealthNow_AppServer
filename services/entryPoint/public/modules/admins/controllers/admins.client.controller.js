'use strict';

// Admins controller
angular.module('admins').controller('AdminsController', ['$scope', '$http', '$filter', '$stateParams', '$location',
	'Authentication', 'Admin', 'OrgAdmin', 'filterFilter', 'Brand',
	function($scope, $http, $filter,$stateParams, $location, Authentication, Admin, OrgAdmin, filterFilter, Brand) {
		$scope.authentication = Authentication;


		$scope.dataInitialized = false;
		$scope.allUsers = [];
		$scope.filtered = [];
		$scope.users = [];
		$scope.numPerPage = 10;
		$scope.maxSize = 10;
		$scope.search = '';
		$scope.currentLargePage = 1;
		$scope.currentPage = 1;
		$scope.numPerLargePage = 100;
		$scope.pageInterval = $scope.numPerLargePage / $scope.numPerPage;

		$scope.updatePagination = function() {
			if ($scope.filteredOrgUsers.length)
				$scope.currentOrgPage = 1;
			var begin = (($scope.currentOrgPage - 1) * $scope.numPerPage);
			var end = begin + $scope.numPerPage;

			$scope.orgUsers = $scope.filteredOrgUsers.slice(begin, end);
			$scope.orgTotalNum = $scope.filteredOrgUsers.length;
			//console.log($scope.filteredOrgUsers.length);
		};

		$scope.listUsers = function() {
			$http.get('/admin/userCount').then(function(count) {
				$scope.totalNumFixed = Number(count.data.count);
				$scope.totalNum = $scope.totalNumFixed;
				$scope.allUsers = Admin.query({numPerPage: $scope.numPerLargePage, currentPage:$scope.currentLargePage}, function(){
					$scope.filtered = $scope.allUsers;
					$scope.users = $scope.filtered.slice(0, $scope.numPerPage);
					$scope.search = '';
				});

			});
		};

		$scope.updateUserList = function(cb) {
			console.log($scope.currentPage);
			if($scope.search === '') {
				$scope.currentPageBack = $scope.currentPage;
			}
			if($scope.currentLargePage !== Math.floor(($scope.currentPage-1) / $scope.pageInterval) + 1 && $scope.search === '') {
				//update the user list
				$scope.currentLargePage  = Math.floor(($scope.currentPage-1) / $scope.pageInterval) + 1;
				$scope.allUsers = Admin.query({numPerPage: $scope.numPerLargePage, currentPage: $scope.currentLargePage}, function() {
					$scope.filtered = $scope.allUsers;
					cb();
				});
			} else {
				cb();
			}
		};

		$scope.$watch('search', function (newVal, oldVal) {
			if (newVal === oldVal) return;
			console.log('search changed to :' + newVal);
			$scope.search = newVal;
			var begin = 0;
			var end = $scope.numPerPage;
			if (newVal) {
				$scope.filtered = filterFilter($scope.allUsers, newVal);
				$scope.filtered.sort(function(a, b) {
					return new Date(b.registrationTime) -  new Date(a.registrationTime);
				});
				if ($scope.filtered.length)
					$scope.currentPage = 1;
				begin = (($scope.currentPage - 1) * $scope.numPerPage);
				end = begin + $scope.numPerPage;
				$scope.users = $scope.filtered.slice(begin, end);
				$scope.totalNum = $scope.filtered.length;
			} else {
				$scope.filtered = $scope.allUsers;
				$scope.currentPage = $scope.currentPageBack;
				begin = (($scope.currentPage - 1) * $scope.numPerPage);
				end = begin + $scope.numPerPage;
				$scope.users = $scope.filtered.slice(begin, end);
				$scope.totalNum = $scope.totalNumFixed;
			}
		});


		$scope.$watch('currentPage + numPerPage', function(newVal, oldVal) {
			//if (newVal === oldVal) return;
			//console.log('currentPage changed.');
			$scope.updateUserList(function() {
				var begin = ($scope.currentPage -1) % $scope.pageInterval * $scope.numPerPage;
				var end = begin + $scope.numPerPage;
				$scope.filtered = $scope.allUsers;
				$scope.users = $scope.filtered.slice(begin, end);
				console.log('len: ',$scope.users.length);
				if($scope.search === '') {
					$scope.totalNum = $scope.totalNumFixed;
				} else {
					$scope.totalNum = $scope.filtered.length;
				}
				console.log('totalNum:', $scope.totalNum);
			});
		});


		// Find a User
		$scope.findOne = function() {
			$scope.user = Admin.get({
				userId: $stateParams.userId
			});
			console.log('find one');
			//console.log($scope.user);
		};

		// Update existing User Profile
		$scope.updateUserProfile = function() {
			var user = $scope.user;

			user.$update(function() {
				$scope.updateDone = true;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};


		// Update existing User Password
		$scope.updateUserPassword = function() {
			var user = $scope.user;

			user.$update(function() {
				$scope.ChangeDone = true;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
	}
]).controller('AdminsUserSearchController', [ '$scope', '$http', '$stateParams','Authentication', 'Admin', '$modal',
	function($scope, $http, $stateParams, Authentication, Admin, $modal) {
		$scope.authentication = Authentication;
		$scope.users = [];
		$scope.numPerPage = 10;
		$scope.maxSize = 10;
		$scope.currentPage = 1;
		$scope.allUsers = [];

		$scope.searchUsers = function() {
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
			$scope.allUsers = Admin.query({search: $stateParams.search}, function (res) {
				$scope.allUsers = res;
				$scope.searchContent = $stateParams.search;
				$scope.totalNum = $scope.allUsers.length;
				$scope.users = $scope.allUsers.slice(0, $scope.numPerPage);

			});
			setTimeout(function () {
				modalInstance.close({isInitialized: true});
			}, 1000);
		};

		$scope.$watch('currentPage + numPerPage', function() {
			var begin = ($scope.currentPage-1)*$scope.numPerPage;
			var end = begin + $scope.numPerPage;
			$scope.users = $scope.allUsers.slice(begin, end);
		});


	}
]);
