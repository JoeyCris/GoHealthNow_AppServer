'use strict';

// Admins controller
angular.module('admins').controller('MonthlyOrgAdminsController', ['$scope', '$http', '$filter', '$stateParams', '$location',
	'Authentication', 'Admin', 'OrgAdmin','NoLoginAdmin','filterFilter', 'Brand',
	function($scope, $http, $filter,$stateParams, $location, Authentication, Admin, OrgAdmin, NoLoginAdmin,filterFilter, Brand) {
		$scope.authentication = Authentication;
		$scope.endDate = new Date();
		$scope.endDateOpened = false;
		$scope.year=$scope.endDate.getFullYear();
		$scope.month=$scope.endDate.getMonth();
		$scope.MealscoreChart=[];
		$scope.CaloriesChart=[];
		$scope.StepChart=[];



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

		$scope.$watch('endDate', function(newVal, oldVal) {
			if (!newVal ) return;
			console.log('endDate: '+ $scope.endDate);
			$scope.getOrgUsersStats();
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
		$scope.allRandomId=[];
		$scope.allcaloriesAvg=[];
		$scope.allmealScoreAvg=[];
		$scope.allWeeklyMealPoint=[];
		$scope.allWeeklyExercisePoint=[];
		$scope.allWeeklyTotalPoint=[];

		$scope.getOrgUsersList = function(orgAccessCode) {

			$scope.allOrgUsers[orgAccessCode]=[];
			$scope.allRandomId=[];
			//
			var topcaloriesAvg=[];
			var topcaloriesid=[];
			var topcaloriesdata=[];
			//
			var topmealScoreAvg=[];
			var topmealScoreid=[];
			var topmealScoredata=[];
			//
			var topstepCountAvg=[];
			var topstepid=[];
			var topstepdata=[];
			// var allstepCountAvg=[];
			// var allWeeklyMealPoint=[];
			// var allWeeklyExercisePoint=[];
			// var allWeeklyTotalPoint=[];
			var calories=[];
 			var mealscore=[];
 			var stepcount=[];

			$scope.orgUserData[orgAccessCode].forEach(
				function(userdata){
					$scope.allOrgUsers[orgAccessCode].push(userdata);
					$scope.allRandomId.push(userdata.randomID);
					// allstepCountAvg.push(userdata.stepCountAvg || 0);
					// allcaloriesAvg.push(userdata.caloriesAvg || 0);
					// allmealScoreAvg.push(userdata.mealScoreAvg || 0);
					// allWeeklyMealPoint.push(userdata.WeeklyMealPoint || 0);
					// allWeeklyExercisePoint.push(userdata.WeeklyExercisePoint || 0);
					// allWeeklyTotalPoint.push(userdata.WeeklyTotalPoint || 0);
				}
			);


			//get top10 calories
			var topindex=0;
			topstepCountAvg=$scope.allOrgUsers[orgAccessCode].sort(function(a,b){
				var A= a['stepCountAvg']||0;
				var B= b['stepCountAvg']||0;
				return B-A;
			}).slice(0,10);
			topstepCountAvg.forEach(function(userdata){
				if(userdata.stepCountAvg!=undefined){
					topstepid.push(userdata.randomID);
					topstepdata.push(Math.round(userdata.stepCountAvg));
					topindex++;
				}
			});
			while(topindex<10){
				topstepid.push('');
				topstepdata.push('');
				topindex++;
			}


			//get top10 calories
			topindex=0;
			topcaloriesAvg=$scope.allOrgUsers[orgAccessCode].sort(function(a,b){
				var A= a['caloriesAvg']||0;
				var B= b['caloriesAvg']||0;
				return B-A;
			}).slice(0,10);
			topcaloriesAvg.forEach(function(userdata){
				if(userdata.caloriesAvg!==undefined){
					topcaloriesid.push(userdata.randomID);
					topcaloriesdata.push(Math.round(userdata.caloriesAvg));
					topindex++;
				}
			});
			while(topindex<10){
				topcaloriesid.push('');
				topcaloriesdata.push('');
				topindex++;
			}

			//get top10 mealscore
			topindex=0;
			topmealScoreAvg=$scope.allOrgUsers[orgAccessCode].sort(function(a,b){
				var A= a['mealScoreAvg']|| 0;
				var B= b['mealScoreAvg']|| 0 ;
				return B-A;
			}).slice(0,10);
			topmealScoreAvg.forEach(function(userdata){
				if(userdata.mealScoreAvg!==undefined){
					topmealScoreid.push(userdata.randomID);
					topmealScoredata.push(Math.round(userdata.mealScoreAvg));
					topindex++;
				}
			});
			while(topindex<10){
				topmealScoreid.push('');
				topmealScoredata.push('');
				topindex++;
			}

			//console.log(topcaloriesAvg);


			//chart series
			calories.push(
		    	{
			        name: 'Calories Burned',
			        data: topcaloriesdata,
			        color: '#8B0000'
		    	}
			);

			//chart series
			mealscore.push({
				name: 'Meal Score',
				data: topmealScoredata,
				color: '#70DB93'
			});

			stepcount.push({
				name: 'Step Counts',
				data: topstepdata,
				color: '#2E86C1'
			})

 			$scope.calOverallAvg($scope.allOrgUsers[orgAccessCode], orgAccessCode);

 			$scope.CaloriesChart = {

				options:{
					chart: {
			        	type: 'bar'
			    	}
				},
			    title: {
			        text: 'Top 10 Calories Burned'
			    },
			    colors: ['red'],
			    xAxis: {
			        categories: topcaloriesid,
			        title: {
			            text: 'Monthly Random ID'
			        }
			    },
			   yAxis: {
			        min: 1,
			        title: {
			            text: 'calory',
			            align: 'high'
			        },
			        labels: {
			            overflow: 'justify'
			        }
			    },
			    tooltip: {
			        valueSuffix: 'unit'

			    },
			    plotOptions: {
			        bar: {
			            dataLabels: {
			                enabled: true
			            }
			        }
			    },
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'top',
			        x: -40,
			        y: 80,
			        floating: true,
			        borderWidth: 1,
			        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
			        shadow: true
			    },
			    credits: {
			        enabled: false
			    },
			    series: calories
			};

			$scope.MealscoreChart = {

				options:{
					chart: {
			        	type: 'bar'
			    	}
				},
			    title: {
			        text: 'Top 10 Meal Score'
			    },
			    xAxis: {
			        categories: topmealScoreid,
			        title: {
			            text: 'Monthly Random ID'
			        }
			    },
			   yAxis: {
			        min: 1,
			        title: {
			            text: 'point',
			            align: 'high'
			        },
			        labels: {
			            overflow: 'justify'
			        }
			    },
			    tooltip: {
			        valueSuffix: 'unit'

			    },
			    plotOptions: {
			        bar: {
			            dataLabels: {
			                enabled: true
			            }
			        }
			    },
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'top',
			        x: -40,
			        y: 80,
			        floating: true,
			        borderWidth: 1,
			        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
			        shadow: true
			    },
			    credits: {
			        enabled: false
			    },
			    series: mealscore
			};

			$scope.StepChart = {

				options:{
					chart: {
			        	type: 'bar'
			    	}
				},
			    title: {
			        text: 'Top 10 Step Counts'
			    },
			    xAxis: {
			        categories: topstepid,
			        title: {
			            text: 'Monthly Random ID'
			        }
			    },
			   yAxis: {
			        min: 1,
			        title: {
			            text: 'step',
			            align: 'high'
			        },
			        labels: {
			            overflow: 'justify'
			        }
			    },
			    tooltip: {
			        valueSuffix: 'unit'

			    },
			    plotOptions: {
			        bar: {
			            dataLabels: {
			                enabled: true
			            }
			        }
			    },
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'top',
			        x: -40,
			        y: 80,
			        floating: true,
			        borderWidth: 1,
			        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
			        shadow: true
			    },
			    credits: {
			        enabled: false
			    },
			    series: stepcount
			};

		};

		//get all data
		$scope.getOrgUsersStats = function() {
			$scope.year=$scope.endDate.getFullYear();
			$scope.month=$scope.endDate.getMonth()+1;
			if($scope.month<10)
				$scope.month='0'+$scope.month;
			console.log('month='+$scope.month);

			var accessCode= $stateParams.accessCode;
			$scope.getBrandInfo(accessCode);

			//
		    $scope.orgUserData[accessCode] = NoLoginAdmin.get({
				accessCode:accessCode,
				year:$scope.year,
				month:$scope.month
			}).$promise.then(function(userAll) {
				$scope.orgUserData[accessCode] = userAll;
				 //console.log("This is orgUserData: ",$scope.orgUserData);
				$scope.getOrgUsersList(accessCode);

			});

			//For local test
				// var res=[];
				// if($scope.month==7)
				// 	res=[{"mealScoreAvg":43.530117391304344,"caloriesAvg":310.8645835,"stepCountAvg":0,"randomID":"50749846"}];
				// else{
				// 	res=[{"mealScoreAvg":64.77777777777777,"WeeklyTotalPoint":4059.5,"WeeklyExercisePoint":4006.25,"WeeklyMealPoint":52.5,"caloriesAvg":1896.7,"stepCountAvg":2672.8,"randomID":"0737277"},{"mealScoreAvg":59.5,"WeeklyMealPoint":0,"WeeklyExercisePoint":26992.5,"WeeklyTotalPoint":26992.5,"caloriesAvg":9442.5,"stepCountAvg":9134.4,"randomID":"96255831"},{"mealScoreAvg":64.4,"WeeklyExercisePoint":8997.5,"WeeklyTotalPoint":9047.5,"WeeklyMealPoint":50,"caloriesAvg":3147.5,"stepCountAvg":3044.8,"randomID":"66173771"},{"mealScoreAvg":36.904401302083336,"WeeklyTotalPoint":2840.4,"WeeklyExercisePoint":2380,"WeeklyMealPoint":444,"caloriesAvg":683.9166632727273,"stepCountAvg":13823,"randomID":"50749846"}];
				// }
				// $scope.orgUserData[accessCode] = res;

				// $scope.getOrgUsersList(accessCode);
			//------

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
			$scope.overallAvgStepCounts[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'stepCountAvg');
			$scope.overallAvgCalories[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'caloriesAvg');
			$scope.overallAvgWeeklyTotalPoints[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'WeeklyTotalPoint');
			$scope.overallAvgWeeklyMealPoints[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'WeeklyMealPoint');
			$scope.overallAvgWeeklyExercisePoints[accessCode] = $scope.calcOverallAvgforField(orgUsers, 'WeeklyExercisePoint');

		};

		$scope.getBrandInfo = function (accessCode) {
			Brand.get({
				brandId: accessCode
			},function(data){
				$scope.brandInfo = data.medias[0];
			});
		};

		$scope.getOrgUsersStats();


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
