/**
 * Created by robertwang on 2016-08-23.
 */


/**
 * Created by robert on 21/03/16.
 */
'use strict';


angular.module('dietitians').controller('A1CDetailModalCtrl', function ($scope, $modalInstance, $http, userID) {

	$scope.userID = userID;

	console.log('a1c modal ctrl: user: ' + userID);

	$scope.dataLoaded = false;
	$scope.records = [];

	$scope.init = function() {
		var config = {};//$scope.credentials;
		config.params = {
			userID: userID
		};


		$http.get('/userRecords/details/a1c', config).success(function (response) {
			$scope.records = response;
			$scope.dataLoaded = true;
		});
	};

	$scope.init();

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

});



angular.module('dietitians').controller('WeightDetailModalCtrl', function ($scope, $modalInstance, $http, userID) {

	$scope.userID = userID;

	console.log('a1c modal ctrl: user: ' + userID);

	$scope.dataLoaded = false;
	$scope.records = [];

	$scope.init = function() {
		var config = {};//$scope.credentials;
		config.params = {
			userID: userID
		};


		$http.get('/userRecords/details/weight', config).success(function (response) {
			$scope.records = [];

			response.forEach(function(data) {
				if(data.weightValue && data.recordedTime) {
					$scope.records.push(data);
				}
			});

			$scope.dataLoaded = true;
		});
	};

	$scope.init();

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

});
