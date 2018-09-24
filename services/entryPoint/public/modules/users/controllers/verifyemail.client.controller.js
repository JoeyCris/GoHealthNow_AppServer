'use strict';

angular.module('users').controller('VerifyEmailController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;


		// Submit forgotten password account id
		$scope.sendVerifyEmail = function() {
			$scope.success = $scope.error = null;
			alert(JSON.stringify(Authentication.user));
			var user = Authentication.user;
			user.userName = user.email;
			$http.post('/auth/verifyemail', user).success(function(response) {
				// Show user success message and clear form
				//$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};
	}
]);
