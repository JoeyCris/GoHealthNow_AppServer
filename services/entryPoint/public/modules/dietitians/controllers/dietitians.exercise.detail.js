/**
 * Created by robert on 21/03/16.
 */
'use strict';

angular.module('dietitians').controller('ExerciseController',
	['$scope','$modal','$http', function($scope, $modal, $http) {


	$scope.seeDetail = function(userID, date) {

		//console.log(JSON.stringify($parent.credentials));
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: '/modules/dietitians/directives/my-exercise.detail.client.template.html',
			controller: 'ExerciseDetailModalCtrl',
			resolve: {
				userID: function () {
					return userID;
				},
				day: function () {
					return date;
				}
			}
		});


	};

}
]);

angular.module('dietitians').controller('ExerciseDetailModalCtrl', function ($scope, $modalInstance, $http, userID, day) {

	$scope.userID = userID;
	$scope.day = day;
	$scope.dataLoaded = false;
	$scope.records = [];

	$scope.init = function() {
		var config = {};//$scope.credentials;
		config.params = {
			userID: userID,
			date: day
		};


		$http.get('/userRecords/exercise/details', config).success(function (response) {
			$scope.records = response;
			$scope.dataLoaded = true;
		});
	};

	$scope.init();

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

});
