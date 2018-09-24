'use strict';

// Configuring the Questions module
angular.module('questions').run(['Menus',
	function(Menus) {

		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Questions', 'dietitianquestions', 'dropdown', '/questions(/create)?', true, ['dietitian'], 1);
		Menus.addSubMenuItem('topbar', 'dietitianquestions', 'List Questions', 'questions', true, ['dietitian']);
		Menus.addSubMenuItem('topbar', 'dietitianquestions', 'List Answers', 'answers', true, ['dietitian']);
		// Menus.addSubMenuItem('topbar', 'questions', 'New Question', 'questions/create', true, ['dietitian']);

		// Menus.addMenuItem('topbar', 'Questions', 'userquestions', 'dropdown', '/questions(/create)?', true, ['user'], 1);
		// Menus.addSubMenuItem('topbar', 'questions', 'List Questions', 'questions', true, ['user']);
		// Menus.addSubMenuItem('topbar', 'userquestions', 'New Question', 'questions/create', true, ['user']);

	}
]);
