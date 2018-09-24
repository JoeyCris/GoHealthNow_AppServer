/**
 * Created by Canon on 2016-03-29.
 */
'use strict';
angular.module('dietitians').controller('GoalController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reminders', 'UserGoals', 'Admin', 'Users', '$http','$modal', '$filter',
	function($scope, $stateParams, $location, Authentication, Reminders, UserGoals, Admin, Users, $http, $modal, $filter) {
		$scope.authentication = Authentication;
		$scope.user = $scope.authentication.user;
		$scope.exerciseGoalTypeEnum = ['Light', 'Weekly Moderate/Vigorous Exercises','Daily Step Count', 'Weekly Step Count'];
		$scope.bloodGlucoseGoalTypeEnum = ['Lower Bound', 'Upper Bound'];
		$scope.weightGoalTypeEnum = ['Lose','Gain'];
		$scope.weightGoalTypeEnum2 = [
			{
				type:0,
				target:0.2,
				description:'Lose 0.2 kg per week'
			},
			{
				type:0,
				target:0.5,
				description:'Lose 0.5 kg per week'
			},
			{
				type:0,
				target:0.8,
				description:'Lose 0.8 kg per week'
			},
			{
				type:0,
				target:1,
				description:'Lose 1 kg per week'
			},
			{
				type:0,
				target:0.0,
				description:'Maintain weight'
			},
			{
				type:1,
				target:0.2,
				description:'Gain 0.2 kg per week'
			},
			{
				type:1,
				target:0.5,
				description:'Gain 0.5 kg per week'
			},
			{
				type:1,
				target:0.8,
				description:'Gain 0.8 kg per week'
			},
			{
				type:0,
				target:1,
				description:'Gain 1 kg per week'
			}];
		$scope.goals = {};
		$scope.details = {};
		$scope.animationsEnabled = true;
		// console.log($stateParams.userID);

		$scope.seeGoalsInDetail= function (goals) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/modules/dietitians/directives/my-goal.detail.client.template.html',
				controller: 'GoalDetailModalCtrl',
				resolve: {
					goals: function () {
						return goals;
					}
				}
			});

		};

		$scope.genDetails = function ()  {
			var description = '';
			if($scope.goals.weightGoal && $scope.goals.weightGoal.isSet) {
			    description += 'Weight Goal';
				$scope.details.weightGoal = $scope.goals.weightGoal;

		    }

			var exerciseGoals = [];
			$scope.goals.exerciseGoal.forEach(function(exercise) {
				if(exercise.isSet) {
					exerciseGoals.push(exercise);
				}
			});


			$scope.details.exerciseGoal = exerciseGoals;


			if(exerciseGoals.length !== 0) {
				if(description.length !== 0) {
					description += '/';
				}

				description += 'Exercise Goal';
			}

		    $scope.details.description = description;

		};



		$scope.toggleAnimation = function () {
			$scope.animationsEnabled = !$scope.animationsEnabled;
		};

		// $scope.getTypeById = function(id) {
		// 	return ['Light', 'Weekly Moderate/Vigorous Exercises','Daily Step Count', 'Weekly Step Count'][id];
		// };

		$scope.getLatestGoal = function() {
			$scope.userProfile = Admin.get({userId: $scope.user.userID}, function (res) {
				$scope._getLatestGoal($scope.userProfile);
			});
		};

		$scope._getLatestGoal = function(userProfile) {
			var user = userProfile;
			var userRole = user.roles[0];
			var measureUnit = user.measureUnit;
			var userID = $stateParams.userId;
			$scope.goals = UserGoals.get({
				userID: userID
			}, function () {
				$scope.goals.exerciseGoal.forEach(function(g, index){
					if(g !== null) {

						g.isEdit = false;
						g.state = 'Edit';
						g.goalType = 1;
						g.oldTarget = g.target;
						g.oldType = g.type;
						g.sendTip = true;
						g.isSet = true;
					} else {
						var eg = {};
						eg.target = 0;
						eg.goalType = 1;
						eg.type = index;
						eg.isSet = false;
						eg.state = 'Create';
						eg.sendTip = true;
						$scope.goals.exerciseGoal[index] = eg;
					}
				});
				//$scope.goals.exerciseGoal = [
				//	$scope.goals.exerciseGoal[2],
				//	$scope.goals.exerciseGoal[3],
				//	$scope.goals.exerciseGoal[1]
				//];

                //
				//$scope.goals.exerciseGoalState = {
				//	isSet : true,
				//	state : 'Edit',
				//	tipContent: ''
				//};

				$scope.goals.exerciseGoal = $scope.goals.exerciseGoal.map(function(eg) {
					return Object.assign({}, eg, {
						is2save: function() {
							return this.isState('Save & Sync');
						},
						isState: function(state) {
							return state === this.state;
						},
						showType: function() {
							return $scope.exerciseGoalTypeEnum[Number(this.type)];
						},
						showText: function() {
							if(!this.isSet) {
								return 'Not Set';
							}
							if(this.type === 2 || this.type === 3) {
								return $filter('number')(this.target) + ' steps';
							}
							return $filter('number')(this.target) + ' minutes';
						}
					});

				});

				if( !$scope.goals.weightGoal ) {
					$scope.goals.weightGoal = {_id: 3, goalType: 0, target: 0, isSet: false, sendTip: true,state: 'Create'};
				} else {
					$scope.goals.weightGoal.goalType = 0;
					$scope.goals.weightGoal.isSet = true;
					$scope.goals.weightGoal.state = 'Edit';
					$scope.goals.weightGoal.sendTip = true;
					$scope.goals.weightGoal.oldTarget = $scope.goals.weightGoal.target;
					$scope.goals.weightGoal.oldType = $scope.goals.weightGoal.type;
				}
				$scope.goals.weightGoal.showText = function() {
					if(!this.isSet) {
						return 'Not Set';
					}
					if(Math.abs(this.target) < 0.00001) {
						return 'Maintain weight';
					}
					var convertFact = 2.20462;
					var targetKg = this.target;
					var targetLbs = this.target * convertFact;
					var text = $scope.weightGoalTypeEnum[Number(this.type)];
					if(userRole === 'dietitian') {
						text += ' '+ $filter('number')(targetKg, 1) + ' kg';
						text += '/' + $filter('number')(targetLbs, 1) + ' lbs';
					} else if (userRole === 'user'){
						var options = [
							$filter('number')(targetKg, 1) + ' kg',
							$filter('number')(targetLbs, 1) + ' lbs'
						];
						text += ' ' + options[measureUnit];
					} else {
						text +=  ' ' + $filter('number')(targetKg, 1) + ' kg';
					}
					text += ' per week';
					return text;
				};

				$scope.goals.weightGoal.showType = function() {
					if(!this.isSet) {
						return null;
					}
					return $scope.weightGoalTypeEnum[Number(this.type)];
				};

				$scope.goals.weightGoal = Object.assign({}, $scope.goals.weightGoal, {
					isState: function(state) {
						return this.state === state;
					},
					is2save: function() {
						return this.isState('Save & Sync');
					}
				});


				//$scope.goals.bloodGlucoseGoal.forEach(function(g, index){
				//	if(g !== null) {
                //
				//		g.isEdit = false;
				//		g.state = 'Edit';
				//		g.goalType = 2;
				//		g.oldTarget = g.target;
				//		g.oldType = g.type;
				//		g.isSet = true;
				//	} else {
				//		var eg = {};
				//		eg.target = 0;
				//		eg.goalType = 2;
				//		eg.type = index;
				//		eg.isSet = false;
				//		eg.state = 'Create';
				//		$scope.goals.bloodGlucoseGoal[index] = eg;
				//	}
				//});
                //
				//$scope.goals.bloodGlucoseGoal = $scope.goals.bloodGlucoseGoal.map(function(eg) {
				//	return Object.assign({}, eg, {
				//		is2save: function() {
				//			return this.isState('Save & Sync');
				//		},
				//		isState: function(state) {
				//			return state === this.state;
				//		},
				//		showType: function() {
				//			return $scope.bloodGlucoseGoalTypeEnum[Number(this.type)];
				//		},
				//		showText: function() {
				//			if(!this.isSet) {
				//				return 'Not Set';
				//			}
				//			return $filter('number')(this.target);
				//		}
				//	});
                //
				//});


				$scope.genDetails();
			});

		};

		$scope.createOrUpdateGoal = function(oneGoal, cb) {
			delete oneGoal.state;
			if((oneGoal.oldTarget === oneGoal.target && oneGoal.oldType === oneGoal.type)|| oneGoal.target === '' || oneGoal.type === '') {
				cb();
			} else {
				var sendTip = function() {
					if(oneGoal.sendTip) {
						var tipContent = '';
						if(oneGoal.goalType === 0) {
							tipContent = 'Your Weight Goal has been changed to \"' + oneGoal.showText() + '\".';
						} else {
							tipContent = 'Your Exercise Goal has been changed to \"' + oneGoal.showType() + ': ' + oneGoal.showText() + '\".';
						}

						console.log('need send tip' + tipContent);

						var tip = new Reminders({
							send_push: true,
							//send_email: false,
							user: $stateParams.userId,
							signature: 'GoHealthNow',
							type: 'reminder',
							creator: Authentication.user.userID,
							description: tipContent
						});


						// Redirect after save
						tip.$save();
					}
				};

				oneGoal.oldTarget = oneGoal.target;
				oneGoal.recordedTime = undefined;

				var g = new UserGoals(oneGoal);
				g.userID = $stateParams.userId;

				g.$save(function (res) {
					sendTip();
					cb();
				});



			}

		};


		$scope.toggle = function(goal) {
			if(typeof goal.target === 'undefined') {
				//new target is not set
				//use previous value
				goal.target = goal.oldTarget;
				return;
			}
			if(goal.state === 'Edit' || goal.state === 'Create'){
				//to save
				goal.state = 'Save & Sync';

			} else if(goal.state === 'Save & Sync') {
				//to edit
				goal.state = 'Edit';
				console.log(goal);
				goal.isSet = true;
				var oneGoal = angular.copy(goal);
				$scope.createOrUpdateGoal(oneGoal, function() {
					var t = '<div class="modal-header">'+
						'<h4>saving...</h4>' +
						'</div>';
					var modalInstance = $modal.open({
						animation: true,
						template:  t
					});
					modalInstance.result.then(function (result) {
						$scope.initialized = result.isInitialized;
					}, function () {

					});
					setTimeout(function() {
						modalInstance.close({ isInitialized: true});
					}, 500);
				});
			}
		};

		$scope.switchDeprecated = function(goalType, type) {
			var oneGoalEle;
			if(goalType === 0){
				oneGoalEle = $scope.goals.weightGoal;
			} else if (goalType === 1) {
				oneGoalEle = $scope.goals.exerciseGoal[type];
			} else {
				oneGoalEle = $scope.goals.bloodGlucoseGoal[type];
			}
			var isEdit = oneGoalEle.isEdit;
			if(typeof oneGoalEle.target === 'undefined') {
				oneGoalEle.target = oneGoalEle.oldTarget;
				return;
			}
			oneGoalEle.isEdit = !isEdit;
			oneGoalEle.state = isEdit? 'Edit':'Save & Sync';
			if(oneGoalEle.isEdit === false) {
				var oneGoal = angular.copy(oneGoalEle);
				$scope.updateGoal(oneGoal, function() {
					var t = '<div class="modal-header">'+
						'<h4>saving...</h4>' +
						'</div>';
					var modalInstance = $modal.open({
						animation: true,
						template:  t
					});
					modalInstance.result.then(function (result) {
						$scope.initialized = result.isInitialized;
					}, function () {
						// console.log('Modal dismissed at: ' + new Date());
					});
					setTimeout(function() {
						modalInstance.close({ isInitialized: true});
					}, 500);
				});
				// UserGoals.$update()

			}
		};

	}]
);

angular.module('dietitians').controller('GoalDetailModalCtrl', function ($scope, $modalInstance, goals) {

	$scope.goals = goals;

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

});
