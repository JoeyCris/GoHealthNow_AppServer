'use strict';

// Configuring the Articles module
angular.module('food').run(['Menus',
	function(Menus) {
// 		// Set top bar menu items
// 		Menus.addMenuItem('topbar', 'Users', 'admins', 'dropdown', '/admin', true, ['admin'], 1);
// 		Menus.addSubMenuItem('topbar', 'admins', 'List All Users', 'admin/listAllUsers');
// 		//Menus.addSubMenuItem('topbar', 'admins', 'List All Users of Org', 'admin/listOrgUsers');
// //		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
//
// 		//Menus.addMenuItem('topbar', 'Overview', 'admin/OrgOverview', 'items', '', false, ['orgAdmin'], 1);
// 		Menus.addMenuItem('topbar', 'Details', 'admin/listOrgUsers', 'items', '', false, ['orgAdmin'], 2);

		//Menus.addSubMenuItem('topbar', 'admins', 'Edit Access Code', 'admin/editCodes');
	}
]);
