'use strict';

// Configuring the Meals module
angular.module('meals').run(['Menus',
	function(Menus) {

		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Meals', 'dietitianmeals', 'dropdown', '/meals(/create)?', true, ['dietitian'], 1);
		//Menus.addSubMenuItem('topbar', 'dietitianmeals', 'List Meals', 'meals', true, ['dietitian']);
		//Menus.addSubMenuItem('topbar', 'meals', 'New Meal', 'meals/create', true, ['dietitian']);

		//Menus.addMenuItem('topbar', 'Meals', 'usermeals', 'dropdown', '/meals(/create)?', true, ['user'], 1);
		//Menus.addSubMenuItem('topbar', 'meals', 'List Meals', 'meals', true, ['user']);
		//Menus.addSubMenuItem('topbar', 'usermeals', 'New Meal', 'meals/create', true, ['user']);

	}
]);
