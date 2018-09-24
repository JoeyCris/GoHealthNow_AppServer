'use strict';

// Configuring the Articles module
angular.module('dietitians').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		                 //menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position
		Menus.addMenuItem('topbar', 'My Clients', 'dietitian', 'item', '/dietitian', true, ['dietitian'], 0);
		//Menus.addSubMenuItem('topbar', 'dietitians', 'List Dietitians', 'dietitians');
		//Menus.addSubMenuItem('topbar', 'dietitians', 'New Dietitian', 'dietitians/create');
	}
]);
