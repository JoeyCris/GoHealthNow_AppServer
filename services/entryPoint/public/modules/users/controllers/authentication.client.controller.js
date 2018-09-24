'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		//console.log('redirect to /')
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				//$scope.error = response.message;
				$scope.error = 'Invalid ....  Or you have NOT created a GlucoGuide account on your smartphone yet. To do so, search "glucoguide" in the App store, download and install it.  Then launch it, and create an account with your email and a password on your smartphone.';
			});
		};

		$scope.demoSignin = function(role) {
			var url = '/auth/demosignin';
			if(role && role === 'expert') {
				url += '/expert';
			}

			$http.post(url).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.demoExpertSignin = function() {
			$http.post('/auth/demosignin/expert').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.myInterval = 5000;
	  $scope.noWrapSlides = false;
	  var slides = $scope.slides = [];
	  $scope.addSlide = function(url,content) {
	    var newWidth = 600 + slides.length + 1;
	    // slides.push({
	    //   image: '//placekitten.com/' + newWidth + '/300',
	    //   // text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
	    //     // ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
	    // });
			slides.push({image: url, text: content});
	  };
		$scope.addSlide('/modules/users/img/login/1.jpg','1.jpg');
		// $scope.addSlide('/modules/users/img/login/2.png','2.jpg');
		// $scope.addSlide('/modules/users/img/login/3.png','3.jpg');
		// $scope.addSlide('/modules/users/img/login/4.png','4.jpg');
		// $scope.addSlide('/modules/users/img/login/5.png','5.jpg');
	  // for (var i=0; i<4; i++) {
	  //   $scope.addSlide();
	  // }
	}
]);
