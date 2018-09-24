'use strict';


angular.module('core').controller('HomeController', ['$scope', '$location','Authentication','Menus',
	function($scope, $location, Authentication, Menus) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		if (!$scope.authentication.user) {
			$location.path('/signin');
			return;
		}

		if ($scope.authentication.user.roles.indexOf('admin') !== -1) {
			$location.path('/statistics/userstatistics');
		} else if($scope.authentication.user.roles.indexOf('user') !== -1) {
			//var url = '/user/records/'+$scope.authentication.user.userID;
			//var url = '/logbook/'+$scope.authentication.user.userID;
			var url = '/logbook/'+$scope.authentication.user.userID;

			//$scope.updateMenu = function() {
			//	//console.log('$scope.updateMenu');
			//	if($scope.targetUserId === undefined || $scope.targetUserId === 'undefined') {
			//		$scope.targetUserId = $scope.authentication.user.userID;
			//	}
			//	for (var i = 0; i < Menus.menus.topbar.items.length; ++i) {
			//		if (Menus.menus.topbar.items[i].title === 'LogBook') {
			//			Menus.menus.topbar.items[i].link = '/';//'logbook/'+$scope.targetUserId;
			//		}
            //
			//		//if (Menus.menus.topbar.items[i].title === 'Records') {
			//		//	Menus.menus.topbar.items[i].link = 'user/records/'+$scope.targetUserId;
			//		//}
			//	}
			//};
            //
			//$scope.updateMenu();
			$location.path(url);

		} else if($scope.authentication.user.roles.indexOf('dietitian') !== -1) {
			$location.path('/dietitian');
		} else if($scope.authentication.user.roles.indexOf('orgAdmin') !== -1) {
			$location.path('/admin/listOrgUsers');
		}
	}
]);
