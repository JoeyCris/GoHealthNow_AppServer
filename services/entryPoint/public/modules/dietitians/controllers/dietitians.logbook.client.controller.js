'use strict';

// Dietitians controller
angular.module('dietitians').controller('LogbookController', ['$scope','$stateParams', '$location', '$anchorScroll', 'Authentication', 'Users','Dietitians', 'Admin','$filter','filterFilter','$http','$modal','$q','UserGoals','LogBookCharts','$window',
	function($scope, $stateParams, $location, $anchorScroll, Authentication, Users, Dietitians, Admin, $filter, filterFilter, $http, $modal,$q,UserGoals,LogBookCharts,$window) {
		$scope.authentication = Authentication;
		$scope.dietitian = $scope.authentication.user;
		$scope.userRole = $scope.authentication.user.roles[0];
		$scope.conditionSpans = ['Diabetes, Prediabetes','High Blood Pressure','Overweight'];
		$scope.languageSpans = ['English','French'];
		$scope.deviceSpans = ['Android','iOS'];

		$scope.ethnicitySpans = ['White/Caucasian','Black/Afro-Caribbean','Asian','Aboriginal/American Indian ','Hispanic or Latino','Other' ];

		//---slider component
		$scope.myInterval = 3000;
		$scope.slides = [];
		$scope.curslide=0;

		//
		$scope.getAPPName = function () {
			var appNames = ['GlucoGuide','GoHealthNow'];

			var index = $scope.user.appID;
			if(! index || index < 0 || index > 2) {
				index = 0;
			}
			return appNames[index];
		};

		$scope.copyURL = function (content, size) {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'CopyURL.html',
				controller: 'CopyURLCtrl',
				size: size,
				resolve: {
					content: function () {
						return content;
					}
				}

			});

		};



		$scope.genPdf = function(){

			// var blob = new Blob([document.getElementById('printOnly').innerHTML], {
			//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
			//   });
			//   console.log(blob);
			var html = document.getElementById('printOnly').innerHTML;
			// console.log(html);
			var param = {'userId':$scope.dietitian.userID};
			var payload = {chart:$scope.weeklyBGChart1,html:html};
			LogBookCharts.save(param,payload,function(response){
				// alert('Copy this URL: ');

				// $window.open('/filedownload?name=out.pdf&userID='+$scope.dietitian._id, '_blank');
				// $scope.copyURL(response.message);
				// alert('Copy this URL: '+response.message);
			},function(err){
				console.log(err);
			});
		};





		$scope.initialized = false;

		if(!$scope.targetUserId) {
			$scope.targetUserId = $stateParams.userId;
		}


		// Model
		$scope.animationsEnabled = true;
		$scope.showHelp = function (size) {

			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'logBookHelp.html',
				controller: 'ModalInstanceCtrl',
				size: size
			});
		};


		$scope.confirmUserPrivacy = function (size) {

			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'UserPrivacy.html',
				controller: 'UserPrivacyModalInstanceCtrl',
				size: size
			});
		};



		$scope.showMealDetail = function (meal, title, size) {

			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				//templateUrl: 'mealdetail.html',
				templateUrl: '/modules/dietitians/directives/meal-detail.template.html',
				controller: 'MealDetailModalCtrl',
				size: size,
				resolve: {
					meal: function () {
						return meal;
					},
					title: function () {
						return title;
					}
				}
			});
		};

		$scope.showTips = function (tips) {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: '/modules/dietitians/directives/my-tips.template.html',
				controller: 'MyTipsModalCtrl',
				resolve: {
					tips: function () {
						return tips;
					}
				}
			});
		};

		$scope.showQuestions = function (questions) {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: '/modules/dietitians/directives/my-questions.template.html',
				controller: 'MyQuestionsModalCtrl',
				resolve: {
					questions: function () {
						return questions;
					}
				}
			});
		};


		$scope.updateUserProfile = function() {
			$scope.success = $scope.error = null;

			if($scope.checked) {
				$scope.user.rightsMask = 770;
			} else {
				$scope.user.rightsMask = 700;
			}
			var user = new Users($scope.user);

			user.$update(function(response) {
				$scope.success = true;
				//window.alert('Update successfully!');  // TODO:  Need to add alert
				$scope.confirmUserPrivacy();
				Authentication.user = response;
			}, function(response) {
				$scope.error = response.data.message;
			});
		};


		$scope.bgChartOptions = {
			//bezierCurve:false,
			scaleShowGridLines : true,
			scaleGridLineColor : '#3c3f41',
			scaleGridLineWidth : 1,

			//Boolean - Whether to show horizontal lines (except X axis)
			scaleShowHorizontalLines: true,

			//Boolean - Whether to show vertical lines (except Y axis)
			scaleShowVerticalLines: false,
			scaleOverride: true,

			scaleSteps: 5,
			// Number - The value jump in the hard coded scale
			scaleStepWidth: 3,
			// Number - The scale starting value
			scaleStartValue: 1,
		};

		$scope.chartOptions = {
			//bezierCurve:false,
		};

		$scope.breakfastisCollapsed = true;
		$scope.msnackisCollapsed = true;
		$scope.lunchisCollapsed = true;
		$scope.lsnackisCollapsed = true;
		$scope.supperisCollapsed = true;
		$scope.ssnackisCollapsed = true;
		$scope.bmsnackisCollapsed = true;


		$scope.getIdeaCals = function(user) {
			if(user && user.targetCalories) {
				return user.targetCalories;
			} else {
				//console.log('cannot find the property of targetCalories');
				//console.log(JSON.stringify(user));
				//return 0;

				var ideaCals = 0.0;
				var bmr = 0.0;
				var age = new Date().getFullYear() -  user.dob;
				if (user.gender === 0) { //male
					bmr = 88.362 + 13.397 * (user.weight) + 4.799 * user.height - 5.677 * age;
				} else {
					bmr = 447.593 + 9.247 * user.weight + 3.098 * user.height - 4.330 * age;
				}
				ideaCals = 1.2 * bmr;
				return ideaCals;
			}
		};


		$scope.hasBindFitbit = false;

		$scope.unbindFitbit = function() {

			console.log('unbind fitbit ' + $scope.hasBindFitbit);
			if($scope.hasBindFitbit) {

				var userID = $scope.user.userID;

				$http.post('/fitbit/user/unbind/' + userID, {}).
					then(function() {
						console.log('unbind fitbit sucessfully');
					});
			}



		};






		// Get client's profile.
		$scope.getUserProfile = function() {

			$scope.user = Admin.get({
				userId: $scope.targetUserId
			}, function (response) {

				if(response.rightsMask === undefined) {
					console.log('user.rightsMask is undefined');
					$scope.checked = false;
				} else {
					//console.log($scope.user.rightsMask);
					$scope.checked = response.rightsMask > 700;
				}

				if(response.additionalProvidersData && response.additionalProvidersData.fitbit) {
					$scope.hasBindFitbit = true;
				}

				$scope.checkAccessCode(response.accessCode);


				$scope.getLastestRecordDate(response);

			});

			$scope.goals = UserGoals.get({
				userID: $scope.targetUserId
			}, function (res) {
				$scope.setExerciseTargetInChart(res);
			});

			//$scope.acl = {logbook:7};

			$scope.acl = {logbook:365};

			$http.get('/auth/acl/list').success(function (response) {
				$scope.acl = response;
			});

			$http.get('/GlucoGuide/metadata/list', {
				params: {
					userID: $scope.targetUserId,
					format: 'json'
				}
			}).success(function (response) {

				$scope.inputSelections = response.metadata.inputSelections;
				if($scope.inputSelections && $scope.inputSelections.selection) {

					var selection = $scope.inputSelections.selection;
					if( Object.prototype.toString.call( selection ) === '[object Array]') {

						$scope.inputSelections.description = selection.join(' / ');
					} else {
						$scope.inputSelections.description = selection;
					}
				}
			});
		};


		$scope.isValidAccessCode = false;

		$scope.checkAccessCode = function(accessCode) {
			console.log('$scope.checkAccessCode');
			if(accessCode && accessCode.length !== 0 && accessCode !== '000000' && accessCode !== '00000000') {
				$scope.isValidAccessCode =  true;
			} else {
				$scope.isValidAccessCode =  false;
			}

			//return false;
		};

		$scope.genRandomID = function(userID) {
			if(userID) {
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
			} else {
				return '-';
			}

		};


		$scope.setExerciseTargetInChart = function(res) {
			var exerciseGoal = 150;
			var dailyStepsGoal = 7500;
			var weeklyStepsGoal = 7500*5;

			if(res.exerciseGoal && res.exerciseGoal[0]) {
				exerciseGoal = res.exerciseGoal[0].target;
			}

			if(res.exerciseGoal && res.exerciseGoal[1]) {
				dailyStepsGoal = res.exerciseGoal[1].target;
			}

			if(res.exerciseGoal && res.exerciseGoal[2]) {
				weeklyStepsGoal = res.exerciseGoal[2].target;
			}

			$scope.weeklyExerciseChart.yAxis.plotLines[0].value = exerciseGoal;
			$scope.weeklyExerciseChart.yAxis.minRange = exerciseGoal;
			$scope.weeklyExerciseChart.yAxis.plotLines[0].label.text = 'weekly target: ' + $filter('currency')(exerciseGoal, '', 0) + ' minutes';

			$scope.weeklyStepChart.yAxis.plotLines[0].value = dailyStepsGoal;
			$scope.weeklyStepChart.yAxis.plotLines[0].label.text = 'daily target: ' + $filter('currency')(dailyStepsGoal, '', 0) + ' steps';

			$scope.weeklyStepChart.yAxis.plotLines[1].value = weeklyStepsGoal;
			$scope.weeklyStepChart.yAxis.plotLines[1].label.text = 'weekly target: ' + $filter('currency')(weeklyStepsGoal, '', 0) + ' steps';
			$scope.weeklyStepChart.yAxis.minRange = weeklyStepsGoal;

		};


		$scope.getLastestRecordDate = function(user) {
			//$http.get('/statistics/latestRecordDate/' + userID).success(function (response) {
			//	$scope.latestDate = response;
			//	//console.log($scope.latestDate);
			//	$scope.initDate();
			//});

			// console.log(JSON.stringify(user.retrieveTime));

			$scope.latestDate = user.retrieveTime;
			$scope.initDate();


		};

		// date picker
		$scope.initDate = function() {


			if($scope.latestDate.length) {

				$scope.dt7 = new Date($scope.latestDate) || new Date();
			} else {
				$scope.dt7 = new Date();
			}
			$scope.dt6 = new Date($scope.dt7);
			$scope.dt6.setDate($scope.dt7.getDate() -1);

			$scope.dt5 = new Date($scope.dt6);
			$scope.dt5.setDate($scope.dt6.getDate() -1);

			$scope.dt4 = new Date($scope.dt5);
			$scope.dt4.setDate($scope.dt5.getDate() -1);

			$scope.dt3 = new Date($scope.dt4);
			$scope.dt3.setDate($scope.dt4.getDate() -1);

			$scope.dt2 = new Date($scope.dt3);
			$scope.dt2.setDate($scope.dt3.getDate() -1);

			$scope.dt1 = new Date($scope.dt2);
			$scope.dt1.setDate($scope.dt2.getDate() -1);


			//
			//$scope.latestRecord = Dietitians.get({
			//	dietitianId: $scope.dietitian.userID,
			//	userId: $scope.targetUserId,
			//	date: $scope.today
			//});
		};

		$scope.open7 = function($event) {

			$scope.checkACL(function() {
				$event.preventDefault();
				$event.stopPropagation();

				$scope.opened7 = true;
			});


		};




		$scope.dateOptions = {
			formatYear: 'yyyy',
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


		//$scope.dts = [$scope.dt1,$scope.dt2,$scope.dt3,$scope.dt4,$scope.dt5,$scope.dt6,$scope.dt7];
		$scope.updateChartData = function() {
			//Data for Charts
			var d1 = $filter('date')($scope.dt1, 'dd/M'),
				d2 = $filter('date')($scope.dt2, 'dd/M'),
				d3 = $filter('date')($scope.dt3, 'dd/M'),
				d4 = $filter('date')($scope.dt4, 'dd/M'),
				d5 = $filter('date')($scope.dt5, 'dd/M'),
				d6 = $filter('date')($scope.dt6, 'dd/M'),
				d7 = $filter('date')($scope.dt7, 'dd/M');
			$scope.labels = [d1, d2, d3, d4, d5, d6, d7];
			$scope.dts = [$scope.dt1,$scope.dt2,$scope.dt3,$scope.dt4,$scope.dt5,$scope.dt6,$scope.dt7];

			$scope.series=['Before Meal', 'After Meal'];

			$scope.day1BGData = [[]];
			$scope.day1label = [];

			if($scope.day1 && $scope.day1.glucoseRecords) {
				$scope.getOneDayBGForChart($scope.day1, $scope.day1label, $scope.day1BGData[0]);
			}

			$scope.day2BGData = [[]];
			$scope.day2label = [];

			if($scope.day2 && $scope.day2.glucoseRecords) {
				$scope.getOneDayBGForChart($scope.day2, $scope.day2label, $scope.day2BGData[0]);
			}

			$scope.day3BGData = [[]];
			$scope.day3label = [];

			if($scope.day3 && $scope.day3.glucoseRecords) {
				$scope.getOneDayBGForChart($scope.day3, $scope.day3label, $scope.day3BGData[0]);
			}

			$scope.day4BGData = [[]];
			$scope.day4label = [];

			if($scope.day4 && $scope.day4.glucoseRecords) {
				$scope.getOneDayBGForChart($scope.day4, $scope.day4label, $scope.day4BGData[0]);
			}

			$scope.day5BGData = [[]];
			$scope.day5label = [];

			if($scope.day5 && $scope.day5.glucoseRecords) {
				$scope.getOneDayBGForChart($scope.day5, $scope.day5label, $scope.day5BGData[0]);
			}

			$scope.day6BGData = [[]];
			$scope.day6label = [];

			if($scope.day6 && $scope.day6.glucoseRecords) {
				$scope.getOneDayBGForChart($scope.day6, $scope.day6label, $scope.day6BGData[0]);
			}

			$scope.day7BGData = [[]];
			$scope.day7label = [];

			if($scope.day7 && $scope.day7.glucoseRecords) {
				$scope.getOneDayBGForChart($scope.day7, $scope.day7label, $scope.day7BGData[0]);
			}

			//$scope.exerciseData = [
			//	[
			//		$scope.getSummary($scope.day1).totalBurned?$scope.getSummary($scope.day1).totalBurned:null,
			//		$scope.getSummary($scope.day2).totalBurned?$scope.getSummary($scope.day2).totalBurned:null,
			//		$scope.getSummary($scope.day3).totalBurned?$scope.getSummary($scope.day3).totalBurned:null
			//	]
			//];
			//
			//$scope.weightData = [
			//	[
			//		$scope.getWeight($scope.day1)?$scope.getWeight($scope.day1).weightValue:null,
			//		$scope.getWeight($scope.day2)?$scope.getWeight($scope.day2).weightValue:null,
			//		$scope.getWeight($scope.day3)?$scope.getWeight($scope.day3).weightValue:null
			//	]
			//];

			//$scope.summaryData = [
			//	[
			//		$scope.getSummary($scope.day1).totalCals?$scope.getSummary($scope.day1).totalCals:null,
			//		$scope.getSummary($scope.day2).totalCals?$scope.getSummary($scope.day2).totalCals:null,
			//		$scope.getSummary($scope.day3).totalCals?$scope.getSummary($scope.day3).totalCals:null
			//	]
			//];

		};
		//end Charts

		//$scope.updateMealAndSnackData = function(dayRecord){
		//	$scope.morningSnackAndExercise = $scope.getMorningSnackAndExercise(dayRecord);
		//	$scope.afternoonSnackAndExercise = $scope.getAfternoonSnackAndExercise(dayRecord);
		//	$scope.eveningSnackAndExercise = $scope.getEveningSnackAndExercise(dayRecord);
		//
		//};

		$scope.countBGByValue = function(records, threshold, cmpfunc) {
			var cnt = 0;
			var i = 0;

			//console.log(records);
			if(!records) return 0;
			for(i = 0; i < records.length; i++) {

				if(cmpfunc(threshold, records[i].level)) {
					cnt += 1;
				}
			}

			return cnt;
		};

		$scope.updateDataforWeb = function(){
			$scope.beforeBreakfastSnackAndExercise = [];
			$scope.morningSnackAndExercise = [];
			$scope.afternoonSnackAndExercise = [];
			$scope.eveningSnackAndExercise = [];

			$scope.sleepTime = [];
			$scope.breakfast = [];
			$scope.lunch = [];
			$scope.supper = [];

			$scope.dailyTips = [];
			$scope.questions = [];
			$scope.weeklyReports = [];

			$scope.beforeBreakfastBG = [];
			$scope.afterBreakfastBG = [];
			$scope.beforeLunchBG = [];
			$scope.afterLunchBG = [];
			$scope.beforeSupperBG = [];
			$scope.afterSupperBG = [];
			$scope.beforeBedBG = [];


			$scope.weightRecords = [];
			$scope.otherBGRecords = [];

			//Data for Charts
			$scope.sleepData = [[]];
			$scope.breakfastBGData = [[],[]];
			$scope.lunchBGData = [[],[]];
			$scope.supperBGData = [[],[]];
			$scope.bedtimeBGData = [[]];
			$scope.exerciseData = [[]];
			$scope.summaryData = [[]];

			$scope.numTotalBG = 0;

			var totalBGLG10 = 0, totalBGSM4 = 0;

			$scope.summaryInfo = [];

			[$scope.day1, $scope.day2, $scope.day3, $scope.day4, $scope.day5, $scope.day6,$scope.day7]
				.forEach(function(data){

					//$scope.updateMealFiber(data);
					$scope.beforeBreakfastSnackAndExercise.push($scope.getbeforeBreakfastSnackAndExercise(data));
					$scope.morningSnackAndExercise.push($scope.getMorningSnackAndExercise(data));
					$scope.afternoonSnackAndExercise.push($scope.getAfternoonSnackAndExercise(data));
					$scope.eveningSnackAndExercise.push($scope.getEveningSnackAndExercise(data));
					$scope.weightRecords.push($scope.getWeight(data));

					$scope.sleepTime.push($scope.getSleepTime(data));
					// $scope.breakfast.push($scope.getBreakfast(data));
					// $scope.lunch.push($scope.getLunch(data));
					// $scope.supper.push($scope.getSupper(data));

					var breakfast = $scope.getBreakfast(data);
					var lunch = $scope.getLunch(data);
					var supper = $scope.getSupper(data);
					if(breakfast){
						breakfast.tips = $scope.getTipsByMeal(data, breakfast);
					}
					if(lunch){
						lunch.tips = $scope.getTipsByMeal(data, lunch);
					}
					if(supper){
						supper.tips = $scope.getTipsByMeal(data, supper);
					}

					$scope.breakfast.push(breakfast);
					$scope.lunch.push(lunch);
					$scope.supper.push(supper);
					// $scope.breakfastTips = $scope.getBreakfastTips(data);
					// $scope.lunchTips = $scope.getLunchTips(data);
					// $scope.supperTips = $scope.getSupperTips(data);
					$scope.dailyTips.push($scope.getDailyTips(data));
					$scope.questions.push($scope.getQuestions(data));
					var reports = $scope.getReports(data);
					if(reports){
						reports.forEach(function(r){
							$scope.weeklyReports.push(r);
						});
					}
					$scope.beforeBreakfastBG.push($scope.getBGByType(data, 0));
					$scope.afterBreakfastBG.push($scope.getBGByType(data, 1));
					$scope.beforeLunchBG.push($scope.getBGByType(data, 2));
					$scope.afterLunchBG.push($scope.getBGByType(data, 3));
					$scope.beforeSupperBG.push($scope.getBGByType(data, 4));
					$scope.afterSupperBG.push($scope.getBGByType(data, 5));
					$scope.beforeBedBG.push($scope.getBGByType(data, 6));
					$scope.otherBGRecords.push($scope.getBGByType(data, 7));

					// Data for charts
					$scope.sleepData[0].push($scope.getSleepTime(data)?($scope.getSleepTime(data).minutes/60).toFixed(1):null);
					$scope.breakfastBGData[0].push($scope.getBGByType(data, 0)?$scope.getBGByType(data, 0).level:null);
					$scope.breakfastBGData[1].push($scope.getBGByType(data, 1)?$scope.getBGByType(data, 1).level:null);
					$scope.lunchBGData[0].push($scope.getBGByType(data, 2)?$scope.getBGByType(data, 2).level:null);
					$scope.lunchBGData[1].push($scope.getBGByType(data, 3)?$scope.getBGByType(data, 3).level:null);
					$scope.supperBGData[0].push($scope.getBGByType(data, 4)?$scope.getBGByType(data, 4).level:null);
					$scope.supperBGData[1].push($scope.getBGByType(data, 5)?$scope.getBGByType(data, 5).level:null);
					$scope.bedtimeBGData[0].push($scope.getBGByType(data, 6)?$scope.getBGByType(data, 6).level:null);

					var sum =$scope.getSummary(data);
					$scope.summaryInfo.push(sum);

					$scope.summaryData[0].push(sum.totalCals?sum.totalCals.toFixed(1):null);


					totalBGLG10 += $scope.countBGByValue(data.glucoseRecords, 10, function(threshold, val) {
						return val > threshold;
					});

					totalBGSM4 += $scope.countBGByValue(data.glucoseRecords, 4, function(threshold, val) {
						return val < threshold;
					});

					if(data && data.glucoseRecords) {
						$scope.numTotalBG += data.glucoseRecords.length;
					}
				});

			$scope.numBGLG10 = totalBGLG10;
			$scope.numBGSM4 = totalBGSM4;
		};


		$scope.$watch('dt7', function() {
			//$scope.isCollapsed = true;
			$scope.resetDate();

		});


		//end date picker.


		//Get latest A1c
		$scope.getLastA1c = function(userID) {
			$http.get('/userRecords/a1c/' + userID, $scope.credentials).success(function (response) {
				$scope.latestA1CValue = response;
			});
		};

		$scope.getLastA1c($scope.targetUserId);


		$scope.getReminders = function(userID) {
			$http.get('/userRecords/reminder/' + userID, $scope.credentials).success(function (response) {


				$scope.reminders = response;
				$scope.reminders.description = response.length + ' reminders';
			});
		};

		$scope.seeRemindersInDetail= function (records) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/modules/dietitians/directives/my-reminder.detail.client.template.html',
				controller: 'ReminderDetailModalCtrl',
				resolve: {
					records: function () {
						return records;
					}
				}
			});

		};

		$scope.seeA1CRecordsInDetail= function () {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/modules/dietitians/directives/my-a1c.detail.client.template.html',
				controller: 'A1CDetailModalCtrl',
				resolve: {
					userID: function () {
						return $scope.targetUserId;
					}
				}
			});

		};

		$scope.seeWeightInDetail= function () {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/modules/dietitians/directives/my-weight.detail.client.template.html',
				controller: 'WeightDetailModalCtrl',
				resolve: {
					userID: function () {
						return $scope.targetUserId;
					}
				}
			});

		};



		$scope.getReminders($scope.targetUserId);


		// Get detailed records for each categories.
		$scope.getSleepTime = function(dayRecord) {
			if(dayRecord && dayRecord.sleepRecords &&dayRecord.sleepRecords.length) {
				return dayRecord.sleepRecords[dayRecord.sleepRecords.length -1];
			} else {
				return undefined;
			}
		};

		$scope.getOneDayBGForChart = function(dayRecord, label, data) {

			if(dayRecord && dayRecord.glucoseRecords && dayRecord.glucoseRecords.length) {
				dayRecord.glucoseRecords.sort(function (a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});
			}

			for(var i = 0 ; i < dayRecord.glucoseRecords.length; ++i) {
				label.push($filter('date')(dayRecord.glucoseRecords[i].recordedTime, 'HH:mm'));
				data.push(dayRecord.glucoseRecords[i].level);
			}
		};

		// type 0: fasting , type 1: 2-hour after; type 2: other;
		$scope.getBG = function(dayRecord) {
			if(dayRecord && dayRecord.glucoseRecords && dayRecord.glucoseRecords.length) {
				dayRecord.glucoseRecords.sort(function(a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				var bgType = ['Fasting BG','2-hours after meal BG', 'Other BG' ];

				for(var i = 0 ; i < dayRecord.glucoseRecords.length; ++i) {
					var index = dayRecord.glucoseRecords[i].glucoseType;
					if(index >= bgType.length) {
						index = bgType.length - 1;
					}
					// if(index === 1){
					// 	var recordedTime = new Date(dayRecord.glucoseRecords[i].recordedTime);
					// 	var startTime = recordedTime.setHours(recordedTime.getHours()-2);
					// 	//var endTime = recordedTime.setHours(recordedTIme.getHours()+2);
					// 	var endTime = recordedTime;
					// 	var meal = getMealByTime(dayRecord, startTime, endTime);
					// 	if(meal){
					// 		var popovertitle = 'Meal Summary: ';
					// 		var popcontent =
					// 	  'Carbs: ' + meal.carb + '(g)\n' +
					// 	  'Pro: ' + meal.pro + '(g)\n' +
					// 	  'Fat: ' + meal.fat + '(g)\n' +
					// 	  'Calories: ' + meal.cals + ' kcals';
					// 		dayRecord.glucoseRecords[i].popover = {title:popovertitle, content:popcontent};
					// 	}
					// }
					dayRecord.glucoseRecords[i].title = bgType[index];

					if(index === 1) {
						dayRecord.glucoseRecords[i].mealInfo =
							getMealBeforeTimespan(dayRecord, dayRecord.glucoseRecords[i].recordedTime, 3*60*60*1000);
						var meal = dayRecord.glucoseRecords[i].mealInfo;
						if(meal){
							//alert(meal);
							var popovertitle = 'Meal Summary: ';
							var popcontent =
								'Carbs: ' + meal.carb + '(g)\n' +
								'Pro: ' + meal.pro + '(g)\n' +
								'Fat: ' + meal.fat + '(g)\n' +
								'Calories: ' + meal.cals + ' kcals';
							// dayRecord.glucoseRecords[i].popover = {title:popovertitle, content:popcontent};
							dayRecord.glucoseRecords[i].popovertitle = popovertitle;
							dayRecord.glucoseRecords[i].popovercontent = popcontent;
						}
					}
				}
				//console.log(dayRecord.glucoseRecords);

				return dayRecord.glucoseRecords;
			}

			return undefined;

		};


		function getMealByTime(dayRecord, startTime, endTime) {

			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				for(var i = 0 ; i < dayRecord.mealRecords.length; ++i) {
					var recordedTime = new Date(dayRecord.mealRecords[i].recordedTime);
					if (recordedTime >= startTime && recordedTime <= endTime) {
						return dayRecord.mealRecords[i];
					}
				}
			}
			return undefined;
		}

		function getMealBeforeTimespan(dayRecord, recordedTime, timespan) {
			var baseTime = new Date(recordedTime);

			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				for(var i = 0 ; i < dayRecord.mealRecords.length; ++i) {
					var currentRecord = new Date(dayRecord.mealRecords[i].recordedTime);
					if ( baseTime.getTime() - currentRecord.getTime()  >=0 &&
						baseTime.getTime() - currentRecord.getTime() <= timespan) {
						return dayRecord.mealRecords[i];
					}
				}
			}

			return undefined;
		}

		$scope.getBGByType = function(dayRecord, type) {
			var bgType = ['Before Breakfast BG','After Breakfast BG',
				'Before Lunch BG','After Lunch BG','Before Dinner BG','After Dinner BG','Bedtime BG','Other BG'];

			if (dayRecord && dayRecord.glucoseRecords && dayRecord.glucoseRecords.length) {
				dayRecord.glucoseRecords.sort(function (a, b) {
					return new Date(b.recordedTime) - new Date(a.recordedTime);
				});

				for(var i = 0 ; i < dayRecord.glucoseRecords.length; ++i) {
					if (type === dayRecord.glucoseRecords[i].glucoseType && type < bgType.length) {
						return dayRecord.glucoseRecords[i];
					}
				}
			}
			return undefined;
		};

		$scope.updateMealFiber = function(dayRecord){

			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				for(var i = 0 ; i < dayRecord.mealRecords.length; ++i) {
					if(! dayRecord.mealRecords[i].fiber) {
						dayRecord.mealRecords[i].fiber = $scope.getFiberForMeal(dayRecord.mealRecords[i]);
					}
					//console.log(dayRecord.mealRecords[i].fiber);
				}
			}
		};

		//'Snack', 'Breakfast', 'Lunch', 'Supper'
		function getMealByType(dayRecord, mealType) {
			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				//for(var i = 0 ; i < dayRecord.mealRecords.length; ++i) {
				for(var i = dayRecord.mealRecords.length -1 ; i >= 0; --i ) {
					if (dayRecord.mealRecords[i].mealType === mealType) {
						return dayRecord.mealRecords[i];
					}
				}
			}

			return undefined;
		}

		$scope.getTipsByMeal= function(dayRecord, meal) {
			if(dayRecord && dayRecord.mealTipRecords && dayRecord.mealTipRecords.length) {
				var tips = [];
				for(var i = dayRecord.mealTipRecords.length -1 ; i >= 0; --i ) {
					if (dayRecord.mealTipRecords[i].reference && dayRecord.mealTipRecords[i].reference === meal._id) {
						tips.push(dayRecord.mealTipRecords[i]);
					}
				}
				return tips;
			}
			return undefined;
		};

		$scope.getBreakfast = function(dayRecord) {
			return getMealByType(dayRecord, 'Breakfast');
		};

		$scope.getLunch = function(dayRecord) {
			return getMealByType(dayRecord, 'Lunch');
		};

		$scope.getSupper = function(dayRecord) {
			return getMealByType(dayRecord, 'Supper');
		};

		$scope.getDailyTips = function(dayRecord) {
			if(dayRecord && dayRecord.tipRecords && dayRecord.tipRecords.length) {
				return dayRecord.tipRecords;
			}
			return undefined;
		};

		$scope.getQuestions = function(dayRecord) {
			if(dayRecord && dayRecord.questionRecords && dayRecord.questionRecords.length) {
				return dayRecord.questionRecords;
			}
			return undefined;
		};

		$scope.getReports = function(dayRecord){
			if(dayRecord && dayRecord.reportRecords && dayRecord.reportRecords.length) {
				return dayRecord.reportRecords;
			}
			return undefined;
		};

		$scope.getMorningSnack = function(dayRecord) {

			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				dayRecord.mealRecords.sort(function(a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				for (var i = 0; i < dayRecord.mealRecords.length; ++i) {
					if(dayRecord.mealRecords[i].mealType === 'Breakfast' && i < dayRecord.mealRecords.length - 1){
						if(dayRecord.mealRecords[i+1].mealType === 'Snack') {
							return dayRecord.mealRecords[i+1];
						}
					}
				}
			}

			return undefined;
		};


		$scope.getAfternoonSnack = function(dayRecord) {
			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				dayRecord.mealRecords.sort(function(a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				for (var i = 0; i < dayRecord.mealRecords.length; ++i) {
					if(dayRecord.mealRecords[i].mealType === 'Lunch' && i < dayRecord.mealRecords.length - 1){
						if(dayRecord.mealRecords[i+1].mealType === 'Snack') {
							return dayRecord.mealRecords[i+1];
						}
					}
				}
			}

			return undefined;
		};

		$scope.getEveningSnack = function(dayRecord) {
			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				dayRecord.mealRecords.sort(function(a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				for (var i = 0; i < dayRecord.mealRecords.length; ++i) {
					if(dayRecord.mealRecords[i].mealType === 'Supper' && i < dayRecord.mealRecords.length - 1){
						if(dayRecord.mealRecords[i+1].mealType === 'Snack') {
							return dayRecord.mealRecords[i+1];
						}
					}
				}
			}

			return undefined;
		};


		$scope.getSnackAndExerciseinTimeSpan = function(dayRecord, startHour, endHour) {
			var snackAndExercise ={};
			var mealRecords = [];
			var bloodPressureRecords = [];
			var insulinRecords = [];
			var medicineRecords = [];
			var startTime;
			var endTime;
			var recordedTime;
			var i = 0;

			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				dayRecord.mealRecords.sort(function(a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				startTime = new Date(dayRecord.mealRecords[0].recordedTime);
				endTime = new Date(dayRecord.mealRecords[0].recordedTime);
				startTime.setHours(startHour, 0, 0);
				if(endHour >= 24) {
					endTime.setHours(23, 59, 59);
				} else {
					endTime.setHours(endHour, 0, 0);
				}



				for (i = 0; i < dayRecord.mealRecords.length; ++i) {
					recordedTime = new Date(dayRecord.mealRecords[i].recordedTime);
					if(dayRecord.mealRecords[i].mealType === 'Snack' &&
						recordedTime < endTime && recordedTime >= startTime) {
						mealRecords.push(dayRecord.mealRecords[i]) ;
					}
				}
			}

			if(dayRecord && dayRecord.bloodPressureRecords && dayRecord.bloodPressureRecords.length) {
				dayRecord.bloodPressureRecords.sort(function(a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				startTime = new Date(dayRecord.bloodPressureRecords[0].recordedTime);
				endTime = new Date(dayRecord.bloodPressureRecords[0].recordedTime);
				startTime.setHours(startHour, 0, 0);
				endTime.setHours(endHour, 0, 0);

				for (i = 0; i < dayRecord.bloodPressureRecords.length; ++i) {
					recordedTime = new Date(dayRecord.bloodPressureRecords[i].recordedTime);
					if(recordedTime < endTime && recordedTime >= startTime) {
						bloodPressureRecords.push(dayRecord.bloodPressureRecords[i]) ;
					}
				}
			}

			if(dayRecord && dayRecord.insulinRecords && dayRecord.insulinRecords.length) {
				dayRecord.insulinRecords.sort(function(a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				startTime = new Date(dayRecord.insulinRecords[0].recordedTime);
				endTime = new Date(dayRecord.insulinRecords[0].recordedTime);
				startTime.setHours(startHour, 0, 0);
				endTime.setHours(endHour, 0, 0);

				for (i = 0; i < dayRecord.insulinRecords.length; ++i) {
					recordedTime = new Date(dayRecord.insulinRecords[i].recordedTime);
					if(recordedTime < endTime && recordedTime >= startTime) {
						insulinRecords.push(dayRecord.insulinRecords[i]) ;
					}
				}
			}


			if(dayRecord && dayRecord.medicineRecords && dayRecord.medicineRecords.length) {
				dayRecord.medicineRecords.sort(function(a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				startTime = new Date(dayRecord.medicineRecords[0].recordedTime);
				endTime = new Date(dayRecord.medicineRecords[0].recordedTime);
				startTime.setHours(startHour, 0, 0);
				endTime.setHours(endHour, 0, 0);

				for (i = 0; i < dayRecord.medicineRecords.length; ++i) {
					recordedTime = new Date(dayRecord.medicineRecords[i].recordedTime);
					if(recordedTime < endTime && recordedTime >= startTime) {
						medicineRecords.push(dayRecord.medicineRecords[i]) ;
					}
				}
			}
			snackAndExercise.mealRecords = mealRecords;
			snackAndExercise.bloodPressureRecords = bloodPressureRecords;
			snackAndExercise.insulinRecords = insulinRecords;
			snackAndExercise.medicineRecords = medicineRecords;

			return snackAndExercise;
		};

		$scope.hasRecordData = function(records) {
			if(records)
			{
				for(var i = 0; i < records.length; i++) {
					if(records[i].mealRecords.length ||
						records[i].bloodPressureRecords.length ||
						records[i].insulinRecords.length||
						records[i].medicineRecords.length){
						return true;
					}
				}
			}

			return false;
		};

		$scope.getbeforeBreakfastSnackAndExercise = function (dayRecord) {
			return $scope.getSnackAndExerciseinTimeSpan(dayRecord, 0, 11);
		};

		$scope.getMorningSnackAndExercise = function (dayRecord) {
			return $scope.getSnackAndExerciseinTimeSpan(dayRecord, 11, 15);
		};

		$scope.getAfternoonSnackAndExercise = function (dayRecord) {
			return $scope.getSnackAndExerciseinTimeSpan(dayRecord, 15, 20);
		};

		$scope.getEveningSnackAndExercise = function (dayRecord) {
			var ret = $scope.getSnackAndExerciseinTimeSpan(dayRecord, 20, 24);
			if(dayRecord.exerciseRecords.totalCals > 0) {
				ret.sumOfExercise = dayRecord.exerciseRecords;
			}
			return ret;
		};



		$scope.getWeight = function(dayRecord) {

			if(dayRecord && dayRecord.weightRecords && dayRecord.weightRecords.length) {
				dayRecord.weightRecords.sort(function(a, b) {
					return new Date(b.recordedTime) - new Date(a.recordedTime);
				});

				return dayRecord.weightRecords[0];
			}

			return undefined;
		};

		$scope.getExercise = function(dayRecord) {
			if(dayRecord && dayRecord.exerciseRecords && dayRecord.exerciseRecords.length) {
				dayRecord.exerciseRecords.sort(function(a, b) {
					return new Date(b.recordedTime) - new Date(a.recordedTime);
				});

				return dayRecord.exerciseRecords;
			}

			return undefined;
		};

		$scope.getFiberForMeal = function(mealRecord) {
			var totalFiber = 0;

			if(!mealRecord || !mealRecord.food) return 0;

			var convFac;
			for(var i = 0; i < mealRecord.food.length; i++) {
				//console.log('food:' + JSON.stringify(mealRecord.food[i]));
				convFac = mealRecord.food[i].convFac? mealRecord.food[i].convFac: 1;

				if(mealRecord.food[i].itemID) {

					mealRecord.food[i].fibre = mealRecord.food[i].itemID.fibre * mealRecord.food[i].servingSize * convFac;
					mealRecord.food[i].cals = mealRecord.food[i].itemID.calories * mealRecord.food[i].servingSize * convFac;
					mealRecord.food[i].carb = mealRecord.food[i].itemID.carbs * mealRecord.food[i].servingSize * convFac;
					mealRecord.food[i].fat = mealRecord.food[i].itemID.fat * mealRecord.food[i].servingSize * convFac;
					mealRecord.food[i].pro = mealRecord.food[i].itemID.protein * mealRecord.food[i].servingSize * convFac;

					totalFiber += mealRecord.food[i].fibre;
				}



			}

			return totalFiber;
		};


		//$scope.summary = {};
		$scope.getSummary = function(dayRecord) {
			var dataForSum = {};
			dataForSum.ideaCals = 0;
			dataForSum.totalCals = 0;
			dataForSum.totalCarb = 0;
			dataForSum.totalFiber = 0;
			dataForSum.totalSugar = 0;
			dataForSum.totalNetCarb = 0;
			dataForSum.totalPro = 0;
			dataForSum.totalFat = 0;
			dataForSum.totalBurned = 0;
			dataForSum.totalNumOfMeals = 0;
			dataForSum.totalCalsFromSnack = 0;


			var i = 0;
			if(dayRecord && dayRecord.mealRecords && dayRecord.mealRecords.length) {
				dataForSum.totalNumOfMeals = 0;

				for (i = 0; i < dayRecord.mealRecords.length; ++i) {
					if(dayRecord.mealRecords[i].mealType !== 'Snack') {

						dataForSum.totalCarb += dayRecord.mealRecords[i].carb;
						dataForSum.totalFiber += dayRecord.mealRecords[i].fibre;
						dataForSum.totalPro += dayRecord.mealRecords[i].pro;
						dataForSum.totalFat += dayRecord.mealRecords[i].fat;
						dataForSum.totalCals += dayRecord.mealRecords[i].cals;

						dataForSum.totalNumOfMeals += 1;
					} else {
						dataForSum.totalCalsFromSnack += dayRecord.mealRecords[i].cals;
					}
				}
			}

			//if(dayRecord && dayRecord.exerciseRecords && dayRecord.exerciseRecords.length) {
			//	for (i = 0; i < dayRecord.exerciseRecords.length; ++i) {
			//		dataForSum.totalBurned += dayRecord.exerciseRecords[i].calories;
			//	}
			//}

			if(dayRecord && dayRecord.exerciseRecords) {

				dataForSum.totalBurned = dayRecord.exerciseRecords.totalCals;
			}

			return dataForSum;
		};


		//for new logbook
		$scope.isValid = function (day) {
			//console.log(day);
			if(day && day.mealRecords && day.glucoseRecords && day.medicineRecords && day.bloodPressureRecords && day.sleepRecords && day.insulinRecords) {

				return day.mealRecords.length > 0 || day.glucoseRecords.length > 0 || day.exerciseRecords.totalCals >0 || day.medicineRecords.length > 0  || day.bloodPressureRecords.length > 0|| day.insulinRecords.length > 0 ||  day.sleepRecords.length > 0;
			} else {
				return false;
			}
			//{"weightRecords":[],"insulinRecords":[],"sleepRecords":[],"QuestionRecords":[],"noteRecords":[],"mealRecords":[],"glucoseRecords":[],"exerciseRecords":[],
		};

		//for new logbook
		$scope.isValidBG = function (day) {
			//console.log(day);
			if(day && day.glucoseRecords) {

				return day.glucoseRecords.length;
			} else {
				return false;
			}
			//{"weightRecords":[],"insulinRecords":[],"sleepRecords":[],"QuestionRecords":[],"noteRecords":[],"mealRecords":[],"glucoseRecords":[],"exerciseRecords":[],
		};

		//
		$scope.getBGHChartConfig = function(dayRecord) { // chartData) {

			//console.log(dayRecord);
			//var data = {};

			var glucoses = [];
			var meals = [];
			var insulins = [];
			//var exercises = [];

			//['Before Breakfast', 'After Breakfast', 'Before Lunch', 'After Lunch', 'Before Dinner',
			//'After Dinner', 'Bedtime'],
			var weeklyBGData = [null,null,null,null,null,null,null];

			//http://stackoverflow.com/questions/24522544/convert-javascript-datetime-object-to-the-format-acceptable-by-highcharts-date-u
			var genHChartDate = function(s) {

				var b = s.split(/\D+/);

				return Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]);
			};



			if(dayRecord && dayRecord.glucoseRecords && dayRecord.glucoseRecords.length) {
				dayRecord.glucoseRecords.sort(function (a, b) {
					return new Date(a.recordedTime) - new Date(b.recordedTime);
				});

				dayRecord.glucoseRecords.forEach(function(row) {
					if(row.glucoseType >=0 && row.glucoseType <= 6) {
						weeklyBGData[row.glucoseType] = row.level;
					}

					glucoses.push([genHChartDate(row.recordedTime),
						row.level]);


				});


			}

			var weeklyBeforeAfterBGData = {
				beforeBG:[weeklyBGData[0], weeklyBGData[2], weeklyBGData[4]],
				afterBG:[weeklyBGData[1], weeklyBGData[3], weeklyBGData[5]]
			};

			if(dayRecord && dayRecord.mealRecords) {
				dayRecord.mealRecords.forEach(function(row) {
					meals.push([genHChartDate(row.recordedTime), 2.5]);
				});
			}

			if(dayRecord && dayRecord.insulinRecords) {
				dayRecord.insulinRecords.forEach(function(row) {
					insulins.push([genHChartDate(row.recordedTime), 1]);
				});
			}

			if(dayRecord && dayRecord.medicineRecords) {
				dayRecord.medicineRecords.forEach(function(row) {
					insulins.push([genHChartDate(row.recordedTime), 1]);
				});
			}

			//if(dayRecord && dayRecord.exerciseRecords) {
			//	dayRecord.exerciseRecords.forEach(function(row) {
			//		exercises.push([genHChartDate(row.recordedTime), 1]);
			//	});
			//}


			var dailyChartData = {
				options: {
					exporting: {
						enabled: false
					},
					tooltip: {
						dateTimeLabelFormats: {
							hour: '%e, %H:%M',
						}
					}

				},
				series: [{
					type: 'spline',
					name: 'BG',

					zoomType: 'x',
					data: glucoses,
					marker: {
						//radius: 4,

						symbol: 'circle'

					},

				},
					{
						type: 'scatter',
						name: 'Meal/Snack',
						dataLabels: {
							enabled: true,
							formatter: function(){
								//return '<b>' + this.series.name +'</b><br/>' +
								return	Highcharts.dateFormat('%H:%M',
									new Date(this.x));
							}
						},
						tooltip: {


							pointFormatter: function () {
								return Highcharts.dateFormat('%H:%M',
									new Date(this.x));
							}

						},
						data: meals,
						marker: {
							radius: 4,
							symbol: 'square'
						},
					},
					{
						type: 'scatter',
						name: 'Medicine',
						dataLabels: {
							enabled: true,
							formatter: function(){
								//return '<b>' + this.series.name +'</b><br/>' +
								return	Highcharts.dateFormat('%H:%M',
									new Date(this.x));
							}
						},
						tooltip: {


							pointFormatter: function () {
								return Highcharts.dateFormat('%H:%M',
									new Date(this.x));
							}

						},
						data: insulins,
						marker: {
							radius: 4,
							symbol: 'diamond'
						}
					},
					//{
					//	type: 'scatter',
					//	name: 'Exercise',
					//	dataLabels: {
					//		enabled: true,
					//		formatter: function(){
					//			//return '<b>' + this.series.name +'</b><br/>' +
					//			return	Highcharts.dateFormat('%H:%M',
					//				new Date(this.x));
					//		}
					//	},
					//	tooltip: {
					//
					//
					//		pointFormatter: function () {
					//			return Highcharts.dateFormat('%H:%M',
					//				new Date(this.x));
					//		}
					//
					//	},
					//	data: exercises,
					//	marker: {
					//		radius: 4,
					//		symbol: 'triangle-down'
					//	}
					//}
				],
				title: {
					text: 'Daily BG Chart'
				},
				xAxis: {
					type: 'datetime',
					dateTimeLabelFormats: {
						hour: '%H:%M',
					}
				},
				yAxis: {
					min:1,
					minRange:10,
					title: {
						text: 'BG (unit: mmol/L)'
					},
					labels: {
						enabled: true
					},
					plotBands: [{ // Light air
						from: 4,
						to: 10,
						color: 'rgba(68, 170, 213, 0.3)',
						label: {
							text: 'BG between 4 - 10 mmol/L',
							style: {
								color: '#E0E0E3',
							},
							align: 'left'


						}
					}],
				},

				loading: false
			};


			//console.log(chartData);

			return { dailyBGData:dailyChartData,
				weeklyBGData:weeklyBGData,
				weeklyBeforeAfterBGData:weeklyBeforeAfterBGData
			};

		};

		$scope.scrollToTop = function(id) {
			$location.hash(id);
			$anchorScroll();
		};

		$scope.hasExerciseData = function() {


			return $scope.weeklyExerciseChart.xAxis.categories.length > 0;
		};

		$scope.hasMealData = function() {
			return $scope.weeklyAverageMealSize > 0;
		};
		$scope.hasBGData = function() {
			return $scope.weeklyBGData && $scope.weeklyBGData.length > 0;
		};

		$scope.weeklyStepChart = {

			options: {
				exporting: {
					enabled: false
				},
				tooltip: {
					shared: true,
					crosshairs: true
				},
				chart: {
					//type: 'bar',
					plotBackgroundColor: null,
					plotBorderWidth: 0,
					plotShadow: false
				},
			},




			title: {
				text: 'Daily Step Count'
			},


			xAxis: {
				categories: []
			},



			yAxis: {
				min:0,
				labels: {
					enabled: true
				},

				title: {
					text: null
				},

				plotLines: [{
					value: 7500,
					//color: 'red',
					color: '#90ee7e',
					//zIndex:3,
					//dashStyle: 'shortdash',
					zIndex:2,
					width: 1.5,
					label: {
						style: {
							color: '#E0E0E3',
						},

						align: 'center',
						text: 'daily target: 7,500 steps'
					}
				},
					{
						value: 37500,
						//color: 'red',
						color: '#90ee7e',
						//zIndex:3,
						//dashStyle: 'shortdash',
						zIndex:2,
						width: 1.5,
						label: {
							style: {
								color: '#E0E0E3',
							},

							align: 'center',
							text: 'weekly target: 37,500 steps'
						}

					}]

			},

			legend: {
				//align: 'left',
				//verticalAlign: 'top',
				//y: 20,
				//floating: true,
				borderWidth: 0
			},

			series: [{
				name: 'Daily Steps',
				type: 'bar',
				maxPointWidth: 20,
				data: []
			},
				{
					name: 'Total Steps',
					type: 'spline',
					color:'#FFF263',
					data: []
				}]
		};

		$scope.weeklyExerciseChart = {

			options: {
				exporting: {
					enabled: false
				},
				tooltip: {
					shared: true,
					crosshairs: true
				},
			},




			title: {
				text: 'Moderate & Vigorous Exercise'
			},


			xAxis: {
				categories: []
			},



			yAxis: {
				min:0,
				labels: {
					enabled: true
				},

				title: {
					text: null
				},
				plotLines: [{
					value: 150,
					color: '#90ee7e',
					zIndex:2,
					width: 1.5,
					label: {
						style: {
							color: '#E0E0E3',
						},

						align: 'center',
						text: 'weekly target: 150 minutes'
					}

				}]

			},

			legend: {
				align: 'left',
				verticalAlign: 'top',
				y: 20,
				//floating: true,
				borderWidth: 0
			},

			series: [{
				name: 'Minutes',
				type: 'bar',
				maxPointWidth: 20,
				data: []
			},
				{
					name: 'Total minutes',
					type: 'spline',
					color:'#FFF263',
					data: []
				},
			]
		};


		$scope.mealScoreChart = {

			options: {
				exporting: {
					enabled: false
				},
				tooltip: {
					shared: true,
					crosshairs: true
				},
				chart: {
					type: 'spline',
					plotBackgroundColor: null,
					plotBorderWidth: 0,
					plotShadow: false
				},
			},




			title: {
				text: 'Average Daily Meal Score'
			},


			xAxis: {
				categories: []
			},



			yAxis: {
				min:0,
				max:100,
				labels: {
					enabled: true
				},

				title: {
					text: null
				},

			},

			legend: {
				align: 'left',
				verticalAlign: 'top',
				y: 20,
				floating: true,
				borderWidth: 0
			},

			series: [{
				name: 'Meal Score',
				data: []
			}]
		};


		$scope.weeklyNutrionChart = {

			title: {
				text: 'Average Nutrition Distribution of Meals'
				//align: 'center',
				//verticalAlign: 'middle',
				//y: 80
			},

			subtitle: {
				//text: 'Average meal size: -- kcals<br/><br/>Calories Distribution of Your Average Meal<br/>',
				//useHTML: true,
				text: 'Average meal size: -- kcals',

				//verticalAlign: 'middle',
				y: 70,
				style: {
					fontSize: '16px',
					textShadow: 'none'
				}
			},

			series: [{
				type: 'pie',
				innerSize: '50%',
				colors: ['#f45b5b', '#90ee7e', '#2b908f', '#7798BF'],
				data: [
					['Carbs', 1],
					['Fibre', 2],
					['Protein', 3],
					['Fat',  4]
				]
			}],

			options:{

				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: 0,
					plotShadow: false

				},

				tooltip: {

					pointFormat: '<b>{point.percentage:.1f}%</b>',
					style: {
						fontFamily: 'Dosis, sans-serif',
						textTransform: 'uppercase',
					}
				},

				plotOptions: {

					pie: {
						size:'40%',
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							distance: 10,
							enabled: true,
							color: 'white',
							//format: '<b>{point.percentage:.1f} % </b>',

							formatter: function () {
								var s =  this.point.name + ': <b>' + this.point.percentage.toFixed(1) + '% </b> '+ '<br/>';

								if (this.point.name === 'Carbs') {
									s += '(target: 45% to 60%)<br/>';
								} else if (this.point.name === 'Fat') {
									s += '(target: 20% to 35%)<br/>';
								} else if (this.point.name === 'Protein') {
									s += '(target: 15% to 20%)<br/>';
								}
								return s;
							},
							style: {
								color: 'contrast',
								fontSize: '8px',
								//fontWeight: 'bold',
								//fontFamily: 'Dosis, sans-serif',
								textTransform: 'uppercase',
								textShadow: 'none'
							}
						},

						//showInLegend: true,
						//startAngle: -90,
						//endAngle: 90,
						center: ['50%', '60%']
					},

				}

			}

		};






		$scope.bedTimeChart = {

			options: {


				tooltip: {
					shared: true,
					crosshairs: true
				},


			},


			title: {
				text: 'Bedtime Chart'
			},


			xAxis: {
				categories: [],
			},


			/*
			 yAxis: {
			 min:1,
			 labels: {
			 enabled: true
			 },
			 plotBands: [{ // Light air
			 from: 4,
			 to: 10,
			 color: 'rgba(68, 170, 213, 0.3)',
			 label: {
			 text: 'BG between 4 aa - 10 mmol/L',
			 style: {
			 color: '#E0E0E3',
			 },
			 align: 'center'
			 }
			 }],
			 },*/

			yAxis: [{ // Primary yAxis
				min : 0,
				showFirstLabel: false,
				labels: {
					//format: '      ',//'{value}mmol/L',
					formatter: function(){
						if(this.value >=30 || this.value <=4) {
							return this.value + ' mmol/L';
						} else {
							return '';
						}
					}

					//padding:30,
					//	enabled: true
				},
				title: {
					text: 'Bedtime BG'
				},

				plotLines: [{
					value: 4,
					color: 'red',
					zIndex:3,
					//dashStyle: 'shortdash',
					width: 2,
					label: {
						style: {
							color: '#E0E0E3',
							floating: true,
						},
						align: 'left',
						x: -40,
						y: 16,
						//rotation:-30,
						text: '4 mmol/L'
					}
				}, {
					value: 10,
					color: 'yellow',
					zIndex:3,
					//dashStyle: 'shortdash',
					width: 2,
					label: {
						style: {
							color: '#E0E0E3',
						},
						align: 'left',
						x: -40,
						y: 16,
						//rotation:-30,

						text: '10 mmol/L'
					}
				}],

			}, { // Secondary yAxis
				title: {
					text: 'Sleep time'
				},
				labels: {
					format: '{value} hours'
				},
				opposite: true
			}],



			legend: {
				align: 'left',
				verticalAlign: 'top',
				y: 20,
				floating: true,
				borderWidth: 0
			},



			series: [
				{
					type: 'column',
					yAxis: 1,

					name: 'Sleep time',
					data: [8,7.5,7,7,7.8,9]

				},

				{
					name: 'Bedtime BG',

					type: 'spline',

					//lineWidth: 4,
					//marker: {
					//	radius: 4
					//},
					data: [9,8.3,6.5,8.8,12,10],
					zIndex:5,


				},

			]
		};

		$scope.getDailyMealAvgScore = function(dayRecord) {
			var totalScore = 0;
			if(!dayRecord || !dayRecord.mealRecords) return 0;

			for(var i = 0; i < dayRecord.mealRecords.length; i++) {
				if (dayRecord.mealRecords[i].mealScore)
					totalScore += dayRecord.mealRecords[i].mealScore;
			}
			if (dayRecord.mealRecords.length) {
				var averageScore = totalScore/(dayRecord.mealRecords.length);

				return Math.round(averageScore *10) / 10;

			}
			return 0;
		};

		$scope.getWeeklyNutrionInfo = function(dayRecord){

		};

		$scope.addToExerciseChart  = function(label, data) {

			var dailyMinutes = 0;
			data.pedometer.forEach(function(row){
				if(row.type !== 'Light') {
					dailyMinutes += row.minutes;
				}
			});

			data.manual.forEach(function(row){
				if(row.type !== 'Light') {
					dailyMinutes += row.minutes;
				}
			});

			dailyMinutes = Math.round(dailyMinutes*10) / 10;

			var totalMinutes = dailyMinutes;
			var len = $scope.weeklyExerciseChart.series[1].data.length;
			if(len > 0) {
				totalMinutes += $scope.weeklyExerciseChart.series[1].data[len - 1];
			}
			totalMinutes = Math.round(totalMinutes*10) / 10;

			$scope.weeklyExerciseChart.xAxis.categories.push(label);
			$scope.weeklyExerciseChart.series[0].data.push(dailyMinutes);
			$scope.weeklyExerciseChart.series[1].data.push(totalMinutes);

			if(data.stepCount > 0) {

				var totalSteps = data.stepCount;
				var len2 = $scope.weeklyStepChart.series[1].data.length;
				if(len2 > 0) {
					totalSteps += $scope.weeklyStepChart.series[1].data[len2 - 1];
				}

				totalSteps = Math.round(totalSteps*10) / 10;

				$scope.weeklyStepChart.xAxis.categories.push(label);
				$scope.weeklyStepChart.series[0].data.push(data.stepCount);
				$scope.weeklyStepChart.series[1].data.push(totalSteps);
			}


		};

		$scope.updateChartData2 = function() {
			var d1 = $filter('date')($scope.dt1, 'MMM d'),
				d2 = $filter('date')($scope.dt2, 'MMM d'),
				d3 = $filter('date')($scope.dt3, 'MMM d'),
				d4 = $filter('date')($scope.dt4, 'MMM d'),
				d5 = $filter('date')($scope.dt5, 'MMM d'),
				d6 = $filter('date')($scope.dt6, 'MMM d'),
				d7 = $filter('date')($scope.dt7, 'MMM d');
			$scope.labels = [d1, d2, d3, d4, d5, d6, d7];

			$scope.dts = [$scope.dt1,$scope.dt2,$scope.dt3,$scope.dt4,$scope.dt5,$scope.dt6,$scope.dt7];

			$scope.dailyBGChart = [];
			$scope.dailyNutritionChart = [];
			$scope.weeklyBGData = [];

			$scope.weeklyBeforeAfterBGData = {
				beforeBG:[],
				afterBG:[],
				labels:[]
			};

			$scope.bedTimeChart.series[0].data = [];//sleep time
			$scope.bedTimeChart.series[1].data = [];//bedtime bg
			$scope.bedTimeChart.xAxis.categories = [];
			$scope.weeklyNutrionChart.series[0].data[0][1] = 0;
			$scope.weeklyNutrionChart.series[0].data[1][1] = 0;
			$scope.weeklyNutrionChart.series[0].data[2][1] = 0;
			$scope.weeklyNutrionChart.series[0].data[3][1] = 0;
			$scope.mealScoreChart.series[0].data = [];
			$scope.weeklyAverageMealSize = 0;
			$scope.weeklyExerciseChart.xAxis.categories = [];
			$scope.weeklyExerciseChart.series[0].data = [];
			$scope.weeklyExerciseChart.series[1].data = [];

			$scope.weeklyStepChart.xAxis.categories = [];
			$scope.weeklyStepChart.series[0].data = [];
			$scope.weeklyStepChart.series[1].data = [];

			$scope.weeklyNutrionChart.subtitle.text =  'Average meal size: -- kcals';


			var totalCals = 0;
			var totalNumOfMeals = 0;


			[$scope.day1,$scope.day2,$scope.day3,$scope.day4,$scope.day5,$scope.day6,$scope.day7].forEach(function(day, index) {
				var chartData = {};

				if($scope.isValid(day)) {

					chartData = $scope.getBGHChartConfig(day);
					var bedTimeBG = null;
					if(day.glucoseRecords && day.glucoseRecords.length > 0 ) {

						$scope.weeklyBGData.push({
							name:$scope.labels[index],
							data:chartData.weeklyBGData
						});


						$scope.weeklyBeforeAfterBGData.beforeBG.push(chartData.weeklyBGData[0]);
						$scope.weeklyBeforeAfterBGData.beforeBG.push(chartData.weeklyBGData[2]);
						$scope.weeklyBeforeAfterBGData.beforeBG.push(chartData.weeklyBGData[4]);

						$scope.weeklyBeforeAfterBGData.afterBG.push(chartData.weeklyBGData[1]);
						$scope.weeklyBeforeAfterBGData.afterBG.push(chartData.weeklyBGData[3]);
						$scope.weeklyBeforeAfterBGData.afterBG.push(chartData.weeklyBGData[5]);

						$scope.weeklyBeforeAfterBGData.labels.push($scope.labels[index]+'-Breakfast');
						$scope.weeklyBeforeAfterBGData.labels.push($scope.labels[index]+'-Lunch');
						$scope.weeklyBeforeAfterBGData.labels.push($scope.labels[index]+'-Dinner');

						//bedTimeBG = chartData.weeklyBGData[6];
					}

					$scope.addToExerciseChart($scope.labels[index],day.exerciseRecords);

					$scope.mealScoreChart.xAxis.categories.push($scope.labels[index]);

					$scope.mealScoreChart.series[0].data.push($scope.getDailyMealAvgScore(day));



					//mealScoreChart
					var daySummary = $scope.getSummary(day);

					$scope.weeklyNutrionChart.series[0].data[0][1] += daySummary.totalCarb;
					$scope.weeklyNutrionChart.series[0].data[1][1] += daySummary.totalFiber;
					$scope.weeklyNutrionChart.series[0].data[2][1] += daySummary.totalPro;
					$scope.weeklyNutrionChart.series[0].data[3][1] += daySummary.totalFat;
					totalCals += daySummary.totalCals;
					totalNumOfMeals += daySummary.totalNumOfMeals;
				}

				$scope.dailyBGChart.push(chartData.dailyBGData);



			});




			//console.log('totalCals:'+totalCals+'num of meals:'+totalNumOfMeals);

			if(totalNumOfMeals > 0) {
				$scope.weeklyAverageMealSize = totalCals/totalNumOfMeals;

				$scope.weeklyNutrionChart.subtitle.text =  'Average meal size: ' + $scope.weeklyAverageMealSize.toFixed(1) +' kcals';

			}



			$scope.weeklyBGChart1 = {

				options: {
					chart: {
						type: 'spline'
					},
					tooltip: {
						shared: true,
						crosshairs: true
					}
				},


				title: {
					text: 'Daily BG Chart'
				},
				xAxis: {
					categories: ['Before Breakfast', 'After Breakfast', 'Before Lunch', 'After Lunch', 'Before Dinner',
						'After Dinner', 'Bedtime'],
					labels:{
						//rotation: -60
						staggerLines: 2
					}
				},

				yAxis: [{ // left y axis
					min : 0,

					title: {
						text: 'BG (unit: mmol/L)'
					},
					labels: {
					},

					plotBands: [{ // Light air
						from: 4,
						to: 10,
						color: 'rgba(68, 170, 213, 0.3)',
						label: {
							text: 'BG between 4 - 10 mmol/L',
							style: {
								color: '#E0E0E3',
								fontWeight: 'bold'
							},
							align: 'left',
							verticalAlign: 'bottom',
							y:-20
						}
					}],



					showFirstLabel: false
				},
				],

				legend: {
					align: 'left',
					verticalAlign: 'top',
					y: 20,
					floating: true,
					borderWidth: 0
				},

				series: $scope.weeklyBGData
			};


			$scope.weeklyBGChart2 = {

				options: {
					chart: {
						type: 'spline'
					},
					tooltip: {
						shared: true,
						crosshairs: true
					}


				},


				title: {
					text: 'Before/After Meal BG Chart'
				},


				xAxis: {
					categories: $scope.weeklyBeforeAfterBGData.labels,
					labels: {
						step: 3,
						formatter: function(){

							if(this.value && this.value.split) {
								return this.value.split('-')[0];
							} else {
								return this.value;
							}

						}
					}

				},



				yAxis: {
					min:1,
					title: {
						text: 'BG (unit: mmol/L)'
					},
					labels: {
						enabled: true
					},
					plotBands: [{ // Light air
						from: 4,
						to: 10,
						color: 'rgba(68, 170, 213, 0.3)',
						label: {
							text: 'BG between 4 - 10 mmol/L',
							style: {
								color: '#E0E0E3',
								fontWeight: 'bold'
							},
							align: 'left',
							verticalAlign: 'bottom',
							y:-20
						}
					}],
				},



				legend: {
					align: 'left',
					verticalAlign: 'top',
					y: 20,
					floating: true,
					borderWidth: 0
				},



				series: [{
					name: 'Before Meal',
					data: $scope.weeklyBeforeAfterBGData.beforeBG,


				},
					{
						name: 'After Meal',
						data: $scope.weeklyBeforeAfterBGData.afterBG

					}
				]
			};



			var intakeCals = [];
			var burnedCals = [];
			var caloriesChartLables = [];

			$scope.summaryInfo.forEach(function(data, index) {
				var nutritionChartData = {};
				if(data) {

					nutritionChartData = $scope.getDailyNutritionChart(data);
					if(data.totalCals || data.totalBurned) {

						var totalCals = data.totalCals? Math.round(data.totalCals*10) / 10 : null;
						intakeCals.push(totalCals);

						var totalBurned = data.totalBurned? Math.round(data.totalBurned*10) / 10 : null;
						burnedCals.push(totalBurned);
						caloriesChartLables.push($scope.labels[index]);
					}


				}


				$scope.dailyNutritionChart.push(nutritionChartData);
			});

			$scope.caloriesChart = {

				options: {
					exporting: {
						enabled: false
					},
					chart: {
						type: 'spline'
					},
					tooltip: {
						shared: true,
						crosshairs: true
					},


				},


				title: {
					text: 'Daily Calories Chart'
				},


				xAxis: {
					categories: caloriesChartLables,


				},



				yAxis: {
					min:1,
					labels: {
						enabled: true
					},

				},



				legend: {
					align: 'left',
					verticalAlign: 'top',
					y: 20,
					floating: true,
					borderWidth: 0
				},



				series: [{
					name: 'Intake',
					//lineWidth: 4,
					//marker: {
					//	radius: 4
					//},
					data: intakeCals,


				},
					{
						name: 'Burn',
						data: burnedCals

					}
				]
			};


			//slider update
			$scope.sliderUpdate();
		};

		//



		Highcharts.setOptions({
			global: {
				//timezoneOffset: 5 * 60
				useUTC: false
			},
			exporting: {
				enabled: false
			},
			credits: {
				enabled:false
			},
		});


		$scope.getDailyNutritionChart  = function(summary) {

			var nutritionFacts = {

				title: {
					text: 'Nutrition<br>Facts',
					align: 'center',
					verticalAlign: 'middle',
					y: 80
				},

				series: [{
					type: 'pie',
					innerSize: '50%',
					colors: ['#f45b5b', '#90ee7e', '#2b908f', '#7798BF'],
					data: [
						['Carbs', summary.totalCarb],
						['Fibre', summary.totalFiber],
						['Protein', summary.totalPro],
						['Fat',  summary.totalFat]
					]
				}],


				options:{
					exporting: {
						enabled: false
					},
					credits: {
						enabled:false
					},
					chart: {
						plotBackgroundColor: null,
						plotBorderWidth: 0,
						plotShadow: false,

					},

					tooltip: {

						//pointFormat: '{point.y:.1f} g <b>({point.percentage:.1f}%)</b>'
						style: {
							fontFamily: 'Dosis, sans-serif',
							textTransform: 'uppercase'
						},

						formatter: function () {
							var s = '<b>' + this.point.name + '</b> :' + this.point.percentage.toFixed(1) + '%  <br/>';

							if (this.point.name === 'Carbs') {
								s += '<p>(target: 45% to 60%)</p><br/>';
							} else if (this.point.name === 'Fat') {
								s += '(target: 20% to 35%)<br/>';
							} else if (this.point.name === 'Protein') {
								s += '(target: 15% to 20%)<br/>';
							}

							return s;
						},

					},

					plotOptions: {
						/*pie: {
						 dataLabels: {
						 enabled: true,
						 distance: -50,
						 style: {
						 fontWeight: 'bold',
						 color: 'black',
						 //textShadow: '0px 1px 2px black'
						 }
						 },*/


						pie: {
							allowPointSelect: true,
							cursor: 'pointer',
							dataLabels: {
								distance: -30,
								enabled: true,
								color: 'black',
								format: '<b>{point.y:.1f}</b> (g)',
								style: {
									//color: 'rgba(0, 0, 0, 0.75)',
									//color: 'black',
									//textShadow: 'none'
								}
								//format: '<b>{point.name}</b>: {point.percentage:.1f} %',

							},

							showInLegend: true,


							startAngle: -90,
							endAngle: 90,
							center: ['50%', '90%']
						},

					},

				},


			};

			return nutritionFacts;
		};

		$scope.isDailyDetailCollapsed = false;
		$scope.isWeeklyReportCollapsed = true;

		$scope.toImperialLength  = function(lengthValue) {
			var inches = Math.round(lengthValue/2.54);

			var feet = Math.floor(inches/12);
			inches = inches % 12;

			return feet + '\'' + inches + '"';



		};



		$scope.resetDate = function() {

			if($scope.dt7) {
				//console.log('start to reset data: day:' + JSON.stringify($scope.dt7));

				var t = '<div class="modal-header">'+
					'<h4>LOADING...</h4>' +
						//'<img src="/modules/users/img/loading.gif" style="width:128px;height:128px;">' +
					'</div>';

				var modalInstance = $modal.open({
					animation: true,
					template:  t,
					//templateUrl: 'myModalContent.html',
					//controller: 'retrieveDataController',
				});

				modalInstance.result.then(function (result) {
					$scope.initialized = result.isInitialized;
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});




				$scope.dt6 = new Date($scope.dt7);
				$scope.dt6.setDate($scope.dt7.getDate() -1);

				$scope.dt5 = new Date($scope.dt6);
				$scope.dt5.setDate($scope.dt6.getDate() -1);

				$scope.dt4 = new Date($scope.dt5);
				$scope.dt4.setDate($scope.dt5.getDate() -1);

				$scope.dt3 = new Date($scope.dt4);
				$scope.dt3.setDate($scope.dt4.getDate() -1);

				$scope.dt2 = new Date($scope.dt3);
				$scope.dt2.setDate($scope.dt3.getDate() -1);

				$scope.dt1 = new Date($scope.dt2);
				$scope.dt1.setDate($scope.dt2.getDate() -1);


				var dietitian = $scope.dietitian;
				var url = '/dietitians/' + dietitian.userID;

				var promise7 = $http.get(url, {
					params: {
						dietitianId: dietitian.userID,
						userId: $scope.targetUserId,
						date: $scope.dt7
					}
				});
				promise7.success(function (res) {
					$scope.day7 = res;
				});

				var promise6 =  $http.get(url, {
					params: {
						dietitianId: dietitian.userID,
						userId: $scope.targetUserId,
						date: $scope.dt6
					}
				});
				promise6.success(function (res) {
					$scope.day6 = res;
				});

				var promise5 =  $http.get(url, {
					params: {
						dietitianId: dietitian.userID,
						userId: $scope.targetUserId,
						date: $scope.dt5
					}
				});
				promise5.success(function (res) {
					$scope.day5 = res;
				});

				var promise4 =  $http.get(url, {
					params: {
						dietitianId: dietitian.userID,
						userId: $scope.targetUserId,
						date: $scope.dt4
					}
				});
				promise4.success(function (res) {
					$scope.day4 = res;
				});

				var promise3 =  $http.get(url, {
					params: {
						dietitianId: dietitian.userID,
						userId: $scope.targetUserId,
						date: $scope.dt3
					}
				});
				promise3.success(function (res) {
					$scope.day3 = res;
				});

				var promise2 =  $http.get(url, {
					params: {
						dietitianId: dietitian.userID,
						userId: $scope.targetUserId,
						date: $scope.dt2
					}
				});
				promise2.success(function (res) {
					$scope.day2 = res;
				});

				var promise1 =  $http.get(url, {
					params: {
						dietitianId: dietitian.userID,
						userId: $scope.targetUserId,
						date: $scope.dt1
					}
				});
				promise1.success(function (res) {
					$scope.day1 = res;
				});

				var lastStep = $q.all([promise7, promise6,promise5,promise4,promise3,promise2,promise1]);
				lastStep.then(function() {
					console.log('receive all records start to update local data');
					modalInstance.close({ isInitialized: true});

					$scope.updateDataforWeb();
					$scope.updateChartData2();
				}, function(error) {
					console.log('e:' + error);
				});


				//$scope.day7 = Dietitians.get({
				//	dietitianId: dietitian.userID,
				//	userId: $scope.targetUserId,
				//	date: $scope.dt7
				//},function(){
				//	$scope.day6 = Dietitians.get({
				//		dietitianId: dietitian.userID,
				//		userId: $scope.targetUserId,
				//		date: $scope.dt6
				//	},function(){
				//		$scope.day5 = Dietitians.get({
				//			dietitianId: dietitian.userID,
				//			userId: $scope.targetUserId,
				//			date: $scope.dt5
				//		},function(){
				//			$scope.day4 = Dietitians.get({
				//				dietitianId: dietitian.userID,
				//				userId: $scope.targetUserId,
				//				date: $scope.dt4
				//			},function(){
				//				$scope.day3 = Dietitians.get({
				//					dietitianId: dietitian.userID,
				//					userId: $scope.targetUserId,
				//					date: $scope.dt3
				//				},function(){
				//					$scope.day2 = Dietitians.get({
				//						dietitianId: dietitian.userID,
				//						userId: $scope.targetUserId,
				//						date: $scope.dt2
				//					},function(){
				//						$scope.day1 = Dietitians.get({
				//							dietitianId: dietitian.userID,
				//							userId: $scope.targetUserId,
				//							date: $scope.dt1
				//						},function(){
				//							modalInstance.close({ isInitialized: true});
				//
				//							$scope.updateDataforWeb();
				//							$scope.updateChartData2();
				//
				//
				//						});
				//					});
				//				});
				//			});
				//		});
				//	});
				//});
			}


		};

		$scope.checkACL = function (callback) {

			if($scope.acl.logbook && $scope.acl.logbook === 7) {
				var t = '<div class="modal-header">'+
					'<h4>Please enter the valid access code</h4>' +
						//'<img src="/modules/users/img/loading.gif" style="width:128px;height:128px;">' +
					'</div>';

				var modalInstance = $modal.open({
					animation: true,
					template:  t,
					windowClass: 'center-modal'
					//templateUrl: 'myModalContent.html',
					//controller: 'retrieveDataController',
				});

				setTimeout(function(){
					//alert("Hello");
					modalInstance.close({ isInitialized: true});
				}, 1000);




			} else {
				callback();
			}

		};

		$scope.prePeriod = function () {

			$scope.checkACL(function() {
				$scope.dt7.setDate($scope.dt7.getDate() - 7);
				$scope.resetDate();
			});

		};

		$scope.nextPeriod = function() {
			$scope.checkACL(function() {
				$scope.dt7.setDate($scope.dt7.getDate() + 7);
				$scope.resetDate();
			});
		};


		$scope.sliderUpdate=function(){
			//slider
			$scope.slides=[];
			if($scope.hasBGData() ){
				$scope.slides.push({ config:  $scope.weeklyBGChart1, active:false},{config: $scope.weeklyBGChart2, active:false});
			}
			if($scope.hasExerciseData() ){

				$scope.slides.push({ config:  $scope.weeklyStepChart, active:false},{config: $scope.weeklyExerciseChart, active:false});
			}
			if($scope.hasMealData() ){


				$scope.slides.push({ config:  $scope.mealScoreChart, active:false},{config: $scope.weeklyNutrionChart, active:false});
			}
			if($scope.slides.length>0){
				$scope.curslide=0;
				$scope.slides[0].active=true;

			}
			//console.log($scope.slides);

		 	return ;
		};


		$scope.slides_left=function(){
			//slider
			var curslide=$scope.curslide;
			$scope.slides[curslide].active=false;
			curslide--;
			if(curslide<0){
				curslide=$scope.slides.length-1;
			}
			else{
				curslide=curslide%$scope.slides.length;
			}
			$scope.slides[curslide].active=true;
			$scope.curslide=curslide;
		 	return ;
		};
		$scope.slides_right=function(){
			//slider
			var curslide=$scope.curslide;
			$scope.slides[curslide].active=false;
			curslide++;
			curslide=curslide%$scope.slides.length;
			$scope.slides[curslide].active=true;
			$scope.curslide=curslide;
		 	return ;
		};

	}
]);

angular.module('dietitians').directive('selectOnClick', ['$window', '$timeout', '$parse', function ($window, $timeout, $parse) {
	return {
		restrict: 'A',
		scope: true,
		link: function (scope, element, attrs) {
			var model = $parse(attrs.selectOnClick);
			scope.$watch(model, function(value) {
				console.log('value=',value);
				if(value === true) {
					$timeout(function() {
						element[0].focus();
						// if (!$window.getSelection().toString()) {
						// 		// Required for mobile Safari
						// 		element[0].setSelectionRange(0, element[0].value.length)
						// 		element[0].focus();
						// }
					});
				}
			});

			element.on('focus', function () {
				if (!$window.getSelection().toString()) {
					// Required for mobile Safari
					this.setSelectionRange(0, this.value.length);
				}
			});

			// element.bind('blur', function() {
			//  console.log('blur');
			//  scope.$apply(model.assign(scope, false));
			// });
		}
	};
}]);

angular.module('dietitians').controller('ModalInstanceCtrl', function ($scope, $modalInstance) {

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});

angular.module('dietitians').controller('CopyURLCtrl', function ($scope, $modalInstance, $timeout, content) {
	$scope.content = content;

	$modalInstance.result.then(function(){
		$scope.shouldBeOpen = false;
	});

	$modalInstance.opened.then(function(){
		$scope.shouldBeOpen = true;

		//////TODO:auto copy to clipboard
		// $timeout(function() {
		// 	var input = $('#copyurl');
		// 	input.on('blur',function(){
		// 		if($scope.shouldBeOpen){
		// 			document.getElementById('copyurl').focus();
		// 		}
		// 	});
		// 	// alert();
		// 	// document.getElementById('copyurl').focus();
		// });
		////////
	});

	$scope.cancel = function () {
		$modalInstance.close('cancel');
	};
});

angular.module('dietitians').controller('UserPrivacyModalInstanceCtrl', function ($scope, $modalInstance) {
	$scope.submitPrivacyForm = function() {
		//alert(myForm.$dirty);
		$scope.updateUserProfile();
		$modalInstance.dismiss('cancel');
	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});


angular.module('dietitians').controller('MealDetailModalCtrl', function ($scope, $modalInstance, meal, title) {
	$scope.meal = meal;
	$scope.title = title;
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	if(meal && meal.mealEnterType ) {
		if(meal.mealEnterType === 'Search') {
			$scope.typeDescription = 'Logged by searching food database.  Thus, the nutritional values below were accurate.';
		} else {
			$scope.typeDescription = 'Logged by Auto-Estimate.  Thus, the nutritional values below were approximate.';
		}
	} else {
		$scope.typeDescription = 'unknown';
	}



});

angular.module('dietitians').controller('MyTipsModalCtrl', function ($scope, $modalInstance, tips) {
	$scope.tips = tips;
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});

angular.module('dietitians').controller('MyQuestionsModalCtrl', function ($scope, $modalInstance, questions) {
	$scope.questions = questions;
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});



