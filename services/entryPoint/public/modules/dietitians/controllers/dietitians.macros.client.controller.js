/**
 * Created by robert on 13/06/16.
 */


/**
 * Created by robert on 27/05/16.
 */
'use strict';


angular.module('dietitians').controller('MacrosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reminders', 'MacrosGoal', 'Admin', 'Users', '$http','$modal', '$filter',
	function($scope, $stateParams, $location, Authentication, Reminders, MacrosGoal, Admin, Users, $http, $modal, $filter) {
		$scope.authentication = Authentication;


		$scope.setFat = function() {
			$scope.fat = Math.round((100 - $scope.carbs - $scope.protein)*10)/10;
			if(!$scope.fat || $scope.fat < 0 || $scope.fat >= 100) {
				return 'N/A';
			} else {
				return $scope.fat;
			}
		};

		$scope.setMacros = function() {

			if(! $scope.fat || $scope.fat < 0 || $scope.fat >= 100) {
				$scope.error = 'Invalid value';

			} else {
				$scope.error = null;
				$scope.carbs = Math.round(10* $scope.carbs)/10;
				$scope.protein = Math.round(10* $scope.protein)/10;

				$scope.setFat();

				$scope.updateToServer();

				if($scope.checked) {
					$scope.sendTip();
				}

			}


		};

		$scope.setBy = 'automatically';
		$scope.isDefaultContent = true;
		$scope.checked = true;

		$scope.$watch('carbs', function() {
			$scope.setFat();

			$scope.initTipContent();


		});

		$scope.$watch('protein', function() {
			$scope.setFat();

			$scope.initTipContent();


		});


		$scope.initTipContent = function() {

			if($scope.isDefaultContent) {


					$scope.tipContent = 'Your calories distribution has been changed.' +
					'(Carbs:' + $scope.carbs + '%; ' +
					'Protein:' + $scope.protein + '%; ' +
					'Fat:' + $scope.fat + '%) ';

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

		$scope.updateToServer = function() {
			$scope.success = $scope.error = null;

			var goal = new MacrosGoal({
				userID:$stateParams.userId,
				carbs: $scope.carbs/100,
				protein: $scope.protein/100,
				fat: $scope.fat/100

			});



			goal.$update(function(response) {
				$scope.success = true;

				//Authentication.user = response;
			}, function(response) {
				$scope.error = response.data.message;
			});
		};


		$scope.getUserProfile = function() {

			Admin.get({
				userId: $stateParams.userId
			}, function (response) {
				$scope.user = response;



				//console.log('user:'+JSON.stringify($scope.user));

			});

			MacrosGoal.get({
				userID:$stateParams.userId
			}, function(res) {
				//console.log(JSON.stringify(res));

				$scope.carbs = res.carbs * 100;
				$scope.protein = res.protein * 100;

			});

		};

		$scope.getUserProfile();

	}
]);
