/**
 *
 * Created by Canon on 2016-02-16.
 */
'use strict';

// Brand controller
angular.module('brand').controller('BrandController', ['$scope', '$stateParams', '$location', 'Authentication', 'Brand', 'Topics', 'Profiles', 'Upload',
	function($scope, $stateParams, $location, Authentication, Brand , Topics, Profiles, Upload) {
		$scope.authentication = Authentication;

		$scope.$watch('photos', function () {
			var photos = $scope.photos;
			if(photos){
				$scope.upload(photos);
			}

		});

		$scope.selectmedia = function(media){
			$scope.premedia = media;
		};

		$scope.upload = function (files) {
			if (files && files.length) {
				var medias = [];
				files.forEach(function(element, index, array){
					var file = element;
					Upload.upload({
							url: '/fileupload',
							fields: {'user_id': Authentication.user.userID, 'type': 3},
							file: file
						})
						.progress(function (evt) {
							var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
						}).success(function (data, status, headers, config) {
						medias.push(data);
						$scope.medias = medias;
					});
				});
			}
		};

		$scope.createinit = function(){
			// console.log('init');
		};

		// Create new Brand
		$scope.create = function() {
			// Create new Brand object
			var brand = new Brand({
				name: this.brandname,
				accessCode: this.accesscode,
				homePage: this.link,
				// link: this.link,
				logo: $scope.medias
			});

			// Redirect after save
			brand.$save(function(response) {
				$location.path('brand/' + response.accessCode);
				// Clear form fields
				$scope.accesscode = '';
				$scope.content = '';
				$scope.title = '';
				$scope.link = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Brand
		$scope.remove = function(brand) {
			if (brand) {
				brand.$remove();

				for (var i in $scope.brandList) {
					if ($scope.brandList[i] === brand) {
						$scope.brandList.splice(i, 1);
					}
				}
			} else {
				$scope.brand.$remove(function() {
					$location.path('brand');
				});
			}
		};

		$scope.updateinit = function(){
			$scope.brand = Brand.get({
				brandId: $stateParams.brandId
			},function(brand){
				$scope.medias = brand.medias;
			});

		};

		// Update existing Brand
		$scope.update = function() {
			var brand = $scope.brand;
			brand.medias = $scope.medias;
			brand.$update(function() {
				$location.path('brand/' + brand.accessCode);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//// Find a list of Brands
		$scope.find = function() {
			$scope.brandList = Brand.query();
		};

		// Find existing Brand
		$scope.findOne = function(brand) {
			$scope.brand = Brand.get({
				brandId: $stateParams.brandId
			},function(brand){
				$scope.medias = brand.medias;
			});

		};

	}
]);
