/**
 *
 * Created by Canon on 2016-02-16.
 */
'use strict';

// Configuring the Brand module
angular.module('brand').run(['Menus',
	function(Menus) {
		console.log('in Menu');
		// Set top bar menu items '/admin', true, ['admin'], 1
		Menus.addMenuItem('topbar', 'Brand', 'brand', 'dropdown', '/brand(/create)?', true, ['admin'], 1);
		Menus.addSubMenuItem('topbar', 'brand', 'List Brands', 'brand', true, ['admin']);
		Menus.addSubMenuItem('topbar', 'brand', 'New Brand', 'brand/create', true, ['admin']);

	}
]);
