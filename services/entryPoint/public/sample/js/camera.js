var app = angular.module('fileUpload', ['ngFileUpload','ui.bootstrap']);

app.controller('MyCtrl', ['$scope', 'Upload', '$timeout', '$modal','$http',function ($scope, Upload, $timeout, $modal,$http) {
	$scope.uploadPic = function(file) {

		var t = '<div class="modal-header">'+
			'<h4>Processing...</h4>' +
				//'<img src="/modules/users/img/loading.gif" style="width:128px;height:128px;">' +
			'</div>';

		var modalInstance = $modal.open({
			animation: true,
			template:  t,
			//templateUrl: 'myModalContent.html',
			//controller: 'retrieveDataController',
		});

		modalInstance.result.then(function (result) {
			$scope.initialized = result.isInitialized;
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});

		file.upload = Upload.upload({
			url: '/public/api/v1.0/digits_recognize',
			file: file
			//url: '/fileupload',
			//fields: {'user_id': '568146608c4eac52bd21c143', 'type': 2},
			//file: file
		});

		file.upload.then(function (response) {

			$timeout(function () {
				file.result = response.data;
				$scope.out_img = '../' + file.result.uri;
				modalInstance.close({ isInitialized: true});

				//console.log(JSON.stringify(file.result));
			});
		}, function (response) {
			//console.log(JSON.stringify(response));
			modalInstance.close({ isInitialized: true});
			if (response.status > 0)
				$scope.errorMsg = response.status + ': ' + response.data;

		}, function (evt) {
			// Math.min is to fix IE which reports 200% sometimes
			file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
		});
	};

	$scope.isCollapsed = true;
	$scope.showAllImages = false;

	$http.get('/public/api/v1.0/digits_recognize/list')
		.then(function(response) {
			$scope.imageList = response.data;
		});

	//$scope.imageList = [
	//];
}]);
