/**
 * Created by robert on 17/05/16.
 */

'use strict';
//angular.module('dietitians').controller('ReminderController', ['$scope', '$stateParams', '$location', 'Authentication', 'UserGoals', 'Admin', 'Users', '$http','$modal', '$filter',
//		function($scope, $stateParams, $location, Authentication, UserGoals, Admin, Users, $http, $modal, $filter) {
//			$scope.authentication = Authentication;
//			$scope.user = $scope.authentication.user;
//			$scope.exerciseGoalTypeEnum = ['Light', 'Weekly Moderate/Vigorous Exercises','Daily Step Count', 'Weekly Step Count'];
//			$scope.weightGoalTypeEnum = ['Lose','Gain'];
//			$scope.goals = {};
//			$scope.details = {};
//			$scope.animationsEnabled = true;
//			// console.log($stateParams.userID);
//
//			$scope.seeDetail= function (records) {
//				var modalInstance = $modal.open({
//					animation: true,
//					templateUrl: '/modules/dietitians/directives/my-goal.detail.client.template.html',
//					controller: 'ReminderDetailModalCtrl',
//					resolve: {
//						records: function () {
//							return records;
//						}
//					}
//				});
//
//			};
//
//			$scope.getReminders = function() {
//				var userID = $stateParams.userId;
//
//				$http.get('/userRecords/reminder/' + userID, $scope.credentials).success(function (response) {
//					$scope.details = response;
//
//					$scope.description = JSON.stringify(response);
//				});
//			};
//
//
//		}]
//);
//


//Parameters of Medication:
//	<Parameters>
//<Dose>820</Dose>
//<Unit>mg</Unit> <!-- mg/mL -->
//<MedicineID>in011</MedicineID>  <!--if it is user entered, leave it blank -->
//<MedicineName>Humulin N</MedicineName>
//<MedicineType>0</MedicineType><!-- 0 for user entered, others for system provided -->
//</Parameters>

//Parameters of BloodGlucose:
//	<Parameters>
//<GlucoseType>1</GlucoseType> <!-- 0: before breakfast, 1: after breakfast, 2: before lunch, 3: after lunch, 4: before dinner, 5: after dinner, 6: bedtime, 7: other. -->
//</Parameters>
//
//Parameters of Exercise:
//	<Parameters>
//<ExerciseType>0</ExerciseType><!-- 0 for light, 1 for moderate, 2 for vigorous -->
//</Parameters>
//
//Parameters of Meal:
//	<Parameters>
//<MealType>1</MealType> <!-- 0 for snack, 1 for breakfast, 2 for lunch, 3 for supper -->
//</Parameters>

angular.module('dietitians').controller('ReminderDetailModalCtrl', function ($scope, $modalInstance, records) {

	$scope.records = [];


	$scope.parameters =[
		//Parameters of Medication:
		{
			dose: { name: 'Dose'},
			unit: { name: 'Unit'},
			medicineName: { name: 'Medicine Name'}
		},
		//Parameters of BloodGlucose:
		{
			glucoseType: {
				name: 'Glucose Type',
				value: ['Before Breakfast', 'After Breakfast', 'Before Lunch', 'After Lunch', 'Before Dinner', 'After Dinner', 'Bedtime', 'Other']
			}
		},
		//Parameters of Exercise:
		{
			//exerciseType: {
			//	name: 'Exercise Type',
			//	value: ['Light', 'Moderate', 'Vigorous']
			//}
		},
		//Parameters of Meal:
		{
			mealType: {
				name: 'Meal Type',
				value: ['Snack', 'Breakfast', 'Lunch', 'Dinner']
			}
		}
	];

	$scope.getParemeters = function(reminderTyp, parameters ) {
		var showList = $scope.parameters[reminderTyp];
		var pairs = [];
		for(var key in showList){
			var para = showList[key];

			//if(para) {
				if (para.value) {
					pairs.push({
						name: para.name,
						value: para.value[parameters[key]]
					});
				} else {
					pairs.push({
						name: para.name,
						value: parameters[key]
					});
				}

			//}
		}

		return pairs;
	};

	$scope.reminderTypeEnum = ['Medication', 'Blood Glucose', 'Exercise', 'Diet'];
	$scope.repeatTypeEnum = ['For Once','Daily'];

	//$scope.records = records;

	records.forEach(function(row) {
		row.paras = $scope.getParemeters(row.reminderType, row.parameters);

		$scope.records.push(row);

	});


	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

});


