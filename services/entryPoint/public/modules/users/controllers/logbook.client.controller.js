/**
 * Created by nodejs on 23/09/15.
 */
'use strict';


angular.module('users').controller('LogbookCtrl', function($scope) {
		$scope.slides = [
			'Daily BG Chart',
			'Daily BG Chart',
			'Sleep Time',
			'Meal Score'
		];

		$scope.labels = ['Before Breakfast', 'After Breakfast', 'Before Lunch', 'After Lunch','Before Dinner', 'After Dinner', 'Bedtime'];
		$scope.series = ['Aug 25','Aug 26','Aug 27','Aug 28','Aug 29','Aug 30','Aug 31'];

		$scope.chartOptions = {
			bezierCurve:true,
			datasetFill : false
		};

		$scope.data = [
			[5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10],
			[5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10],
			[5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10],
			[5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10],
			[5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10],
			[5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10],
			[5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10, 7+ Math.ceil(Math.random()*3/0.1)/10, 5.5+ Math.ceil(Math.random()*3/0.1)/10]
		];

		$scope.dailyLabels = ['Carb', 'Fat', 'Pro'];
		$scope.dailyData = [266.1, 115.6, 55.4];

		$scope.dynamicPopover = {
			content: 'Hello, World!',
			templateUrl: 'myPopoverTemplate.html',
			title: 'Title'
		};

		/*
		 Chart.types.Line.extend({
		 name: 'LineOverlay',
		 draw: function(ease) {
		 Chart.types.Line.prototype.draw.apply(this);
		 ctx.beginPath();
		 ctx.lineWidth = 2;
		 ctx.strokeStyle = 'rgba(255,0,0,1.0';
		 ctx.moveTo(35, this.scale.calculateY(7));
		 ctx.lineTo(this.scale.calculateX(this.datasets[0].bar))
		 }
		 });*/




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
