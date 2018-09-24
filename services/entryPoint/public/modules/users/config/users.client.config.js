'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// TODO: Add unauthorized behaviour
								$location.path('home');
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);



// Configuring the Articles module
angular.module('users').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		//alert(Authentication.user.userID);
		//Menus.addMenuItem('topbar', 'LogBook', 'logbook/' , 'item', '/', false, ['user'], 2);
		//Menus.addMenuItem('topbar', 'LogBook', '/', 'item', '', false, ['user'], 2);
		//Menus.addMenuItem('topbar', 'Records', 'records', 'item', '/', false, ['user'], 1);
		//Menus.addMenuItem('topbar', 'Records', 'user/records/' + Authentication.user.userID, 'item', '', false, ['user'], 1);
	}
]);
