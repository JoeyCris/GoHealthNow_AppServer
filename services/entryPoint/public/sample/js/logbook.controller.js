/**
 * Created by nodejs on 11/09/15.
 */
angular.module('gg.demo.logbook', ['ngAnimate', 'ui.bootstrap','angular-flexslider']);
angular.module('gg.demo.logbook').controller('LogbookCtrl', function ($scope) {

	$scope.recordsPeriod = 'd7';
	$scope.today = function() {
		$scope.dt = new Date();
	};
	$scope.today();

	$scope.tomorrow = function () {
		$scope.dt.setDate($scope.dt.getDate() + 1);
	};

	$scope.yesterday = function () {
		$scope.dt.setDate($scope.dt.getDate() - 1);
	};

	$scope.slides = [
		'http://flexslider.woothemes.com/images/kitchen_adventurer_cheesecake_brownie.jpg',
		'http://flexslider.woothemes.com/images/kitchen_adventurer_lemon.jpg',
		'http://flexslider.woothemes.com/images/kitchen_adventurer_donut.jpg',
		'http://flexslider.woothemes.com/images/kitchen_adventurer_caramel.jpg'
	];

	$scope.today = function() {
		$scope.dt = new Date();
	};

	// Disable weekend selection
	$scope.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	$scope.toggleMin = function() {
		$scope.minDate = $scope.minDate ? null : new Date();
	};
	$scope.toggleMin();

	$scope.open = function($event) {
		$scope.status.opened = true;
	};

	$scope.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[0];

	$scope.status = {
		opened: false
	};

	var tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	var afterTomorrow = new Date();
	afterTomorrow.setDate(tomorrow.getDate() + 2);
	$scope.events =
		[
			{
				date: tomorrow,
				status: 'full'
			},
			{
				date: afterTomorrow,
				status: 'partially'
			}
		];

	$scope.getDayClass = function(date, mode) {
		if (mode === 'day') {
			var dayToCheck = new Date(date).setHours(0,0,0,0);

			for (var i=0;i<$scope.events.length;i++){
				var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

				if (dayToCheck === currentDay) {
					return $scope.events[i].status;
				}
			}
		}

		return '';
	};
});

angular.module('gg.demo.logbook').controller('BasicSliderCtrl', function($scope) {
		$scope.slides = [
			'http://flexslider.woothemes.com/images/kitchen_adventurer_cheesecake_brownie.jpg',
			'http://flexslider.woothemes.com/images/kitchen_adventurer_lemon.jpg',
			'http://flexslider.woothemes.com/images/kitchen_adventurer_donut.jpg',
			'http://flexslider.woothemes.com/images/kitchen_adventurer_caramel.jpg'
		];
	});
