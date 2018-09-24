'use strict';

// Admins controller
angular.module('food').controller('FoodController', ['$scope', '$http', '$filter', '$stateParams', 'Food','$location',
	'Authentication', 'filterFilter',
	function($scope, $http, $filter,$stateParams, Food, $location, Authentication, filterFilter) {
		$scope.authentication = Authentication;

		$scope.searchContent = '';
		$scope.foodList = {};
		$scope._selected = undefined;
		$scope.searchFood = function() {
			console.log('food Name is :' + $scope.searchContent);
			// $scope.foodList.$cancelRequest();
			$scope.foodList = Food.query({
				actionType:'search',
				foodName: $scope.searchContent
			});
		};
		// $scope.ngModelOptionsSelected = function(value) {
		// 	if (arguments.length) {
		// 		$scope.searchContent = value;
		// 		$scope.searchFood();
		// 	} else {
		// 		return $scope.searchContent;
		// 	}
		// };

		$scope.autoComplete = function(partialName) {
			return $http.get('/food/search/', {
				params: {
					actionType: 'typing',
					foodName: partialName
				}
			}).then(function(response){
				// console.log(response);
				// return response.data.map(function(item){
				// 	return item;
				// });
				// console.log(response);
				$scope.foodList = response.data;
				// $scope.foodList = [];
				// response.data.forEach(function (food) {
				// 	$scope.foodList.push({name:food});
				// });
				// console.log($scope.foodList);
			});
			// $scope.typing = Food.query({
			// 	actionType: 'typing',
			// 	foodName: partialName
			// });
			// console.log($scope.typing);
			// return $scope.typing.map(function(item){
			// 	console.log(item);
			// 	return item;
			// });
			// 	.then(function (response) {
			// 	console.log(response);
			// 	return response.data.results.map(function(item){
			// 		return item.formatted_address;
			// 	});
			// });
			// console.log($scope.typing);
			// // return $scope.typing;
			// return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
			// 	params: {
			// 		address: val,
			// 		sensor: false
			// 	}
			// }).then(function(response){
			// 	return response.data.results.map(function(item){
			// 		return item.formatted_address;
			// 	});
			// });

		};


		$scope.$watch('searchContent', function (newVal, oldVal) {
			if (newVal && newVal !== oldVal) {
				// console.log('new:' + newVal + ', old: ' + oldVal);
				// $scope.searchFood();
				$scope.autoComplete($scope.searchContent);
			}
			if (!newVal) {
				$scope.foodList = {};
			}

		});




	}
]);
