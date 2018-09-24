'use strict';

// Configuring the Templates module
angular.module('topicTemplates').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Templates', 'topicTemplates', 'dropdown', '/templates(/create)?', true, ['dietitian'],2);
		Menus.addSubMenuItem('topbar', 'topicTemplates', 'List Templates', 'templates', true, ['dietitian']);
		Menus.addSubMenuItem('topbar', 'topicTemplates', 'New Template', 'templates/create', true, ['dietitian']);
	}
]);
