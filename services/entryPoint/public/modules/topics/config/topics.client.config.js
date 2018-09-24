'use strict';

// Configuring the Topics module
angular.module('topics').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Personalized Tips', 'Tips', 'dropdown', '/reminders(/create)?', true, ['dietitian']);
		Menus.addSubMenuItem('topbar', 'Tips', 'List Personalized Tips', 'reminders', true, ['dietitian']);
		// Menus.addSubMenuItem('topbar', 'Tips', 'List Answers', 'answers', true, ['dietitian']);
		Menus.addSubMenuItem('topbar', 'Tips', 'Create New Tip', 'reminders/create', true, ['dietitian']);

		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Topics', 'topics', 'dropdown', '/topics(/create)?', true, ['admin'], 1);
		Menus.addSubMenuItem('topbar', 'topics', 'List Topics', 'topics', true, ['admin']);
		Menus.addSubMenuItem('topbar', 'topics', 'New Topic', 'topics/create', true, ['admin']);

	}
]);
