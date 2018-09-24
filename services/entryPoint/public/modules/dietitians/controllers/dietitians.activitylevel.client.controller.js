/**
 * Created by robert on 27/05/16.
 */
'use strict';


angular.module('dietitians').controller('ActivityLevelController', ['$scope', '$stateParams', '$location', 'Authentication', 'ActivityLevel', 'Admin', 'Users', 'Reminders', '$http','$modal', '$filter',
	function($scope, $stateParams, $location, Authentication, ActivityLevel, Admin, Users, Reminders, $http, $modal, $filter) {
		$scope.authentication = Authentication;



		$scope.setActivityLevel = function() {
			$scope.success = $scope.error = null;


			if(! $scope.activityLevel || $scope.activityLevel > 3 || $scope.activityLevel <0.1) {
				$scope.error = 'The value of activity level should be between 0.1 and 3';

			} else {

				$scope.user.activityLevel = $scope.activityLevel;
				$scope.user.targetCalories = Math.round($scope.bmr * $scope.activityLevel + $scope.user.targetWeightGoal);
				$scope.updateToServer();

				if($scope.checked) {
					$scope.sendTip();
				}
			}


		};

		$scope.isDefaultContent = true;
		$scope.checked = true;

		$scope.$watch('activityLevel', function() {

			$scope.targetCalories = $scope.getTargetCalories();
			$scope.initTipContent();


		});


		$scope.initTipContent = function() {

			if($scope.isDefaultContent) {

				$scope.tipContent = 'Your recommended daily calories has been changed to ' +
				  $filter('number')($scope.targetCalories, 0) +
				', which is based on your new activity level('  + $scope.activityLevel + ').';
			}

		};

		$scope.setTipContent = function() {

			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/modules/dietitians/directives/my-activitylevel.setcontent.client.template.html',
				controller: 'SetTipContentModalCtrl',
				resolve: {
					content: function () {
						return $scope.tipContent;
					}
				}
			});

			modalInstance.result.then(function (result) {


				$scope.tipContent = result.tipContent;
				$scope.isDefaultContent = false;

			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};




		$scope.getTargetCalories = function() {
			if(! $scope.activityLevel || ! $scope.user|| $scope.activityLevel > 3 || $scope.activityLevel <0.1) {
				return 'N/A';
			} else {
				var calories = $scope.bmr * $scope.activityLevel + $scope.user.targetWeightGoal;

				return calories.toFixed(0);
			}
		};

		$scope.setBy = 'automatically';


		$scope.getUserProfile = function() {

			Admin.get({
				userId: $stateParams.userId
			}, function (response) {
				$scope.user = response;

				if(! $scope.user.activityLevel) {
					$scope.user.activityLevel = 1.2;
				}

				if(! $scope.user.targetWeightGoal) {
					$scope.user.targetWeightGoal = 0;
				}

				if(! $scope.user.targetCalories) {

					var age = new Date().getFullYear() -  $scope.user.dob;
					if ($scope.user.gender === 0) { //male
						$scope.bmr = 88.362 + 13.397 * ($scope.user.weight) + 4.799 * $scope.user.height - 5.677 * age;
					} else {
						$scope.bmr = 447.593 + 9.247 * $scope.user.weight + 3.098 * $scope.user.height - 4.330 * age;
					}
					$scope.user.targetCalories = 1.2 * $scope.bmr;

				} else {
					$scope.bmr = ($scope.user.targetCalories - $scope.user.targetWeightGoal)/ $scope.user.activityLevel;

				}



				$scope.activityLevel = $scope.user.activityLevel;

				//console.log('user:'+JSON.stringify($scope.user));

			});

		};

		$scope.updateToServer = function() {
			$scope.success = $scope.error = null;

			var activityLevel = new ActivityLevel({
				userID:$stateParams.userId,
				activityLevel:$scope.activityLevel,
				targetCalories:$scope.user.targetCalories

			});



			activityLevel.$update(function(response) {
				$scope.success = true;

				//Authentication.user = response;
			}, function(response) {
				$scope.error = response.data.message;
			});
		};

		$scope.sendTip = function() {



			var tip = new Reminders({
				send_push: true,
				//send_email: false,
				user: $stateParams.userId,
				signature: 'GlucoGuide',
				type: 'reminder',
				creator: Authentication.user.userID,
				description: $scope.tipContent
			});


			// Redirect after save
			tip.$save(function(response) {
				//
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.getUserProfile();

	}
]);

angular.module('dietitians').controller('SetTipContentModalCtrl', function ($scope, $modalInstance, content) {
	$scope.tipContent = content;
	$scope.error = null;


	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.ok = function(){
		if(!$scope.tipContent || $scope.tipContent.length === 0) {
			$scope.error = 'Content can not be empty';
		} else {
			$scope.error = null;
			$modalInstance.close({
				tipContent:$scope.tipContent
			});
		}

	};

});
