'use strict';

angular.module('users').controller('RecordsController', ['$scope', '$http', '$stateParams','$location', 'Users', 'Authentication', 'UserRecords', 'Admin', 'Menus',
	function($scope, $http, $stateParams, $location, Users, Authentication, UserRecords, Admin, Menus) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!Authentication.user) {
			console.log('user not login.');
			$location.path('/');
		}

		if($scope.user.rightsMask === undefined) {
			console.log('user.rightsMask is undefined');
			$scope.checked = true;
		} else {
			//console.log($scope.user.rightsMask);
			$scope.checked = $scope.user.rightsMask > 700;
		}
		//console.log($scope.checked);
		$scope.getUserProfile = function(targetUserID){
			$scope.targetUser = Admin.get({
				userId: $scope.targetUserId
			});

		};

		$scope.getIdeaCals = function(user) {
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
		};

		$scope.userRecords = [];
		$scope.panel = 'glucose';
		$scope.targetUserId = $stateParams.userID;

		$scope.getUserProfile($scope.targetUserId);

		$scope.selectPanel= function (selectedPanel) {
			$scope.panel = selectedPanel;
		};

		$scope.isSelected = function (panel) {
			return $scope.panel === panel;
		};

		$scope.parseGlucose = function(data){
			data.sort(function(a, b){
				return new Date(a.recordedTime) - new Date(b.recordedTime);
			});
			//$scope.series = ['Fasting', '2-hour after', 'Other'];
			$scope.fastingData = [[]];
			$scope.fastingLabels = [];

			$scope.glucoseData = [[],[],[]];
			$scope.glucoseLabels = [];

			$scope.otherbgData = [[]];
			$scope.otherbgLabels = [];
			data.forEach(function(record){
				var d = new Date(record.recordedTime);
				var dateString = d.getDate() + '/' + (('0' + (d.getMonth() + 1)).slice(-2))+ ' \n	' +
					new Date(record.recordedTime).toLocaleTimeString();

				//$scope.glucoseLabels.push(dateString);
				$scope.glucoseData[0].push(record.level) ;

				if(record.glucoseType === 0) {
					$scope.glucoseLabels.push(dateString + '\nFasting');
					//$scope.glucoseData[0].push(record.level) ;
					//$scope.glucoseData[1].push(null) ;
					//$scope.glucoseData[2].push(null) ;
					//$scope.fastingData[0].push(record.level) ;
					//$scope.fastingLabels.push(dateString);
				} else if (record.glucoseType === 1) {
					$scope.glucoseLabels.push(dateString+'\n2-hour after');
					//$scope.glucoseData[0].push(record.level) ;
					////$scope.glucoseLabels.push(dateString);
					//$scope.glucoseData[0].push(null) ;
					//$scope.glucoseData[1].push(record.level) ;
					//$scope.glucoseData[2].push(null) ;
				} else {
					$scope.glucoseLabels.push(dateString + '\nOther');
					//$scope.glucoseData[0].push(null) ;
					//$scope.glucoseData[1].push(null) ;
					//$scope.glucoseData[2].push(record.level) ;
					//$scope.otherbgData[0].push(record.level) ;
					//$scope.otherbgLabels.push(dateString);
				}
			});
			//console.log($scope.glucoseData);
		};

		$scope.parseA1C = function(data) {
			data.sort(function(a, b){
				return new Date(a.recordedTime) - new Date(b.recordedTime);
			});
			$scope.a1cData = [[]];
			$scope.a1cLabels = [];
			data.forEach(function(record) {
				var d = new Date(record.recordedTime);
				var dateString = d.getDate() + '/' + (('0' + (d.getMonth() + 1)).slice(-2)) + '	' +
					new Date(record.recordedTime).toLocaleTimeString();
				$scope.a1cData[0].push(record.a1CValue);
				$scope.a1cLabels.push(dateString);
			});
		};

		$scope.getUserRecords = function() {

			$scope.userRecords = UserRecords.get({userID: $stateParams.userID}, function(data){
				$scope.parseGlucose(data.glucoseRecords);
				$scope.parseA1C(data.a1cRecords);
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
				Authentication.user = response;
			}, function(response) {
				$scope.error = response.data.message;
			});
		};



		$scope.getLastA1c = function(userID) {
			$http.get('/userRecords/a1c/' + userID, $scope.credentials).success(function (response) {
				$scope.latestA1CValue = response;
			});
		};

		$scope.latestA1CValue = $scope.getLastA1c($scope.targetUserId);

	}


]);
