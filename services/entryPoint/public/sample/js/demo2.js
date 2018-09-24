
angular.module('plunker', ['ui.bootstrap']).controller('Ctrl',['$scope', function($scope){

	$scope.slides = [];
	$scope.slides.push({text: 'cats!', image: 'http://placekitten.com/300/200'});
	$scope.slides.push({text: 'cats!', image: 'http://placekitten.com/301/200'});
	$scope.slides.push({text: 'cats!', image: 'http://placekitten.com/302/200'});

	$scope.setActive = function(idx) {
		$scope.slides[idx].active=true;
	}

}]);/**
 * Created by robertwang on 15-08-24.
 */
