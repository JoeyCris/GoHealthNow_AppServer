'use strict';

// Configuring the Knowledge module
angular.module('knowledge').run(['Menus',
	function(Menus) {
		// Set top bar menu items '/admin', true, ['admin'], 1
		Menus.addMenuItem('topbar', 'Knowledge', 'knowledge', 'dropdown', '/knowledge(/create)?', true, ['admin'], 2);
		Menus.addSubMenuItem('topbar', 'knowledge', 'List Knowledge', 'knowledge', true, ['admin']);
		Menus.addSubMenuItem('topbar', 'knowledge', 'New Knowledge', 'knowledge/create', true, ['admin']);

	}
]);
