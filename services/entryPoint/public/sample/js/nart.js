/**
 * Created by robertwang on 2016-09-17.
 */

angular.module('gg.nart', ['ngAnimate', 'ui.bootstrap', 'ngFileUpload']);
angular.module('gg.nart').controller('NeuralArtDemoCtrl', ['$scope', 'Upload', '$timeout', function ($scope, Upload, $timeout) {



	$scope.menuItems = ['Home', 'Contact', 'About', 'Other'];
	$scope.activeMenu = $scope.menuItems[0];

	$scope.setActive = function(menuItem) {
		$scope.activeMenu = menuItem
	};

	$scope.setActiveImage = function(index) {
		$scope.activeImage = index;
	};

	$scope.selectmedia = function(media){
		$scope.premedia = media;
	};

	$scope.uploadFiles = function(file, errFiles) {
		$scope.f = file;
		$scope.errFile = errFiles && errFiles[0];
		if (file) {
			file.upload = Upload.upload({
				//url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
				//data: {file: file}

				url: '/fileupload',
				fields: {'user_id': '568146608c4eac52bd21c143', 'type': 2},
				file: file
			});

			file.upload.then(function (response) {
				$timeout(function () {
					file.result = response.data;
					$scope.contentPhoto = '../../' + file.result.uri;
					console.log(JSON.stringify(file.result));
				});
			}, function (response) {
				if (response.status > 0)
					$scope.errorMsg = response.status + ': ' + response.data;
			}, function (evt) {
				file.progress = Math.min(100, parseInt(100.0 *
				evt.loaded / evt.total));
			});
		}
	};

	$scope.uploadStyleFile = function(file, errFiles) {
		$scope.f = file;
		$scope.errFile = errFiles && errFiles[0];
		if (file) {
			file.upload = Upload.upload({
				//url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
				//data: {file: file}

				url: '/public/api/v1.0/digits_recognize',
				file: file
			});

			file.upload.then(function (response) {
				$timeout(function () {
					file.result = response.data;
					$scope.stylePhoto = '../../' + file.result.uri;
					console.log(JSON.stringify(file.result));
				});
			}, function (response) {
				console.log(JSON.stringify(response));

				if (response.status > 0)
					$scope.errorMsg = response.status + ': ' + response.data;
			}, function (evt) {
				file.progress = Math.min(100, parseInt(100.0 *
				evt.loaded / evt.total));
			});
		}
	};


	$scope.imageList = [
		{
			url: 'http://placekitten.com/200/200',
			name: 'Kitten 1'
		},
		{
			url: 'http://placekitten.com/201/201',
			name: 'Kitten 2'
		},
		{
			url: 'http://placekitten.com/201/202',
			name: 'Kitten 3'
		},
		{
			url: 'http://placekitten.com/201/203',
			name: 'Kitten 4'
		},
		{
			url: 'http://placekitten.com/200/200',
			name: 'Kitten 11'
		},
		{
			url: 'http://placekitten.com/201/201',
			name: 'Kitten 12'
		},
		{
			url: 'http://placekitten.com/201/202',
			name: 'Kitten 13'
		},
		{
			url: 'http://placekitten.com/201/203',
			name: 'Kitten 14'
		}
	];
}]);
