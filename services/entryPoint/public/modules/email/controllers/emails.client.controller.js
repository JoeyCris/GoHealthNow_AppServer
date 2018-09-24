'use strict';

// Email controller
angular.module('email').controller('EmailController', ['$scope', '$stateParams', '$location', 'Authentication', 'Email', 'Topics', 'Profiles', 'EmailStatuses', 'Upload', 'AccessCodes', 'Receivers','$sce' ,
	function($scope, $stateParams, $location, Authentication, Email , Topics, Profiles, EmailStatuses, Upload, AccessCodes, Receivers, $sce) {
		$scope.authentication = Authentication;
		$scope.statuses = EmailStatuses.query();
		$scope.accesscodes = AccessCodes.query();
		$scope.checkResults = [];
		$scope.selectedStatus = 'tip';
		// var receivers = Receivers.query(function(){
		// 	receivers.forEach(function(element, index, array){
		// 		element.ticked = false;
		// 	});
		// 	$scope.checkreceivers = receivers;
		// });

		$scope.isSet = function(selectedStatus){
			if($scope.selectedStatus === selectedStatus){
				return true;
			}else{
				return false;
			}
		};

		$scope.setStatus = function(selectedStatus){
			$scope.selectedStatus = selectedStatus;
		};

			// Editor options.
	  $scope.options = {
	    language: 'en',
	    allowedContent: true,
	    entities: false
	  };

	  // Called when the editor is completely ready.
	  $scope.onReady = function () {
	    // ...
	  };

		$scope.createinit = function(){
			// var checkreceivers = [];
			// var receivers = new AccessCodes({accesscode:1234});
			if(!$scope.checkreceivers){
				var receivers = Receivers.query(function(){
					receivers.forEach(function(element, index, array){
						element.ticked = false;
					});
					$scope.checkreceivers = receivers;
				});
			}


			if($stateParams.statusId){
				var statusId = $stateParams.statusId;

				//alert(typeId);
				$scope.status = statusId;
			}
		};

		// Create new Email
		$scope.create = function() {
			// Create new Email object
			// console.log($scope.checkResults);
			var receivers = [];
			$scope.checkResults.forEach(function(element, index, array){
				// console.log(element._id);
				receivers.push(element._id);
			});

			// console.log(JSON.stringify(receivers));
			// return;
			var email = new Email({
				users: receivers,
				title: $scope.title,
				content: $scope.content,
				status: 'new',
			});

			// Redirect after save
			email.$save(function(response) {
				$location.path('email/' + response._id);

				// Clear form fields
				$scope.status = '';
				$scope.content = '';
				$scope.title = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			// return;
		};

		// Remove existing Email
		$scope.remove = function(email) {
			if (email) {
				email.$remove();

				for (var i in $scope.emailList) {
					if ($scope.emailList[i] === email) {
						$scope.emailList.splice(i, 1);
					}
				}
			} else {
				$scope.email.$remove(function() {
					$location.path('email');
				});
			}
		};

		$scope.updateinit = function(){
			// var checkreceivers = [];
			// var receivers = new AccessCodes({accesscode:1234});
			// console.log($scope.checkreceivers);

			$scope.email = Email.get({
				emailId: $stateParams.emailId
			},function(email){
				// $scope.content = email.content;
				// $scope.title = email.title;
				var users = [];
				email.users.forEach(function(element, index, array){
					users.push(element._id);
				});

				if(!$scope.checkreceivers){
					var receivers = Receivers.query(function(){

						receivers.forEach(function(element, index, array){
							if(users.indexOf(element._id) === -1){
								// console.log(email.users,element._id)
								element.ticked = false;
							}else{
								element.ticked = true;
							}
						});
						$scope.checkreceivers = receivers;
					});
				}else{
					$scope.checkreceivers.forEach(function(element, index, array){
						if(users.indexOf(element._id) === -1){
							// console.log(email.users,element._id)
							element.ticked = false;
						}else{
							element.ticked = true;
						}

					});
				}
			});
		};

		// Update existing Email
		$scope.update = function() {
			var receivers = [];
			$scope.checkResults.forEach(function(element, index, array){
				// console.log(element._id);
				receivers.push(element._id);
			});
			var email = $scope.email;
			email.users = receivers;
			email.status = 'new';

			email.$update(function() {
				$location.path('email/' + email._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Email
		$scope.find = function() {
			var statuses = EmailStatuses.query(function(){
				var emailStatuses = [];
				statuses.forEach(function(element, index, array){
					var emails = EmailStatuses.getEmailByStatus({statusId:index},function(){
						emailStatuses.push({status:element,emailList:emails});
						$scope.emailStatuses = emailStatuses;
						// console.log(JSON.stringify($scope.emailStatuses));
					});

				});

				$scope.type = 'info';
				// console.log(JSON.stringify($scope.emailStatuses));
			});
			$scope.emailList = Email.query();
		};

		// Find existing Email
		$scope.findOne = function(email) {
			$scope.email = Email.get({
				emailId: $stateParams.emailId
			},function(email){
				$scope.content = $sce.trustAsHtml(email.content);
				$scope.title = email.title;
				$scope.receivers = email.users;


			});

		};

	}
]);
