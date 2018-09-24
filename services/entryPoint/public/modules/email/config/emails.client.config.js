'use strict';

// Configuring the Email module
angular.module('email').run(['Menus',
	function(Menus) {
		// Set top bar menu items '/admin', true, ['admin'], 1
		Menus.addMenuItem('topbar', 'Email', 'email', 'dropdown', '/email(/create)?', true, ['admin'], 2);
		Menus.addSubMenuItem('topbar', 'email', 'List Email', 'email', true, ['admin']);
		Menus.addSubMenuItem('topbar', 'email', 'New Email', 'email/create', true, ['admin']);

	}
]);
