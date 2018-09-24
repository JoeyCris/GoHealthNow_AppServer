'use strict';

// Admins controller
angular.module('admins').controller('OrgAdminsController', ['$scope', '$http', '$filter', '$stateParams', '$location',
	'Authentication', 'Admin', 'OrgAdmin', 'filterFilter', 'Brand',
	function($scope, $http, $filter,$stateParams, $location, Authentication, Admin, OrgAdmin, filterFilter, Brand) {
		$scope.authentication = Authentication;

		//$scope.endDate = new Date();
		//console.log(JSON.stringify($scope.authentication.user));
		$scope.endDate = new Date();
			//user.email == 'johndoe3433@gmail.com'
		//if($scope.authentication.user.userName === 'org1234' || $scope.authentication.user.userName === 'orgadmin') {
		//	$scope.endDate = new Date(2016, 3, 12, 12, 12);
        //
		//} else {
		//	$scope.endDate = new Date();
		//	//$scope.endDate = new Date(today.getFullYear(), today.getMonth()+1, 0);
		//}
		//$scope.endDate = new Date(2016, 3, 12, 12, 12);
		$scope.endDateOpened = false;

		$scope.endDateOpen = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.endDateOpened = true;
		};

		$scope.dateOptions = {
			format: 'MM-yyyy',
			startingDay: 1
		};
		$scope.getDayClass = function(date, mode) {
			if (mode === 'day') {
				var dayToCheck = new Date(date).setHours(0,0,0,0);

				for (var i=0;i<$scope.events.length;i++){
					var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

					if (dayToCheck === currentDay) {
						return $scope.events[i].status;
					}
				}
			}

			return '';
		};

		$scope.dataInitialized = false;
		$scope.dateSpan = 'dateSpan-month';
		$scope.updateStartDate = function() {
			$scope.endDate.setUTCMonth($scope.endDate.getMonth() + 1);
			//$scope.endDate.setDate(0); // last day of last month
			$scope.endDate.setUTCDate(0); // last day of last month

			console.log($scope.endDate);

			$scope.startDate = new Date($scope.endDate);
			//var now = new Date();
			if ($scope.dateSpan === 'dateSpan-month') {
				//$scope.startDate.setDate(1);
				$scope.startDate.setUTCDate(1);


				//if ($scope.endDate.getMonth() === now.getMonth()) { // if this month, set start date as the begin of this month
                //
				//	//$scope.endDate = new Date(now.getFullYear(), now.getMonth()+1, 0);
                //
				//	//$scope.endDate.setDate(now.getDate());
				//	$scope.startDate.setDate(1);
				//} else {
				//	$scope.endDate.setMonth($scope.endDate.getMonth() + 1);
				//	$scope.endDate.setDate(0); // last day of last month
				//	$scope.startDate.setDate(1);
				//	$scope.startDate.setMonth($scope.endDate.getMonth());
				//}
			} else if ($scope.dateSpan === 'dateSpan-quarter') {
				//if ($scope.endDate.getMonth() !== now.getMonth())
				//	$scope.endDate.setMonth($scope.endDate.getMonth() + 1);
				//$scope.endDate.setDate(0); // last day of last month

				$scope.startDate.setUTCDate(1);
				$scope.startDate.setUTCMonth($scope.endDate.getMonth() - 2);
			}
		};

		$scope.$watch('dateSpan', function(newVal, oldVal) {
			if (!newVal ) return;
			console.log('dateSpan: '+ $scope.dateSpan);
			$scope.getOrgUsersStats();
		});

		$scope.$watch('endDate', function(newVal, oldVal) {
			if (!newVal ) return;
			console.log('endDate: '+ $scope.endDate);
			if ($scope.dataInitialized) {
				$scope.getOrgUsersStats();
			} else {
				$scope.dataInitialized = true;
			}
		});

		var toUpperCase = function (name){
			return name.charAt(0).toUpperCase() + name.slice(1);
		};

		$scope.getUserFullName = function(user) {
			var fullName = '';
			if (user.firstName) {
				fullName += toUpperCase(user.firstName);
			}
			if (user.lastName) {
				fullName += ' ' + toUpperCase((user.lastName));
			}

			return fullName;
		};

		$scope.genRandomID = function(userID) {
			var randomID = parseInt(userID.substring(0, 8), 16);
			var now = new Date();
			now.setMonth(now.getMonth()+1);
			now.setDate(1);
			now.setHours(0,0,0,0);
			var seconds = Math.round(now.getTime() / 1000);

			//randomID = randomID - 1417410000 ;// Mon Dec 01 2014 00:00:00 GMT-0500 (EST)
			//var RID = randomID.toString(16)+weekDay.toString(16);

			var RID = seconds-randomID;

			var res = RID.toString(10).split('').reverse().join('');
			return res; //RID.toString(16);
		};



		$scope.allOrgUsers = {};
		$scope.orgUserData = {};

		$scope.getOrgUsersList = function(orgAccessCode) {
			$scope.allOrgUsers[orgAccessCode] = Admin.query({
				accessCode: orgAccessCode,
				role: 'user'
			}, function(){
				$scope.allOrgUsers[orgAccessCode].forEach(function(user) {
					 //console.log(user.stepCountAvg);
					if (user._id in $scope.orgUserData[orgAccessCode]) {
						user.mealScoreAvg = $scope.orgUserData[orgAccessCode][user._id].mealScoreAvg;
						user.caloriesAvg = $scope.orgUserData[orgAccessCode][user._id].caloriesAvg;
						user.activity = $scope.orgUserData[orgAccessCode][user._id].activity;
						user.minutesAvg = $scope.orgUserData[orgAccessCode][user._id].minutesAvg;
						user.stepCountsAvg = $scope.orgUserData[orgAccessCode][user._id].stepCountAvg;//user.minutesAvg * 135; //parseInt(user.minutesAvg) * 135;
						user.weeklyTotalPoint = $scope.orgUserData[orgAccessCode][user._id].WeeklyTotalPoint;
						user.weeklyTotalPoint += user.activity;
						user.weeklyExercisePoint = $scope.orgUserData[orgAccessCode][user._id].WeeklyExercisePoint;
						user.weeklyMealPoint = $scope.orgUserData[orgAccessCode][user._id].WeeklyMealPoint;
						user.weightChange = $scope.orgUserData[orgAccessCode][user._id].weightChange;
					}
				});

				$scope.calOverallAvg($scope.allOrgUsers[orgAccessCode], orgAccessCode);
			});
		};

		$scope.getOrgUsersStats = function() {
			$scope.updateStartDate();
			var startDate = $scope.startDate.toISOString().slice(0,10);
			var endDate = $scope.endDate.toISOString().slice(0,10);
			console.log($scope.authentication.user.accessCode);
			var accessCodeList = $scope.authentication.user.accessCode.split('/');
			accessCodeList.sort();
			console.log(accessCodeList);
			$scope.getBrandInfo(accessCodeList[0]);
			// if (Array.isArray($scope.authentication.user.accessCode)) {
			// 	accessCodeList = $scope.authentication.user.accessCode;
			// } else {
			// 	accessCodeList.push($scope.authentication.user.accessCode);
			// }

			accessCodeList.forEach(function(accessCode) {
				$scope.orgUserData[accessCode] = OrgAdmin.get({
					cmd: 'periodAverageForUsersInGroup',
					accessCode:accessCode,
					startDate:startDate,
					endDate:endDate
				}).$promise.then(function(userAll) {
					$scope.orgUserData[accessCode] = userAll;
					 //console.log("This is orgUserData: ",$scope.orgUserData);
					$scope.getOrgUsersList(accessCode);

				});
			});

		};

		$scope.calcOverallAvgforField = function(userList, field) {
			//console.log('calcOverallAvgforField. field:' + field );
			var cnt = 0;
			var total = 0;
			userList.forEach(function (user) {
				if (field in user) {

					if (user[field]) {

						cnt += 1;
						total += user[field];
						//console.log('Total:' + total + 'cnt:' + cnt);
					} else if (user[field] !== undefined && user[field] === 0) {
						cnt += 1;
					}
				}
			});

			if (cnt) return total/cnt;
			else return undefined;
		};
		$scope.overallAvgMealScore = {};
		$scope.overallAvgCalories = {};
		$scope.overallAvgUsage = {};
		$scope.overallAvgMinutes = {};
		$scope.overallAvgWeeklyMealPoints = {};
		$scope.overallAvgWeeklyExercisePoints = {};
		$scope.overallAvgWeeklyTotalPoints = {};
		$scope.overallAvgWeightChanges = {};
		$scope.overallAvgStepCounts = {};



		$scope.calOverallAvg = function(orgUsers, accessCode) {
			$scope.overallAvgMealScore[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'mealScoreAvg');
			$scope.overallAvgStepCounts[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'stepCountsAvg');
			$scope.overallAvgCalories[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'caloriesAvg');
			$scope.overallAvgUsage[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'activity');
			//$scope.overallAvgMinutes[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'minutesAvg');
			$scope.overallAvgWeeklyTotalPoints[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'weeklyTotalPoint');
			$scope.overallAvgWeeklyMealPoints[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'weeklyMealPoint');
			$scope.overallAvgWeeklyExercisePoints[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'weeklyExercisePoint');
			$scope.overallAvgWeightChanges[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'weightChange');
		};


		$scope.getBrandInfo = function (accessCode) {
			Brand.get({
				brandId: accessCode
			},function(data){
				$scope.brandInfo = data.medias[0];
			});
		};

		// $scope.getBrandInfo($scope.authentication.user.accessCode);
	}
]).filter('emptyToEnd', function () {
	return function (array, key) {
		if(!angular.isArray(array)) return;
		var present = array.filter(function (item) {
			return item[key];
		});
		var empty = array.filter(function (item) {
			return !item[key];
		});
		return present.concat(empty);
	};
});
