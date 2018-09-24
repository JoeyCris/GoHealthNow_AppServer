/**
 * Created by Canon on 2016-02-16.
 */
'use strict';

// Setting up route
angular.module('brand').config(['$stateProvider',
	function($stateProvider) {
		// Knowledge state routing
		$stateProvider.
		state('listBrand', {
			url: '/brand',
			templateUrl: 'modules/brand/views/list-brand.client.view.html'
		}).
		state('createBrand', {
			url: '/brand/create',
			templateUrl: 'modules/brand/views/create-brand.client.view.html'
		}).
		// state('createBrandByType', {
		// 	url: '/brand/create/type/:typeId',
		// 	templateUrl: 'modules/brand/views/create-brand.client.view.html'
		// }).
		state('viewBrand', {
			url: '/brand/:brandId',
			templateUrl: 'modules/brand/views/view-brand.client.view.html'
		}).
		state('editBrand', {
			url: '/brand/:brandId/edit',
			templateUrl: 'modules/brand/views/edit-brand.client.view.html'
		});
	}]);
