'use strict';

// Dietitians controller
angular.module('dietitians').controller('DietitiansController', ['$scope', '$stateParams', '$location', 'Authentication', 'Brand', 'Dietitians', 'Admin','$filter','filterFilter','$http','$modal',
	function($scope, $stateParams, $location, Authentication, Brand, Dietitians, Admin, $filter, filterFilter, $http, $modal) {
		$scope.authentication = Authentication;
		$scope.dietitian = $scope.authentication.user;
		$scope.userRole = $scope.authentication.user.roles[0];


		if(!$scope.targetUserId) {
			$scope.targetUserId = $stateParams.userId;
		}


		// Model
		$scope.animationsEnabled = true;



		$scope.toggleAnimation = function () {
			$scope.animationsEnabled = !$scope.animationsEnabled;
		};

		// end Model

		$scope.filtered = [];
		$scope.users = [];
		$scope.numPerPage = 10;
		$scope.maxSize = 5;


		var t = '<div class="modal-header">'+
			'<h4>LOADING...</h4>' +
			'</div>';

		//var modalInstance = $modal.open({
		//	animation: true,
		//	template:  t
		//});
        //
		//modalInstance.result.then(function (result) {
		//	$scope.initialized = result.isInitialized;
		//}, function () {
		//	console.log('Modal dismissed at: ' + new Date());
		//});

		$scope.listUsers = function() {
			$scope.allUsers = Dietitians.query(function(){

				$scope.filtered = $scope.allUsers;
				$scope.search = '';
				//setTimeout(function() {
				//	modalInstance.close({ isInitialized: true});
				//}, 500);

				var accessCodeList = $scope.authentication.user.accessCode.split(':');

				$scope.getBrandInfo(accessCodeList[0]);

			});
		};


		$scope.getBrandInfo = function (accessCode) {
			Brand.get({
				brandId: accessCode
			},function(data){
				$scope.brandInfo = data.medias[0];
			});
		};


		$scope.$watch('search', function (newVal, oldVal) {
			if (newVal) {
				$scope.filtered = filterFilter($scope.allUsers, newVal);
			}
			$scope.filtered.sort(function(a, b) {
				return new Date(b.retrieveTime) -  new Date(a.retrieveTime);
			});
			if ($scope.filtered.length)
				$scope.currentPage = 1;
			var begin = (($scope.currentPage - 1) * $scope.numPerPage);
			var end = begin + $scope.numPerPage;

			$scope.users = $scope.filtered.slice(begin, end);
			$scope.totalNum = $scope.filtered.length;

			$scope.updateBGSummary($scope.users);
		});

		$scope.bgData = {};

		$scope.updateBGSummary = function(users) {
			if(!users || users.length === 0) {
				//console.log('Users have not been loaded yet');
				return;
			}
			$scope.bgData = {};

			var params = [];
			users.forEach(function(user) {
				params.push({
						userId: user.userID,
						endTime: user.retrieveTime
					}

				);
			});

			$http.post('/statistics/bg/', {users:params}).success(function(data, status) {

				$scope.bgData = data;
				//data.forEach(function(row, index){
				//	console.log('bg summary;' + JSON.stringify(row));
                //
				//	$scope.bgData[row.user] = {high: row.high, low: row.low};
                //
                //
				//	//if($scope.users[index].userID === row.user) {
                 //   //
				//	//	$scope.users[index].numOfHigh = row.high;
				//	//	$scope.users[index].numOfLow = row.low;
				//	//}
				//});
			});
		};


		$scope.$watch('currentPage + numPerPage', function() {
			var begin = (($scope.currentPage - 1) * $scope.numPerPage);
			var end = begin + $scope.numPerPage;

			$scope.users = $scope.filtered.slice(begin, end);
			$scope.totalNum = $scope.filtered.length;

			$scope.updateBGSummary($scope.users);
		});

	}
]);

