'use strict';

// Configuring the Articles module
angular.module('statistics').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Statistics', 'statistics', 'dropdown', '/statistics', true,  ['admin'], 0);
		Menus.addSubMenuItem('topbar', 'statistics', 'User Statistics', 'statistics/userstatistics');
		Menus.addSubMenuItem('topbar', 'statistics', 'Detail Activities', 'statistics/activities');
	}
]);
